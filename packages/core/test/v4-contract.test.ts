import { join } from 'node:path';
import type { EssenceV4 } from '@decantr/essence-spec';
import type { Pattern, Theme as RegistryTheme } from '@decantr/registry';
import { createResolver } from '@decantr/registry';
import { describe, expect, it } from 'vitest';
import { compileExecutionPackBundle, compileRealizationPlan, runPipeline } from '../src/index.js';
import { resolveEssence, resolveVisualEffects } from '../src/resolve.js';
import type { IRPageNode, IRPatternNode } from '../src/types.js';

const contentRoot = join(import.meta.dirname, '..', '..', 'registry', 'test', 'fixtures');
const MIGRATION_GUIDANCE = /decantr migrate --to v4/;

function makeSaasEssence(overrides: Partial<EssenceV4> = {}): EssenceV4 {
  const essence: EssenceV4 = {
    version: '4.0.0',
    dna: {
      theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
      typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
      color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'layered', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
      personality: ['professional', 'data-rich'],
    },
    blueprint: {
      shell: 'sidebar-main',
      sections: [
        {
          id: 'dashboard',
          role: 'primary',
          shell: 'sidebar-main',
          description: 'Primary SaaS dashboard',
          features: ['auth'],
          pages: [
            {
              id: 'overview',
              route: '/',
              layout: ['kpi-grid', { cols: ['filter-bar', 'data-table'], at: 'lg' }],
            },
            {
              id: 'settings',
              route: '/settings',
              layout: [{ pattern: 'form-sections', preset: 'settings' }],
            },
          ],
          navigation_items: [
            { label: 'Overview', route: '/', icon: 'layout-dashboard', hotkey: 'g o' },
            { label: 'Settings', route: '/settings', icon: 'settings' },
          ],
        },
      ],
      features: ['auth'],
      routes: {
        '/': { section: 'dashboard', page: 'overview' },
        '/settings': { section: 'dashboard', page: 'settings' },
      },
    },
    meta: {
      archetype: 'saas-dashboard',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      navigation: {
        command_palette: true,
        hotkeys: [{ key: 'g o', route: '/', label: 'Go to overview' }],
      },
    },
  };

  return {
    ...essence,
    ...overrides,
    dna: { ...essence.dna, ...overrides.dna },
    blueprint: { ...essence.blueprint, ...overrides.blueprint },
    meta: { ...essence.meta, ...overrides.meta },
  };
}

