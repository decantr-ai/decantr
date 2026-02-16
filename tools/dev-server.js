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

/**
 * @param {string} source
 * @returns {string}
 */
function rewriteImports(source) {
  return source.replace(
    /from\s+['"]decantr(?:\/([^'"]*))?\s*['"]/g,
    (match, subpath) => {
      const mod = subpath || 'core';
      return `from '/__decantr/${mod}/index.js'`;
    }
  );
}

/**
 * @param {string} projectRoot
 * @param {number} port
 */
export function startDevServer(projectRoot, port = 3000) {
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

    // Serve framework source files
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
      let content = await readFile(filePath, 'utf-8');
      const ext = extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';

      if (rewrite && ext === '.js') {
        content = rewriteImports(content);
      }

      if (injectHmr) {
        content = content.replace('</body>', `${HMR_CLIENT}\n</body>`);
      }

      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-store' });
      res.end(content);
    } catch (e) {
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

  // Watch src/ for changes
  try {
    watch(join(projectRoot, 'src'), { recursive: true }, (eventType, filename) => {
      console.log(`  [hmr] ${eventType}: ${filename}`);
      for (const client of sseClients) {
        client.write('data: {"type":"reload"}\n\n');
      }
    });
  } catch (e) {
    console.log('  [warn] File watching not available');
  }

  server.listen(port, () => {
    console.log(`\n  decantr dev server running at http://localhost:${port}\n`);
    console.log('  Watching src/ for changes...\n');
  });

  return server;
}
