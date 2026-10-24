// Shared by the chat evals: retrieval over the chunk embeddings, the system prompt and one model call.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DIMS, embedChunks, embedTexts } from './chat-embed.mjs';
import { MAX_QUESTION, TOP } from '../src/data/chat-config.ts';
import { systemMessage as build } from '../src/lib/chat-prompt.ts';

const root = resolve(import.meta.dirname, '..');
export const chunks = JSON.parse(readFileSync(`${root}/public/chat/chunks.json`, 'utf8'));
export { TOP, MAX_QUESTION };
const PROMPT = readFileSync(`${root}/src/prompts/chat-system.md`, 'utf8');
const systemMessage = (sections) => build(PROMPT, sections);

let vecs;
export async function ready() {
  vecs ??= await embedChunks(chunks);
}

/** Top chunks for a question, best first, with cosine score. */
export async function retrieve(q, top = TOP) {
  await ready();
  const [qv] = await embedTexts([q.slice(0, MAX_QUESTION)]);
  return chunks
    .map((c, i) => {
      let s = 0;
      for (let d = 0; d < DIMS; d++) s += vecs[i * DIMS + d] * qv[d];
      return { score: s, chunk: c };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}

let prices;
export async function ask(model, q, hits, effort = 'low') {
  prices ??= Object.fromEntries((await (await fetch('https://openrouter.ai/api/v1/models')).json()).data.map((m) => [m.id, m.pricing]));
  const body = {
    model,
    max_tokens: 1500,
    messages: [{ role: 'system', content: systemMessage(hits.map((h) => h.chunk)) }, { role: 'user', content: q.slice(0, MAX_QUESTION) }],
  };
  if (effort) body.reasoning = { effort };
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return { text: `ERROR ${res.status}: ${JSON.stringify(json).slice(0, 200)}`, cost: 0, tokens: [0, 0] };
  const u = json.usage ?? {};
  const p = prices[model] ?? { prompt: 0, completion: 0 };
  return {
    text: json.choices[0].message.content?.trim() || '(empty)',
    cost: u.cost ?? u.prompt_tokens * p.prompt + u.completion_tokens * p.completion,
    tokens: [u.prompt_tokens, u.completion_tokens],
  };
}
