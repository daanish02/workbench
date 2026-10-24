// Retrieval eval for the chat: pagefind vs embeddings, scored at note level against scripts/chat-eval.json.
//   bun scripts/chat-eval.mjs [pagefind|embed|both]
// Needs public/chat/chunks.json (note_tools.py chunks), the dev server on :4321 for pagefind, and a built
// public/pagefind index (bun run search:dev). Embeddings come from chat-embed.mjs (OpenRouter, cached by chunk hash).
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import { DIMS, embedChunks, embedTexts } from './chat-embed.mjs';

const K = 5;
const root = resolve(import.meta.dirname, '..');
const chunks = JSON.parse(readFileSync(`${root}/public/chat/chunks.json`, 'utf8'));
const questions = JSON.parse(readFileSync(`${root}/scripts/chat-eval.json`, 'utf8'));
const mode = process.argv[2] ?? 'both';

function score(name, rankedNotes) {
  let r1 = 0, r5 = 0, mrr = 0;
  const misses = [];
  questions.forEach((item, i) => {
    const hit = rankedNotes[i].findIndex((n) => item.notes.includes(n));
    if (hit === 0) r1++;
    if (hit >= 0 && hit < K) r5++;
    if (hit >= 0) mrr += 1 / (hit + 1);
    if (hit < 0 || hit >= K) misses.push(`  miss: ${item.q}\n        got ${rankedNotes[i].slice(0, 3).join(', ')}`);
  });
  const n = questions.length;
  console.log(`${name}: recall@1 ${(r1 / n).toFixed(2)}  recall@${K} ${(r5 / n).toFixed(2)}  mrr ${(mrr / n).toFixed(2)}`);
  misses.forEach((m) => console.log(m));
}

async function pagefindRanks() {
  const pf = await import(pathToFileURL(`${root}/public/pagefind/pagefind.js`).href);
  await pf.options({ basePath: 'http://localhost:4321/workbench/pagefind/' });
  // pagefind needs every query word to match, so a question is reduced to its content words
  // and the last word is dropped until something matches
  const stop = new Set('a an the of to in on for is are do does how why what when which who can i my me you it its be by or and as at from with that this there one two into out so than then between about'.split(' '));
  const ranks = [];
  for (const { q } of questions) {
    const words = q.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !stop.has(w));
    let res = { results: [] };
    for (let n = words.length; n > 0 && !res.results.length; n--) res = await pf.search(words.slice(0, n).join(' '));
    const top = await Promise.all(res.results.slice(0, 10).map((r) => r.data()));
    ranks.push(top.map((d) => new URL(d.url, 'http://x').pathname.replace(/^\/workbench\//, '').replace(/\/$/, '')));
  }
  return ranks;
}

async function embedRanks() {
  const dim = DIMS;
  const vecs = await embedChunks(chunks);
  const ranks = [];
  for (const { q } of questions) {
    const [qv] = await embedTexts([q]);
    const best = new Map();
    for (let i = 0; i < chunks.length; i++) {
      let s = 0;
      for (let d = 0; d < dim; d++) s += vecs[i * dim + d] * qv[d];
      const note = chunks[i].note;
      if (s > (best.get(note) ?? -1)) best.set(note, s);
    }
    ranks.push([...best].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([n]) => n));
  }
  return ranks;
}

if (mode !== 'embed') score('pagefind  ', await pagefindRanks());
if (mode !== 'pagefind') score('embeddings', await embedRanks());
