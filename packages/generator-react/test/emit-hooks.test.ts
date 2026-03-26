import { describe, it, expect } from 'vitest';
import { emitHooks, HOOK_REGISTRY } from '../src/emit-hooks.js';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode, IRWiring, IRHookType } from '@decantr/generator-core';

function makePatternNode(id: string, overrides?: Partial<IRPatternNode>): IRPatternNode {
  return {
    type: 'pattern',
    id,
    children: [],
    pattern: {
      patternId: id,
      preset: 'default',
      alias: id,
      layout: 'column',
      contained: false,
      standalone: false,
      code: null,
      components: ['Card'],
    },
    card: null,
    visualEffects: null,
    wireProps: null,
    spatial: { gap: '4' },
    ...overrides,
  };
}

function makePage(id: string, children: any[], wiring?: IRWiring | null): IRPageNode {
  return {
    type: 'page',
    id,
    children,
    pageId: id,
    surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
    wiring: wiring || null,
  };
}

function makeHookWiring(hooks: IRHookType[]): IRWiring {
  const signals = hooks.map(h => {
    const meta = HOOK_REGISTRY[h];
    return {
      name: `page${meta.variableName.charAt(0).toUpperCase() + meta.variableName.slice(1)}`,
      setter: `setPage${meta.variableName.charAt(0).toUpperCase() + meta.variableName.slice(1)}`,
      init: "''",
      hookType: h,
    };
  });
  return {
    signals,
    props: {},
    hooks,
    hookProps: {
      'filter-bar': Object.fromEntries(hooks.map(h => [HOOK_REGISTRY[h].variableName, HOOK_REGISTRY[h].variableName])),
      'data-table': Object.fromEntries(hooks.map(h => [HOOK_REGISTRY[h].variableName, HOOK_REGISTRY[h].variableName])),
    },
  };
}

describe('emitHooks', () => {
  it('generates usePageSearch with debounce logic', () => {
    const files = emitHooks(new Set<IRHookType>(['search']));
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe('src/hooks/usePageSearch.ts');
    expect(files[0].content).toContain('export function usePageSearch');
    expect(files[0].content).toContain('debouncedSearch');
    expect(files[0].content).toContain('setTimeout');
    expect(files[0].content).toContain('300');
    expect(files[0].content).toContain('clearSearch');
  });

  it('generates usePageFilters with add/remove/clear', () => {
    const files = emitHooks(new Set<IRHookType>(['filter']));
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe('src/hooks/usePageFilters.ts');
    expect(files[0].content).toContain('export function usePageFilters');
    expect(files[0].content).toContain('setFilter');
    expect(files[0].content).toContain('removeFilter');
    expect(files[0].content).toContain('clearFilters');
    expect(files[0].content).toContain('activeFilterCount');
  });

  it('generates usePageSelection with toggle/selectAll', () => {
    const files = emitHooks(new Set<IRHookType>(['selection']));
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe('src/hooks/usePageSelection.ts');
    expect(files[0].content).toContain('export function usePageSelection');
    expect(files[0].content).toContain('select');
    expect(files[0].content).toContain('deselect');
    expect(files[0].content).toContain('toggleSelect');
    expect(files[0].content).toContain('selectAll');
    expect(files[0].content).toContain('clearSelection');
    expect(files[0].content).toContain('isSelected');
  });

  it('generates usePageSort with toggle', () => {
    const files = emitHooks(new Set<IRHookType>(['sort']));
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe('src/hooks/usePageSort.ts');
    expect(files[0].content).toContain('export function usePageSort');
    expect(files[0].content).toContain('sortColumn');
    expect(files[0].content).toContain('sortDirection');
    expect(files[0].content).toContain('toggleSort');
  });

  it('only generates hooks that are needed', () => {
    const files = emitHooks(new Set<IRHookType>(['search', 'filter']));
    expect(files).toHaveLength(2);
    const paths = files.map(f => f.path);
    expect(paths).toContain('src/hooks/usePageSearch.ts');
    expect(paths).toContain('src/hooks/usePageFilters.ts');
    expect(paths).not.toContain('src/hooks/usePageSelection.ts');
    expect(paths).not.toContain('src/hooks/usePageSort.ts');
  });

  it('returns empty array when no hook types provided', () => {
    const files = emitHooks(new Set<IRHookType>());
    expect(files).toHaveLength(0);
  });
});

