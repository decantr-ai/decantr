import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import { resolvePatternTemplate } from '../src/shadcn.js';
import { validateReactOutput } from '../src/quality-rules.js';
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
      code: null,
      components: ['Card', 'CardHeader', 'CardBody'],
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

describe('chart-grid React emission', () => {
  it('emits a page with chart-grid pattern', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/analytics.tsx');
    expect(result.content).toContain('function ChartGrid');
  });

  it('uses chart-grid-specific template with 2-column grid', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('grid-cols-1');
    expect(result.content).toContain('lg:grid-cols-2');
  });

  it('includes Card shadcn imports', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('@/components/ui/card');
  });

  it('renders chart placeholder areas with data-chart-type', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('data-chart-type');
    expect(result.content).toContain('chart placeholder');
  });

  it('includes Recharts suggestion comment', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Replace with Recharts/Chart.js component');
  });

  it('wraps charts in Card components', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('<Card');
    expect(result.content).toContain('<CardHeader');
    expect(result.content).toContain('<CardContent');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeChartPatternNode({
      card: { mode: 'always', headerLabel: 'Chart Grid' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('CardHeader');
    expect(result.content).toContain('Chart Grid');
  });

  it('passes quality validation with zero CRITICAL/HIGH violations', () => {
    const node = makeChartPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    const violations = validateReactOutput([result]);
    const criticalOrHigh = violations.filter(
      v => v.severity === 'critical' || v.severity === 'high',
    );
    expect(criticalOrHigh).toEqual([]);
  });
});

describe('chart-grid pattern template', () => {
  it('resolves chart-grid template from PATTERN_TEMPLATE_MAP', () => {
    const tmpl = resolvePatternTemplate('chart-grid');
    expect(tmpl).not.toBeNull();
  });

  it('resolves chart-grid:wide template', () => {
    const tmpl = resolvePatternTemplate('chart-grid:wide');
    expect(tmpl).not.toBeNull();
  });

  it('resolves chart-grid:mixed template', () => {
    const tmpl = resolvePatternTemplate('chart-grid:mixed');
    expect(tmpl).not.toBeNull();
  });

  it('template imports include Card', () => {
    const tmpl = resolvePatternTemplate('chart-grid')!;
    expect(tmpl.imports.has('@/components/ui/card')).toBe(true);
  });

  it('template body generates grid layout with chart placeholders', () => {
    const tmpl = resolvePatternTemplate('chart-grid')!;
    const body = tmpl.body('gap-4');
    expect(body).toContain('grid-cols-1');
    expect(body).toContain('lg:grid-cols-2');
    expect(body).toContain('<Card');
    expect(body).toContain('data-chart-type');
  });

  it('wide template body uses flex row layout', () => {
    const tmpl = resolvePatternTemplate('chart-grid:wide')!;
    const body = tmpl.body('gap-4');
    expect(body).toContain('flex flex-row');
    expect(body).toContain('overflow-auto');
    expect(body).toContain('<Card');
  });

  it('mixed template body has col-span-2 for primary chart', () => {
    const tmpl = resolvePatternTemplate('chart-grid:mixed')!;
    const body = tmpl.body('gap-4');
    expect(body).toContain('lg:col-span-2');
    expect(body).toContain('Revenue Overview');
  });
});
