/**
 * Template utilities for the blueprint scaffolder.
 * Extracted from cli/templates/shared.js + new blueprint-specific helpers.
 */

const THEME_CSS = {
  'light': ':root{--c0:#ffffff;--c1:#1366D9;--c2:#f8fafc;--c3:#020817;--c4:#606D80;--c5:#DDE3ED;--c6:#0f52b5;--c7:#22c55e;--c8:#f59e0b;--c9:#ef4444;--d-radius:8px;--d-radius-lg:16px;--d-shadow:none;--d-transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}',
  'dark': ':root{--c0:#1F1F1F;--c1:#0078D4;--c2:#181818;--c3:#CCCCCC;--c4:#858585;--c5:#3C3C3C;--c6:#026EC1;--c7:#2EA043;--c8:#CCA700;--c9:#F85149;--d-radius:4px;--d-radius-lg:6px;--d-shadow:none;--d-transition:all 0.15s ease}',
  'retro': ':root{--c0:#fffef5;--c1:#e63946;--c2:#fff8e7;--c3:#1a1a1a;--c4:#6b7280;--c5:#1a1a1a;--c6:#c1121f;--c7:#2d6a4f;--c8:#f77f00;--c9:#d00000;--d-radius:4px;--d-radius-lg:4px;--d-shadow:4px 4px 0 #1a1a1a;--d-transition:all 0.1s ease}',
  'hot-lava': ':root{--c0:#050810;--c1:#ff4d4d;--c2:#0a0f1a;--c3:#f0f4ff;--c4:#8892b0;--c5:rgba(136,146,176,0.15);--c6:#e63946;--c7:#00e5cc;--c8:#fbbf24;--c9:#ef4444;--d-radius:12px;--d-radius-lg:16px;--d-shadow:0 4px 24px rgba(255,77,77,0.15),0 2px 8px rgba(0,0,0,0.3);--d-transition:all 0.3s cubic-bezier(0.22,1,0.36,1)}',
  'stormy-ai': ':root{--c0:#0a0c10;--c1:#38bdf8;--c2:#111318;--c3:#c5d3e8;--c4:#6b7a94;--c5:#252a33;--c6:#7dd3fc;--c7:#4ade80;--c8:#fbbf24;--c9:#ef4444;--d-radius:12px;--d-radius-lg:16px;--d-shadow:0 8px 32px rgba(0,0,0,0.3);--d-transition:all 0.25s cubic-bezier(0.4,0,0.2,1)}'
};

