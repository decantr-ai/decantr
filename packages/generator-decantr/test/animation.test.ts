import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode, IRGridNode } from '@decantr/generator-core';
import type { AnimationConfig } from '../src/emit-page.js';

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

function makePage(id: string, children: any[]): IRPageNode {
  return {
    type: 'page',
    id,
    children,
    pageId: id,
    surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
    wiring: null,
  };
}

function makeGrid(children: IRPatternNode[], cols?: number): IRGridNode {
  return {
    type: 'grid',
    id: 'grid-test',
    children,
    cols: cols || children.length,
    spans: null,
    breakpoint: 'lg',
    spatial: { gap: '4' },
  };
}

describe('entrance animations', () => {
  // --- Page entrance ---

  it('page container has d-page-enter class by default', () => {
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.content).toContain('d-page-enter');
  });

  it('page container uses d-page-enter-slide-up for slide-up animation', () => {
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page, { animation: { page_enter: 'slide-up' } });

    expect(result.content).toContain('d-page-enter-slide-up');
    expect(result.content).not.toMatch(/css\('[^']*d-page-enter[^-]/);
  });

  it('page container uses d-page-enter-slide-left for slide-left animation', () => {
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page, { animation: { page_enter: 'slide-left' } });

    expect(result.content).toContain('d-page-enter-slide-left');
  });

  it('page container uses d-page-enter for fade animation (explicit)', () => {
    const pattern = makePatternNode('kpi-grid', { card: null });
    const page = makePage('overview', [pattern]);
    const result = emitPage(page, { animation: { page_enter: 'fade' } });

    expect(result.content).toContain('d-page-enter');
    expect(result.content).not.toContain('d-page-enter-fade');
  });

  // --- "none" mode ---

  it('animation.page_enter = "none" skips all animation classes', () => {
    const grid = makeGrid([
      makePatternNode('card-a'),
      makePatternNode('card-b'),
    ]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page, { animation: { page_enter: 'none' } });

    expect(result.content).not.toContain('d-page-enter');
    expect(result.content).not.toContain('d-card-enter');
    expect(result.content).not.toContain('d-stagger');
    expect(result.content).not.toContain('d-stagger-item');
    expect(result.content).not.toContain('--stagger-index');
  });

  // --- Card entrance ---

  it('Card wrappers have d-card-enter class by default', () => {
    const pattern = makePatternNode('kpi-grid');
    const page = makePage('overview', [pattern]);
    const result = emitPage(page);

    expect(result.content).toContain('d-card-enter');
    expect(result.content).toContain('Card(');
  });

  it('Card wrappers skip d-card-enter when card_enter is false', () => {
    const pattern = makePatternNode('kpi-grid');
    const page = makePage('overview', [pattern]);
    const result = emitPage(page, { animation: { card_enter: false } });

    expect(result.content).not.toContain('d-card-enter');
    expect(result.content).toContain('Card(');
  });

  // --- Stagger on grids ---

  it('grid container has d-stagger class by default', () => {
    const grid = makeGrid([
      makePatternNode('card-a', { card: null }),
      makePatternNode('card-b', { card: null }),
    ]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page);

    expect(result.content).toContain('d-stagger');
  });

  it('grid children have d-stagger-item class and --stagger-index', () => {
    const grid = makeGrid([
      makePatternNode('card-a', { card: null }),
      makePatternNode('card-b', { card: null }),
      makePatternNode('card-c', { card: null }),
    ]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page);

    expect(result.content).toContain('d-stagger-item');
    expect(result.content).toContain('--stagger-index: 0');
    expect(result.content).toContain('--stagger-index: 1');
    expect(result.content).toContain('--stagger-index: 2');
  });

  it('stagger index increments correctly across children', () => {
    const grid = makeGrid([
      makePatternNode('a', { card: null }),
      makePatternNode('b', { card: null }),
      makePatternNode('c', { card: null }),
      makePatternNode('d', { card: null }),
    ], 4);
    const page = makePage('overview', [grid]);
    const result = emitPage(page);

    for (let i = 0; i < 4; i++) {
      expect(result.content).toContain(`--stagger-index: ${i}`);
    }
  });

  it('stagger uses default 50ms delay', () => {
    const grid = makeGrid([
      makePatternNode('card-a', { card: null }),
    ]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page);

    expect(result.content).toContain('--stagger-delay: 50ms');
  });

  it('stagger uses custom delay from animation config', () => {
    const grid = makeGrid([
      makePatternNode('card-a', { card: null }),
    ]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page, { animation: { stagger_delay: 100 } });

    expect(result.content).toContain('--stagger-delay: 100ms');
  });

  it('grid skips stagger classes when stagger is false', () => {
    const grid = makeGrid([
      makePatternNode('card-a', { card: null }),
      makePatternNode('card-b', { card: null }),
    ]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page, { animation: { stagger: false } });

    expect(result.content).not.toContain('d-stagger');
    expect(result.content).not.toContain('d-stagger-item');
    expect(result.content).not.toContain('--stagger-index');
  });

  // --- Weighted grid with stagger ---

  it('weighted grid children have d-stagger-item with correct indices', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-weighted',
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

    expect(result.content).toContain('d-stagger');
    expect(result.content).toContain('d-stagger-item');
    expect(result.content).toContain('--stagger-index: 0');
    expect(result.content).toContain('--stagger-index: 1');
  });

  // --- Combined: card-enter + stagger in grid ---

  it('cards inside grid have both d-card-enter and parent has d-stagger', () => {
    const grid = makeGrid([
      makePatternNode('card-a'),
      makePatternNode('card-b'),
    ]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page);

    expect(result.content).toContain('d-card-enter');
    expect(result.content).toContain('d-stagger');
    expect(result.content).toContain('d-stagger-item');
    expect(result.content).toContain('d-page-enter');
  });

  // --- Recipe animation config overrides ---

  it('recipe animation config overrides defaults', () => {
    const grid = makeGrid([makePatternNode('card-a')]);
    const page = makePage('overview', [grid]);
    const result = emitPage(page, {
      animation: {
        page_enter: 'slide-left',
        stagger: true,
        stagger_delay: 75,
        card_enter: true,
      },
    });

    expect(result.content).toContain('d-page-enter-slide-left');
    expect(result.content).toContain('d-stagger');
    expect(result.content).toContain('d-card-enter');
    expect(result.content).toContain('--stagger-delay: 75ms');
  });
});
