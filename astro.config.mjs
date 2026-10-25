// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PYTHON_VERSION, libraryVersions } from './scripts/code-pins.mjs';

// Language names for the header tab of code blocks without a title. Shell languages and plain
// text are left out: shell blocks render as a terminal, and text/diagram blocks need no header.
const LANGUAGE_LABELS = {
  python: 'Python', sql: 'SQL', typescript: 'TypeScript', ts: 'TypeScript', javascript: 'JavaScript', js: 'JavaScript',
  rust: 'Rust', kotlin: 'Kotlin', java: 'Java', go: 'Go', swift: 'Swift', ruby: 'Ruby', r: 'R', php: 'PHP',
  lua: 'Lua', json: 'JSON', yaml: 'YAML', cypher: 'Cypher', csharp: 'C#', cpp: 'C++', c: 'C', html: 'HTML', css: 'CSS',
  asm: 'Assembly', hcl: 'HCL', terraform: 'Terraform', dockerfile: 'Dockerfile', docker: 'Dockerfile',
};
// The header is the title's 1.9rem line plus 0.45rem padding above and below (about 46px).
// The copy button (1.75rem) is centred in it: half the leftover space, minus the 1px frame border
// that expressive-code adds to the button's offset.
const HEADER_COPY_SPACING = 'calc((1.9rem + 0.9rem - 1.75rem) / 2 - 1px)';
// depth-first search of a hast tree for the first element with a class
function findByClass(node, cls) {
  if (node.properties?.className?.includes?.(cls)) return node;
  for (const child of node.children ?? []) {
    const hit = findByClass(child, cls);
    if (hit) return hit;
  }
  return undefined;
}
// KaTeX writes every formula as MathML, its TeX source and visible glyphs, and pagefind indexes all three, so
// search excerpts repeat each formula. Marking the MathML as ignored keeps it for screen readers but out of the index.
function rehypeIgnoreMathml() {
  const walk = (node) => {
    if (node.properties?.className?.includes?.('katex-mathml')) node.properties.dataPagefindIgnore = 'all';
    node.children?.forEach(walk);
  };
  return walk;
}
// Paragraphs that begin "In words:" get the label wrapped in <strong class="iw-label"> so CSS can colour it;
// the notes write the label as plain text, so there is nothing to change in them.
function rehypeInWords() {
  const walk = (node) => {
    const first = node.tagName === 'p' ? node.children?.[0] : undefined;
    if (first?.type === 'text' && first.value.startsWith('In words:')) {
      node.properties = { ...node.properties, className: [...(node.properties?.className ?? []), 'in-words'] };
      node.children[0] = { type: 'text', value: first.value.slice('In words:'.length) };
      node.children.unshift({ type: 'element', tagName: 'strong', properties: { className: ['iw-label'] }, children: [{ type: 'text', value: 'In words:' }] });
    }
    node.children?.forEach(walk);
  };
  return walk;
}
function languageHeaders() {
  return {
    name: 'language-headers',
    hooks: {
      // a block's language becomes its header tab, the same look as a titled block;
      // Python blocks name the Python version the checker runs them with
      preprocessMetadata: ({ codeBlock }) => {
        const label = LANGUAGE_LABELS[codeBlock.language];
        if (label && !codeBlock.props.title)
          codeBlock.props.title = codeBlock.language === 'python' && PYTHON_VERSION ? `${label} ${PYTHON_VERSION}` : label;
      },
      // Python blocks also list the pinned versions of the libraries that block imports, right of the tab
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        if (codeBlock.language !== 'python') return;
        const libs = libraryVersions(codeBlock.code);
        if (!libs) return;
        const header = findByClass(renderData.blockAst, 'header');
        header?.children.push({ type: 'element', tagName: 'span', properties: { className: ['code-libs'], title: libs }, children: [{ type: 'text', value: libs }] });
      },
    },
    baseStyles: `
      .frame.has-title:not(.is-terminal) {
        --button-spacing: ${HEADER_COPY_SPACING};
        & .title { font: 600 0.8125rem/1.9rem 'Inter', system-ui, sans-serif; padding-block: 0.45rem; }
        & .copy button { width: 1.75rem; height: 1.75rem; opacity: 0.75; background: transparent; }
        & .copy button:hover, & .copy button:focus-visible { opacity: 1; }
        /* library versions: muted, right-aligned, stopping short of the copy button; long lists end in an ellipsis */
        & .header { align-items: center; }
        & .code-libs {
          margin: 0 calc(2 * 1.75rem + 0.25rem + 1.9rem) 0 auto; min-width: 0; padding-left: 1rem;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font: 0.6875rem 'JetBrains Mono', ui-monospace, monospace; color: #6e6e6e;
        }
      }
    `,
  };
}

