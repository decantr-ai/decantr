import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import { resolvePatternTemplate } from '../src/shadcn.js';
import { validateReactOutput } from '../src/quality-rules.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

function makeFormPatternNode(overrides?: Partial<IRPatternNode>): IRPatternNode {
  return {
    type: 'pattern',
    id: 'form-sections',
    children: [],
    pattern: {
      patternId: 'form-sections',
      preset: 'settings',
      alias: 'form-sections',
      layout: 'stack',
      contained: true,
      standalone: false,
      code: null,
      components: ['Card', 'Input', 'Select', 'Switch', 'Button', 'Label', 'Textarea'],
    },
    card: null,
    visualEffects: null,
    wireProps: null,
    spatial: { gap: '6' },
    ...overrides,
  };
}

function makePage(children: any[]): IRPageNode {
  return {
    type: 'page',
    id: 'settings',
    children,
    pageId: 'settings',
    surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
    wiring: null,
  };
}

describe('form-sections React emission', () => {
  it('emits a page with form-sections pattern', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/settings.tsx');
    expect(result.content).toContain('function FormSections');
  });

  it('uses form-sections-specific template with form elements', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('<form');
    expect(result.content).toContain('<Input');
    expect(result.content).toContain('<Label');
  });

  it('includes Card and form shadcn imports', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('@/components/ui/card');
    expect(result.content).toContain('@/components/ui/input');
    expect(result.content).toContain('@/components/ui/label');
  });

  it('renders settings preset with 2-column grid sections', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('lg:grid-cols-2');
    expect(result.content).toContain('<Switch');
  });

  it('includes Separator between sections', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('<Separator');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeFormPatternNode({
      card: { mode: 'always', headerLabel: 'Form Sections' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('CardHeader');
    expect(result.content).toContain('Form Sections');
  });

  it('passes quality validation with zero CRITICAL/HIGH violations', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    const violations = validateReactOutput([result]);
    const criticalOrHigh = violations.filter(
      v => v.severity === 'critical' || v.severity === 'high',
    );
    expect(criticalOrHigh).toEqual([]);
  });
});

describe('form-sections pattern templates', () => {
  it('resolves form-sections template from PATTERN_TEMPLATE_MAP', () => {
    const tmpl = resolvePatternTemplate('form-sections');
    expect(tmpl).not.toBeNull();
  });

  it('resolves form-sections:creation template', () => {
    const tmpl = resolvePatternTemplate('form-sections:creation');
    expect(tmpl).not.toBeNull();
  });

  it('resolves form-sections:structured template', () => {
    const tmpl = resolvePatternTemplate('form-sections:structured');
    expect(tmpl).not.toBeNull();
  });

  it('template imports include form components', () => {
    const tmpl = resolvePatternTemplate('form-sections')!;
    expect(tmpl.imports.has('@/components/ui/input')).toBe(true);
    expect(tmpl.imports.has('@/components/ui/label')).toBe(true);
    expect(tmpl.imports.has('@/components/ui/switch')).toBe(true);
  });

  it('template body generates form layout with Card sections', () => {
    const tmpl = resolvePatternTemplate('form-sections')!;
    const body = tmpl.body('gap-6');
    expect(body).toContain('<form');
    expect(body).toContain('<Card');
    expect(body).toContain('<Input');
    expect(body).toContain('<Label');
    expect(body).toContain('Save Changes');
  });

  it('creation template body has step indicator', () => {
    const tmpl = resolvePatternTemplate('form-sections:creation')!;
    const body = tmpl.body('gap-6');
    expect(body).toContain('Step 1 of 3');
    expect(body).toContain('Previous');
    expect(body).toContain('Next');
  });

  it('structured template body uses RadioGroup and Checkbox', () => {
    const tmpl = resolvePatternTemplate('form-sections:structured')!;
    const body = tmpl.body('gap-4');
    expect(body).toContain('<RadioGroup');
    expect(body).toContain('<Checkbox');
    expect(body).toContain('Reset');
    expect(body).toContain('Cancel');
    expect(body).toContain('Save');
  });
});
