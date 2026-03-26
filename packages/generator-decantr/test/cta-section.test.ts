import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

describe('cta-section Decantr generator', () => {
  it('emits page with cta-section standard preset using pattern code', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'cta-section',
      children: [],
      pattern: {
        patternId: 'cta-section',
        preset: 'standard',
        alias: 'cta-section',
        layout: 'hero',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, icon } from 'decantr/components';",
          example: "function CtaSection() {\n  const { section, h2, p, div } = tags;\n  return section({ class: css('_flex _col _items[center] _text[center] _py12 _px4 _gap4') }, 'cta content');\n}",
        },
        components: ['Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'landing',
      children: [patternNode],
      pageId: 'landing',
      surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
      wiring: null,
    };

    const result = emitPage(page);
    expect(result.path).toBe('src/pages/landing.js');
    expect(result.content).toContain('CtaSection');
    expect(result.content).toContain('decantr/tags');
    expect(result.content).toContain('decantr/css');
    // AUTO: Verify centered layout atoms from standard preset are present
    expect(result.content).toContain('_flex _col _items[center] _text[center] _py12 _px4 _gap4');
  });

  it('emits cta-section with no card wrapping (contained: false)', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'cta-section',
      children: [],
      pattern: {
        patternId: 'cta-section',
        preset: 'standard',
        alias: 'cta-section',
        layout: 'hero',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button } from 'decantr/components';",
          example: "function CtaSection() {\n  const { section } = tags;\n  return section({ class: css('_flex _col _items[center]') }, 'cta');\n}",
        },
        components: ['Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'promo',
      children: [patternNode],
      pageId: 'promo',
      surface: '_flex _col _gap4 _p4',
      wiring: null,
    };

    const result = emitPage(page);
    // Should not have Card wrapping
    expect(result.content).not.toContain('Card.Header');
    expect(result.content).not.toContain('Card.Body');
  });

  it('emits cta-section split preset with grid atoms', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'cta-section-split',
      children: [],
      pattern: {
        patternId: 'cta-section',
        preset: 'split',
        alias: 'cta-section-split',
        layout: 'row',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, icon } from 'decantr/components';",
          example: "function CtaSectionSplit() {\n  const { section, div, h2, p, img } = tags;\n  return section({ class: css('_grid _gc1 _lg:gc2 _gap6 _items[center] _py8') }, 'split cta');\n}",
        },
        components: ['Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '6' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'marketing',
      children: [patternNode],
      pageId: 'marketing',
      surface: '_flex _col _gap4 _p4',
      wiring: null,
    };

    const result = emitPage(page);
    expect(result.path).toBe('src/pages/marketing.js');
    expect(result.content).toContain('CtaSectionSplit');
    // AUTO: Verify grid layout atoms from split preset
    expect(result.content).toContain('_grid _gc1 _lg:gc2 _gap6 _items[center] _py8');
  });

  it('emits cta-section banner preset with horizontal bar atoms', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'cta-section-banner',
      children: [],
      pattern: {
        patternId: 'cta-section',
        preset: 'banner',
        alias: 'cta-section-banner',
        layout: 'row',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button } from 'decantr/components';",
          example: "function CtaSectionBanner() {\n  const { div, p } = tags;\n  return div({ class: css('_flex _row _justify[between] _items[center] _py4 _px6 _rounded _bgprimary/10') }, 'banner cta');\n}",
        },
        components: ['Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'inline-cta',
      children: [patternNode],
      pageId: 'inline-cta',
      surface: '_flex _col _gap4 _p4',
      wiring: null,
    };

    const result = emitPage(page);
    expect(result.path).toBe('src/pages/inline-cta.js');
    expect(result.content).toContain('CtaSectionBanner');
    // AUTO: Verify banner layout atoms
    expect(result.content).toContain('_flex _row _justify[between] _items[center] _py4 _px6 _rounded _bgprimary/10');
  });
});
