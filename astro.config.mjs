// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Labels for the editor tab shown on code blocks without a title. Shell languages and plain
// text are left out: shell blocks render as a terminal, and text/diagram blocks need no label.
const LANGUAGE_LABELS = {
  python: 'Python', sql: 'SQL', typescript: 'TypeScript', ts: 'TypeScript', javascript: 'JavaScript', js: 'JavaScript',
  rust: 'Rust', kotlin: 'Kotlin', java: 'Java', go: 'Go', swift: 'Swift', ruby: 'Ruby', r: 'R', php: 'PHP',
  lua: 'Lua', json: 'JSON', yaml: 'YAML', cypher: 'Cypher', csharp: 'C#', cpp: 'C++', c: 'C', html: 'HTML', css: 'CSS',
};
function languageTabs() {
  return {
    name: 'language-tabs',
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        const label = LANGUAGE_LABELS[codeBlock.language];
        if (label && !codeBlock.props.title) codeBlock.props.title = label;
      },
    },
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
      // Code blocks get an editor tab naming their language; shell blocks keep the terminal frame.
      plugins: [languageTabs()],
      styleOverrides: {
        borderRadius: '12px',
        borderColor: '#262626',
        codeBackground: '#0b0b0b',
        codeFontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        codeFontSize: '0.875rem',
        frames: {
          editorBackground: '#0b0b0b',
          terminalBackground: '#0b0b0b',
          editorTabBarBackground: '#0b0b0b',
          editorActiveTabBackground: '#0b0b0b',
          editorActiveTabIndicatorTopColor: '#8ab4f8',
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
