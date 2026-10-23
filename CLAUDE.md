# Workbench: project guide

A study site of notes (Astro 7 + MDX + KaTeX), deployed to GitHub Pages under `/workbench`. Areas: math, infra (hardware), cs, ml, dl, applied-dl. This file is the contract for adding or editing notes and figures, so new work matches what exists without a fresh audit.

## Commands

- `bun run dev`: dev server with hot reload. The user reviews notes in the browser.
- `bun run build`: display-math check, then `astro build`, then pagefind. Run it before claiming anything is done.
- `uv run scripts/check_notes.py <area> [filter]`: runs every Python block in one area's notes (math, cs, …) on its own and checks its printed output. It must report 0 failing.
- `uv run scripts/note_tools.py <command>`: the one entry point for checks while writing. Reuse it; add new helpers to it instead of writing throwaway scripts.
  - `check <area> [filter]`: same as check_notes.py.
  - `verify [area ...]`: `bun run build`, then fails on any `katex-error` in `dist/<area>` or control characters in `src`.
  - `shots <path> ...` (e.g. `infra/storage/raid`): screenshots built pages with headless Edge and crops every figure to `.shots/<page>_fig<N>.png` (gitignored). Look at each crop before calling a figure done; it only shows the initial state, so step through steppers in `bun run dev` or say so.
  - `pending <file> ...`: appends every code block still marked `// output: PENDING` to `refs/verify-snippets.md` (skips entries already there).
  - `fill <note> <answers.txt>`: the user's pasted outputs (`answers/<lang>.txt`, numbered `1.`, `2.`, … in the order of the note's PENDING blocks) replace the markers; failed runs stay PENDING and the log is re-synced.
  - `links <stats|mentions|similar|compare|orphans|apply>`: link audit; see Linking. Read-only, except `apply <file> --write`, which wraps mentions in links (dry run without `--write`).
  - `dollars [--apply] <file|dir> ...`: finds money such as `$30,000` in prose that KaTeX would read as math; `--apply` escapes it (`\$` in the body, `\\$` in YAML takeaways). Review the list before applying.
- Tooling: bun only for JS (never npm, npx or yarn); uv only for Python (never bare pip). Pin exact versions.

## Where things live

- Notes: `src/content/notes/<area>/<section>/<slug>.mdx`. The URL is `/workbench/<area>/<section>/<slug>/`.
- Areas and the section order (the sidebar order): `src/data/areas.ts`. A new section needs an entry there.
- Figures: `src/components/interactive/<Name>.astro`. Every file in this folder is registered automatically and used in MDX as `<Name />` with no import.
- Shared frame `src/components/Figure.astro`; callouts `<Callout type="key|pitfall|example|practice">`.
- Global styles and design tokens: `src/styles/global.css`. Shared figure behaviour (switchers, toggles, auto-play): the script at the end of `src/layouts/Base.astro`.

## Note format

Frontmatter (schema in `src/content.config.ts`):

```yaml
title: "Two Or Three Words"   # Title Case, at most 3 words
description: "One sentence on what the note covers."
order: 3                      # position inside the section; renumber neighbours when inserting
tier: core                    # core | advanced (see below)
takeaways:                    # 3–5 one-line bullets, shown in the "In short" box
  - "Use **bold** for the key term. LaTeX inside YAML needs doubled backslashes: $\\frac{a}{b}$."
resources:                    # 2–3 links, every URL checked with curl (200) before adding
  - title: "Name (Source)"
    url: "https://…"
    note: "Why it is worth opening."
```

`tier: advanced` shows a small ADV badge (sidebar, note header, overview). It means the note is harder or leans on several earlier notes, so read it after the core notes of its section. It does not mean skippable or less important. A note is advanced if it (1) needs most of its section first, (2) is a step up in rigor or abstraction from its neighbours, (3) is the research or frontier end of its topic, or (4) is systems depth beyond a working model. Being niche, long or new does not count. Aim for about 1 note in 5 per section; everything else is `core`. When writing a stub, confirm or change its tier by these tests.

### Appendix templates

- **Library guide** (NumPy, SciPy, SymPy, pandas, seaborn, matplotlib, scikit-learn, PyTorch, Hugging Face): a `<FilterTable>` at the top mapping "I want to…" to the call, then `##` sections by task ("Creating arrays", "Linear algebra"), each with a short standalone code block and real output.
- **Language and tool sheets** (`cs/appendix-languages/*-sheet`, `cs/appendix-tools/*`, `javascript-typescript`, `postgres`, `docker`, …): no shared heading list. Each sheet is structured around what that language or tool is for and where it is strong or weak (Rust leads with ownership, Go with goroutines, C++ with RAII and templates, SQL databases with queries, indexes and transactions). Open with a short "what it is good and bad at" section, then the **basics in that language** (types and variables, control flow, functions, core collections and strings, errors), then the language's own depth, and end with "Pitfalls" and "Tooling". The free structure is about emphasis and naming, never about skipping the basics. Cross-language comparison lives in `rosetta-table` (a `<FilterTable>`: one concept per row, one column per language), not in the sheets. Code in that language. The checker only runs Python, and the user verifies other code with online compilers, so: write each non-Python snippet with `// output: PENDING` (or the language's comment syntax) where its output goes, and log it with `note_tools.py pending <file>`. The user runs them and pastes the outputs back; only then replace PENDING with the real output. Never guess an output. Shell/config blocks that only show usage (no output to check) need no PENDING.
- **Same code in several languages** (e.g. TypeScript and JavaScript): wrap the fenced blocks in `<CodeTabs>` with blank lines around each block. Each block's language becomes a tab in one shared header.
- Lookup pages (glossary, cheat sheets, units): `<FilterTable>`.

