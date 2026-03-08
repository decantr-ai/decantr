import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
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
    if (d.type === 'reload') location.reload();
  };
  es.onerror = function() { setTimeout(() => location.reload(), 1000); };
})();
</script>`;

const SPECIFIER_MAP = {
  'themes': 'css/theme-registry.js',
  'styles': 'css/theme-registry.js'
};

/** Standard module specifiers for the import map */
const IMPORT_MAP_ENTRIES = {
  'decantr': '/__decantr/core/index.js',
  'decantr/core': '/__decantr/core/index.js',
  'decantr/state': '/__decantr/state/index.js',
  'decantr/css': '/__decantr/css/index.js',
  'decantr/tags': '/__decantr/tags/index.js',
  'decantr/router': '/__decantr/router/index.js',
  'decantr/components': '/__decantr/components/index.js',
  'decantr/test': '/__decantr/test/index.js',
  'decantr/themes': '/__decantr/css/theme-registry.js',
  'decantr/styles': '/__decantr/css/theme-registry.js',
  'decantr/kit/dashboard': '/__decantr/kit/dashboard/index.js',
  'decantr/kit/auth': '/__decantr/kit/auth/index.js',
  'decantr/kit/content': '/__decantr/kit/content/index.js',
  'decantr/chart': '/__decantr/chart/index.js'
};

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
    /from\s+['"]decantr(?:\/([^'"]*))?\s*['"]/g,
    (match, subpath) => {
      const mod = subpath || 'core';
      const mapped = SPECIFIER_MAP[mod];
      if (mapped) return `from '/__decantr/${mapped}'`;
      // Kit imports: decantr/kit/dashboard → /__decantr/kit/dashboard/index.js
      if (mod.startsWith('kit/')) return `from '/__decantr/${mod}/index.js'`;
      return `from '/__decantr/${mod}/index.js'`;
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

    // Serve framework source files (kit, components, etc.)
    if (pathname.startsWith('/__decantr/')) {
      const modPath = pathname.slice('/__decantr/'.length);
      const filePath = join(frameworkSrc, modPath);
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
        content = content.replace('<head>', `<head>\n${generateImportMapTag()}`);
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

  // Watch src/ and any extra watchDirs for changes
  const watchDirs = [join(projectRoot, 'src'), ...(options.watchDirs || [])];
  for (const dir of watchDirs) {
    try {
      watch(dir, { recursive: true }, (eventType, filename) => {
        console.log(`  [hmr] ${eventType}: ${filename}`);
        for (const client of sseClients) {
          client.write('data: {"type":"reload"}\n\n');
        }
      });
    } catch (e) {
      console.log(`  [warn] File watching not available for ${dir}`);
    }
  }

  // Log config info at startup
  readFile(join(projectRoot, 'decantr.config.json'), 'utf-8').then(raw => {
    try {
      const cfg = JSON.parse(raw);
      console.log(`  Config: decantr.config.json (theme: ${cfg.theme || 'default'}, router: ${cfg.router || 'hash'}, port: ${port})`);
    } catch { console.log('  [warn] decantr.config.json found but could not be parsed'); }
  }).catch(() => {
    console.log(`  Config: no decantr.config.json found, using defaults (port: ${port})`);
  });

  server.listen(port, () => {
    console.log(`\n  decantr dev server running at http://localhost:${port}\n`);
    console.log('  Watching src/ for changes...\n');
  });

  return server;
}
