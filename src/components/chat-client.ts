// Behaviour of the Ask notes panel (markup and styles live in Chat.astro).
// Flow for a question: embed it (OpenRouter), score it against the prebuilt chunk vectors in the browser,
// stop if nothing is close enough (GATE), else stream an answer from the chat model using only the top sections.
import { CHAT_MODEL, DIMS, EMBED_MODEL, GATE, HISTORY_TURNS, MAX_QUESTION, REVEAL_CPS, SHARED_COOLDOWN_MS, SHARED_DAILY_CAP, TOP } from '../data/chat-config';
import PROMPT from '../prompts/chat-system.md?raw';
import { systemMessage } from '../lib/chat-prompt';
import { renderMarkdown } from '../lib/chat-markdown';

interface Chunk {
  id: string;
  note: string;
  title: string;
  heading: string;
  text: string;
}
interface Hit {
  score: number;
  boosted: number;
  chunk: Chunk;
}
interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

const root = document.querySelector<HTMLElement>('[data-chat]')!;
const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
const base = root.dataset.base!;
const lock = q('[data-chat-lock]');
const main = q('[data-chat-main]');
const scroll = q('[data-chat-scroll]');
const log = q('[data-chat-log]');
const empty = q('[data-chat-empty]');
const input = q<HTMLTextAreaElement>('[data-chat-input]');
const send = q<HTMLButtonElement>('[data-chat-send]');
const clear = q('[data-chat-clear]');
const body = document.body;

const store = {
  get: (k: string, s = false) => {
    try {
      return (s ? sessionStorage : localStorage).getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null, s = false) => {
    try {
      const st = s ? sessionStorage : localStorage;
      if (v === null) st.removeItem(k);
      else st.setItem(k, v);
    } catch {}
  },
};
let apiKey = store.get('chat-key', true) ?? '';
// the password-unlocked shared key, as opposed to a reader's own key
let shared = store.get('chat-shared', true) === '1';

// ---- panel: open, collapse, resize ----
const MIN_W = 320;
const maxW = () => Math.min(720, Math.round(window.innerWidth * 0.6));
const setWidth = (w: number) => {
  const c = Math.max(MIN_W, Math.min(maxW(), w));
  document.documentElement.style.setProperty('--chat-w', `${c}px`);
  return c;
};
const savedW = Number(store.get('chat-w'));
if (savedW) setWidth(savedW);

const setOpen = (open: boolean) => {
  body.classList.toggle('chat-open', open);
  document.querySelectorAll('[data-chat-open]').forEach((b) => b.setAttribute('aria-expanded', String(open)));
  store.set('chat-open', open ? '1' : '0');
  if (open && apiKey) {
    void ensureIndex().catch(() => {});
    input.focus();
  }
};
body.classList.add('chat-ready');
if (store.get('chat-open') === '1' && window.innerWidth >= 1024) body.classList.add('chat-open');

document.querySelectorAll('[data-chat-open]').forEach((b) => b.addEventListener('click', () => setOpen(true)));
q('[data-chat-close]').addEventListener('click', () => setOpen(false));

const handle = q('[data-chat-resize]');
handle.addEventListener('pointerdown', (e) => {
  handle.setPointerCapture(e.pointerId);
  handle.classList.add('drag');
  body.classList.add('chat-dragging');
});
handle.addEventListener('pointermove', (e) => {
  if (handle.hasPointerCapture(e.pointerId)) setWidth(window.innerWidth - e.clientX);
});
const endDrag = (e: PointerEvent) => {
  if (!handle.hasPointerCapture(e.pointerId)) return;
  handle.releasePointerCapture(e.pointerId);
  handle.classList.remove('drag');
  body.classList.remove('chat-dragging');
  store.set('chat-w', String(setWidth(window.innerWidth - e.clientX)));
};
handle.addEventListener('pointerup', endDrag);
handle.addEventListener('pointercancel', endDrag);

// small screens: drag the grabber to resize the sheet, drag it low to close
const grab = q('[data-chat-grab]');
const sheetH = (e: PointerEvent) => window.innerHeight - e.clientY;
grab.addEventListener('pointerdown', (e) => {
  grab.setPointerCapture(e.pointerId);
  body.classList.add('chat-dragging');
});
grab.addEventListener('pointermove', (e) => {
  if (!grab.hasPointerCapture(e.pointerId)) return;
  const h = Math.max(window.innerHeight * 0.3, Math.min(window.innerHeight * 0.92, sheetH(e)));
  document.documentElement.style.setProperty('--chat-h', `${h}px`);
});
const endGrab = (e: PointerEvent) => {
  if (!grab.hasPointerCapture(e.pointerId)) return;
  grab.releasePointerCapture(e.pointerId);
  body.classList.remove('chat-dragging');
  if (sheetH(e) < window.innerHeight * 0.25) {
    setOpen(false);
    document.documentElement.style.removeProperty('--chat-h');
  }
};
grab.addEventListener('pointerup', endGrab);
grab.addEventListener('pointercancel', endGrab);

// ---- connect screen ----
const showChat = (on: boolean) => {
  lock.hidden = on;
  main.hidden = !on;
};
// only a masked form of the key is ever shown; the real key is used for request headers and nothing else
const mask = q('[data-chat-mask]');
const showMask = () => (mask.textContent = !apiKey ? '' : shared ? 'Shared key' : `Key ${apiKey.slice(0, 6)}…${apiKey.slice(-4)}`);
const connect = (key: string, isShared = false) => {
  apiKey = key;
  shared = isShared;
  store.set('chat-key', key, true);
  store.set('chat-shared', isShared ? '1' : null, true);
  showMask();
  showChat(true);
  void ensureIndex().catch(() => {});
  input.focus();
};
const disconnect = () => {
  apiKey = '';
  shared = false;
  showMask();
  store.set('chat-key', null, true);
  store.set('chat-shared', null, true);
  history.length = 0;
  log.textContent = '';
  empty.hidden = false;
  clear.hidden = true;
  showChat(false);
};
q<HTMLFormElement>('[data-key-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const key = ((new FormData(form).get('chat-api-token') as string) ?? '').trim();
  form.reset(); // the key must not linger in the field
  if (key) connect(key);
});

