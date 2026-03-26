import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode, IRGridNode } from '@decantr/generator-core';

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
      code: {
        imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';",
        example: `function ${id.replace(/-/g, '')}() {\n  const { div } = tags;\n  return div({ class: css('_flex _col _gap4') }, 'Hello');\n}`,
      },
      components: [],
    },
    card: null,
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

describe('responsive grid emission', () => {
  it('single breakpoint grid emits _gc1 → _lg:gc2', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-a-b',
      children: [makePatternNode('a'), makePatternNode('b')],
      cols: 2,
      spans: null,
      breakpoint: 'lg',
      spatial: { gap: '4' },
    };
    const result = emitPage(makePage('test', [grid]));
    expect(result.content).toContain('_grid _gc1 _lg:gc2 _gap4');
  });

  it('weighted columns with breakpoint emit responsive span atoms', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-a-b',
      children: [makePatternNode('a'), makePatternNode('b')],
      cols: 4,
      spans: { a: 3, b: 1 },
      breakpoint: 'md',
      spatial: { gap: '4' },
    };
    const result = emitPage(makePage('test', [grid]));
    expect(result.content).toContain('_grid _gc1 _md:gc4 _gap4');
    expect(result.content).toContain('_md:span3');
    expect(result.content).toContain('_md:span1');
  });

  it('multi-breakpoint grid emits cascading atoms', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-cards',
      children: [makePatternNode('a'), makePatternNode('b'), makePatternNode('c')],
      cols: 3,
      spans: null,
      breakpoint: null,
      breakpoints: [
        { at: 'sm', cols: 2 },
        { at: 'lg', cols: 3 },
        { at: 'xl', cols: 4 },
      ],
      spatial: { gap: '4' },
    };
    const result = emitPage(makePage('test', [grid]));
    expect(result.content).toContain('_grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4');
  });

  it('container query atoms emitted when responsive is "container"', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-container',
      children: [makePatternNode('a'), makePatternNode('b')],
      cols: 2,
      spans: null,
      breakpoint: null,
      breakpoints: [
        { at: 'sm', cols: 2 },
        { at: 'lg', cols: 3 },
      ],
      responsive: 'container',
      spatial: { gap: '4' },
    };
    const result = emitPage(makePage('test', [grid]));
    expect(result.content).toContain('_grid _container _@sm:gc2 _@lg:gc3 _gap4');
  });

  it('container query weighted grid emits @-prefixed span atoms', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-weighted-cq',
      children: [makePatternNode('sidebar'), makePatternNode('main')],
      cols: 4,
      spans: { sidebar: 1, main: 3 },
      breakpoint: null,
      breakpoints: [{ at: 'md', cols: 4 }],
      responsive: 'container',
      spatial: { gap: '4' },
    };
    const result = emitPage(makePage('test', [grid]));
    expect(result.content).toContain('_container');
    expect(result.content).toContain('_@md:span1');
    expect(result.content).toContain('_@md:span3');
  });

  it('gap scales with density gap value', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-a-b',
      children: [makePatternNode('a', { spatial: { gap: '6' } }), makePatternNode('b')],
      cols: 2,
      spans: null,
      breakpoint: 'lg',
      spatial: { gap: '6' },
    };
    const page = makePage('test', [grid]);
    // Override the first child's spatial gap so densityGap resolves to 6
    page.children[0] = grid;
    const result = emitPage(page);
    expect(result.content).toContain('_gap6');
  });

  it('weighted grid without breakpoint emits plain span atoms', () => {
    const grid: IRGridNode = {
      type: 'grid',
      id: 'grid-a-b',
      children: [makePatternNode('a'), makePatternNode('b')],
      cols: 4,
      spans: { a: 3, b: 1 },
      breakpoint: null,
      spatial: { gap: '4' },
    };
    const result = emitPage(makePage('test', [grid]));
    expect(result.content).toContain('_grid _gc4 _gap4');
    expect(result.content).toContain('_span3');
    expect(result.content).toContain('_span1');
  });
});