const ICON_MAP = {
  home: { material: 'home', lucide: 'home' },
  dashboard: { material: 'dashboard', lucide: 'layout-dashboard' },
  table: { material: 'table_chart', lucide: 'table' },
  settings: { material: 'settings', lucide: 'settings' },
  bell: { material: 'notifications', lucide: 'bell' },
  user: { material: 'person', lucide: 'user' },
  'trending-up': { material: 'trending_up', lucide: 'trending-up' },
  'trending-down': { material: 'trending_down', lucide: 'trending-down' },
  users: { material: 'group', lucide: 'users' },
  dollar: { material: 'attach_money', lucide: 'dollar-sign' },
  activity: { material: 'show_chart', lucide: 'activity' },
  chart: { material: 'bar_chart', lucide: 'bar-chart-3' },
  search: { material: 'search', lucide: 'search' },
  edit: { material: 'edit', lucide: 'pencil' },
  delete: { material: 'delete', lucide: 'trash-2' },
  'user-plus': { material: 'person_add', lucide: 'user-plus' },
  save: { material: 'save', lucide: 'save' },
  bolt: { material: 'bolt', lucide: 'zap' },
  package: { material: 'inventory_2', lucide: 'package' },
  bot: { material: 'smart_toy', lucide: 'bot' },
  compress: { material: 'compress', lucide: 'minimize-2' },
  palette: { material: 'palette', lucide: 'palette' },
  flask: { material: 'science', lucide: 'flask-conical' },
  code: { material: 'code', lucide: 'code' },
  check: { material: 'check', lucide: 'check' },
  star: { material: 'star', lucide: 'star' },
  shield: { material: 'shield', lucide: 'shield' },
  mail: { material: 'mail', lucide: 'mail' },
  lock: { material: 'lock', lucide: 'lock' },
  alert: { material: 'warning', lucide: 'alert-triangle' },
  github: { material: 'code', lucide: 'github' },
  linkedin: { material: 'business_center', lucide: 'linkedin' },
  'external-link': { material: 'open_in_new', lucide: 'external-link' },
  briefcase: { material: 'work', lucide: 'briefcase' },
  'map-pin': { material: 'location_on', lucide: 'map-pin' },
  clock: { material: 'schedule', lucide: 'clock' },
  camera: { material: 'photo_camera', lucide: 'camera' },
  coffee: { material: 'coffee', lucide: 'coffee' },
  award: { material: 'emoji_events', lucide: 'award' },
  cpu: { material: 'memory', lucide: 'cpu' },
  brain: { material: 'psychology', lucide: 'brain' },
  globe: { material: 'language', lucide: 'globe' },
  layers: { material: 'layers', lucide: 'layers' },
  terminal: { material: 'terminal', lucide: 'terminal' },
  database: { material: 'storage', lucide: 'database' },
  cloud: { material: 'cloud', lucide: 'cloud' },
  server: { material: 'dns', lucide: 'server' },
  monitor: { material: 'monitor', lucide: 'monitor' },
  grid: { material: 'grid_view', lucide: 'grid-3x3' },
  target: { material: 'gps_fixed', lucide: 'target' },
  heart: { material: 'favorite', lucide: 'heart' },
  image: { material: 'image', lucide: 'image' },
  sparkles: { material: 'auto_awesome', lucide: 'sparkles' },
  handshake: { material: 'handshake', lucide: 'handshake' },
  workflow: { material: 'account_tree', lucide: 'workflow' },
  'message-square': { material: 'chat', lucide: 'message-square' }
};

export function iconName(semantic, opts) {
  if (!opts || !opts.icons) return null;
  const entry = ICON_MAP[semantic];
  return entry ? entry[opts.icons] : null;
}

export function iconExpr(semantic, opts, props = {}) {
  const name = iconName(semantic, opts);
  if (!name) return '';
  const propsEntries = Object.entries({ size: '1em', 'aria-hidden': 'true', ...props });
  const propsStr = propsEntries.map(([k, v]) => `'${k}': '${v}'`).join(', ');
  return `icon('${name}', { ${propsStr} })`;
}

export function iconImport(opts) {
  if (!opts || !opts.icons) return '';
  return "import { icon } from 'decantr/components';\n";
}

export function packageJson(name, opts = {}) {
  const scripts = {
    dev: 'decantr dev',
    build: 'decantr build',
    test: 'decantr test'
  };
  const dependencies = { decantr: '^0.3.0' };

  if (opts.iconDelivery === 'npm') {
    scripts.postinstall = 'node scripts/vendor-icons.js';
    if (opts.icons === 'lucide') dependencies.lucide = '^0.474.0';
    if (opts.icons === 'material') dependencies['material-icons'] = '^1.13.12';
  }

  return JSON.stringify({ name, version: '0.1.0', type: 'module', scripts, dependencies }, null, 2);
}

export function configJson(opts) {
  const config = {
    $schema: 'https://decantr.ai/schemas/config.v2.json',
    name: opts.name,
    theme: opts.theme,
    router: opts.router,
    blueprint: opts.blueprintId || null,
    scaffolded: true,
    dev: { port: opts.port || 4200 },
    build: { outDir: 'dist' }
  };
  if (opts.icons) {
    config.icons = { library: opts.icons, delivery: opts.iconDelivery };
  }
  return JSON.stringify(config, null, 2);
}