// password: decrypts public/chat/key.json (see scripts/chat-key.mjs) into the shared key, in memory only
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function openSharedKey(password: string) {
  const res = await fetch(root.dataset.keyfile!).catch(() => null);
  if (!res?.ok) throw new Error('Password unlock is not set up on this site. Use your own key above.');
  const sealed = await res.json();
  if (sealed.v !== 1 || !(sealed.iters > 0 && sealed.iters <= 2_000_000)) throw new Error('Password unlock is not set up on this site. Use your own key above.');
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const aes = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(sealed.salt), iterations: sealed.iters, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  try {
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(sealed.iv) }, aes, b64(sealed.ct)));
  } catch {
    throw new Error('Wrong password.');
  }
}
const pwBox = q('[data-pw-form]');
const pwForm = q<HTMLFormElement>('[data-pw-submit]');
const pwToggle = q('[data-pw-toggle]');
const pwNote = q('[data-pw-note]');
const pwNoteDefault = pwNote.textContent;
const pwButton = pwForm.querySelector<HTMLButtonElement>('button')!;
pwToggle.addEventListener('click', () => {
  pwBox.hidden = !pwBox.hidden;
  pwToggle.setAttribute('aria-expanded', String(!pwBox.hidden));
  if (!pwBox.hidden) pwForm.querySelector('input')!.focus();
});
pwForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = (new FormData(pwForm).get('chat-access') as string) ?? '';
  pwForm.reset();
  if (!password) return;
  pwButton.disabled = true;
  pwNote.textContent = 'Unlocking…';
  try {
    connect(await openSharedKey(password), true);
    pwNote.textContent = pwNoteDefault;
  } catch (err) {
    // a short pause after a failure, so guessing from this page is slow
    await new Promise((r) => setTimeout(r, 1000));
    pwNote.textContent = (err as Error).message;
  } finally {
    pwButton.disabled = false;
  }
});
q('[data-chat-forget]').addEventListener('click', disconnect);
showMask();
showChat(!!apiKey);

