import { describe, expect, it } from 'vitest';
import type { ArchetypeData, BlueprintOverrides } from '../src/scaffold.js';
import { composeArchetypes, composeSections } from '../src/scaffold.js';

function makeArchetype(
  overrides: Partial<ArchetypeData> & { pages: ArchetypeData['pages'] },
): ArchetypeData {
  return {
    id: overrides.id || 'test',
    ...overrides,
  };
}

describe('composeArchetypes', () => {
  it('returns default single page for empty compose array', () => {
    const result = composeArchetypes([], new Map());
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].id).toBe('home');
    expect(result.features).toEqual([]);
    expect(result.defaultShell).toBe('sidebar-main');
  });

  it('single archetype: pages have no prefix, first shell is default', () => {
    const data = makeArchetype({
      id: 'dashboard',
      pages: [
        { id: 'overview', shell: 'sidebar-main', default_layout: ['kpi-grid', 'chart-grid'] },
        { id: 'analytics', shell: 'sidebar-main', default_layout: ['chart-grid'] },
      ],
      features: ['auth', 'notifications'],
    });

    const result = composeArchetypes(['dashboard'], new Map([['dashboard', data]]));

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0].id).toBe('overview');
    expect(result.pages[1].id).toBe('analytics');
    expect(result.defaultShell).toBe('sidebar-main');
    expect(result.features).toEqual(['auth', 'notifications']);
  });

  it('two archetypes: primary has no prefix, secondary pages get archetype ID prefix', () => {
    const dashboard = makeArchetype({
      id: 'dashboard',
      pages: [{ id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] }],
      features: ['auth'],
    });
    const chatbot = makeArchetype({
      id: 'ai-chatbot',
      pages: [
        { id: 'home', shell: 'top-nav-main', default_layout: ['chat-window'] },
        { id: 'history', shell: 'top-nav-main', default_layout: ['data-table'] },
      ],
      features: ['ai'],
    });

    const result = composeArchetypes(
      ['dashboard', 'ai-chatbot'],
      new Map([
        ['dashboard', dashboard],
        ['ai-chatbot', chatbot],
      ]),
    );

    expect(result.pages).toHaveLength(3);
    // Primary pages: no prefix
    expect(result.pages[0].id).toBe('home');
    // Secondary pages: prefixed with archetype ID
    expect(result.pages[1].id).toBe('ai-chatbot-home');
    expect(result.pages[2].id).toBe('ai-chatbot-history');
    // Default shell from primary
    expect(result.defaultShell).toBe('sidebar-main');
  });

  it('object entry with custom prefix uses the custom prefix', () => {
    const settings = makeArchetype({
      id: 'settings-panel',
      pages: [
        { id: 'profile', shell: 'sidebar-main', default_layout: ['form-sections'] },
        { id: 'security', shell: 'sidebar-main', default_layout: ['form-sections'] },
      ],
      features: [],
    });

    const result = composeArchetypes(
      ['marketing-landing', { archetype: 'settings-panel', prefix: 'settings' }],
      new Map([
        [
          'marketing-landing',
          makeArchetype({
            id: 'marketing-landing',
            pages: [{ id: 'home', shell: 'top-nav-main', default_layout: ['hero'] }],
            features: ['analytics'],
          }),
        ],
        ['settings-panel', settings],
      ]),
    );

    expect(result.pages).toHaveLength(3);
    expect(result.pages[0].id).toBe('home');
    // Custom prefix 'settings' instead of archetype ID 'settings-panel'
    expect(result.pages[1].id).toBe('settings-profile');
    expect(result.pages[2].id).toBe('settings-security');
  });

  it('deduplicates features across all archetypes', () => {
    const a = makeArchetype({
      id: 'a',
      pages: [{ id: 'home', shell: 'sidebar-main', default_layout: ['hero'] }],
      features: ['auth', 'notifications', 'search'],
    });
    const b = makeArchetype({
      id: 'b',
      pages: [{ id: 'main', shell: 'sidebar-main', default_layout: ['hero'] }],
      features: ['auth', 'payments', 'search'],
    });

    const result = composeArchetypes(
      ['a', 'b'],
      new Map([
        ['a', a],
        ['b', b],
      ]),
    );

    expect(result.features).toEqual(['auth', 'notifications', 'search', 'payments']);
  });

  it('secondary archetype with different shell gets shell_override', () => {
    const primary = makeArchetype({
      id: 'dashboard',
      pages: [{ id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] }],
      features: [],
    });
    const secondary = makeArchetype({
      id: 'landing',
      pages: [{ id: 'splash', shell: 'top-nav-main', default_layout: ['hero'] }],
      features: [],
    });

    const result = composeArchetypes(
      ['dashboard', 'landing'],
      new Map([
        ['dashboard', primary],
        ['landing', secondary],
      ]),
    );

    expect(result.defaultShell).toBe('sidebar-main');
    // Primary page: no shell_override (same as default)
    expect(result.pages[0].shell_override).toBeUndefined();
    // Secondary page: different shell => shell_override set
    expect(result.pages[1].shell_override).toBe('top-nav-main');
    expect(result.pages[1].id).toBe('landing-splash');
  });

  it('handles missing archetype data gracefully', () => {
    const primary = makeArchetype({
      id: 'dashboard',
      pages: [{ id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] }],
      features: ['auth'],
    });

    const result = composeArchetypes(
      ['dashboard', 'missing-archetype'],
      new Map([
        ['dashboard', primary],
        ['missing-archetype', null],
      ]),
    );

    // Should still have primary pages
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].id).toBe('home');
    expect(result.features).toEqual(['auth']);
  });

  it('falls back to default page when all archetypes are missing', () => {
    const result = composeArchetypes(
      ['missing-a', 'missing-b'],
      new Map([
        ['missing-a', null],
        ['missing-b', null],
      ]),
    );

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].id).toBe('home');
    expect(result.defaultShell).toBe('sidebar-main');
  });

  it('pages with empty default_layout get fallback hero layout', () => {
    const data = makeArchetype({
      id: 'minimal',
      pages: [{ id: 'home', shell: 'sidebar-main', default_layout: [] }],
      features: [],
    });

    const result = composeArchetypes(['minimal'], new Map([['minimal', data]]));

    expect(result.pages[0].layout).toEqual(['hero']);
  });
});

