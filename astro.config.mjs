// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Language names for the header tab of code blocks without a title. Shell languages and plain
// text are left out: shell blocks render as a terminal, and text/diagram blocks need no header.
const LANGUAGE_LABELS = {
  python: 'Python', sql: 'SQL', typescript: 'TypeScript', ts: 'TypeScript', javascript: 'JavaScript', js: 'JavaScript',
  rust: 'Rust', kotlin: 'Kotlin', java: 'Java', go: 'Go', swift: 'Swift', ruby: 'Ruby', r: 'R', php: 'PHP',
  lua: 'Lua', json: 'JSON', yaml: 'YAML', cypher: 'Cypher', csharp: 'C#', cpp: 'C++', c: 'C', html: 'HTML', css: 'CSS',
};
// Header height of a titled frame, from expressive-code: 1.9rem + 2 * (uiPaddingBlock 0.25rem + indicator 2px).
// The copy button (1.75rem) is centred in it, so it sits in the header instead of over the code.
const HEADER_COPY_SPACING = 'calc((1.9rem + 0.5rem + 4px - 1.75rem) / 2)';
function languageHeaders() {
  return {
    name: 'language-headers',
    hooks: {
      // a block's language becomes its header tab, the same look as a titled block
      preprocessMetadata: ({ codeBlock }) => {
        const label = LANGUAGE_LABELS[codeBlock.language];
        if (label && !codeBlock.props.title) codeBlock.props.title = label;
      },
    },
    baseStyles: `
      .frame.has-title:not(.is-terminal) {
        --button-spacing: ${HEADER_COPY_SPACING};
        & .title { font: 600 0.8125rem/1.9rem 'Inter', system-ui, sans-serif; padding-block: 0.25rem; }
        & .copy button { width: 1.75rem; height: 1.75rem; opacity: 0.75; background: transparent; }
        & .copy button:hover, & .copy button:focus-visible { opacity: 1; }
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
  markdown: {
    processor: unified(),
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: false }]],
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