function makeDuplicatePageEssence(): EssenceV4 {
  return makeSaasEssence({
    blueprint: {
      shell: 'sidebar-main',
      sections: [
        {
          id: 'buyer-dashboard',
          role: 'auxiliary',
          shell: 'sidebar-main',
          description: 'Buyer account hub',
          features: ['messaging'],
          pages: [{ id: 'messages', route: '/buyer/messages', layout: ['data-table'] }],
        },
        {
          id: 'marketplace-messaging',
          role: 'auxiliary',
          shell: 'sidebar-main',
          description: 'Standalone inbox',
          features: ['messaging'],
          pages: [{ id: 'messages', route: '/messages', layout: ['hero'] }],
        },
      ],
      features: ['messaging'],
      routes: {
        '/buyer/messages': { section: 'buyer-dashboard', page: 'messages' },
        '/messages': { section: 'marketplace-messaging', page: 'messages' },
      },
    },
    meta: {
      archetype: 'marketplace',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  });
}

function makeUnsupportedTargetEssence(): EssenceV4 {
  return makeSaasEssence({
    meta: {
      archetype: 'saas-dashboard',
      target: 'rails',
      platform: { type: 'ssr', routing: 'history' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  });
}

function makeTargetEssence(target: string, platformType: 'spa' | 'ssr' = 'spa'): EssenceV4 {
  return makeSaasEssence({
    meta: {
      archetype: 'saas-dashboard',
      target,
      platform: { type: platformType, routing: platformType === 'ssr' ? 'pathname' : 'history' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  });
}

describe('V4 resolution', () => {
  it('resolves V4 sections, theme, routes, patterns, and wiring', async () => {
    const resolver = createResolver({ contentRoot, overridePaths: [contentRoot] });
    const resolved = await resolveEssence(makeSaasEssence(), resolver);

    expect(resolved.isBlueprintSource).toBe(true);
    expect(resolved.registryTheme?.id).toBe('auradecantism');
    expect(resolved.theme).toMatchObject({ id: 'auradecantism', mode: 'dark', isAddon: false });
    expect(resolved.density).toEqual({ gap: '4', level: 'comfortable' });
    expect(resolved.features).toEqual(['auth']);
    expect(resolved.routes).toEqual([
      { path: '/', pageId: 'overview', sectionId: 'dashboard', shell: 'sidebar-main' },
      { path: '/settings', pageId: 'settings', sectionId: 'dashboard', shell: 'sidebar-main' },
    ]);
    expect(resolved.shell.nav.map((item) => item.href)).toEqual(['/', '/settings']);

    const overview = resolved.pages[0];
    expect(overview.page.sectionId).toBe('dashboard');
    expect(overview.patterns.has('kpi-grid')).toBe(true);
    expect(overview.patterns.has('filter-bar')).toBe(true);
    expect(overview.patterns.has('data-table')).toBe(true);
    expect(overview.wiring?.signals.map((signal) => signal.name)).toContain('pageSearch');
  });

  it('rejects pre-V4 runtime inputs with migration guidance', async () => {
    const resolver = createResolver({ contentRoot });
    const legacy = { ...makeSaasEssence(), version: '3.1.0' };

    await expect(resolveEssence(legacy as never, resolver)).rejects.toThrow(MIGRATION_GUIDANCE);
  });
});

describe('V4 pipeline', () => {
  it('builds IR from sectioned V4 essence only', async () => {
    const result = await runPipeline(makeSaasEssence(), { contentRoot });

    expect(result.ir.type).toBe('app');
    expect(result.ir.theme.id).toBe('auradecantism');
    expect(result.ir.routing).toBe('hash');
    expect(result.ir.routes.map((route) => route.path)).toEqual(['/', '/settings']);
    expect(result.ir.children).toHaveLength(2);

    const overview = result.ir.children[0] as IRPageNode;
    expect(overview.id).toBe('dashboard:overview');
    expect(overview.pageId).toBe('overview');
    expect(overview.sectionId).toBe('dashboard');
    expect(overview.layer).toBe('blueprint');

    const firstPattern = overview.children[0] as IRPatternNode;
    expect(firstPattern.layer).toBe('blueprint');
  });

  it('keeps all routes while filtering page IR output', async () => {
    const result = await runPipeline(makeSaasEssence(), { contentRoot, pageFilter: 'settings' });

    expect(result.ir.children.map((page) => page.id)).toEqual(['dashboard:settings']);
    expect(result.ir.children.map((page) => page.pageId)).toEqual(['settings']);
    expect(result.ir.routes.map((route) => route.path)).toEqual(['/', '/settings']);
  });

  it('rejects legacy pipeline inputs with migration guidance', async () => {
    const legacy = { ...makeSaasEssence(), version: '3.0.0' };

    await expect(runPipeline(legacy as never, { contentRoot })).rejects.toThrow(MIGRATION_GUIDANCE);
  });
});

describe('V4 execution packs', () => {
  it('compiles a V4 pack bundle with scoped routes and navigation obligations', async () => {
    const bundle = await compileExecutionPackBundle(makeSaasEssence(), { contentRoot });

    expect(bundle.$schema).toBe('https://decantr.ai/schemas/execution-pack-bundle.v1.json');
    expect(bundle.sourceEssenceVersion).toBe('4.0.0');
    expect(bundle.scaffold.target.adapter).toBe('react-vite');
    expect(bundle.scaffold.data.navigation?.commandPalette).toBe(true);
    expect(bundle.sections).toHaveLength(1);
    expect(bundle.pages).toHaveLength(2);
    expect(bundle.mutations.map((pack) => pack.data.mutationType)).toEqual(['add-page', 'modify']);

    expect(bundle.scaffold.data.routes).toEqual([
      {
        pageId: 'overview',
        sectionId: 'dashboard',
        path: '/',
        shell: 'sidebar-main',
        patternIds: ['kpi-grid', 'filter-bar', 'data-table'],
      },
      {
        pageId: 'settings',
        sectionId: 'dashboard',
        path: '/settings',
        shell: 'sidebar-main',
        patternIds: ['form-sections'],
      },
    ]);
    expect(bundle.sections[0].data.routes).toEqual(bundle.scaffold.data.routes);
    expect(bundle.pages[0].data).toMatchObject({
      pageId: 'overview',
      sectionId: 'dashboard',
      path: '/',
      shell: 'sidebar-main',
      wiringSignals: expect.arrayContaining(['pageSearch']),
    });
    expect(bundle.scaffold.renderedMarkdown).toContain(
      '- / -> dashboard/overview @ sidebar-main [kpi-grid, filter-bar, data-table]',
    );
  });

  it('keeps duplicate page IDs scoped by section in V4 bundles', async () => {
    const bundle = await compileExecutionPackBundle(makeDuplicatePageEssence(), { contentRoot });

    expect(bundle.manifest.pages.map((page) => page.id)).toEqual([
      'buyer-dashboard/messages',
      'marketplace-messaging/messages',
    ]);
    expect(bundle.pages.map((pack) => `${pack.data.sectionId}:${pack.data.path}`)).toEqual([
      'buyer-dashboard:/buyer/messages',
      'marketplace-messaging:/messages',
    ]);
    expect(bundle.scaffold.renderedMarkdown).toContain(
      '- /buyer/messages -> buyer-dashboard/messages @ sidebar-main [data-table]',
    );
    expect(bundle.scaffold.renderedMarkdown).toContain(
      '- /messages -> marketplace-messaging/messages @ sidebar-main [hero]',
    );
  });

  it('rejects legacy pack compilation with migration guidance', async () => {
    const legacy = { ...makeSaasEssence(), version: '2.0.0' };

    await expect(compileExecutionPackBundle(legacy as never, { contentRoot })).rejects.toThrow(
      MIGRATION_GUIDANCE,
    );
  });
});

describe('first-mile realization plan', () => {
  it('compiles a framework-neutral plan for certified React Vite projects', () => {
    const plan = compileRealizationPlan(makeSaasEssence());

    expect(plan.sourceEssenceVersion).toBe('4.0.0');
    expect(plan.adapter).toBe('react-vite');
    expect(plan.canRealizeFrameworkCode).toBe(true);
    expect(plan.routes[0]).toMatchObject({
      path: '/',
      sectionId: 'dashboard',
      pageId: 'overview',
      states: ['empty', 'loading', 'error'],
    });
    expect(plan.mockData.map((seed) => seed.id)).toEqual(['auth', 'overview', 'settings']);
    expect(plan.interactions.map((item) => item.kind)).toEqual([
      'auth-mock',
      'command-palette',
      'hotkey',
    ]);
  });

  it('keeps unsupported stacks contract-first without generated framework code', () => {
    const plan = compileRealizationPlan(makeUnsupportedTargetEssence());

    expect(plan.adapter).toBe('rails');
    expect(plan.canRealizeFrameworkCode).toBe(false);
    expect(plan.unsupportedReason).toContain('No certified realization adapter');
  });

  it('certifies first-mile realization for supported non-React adapters', () => {
    const cases = [
      ['html', 'vanilla-vite'],
      ['vue', 'vue-vite'],
      ['svelte', 'sveltekit'],
      ['angular', 'angular'],
      ['solid', 'solid-vite'],
    ] as const;

    for (const [target, adapter] of cases) {
      const plan = compileRealizationPlan(makeTargetEssence(target));
      expect(plan.adapter).toBe(adapter);
      expect(plan.canRealizeFrameworkCode).toBe(true);
      expect(plan.unsupportedReason).toBeUndefined();
    }
  });
});

describe('resolveVisualEffects', () => {
  const baseTheme: RegistryTheme = {
    id: 'test',
    name: 'Test',
    effects: {
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
    spatial: {
      density_bias: 0,
      content_gap_shift: 0,
      section_padding: '',
      card_wrapping: 'always',
      surface_override: null,
    },
    shell: { preferred: [], nav_style: 'minimal' },
    pattern_preferences: { prefer: [], avoid: [] },
  };

  function makePattern(components: string[]): Pattern {
    return {
      id: 'test',
      version: '1.0.0',
      name: 'Test',
      description: '',
      tags: [],
      components,
      default_preset: 'default',
      presets: {},
    };
  }

  it('returns null when effects are disabled', () => {
    const theme = { ...baseTheme, effects: { ...baseTheme.effects!, enabled: false } };

    expect(resolveVisualEffects(theme, makePattern(['Card']))).toBeNull();
  });

  it('falls back to component effect mappings', () => {
    const result = resolveVisualEffects(baseTheme, makePattern(['Card']));

    expect(result?.decorators).toEqual(['d-glass', 'd-gradient-hint-primary']);
  });

  it('returns null when no component matches the theme effect contract', () => {
    expect(resolveVisualEffects(baseTheme, makePattern(['Button']))).toBeNull();
  });
});
