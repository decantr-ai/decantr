import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

function makeKpiPatternNode(overrides?: Partial<IRPatternNode>): IRPatternNode {
  return {
    type: 'pattern',
    id: 'kpi-grid',
    children: [],
    pattern: {
      patternId: 'kpi-grid',
      preset: 'dashboard',
      alias: 'kpi-grid',
      layout: 'grid',
      contained: true,
      standalone: false,
      code: {
        imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge, icon } from 'decantr/components';",
        example: "function KpiGrid({ items }) {\n  const { div, span, p } = tags;\n\n  return div({ class: css('_grid _gc2 _lg:gc4 _gap4') },\n    Card({ class: css('_flex _col _gap2 _p4') },\n      span({ class: css('_textsm _fgmuted') }, 'Revenue'),\n      p({ class: css('_heading2') }, '$45,231')\n    )\n  );\n}",
      },
      components: ['Card', 'icon', 'Badge'],
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
    id: 'dashboard',
    children,
    pageId: 'dashboard',
    surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
    wiring: null,
  };
}

describe('kpi-grid Decantr emission', () => {
  it('emits a .js page file', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/dashboard.js');
  });

  it('uses pattern example code with Decantr atoms', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('_grid');
    expect(result.content).toContain('_gc2');
    expect(result.content).toContain('_lg:gc4');
    expect(result.content).toContain('_gap4');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeKpiPatternNode({
      card: { mode: 'always', headerLabel: 'Kpi Grid' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Card(');
    expect(result.content).toContain('Card.Header');
    expect(result.content).toContain('Card.Body');
    expect(result.content).toContain('Kpi Grid');
  });

  it('includes decantr/components import for Card', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('decantr/components');
    expect(result.content).toContain('Card');
  });

  it('replaces gap atoms with density-derived gap', () => {
    const node = makeKpiPatternNode({
      spatial: { gap: '6' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    // _gap4 in pattern code should be replaced with _gap6
    expect(result.content).toContain('_gap6');
  });

  it('emits correct grid layout atoms for kpi-grid', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    // Verify the Decantr-native grid atoms are present
    expect(result.content).toContain('_grid _gc2 _lg:gc4 _gap4');
  });
});
