/**
 * Template utilities for `decantr init`.
 * Generates the minimal project skeleton files.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkRoot = resolve(__dirname, '..');

export const THEME_CSS = {
  'light': ':root{--c0:#ffffff;--c1:#1366D9;--c2:#f8fafc;--c3:#020817;--c4:#606D80;--c5:#DDE3ED;--c6:#0f52b5;--c7:#22c55e;--c8:#f59e0b;--c9:#ef4444;--d-radius:8px;--d-radius-lg:16px;--d-shadow:none;--d-transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}',
  'dark': ':root{--c0:#1F1F1F;--c1:#0078D4;--c2:#181818;--c3:#CCCCCC;--c4:#858585;--c5:#3C3C3C;--c6:#026EC1;--c7:#2EA043;--c8:#CCA700;--c9:#F85149;--d-radius:4px;--d-radius-lg:6px;--d-shadow:none;--d-transition:all 0.15s ease}',
  'retro': ':root{--c0:#fffef5;--c1:#e63946;--c2:#fff8e7;--c3:#1a1a1a;--c4:#6b7280;--c5:#1a1a1a;--c6:#c1121f;--c7:#2d6a4f;--c8:#f77f00;--c9:#d00000;--d-radius:4px;--d-radius-lg:4px;--d-shadow:4px 4px 0 #1a1a1a;--d-transition:all 0.1s ease}',
  'hot-lava': ':root{--c0:#050810;--c1:#ff4d4d;--c2:#0a0f1a;--c3:#f0f4ff;--c4:#8892b0;--c5:rgba(136,146,176,0.15);--c6:#e63946;--c7:#00e5cc;--c8:#fbbf24;--c9:#ef4444;--d-radius:12px;--d-radius-lg:16px;--d-shadow:0 4px 24px rgba(255,77,77,0.15),0 2px 8px rgba(0,0,0,0.3);--d-transition:all 0.3s cubic-bezier(0.22,1,0.36,1)}',
  'stormy-ai': ':root{--c0:#0a0c10;--c1:#38bdf8;--c2:#111318;--c3:#c5d3e8;--c4:#6b7a94;--c5:#252a33;--c6:#7dd3fc;--c7:#4ade80;--c8:#fbbf24;--c9:#ef4444;--d-radius:12px;--d-radius-lg:16px;--d-shadow:0 8px 32px rgba(0,0,0,0.3);--d-transition:all 0.25s cubic-bezier(0.4,0,0.2,1)}'
};

export function packageJson(name) {
  return JSON.stringify({
    name,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'decantr dev',
      build: 'decantr build',
      test: 'decantr test'
    },
    dependencies: {
      decantr: '^0.3.0'
    }
  }, null, 2);
}

export function configJson(name) {
  return JSON.stringify({
    $schema: 'https://decantr.ai/schemas/config.v2.json',
    name,
    theme: 'light',
    router: 'hash',
    dev: { port: 4200 },
    build: { outDir: 'dist' }
  }, null, 2);
}

export function indexHtml(name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${name}</title>
  <style>${THEME_CSS.light}*{margin:0;box-sizing:border-box}body{font-family:Inter,"Inter Fallback",system-ui,sans-serif;color:var(--c3);background:var(--c0);min-height:100vh}a{color:var(--c1);text-decoration:none}a:hover{color:var(--c6)}</style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app.js"></script>
</body>
</html>`;
}

export function manifestJson(name) {
  return JSON.stringify({
    $schema: 'https://decantr.ai/schemas/manifest.v2.json',
    version: '0.3.0',
    name,
    entrypoint: 'src/app.js',
    shell: 'public/index.html',
    mountTarget: '#app'
  }, null, 2);
}

export function claudeMd(name) {
  return `# ${name}

Built with [decantr](https://decantr.ai) v0.3.0 — AI-first web framework.

## Project Structure

- \`src/app.js\` — Entry point, mounts the app to \`#app\`
- \`src/pages/\` — Route page components
- \`src/components/\` — Project-specific reusable components
- \`public/index.html\` — HTML shell with theme CSS variables
- \`decantr.config.json\` — Project configuration
- \`AGENTS.md\` — Framework translation layer (read this for API equivalences)

## Framework Imports

\`\`\`js
import { tags } from 'decantr/tags';
import { h, text, cond, list, mount, onMount, onDestroy } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore, batch } from 'decantr/state';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { css, setTheme } from 'decantr/css';
import { Button, Input, Card, Modal, Tabs, ... } from 'decantr/components';
\`\`\`

## Kit Imports

- \`import { ... } from 'decantr/kit/dashboard'\`
- \`import { ... } from 'decantr/kit/auth'\`
- \`import { ... } from 'decantr/kit/content'\`

## Theme: light

Colors: \`--c0\` (bg) through \`--c9\` (destructive). Switch: \`setTheme('dark')\`
Available: light, dark, retro, hot-lava, stormy-ai

## Commands

- \`npx decantr dev\` — Dev server with hot reload
- \`npx decantr build\` — Production build to \`dist/\`
- \`npx decantr test\` — Run tests
`;
}

export function appJs() {
  return `import { mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { css, setTheme } from 'decantr/css';

const { div, h1, p } = tags;

setTheme('light');

const app = div({ class: css('_flex _col _center _minhscreen _bg0') },
  h1({ class: css('_t24 _bold _fg3') }, 'Welcome to My App'),
  p({ class: css('_t14 _fg4 _mt2') }, 'Start building by prompting your AI.')
);

mount(document.getElementById('app'), () => app);
`;
}

export async function agentsMd() {
  return readFile(join(frameworkRoot, 'AGENTS.md'), 'utf-8');
}
