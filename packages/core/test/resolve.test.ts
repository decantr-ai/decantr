import { describe, it, expect } from 'vitest';
import { resolveEssence, resolveVisualEffects } from '../src/resolve.js';
import { createResolver } from '@decantr/registry';
import type { Essence } from '@decantr/essence-spec';
import type { Pattern, Recipe } from '@decantr/registry';
import { join } from 'node:path';

const contentRoot = join(import.meta.dirname, '..', '..', '..', 'content', 'core');

function makeSaasEssence(): Essence {
  return {
    version: '2.0.0',
    archetype: 'saas-dashboard',
    theme: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism' },
    personality: ['professional', 'data-rich'],
    platform: { type: 'spa', routing: 'hash' },
    structure: [
      {
        id: 'overview',
        shell: 'sidebar-main',
        layout: ['hero'],
      },
    ],
    features: ['auth'],
    density: { level: 'comfortable', content_gap: '4' },
    guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' },
    target: 'decantr',
  };
}

describe('resolveEssence', () => {
  it('loads recipe and computes density from personality traits', async () => {
    const essence = makeSaasEssence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.recipe).not.toBeNull();
    expect(resolved.recipe?.id).toBe('auradecantism');
    expect(resolved.density.gap).toBeDefined();
    expect(resolved.density.level).toBeDefined();
  });

  it('resolves patterns with preset fallback chain', async () => {
    const essence = makeSaasEssence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    // hero is a core pattern, should be resolved
    const heroPage = resolved.pages[0];
    expect(heroPage.patterns.has('hero')).toBe(true);
    const heroEntry = heroPage.patterns.get('hero')!;
    expect(heroEntry.pattern.id).toBe('hero');
    expect(heroEntry.preset.preset).toBe('landing'); // default_preset for hero
  });

  it('builds shell config with nav icons', async () => {
    const essence = makeSaasEssence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.shell.type).toBe('sidebar-main');
    expect(resolved.shell.nav.length).toBe(1);
    expect(resolved.shell.nav[0].label).toBe('Overview');
    expect(resolved.shell.nav[0].href).toBe('/');
    expect(resolved.shell.nav[0].icon).toBe('layout-dashboard');
  });

  it('maps routes correctly (overview -> /, settings -> /settings)', async () => {
    const essence: Essence = {
      ...makeSaasEssence(),
      structure: [
        { id: 'overview', shell: 'sidebar-main', layout: ['hero'] },
        { id: 'settings', shell: 'sidebar-main', layout: ['hero'] },
      ],
    };
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.routes[0]).toEqual({ path: '/', pageId: 'overview' });
    expect(resolved.routes[1]).toEqual({ path: '/settings', pageId: 'settings' });
  });

  it('identifies addon styles as isAddon=true', async () => {
    const essence: Essence = {
      ...makeSaasEssence(),
      theme: { style: 'glassmorphism', mode: 'dark', recipe: 'auradecantism' },
    };
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.theme.isAddon).toBe(true);
  });

  it('identifies core styles as isAddon=false', async () => {
    const essence = makeSaasEssence();
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(essence, resolver);

    expect(resolved.theme.isAddon).toBe(false);
  });

  it('handles sectioned essences by flattening first section', async () => {
    const sectioned = {
      version: '2.0.0',
      platform: { type: 'spa' as const, routing: 'hash' as const },
      personality: ['professional'],
      sections: [
        {
          id: 'brand',
          path: '/',
          archetype: 'portfolio',
          theme: { style: 'glassmorphism' as const, mode: 'dark' as const, recipe: 'auradecantism' },
          structure: [{ id: 'home', shell: 'full-bleed', layout: ['hero'] }],
          features: ['analytics'],
        },
      ],
      density: { level: 'comfortable' as const, content_gap: '4' },
      guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' as const },
      target: 'decantr',
    };
    const resolver = createResolver({ contentRoot });
    const resolved = await resolveEssence(sectioned, resolver);

    expect(resolved.theme.style).toBe('glassmorphism');
    expect(resolved.pages.length).toBe(1);
    expect(resolved.pages[0].page.id).toBe('home');
  });
});

describe('resolveVisualEffects', () => {
  const baseRecipe: Recipe = {
    id: 'test',
    style: 'test',
    mode: 'dark',
    schema_version: '2.0',
    spatial_hints: {
      density_bias: 0,
      content_gap_shift: 0,
      section_padding: '',
      card_wrapping: 'always',
      surface_override: null,
    },
    shell: { preferred: [], nav_style: 'minimal' },
    visual_effects: {
      enabled: true,
      intensity: 'medium',
      type_mapping: {
        feature_card: ['d-glass', 'd-gradient-hint-primary'],
        stat_display: ['d-glow-primary'],
      },
      component_fallback: {
        Card: 'feature_card',
        Statistic: 'stat_display',
      },
    },
    pattern_preferences: { prefer: [], avoid: [] },
  };

  it('returns null when visual_effects.enabled is false', () => {
    const recipe = { ...baseRecipe, visual_effects: { ...baseRecipe.visual_effects, enabled: false } };
    const pattern: Pattern = {
      id: 'test',
      version: '1.0.0',
      name: 'Test',
      description: '',
      tags: [],
      components: ['Card'],
      default_preset: 'default',
      presets: {},
    };
    expect(resolveVisualEffects(recipe, pattern)).toBeNull();
  });

  it('falls back to component_fallback matching', () => {
    const pattern: Pattern = {
      id: 'test',
      version: '1.0.0',
      name: 'Test',
      description: '',
      tags: [],
      components: ['Card'],
      default_preset: 'default',
      presets: {},
    };
    const result = resolveVisualEffects(baseRecipe, pattern);
    expect(result).not.toBeNull();
    expect(result!.decorators).toContain('d-glass');
    expect(result!.decorators).toContain('d-gradient-hint-primary');
  });

  it('returns null when no component matches', () => {
    const pattern: Pattern = {
      id: 'test',
      version: '1.0.0',
      name: 'Test',
      description: '',
      tags: [],
      components: ['Button'],
      default_preset: 'default',
      presets: {},
    };
    expect(resolveVisualEffects(baseRecipe, pattern)).toBeNull();
  });
});
