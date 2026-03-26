import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

function makeChartPatternNode(overrides?: Partial<IRPatternNode>): IRPatternNode {
  return {
    type: 'pattern',
    id: 'chart-grid',
    children: [],
    pattern: {
      patternId: 'chart-grid',
      preset: 'dashboard',
      alias: 'chart-grid',
      layout: 'grid',
      contained: true,
      standalone: false,
      code: {
        imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card } from 'decantr/components';",
        example: "function ChartGrid({ charts }) {\n  const { div, h3, span } = tags;\n\n  const items = charts || [\n    { title: 'Revenue Over Time', type: 'line', legends: ['Revenue', 'Expenses'] },\n    { title: 'Users by Region', type: 'bar', legends: ['NA', 'EU', 'APAC'] },\n  ];\n\n  return div({ class: css('_grid _gc1 _lg:gc2 _gap4') },\n    ...items.map(chart =>\n      Card({ class: css('_flex _col _gap2 _p4') },\n        h3({ class: css('_textsm _fontmedium') }, chart.title),\n        div({ class: css('_minh[200px] _bgmuted/10 _r2 _flex _center'), 'data-chart-type': chart.type },\n          span({ class: css('_fgmuted _textsm') }, `[${chart.type} chart placeholder]`)\n        )\n      )\n    )\n  );\n}",
      },
      components: ['Card'],
    },
    card: null,
    visualEffects: null,
    wireProps: null,
    spatial: { gap: '4' },
    ...overrides,
  };
}

function makePage(children: any[]): IRPageNode {
  return {
    type: 'page',
    id: 'analytics',
    children,
    pageId: 'analytics',
    surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
    wiring: null,
  };
}

describe('chart-grid Decantr emission', () => {
  it('emits a .js page file', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/analytics.js');
  });

  it('uses pattern example code with Decantr grid atoms', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('_grid');
    expect(result.content).toContain('_gc1');
    expect(result.content).toContain('_lg:gc2');
    expect(result.content).toContain('_gap4');
  });

  it('includes chart placeholder with data-chart-type', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('data-chart-type');
    expect(result.content).toContain('chart placeholder');
  });

  it('wraps charts in Card components', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Card(');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeChartPatternNode({
      card: { mode: 'always', headerLabel: 'Chart Grid' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Card(');
    expect(result.content).toContain('Card.Header');
    expect(result.content).toContain('Card.Body');
    expect(result.content).toContain('Chart Grid');
  });

  it('includes decantr/components import for Card', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('decantr/components');
    expect(result.content).toContain('Card');
  });

  it('replaces gap atoms with density-derived gap', () => {
    const node = makeChartPatternNode({
      spatial: { gap: '6' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    // _gap4 in pattern code should be replaced with _gap6
    expect(result.content).toContain('_gap6');
  });
});