// A wrap toggle beside the copy button: off by default, flips expressive-code's own `wrap` class on the block's <pre>.
// It is added in the browser (the copy button is too), so blocks without JavaScript just scroll sideways as before.
const WRAP_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3.5h12M2 12.5h4M2 8h9.5a2 2 0 0 1 0 4H9.5M11 10.5 9.5 12 11 13.5"/></svg>';
function wrapToggle() {
  return {
    name: 'wrap-toggle',
    jsModules: [
      `document.querySelectorAll('.expressive-code').forEach((ec) => {
        const pre = ec.querySelector('pre');
        const copy = ec.querySelector('.copy');
        if (!pre || !copy || copy.previousElementSibling?.classList.contains('wrap-btn')) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'wrap-btn';
        b.title = 'Wrap long lines';
        b.setAttribute('aria-label', 'Wrap long lines');
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = ${JSON.stringify(WRAP_ICON)};
        b.addEventListener('click', () => b.setAttribute('aria-pressed', String(pre.classList.toggle('wrap'))));
        copy.before(b);
      });`,
    ],
    baseStyles: `
      .wrap-btn {
        position: absolute; z-index: 1; display: inline-flex; align-items: center; justify-content: center;
        inset-block-start: calc(var(--ec-brdWd) + var(--button-spacing));
        inset-inline-end: calc(var(--ec-brdWd) + var(--ec-uiPadInl) / 2 + 1.75rem + 0.25rem);
        width: 1.75rem; height: 1.75rem; padding: 0; margin: 0; cursor: pointer;
        /* same border as the copy button: its colour at its own opacity */
        border: var(--ec-brdWd) solid color-mix(in srgb, var(--ec-frm-inlBtnBrd) calc(var(--ec-frm-inlBtnBrdOpa) * 100%), transparent);
        border-radius: 0.2rem;
        background: transparent; color: var(--ec-frm-inlBtnFg); opacity: 0.75;
        transition: opacity 0.2s, background 0.2s, color 0.2s, border-color 0.2s;
        @media (scripting: none) { display: none; }
        &:hover, &:focus-visible { opacity: 1; background: color-mix(in srgb, var(--ec-frm-inlBtnBg) calc(var(--ec-frm-inlBtnBgHoverOrFocusOpa) * 100%), transparent); }
        &[aria-pressed='true'] { opacity: 1; color: #8ab4f8; border-color: #8ab4f8; background: rgba(138, 180, 248, 0.12); }
      }
    `,
  };
}

