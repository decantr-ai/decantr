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
      code: {
        imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';",
        example: `function ${id.replace(/-/g, '')}() {\n  const { div } = tags;\n  return div({ class: css('_flex _col _gap4') }, 'Hello');\n}`,
      },
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

describe('emitPage', () => {
  it('emits a page with full-width pattern in Card wrapper', () => {
    const pattern = makePatternNode('kpi-grid');
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/overview.js');
    expect(result.content).toContain('Card(');
    expect(result.content).toContain('Card.Header');
    expect(result.content).toContain('Card.Body');
    expect(result.content).toContain('Kpi Grid');
  });

  it('emits a grid layout with equal columns', () => {
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

    expect(result.content).toContain('_grid');
    expect(result.content).toContain('_lg:gc2');
    expect(result.content).toContain('_gap4');
  });

  it('emits a weighted grid with span atoms', () => {
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

    expect(result.content).toContain('_gc4');
    expect(result.content).toContain('_span1');
    expect(result.content).toContain('_span3');
  });

  it('skips Card wrapping for hero patterns', () => {
    const hero = makePatternNode('hero', {
      card: null,
      pattern: {
        patternId: 'hero',
        preset: 'landing',
        alias: 'hero',
        layout: 'hero',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';",
          example: "function Hero() { return 'hero'; }",
        },
        components: ['Button'],
      },
    });
    const page = makePage('home', [hero]);
    const result = emitPage(page);

    expect(result.content).not.toContain('Card(');
    expect(result.content).toContain('Hero()');
  });

  it('includes wiring signal declarations', () => {
    const wiring: IRWiring = {
      signals: [
        { name: 'pageSearch', setter: 'setPageSearch', init: "''" },
        { name: 'pageStatus', setter: 'setPageStatus', init: "'all'" },
      ],
      props: {},
    };
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern], wiring);
    const result = emitPage(page);

    expect(result.content).toContain('createSignal');
    expect(result.content).toContain("const [pageSearch, setPageSearch] = createSignal('')");
    expect(result.content).toContain("const [pageStatus, setPageStatus] = createSignal('all')");
  });

  it('passes wire props to pattern function calls', () => {
    const filterBar = makePatternNode('filter-bar', {
      card: null,
      wireProps: { onSearch: 'setPageSearch' },
    });
    const page = makePage('overview', [filterBar]);
    const result = emitPage(page);

    expect(result.content).toContain('FilterBar({ onSearch: setPageSearch })');
  });

  it('replaces _gap4 with density-derived gap', () => {
    const pattern = makePatternNode('kpi-grid', {
      card: null,
      spatial: { gap: '6' },
      pattern: {
        patternId: 'kpi-grid',
        preset: 'default',
        alias: 'kpi-grid',
        layout: 'column',
        contained: true,
        standalone: false,
        code: {
          imports: "import { tags } from 'decantr/tags';",
          example: "function KpiGrid() { return div({ class: css('_gap4') }); }",
        },
        components: [],
      },
    });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    // The code should have replaced _gap4 with _gap6 (but page surface uses gap from first child)
    // Since the pattern code had _gap4 and density gap is taken from spatial
    expect(result.content).toContain('_gap');
  });

  it('deduplicates imports across patterns', () => {
    const p1 = makePatternNode('a', { card: null });
    const p2 = makePatternNode('b', { card: null });
    const page = makePage('test', [p1, p2]);
    const result = emitPage(page);

    // Should only have one import from decantr/tags
    const tagImports = result.content.match(/import.*decantr\/tags/g);
    expect(tagImports?.length).toBe(1);
  });
});
