import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

function makeDataTablePatternNode(overrides?: Partial<IRPatternNode>): IRPatternNode {
  return {
    type: 'pattern',
    id: 'data-table',
    children: [],
    pattern: {
      patternId: 'data-table',
      preset: 'standard',
      alias: 'data-table',
      layout: 'column',
      contained: true,
      standalone: false,
      code: {
        imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Table, Checkbox, Button, Input, Badge, icon } from 'decantr/components';",
        example: "function DataTable({ search, status, data }) {\n  const { div, span, thead, tbody, tr, th, td } = tags;\n\n  return div({ class: css('_flex _col _gap4 _w[100%] _overflow[auto]') },\n    Table({ class: css('_w[100%]') },\n      thead({},\n        tr({},\n          th({ class: css('_p3 _textleft _textsm _fgmuted') }, 'Name'),\n          th({ class: css('_p3 _textleft _textsm _fgmuted') }, 'Status')\n        )\n      )\n    )\n  );\n}",
      },
      components: ['Table', 'Checkbox', 'Button', 'Input', 'Badge', 'icon'],
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
    id: 'users',
    children,
    pageId: 'users',
    surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
    wiring: null,
  };
}

describe('data-table Decantr emission', () => {
  it('emits a .js page file', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/users.js');
  });

  it('uses pattern example code with Decantr atoms', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('_flex _col _gap4 _w[100%] _overflow[auto]');
    expect(result.content).toContain('_w[100%]');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeDataTablePatternNode({
      card: { mode: 'always', headerLabel: 'Data Table' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Card(');
    expect(result.content).toContain('Card.Header');
    expect(result.content).toContain('Card.Body');
    expect(result.content).toContain('Data Table');
  });

  it('includes decantr/components import for Table', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('decantr/components');
    expect(result.content).toContain('Table');
  });

  it('replaces gap atoms with density-derived gap', () => {
    const node = makeDataTablePatternNode({
      spatial: { gap: '6' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    // _gap4 in pattern code should be replaced with _gap6
    expect(result.content).toContain('_gap6');
  });

  it('emits correct table layout atoms for data-table', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('_w[100%]');
    expect(result.content).toContain('_overflow[auto]');
  });
});
