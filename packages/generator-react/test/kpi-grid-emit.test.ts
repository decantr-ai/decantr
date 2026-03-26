import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import { resolvePatternTemplate } from '../src/shadcn.js';
import { validateReactOutput } from '../src/quality-rules.js';
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
      code: null,
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

describe('kpi-grid React emission', () => {
  it('emits a page with kpi-grid pattern', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/dashboard.tsx');
    expect(result.content).toContain('function KpiGrid');
  });

  it('uses kpi-grid-specific template with 4-column grid', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('grid-cols-2');
    expect(result.content).toContain('lg:grid-cols-4');
  });

  it('includes Card and Badge shadcn imports', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('@/components/ui/card');
    expect(result.content).toContain('@/components/ui/badge');
  });

  it('renders KPI data values in template', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Total Revenue');
    expect(result.content).toContain('$45,231');
  });

  it('uses Badge for trend indicators', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Badge');
    expect(result.content).toContain('kpi.trend');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeKpiPatternNode({
      card: { mode: 'always', headerLabel: 'KPI Grid' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('CardHeader');
    expect(result.content).toContain('KPI Grid');
  });

  it('passes quality validation with zero CRITICAL/HIGH violations', () => {
    const node = makeKpiPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    const violations = validateReactOutput([result]);
    const criticalOrHigh = violations.filter(
      v => v.severity === 'critical' || v.severity === 'high',
    );
    expect(criticalOrHigh).toEqual([]);
  });
});

describe('kpi-grid pattern template', () => {
  it('resolves kpi-grid template from PATTERN_TEMPLATE_MAP', () => {
    const tmpl = resolvePatternTemplate('kpi-grid');
    expect(tmpl).not.toBeNull();
  });

  it('returns null for unknown patterns', () => {
    const tmpl = resolvePatternTemplate('unknown-pattern');
    expect(tmpl).toBeNull();
  });

  it('template imports include Card and Badge', () => {
    const tmpl = resolvePatternTemplate('kpi-grid')!;
    expect(tmpl.imports.has('@/components/ui/card')).toBe(true);
    expect(tmpl.imports.has('@/components/ui/badge')).toBe(true);
  });

  it('template body generates grid layout', () => {
    const tmpl = resolvePatternTemplate('kpi-grid')!;
    const body = tmpl.body('gap-4');
    expect(body).toContain('grid-cols-2');
    expect(body).toContain('lg:grid-cols-4');
    expect(body).toContain('<Card');
  });
});
