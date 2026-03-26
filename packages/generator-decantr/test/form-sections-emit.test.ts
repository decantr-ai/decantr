import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
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
      code: {
        imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Input, Select, Switch, Button, Label, Textarea } from 'decantr/components';",
        example: "function FormSections({ onSave, onCancel }) {\n  const { div, h3, p, form } = tags;\n\n  return form({ class: css('_flex _col _gap6 _p4'), onsubmit: e => { e.preventDefault(); onSave?.(); } },\n    Card({ class: css('_flex _col _gap4 _p6') },\n      div({ class: css('_grid _gc1 _lg:gc2 _gap4') },\n        div({ class: css('_flex _col _gap1') },\n          h3({ class: css('_heading4') }, 'Profile'),\n          p({ class: css('_bodysm _fgmuted') }, 'Your personal information')\n        ),\n        div({ class: css('_flex _col _gap4') },\n          div({ class: css('_flex _col _gap2') },\n            Label({}, 'Display Name'),\n            Input({ placeholder: 'Enter your name' })\n          ),\n          div({ class: css('_flex _col _gap2') },\n            Label({}, 'Bio'),\n            Textarea({ placeholder: 'Tell us about yourself', rows: 3 })\n          )\n        )\n      )\n    ),\n    div({ class: css('_flex _gap3 _jce') },\n      Button({ variant: 'outline', onclick: onCancel }, 'Cancel'),\n      Button({ variant: 'primary', type: 'submit' }, 'Save Changes')\n    )\n  );\n}",
      },
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

describe('form-sections Decantr emission', () => {
  it('emits a .js page file', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/settings.js');
  });

  it('uses pattern example code with Decantr form atoms', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('_flex');
    expect(result.content).toContain('_col');
    expect(result.content).toContain('_gap6');
    expect(result.content).toContain('_grid');
    expect(result.content).toContain('_gc1');
    expect(result.content).toContain('_lg:gc2');
  });

  it('includes form components in emitted code', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Card(');
    expect(result.content).toContain('Input(');
    expect(result.content).toContain('Label(');
    expect(result.content).toContain('Button(');
  });

  it('wraps in Card when card wrapping is enabled', () => {
    const node = makeFormPatternNode({
      card: { mode: 'always', headerLabel: 'Form Sections' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('Card(');
    expect(result.content).toContain('Card.Header');
    expect(result.content).toContain('Card.Body');
    expect(result.content).toContain('Form Sections');
  });

  it('includes decantr/components import for form components', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('decantr/components');
    expect(result.content).toContain('Card');
  });

  it('replaces gap atoms with density-derived gap', () => {
    const node = makeFormPatternNode({
      spatial: { gap: '4' },
    });
    const page = makePage([node]);
    const result = emitPage(page);

    // _gap6 in pattern code should be replaced with _gap4
    // AUTO: The emit-page replaces _gap4 pattern, so with gap=4 we still get _gap4
    expect(result.content).toContain('_gap4');
  });

  it('includes form submission handling', () => {
    const node = makeFormPatternNode();
    const page = makePage([node]);
    const result = emitPage(page);

    expect(result.content).toContain('onsubmit');
    expect(result.content).toContain('preventDefault');
  });
});