export function indexHtml(opts) {
  const themeCSS = THEME_CSS[opts.theme] || THEME_CSS.light;
  let iconLink = '';
  if (opts.icons === 'material' && opts.iconDelivery === 'cdn') {
    iconLink = '\n  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" data-icons="material">';
  } else if (opts.icons === 'material' && opts.iconDelivery === 'npm') {
    iconLink = '\n  <link href="./vendor/material-icons/material-icons.css" rel="stylesheet" data-icons="material">';
  } else if (opts.icons === 'lucide' && opts.iconDelivery === 'cdn') {
    iconLink = '\n  <script src="https://unpkg.com/lucide@0.474.0/dist/umd/lucide.js" data-icons="lucide"></script>';
  } else if (opts.icons === 'lucide' && opts.iconDelivery === 'npm') {
    iconLink = '\n  <script src="./vendor/lucide.min.js" data-icons="lucide"></script>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.name}</title>${iconLink}
  <style>${themeCSS}*{margin:0;box-sizing:border-box}body{font-family:Inter,"Inter Fallback",system-ui,sans-serif;color:var(--c3);background:var(--c0);min-height:100vh}a{color:var(--c1);text-decoration:none}a:hover{color:var(--c6)}</style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./src/app.js"></script>
</body>
</html>`;
}

export function manifest(opts) {
  return JSON.stringify({
    $schema: 'https://decantr.ai/schemas/manifest.v2.json',
    version: '0.3.0',
    name: opts.name,
    blueprint: opts.blueprintId || null,
    theme: opts.theme,
    router: opts.router,
    entrypoint: 'src/app.js',
    shell: 'public/index.html',
    mountTarget: '#app'
  }, null, 2);
}

export function claudeMd(opts, blueprint) {
  const kits = (blueprint && blueprint.kits) || [];
  const kitImports = kits.map(k => `- \`import { ... } from 'decantr/kit/${k}'\``).join('\n');

  return `# ${opts.name}

Built with [decantr](https://decantr.ai) v0.3.0 — AI-first web framework.
Blueprint: ${opts.blueprintId || 'custom'}

## Project Structure

- \`src/app.js\` — Entry point, mounts the app to \`#app\`
- \`src/pages/\` — Route page components
- \`src/components/\` — Project-specific reusable components
- \`public/index.html\` — HTML shell with theme CSS variables
- \`decantr.config.json\` — Project configuration

## Framework Imports

\`\`\`js
import { tags } from 'decantr/tags';
import { h, text, cond, list, mount } from 'decantr/core';
import { createSignal, createEffect, createMemo, batch } from 'decantr/state';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { css, setTheme } from 'decantr/css';
import { Button, Input, Card, ... } from 'decantr/components';
\`\`\`

## Kit Imports
${kitImports}

## Theme: ${opts.theme}
Colors: \`--c0\` (bg) through \`--c9\` (destructive). Switch: \`setTheme('dark')\`

## Commands
- \`npx decantr dev\` — Dev server with hot reload
- \`npx decantr build\` — Production build to \`dist/\`
- \`npx decantr test\` — Run tests
`;
}

export function vendorIconsJs(opts) {
  if (opts.icons === 'lucide') {
    return `import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'node_modules', 'lucide', 'dist', 'umd', 'lucide.min.js');
const dest = join(root, 'public', 'vendor', 'lucide.min.js');

if (!existsSync(src)) {
  console.log('lucide not found in node_modules — skipping vendor copy');
  process.exit(0);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log('Copied lucide.min.js to public/vendor/');
`;
  }

  if (opts.icons === 'material') {
    return `import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, 'node_modules', 'material-icons', 'iconfont');
const destDir = join(root, 'public', 'vendor', 'material-icons');

if (!existsSync(srcDir)) {
  console.log('material-icons not found in node_modules — skipping vendor copy');
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

const files = readdirSync(srcDir).filter(f =>
  f.endsWith('.css') || f.endsWith('.woff') || f.endsWith('.woff2')
);
for (const f of files) {
  copyFileSync(join(srcDir, f), join(destDir, f));
}
console.log(\\\`Copied \\\${files.length} material-icons files to public/vendor/material-icons/\\\`);
`;
  }

  return '';
}

export { THEME_CSS, ICON_MAP };