// ---- where the reader is ----
const ctx = q('[data-chat-ctx]');
const pageTitle = document.querySelector('main h1')?.textContent?.trim();
// a note shows area > section > note, any other page "Reading: <title>"
const section = document.querySelector('main .eyebrow span')?.textContent?.trim();
const areaName = document.querySelector('.tab.active')?.textContent?.trim();
if (pageTitle && section && areaName) {
  // the area is its tab icon, which keeps room for the section and note names
  const icon = document.querySelector('.tab.active svg')?.cloneNode(true) as SVGElement | undefined;
  const area = document.createElement('b');
  if (icon) area.append(icon);
  else area.textContent = areaName;
  ctx.append(area);
  [section, pageTitle].forEach((part) => {
    ctx.append(Object.assign(document.createElement('i'), { textContent: '›' }));
    ctx.append(Object.assign(document.createElement('span'), { textContent: part }));
  });
  ctx.classList.add('crumbs');
  ctx.title = `${areaName} › ${section} › ${pageTitle}`;
} else if (pageTitle) ctx.textContent = `Reading: ${pageTitle}`;
else ctx.hidden = true;
// "area/section/slug" when this page is a note
const pageNote = location.pathname.startsWith(base) ? location.pathname.slice(base.length).replace(/\/$/, '') : '';

// ---- the notes index: chunk text plus one vector per chunk ----
let index: Promise<{ chunks: Chunk[]; vecs: Float32Array }> | undefined;
function ensureIndex() {
  index ??= (async () => {
    const [chunks, buf] = await Promise.all([
      fetch(root.dataset.chunks!).then((r) => (r.ok ? (r.json() as Promise<Chunk[]>) : Promise.reject(new Error('The notes index is missing.')))),
      fetch(root.dataset.vecs!).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('The notes index is missing.')))),
    ]);
    const vecs = new Float32Array(buf);
    if (vecs.length !== chunks.length * DIMS) throw new Error('The notes index is out of date. Rebuild it and reload.');
    return { chunks, vecs };
  })();
  index.catch(() => (index = undefined));
  return index;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const apiMessage = (status: number) =>
  status === 401
    ? 'OpenRouter rejected the key. Check it and connect again.'
    : status === 402
      ? 'The key has no credit left on OpenRouter.'
      : status === 429
        ? 'Too many requests. Wait a moment and try again.'
        : `OpenRouter returned an error (${status}).`;
const headers = () => ({ Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Title': 'Workbench' });

async function embedQuery(text: string, signal: AbortSignal) {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
    signal,
  });
  if (!res.ok) throw new ApiError(res.status, apiMessage(res.status));
  const v = ((await res.json()).data[0].embedding as number[]).slice(0, DIMS);
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

const aboutThisNote = /\b(this|current) (note|page|one)\b/i;

function retrieve(qv: number[], idx: { chunks: Chunk[]; vecs: Float32Array }): Hit[] {
  const hits = idx.chunks.map((chunk, i) => {
    let s = 0;
    for (let d = 0; d < DIMS; d++) s += idx.vecs[i * DIMS + d] * qv[d];
    // sections of the note being read rank slightly higher; the gate looks at the plain score
    return { score: s, boosted: s + (chunk.note === pageNote ? 0.05 : 0), chunk };
  });
  return hits.sort((a, b) => b.boosted - a.boosted).slice(0, TOP);
}

// ---- rendering ----
let katex: { renderToString: (t: string, o: object) => string } | undefined;
// math stays as plain text if KaTeX cannot load; the answer still shows
const loadKatex = async () => {
  try {
    katex ??= (await import('katex')).default;
  } catch {}
};
const mathCache = new Map<string, string>();
const math = (tex: string, display: boolean) => {
  if (!katex) return tex.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const key = `${display ? 'd' : 'i'}${tex}`;
  let html = mathCache.get(key);
  if (!html) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false });
    mathCache.set(key, html);
  }
  return html;
};
const sectionUrl = (c: Chunk) => `${base}${c.note}/${c.id.includes('#') ? `#${c.id.split('#')[1]}` : ''}`;
const sectionLabel = (c: Chunk) => `${c.title} › ${c.heading || 'Overview'}`;

const toBottom = () => (scroll.scrollTop = scroll.scrollHeight);
const nearBottom = () => scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 90;

