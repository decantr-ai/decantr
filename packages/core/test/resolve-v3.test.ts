import { join } from 'node:path';
import type { EssenceV3 } from '@decantr/essence-spec';
import { createResolver } from '@decantr/registry';
import { describe, expect, it } from 'vitest';
import { resolveEssence } from '../src/resolve.js';

const contentRoot = join(import.meta.dirname, '..', '..', 'registry', 'test', 'fixtures');

function makeV3Essence(overrides?: Partial<EssenceV3>): EssenceV3 {
  return {
    version: '3.0.0',
    dna: {
      theme: { id: 'auradecantism', mode: 'dark' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
      typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
      color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'layered', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1.0, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
      personality: ['professional', 'data-rich'],
    },
    blueprint: {
      shell: 'sidebar-main',
      pages: [{ id: 'overview', layout: ['hero'] }],
      features: ['auth'],
    },
    meta: {
      archetype: 'saas-dashboard',
      target: 'decantr',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
    ...overrides,
  };
}

describe('resolveEssence (v3)', () => {
  it('resolves a v3 essence and marks isV3Source=true', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.isV3Source).toBe(true);
  });

  it('reads theme from dna layer', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.theme.id).toBe('auradecantism');
    expect(resolved.theme.mode).toBe('dark');
    expect(resolved.theme.isAddon).toBe(false);
  });

  it('reads density from dna.spacing', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.density.gap).toBe('4');
    expect(resolved.density.level).toBeDefined();
  });

  it('reads pages from blueprint layer', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.pages.length).toBe(1);
    expect(resolved.pages[0].page.id).toBe('overview');
  });

  it('reads shell from blueprint.shell', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.shell.type).toBe('sidebar-main');
  });

  it('reads archetype from meta layer for brand', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.shell.brand).toBe('SaasDashboard');
  });

  it('reads features from blueprint', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.features).toEqual(['auth']);
  });

  it('resolves theme from dna.theme.id', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot, overridePaths: [contentRoot] });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.registryTheme).not.toBeNull();
    expect(resolved.registryTheme?.id).toBe('auradecantism');
  });

  it('resolves patterns from blueprint pages', async () => {
    const essence = makeV3Essence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    const heroPage = resolved.pages[0];
    expect(heroPage.patterns.has('hero')).toBe(true);
  });

  it('uses shell_override per page when set', async () => {
    const essence = makeV3Essence({
      blueprint: {
        shell: 'sidebar-main',
        pages: [{ id: 'home', shell_override: 'full-bleed', layout: ['hero'] }],
        features: [],
      },
    });
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    // The page structure should use the override shell
    expect(resolved.pages[0].page.shell).toBe('full-bleed');
  });

  it('identifies addon styles from dna as isAddon=true', async () => {
    const essence = makeV3Essence({
      dna: {
        ...makeV3Essence().dna,
        theme: { id: 'glassmorphism', mode: 'dark' },
      },
    });
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.theme.isAddon).toBe(true);
  });

  it('builds correct routes from blueprint pages', async () => {
    const essence = makeV3Essence({
      blueprint: {
        shell: 'sidebar-main',
        pages: [
          { id: 'overview', layout: ['hero'] },
          { id: 'settings', layout: ['hero'] },
        ],
        features: [],
      },
    });
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.routes[0]).toEqual({ path: '/', pageId: 'overview', shell: 'sidebar-main' });
    expect(resolved.routes[1]).toEqual({
      path: '/settings',
      pageId: 'settings',
      shell: 'sidebar-main',
    });
  });

  it('reads shape from dna.radius.philosophy', async () => {
    const essence = makeV3Essence({
      dna: {
        ...makeV3Essence().dna,
        radius: { philosophy: 'pill', base: 12 },
      },
    });
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.theme.shape).toBe('pill');
  });
});

describe('resolveEssence (v2 sectioned error)', () => {
  it('throws on multi-section sectioned essences', async () => {
    const sectioned = {
      version: '2.0.0',
      platform: { type: 'spa' as const, routing: 'hash' as const },
      personality: ['professional'],
      sections: [
        {
          id: 'brand',
          path: '/',
          archetype: 'portfolio',
          theme: { id: 'glassmorphism' as const, mode: 'dark' as const },
          structure: [{ id: 'home', shell: 'full-bleed', layout: ['hero'] }],
          features: ['analytics'],
        },
        {
          id: 'app',
          path: '/app',
          archetype: 'saas-dashboard',
          theme: { id: 'auradecantism' as const, mode: 'dark' as const },
          structure: [{ id: 'dashboard', shell: 'sidebar-main', layout: ['hero'] }],
          features: ['auth'],
        },
      ],
      density: { level: 'comfortable' as const, content_gap: '4' },
      guard: { enforce_style: true, mode: 'strict' as const },
      target: 'decantr',
    };
    const resolver = createResolver({ contentRoot });
    await expect(resolveEssence(sectioned, resolver)).rejects.toThrow(/not yet supported/);
  });
});