describe('emitPage with hook-based wiring', () => {
  it('uses custom hooks instead of useState for wired pages', () => {
    const wiring = makeHookWiring(['search', 'filter']);
    const filterBar = makePatternNode('filter-bar');
    const dataTable = makePatternNode('data-table');
    const page = makePage('overview', [filterBar, dataTable], wiring);
    const result = emitPage(page);

    // Should import hooks, not useState
    expect(result.content).toContain('usePageSearch');
    expect(result.content).toContain('usePageFilters');
    expect(result.content).toContain("from '@/hooks/usePageSearch'");
    expect(result.content).toContain("from '@/hooks/usePageFilters'");
    // Should call hooks
    expect(result.content).toContain('const search = usePageSearch()');
    expect(result.content).toContain('const filters = usePageFilters()');
  });

  it('generates page state interface for wired pages', () => {
    const wiring = makeHookWiring(['search', 'filter']);
    const filterBar = makePatternNode('filter-bar');
    const dataTable = makePatternNode('data-table');
    const page = makePage('overview', [filterBar, dataTable], wiring);
    const result = emitPage(page);

    expect(result.content).toContain('interface OverviewPageState');
    expect(result.content).toContain('search: string');
    expect(result.content).toContain('filters: Record<string, string>');
  });

  it('generates typed props interfaces for wired pattern components', () => {
    const wiring = makeHookWiring(['search']);
    const filterBar = makePatternNode('filter-bar');
    const page = makePage('overview', [filterBar], wiring);
    const result = emitPage(page);

    expect(result.content).toContain('interface FilterBarProps');
    expect(result.content).toContain('PageSearchState');
  });

  it('passes hook variables as props to pattern components', () => {
    const wiring = makeHookWiring(['search']);
    const filterBar = makePatternNode('filter-bar');
    const dataTable = makePatternNode('data-table');
    const page = makePage('overview', [filterBar, dataTable], wiring);
    const result = emitPage(page);

    expect(result.content).toContain('search={search}');
  });

  it('standalone patterns without wiring use no hooks', () => {
    const hero = makePatternNode('hero', {
      pattern: {
        patternId: 'hero',
        preset: 'landing',
        alias: 'hero',
        layout: 'hero',
        contained: false,
        standalone: true,
        code: null,
        components: ['Button'],
      },
    });
    const page = makePage('home', [hero]);
    const result = emitPage(page);

    expect(result.content).not.toContain('usePageSearch');
    expect(result.content).not.toContain('usePageFilters');
    expect(result.content).not.toContain('useState');
    expect(result.content).toContain('<Hero />');
  });

  it('only generates hooks needed by the page', () => {
    // Only search hook, no filter
    const wiring: IRWiring = {
      signals: [{ name: 'pageSearch', setter: 'setPageSearch', init: "''", hookType: 'search' }],
      props: {},
      hooks: ['search'],
      hookProps: {
        'filter-bar': { search: 'search' },
        'card-grid': { search: 'search' },
      },
    };
    const page = makePage('catalog', [
      makePatternNode('filter-bar'),
      makePatternNode('card-grid'),
    ], wiring);
    const result = emitPage(page);

    expect(result.content).toContain('usePageSearch');
    expect(result.content).not.toContain('usePageFilters');
    expect(result.content).not.toContain('usePageSelection');
  });
});

describe('HOOK_REGISTRY', () => {
  it('has entries for all four hook types', () => {
    expect(HOOK_REGISTRY.search).toBeDefined();
    expect(HOOK_REGISTRY.filter).toBeDefined();
    expect(HOOK_REGISTRY.selection).toBeDefined();
    expect(HOOK_REGISTRY.sort).toBeDefined();
  });

  it('each entry has consistent metadata', () => {
    for (const meta of Object.values(HOOK_REGISTRY)) {
      expect(meta.fileName).toBeTruthy();
      expect(meta.hookName).toBeTruthy();
      expect(meta.typeName).toBeTruthy();
      expect(meta.variableName).toBeTruthy();
    }
  });
});
