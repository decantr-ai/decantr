import { describe, it, expect } from 'vitest';
import { composeArchetypes } from '../src/scaffold.js';
import type { ArchetypeData } from '../src/scaffold.js';

function makeArchetype(overrides: Partial<ArchetypeData> & { pages: ArchetypeData['pages'] }): ArchetypeData {
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

    const result = composeArchetypes(
      ['dashboard'],
      new Map([['dashboard', data]]),
    );

    expect(result.pages).toHaveLength(2);
    expect(result.pages[0].id).toBe('overview');
    expect(result.pages[1].id).toBe('analytics');
    expect(result.defaultShell).toBe('sidebar-main');
    expect(result.features).toEqual(['auth', 'notifications']);
  });

  it('two archetypes: primary has no prefix, secondary pages get archetype ID prefix', () => {
    const dashboard = makeArchetype({
      id: 'dashboard',
      pages: [
        { id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] },
      ],
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
      [
        'marketing-landing',
        { archetype: 'settings-panel', prefix: 'settings' },
      ],
      new Map([
        ['marketing-landing', makeArchetype({
          id: 'marketing-landing',
          pages: [{ id: 'home', shell: 'top-nav-main', default_layout: ['hero'] }],
          features: ['analytics'],
        })],
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
      new Map([['a', a], ['b', b]]),
    );

    expect(result.features).toEqual(['auth', 'notifications', 'search', 'payments']);
  });

  it('secondary archetype with different shell gets shell_override', () => {
    const primary = makeArchetype({
      id: 'dashboard',
      pages: [
        { id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] },
      ],
      features: [],
    });
    const secondary = makeArchetype({
      id: 'landing',
      pages: [
        { id: 'splash', shell: 'top-nav-main', default_layout: ['hero'] },
      ],
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
      pages: [
        { id: 'home', shell: 'sidebar-main', default_layout: ['kpi-grid'] },
      ],
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
      pages: [
        { id: 'home', shell: 'sidebar-main', default_layout: [] },
      ],
      features: [],
    });

    const result = composeArchetypes(
      ['minimal'],
      new Map([['minimal', data]]),
    );

    expect(result.pages[0].layout).toEqual(['hero']);
  });
});
