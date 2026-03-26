import { describe, it, expect } from 'vitest';
import { buildPageIR } from '../src/ir.js';
import type { StructurePage } from '@decantr/essence-spec';
import type { Pattern, ResolvedPreset } from '@decantr/registry';
import type { IRWiring, IRPatternNode, IRGridNode } from '../src/types.js';

function makePattern(id: string, overrides?: Partial<Pattern>): Pattern {
  return {
    id,
    version: '1.0.0',
    name: id.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
    description: `${id} pattern`,
    tags: [],
    components: ['Card', 'Button'],
    default_preset: 'default',
    presets: {
      default: {
        description: 'Default preset',
        blend: { layout: 'column', atoms: '_flex _col _gap4' },
        code: {
          imports: "import { tags } from 'decantr/tags';",
          example: `function ${id.replace(/-/g, '')}() { return 'hello'; }`,
        },
      },
    },
    ...overrides,
  };
}

function makeResolvedPreset(preset?: Partial<ResolvedPreset>): ResolvedPreset {
  return {
    preset: 'default',
    blend: { layout: 'column', atoms: '_flex _col _gap4' },
    code: {
      imports: "import { tags } from 'decantr/tags';",
      example: 'function Test() { return "test"; }',
    },
    ...preset,
  };
}

const defaultDensity = { gap: '4' };