function addUser(text: string) {
  const m = document.createElement('div');
  m.className = 'msg user';
  m.textContent = text;
  log.append(m);
  toBottom();
}
function addBot() {
  const m = document.createElement('div');
  m.className = 'msg bot typing';
  const b = document.createElement('div');
  b.className = 'body';
  m.append(b);
  log.append(m);
  toBottom();
  return { el: m, body: b };
}
function addChips(el: HTMLElement, items: { label: string; href: string }[], lead?: string) {
  if (!items.length) return;
  const row = document.createElement('div');
  row.className = 'srcs';
  if (lead) row.append(Object.assign(document.createElement('span'), { className: 'srcs-lead', textContent: lead }));
  for (const s of items) {
    const a = document.createElement('a');
    a.className = 'src';
    a.href = s.href;
    a.textContent = s.label;
    row.append(a);
  }
  el.append(row);
}

// A partly revealed answer may end anywhere; this backs up to before an unfinished $math$ or [n] citation
// so half a formula is never shown as raw text.
function safeCut(text: string, n: number) {
  let s = text.slice(0, n);
  let open = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') i++;
    else if (s[i] === '$') {
      open = open < 0 ? i : -1;
      if (s[i + 1] === '$') i++;
    }
  }
  if (open >= 0) s = s.slice(0, open);
  return s.replace(/\[[\d,\s]*$/, '');
}

// limits for the shared key: a pause between questions and a daily cap per browser (a courtesy, as client code can be bypassed)
let lastAsk = 0;
function sharedLimit() {
  const wait = SHARED_COOLDOWN_MS - (Date.now() - lastAsk);
  if (wait > 0) return `One question at a time, please. Try again in ${Math.ceil(wait / 1000)}s.`;
  const day = new Date().toISOString().slice(0, 10);
  let usage: { day: string; n: number } = { day, n: 0 };
  try {
    const saved = JSON.parse(store.get('chat-usage') ?? 'null');
    if (saved?.day === day) usage = saved;
  } catch {}
  if (usage.n >= SHARED_DAILY_CAP) return `The shared key allows ${SHARED_DAILY_CAP} questions a day per browser, and today's are used. Come back tomorrow or use your own key.`;
  usage.n++;
  store.set('chat-usage', JSON.stringify(usage));
  lastAsk = Date.now();
  return '';
}

// ---- asking ----
const history: Turn[] = [];
let busy = false;
let abort: AbortController | undefined;
const setBusy = (on: boolean) => {
  busy = on;
  send.classList.toggle('stop', on);
  send.setAttribute('aria-label', on ? 'Stop' : 'Send');
  send.disabled = on ? false : !input.value.trim();
};

