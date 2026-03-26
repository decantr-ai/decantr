import { describe, it, expect } from 'vitest';
import { resolvePatternTemplate } from '../src/shadcn.js';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

// AUTO: Hero pattern preset tests for React generator

function makeHeroNode(preset: string, patternIdSuffix?: string): IRPatternNode {
  const patternId = patternIdSuffix ? `hero:${patternIdSuffix}` : 'hero';
  return {
    type: 'pattern',
    id: `hero-${preset}`,
    children: [],
    pattern: {
      patternId,
      preset,
      alias: `hero-${preset}`,
      layout: preset === 'split' ? 'row' : preset === 'landing' ? 'hero' : 'stack',
      contained: false,
      standalone: true,
      code: null,
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

describe('hero React generator', () => {
  // --- Template existence ---

  it('has a shadcn template for hero (landing/default)', () => {
    const template = resolvePatternTemplate('hero');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
  });

  it('has a shadcn template for hero:image-overlay', () => {
    const template = resolvePatternTemplate('hero:image-overlay');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
    expect(template!.imports.has('@/components/ui/badge')).toBe(true);
  });

  it('has a shadcn template for hero:image-overlay-compact', () => {
    const template = resolvePatternTemplate('hero:image-overlay-compact');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/avatar')).toBe(true);
  });

  it('has a shadcn template for hero:split', () => {
    const template = resolvePatternTemplate('hero:split');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
  });

  it('has a shadcn template for hero:empty-state', () => {
    const template = resolvePatternTemplate('hero:empty-state');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
  });

  it('has a shadcn template for hero:brand', () => {
    const template = resolvePatternTemplate('hero:brand');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/badge')).toBe(true);
  });

  it('has a shadcn template for hero:vision', () => {
    const template = resolvePatternTemplate('hero:vision');
    expect(template).not.toBeNull();
  });

  // --- Template body content ---

  it('landing template emits centered hero with headline and CTAs', () => {
    const body = resolvePatternTemplate('hero')!.body('gap-6');
    expect(body).toContain('items-center');
    expect(body).toContain('text-center');
    expect(body).toContain('Build Faster');
    expect(body).toContain('Button');
    expect(body).toContain('Get Started');
  });

  it('image-overlay template emits relative container with gradient overlay', () => {
    const body = resolvePatternTemplate('hero:image-overlay')!.body('gap-4');
    expect(body).toContain('relative');
    expect(body).toContain('overflow-hidden');
    expect(body).toContain('object-cover');
    expect(body).toContain('bg-gradient');
    expect(body).toContain('absolute');
    expect(body).toContain('h-[400px]');
  });

  it('image-overlay-compact template emits shorter container with avatar', () => {
    const body = resolvePatternTemplate('hero:image-overlay-compact')!.body('gap-4');
    expect(body).toContain('h-[300px]');
    expect(body).toContain('Avatar');
    expect(body).toContain('Badge');
    expect(body).toContain('object-cover');
  });

  it('split template emits two-column grid layout', () => {
    const body = resolvePatternTemplate('hero:split')!.body('gap-8');
    expect(body).toContain('grid');
    expect(body).toContain('lg:grid-cols-2');
    expect(body).toContain('img');
    expect(body).toContain('Button');
  });

  it('empty-state template emits centered placeholder with action', () => {
    const body = resolvePatternTemplate('hero:empty-state')!.body('gap-4');
    expect(body).toContain('items-center');
    expect(body).toContain('text-center');
    expect(body).toContain('No items yet');
    expect(body).toContain('Button');
  });

  it('brand template emits gradient headline with badge', () => {
    const body = resolvePatternTemplate('hero:brand')!.body('gap-8');
    expect(body).toContain('Badge');
    expect(body).toContain('bg-gradient');
    expect(body).toContain('min-h-[100vh]');
    expect(body).toContain('Now in Beta');
  });

  it('vision template emits gradient headline with AI messaging', () => {
    const body = resolvePatternTemplate('hero:vision')!.body('gap-8');
    expect(body).toContain('bg-gradient');
    expect(body).toContain('min-h-[100vh]');
    expect(body).toContain('Decantr is built for AI');
    expect(body).toContain('npx decantr init');
  });

  // --- Page emission ---

  it('emits page with hero landing preset (no card wrapping)', () => {
    const hero = makeHeroNode('landing');
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.path).toBe('src/pages/home.tsx');
    expect(result.content).toContain('Button');
    expect(result.content).not.toContain('CardHeader');
    expect(result.content).not.toContain('CardContent');
  });

  it('emits page with hero:image-overlay preset', () => {
    const hero = makeHeroNode('image-overlay', 'image-overlay');
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('relative');
    expect(result.content).toContain('@/components/ui/button');
  });

  it('emits page with hero:split preset', () => {
    const hero = makeHeroNode('split', 'split');
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('grid');
    expect(result.content).toContain('lg:grid-cols-2');
  });

  it('emits page with hero:empty-state preset', () => {
    const hero = makeHeroNode('empty-state', 'empty-state');
    const page = makePage(hero);
    const result = emitPage(page);

    expect(result.content).toContain('No items yet');
    expect(result.content).toContain('Button');
  });

  // --- Quality rules ---

  it('generated React code has no barrel imports (CRITICAL quality rule)', () => {
    const presets = ['hero', 'hero:image-overlay', 'hero:image-overlay-compact', 'hero:split', 'hero:empty-state', 'hero:brand', 'hero:vision'];
    for (const preset of presets) {
      const template = resolvePatternTemplate(preset);
      expect(template).not.toBeNull();
      for (const [path] of template!.imports) {
        expect(path).toMatch(/^@\/components\/ui\/[a-z-]+$/);
      }
    }
  });

  it('no inline component definitions in generated output', () => {
    const hero = makeHeroNode('landing');
    const page = makePage(hero);
    const result = emitPage(page);

    // Count function declarations - should only have the pattern component + page component
    const funcDecls = result.content.match(/function\s+[A-Z]\w+/g) || [];
    // All should be at top level (no nesting)
    expect(funcDecls.length).toBeGreaterThanOrEqual(1);
    expect(funcDecls.length).toBeLessThanOrEqual(2);
  });
});