Body pattern, as in the CS notes:

1. An opening paragraph: the problem, why it matters, what the note covers, and a link to the note it builds on.
2. `##` sections of at most 5 words each. Bold key terms where they are defined. Define every term and symbol before using it.
3. Math: inline `$…$`. Display math always on its own lines with a blank line before the closing `$$`:
   ```
   $$
   f(x) = x^2.

   $$
   ```
   A single-line `$$…$$` fails the build. Inside math use `\text{…}` for words, `\lvert x \rvert` for absolute value, `^{…}` braces for exponents, and `^\circ` for degrees.
4. After every display formula or code block: a paragraph starting **"In words:"** that explains the result, quoting the real numbers the code printed.
5. At least one `<Callout type="pitfall">` per note for the common mistake.
6. Figures go next to the text they illustrate, at most 1–2 per section, and only where they teach better than text.
7. Internal links are relative to the note URL: `../sibling/`, `../../other-section/note/`, `../../../cs/section/note/`. Appendix tables use absolute `/workbench/...` links. Every link must point to an existing note.

Writing: plain, specific sentences with no padding. State facts precisely: no "always" or "never" unless true, and give conditions (for example "for continuous f"). Don't refer to "the next note" unless the `order` really makes it next; name and link the note instead.

## Linking

The note graph (`/workbench/graph/`, and the "Connections" graph on each note) is built from the markdown links in note bodies, so links are how a reader finds what to read first. They should show real dependencies, not fill a coverage target.

- **Link when** the reader needs the target to follow the sentence (a prerequisite or a definition), or the target is the natural next step. One link per target per note, at its first useful mention. Never link a word that merely appears: "graph of a function" is not the graph data structure, and "Monte Carlo" means different things in randomized algorithms and in MCMC.
- **Direction follows dependency.** A note links to what it relies on: cs and ml link back to the math they use; math links forward only to applications. Cross-area links only when it is the same idea in another setting.
- **Inline first.** Wrap an existing mention. If a note has no natural spot, add one short plain sentence at the end of its opening paragraph. Do not add notes or sections just to create links. Appendix pages are left out of the graph, so do not rely on them for connections.
- **No link fields in frontmatter.** Links live only in the body; the graph, the audit and the build all read the body.
- **Measure, do not target.** `links stats` prints an area-pair table adjusted for size: `per 1000` is links per 1000 note pairs and `fill%` is the share of plausible pairs (similar text or an unlinked title mention) already linked. Compare a cross-area pair with the fill inside its own areas (about 25 to 40% in math and cs at the last check), never with 100%. Soft bands: about 2 to 6 outgoing links per note, none above about 10. A note may stay unlinked.
- **Orphans** (written notes with no links either way): `links orphans` lists the signals (title mentions in each direction, text similarity, section neighbours). Link what is real. Record a true leaf in `REVIEWED_LEAVES` in `scripts/note_tools.py` with a reason.
- **Writing a new note:** link its prerequisites in the opening paragraph, then run `links mentions` and `links similar` for its area to find notes that already mention its title and should link to it. After a batch of notes, run `links stats` again; the area-pair table has no data for areas that are still stubs, so read it afresh once ml, dl and applied-dl are written.
- **Work in small batches**, one section per commit: put the pairs in a file, run `links apply <file>` as a dry run, read each change, then `--write`, then build.

## Code blocks (Python)

- Every block is **standalone**: its own imports and data, runnable alone. Never rely on an earlier block.
- Show real output. Either `print(x)  # prints: <exact output>` for one line, or trailing comment lines at the end of the block, one per output line. Never hand-write or guess output: run it and paste it. Never truncate with `...`.
- Seed all randomness (`np.random.default_rng(seed)`, `random.seed(...)`). Never print timings or other machine-dependent values; print a boolean check instead.
- Prefer clarity: a short hand-written version when the algorithm is the topic, then a one-line library check (numpy, scipy, sympy, networkx, statsmodels). Mention the run command when a library is used, e.g. "Run it with `uv run --with numpy --with scipy`."
- Comments explain why, not what. Use 4-space indentation.
- After editing any note code, run `uv run scripts/check_notes.py <area> <filter>`.
- Versions: the pins in the PEP 723 header of `scripts/check_notes.py` (Python and every library) are the single source of truth. Every Python code block's header shows them automatically: the tab reads "Python 3.14", and the right side lists the pinned versions of the libraries that block imports (`numpy 2.5.4 · scipy 1.18.1`). To use a new library, add it pinned to that header and to `PACKAGES` in `scripts/code-pins.mjs`.

