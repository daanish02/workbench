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
          margin: 0 calc(1.75rem + 1.9rem) 0 auto; min-width: 0; padding-left: 1rem;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font: 0.6875rem 'JetBrains Mono', ui-monospace, monospace; color: #6e6e6e;
        }
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
      plugins: [languageHeaders()],
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
