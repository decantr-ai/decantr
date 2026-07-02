import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { searchRoutes } from '../../src/routes/search.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', searchRoutes);
  return app;
}

describe('GET /v1/search', () => {
  it('searches the bundled official corpus', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/search?q=agent&type=blueprints&limit=10');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('search-response.v1.json', json);
    expect(json.total).toBeGreaterThan(0);
    expect(json.results.some((item: { slug: string }) => item.slug === 'agent-studio')).toBe(true);
  });

  it('requires a query parameter', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/search');

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Query parameter "q" is required' });
  });

  it('filters source to official content only', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/search?q=agent&source=community');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(0);
    expect(json.results).toEqual([]);
  });

  it('filters recommended blueprint results using authored corpus metadata', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/search?q=agent&type=blueprints&recommended=true');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBeGreaterThan(0);
    expect(json.results.every((item: { intelligence?: { recommended?: boolean } }) =>
      item.intelligence?.recommended === true,
    )).toBe(true);
  });
});
