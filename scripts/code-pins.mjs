// Python and library versions shown in code block headers. The single source of truth is the PEP 723
// header of scripts/check_notes.py, the script that runs and verifies every Python block in the notes.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// pinned package name -> display label and the module names code imports it by
const PACKAGES = {
  numpy: { label: 'numpy', modules: ['numpy'] },
  scipy: { label: 'scipy', modules: ['scipy'] },
  sympy: { label: 'sympy', modules: ['sympy'] },
  networkx: { label: 'networkx', modules: ['networkx'] },
  statsmodels: { label: 'statsmodels', modules: ['statsmodels'] },
  cryptography: { label: 'cryptography', modules: ['cryptography'] },
  packaging: { label: 'packaging', modules: ['packaging'] },
  pandas: { label: 'pandas', modules: ['pandas'] },
  matplotlib: { label: 'matplotlib', modules: ['matplotlib'] },
  seaborn: { label: 'seaborn', modules: ['seaborn'] },
  'scikit-learn': { label: 'scikit-learn', modules: ['sklearn'] },
  torch: { label: 'torch', modules: ['torch'] },
  transformers: { label: 'transformers', modules: ['transformers'] },
};

const src = readFileSync(fileURLToPath(new URL('./check_notes.py', import.meta.url)), 'utf-8');
// "==3.14.*" is captured as "3.14."; drop the trailing dot
export const PYTHON_VERSION = (src.match(/requires-python\s*=\s*"==\s*([\d.]+)/)?.[1] ?? '').replace(/\.$/, '');
const pins = new Map([...src.matchAll(/^#\s*"([\w-]+)==([\w.]+)"/gm)].map((m) => [m[1].toLowerCase(), m[2]]));

/** "numpy 2.5.4 · scipy 1.18.1" for the pinned libraries a block of Python code imports, or ''. */
export function libraryVersions(code) {
  const imported = new Set([...code.matchAll(/^\s*(?:from|import)\s+(\w+)/gm)].map((m) => m[1]));
  return Object.entries(PACKAGES)
    .filter(([name, { modules }]) => pins.has(name) && modules.some((m) => imported.has(m)))
    .map(([name, { label }]) => `${label} ${pins.get(name)}`)
    .join(' · ');
}
