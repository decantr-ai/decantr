import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { createApp } from '../../src/app.js';
import { intelligenceRoutes } from '../../src/routes/intelligence.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', intelligenceRoutes);
  return app;
}

describe('GET /v1/intelligence/summary', () => {
  it('serves a schema-backed intelligence summary for bundled content', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/intelligence/summary?namespace=%40official');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('registry-intelligence-summary.v1.json', json);
    expect(json.namespace).toBe('@official');
    expect(json.totals.total_public_items).toBeGreaterThan(500);
    expect(json.by_type.blueprint.recommended).toBeGreaterThan(0);
  });

  it('remains publicly readable through the full app middleware stack', async () => {
    const app = createApp();
    const res = await app.request('/v1/intelligence/summary?namespace=%40official');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('registry-intelligence-summary.v1.json', json);
    expect(json.totals.total_public_items).toBeGreaterThan(500);
  });
});
