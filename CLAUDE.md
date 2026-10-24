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

## Chat (Ask notes)

A docked panel answers questions from the notes: the question is embedded, the closest note sections (chunks) are found in the browser, and one model writes an answer from only those sections. Code, config, data and prompt text are kept apart:

- Panel: `src/components/Chat.astro` (markup, styles) and `chat-client.ts` (behaviour); `src/lib/chat-markdown.ts` renders replies (HTML-escaped first), `chat-prompt.ts` builds the system message.
- Config: `src/data/chat-config.ts` (models, `GATE`, limits, `REVEAL_CPS`). Prompt text: `src/prompts/chat-system.md`. Starter chips: `src/data/chat-suggestions.ts`.
- Generated data in `public/chat/` (gitignored): `chunks.json` from `uv run scripts/note_tools.py chunks`; `embeddings.f32` and `embed-cache.json` from `bun scripts/chat-embed.mjs` (needs `OPENROUTER_KEY`; only changed chunks are embedded); `key.json` from `bun scripts/chat-key.mjs` (the shared key sealed under `CHAT_PASSWORD`). The deploy workflow runs all three, with `OPENROUTER_KEY` and `CHAT_PASSWORD` as repo secrets. After editing notes, rerun `chunks` and `chat-embed` to refresh the local index.
- `.env.local` holds the same two names for local use. Single-quote the values (`CHAT_PASSWORD='…'`): an unquoted `#` or `$` silently cuts the value, and `chat-key.mjs` refuses passwords under 12 characters.
- Evals (`bun scripts/<name>.mjs`): `chat-eval` (retrieval recall, questions in `chat-eval.json`), `chat-answers` (compare models side by side), `chat-redteam` (off-topic and injection prompts in `chat-redteam.json`, and the `GATE` calibration). Rerun `chat-redteam` after changing the prompt or `GATE`.
- Security: a key is never logged, put in the DOM or URL, or kept in `localStorage` (a tab's `sessionStorage` only). A Content-Security-Policy in `astro.config.mjs` limits scripts to this site and `connect-src` to this site and openrouter.ai. A new external script, font or API host must be added there; dev has no CSP, so check with `bun run build` and `bun run preview`. No `new Function` or `eval` in shipped code.

## Code blocks (Python)

- Every block is **standalone**: its own imports and data, runnable alone. Never rely on an earlier block.
- Show real output as trailing comment lines at the very end of the block, one per output line (`# 3.14`); the site draws them as a separate green output area. Keep explanation comments short (about 60 characters) and put nothing but output in that final run. Never hand-write or guess output: run it and paste it. Never truncate with `...`. The old inline form `print(x)  # prints: 42` still passes the checker, but do not write new ones; `uv run scripts/note_tools.py outputs <area> [filter]` lists blocks that use it and `--write` rewrites them (it runs each block and moves the real output to the end).
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
- **Grid: every data chart gets a faint grid behind the data and sits in a boxed panel.** Declare it on the chart's `<svg>`: `<svg viewBox="0 0 400 200" data-grid='{"box":[30,10,390,170],"x":[0,1],"y":[0,100]}'>`. `box` is the plot area `[x0, y0, x1, y1]` in the SVG's units and `x`, `y` are the data range `[min, max]` across it. A third item sets the axis type: `"log"` for a log10 axis (a line per power of ten, minors at 2 to 9 times it), `"major"` for no minor lines. Leave an axis out for no lines in that direction (a bar chart has no grid on its category axis). One shared script (`src/lib/chart-grid-dom.ts`, loaded by `Base.astro`) draws major lines at round values and fainter minor lines behind the data, and `global.css` boxes any `svg[data-grid]` or `.axes > svg/canvas`. When the scale changes, set `svg.dataset.grid = JSON.stringify(spec)` in the draw code and the grid redraws (it also survives a figure rewriting the svg's `innerHTML`). No tick numbers by default. The grid lines sit at round values, so draw the axis lines at the data origin, not the middle of the box. Skip diagrams, number lines, charts that draw their own grid, and multi-panel svgs (see the memory note on multi-panel grids). The lower-level `chartGrid()` in `src/lib/chart-grid.ts` is still there for server-rendered markup. Examples: `GeometricSums`, `BigOGrowth` (log toggle), `ErrorVsSteps` (log axis), `LogExpPlot`.
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
