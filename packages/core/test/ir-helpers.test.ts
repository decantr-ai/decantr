import { describe, it, expect } from 'vitest';
import { walkIR, findNodes, countPatterns, validateIR } from '../src/ir-helpers.js';
import type { IRNode, IRPageNode, IRPatternNode, IRGridNode } from '../src/types.js';

function makePage(children: IRNode[]): IRPageNode {
  return {
    type: 'page',
    id: 'test-page',
    children,
    pageId: 'test-page',
    surface: '_flex _col _gap4',
    wiring: null,
  };
}

function makePatternNode(id: string): IRPatternNode {
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
      components: [],
    },
    card: null,
    visualEffects: null,
    wireProps: null,
  };
}

function makeGrid(id: string, children: IRNode[]): IRGridNode {
  return {
    type: 'grid',
    id,
    children,
    cols: children.length,
    spans: null,
    breakpoint: 'lg',
  };
}

describe('walkIR', () => {
  it('visits all nodes depth-first', () => {
    const p1 = makePatternNode('a');
    const p2 = makePatternNode('b');
    const grid = makeGrid('grid-1', [p1, p2]);
    const page = makePage([grid]);

    const visited: string[] = [];
    walkIR(page, (node) => visited.push(node.id));

    expect(visited).toEqual(['test-page', 'grid-1', 'a', 'b']);
  });
});

describe('findNodes', () => {
  it('returns all pattern nodes', () => {
    const p1 = makePatternNode('a');
    const p2 = makePatternNode('b');
    const p3 = makePatternNode('c');
    const grid = makeGrid('grid-1', [p1, p2]);
    const page = makePage([grid, p3]);

    const patterns = findNodes<IRPatternNode>(page, 'pattern');
    expect(patterns.length).toBe(3);
    expect(patterns.map(p => p.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('countPatterns', () => {
  it('counts all patterns including nested in grids', () => {
    const p1 = makePatternNode('a');
    const p2 = makePatternNode('b');
    const grid = makeGrid('grid-1', [p1, p2]);
    const p3 = makePatternNode('c');
    const page = makePage([grid, p3]);

    expect(countPatterns(page)).toBe(3);
  });
});

describe('validateIR', () => {
  it('returns empty array for valid tree', () => {
    const p1 = makePatternNode('a');
    const page = makePage([p1]);
    expect(validateIR(page)).toEqual([]);
  });

  it('catches grid with no children', () => {
    const grid = makeGrid('empty-grid', []);
    const page = makePage([grid]);
    const errors = validateIR(page);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('empty-grid');
    expect(errors[0]).toContain('no children');
  });
});
