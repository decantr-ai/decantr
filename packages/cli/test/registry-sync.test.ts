import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { syncRegistry } from '../src/registry.js';

describe('registry sync', () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('paginates list endpoints and caches full content records by slug', async () => {
    const patterns = Array.from({ length: 3 }, (_, index) => ({
      id: `public-${index + 1}`,
      slug: `pattern-${index + 1}`,
      type: 'pattern',
      name: `Pattern ${index + 1}`,
    }));

    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      if (url.pathname === '/v1/patterns') {
        const offset = Number(url.searchParams.get('offset') ?? '0');
        const limit = Number(url.searchParams.get('limit') ?? '1');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            total: patterns.length,
            limit,
            offset,
            items: patterns.slice(offset, offset + 1),
          }),
        );
        return;
      }

      const detailMatch = url.pathname.match(/^\/v1\/patterns\/@official\/([^/]+)$/);
      if (detailMatch) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            id: `detail-${detailMatch[1]}`,
            type: 'pattern',
            slug: detailMatch[1],
            data: {
              id: detailMatch[1],
              name: `Full ${detailMatch[1]}`,
              version: '1.0.0',
            },
          }),
        );
        return;
      }

      const emptyListMatch = url.pathname.match(/^\/v1\/(themes|blueprints|archetypes|shells)$/);
      if (emptyListMatch) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ total: 0, limit: 100, offset: 0, items: [] }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const { port } = server.address() as AddressInfo;
    const root = mkdtempSync(join(tmpdir(), 'decantr-sync-'));
    tempRoots.push(root);

    try {
      const result = await syncRegistry(join(root, '.decantr', 'cache'), `http://127.0.0.1:${port}/v1`);

      expect(result.failed).toEqual([]);
      expect(result.synced).toContain('patterns');

      const index = JSON.parse(
        readFileSync(join(root, '.decantr', 'cache', '@official', 'patterns', 'index.json'), 'utf-8'),
      );
      expect(index.items.map((item: { slug: string }) => item.slug)).toEqual([
        'pattern-1',
        'pattern-2',
        'pattern-3',
      ]);

      const fullPatternPath = join(
        root,
        '.decantr',
        'cache',
        '@official',
        'patterns',
        'pattern-3.json',
      );
      expect(existsSync(fullPatternPath)).toBe(true);
      expect(JSON.parse(readFileSync(fullPatternPath, 'utf-8'))).toMatchObject({
        id: 'pattern-3',
        name: 'Full pattern-3',
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
