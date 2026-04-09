import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { showcaseRoot } from './showcase-manifest.mjs';

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function getContentType(pathname) {
  return CONTENT_TYPES[extname(pathname)] ?? 'application/octet-stream';
}

function extractAssetPaths(indexHtml) {
  const assetPaths = new Set();

  for (const match of indexHtml.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
    const assetPath = match[1];
    const assetsIndex = assetPath.indexOf('/assets/');
    if (assetsIndex === -1) continue;
    assetPaths.add(assetPath.slice(assetsIndex));
  }

  return [...assetPaths];
}

function normalizeRouteHint(route) {
  if (!route || route === '/') return '/';
  const dynamicIndex = route.indexOf('/:');
  if (dynamicIndex !== -1) {
    return route.slice(0, dynamicIndex + 1);
  }
  return route;
}

export function extractShowcaseRouteHints(entry) {
  const essencePath = join(showcaseRoot, entry.slug, 'decantr.essence.json');
  if (!existsSync(essencePath)) {
    return ['/'];
  }

  try {
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));
    const routes = new Set(['/']);

    for (const section of essence.blueprint?.sections ?? []) {
      for (const page of section.pages ?? []) {
        if (typeof page.route === 'string' && page.route.length > 0) {
          routes.add(normalizeRouteHint(page.route));
        }
      }
    }

    if (essence.blueprint?.routes && typeof essence.blueprint.routes === 'object') {
      for (const route of Object.keys(essence.blueprint.routes)) {
        routes.add(normalizeRouteHint(route));
      }
    }

    return [...routes].filter(Boolean).slice(0, 6);
  } catch {
    return ['/'];
  }
}

async function startStaticServer(rootDir) {
  const server = createServer((req, res) => {
    const requestedUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
    const pathname = requestedUrl.pathname === '/' ? '/index.html' : requestedUrl.pathname;
    const relativePath = normalize(pathname)
      .replace(/^[/\\]+/, '')
      .replace(/^(\.\.[/\\])+/, '');
    const filePath = join(rootDir, relativePath);
    const fallbackPath = join(rootDir, 'index.html');

    try {
      if (existsSync(filePath)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', getContentType(filePath));
        res.end(readFileSync(filePath));
        return;
      }

      if (existsSync(fallbackPath)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(fallbackPath));
        return;
      }

      res.statusCode = 404;
      res.end('Not found');
    } catch {
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to bind static smoke server.');
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

export async function runShowcaseSmoke(entry) {
  const distDir = join(showcaseRoot, entry.slug, 'dist');
  const failures = [];
  const routeHints = extractShowcaseRouteHints(entry);

  if (!existsSync(distDir)) {
    return {
      passed: false,
      durationMs: 0,
      rootDocumentOk: false,
      assetCount: 0,
      assetsPassed: 0,
      routeHintsChecked: routeHints,
      routeHintsMatched: 0,
      failures: ['dist-missing'],
    };
  }

  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) {
    return {
      passed: false,
      durationMs: 0,
      rootDocumentOk: false,
      assetCount: 0,
      assetsPassed: 0,
      routeHintsChecked: routeHints,
      routeHintsMatched: 0,
      failures: ['index-missing'],
    };
  }

  const indexHtml = readFileSync(indexPath, 'utf-8');
  const assetPaths = extractAssetPaths(indexHtml);
  const startedAt = Date.now();
  const server = await startStaticServer(distDir);

  try {
    const rootResponse = await fetch(`${server.baseUrl}/`);
    const rootHtml = await rootResponse.text();
    const rootDocumentOk = rootResponse.ok && /id="root"/.test(rootHtml);
    if (!rootDocumentOk) {
      failures.push('root-document-invalid');
    }

    let assetsPassed = 0;
    let combinedJs = '';

    for (const assetPath of assetPaths) {
      const response = await fetch(`${server.baseUrl}${assetPath}`);
      const body = await response.text();
      if (response.ok && body.length > 0) {
        assetsPassed += 1;
      } else {
        failures.push(`asset-fetch-failed:${assetPath}`);
      }

      if (assetPath.endsWith('.js')) {
        combinedJs += body;
      }
    }

    const routeHintsMatched = routeHints.filter(routeHint => combinedJs.includes(routeHint)).length;
    if (routeHints.length > 0 && routeHintsMatched < Math.min(2, routeHints.length)) {
      failures.push('route-hints-missing');
    }

    return {
      passed: rootDocumentOk
        && assetPaths.length > 0
        && assetsPassed === assetPaths.length
        && (routeHints.length === 0 || routeHintsMatched >= Math.min(2, routeHints.length)),
      durationMs: Date.now() - startedAt,
      rootDocumentOk,
      assetCount: assetPaths.length,
      assetsPassed,
      routeHintsChecked: routeHints,
      routeHintsMatched,
      failures,
    };
  } finally {
    await server.close();
  }
}
