// Embeds the chat chunks through OpenRouter, only the ones whose hash is not cached yet.
//   bun scripts/chat-embed.mjs        reads public/chat/chunks.json, writes public/chat/embeddings.f32
// Needs OPENROUTER_KEY (bun loads .env.local; in CI it is a repo secret). The cache maps
// sha256(model + dims + text) to a vector, so editing a note re-embeds only its changed chunks.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { DIMS, EMBED_MODEL as MODEL } from '../src/data/chat-config.ts';

export { DIMS };
const BATCH = 64;
const root = resolve(import.meta.dirname, '..');
const dir = `${root}/public/chat`;

const normalise = (v) => {
  const n = Math.hypot(...v) || 1;
  return Float32Array.from(v.slice(0, DIMS), (x) => x / n);
};

export async function embedTexts(texts, usage = { tokens: 0 }) {
  const key = process.env.OPENROUTER_KEY;
  if (!key) throw new Error('OPENROUTER_KEY is not set');
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const input = texts.slice(i, i + BATCH);
    for (let attempt = 1; ; attempt++) {
      const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, input }),
      });
      if (res.ok) {
        const json = await res.json();
        usage.tokens += json.usage?.prompt_tokens ?? 0;
        json.data.sort((a, b) => a.index - b.index).forEach((d) => out.push(normalise(d.embedding)));
        break;
      }
      if (attempt === 4 || res.status < 429) throw new Error(`embeddings ${res.status}: ${(await res.text()).slice(0, 200)}`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return out;
}

export const chunkText = (c) => `${c.title} > ${c.heading}\n${c.text}`;
const hashOf = (text) => createHash('sha256').update(`${MODEL}\n${DIMS}\n${text}`).digest('hex').slice(0, 24);

export async function embedChunks(chunks) {
  const cachePath = `${dir}/embed-cache.json`;
  const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
  const hashes = chunks.map((c) => hashOf(chunkText(c)));
  const todo = [...new Set(hashes.filter((h) => !cache[h]))];
  const byHash = new Map(chunks.map((c, i) => [hashes[i], c]));
  const usage = { tokens: 0 };
  if (todo.length) {
    const vecs = await embedTexts(todo.map((h) => chunkText(byHash.get(h))), usage);
    todo.forEach((h, i) => (cache[h] = Buffer.from(vecs[i].buffer).toString('base64')));
  }
  const live = {};
  hashes.forEach((h) => (live[h] = cache[h]));
  writeFileSync(cachePath, JSON.stringify(live));
  const all = new Float32Array(chunks.length * DIMS);
  hashes.forEach((h, i) => {
    const b = Buffer.from(live[h], 'base64');
    all.set(new Float32Array(b.buffer, b.byteOffset, DIMS), i * DIMS);
  });
  writeFileSync(`${dir}/embeddings.f32`, Buffer.from(all.buffer));
  console.log(`${chunks.length} chunks: ${chunks.length - todo.length} cached, ${todo.length} embedded (${usage.tokens} tokens)`);
  return all;
}

if (import.meta.main) await embedChunks(JSON.parse(readFileSync(`${dir}/chunks.json`, 'utf8')));
