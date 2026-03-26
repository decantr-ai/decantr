import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

describe('detail-header Decantr generator', () => {
  it('emits page with detail-header standard preset using pattern code', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'detail-header',
      children: [],
      pattern: {
        patternId: 'detail-header',
        preset: 'standard',
        alias: 'detail-header',
        layout: 'row',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Badge, Button, Breadcrumb, icon } from 'decantr/components';",
          example: "function DetailHeader({ data }) {\n  const { div, h1, p } = tags;\n  return div({ class: css('_flex _col _gap4 _pb4 _bbsolid _bcborder') }, 'header content');\n}",
        },
        components: ['Badge', 'Button', 'Breadcrumb'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'item-detail',
      children: [patternNode],
      pageId: 'item-detail',
      surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
      wiring: null,
    };

    const result = emitPage(page);
    expect(result.path).toBe('src/pages/item-detail.js');
    expect(result.content).toContain('DetailHeader');
    expect(result.content).toContain('decantr/tags');
    expect(result.content).toContain('decantr/css');
    // AUTO: Verify layout atoms from standard preset are present
    expect(result.content).toContain('_flex _col _gap4 _pb4 _bbsolid _bcborder');
  });

  it('emits detail-header with no card wrapping (contained: false)', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'detail-header',
      children: [],
      pattern: {
        patternId: 'detail-header',
        preset: 'standard',
        alias: 'detail-header',
        layout: 'row',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Badge, Button, icon } from 'decantr/components';",
          example: "function DetailHeader({ data }) {\n  const { div } = tags;\n  return div({ class: css('_flex _col _gap4') }, 'header');\n}",
        },
        components: ['Badge', 'Button'],
      },
      // AUTO: card is null because contained is false
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'profile',
      children: [patternNode],
      pageId: 'profile',
      surface: '_flex _col _gap4 _p4',
      wiring: null,
    };

    const result = emitPage(page);
    // Should not have Card wrapping
    expect(result.content).not.toContain('Card.Header');
    expect(result.content).not.toContain('Card.Body');
  });

  it('emits detail-header profile preset with avatar atoms', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'detail-header-profile',
      children: [],
      pattern: {
        patternId: 'detail-header',
        preset: 'profile',
        alias: 'detail-header-profile',
        layout: 'row',
        contained: false,
        standalone: true,
        code: {
          imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Avatar, Badge, Button, icon } from 'decantr/components';",
          example: "function DetailHeaderProfile({ data }) {\n  const { div, h1, p, span } = tags;\n  return div({ class: css('_flex _row _gap6 _items[start]') }, 'profile header');\n}",
        },
        components: ['Avatar', 'Badge', 'Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'user-profile',
      children: [patternNode],
      pageId: 'user-profile',
      surface: '_flex _col _gap4 _p4',
      wiring: null,
    };

    const result = emitPage(page);
    expect(result.path).toBe('src/pages/user-profile.js');
    expect(result.content).toContain('DetailHeaderProfile');
    // AUTO: Verify profile layout atoms
    expect(result.content).toContain('_flex _row _gap6 _items[start]');
    expect(result.content).toContain('Avatar');
  });
});
