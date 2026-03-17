import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, watch } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkSrc = resolve(__dirname, '..', 'src');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const HMR_CLIENT = `<script>
(function(){
  const es = new EventSource('/__decantr_hmr');
  es.onmessage = function(e) {
    const d = JSON.parse(e.data);
    if (d.type === 'reload') { location.reload(); return; }
    if (d.type === 'hmr') {
      import(d.module + '?t=' + Date.now()).then(function(mod) {
        if (window.__d_hmr_remount) {
          window.__d_hmr_remount(d.module, mod);
        } else {
          location.reload();
        }
      }).catch(function() { location.reload(); });
    }
  };
  es.onerror = function() { setTimeout(function() { location.reload(); }, 1000); };
})();
</script>`;

/** Legacy aliases not in package.json exports */
const LEGACY_ALIASES = {
  'themes': 'css/theme-registry.js',
  'styles': 'css/theme-registry.js'
};

/**
 * Build the browser import map dynamically from package.json exports.
 * Runs once at startup — uses sync read intentionally.
 */
function buildImportMap(packageJsonPath) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const entries = {};
  for (const [key, value] of Object.entries(pkg.exports || {})) {
    const specifier = key === '.' ? 'decantr' : `decantr/${key.slice(2)}`;
    const resolved = value.replace(/^\.\/src\//, '/__decantr/');
    entries[specifier] = resolved;
  }
  // Legacy convenience aliases
  for (const [alias, target] of Object.entries(LEGACY_ALIASES)) {
    entries[`decantr/${alias}`] = `/__decantr/${target}`;
  }
  // Catch-all prefix for sub-paths not in exports (explorer/*, etc.)
  entries['decantr/'] = '/__decantr/';
  return entries;
}

const IMPORT_MAP_ENTRIES = buildImportMap(resolve(__dirname, '..', 'package.json'));

/**
 * Generate a browser-native import map script tag.
 * @returns {string}
 */
function generateImportMapTag() {
  return `<script type="importmap">${JSON.stringify({ imports: IMPORT_MAP_ENTRIES })}</script>`;
}

/**
 * Fallback: regex-based import rewriting for JS files not covered by import map
 * (e.g. sub-module imports like decantr/css/themes/light).
 * @param {string} source
 * @returns {string}
 */
