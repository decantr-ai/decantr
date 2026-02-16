/**
 * Shared template generators for all project types.
 */

const THEME_CSS = {
  light: ':root{--c0:#ffffff;--c1:#3b82f6;--c2:#f8fafc;--c3:#0f172a;--c4:#64748b;--c5:#e2e8f0;--c6:#2563eb;--c7:#22c55e;--c8:#f59e0b;--c9:#ef4444}',
  dark: ':root{--c0:#0f172a;--c1:#3b82f6;--c2:#1e293b;--c3:#f1f5f9;--c4:#94a3b8;--c5:#334155;--c6:#60a5fa;--c7:#4ade80;--c8:#fbbf24;--c9:#f87171}',
  ai: ':root{--c0:#0a0a1a;--c1:#8b5cf6;--c2:#1a1a2e;--c3:#e0e7ff;--c4:#818cf8;--c5:#312e81;--c6:#a78bfa;--c7:#34d399;--c8:#fbbf24;--c9:#f472b6}',
  nature: ':root{--c0:#fefce8;--c1:#16a34a;--c2:#f0fdf4;--c3:#1a2e05;--c4:#4d7c0f;--c5:#d9f99d;--c6:#15803d;--c7:#22c55e;--c8:#eab308;--c9:#dc2626}',
  pastel: ':root{--c0:#fdf2f8;--c1:#ec4899;--c2:#fce7f3;--c3:#831843;--c4:#be185d;--c5:#fbcfe8;--c6:#db2777;--c7:#86efac;--c8:#fde68a;--c9:#fca5a5}',
  spice: ':root{--c0:#1c1917;--c1:#ea580c;--c2:#292524;--c3:#fef3c7;--c4:#d97706;--c5:#44403c;--c6:#f97316;--c7:#4ade80;--c8:#fbbf24;--c9:#ef4444}',
  mono: ':root{--c0:#ffffff;--c1:#171717;--c2:#f5f5f5;--c3:#171717;--c4:#737373;--c5:#d4d4d4;--c6:#404040;--c7:#525252;--c8:#737373;--c9:#a3a3a3}'
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
      decantr: '^0.2.0'
    }
  }, null, 2);
}

export function configJson(opts) {
  const config = {
    $schema: 'https://decantr.ai/schemas/config.v2.json',
    name: opts.name,
    projectType: opts.projectType,
    theme: opts.theme,
    style: opts.style,
    router: opts.router,
    dev: { port: opts.port },
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
  } else if (opts.icons === 'lucide' && opts.iconDelivery === 'cdn') {
    iconLink = '\n  <script src="https://unpkg.com/lucide@latest" data-icons="lucide"></script>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${opts.name}</title>${iconLink}
  <style>${themeCSS}*{margin:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;color:var(--c3);background:var(--c0);min-height:100vh}a{color:var(--c1);text-decoration:none}a:hover{color:var(--c6)}</style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app.js"></script>
</body>
</html>`;
}

export function manifest(opts) {
  return JSON.stringify({
    $schema: 'https://decantr.ai/schemas/manifest.v2.json',
    version: '0.2.0',
    name: opts.name,
    projectType: opts.projectType,
    theme: opts.theme,
    style: opts.style,
    router: opts.router,
    entrypoint: 'src/app.js',
    shell: 'public/index.html',
    mountTarget: '#app'
  }, null, 2);
}
