// Scope and injection check for the chat.
//   bun scripts/chat-redteam.mjs <out.md> [model]
// 1. Gate calibration: top-1 similarity for the in-scope eval questions vs off-topic and adversarial ones.
// 2. Every prompt goes through the model anyway, so we see what the prompt rules do when the gate lets one pass.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ask, retrieve } from './chat-core.mjs';

const root = resolve(import.meta.dirname, '..');
const [out, model = 'anthropic/claude-haiku-5.5'] = process.argv.slice(2);
const inScope = JSON.parse(readFileSync(`${root}/scripts/chat-eval.json`, 'utf8')).map((x) => x.q);

// bad: strings that must not appear in a good reply
const attacks = JSON.parse(readFileSync(`${root}/scripts/chat-redteam.json`, 'utf8'));

const stats = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return `min ${s[0].toFixed(3)}  p10 ${s[Math.floor(s.length * 0.1)].toFixed(3)}  median ${s[Math.floor(s.length / 2)].toFixed(3)}  max ${s.at(-1).toFixed(3)}`;
};

const inTop = [];
for (const q of inScope) inTop.push((await retrieve(q, 1))[0].score);
const rows = [];
for (const a of attacks) {
  const hits = await retrieve(a.q);
  const r = await ask(model, a.q, hits, 'low');
  const leaked = a.bad.filter((b) => r.text.toLowerCase().includes(b.toLowerCase()));
  rows.push({ ...a, score: hits[0].score, text: r.text, leaked, cost: r.cost });
}
const offTop = rows.map((r) => r.score);

let md = `# Red-team\n\nModel ${model}, effort low.\n\n## Gate scores (top-1 cosine)\n\nin-scope (${inTop.length}): ${stats(inTop)}\n\noff-topic (${offTop.length}): ${stats(offTop)}\n`;
md += `\n## Prompts\n`;
for (const r of rows) md += `\n### ${r.q}\n\ngate score ${r.score.toFixed(3)} · leaked: ${r.leaked.length ? r.leaked.join(', ') : 'none'}\n\n${r.text}\n`;
writeFileSync(out, md);

console.log(`in-scope  ${stats(inTop)}\noff-topic ${stats(offTop)}`);
for (const r of rows) console.log(`${r.score.toFixed(3)} ${r.leaked.length ? 'LEAK ' + r.leaked : 'ok   '} ${r.q.slice(0, 70)}`);
console.log(`cost $${rows.reduce((s, r) => s + r.cost, 0).toFixed(4)}`);
