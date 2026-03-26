import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode, IRGridNode, IRWiring } from '@decantr/generator-core';

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
      contained: true,
      standalone: false,
      code: null,
      components: ['Card'],
    },
    card: {
      mode: 'always',
      headerLabel: id.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
    },
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

describe('emitPage (React)', () => {
  it('generates a .tsx file with React imports', () => {
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/overview.tsx');
    expect(result.content).toContain("from 'react'");
  });

  it('generates pattern components as React function components', () => {
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.content).toContain('function KpiGrid');
    expect(result.content).toContain('return (');
  });

  it('wraps contained patterns in shadcn Card', () => {
    const pattern = makePatternNode('kpi-grid');
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.content).toContain('CardHeader');
    expect(result.content).toContain('CardTitle');
    expect(result.content).toContain('CardContent');
  });

  it('skips Card for hero/standalone patterns', () => {
    const hero = makePatternNode('hero', {
      card: null,
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

    expect(result.content).not.toContain('CardHeader');
    expect(result.content).toContain('<Hero />');
  });

  it('emits Tailwind grid classes for column layouts', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-a-b',
      children: [
        makePatternNode('filter-bar', { card: null }),
        makePatternNode('data-table', { card: null }),
      ],
      cols: 2,
      spans: null,
      breakpoint: null,
      spatial: { gap: '4' },
    };
    const page = makePage('overview', [grid]);
    const result = emitPage(page);

    expect(result.content).toContain('className=');
    expect(result.content).toContain('grid');
    expect(result.content).toContain('grid-cols-2');
  });

  it('emits responsive grid with breakpoint prefix', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-a-b',
      children: [
        makePatternNode('filter-bar', { card: null }),
        makePatternNode('data-table', { card: null }),
      ],
      cols: 2,
      spans: null,
      breakpoint: 'lg',
      spatial: { gap: '4' },
    };
    const page = makePage('overview', [grid]);
    const result = emitPage(page);

    expect(result.content).toContain('lg:grid-cols-2');
  });

  it('emits weighted grid with col-span classes', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-side-main',
      children: [
        makePatternNode('sidebar', { card: null }),
        makePatternNode('main-content', { card: null }),
      ],
      cols: 4,
      spans: { sidebar: 1, 'main-content': 3 },
      breakpoint: null,
      spatial: { gap: '4' },
    };
    const page = makePage('detail', [grid]);
    const result = emitPage(page);

    expect(result.content).toContain('col-span-3');
    expect(result.content).toContain('col-span-1');
  });

  it('emits custom hooks for wiring signals with hook types', () => {
    const wiring: IRWiring = {
      signals: [
        { name: 'pageSearch', setter: 'setPageSearch', init: "''", hookType: 'search' },
        { name: 'pageStatus', setter: 'setPageStatus', init: "'all'", hookType: 'filter' },
      ],
      props: {},
      hooks: ['search', 'filter'],
      hookProps: {
        'kpi-grid': { search: 'search', filters: 'filters' },
      },
    };
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern], wiring);
    const result = emitPage(page);

    expect(result.content).toContain('usePageSearch');
    expect(result.content).toContain('usePageFilters');
    expect(result.content).toContain('const search = usePageSearch()');
    expect(result.content).toContain('const filters = usePageFilters()');
  });

  it('passes hook variables as props to wired pattern components', () => {
    const wiring: IRWiring = {
      signals: [
        { name: 'pageSearch', setter: 'setPageSearch', init: "''", hookType: 'search' },
      ],
      props: {
        'data-table': { search: 'pageSearch' },
      },
      hooks: ['search'],
      hookProps: {
        'data-table': { search: 'search' },
      },
    };
    const dataTable = makePatternNode('data-table', {
      card: null,
      wireProps: { search: 'pageSearch' },
    });
    const page = makePage('overview', [dataTable], wiring);
    const result = emitPage(page);

    expect(result.content).toContain('search={search}');
  });

  it('collects correct shadcn imports for used components', () => {
    const pattern = makePatternNode('kpi-grid');
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.content).toContain("@/components/ui/card");
  });

  it('uses Tailwind surface classes for page container', () => {
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.content).toContain('className="flex flex-col');
  });
});
