import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { PUBLIC_SCHEMAS } from '../../src/lib/schema-catalog.js';
import type { Env } from '../../src/types.js';
import { createApp } from '../../src/app.js';
import { schemaRoutes } from '../../src/routes/schema.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', schemaRoutes);
  return app;
}

const expectedSchemaNames = Object.keys(PUBLIC_SCHEMAS).sort();

describe('GET /v1/schema/:name', () => {
  it('serves every schema catalog entry directly', async () => {
    const app = createTestApp();

    for (const [name, schema] of Object.entries(PUBLIC_SCHEMAS)) {
      const res = await app.request(`/v1/schema/${name}`);

      expect(res.status).toBe(200);
      const json = await res.json();
      if (typeof schema.$id === 'string') {
        expect(json.$id).toBe(schema.$id);
      }
    }
  });

  it.each([
    ['common.v1.json', 'https://decantr.ai/schemas/common.v1.json'],
    ['content-intelligence.v1.json', 'https://decantr.ai/schemas/content-intelligence.v1.json'],
    ['pattern.v2.json', 'https://decantr.ai/schemas/pattern.v2.json'],
    ['theme.v1.json', 'https://decantr.ai/schemas/theme.v1.json'],
    ['blueprint.v1.json', 'https://decantr.ai/schemas/blueprint.v1.json'],
    ['archetype.v2.json', 'https://decantr.ai/schemas/archetype.v2.json'],
    ['shell.v1.json', 'https://decantr.ai/schemas/shell.v1.json'],
    ['public-content-summary.v1.json', 'https://decantr.ai/schemas/public-content-summary.v1.json'],
    ['public-content-list.v1.json', 'https://decantr.ai/schemas/public-content-list.v1.json'],
    ['search-response.v1.json', 'https://decantr.ai/schemas/search-response.v1.json'],
    ['showcase-manifest-entry.v1.json', 'https://decantr.ai/schemas/showcase-manifest-entry.v1.json'],
    ['showcase-shortlist.v1.json', 'https://decantr.ai/schemas/showcase-shortlist.v1.json'],
  ])('serves registry/public schema %s', async (name, schemaId) => {
    const app = createTestApp();
    const res = await app.request(`/v1/schema/${name}`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe(schemaId);
  });

  it.each([
    ['essence.v2.json', 'https://decantr.ai/schemas/essence.v2.json'],
    ['essence.v3.json', 'https://decantr.ai/schemas/essence.v3.json'],
    ['execution-pack.common.v1.json', 'https://decantr.ai/schemas/execution-pack.common.v1.json'],
    ['section-pack.v1.json', 'https://decantr.ai/schemas/section-pack.v1.json'],
    ['page-pack.v1.json', 'https://decantr.ai/schemas/page-pack.v1.json'],
    ['mutation-pack.v1.json', 'https://decantr.ai/schemas/mutation-pack.v1.json'],
    ['review-pack.v1.json', 'https://decantr.ai/schemas/review-pack.v1.json'],
    ['pack-manifest.v1.json', 'https://decantr.ai/schemas/pack-manifest.v1.json'],
    ['selected-execution-pack.v1.json', 'https://decantr.ai/schemas/selected-execution-pack.v1.json'],
  ])('serves foundational contract schema %s', async (name, schemaId) => {
    const app = createTestApp();
    const res = await app.request(`/v1/schema/${name}`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe(schemaId);
  });

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

  it('serves file critique verifier schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/file-critique-report.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/file-critique-report.v1.json');
  });

  it('serves shared verifier report definition schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/verification-report.common.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/verification-report.common.v1.json');
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

  it('serves showcase response schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/showcase-manifest.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/showcase-manifest.v1.json');
  });

  it('serves registry intelligence summary schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/registry-intelligence-summary.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/registry-intelligence-summary.v1.json');
  });

  it('serves hosted execution pack bundle schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/execution-pack-bundle.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/execution-pack-bundle.v1.json');
  });

  it('remains publicly readable through the full app middleware stack', async () => {
    const app = createApp();
    const res = await app.request('/v1/schema/registry-intelligence-summary.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/registry-intelligence-summary.v1.json');
  });

  it('returns 404 for unknown schemas', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/schema/nope.json');

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Schema not found');
    expect(Array.isArray(json.available)).toBe(true);
    expect([...json.available].sort()).toEqual(expectedSchemaNames);
  });
});