## Figures (interactive components)

Copy the structure of an existing figure (for example `GeometricSums.astro` or `HeapViz.astro`):

```astro
---
import Figure from '../Figure.astro';
---
<Figure title="Short claim the figure shows" caption="What to do and what to notice.">
  <my-thing> …controls, svg/canvas, <p data-stat></p> … </my-thing>
</Figure>
<style> /* scoped; use :global(.cls) for elements created in JS */ </style>
<script>
  class MyThing extends HTMLElement { connectedCallback() { … this.draw(); } draw() { … } }
  customElements.define('my-thing', MyThing);
</script>
```

- Use `kind="Diagram"` for static figures. The caption must describe only what the figure actually shows, and its readout must agree with the note's numbers.
- **Colours: always design tokens, never ad-hoc greys for data.** `--g-blue`, `--g-red`, `--g-yellow`, `--g-green` and their `-l` light variants; tinted fills such as `rgba(66,133,244,0.16)`. Use colour for meaning: blue for the main object, green for good, correct or exact, yellow for the current or highlighted item, red for error, bad or unstable. Aim for at least 2–3 colours per figure, like the CS figures. Text uses `--text`, `--text-muted`, `--text-faint`; borders use `--border`. Background is OLED black. Canvas code uses the hex values (`#4285f4`, `#ea4335`, `#fbbc05`, `#34a853`).
- **Choices are pill buttons, never `<select>` dropdowns.** Use the shared `.btn` class with `aria-pressed`. Two ready patterns are handled by `Base.astro`:
  - Switcher (one of several): `<input type="hidden" data-x value="a" /><span class="choice"><button type="button" class="btn" data-choice="a" aria-pressed="true">A</button>…</span>`. Read it with `querySelector('[data-x]').value`; it fires `input` and `change`.
  - Toggle (on/off): `<input type="checkbox" hidden data-x /><button type="button" class="btn" data-toggle aria-pressed="false">Label</button>`. Read `.checked`.
- **Steppers always have Step, Auto and Reset**, in that order. Mark the step button `data-step-btn` and add `<button type="button" class="btn" data-auto-step aria-pressed="false">Auto</button>`; `Base.astro` auto-plays it (it reads Pause while running) and stops at the end. Reset returns to step 0. A figure with its own Play loop still needs Step and Reset.
- Sliders: `<label class="xx-lbl">name <input type="range" …> <b data-xv>value</b></label>`, with the current value shown.
- Readout: one `<p>` in monospace with the key numbers, formatted like `a = 1 · b = 2 · verdict`.
- **Axes: every chart names what each axis measures** (with units or "log scale" where they apply). Wrap the chart: `<div class="axes" style="--ax-w: 440px"><span class="ax-y">density</span><svg …/><span class="ax-x">heads probability θ</span></div>` (`--ax-w` = the chart's max-width; styles in `global.css`; works for any viewBox units and for canvas). Coordinate planes use `x` and `y`. When one SVG holds several panels with different axes, put the titles inside it instead with `<text class="ax-title">` (rotate the y title with `transform="translate(x y) rotate(-90)"`). Add `<text class="ax-tick">` end values where the scale is fixed and not obvious.
- Layout: SVG with a `viewBox` and `width: 100%; max-width: …`; it must work at phone width.

## Gotchas

- Doubled backslashes are needed only in YAML double-quoted strings (takeaways). In the MDX body use single `\`.
- A dollar sign before a number starts inline math: "costs $30,000 … $9,000" renders as garbled math. Write `\$30,000` in the body and `\\$30,000` in takeaways (`note_tools.py dollars` finds them).
- In SVG figures, tinted fills (`rgba(…, 0.16)`) are see-through: lines drawn underneath show through boxes. Draw an opaque `fill: var(--bg)` rect first, then the tinted one.
- When editing text with shell tools, beware escape sequences: `\t`, `\a` and `\f` in replacement strings turned `\times`, `\approx` and `\frac` into control characters in the past. Prefer the Edit tool, or Python with raw strings. Check with `grep -rP '[\x00-\x08\x0b\x0c\x0e-\x1f]' src`.
- Inserting a note: renumber `order` in its section and fix any "next note" wording.
- Never delete files, commit or push without asking. On push, the deploy workflow rebuilds the pagefind index; never commit `dist/` or `public/pagefind/`.

## Definition of done

1. `uv run scripts/check_notes.py <area>`: 0 failing for every area with code changes.
2. `bun run build` succeeds with no display-math errors, and `grep -rl katex-error dist/<area>` finds nothing.
3. Links resolve, and new resource URLs return 200.
4. The figures were tried in `bun run dev` (or the user was told they need a look).
