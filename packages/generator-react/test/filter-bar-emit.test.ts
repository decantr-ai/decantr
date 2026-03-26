import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import { resolvePatternTemplate } from '../src/shadcn.js';
import { validateReactOutput } from '../src/quality-rules.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

function makeFilterBarPatternNode(overrides?: Partial<IRPatternNode>): IRPatternNode {
  return {
    type: 'pattern',
    id: 'filter-bar',
    children: [],
    pattern: {
      patternId: 'filter-bar',
      preset: 'standard',
      alias: 'filter-bar',
      layout: 'row',
      // AUTO: filter-bar has no card wrapping by default (contained: false)
      contained: false,
      standalone: true,
      code: null,
      components: ['Input', 'Select', 'Button', 'Badge'],
    },
    card: null,
    visualEffects: null,
    wireProps: null,
    spatial: { gap: '3' },
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

describe('filter-bar React emission', () => {
  it('emits a page with filter-bar pattern', () => {
    const node = makeFilterBarPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/dashboard.tsx');
    expect(result.content).toContain('function FilterBar');
  });

  it('uses filter-bar-specific template with Input and Select components', () => {
    const node = makeFilterBarPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('<Input');
    expect(result.content).toContain('<Select>');
    expect(result.content).toContain('<SelectTrigger');
    expect(result.content).toContain('<SelectContent>');
    expect(result.content).toContain('<SelectItem');
  });

  it('includes Input and Select shadcn imports', () => {
    const node = makeFilterBarPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('@/components/ui/input');
    expect(result.content).toContain('@/components/ui/select');
  });

  it('renders filter categories and status options', () => {
    const node = makeFilterBarPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Category');
    expect(result.content).toContain('Status');
  });

  it('includes action buttons for clear and apply', () => {
    const node = makeFilterBarPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Clear');
    expect(result.content).toContain('Apply');
  });

  it('uses flex row layout (not card-wrapped)', () => {
    const node = makeFilterBarPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('flex flex-row');
    // AUTO: filter-bar should not be card-wrapped by default
    expect(result.content).not.toContain('CardHeader');
  });

  it('passes quality validation with zero CRITICAL/HIGH violations', () => {
    const node = makeFilterBarPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    const violations = validateReactOutput([result]);
    const criticalOrHigh = violations.filter(
      v => v.severity === 'critical' || v.severity === 'high',
    );
    expect(criticalOrHigh).toEqual([]);
  });
});

describe('filter-bar pattern template', () => {
  it('resolves filter-bar template from PATTERN_TEMPLATE_MAP', () => {
    const tmpl = resolvePatternTemplate('filter-bar');
    expect(tmpl).not.toBeNull();
  });

  it('template imports include Input and Select', () => {
    const tmpl = resolvePatternTemplate('filter-bar')!;
    expect(tmpl.imports.has('@/components/ui/input')).toBe(true);
    expect(tmpl.imports.has('@/components/ui/select')).toBe(true);
  });

  it('template imports include Popover for compact preset support', () => {
    const tmpl = resolvePatternTemplate('filter-bar')!;
    expect(tmpl.imports.has('@/components/ui/popover')).toBe(true);
  });

  it('template body generates filter bar layout', () => {
    const tmpl = resolvePatternTemplate('filter-bar')!;
    const body = tmpl.body('gap-3');
    expect(body).toContain('<Input');
    expect(body).toContain('<Select>');
    expect(body).toContain('<SelectTrigger');
    expect(body).toContain('Clear');
    expect(body).toContain('Apply');
  });

  it('returns null for unknown pattern', () => {
    const tmpl = resolvePatternTemplate('nonexistent-pattern');
    expect(tmpl).toBeNull();
  });
});