function rewriteImports(source) {
  return source.replace(
    /(from\s+|import\s*\()['"]decantr(?:\/([^'"]*))?\s*['"]/g,
    (match, prefix, subpath) => {
      const mod = subpath || 'core';
      const mapped = LEGACY_ALIASES[mod];
      const quote = prefix.startsWith('import') ? "'" : "'";
      const suffix = prefix.startsWith('import') ? "'" : "'";
      let resolved;
      if (mapped) resolved = `/__decantr/${mapped}`;
      else if (mod.endsWith('.js')) resolved = `/__decantr/${mod}`;
      else resolved = `/__decantr/${mod}/index.js`;
      return `${prefix}${quote}${resolved}${suffix}`;
    }
  );
}

/**
 * @param {string} projectRoot
 * @param {number} port
 */
export function startDevServer(projectRoot, port = 3000, options = {}) {
  /** @type {Set<import('node:http').ServerResponse>} */
  const sseClients = new Set();

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    let pathname = url.pathname;

    // SSE endpoint
    if (pathname === '/__decantr_hmr') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write('data: {"type":"connected"}\n\n');
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    // Serve project essence file
    if (pathname === '/__decantr/essence') {
      const essencePath = join(projectRoot, 'decantr.essence.json');
      return serveFile(essencePath, res, false);
    }

    // Serve registry JSON files (no import rewriting — data, not modules)
    if (pathname.startsWith('/__decantr/registry/')) {
      const registryPath = pathname.slice('/__decantr/registry/'.length);
      const filePath = join(frameworkSrc, 'registry', registryPath);
      return serveFile(filePath, res, false);
    }

    // Serve framework source files (kit, components, etc.)
    if (pathname.startsWith('/__decantr/')) {
      const modPath = pathname.slice('/__decantr/'.length);
      let filePath = join(frameworkSrc, modPath);
      try {
        const s = await stat(filePath);
        if (s.isDirectory()) filePath = join(filePath, 'index.js');
      } catch {}
      return serveFile(filePath, res, true);
    }

    // Try public/ first, then src/
    if (pathname === '/') pathname = '/index.html';

    const publicPath = join(projectRoot, 'public', pathname);
    const srcPath = join(projectRoot, pathname.startsWith('/src/') ? pathname : `src/${pathname}`);

    // Try public first
    if (await fileExists(publicPath)) {
      return serveFile(publicPath, res, false, pathname.endsWith('.html'));
    }

    // Try src
    if (pathname.startsWith('/src/') && await fileExists(join(projectRoot, pathname))) {
      return serveFile(join(projectRoot, pathname), res, true);
    }

    // SPA fallback: serve index.html for non-file routes
    if (!extname(pathname)) {
      const indexPath = join(projectRoot, 'public', 'index.html');
      if (await fileExists(indexPath)) {
        return serveFile(indexPath, res, false, true);
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  async function serveFile(filePath, res, rewrite = false, injectHmr = false) {
    try {
      const ext = extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      const isText = ext === '.js' || ext === '.mjs' || ext === '.css' || ext === '.html' || ext === '.json' || ext === '.svg';

      if (!isText) {
        const buf = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
        res.end(buf);
        return;
      }

      let content = await readFile(filePath, 'utf-8');

      if (rewrite && ext === '.js') {
        content = rewriteImports(content);
      }

      if (injectHmr) {
        // Inject import map before first <script> tag, and HMR client before </body>
        content = content.replace('<head>', `<head>\n<script>globalThis.__DECANTR_DEV__=true</script>\n${generateImportMapTag()}`);
        content = content.replace('</body>', `${HMR_CLIENT}\n</body>`);
      }

      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
      res.end(content);
    } catch (e) {
      const rel = filePath.startsWith(projectRoot) ? filePath.slice(projectRoot.length + 1) : filePath;
      console.error(`  [error] Failed to serve ${rel}: ${e.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  }

  async function fileExists(path) {
    try {
      const s = await stat(path);
      return s.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Classify a file change into an HMR message.
   * Page/component modules get component-level HMR; everything else triggers full reload.
   * @param {string} filename — relative path within watched directory (e.g. "pages/home.js")
   * @param {string} watchBase — "src" or other base prefix for the module path
   * @returns {{ type: string, module?: string }}
   */
  function classifyChange(filename, watchBase) {
    if (!filename) return { type: 'reload' };
    const normalized = filename.replace(/\\/g, '/');

    // Full reload triggers: state, css, router, app entry, essence
    if (
      normalized.startsWith('state/') ||
      normalized.startsWith('css/') ||
      normalized.startsWith('router/') ||
      normalized === 'app.js'
    ) {
      return { type: 'reload' };
    }

    // Component-level HMR for pages and project components
    if (normalized.startsWith('pages/') || normalized.startsWith('components/')) {
      return { type: 'hmr', module: `/${watchBase}/${normalized}` };
    }

    // Safe default: full reload
    return { type: 'reload' };
  }

  // Watch src/ and any extra watchDirs for changes
  const watchDirs = [join(projectRoot, 'src'), ...(options.watchDirs || [])];
  for (const dir of watchDirs) {
    try {
      const watchBase = dir === join(projectRoot, 'src') ? 'src' : dir.slice(projectRoot.length + 1);
      watch(dir, { recursive: true }, (eventType, filename) => {
        const msg = classifyChange(filename, watchBase);
        console.log(`  [hmr] ${eventType}: ${filename} → ${msg.type}`);
        const payload = JSON.stringify(msg);
        for (const client of sseClients) {
          client.write(`data: ${payload}\n\n`);
        }
      });
    } catch (e) {
      console.log(`  [warn] File watching not available for ${dir}`);
    }
  }

  // Watch essence file
  try {
    watch(join(projectRoot, 'decantr.essence.json'), (eventType) => {
      console.log(`  [hmr] ${eventType}: decantr.essence.json`);
      for (const client of sseClients) {
        client.write('data: {"type":"reload"}\n\n');
      }
    });
  } catch {}

  // Log config info at startup
  readFile(join(projectRoot, 'decantr.config.json'), 'utf-8').then(raw => {
    try {
      const cfg = JSON.parse(raw);
      console.log(`  Config: decantr.config.json (theme: ${cfg.theme || 'default'}, router: ${cfg.router || 'hash'}, port: ${port})`);
    } catch { console.log('  [warn] decantr.config.json found but could not be parsed'); }
  }).catch(() => {
    console.log(`  Config: no decantr.config.json found, using defaults (port: ${port})`);
  });

  // Check essence file
  readFile(join(projectRoot, 'decantr.essence.json'), 'utf-8').then(raw => {
    try {
      const essence = JSON.parse(raw);
      if (!essence.terroir && !essence.sections) {
        console.log('  ⚠ Essence exists but terroir is unset. Complete the CLARIFY stage.');
      } else {
        const mode = essence.sections ? `sectioned (${essence.sections.length} sections)` : essence.terroir;
        console.log(`  Essence: ${mode}`);
      }
    } catch { console.log('  [warn] decantr.essence.json found but could not be parsed'); }
  }).catch(() => {
    console.log('  ⚠ No decantr.essence.json found. Run the CLARIFY stage to create your project essence.');
  });

  server.listen(port, () => {
    console.log(`\n  decantr dev server running at http://localhost:${port}\n`);
    console.log('  Watching src/ for changes...\n');
  });

  return server;
}
