import { describe, it, expect } from 'vitest';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

// AUTO: Hero pattern preset tests for Decantr generator

function makeHeroNode(preset: string, code: { imports: string; example: string }): IRPatternNode {
  const alias = preset === 'landing' ? 'hero' : `hero-${preset}`;
  return {
    type: 'pattern',
    id: alias,
    children: [],
    pattern: {
      patternId: 'hero',
      preset,
      alias,
      layout: preset === 'split' ? 'row' : preset === 'landing' ? 'hero' : 'stack',
      contained: false,
      standalone: true,
      code,
      components: ['Button'],
    },
    card: null,
    visualEffects: null,
    wireProps: null,
    spatial: { gap: '4' },
  };
}

function makePage(patternNode: IRPatternNode): IRPageNode {
  return {
    type: 'page',
    id: 'home',
    children: [patternNode],
    pageId: 'home',
    surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
    wiring: null,
  };
}

describe('hero Decantr generator', () => {
  it('emits hero landing preset using pattern example code', () => {
    const hero = makeHeroNode('landing', {
      imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, icon } from 'decantr/components';",
      example: "function Hero() {\n  const { div, h1, p } = tags;\n  return div({ class: css('_flex _col _aic _tc _gap6 _py16 _px6') }, 'hero landing');\n}",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/home.js');
    expect(result.content).toContain('Hero()');
    expect(result.content).toContain('_flex _col _aic _tc _gap6 _py16 _px6');
    expect(result.content).toContain('decantr/tags');
    expect(result.content).not.toContain('Card(');
  });

  it('emits hero image-overlay preset with relative and overlay atoms', () => {
    const hero = makeHeroNode('image-overlay', {
      imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, Chip, icon } from 'decantr/components';",
      example: "function HeroImageOverlay({ item }) {\n  const { div, h1, p, img } = tags;\n  return div({ class: css('_relative _wfull _h[400px] _overflow[hidden] _r4') },\n    img({ src: item.image, class: css('_absolute _inset0 _wfull _hfull _object[cover]') }),\n    div({ class: css('_absolute _inset0 _bg[linear-gradient(transparent_50%,rgba(0,0,0,0.8))]') })\n  );\n}",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('HeroImageOverlay');
    expect(result.content).toContain('_relative');
    expect(result.content).toContain('_absolute _inset0');
    expect(result.content).toContain('_overflow[hidden]');
  });

  it('emits hero image-overlay-compact preset with shorter height', () => {
    const hero = makeHeroNode('image-overlay-compact', {
      imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, Badge, Avatar, icon } from 'decantr/components';",
      example: "function HeroImageOverlayCompact({ item }) {\n  const { div, h1, img } = tags;\n  return div({ class: css('_relative _wfull _h[300px] _overflow[hidden] _r4') },\n    img({ src: item.cover, class: css('_absolute _inset0 _wfull _hfull _object[cover]') })\n  );\n}",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('HeroImageOverlayCompact');
    expect(result.content).toContain('_h[300px]');
    expect(result.content).toContain('_relative');
  });

  it('emits hero split preset with grid layout', () => {
    const hero = makeHeroNode('split', {
      imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, Badge, icon } from 'decantr/components';",
      example: "function HeroSplit() {\n  const { div, section, h1, p, img } = tags;\n  return section({ class: css('_minh[100vh] _relative _flex _aic _jcc _px6 _py24') },\n    div({ class: css('_grid _gc1 _lg:gc2 _gap8 _mw[1100px] _wfull _aic') }, 'split content')\n  );\n}",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('HeroSplit');
    expect(result.content).toContain('_grid _gc1 _lg:gc2');
    expect(result.content).toContain('_minh[100vh]');
  });

  it('emits hero empty-state preset with centered placeholder', () => {
    const hero = makeHeroNode('empty-state', {
      imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, icon } from 'decantr/components';",
      example: "function HeroEmptyState({ icon: ic, title }) {\n  const { div, h3, p } = tags;\n  return div({ class: css('_flex _col _aic _tc _gap4 _py12 _px6') },\n    h3({ class: css('_heading4') }, title)\n  );\n}",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('HeroEmptyState');
    expect(result.content).toContain('_flex _col _aic _tc _gap4 _py12 _px6');
  });

  it('emits hero brand preset with full-viewport layout', () => {
    const hero = makeHeroNode('brand', {
      imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, Badge, icon } from 'decantr/components';",
      example: "function HeroBrand() {\n  const { div, h1, p } = tags;\n  return div({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _minh[100vh] _jcc _relative d-mesh') }, 'brand hero');\n}",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('HeroBrand');
    expect(result.content).toContain('_minh[100vh]');
    expect(result.content).toContain('d-mesh');
  });

  it('emits hero vision preset with gradient hero class', () => {
    const hero = makeHeroNode('vision', {
      imports: "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, icon } from 'decantr/components';",
      example: "function HeroVision() {\n  const { section, h1, p, div } = tags;\n  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _minh[100vh] _jcc _relative d-mesh') },\n    h1({ class: css('d-heading-hero') }, 'Vision headline')\n  );\n}",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('HeroVision');
    expect(result.content).toContain('d-heading-hero');
  });

  it('hero presets have no card wrapping (standalone: true)', () => {
    const hero = makeHeroNode('landing', {
      imports: "import { tags } from 'decantr/tags';",
      example: "function Hero() { return 'hero'; }",
    });
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).not.toContain('Card(');
    expect(result.content).not.toContain('Card.Header');
    expect(result.content).not.toContain('Card.Body');
  });
});
