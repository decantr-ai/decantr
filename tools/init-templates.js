/**
 * Template utilities for `decantr init`.
 * Generates the minimal project skeleton files.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkRoot = resolve(__dirname, '..');

/** Minimal CSS custom properties for initial page render (before JS hydrates the full token set) */
export const THEME_CSS = {
  'light': ':root{--d-bg:#ffffff;--d-fg:#09090b;--d-primary:#1366D9;--d-primary-hover:#0f52b5;--d-muted:#71717a;--d-border:#e4e4e7;--d-surface-1:#f8fafc;--d-error:#ef4444;--d-success:#22c55e;--d-warning:#f59e0b;--d-overlay:rgba(0,0,0,0.5);--d-radius:8px;--d-radius-lg:12px;--d-font:Inter,"Inter Fallback",system-ui,sans-serif;--c0:#ffffff;--c1:#1366D9;--c2:#f8fafc;--c3:#09090b;--c4:#71717a;--c5:#e4e4e7;--c6:#0f52b5;--c7:#22c55e;--c8:#f59e0b;--c9:#ef4444}',
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
    style: 'clean',
    mode: 'auto',
    router: 'hash',
    dev: { port: 4200 },
    build: {
      outDir: 'dist',
      sourcemap: true,
      treeShake: true,
      codeSplit: true,
      purgeCSS: true,
      incremental: true,
      analyze: true
    }
  }, null, 2);
}

export function indexHtml(name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${name}</title>
  <style>${THEME_CSS.light}*{margin:0;box-sizing:border-box}body{font-family:var(--d-font);color:var(--d-fg);background:var(--d-bg);min-height:100vh}a{color:var(--d-primary);text-decoration:none}a:hover{color:var(--d-primary-hover)}</style>
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

## Application Architect

For multi-page apps, consult the architect registry before generating code:
- \`node_modules/decantr/src/registry/architect/index.json\` — available domains
- See AGENTS.md § Application Architect for the full algorithm

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
