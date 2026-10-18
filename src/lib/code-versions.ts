// Which Python and library versions a note's code was run with. The single source of truth is the
// PEP 723 header of scripts/check_notes.py, the script that runs and verifies every Python block.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// display names for packages; the key is the pinned package name, the value lists its import names
const PACKAGES: Record<string, { label: string; modules: string[] }> = {
  numpy: { label: 'NumPy', modules: ['numpy'] },
  scipy: { label: 'SciPy', modules: ['scipy'] },
  sympy: { label: 'SymPy', modules: ['sympy'] },
  networkx: { label: 'NetworkX', modules: ['networkx'] },
  statsmodels: { label: 'statsmodels', modules: ['statsmodels'] },
  cryptography: { label: 'cryptography', modules: ['cryptography'] },
  packaging: { label: 'packaging', modules: ['packaging'] },
  pandas: { label: 'pandas', modules: ['pandas'] },
  matplotlib: { label: 'Matplotlib', modules: ['matplotlib'] },
  seaborn: { label: 'seaborn', modules: ['seaborn'] },
  'scikit-learn': { label: 'scikit-learn', modules: ['sklearn'] },
  torch: { label: 'PyTorch', modules: ['torch'] },
  transformers: { label: 'Transformers', modules: ['transformers'] },
};

let pins: { python: string; libs: Map<string, string> } | undefined;

function readPins() {
  if (pins) return pins;
  const src = readFileSync(join(process.cwd(), 'scripts', 'check_notes.py'), 'utf-8');
  const python = src.match(/requires-python\s*=\s*"==\s*([\d.]+)/)?.[1] ?? '';
  const libs = new Map<string, string>();
  for (const [, name, version] of src.matchAll(/^#\s*"([\w-]+)==([\w.]+)"/gm)) libs.set(name.toLowerCase(), version);
  pins = { python, libs };
  return pins;
}

/** "Python 3.14 · NumPy 2.5.4 · SciPy 1.18.1" for a note with Python code, or '' when it has none. */
export function codeVersions(body: string): string {
  const blocks = [...body.matchAll(/```python\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (!blocks.length) return '';
  const imported = new Set(
    blocks.flatMap((code) => [...code.matchAll(/^\s*(?:from|import)\s+([\w]+)/gm)].map((m) => m[1])),
  );
  const { python, libs } = readPins();
  // "==3.14.*" is captured as "3.14."; drop the trailing dot
  const parts = python ? [`Python ${python.replace(/\.$/, '')}`] : [];
  for (const [name, { label, modules }] of Object.entries(PACKAGES)) {
    const version = libs.get(name);
    if (version && modules.some((m) => imported.has(m))) parts.push(`${label} ${version}`);
  }
  return parts.join(' · ');
}
