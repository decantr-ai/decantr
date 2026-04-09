import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { schemaRoutes } from '../../src/routes/schema.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', schemaRoutes);
  return app;
}

describe('GET /v1/schema/:name', () => {
  it('serves known schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/scaffold-pack.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/scaffold-pack.v1.json');
  });

  it('serves verifier report schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/project-audit-report.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/project-audit-report.v1.json');
  });

  it('serves showcase verifier schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/showcase-shortlist-report.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/showcase-shortlist-report.v1.json');
  });

  it('serves public registry response schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/public-content-record.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/public-content-record.v1.json');
  });

  it('returns 404 for unknown schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/nope.json');

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Schema not found');
    expect(Array.isArray(json.available)).toBe(true);
    expect(json.available).toContain('scaffold-pack.v1.json');
    expect(json.available).toContain('project-audit-report.v1.json');
    expect(json.available).toContain('showcase-shortlist-report.v1.json');
    expect(json.available).toContain('public-content-record.v1.json');
  });
});