describe('buildPageIR', () => {
  it('converts string blend items to IRPatternNode', () => {
    const page: StructurePage = { id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid'] };
    const pattern = makePattern('kpi-grid');
    const preset = makeResolvedPreset();
    const patterns = new Map([['kpi-grid', { pattern, preset }]]);

    const ir = buildPageIR(page, patterns, null, null, defaultDensity);

    expect(ir.type).toBe('page');
    expect(ir.pageId).toBe('overview');
    expect(ir.children.length).toBe(1);
    expect(ir.children[0].type).toBe('pattern');
    const patternNode = ir.children[0] as IRPatternNode;
    expect(patternNode.pattern.patternId).toBe('kpi-grid');
    expect(patternNode.pattern.alias).toBe('kpi-grid');
  });

  it('converts PatternRef blend items with alias', () => {
    const page: StructurePage = {
      id: 'catalog',
      shell: 'top-nav-main',
      layout: [{ pattern: 'card-grid', preset: 'product', as: 'product-grid' }],
    };
    const pattern = makePattern('card-grid', {
      presets: {
        product: {
          description: 'Product grid',
          blend: { layout: 'grid', atoms: '_grid _gc4 _gap4' },
          code: { imports: '', example: 'function ProductGrid() {}' },
        },
      },
    });
    const preset = makeResolvedPreset({ preset: 'product', blend: { layout: 'grid', atoms: '_grid _gc4 _gap4' } });
    const patterns = new Map([['product-grid', { pattern, preset }]]);

    const ir = buildPageIR(page, patterns, null, null, defaultDensity);

    expect(ir.children.length).toBe(1);
    const node = ir.children[0] as IRPatternNode;
    expect(node.pattern.patternId).toBe('card-grid');
    expect(node.pattern.alias).toBe('product-grid');
  });

  it('converts ColumnLayout to IRGridNode with children', () => {
    const page: StructurePage = {
      id: 'overview',
      shell: 'sidebar-main',
      layout: [{ cols: ['filter-bar', 'data-table'], at: 'lg' }],
    };
    const filterPattern = makePattern('filter-bar');
    const tablePattern = makePattern('data-table');
    const filterPreset = makeResolvedPreset();
    const tablePreset = makeResolvedPreset();
    const patterns = new Map([
      ['filter-bar', { pattern: filterPattern, preset: filterPreset }],
      ['data-table', { pattern: tablePattern, preset: tablePreset }],
    ]);

    const ir = buildPageIR(page, patterns, null, null, defaultDensity);

    expect(ir.children.length).toBe(1);
    const grid = ir.children[0] as IRGridNode;
    expect(grid.type).toBe('grid');
    expect(grid.cols).toBe(2);
    expect(grid.breakpoint).toBe('lg');
    expect(grid.spans).toBeNull();
    expect(grid.children.length).toBe(2);
    expect((grid.children[0] as IRPatternNode).pattern.patternId).toBe('filter-bar');
    expect((grid.children[1] as IRPatternNode).pattern.patternId).toBe('data-table');
  });

  it('computes weighted spans for { cols, span } layout', () => {
    const page: StructurePage = {
      id: 'detail',
      shell: 'sidebar-main',
      layout: [{ cols: ['sidebar', 'main'], span: { main: 3 } }],
    };
    const sidebarPattern = makePattern('sidebar');
    const mainPattern = makePattern('main');
    const patterns = new Map([
      ['sidebar', { pattern: sidebarPattern, preset: makeResolvedPreset() }],
      ['main', { pattern: mainPattern, preset: makeResolvedPreset() }],
    ]);

    const ir = buildPageIR(page, patterns, null, null, defaultDensity);

    const grid = ir.children[0] as IRGridNode;
    expect(grid.spans).toEqual({ sidebar: 1, main: 3 });
    expect(grid.cols).toBe(4); // 1 + 3
  });

  it('skips card wrapping for hero/row layouts', () => {
    const page: StructurePage = {
      id: 'home',
      shell: 'full-bleed',
      layout: ['hero'],
    };
    const heroPattern = makePattern('hero', {
      presets: {
        default: {
          description: 'Landing hero',
          blend: { layout: 'hero', atoms: '_flex _col _aic' },
          code: { imports: '', example: 'function Hero() {}' },
        },
      },
    });
    const heroPreset = makeResolvedPreset({ blend: { layout: 'hero', atoms: '_flex _col _aic' } });
    const patterns = new Map([['hero', { pattern: heroPattern, preset: heroPreset }]]);

    const ir = buildPageIR(page, patterns, null, null, defaultDensity);

    const node = ir.children[0] as IRPatternNode;
    expect(node.card).toBeNull();
    expect(node.pattern.standalone).toBe(true);
  });

  it('applies recipe card_wrapping=none to skip all cards', () => {
    const page: StructurePage = {
      id: 'overview',
      shell: 'sidebar-main',
      layout: ['kpi-grid'],
    };
    const pattern = makePattern('kpi-grid');
    const preset = makeResolvedPreset();
    const patterns = new Map([['kpi-grid', { pattern, preset }]]);
    const recipe = {
      id: 'test',
      style: 'test',
      mode: 'dark',
      schema_version: '2.0',
      spatial_hints: {
        density_bias: 0,
        content_gap_shift: 0,
        section_padding: '',
        card_wrapping: 'none' as const,
        surface_override: null,
      },
      carafe: { preferred: [], nav_style: 'minimal' },
      visual_effects: { enabled: false, intensity: 'subtle' as const, type_mapping: {}, component_fallback: {} },
      pattern_preferences: { prefer: [], avoid: [] },
    };

    const ir = buildPageIR(page, patterns, null, recipe, defaultDensity);

    const node = ir.children[0] as IRPatternNode;
    expect(node.card).toBeNull();
  });

  it('attaches wiring props to pattern nodes', () => {
    const page: StructurePage = {
      id: 'overview',
      shell: 'sidebar-main',
      layout: [{ cols: ['filter-bar', 'data-table'], at: 'lg' }],
    };
    const filterPattern = makePattern('filter-bar');
    const tablePattern = makePattern('data-table');
    const patterns = new Map([
      ['filter-bar', { pattern: filterPattern, preset: makeResolvedPreset() }],
      ['data-table', { pattern: tablePattern, preset: makeResolvedPreset() }],
    ]);
    const wiring: IRWiring = {
      signals: [
        { name: 'pageSearch', setter: 'setPageSearch', init: "''", hookType: 'search' },
        { name: 'pageStatus', setter: 'setPageStatus', init: "'all'", hookType: 'filter' },
      ],
      props: {
        'filter-bar': { onSearch: 'setPageSearch', onCategory: 'setPageStatus' },
        'data-table': { search: 'pageSearch', status: 'pageStatus' },
      },
      hooks: ['search', 'filter'],
      hookProps: {
        'filter-bar': { search: 'search', filters: 'filters' },
        'data-table': { search: 'search', filters: 'filters' },
      },
    };

    const ir = buildPageIR(page, patterns, wiring, null, defaultDensity);

    const grid = ir.children[0] as IRGridNode;
    const filterNode = grid.children[0] as IRPatternNode;
    const tableNode = grid.children[1] as IRPatternNode;
    expect(filterNode.wireProps).toEqual({ onSearch: 'setPageSearch', onCategory: 'setPageStatus' });
    expect(tableNode.wireProps).toEqual({ search: 'pageSearch', status: 'pageStatus' });
  });

  it('uses density gap for grid spatial', () => {
    const page: StructurePage = {
      id: 'test',
      shell: 'sidebar-main',
      layout: [{ cols: ['a', 'b'], at: 'md' }],
    };
    const patterns = new Map([
      ['a', { pattern: makePattern('a'), preset: makeResolvedPreset() }],
      ['b', { pattern: makePattern('b'), preset: makeResolvedPreset() }],
    ]);

    const ir = buildPageIR(page, patterns, null, null, { gap: '6' });

    const grid = ir.children[0] as IRGridNode;
    expect(grid.spatial?.gap).toBe('6');
  });
});
