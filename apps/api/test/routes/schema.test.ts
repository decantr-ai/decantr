import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
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
  it('exposes the complete canonical docs schema catalog', () => {
    const docsSchemaNames = readdirSync(resolve(import.meta.dirname, '../../../../docs/schemas'))
      .filter((name) => name.endsWith('.json'))
      .sort();

    expect(expectedSchemaNames).toEqual(docsSchemaNames);
  });

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

  it('remains publicly readable through the full app middleware stack', async () => {
    const app = createApp();
    const res = await app.request('/v1/schema/registry-intelligence-summary.v1.json');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe('https://decantr.ai/schemas/registry-intelligence-summary.v1.json');
  });

  it.each([
    'adoption-truth.v1.json',
    'task-capsule.v1.json',
    'governance-delta.v1.json',
    'decantr-ci-report.v3.json',
  ])('serves the Decantr 3.9 governed-change schema %s', async (name) => {
    const app = createApp();
    const res = await app.request(`/v1/schema/${name}`);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.$id).toBe(`https://decantr.ai/schemas/${name}`);
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
