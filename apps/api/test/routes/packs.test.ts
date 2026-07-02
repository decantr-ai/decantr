import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';
import { createApp } from '../../src/app.js';
import { packRoutes } from '../../src/routes/packs.js';
import { assertMatchesSchema } from '../helpers/schema-assert.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', packRoutes);
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
    routes: {
      '/': { section: 'dashboard', page: 'home' },
    },
  },
  meta: {
    archetype: 'dashboard',
    target: 'react',
    platform: { type: 'spa', routing: 'history' },
    guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
  },
} as const;

describe('pack routes', () => {
  it('returns a schema-backed execution pack bundle from bundled content', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/packs/compile?namespace=%40official', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validEssence),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('execution-pack-bundle.v1.json', json);
    expect(json.$schema).toBe('https://decantr.ai/schemas/execution-pack-bundle.v1.json');
    expect(json.pages).toHaveLength(1);
    expect(json.pages[0]?.data.pageId).toBe('home');
  });

  it('rejects invalid essence documents', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/packs/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: '2.0.0' }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Essence failed validation');
    expect(Array.isArray(json.validationErrors)).toBe(true);
  });

  it('returns a selected execution pack through the full app middleware stack', async () => {
    const app = createApp();
    const res = await app.request('/v1/packs/select?namespace=%40official', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essence: validEssence,
        pack_type: 'page',
        id: 'home',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    assertMatchesSchema('selected-execution-pack.v1.json', json);
    expect(json.selector.packType).toBe('page');
    expect(json.selector.id).toBe('home');
  });

  it('returns not found when the requested selected pack does not exist', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/packs/select?namespace=%40official', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essence: validEssence,
        pack_type: 'section',
        id: 'missing',
      }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Requested section pack was not found.' });
  });
});
