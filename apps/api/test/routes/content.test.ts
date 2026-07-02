import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { contentRoutes } from '../../src/routes/content.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', contentRoutes);
  return app;
}

const validEssence = {
  version: '4.0.0',
  dna: {
    theme: { id: 'clean', mode: 'light', shape: 'rounded' },
    spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '1.5rem' },
    typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
    color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
    radius: { philosophy: 'rounded', base: 8 },
    elevation: { system: 'layered', max_levels: 3 },
    motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
    accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
    personality: ['professional'],
  },
  blueprint: {
    shell: 'sidebar-main',
    sections: [
      {
        id: 'dashboard',
        role: 'primary',
        shell: 'sidebar-main',
        features: ['auth'],
        description: 'Dashboard section',
        pages: [{ id: 'home', route: '/', layout: ['hero'] }],
      },
    ],
    features: ['auth'],
    routes: { '/': { section: 'dashboard', page: 'home' } },
  },
  meta: {
    archetype: 'dashboard',
    target: 'next',
    platform: { type: 'spa', routing: 'history' },
    guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
  },
} as const;

describe('content routes', () => {
  it('validates active Essence v4 documents', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validEssence),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(true);
    expect(json.schemaVersion).toBe('v4');
  });

  it('reports malformed JSON bodies', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' });
  });

  it('serves public content detail responses from @decantr/content', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/patterns/%40official/data-table');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('public-content-record.v1.json', json);
    expect(json.slug).toBe('data-table');
    expect(json.namespace).toBe('@official');
    expect(json.visibility).toBe('public');
  });

  it('serves public content lists with blueprint portfolio filtering', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/blueprints?blueprint_set=featured&limit=100');

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('public-content-list.v1.json', json);
    expect(json.total).toBeGreaterThan(0);
    expect(json.items.every((item: { blueprint_portfolio?: { visibility?: string } }) =>
      item.blueprint_portfolio?.visibility === 'featured',
    )).toBe(true);
  });

  it('does not serve private or community namespaces from the bundled corpus', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/themes/%40owner/private-theme');

    expect(res.status).toBe(404);
  });

  it('does not serve registry thumbnail storage from the content API', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/blueprints/%40official/agent-studio/thumbnail');

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Thumbnail assets are not served by the content API.' });
  });
});