async function ask(text: string) {
  text = text.trim().slice(0, MAX_QUESTION);
  if (busy || !text) return;
  if (shared) {
    const warn = sharedLimit();
    if (warn) {
      empty.hidden = true;
      addUser(text);
      const m = addBot();
      m.el.classList.remove('typing');
      m.body.textContent = warn;
      return;
    }
  }
  setBusy(true);
  abort = new AbortController();
  empty.hidden = true;
  clear.hidden = false;
  addUser(text);
  const bot = addBot();
  bot.body.textContent = 'Searching the notes…';
  let answer = '';
  let shown = 0;
  let raf = 0;
  try {
    const [idx] = await Promise.all([ensureIndex(), loadKatex()]);
    // a short follow-up ("why?") borrows the previous question to find its sections
    const prev = [...history].reverse().find((t) => t.role === 'user');
    const query = prev && text.length < 40 ? `${prev.content} ${text}` : text;
    const here = pageNote && pageTitle && aboutThisNote.test(text);
    const qv = await embedQuery(here ? `${pageTitle}: ${text}` : query, abort.signal);
    const hits = retrieve(qv, idx);
    const covered = hits.some((h) => h.score >= GATE) || (here && hits.some((h) => h.chunk.note === pageNote));
    if (!covered) {
      bot.body.textContent = 'The notes do not cover that.';
      const seen = new Set<string>();
      const near = hits.filter((h) => !seen.has(h.chunk.note) && seen.add(h.chunk.note)).slice(0, 3);
      addChips(bot.el, near.map((h) => ({ label: h.chunk.title, href: `${base}${h.chunk.note}/` })), 'Closest notes');
      return;
    }
    const sections = here ? [...hits.filter((h) => h.chunk.note === pageNote), ...hits.filter((h) => h.chunk.note !== pageNote)].slice(0, TOP) : hits;
    const cite = (n: number) => (sections[n - 1] ? { href: sectionUrl(sections[n - 1].chunk), title: sectionLabel(sections[n - 1].chunk) } : null);

    bot.body.textContent = 'Reading the sections…';
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: headers(),
      signal: abort.signal,
      body: JSON.stringify({
        model: CHAT_MODEL,
        stream: true,
        max_tokens: 700,
        reasoning: { effort: 'low' },
        messages: [
          { role: 'system', content: systemMessage(PROMPT, sections.map((h) => h.chunk)) },
          ...history.slice(-HISTORY_TURNS * 2),
          { role: 'user', content: text },
        ],
      }),
    });
    if (!res.ok || !res.body) throw new ApiError(res.status, apiMessage(res.status));

    // the answer arrives in a burst (about a second for a full reply), so it is revealed at a steady pace:
    // REVEAL_CPS characters a second, faster when the unrevealed backlog grows
    let streamDone = false;
    let last = 0;
    let drawn = -1;
    let drained!: () => void;
    const finished = new Promise<void>((r) => (drained = r));
    const tick = (now: number) => {
      const dt = Math.min((now - (last || now)) / 1000, 0.1);
      last = now;
      const backlog = answer.length - shown;
      shown = Math.min(answer.length, shown + Math.max(REVEAL_CPS, backlog > 300 ? backlog * 4 : 0) * dt);
      const upto = Math.floor(shown);
      if (upto !== drawn) {
        drawn = upto;
        const follow = nearBottom();
        bot.body.innerHTML = renderMarkdown(shown >= answer.length ? answer : safeCut(answer, upto), cite, math);
        if (follow) toBottom();
      }
      if (shown < answer.length || !streamDone) raf = requestAnimationFrame(tick);
      else drained();
    };
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop()!;
      for (const line of lines) {
        if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
        const delta = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
        if (delta) {
          answer += delta;
          if (!raf) raf = requestAnimationFrame(tick);
        }
      }
    }
    streamDone = true;
    if (raf) await finished;
    const cited = [...new Set([...answer.matchAll(/\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g)].flatMap((m) => m[1].split(',').map(Number)))]
      .map((n) => sections[n - 1]?.chunk)
      .filter(Boolean);
    const seen = new Set<string>();
    addChips(bot.el, cited.filter((c) => !seen.has(c.id) && seen.add(c.id)).map((c) => ({ label: sectionLabel(c), href: sectionUrl(c) })));
    history.push({ role: 'user', content: text }, { role: 'assistant', content: answer.replace(/\[\d{1,2}(?:\s*,\s*\d{1,2})*\]/g, '').trim() });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      cancelAnimationFrame(raf);
      if (shown) bot.body.innerHTML = renderMarkdown(safeCut(answer, Math.floor(shown)), () => null, math);
      bot.body.append(Object.assign(document.createElement('p'), { className: 'note', textContent: 'Stopped.' }));
    } else {
      bot.body.textContent = err instanceof ApiError || err instanceof Error ? err.message : 'Something went wrong.';
      bot.el.classList.add('err');
      if (err instanceof ApiError && err.status === 401) disconnect();
    }
  } finally {
    bot.el.classList.remove('typing');
    setBusy(false);
    if (nearBottom()) toBottom();
  }
}

// ---- composer ----
const grow = () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  if (!busy) send.disabled = !input.value.trim();
};
input.maxLength = MAX_QUESTION;
input.addEventListener('input', grow);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    q<HTMLFormElement>('[data-chat-form]').requestSubmit();
  }
});
q<HTMLFormElement>('[data-chat-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  if (busy) return abort?.abort();
  const text = input.value;
  input.value = '';
  grow();
  void ask(text);
});
root.querySelectorAll<HTMLElement>('[data-prompt]').forEach((b) => b.addEventListener('click', () => void ask(b.dataset.prompt!)));
clear.addEventListener('click', () => {
  if (busy) return;
  history.length = 0;
  log.textContent = '';
  empty.hidden = false;
  clear.hidden = true;
});
if (apiKey && body.classList.contains('chat-open')) void ensureIndex().catch(() => {});
