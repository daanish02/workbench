// Fails the build when a note puts a display formula on one line, e.g. $$x = y$$.
// remark-math reads that as inline math, so it renders left-aligned at text size.
// Write it as "$$" on its own line, the formula on the next line, and "$$" after.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../content/notes/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const single = /^\s*\$\$.+\$\$\s*$/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') ? [p] : [];
  });
}

const bad = [];
for (const file of walk(ROOT)) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (single.test(line)) bad.push(`${file}:${i + 1}: ${line.trim()}`);
    });
}

if (bad.length) {
  console.error('Single-line display math found (put $$ on its own lines):');
  for (const b of bad) console.error('  ' + b);
  process.exit(1);
}
console.log('display math check: ok');
