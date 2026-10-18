# Workbench: project guide

A study site of notes (Astro 7 + MDX + KaTeX), deployed to GitHub Pages under `/workbench`. Areas: math, infra (hardware), cs, ml, dl, applied-dl. This file is the contract for adding or editing notes and figures, so new work matches what exists without a fresh audit.

## Commands

- `bun run dev`: dev server with hot reload. The user reviews notes in the browser.
- `bun run build`: display-math check, then `astro build`, then pagefind. Run it before claiming anything is done.
- `uv run scripts/check_notes.py <area> [filter]`: runs every Python block in one area's notes (math, cs, …) on its own and checks its printed output. It must report 0 failing.
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
tier: core                    # core | optional | advanced
takeaways:                    # 3–5 one-line bullets, shown in the "In short" box
  - "Use **bold** for the key term. LaTeX inside YAML needs doubled backslashes: $\\frac{a}{b}$."
resources:                    # 2–3 links, every URL checked with curl (200) before adding
  - title: "Name (Source)"
    url: "https://…"
    note: "Why it is worth opening."
```

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

## Code blocks (Python)

- Every block is **standalone**: its own imports and data, runnable alone. Never rely on an earlier block.
- Show real output. Either `print(x)  # prints: <exact output>` for one line, or trailing comment lines at the end of the block, one per output line. Never hand-write or guess output: run it and paste it. Never truncate with `...`.
- Seed all randomness (`np.random.default_rng(seed)`, `random.seed(...)`). Never print timings or other machine-dependent values; print a boolean check instead.
- Prefer clarity: a short hand-written version when the algorithm is the topic, then a one-line library check (numpy, scipy, sympy, networkx, statsmodels). Mention the run command when a library is used, e.g. "Run it with `uv run --with numpy --with scipy`."
- Comments explain why, not what. Use 4-space indentation.
- After editing any note code, run `uv run scripts/check_notes.py <area> <filter>`.

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
- Layout: SVG with a `viewBox` and `width: 100%; max-width: …`; it must work at phone width.

## Gotchas

- Doubled backslashes are needed only in YAML double-quoted strings (takeaways). In the MDX body use single `\`.
- When editing text with shell tools, beware escape sequences: `\t`, `\a` and `\f` in replacement strings turned `\times`, `\approx` and `\frac` into control characters in the past. Prefer the Edit tool, or Python with raw strings. Check with `grep -rP '[\x00-\x08\x0b\x0c\x0e-\x1f]' src`.
- Inserting a note: renumber `order` in its section and fix any "next note" wording.
- Never delete files, commit or push without asking. On push, the deploy workflow rebuilds the pagefind index; never commit `dist/` or `public/pagefind/`.

## Definition of done

1. `uv run scripts/check_notes.py <area>`: 0 failing for every area with code changes.
2. `bun run build` succeeds with no display-math errors, and `grep -rl katex-error dist/<area>` finds nothing.
3. Links resolve, and new resource URLs return 200.
4. The figures were tried in `bun run dev` (or the user was told they need a look).
