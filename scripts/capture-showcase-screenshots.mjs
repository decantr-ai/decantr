import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SHOWCASE_DIR = join(ROOT, 'apps', 'showcase');
const OUTPUT_DIR = join(ROOT, 'apps', 'registry', 'public', 'showcase');

const FULL_WIDTH = 1280;
const FULL_HEIGHT = 800;
const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 400;
const NAV_TIMEOUT = 15_000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/**
 * Spin up a static file server for a given directory.
 * Returns { url, close } where close() shuts down the server.
 */
function serveStatic(dir, port, basePath = '/') {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      // Strip the Vite base path prefix so /showcase/slug/assets/... maps to dist/assets/...
      if (basePath !== '/' && urlPath.startsWith(basePath)) {
        urlPath = urlPath.slice(basePath.length) || '/';
      }
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = join(dir, urlPath);

      try {
        if (!existsSync(filePath)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const data = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      } catch {
        res.writeHead(500);
        res.end('Server error');
      }
    });

    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

/**
 * Find an available port starting from basePort.
 */
let nextPort = 9200;
function getPort() {
  return nextPort++;
}

async function main() {
  const entries = readdirSync(SHOWCASE_DIR, { withFileTypes: true });
  const showcases = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => {
      const distIndex = join(SHOWCASE_DIR, name, 'dist', 'index.html');
      return existsSync(distIndex);
    })
    .sort();

  if (showcases.length === 0) {
    console.log('No showcase apps with dist/index.html found. Nothing to capture.');
    return;
  }

  console.log(`Found ${showcases.length} showcase app(s) to capture.\n`);

  const browser = await chromium.launch({ headless: true });
  let captured = 0;
  let skipped = 0;

  for (const slug of showcases) {
    const distDir = join(SHOWCASE_DIR, slug, 'dist');
    const outDir = join(OUTPUT_DIR, slug);

    let server;
    try {
      // Ensure output directory exists
      mkdirSync(outDir, { recursive: true });

      // Detect Vite base path from the built index.html
      const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
      const baseMatch = indexHtml.match(/src="(\/[^"]*?)assets\//);
      const basePath = baseMatch ? baseMatch[1] : '/';

      // Start static server with base path stripping
      const port = getPort();
      server = await serveStatic(distDir, port, basePath);

      // Full-size screenshot
      const page = await browser.newPage();
      await page.setViewportSize({ width: FULL_WIDTH, height: FULL_HEIGHT });
      await page.goto(server.url, {
        waitUntil: 'networkidle',
        timeout: NAV_TIMEOUT,
      });

      // Wait for React/Vite SPA to hydrate — the empty #root div gets children
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root') || document.getElementById('app');
          return root && root.children.length > 0 && root.innerHTML.length > 100;
        },
        { timeout: 10_000 },
      ).catch(() => {
        // Fallback: wait a fixed delay if no #root found (non-SPA or different structure)
      });

      // Extra settle time for CSS animations, font loading, lazy images
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: join(outDir, 'preview.png'),
        fullPage: false,
      });

      // Thumbnail screenshot
      await page.setViewportSize({ width: THUMB_WIDTH, height: THUMB_HEIGHT });
      // Brief wait for any responsive reflow
      await page.waitForTimeout(300);
      await page.screenshot({
        path: join(outDir, 'preview-thumb.png'),
        fullPage: false,
      });

      await page.close();
      captured++;
      console.log(`  [OK] ${slug}`);
    } catch (err) {
      skipped++;
      console.log(`  [SKIP] ${slug} -- ${err.message}`);
    } finally {
      if (server) {
        await server.close().catch(() => {});
      }
    }
  }

  await browser.close();

  console.log(`\nDone. ${captured} screenshot(s) captured, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
