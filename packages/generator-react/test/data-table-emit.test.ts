import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import { resolvePatternTemplate } from '../src/shadcn.js';
import { validateReactOutput } from '../src/quality-rules.js';
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
      code: null,
      components: ['Table', 'Checkbox', 'Button', 'Input', 'Badge'],
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

describe('data-table React emission', () => {
  it('emits a page with data-table pattern', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/users.tsx');
    expect(result.content).toContain('function DataTable');
  });

  it('uses data-table-specific template with Table components', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('<Table>');
    expect(result.content).toContain('<TableHeader>');
    expect(result.content).toContain('<TableBody>');
    expect(result.content).toContain('<TableRow');
    expect(result.content).toContain('<TableHead');
    expect(result.content).toContain('<TableCell');
  });

  it('includes Table and Checkbox shadcn imports', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('@/components/ui/table');
    expect(result.content).toContain('@/components/ui/checkbox');
  });

  it('renders sample data rows in template', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Alice Johnson');
    expect(result.content).toContain('$1,200');
  });

  it('uses Checkbox for row selection', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('<Checkbox');
  });

  it('includes DropdownMenu for column visibility', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('<DropdownMenu>');
    expect(result.content).toContain('Columns');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeDataTablePatternNode({
      card: { mode: 'always', headerLabel: 'User Table' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('CardHeader');
    expect(result.content).toContain('User Table');
  });

  it('passes quality validation with zero CRITICAL/HIGH violations', () => {
    const node = makeDataTablePatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    const violations = validateReactOutput([result]);
    const criticalOrHigh = violations.filter(
      v => v.severity === 'critical' || v.severity === 'high',
    );
    expect(criticalOrHigh).toEqual([]);
  });
});

describe('data-table pattern template', () => {
  it('resolves data-table template from PATTERN_TEMPLATE_MAP', () => {
    const tmpl = resolvePatternTemplate('data-table');
    expect(tmpl).not.toBeNull();
  });

  it('template imports include Table and Checkbox', () => {
    const tmpl = resolvePatternTemplate('data-table')!;
    expect(tmpl.imports.has('@/components/ui/table')).toBe(true);
    expect(tmpl.imports.has('@/components/ui/checkbox')).toBe(true);
  });

  it('template body generates table layout', () => {
    const tmpl = resolvePatternTemplate('data-table')!;
    const body = tmpl.body('gap-4');
    expect(body).toContain('<Table>');
    expect(body).toContain('<TableHeader>');
    expect(body).toContain('<TableBody>');
    expect(body).toContain('<Checkbox');
    expect(body).toContain('Previous');
    expect(body).toContain('Next');
  });
});
