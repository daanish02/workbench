// Answer-quality eval for the chat: the same retrieved sections go to each candidate model.
//   bun scripts/chat-answers.mjs <out.md> [model ...]      effort via CHAT_EFFORT (low by default, "none" to omit)
// Writes the answers side by side with token use and cost, for reading. Needs OPENROUTER_KEY, public/chat/chunks.json
// and the embeddings from chat-embed.mjs. Two extra questions the notes cannot answer check for "not covered".
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ask, retrieve, TOP } from './chat-core.mjs';

const root = resolve(import.meta.dirname, '..');
const [out, ...argModels] = process.argv.slice(2);
const MODELS = argModels.length ? argModels : ['anthropic/claude-haiku-5.5', 'openai/gpt-6-luna', 'deepseek/deepseek-v4-pro', 'qwen/qwen3.8-flash'];
const effort = (process.env.CHAT_EFFORT ?? 'low') === 'none' ? null : (process.env.CHAT_EFFORT ?? 'low');
const questions = JSON.parse(readFileSync(`${root}/scripts/chat-eval.json`, 'utf8'));
// every third eval question, plus two the notes do not cover
const asked = [...questions.filter((_, i) => i % 3 === 1).map((x) => x.q), 'How does LoRA fine-tuning of a language model work?', 'What is the capital of France?'];

const total = Object.fromEntries(MODELS.map((m) => [m, 0]));
let md = `# Answer eval\n\nTop ${TOP} sections per question, effort ${effort ?? 'off'}. Models: ${MODELS.join(', ')}\n`;
for (const q of asked) {
  const hits = await retrieve(q);
  md += `\n## ${q}\n\nSections: ${hits.map((h) => h.chunk.id).join(', ')}\n`;
  const results = await Promise.all(MODELS.map((m) => ask(m, q, hits, effort)));
  results.forEach((r, i) => {
    total[MODELS[i]] += r.cost;
    md += `\n### ${MODELS[i]}  (${r.tokens[0]} in, ${r.tokens[1]} out, $${r.cost.toFixed(5)})\n\n${r.text}\n`;
  });
  console.log(`done: ${q}`);
}
md += `\n## Total cost for ${asked.length} questions\n\n${MODELS.map((m) => `- ${m}: $${total[m].toFixed(4)}`).join('\n')}\n`;
writeFileSync(out, md);
console.log(MODELS.map((m) => `${m} $${total[m].toFixed(4)}`).join('\n'));