describe('composeSections', () => {
  it('groups archetypes into sections with role, shell, features, description', () => {
    const dashboard = makeArchetype({
      id: 'dashboard',
      role: 'primary',
      description: 'Main dashboard area',
      pages: [
        { id: 'overview', shell: 'sidebar-main', default_layout: ['kpi-grid', 'chart-grid'] },
        { id: 'analytics', shell: 'sidebar-main', default_layout: ['chart-grid'] },
      ],
      features: ['auth', 'notifications'],
    });
    const landing = makeArchetype({
      id: 'landing',
      role: 'public',
      description: 'Public landing page',
      pages: [{ id: 'home', shell: 'top-nav-main', default_layout: ['hero'] }],
      features: ['analytics'],
    });

    const result = composeSections(
      ['dashboard', 'landing'],
      new Map([
        ['dashboard', dashboard],
        ['landing', landing],
      ]),
    );

    expect(result.sections).toHaveLength(2);

    expect(result.sections[0].id).toBe('dashboard');
    expect(result.sections[0].role).toBe('primary');
    expect(result.sections[0].shell).toBe('sidebar-main');
    expect(result.sections[0].features).toEqual(['auth', 'notifications']);
    expect(result.sections[0].description).toBe('Main dashboard area');
    expect(result.sections[0].pages).toHaveLength(2);

    expect(result.sections[1].id).toBe('landing');
    expect(result.sections[1].role).toBe('public');
    expect(result.sections[1].shell).toBe('top-nav-main');
    expect(result.sections[1].features).toEqual(['analytics']);
    expect(result.sections[1].description).toBe('Public landing page');
    expect(result.sections[1].pages).toHaveLength(1);
  });

  it('applies features_add and features_remove', () => {
    const data = makeArchetype({
      id: 'dashboard',
      role: 'primary',
      description: 'Dashboard',
      pages: [{ id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] }],
      features: ['auth', 'notifications'],
    });

    const overrides: BlueprintOverrides = {
      features_add: ['payments', 'search'],
      features_remove: ['notifications'],
    };

    const result = composeSections(['dashboard'], new Map([['dashboard', data]]), overrides);

    expect(result.features).toContain('auth');
    expect(result.features).toContain('payments');
    expect(result.features).toContain('search');
    expect(result.features).not.toContain('notifications');
  });

  it('applies pages_remove', () => {
    const data = makeArchetype({
      id: 'dashboard',
      role: 'primary',
      description: 'Dashboard',
      pages: [
        { id: 'overview', shell: 'sidebar-main', default_layout: ['kpi-grid'] },
        { id: 'analytics', shell: 'sidebar-main', default_layout: ['chart-grid'] },
        { id: 'settings', shell: 'sidebar-main', default_layout: ['form-sections'] },
      ],
      features: [],
    });

    const overrides: BlueprintOverrides = {
      pages_remove: ['analytics'],
    };

    const result = composeSections(['dashboard'], new Map([['dashboard', data]]), overrides);

    expect(result.sections[0].pages).toHaveLength(2);
    expect(result.sections[0].pages.map((p) => p.id)).toEqual(['overview', 'settings']);
  });

  it('returns default section for empty compose', () => {
    const result = composeSections([], new Map());

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].id).toBe('default');
    expect(result.sections[0].role).toBe('primary');
    expect(result.sections[0].shell).toBe('sidebar-main');
    expect(result.sections[0].pages).toHaveLength(1);
    expect(result.sections[0].pages[0].id).toBe('home');
    expect(result.features).toEqual([]);
    expect(result.defaultShell).toBe('sidebar-main');
  });

  it('primary archetype sets defaultShell', () => {
    const primary = makeArchetype({
      id: 'landing',
      role: 'public',
      description: 'Landing',
      pages: [{ id: 'home', shell: 'top-nav-main', default_layout: ['hero'] }],
      features: [],
    });
    const secondary = makeArchetype({
      id: 'dashboard',
      role: 'primary',
      description: 'Dashboard',
      pages: [{ id: 'overview', shell: 'sidebar-main', default_layout: ['kpi-grid'] }],
      features: [],
    });

    const result = composeSections(
      ['landing', 'dashboard'],
      new Map([
        ['landing', primary],
        ['dashboard', secondary],
      ]),
    );

    expect(result.defaultShell).toBe('top-nav-main');
  });

  it('pages keep original IDs (no prefixing)', () => {
    const dashboard = makeArchetype({
      id: 'dashboard',
      role: 'primary',
      description: 'Dashboard',
      pages: [{ id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] }],
      features: [],
    });
    const chatbot = makeArchetype({
      id: 'ai-chatbot',
      role: 'auxiliary',
      description: 'AI chatbot',
      pages: [
        { id: 'home', shell: 'top-nav-main', default_layout: ['chat-window'] },
        { id: 'history', shell: 'top-nav-main', default_layout: ['data-table'] },
      ],
      features: [],
    });

    const result = composeSections(
      ['dashboard', 'ai-chatbot'],
      new Map([
        ['dashboard', dashboard],
        ['ai-chatbot', chatbot],
      ]),
    );

    // Secondary archetype pages keep original IDs (no prefixing)
    expect(result.sections[1].pages[0].id).toBe('home');
    expect(result.sections[1].pages[1].id).toBe('history');

    // Primary archetype pages also keep original IDs
    expect(result.sections[0].pages[0].id).toBe('home');
  });

  it('resolves aliased default_layout entries to concrete pattern ids in sectioned composition', () => {
    const terminal = makeArchetype({
      id: 'terminal-home',
      role: 'primary',
      description: 'Terminal dashboard',
      pages: [
        {
          id: 'home',
          shell: 'terminal-split',
          default_layout: ['status', 'main-split', 'hotkeys'],
          patterns: [
            { pattern: 'status-bar', preset: 'top', as: 'status' },
            { pattern: 'split-pane', preset: 'horizontal', as: 'main-split' },
            { pattern: 'hotkey-bar', preset: 'standard', as: 'hotkeys' },
          ],
        },
      ],
      features: ['keyboard-shortcuts'],
    });

    const result = composeSections(['terminal-home'], new Map([['terminal-home', terminal]]));

    expect(result.sections[0].pages[0].layout).toEqual([
      { pattern: 'status-bar', preset: 'top' },
      { pattern: 'split-pane', preset: 'horizontal' },
      { pattern: 'hotkey-bar', preset: 'standard' },
    ]);
  });
});