// The notes show a block's printed output as comment lines at its end ("# 3.14"). Mark those lines so they render as an
// output area, apart from the explanation comments inside the code. The text itself is unchanged, so copying still works.
const COMMENT_PREFIX = {
  python: '#', ruby: '#', r: '#',
  javascript: '//', js: '//', typescript: '//', ts: '//', go: '//', rust: '//', java: '//', c: '//', cpp: '//',
  csharp: '//', kotlin: '//', swift: '//', php: '//', sql: '--', lua: '--',
};
function collectByClass(node, cls, out = []) {
  if (node.properties?.className?.includes?.(cls)) out.push(node);
  for (const child of node.children ?? []) collectByClass(child, cls, out);
  return out;
}
function outputBlocks() {
  return {
    name: 'output-blocks',
    hooks: {
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const prefix = COMMENT_PREFIX[codeBlock.language];
        if (!prefix) return;
        const texts = codeBlock.getLines().map((l) => l.text.trim());
        let start = texts.length;
        while (start > 0 && (texts[start - 1] === '' || texts[start - 1].startsWith(prefix))) start--;
        while (start < texts.length && texts[start] === '') start++;
        // needs real code above it, and at least one comment line below
        if (start === 0 || start >= texts.length) return;
        collectByClass(renderData.blockAst, 'ec-line').forEach((line, i) => {
          if (i < start) return;
          line.properties.className.push('ec-out');
          if (i === start) line.properties.className.push('ec-out-first');
        });
      },
    },
    baseStyles: `
      /* output area: a gap below the code, then a green bar and tint, a small label on the first line, muted text */
      .ec-line.ec-out { background: rgba(52, 168, 83, 0.07); box-shadow: inset 2px 0 0 rgba(52, 168, 83, 0.55); }
      .ec-line.ec-out span { color: #9bc7a4 !important; }
      .ec-line.ec-out-first { position: relative; margin-top: 0.75rem; }
      .ec-line.ec-out-first::after {
        content: 'output'; position: absolute; right: 10px; top: 3px;
        font: 600 0.625rem 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.06em;
        text-transform: uppercase; color: rgba(155, 199, 164, 0.55); pointer-events: none;
      }
    `,
  };
}

// In GitHub Actions, actions/configure-pages provides the real origin and base path.
// Locally we fall back to the project-site layout: https://<user>.github.io/workbench/
const site = process.env.SITE_ORIGIN || 'http://localhost:4321';
const base = process.env.SITE_BASE ?? '/workbench';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  // the chat loads katex lazily; listing it keeps the dev server from re-optimising it mid-session
  vite: { optimizeDeps: { include: ['katex'] } },
  // Content-Security-Policy as a <meta> tag (GitHub Pages cannot send headers). Scripts must be this site's own
  // or hashed, so injected script cannot run or read the chat key; requests may only go to this site and OpenRouter.
  security: {
    csp: {
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
      styleDirective: {
        resources: [
          "'self'",
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
          // KaTeX and code blocks set inline style attributes
          { resource: "'unsafe-inline'", kind: 'attribute' },
        ],
      },
      directives: [
        "default-src 'self'",
        "connect-src 'self' https://openrouter.ai",
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: false }], rehypeIgnoreMathml, rehypeInWords],
    }),
  },
  integrations: [
    expressiveCode({
      themes: ['github-dark-default'],
      // Code blocks get a header bar (language tab left, copy button right); shell blocks keep the terminal frame.
      plugins: [languageHeaders(), outputBlocks(), wrapToggle()],
      styleOverrides: {
        borderRadius: '12px',
        borderColor: '#262626',
        codeBackground: '#0b0b0b',
        codeFontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        codeFontSize: '0.875rem',
        frames: {
          editorBackground: '#0b0b0b',
          terminalBackground: '#0b0b0b',
          // the header is a lighter bar than the code, with the active tab underlined in the accent
          editorTabBarBackground: '#161616',
          editorActiveTabBackground: '#161616',
          editorActiveTabForeground: '#8ab4f8',
          editorActiveTabBorderColor: 'transparent',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabIndicatorBottomColor: '#8ab4f8',
          editorActiveTabIndicatorHeight: '2px',
          editorTabBarBorderBottomColor: '#262626',
          terminalTitlebarBackground: '#0b0b0b',
          terminalTitlebarBorderBottomColor: '#262626',
          frameBoxShadowCssValue: 'none',
        },
      },
    }),
    mdx(),
  ],
});
