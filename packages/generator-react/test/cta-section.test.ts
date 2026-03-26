import { describe, it, expect } from 'vitest';
import { resolvePatternTemplate, resolveShadcnComponent, collectShadcnImports } from '../src/shadcn.js';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

describe('cta-section React generator', () => {
  it('has a shadcn pattern template for cta-section (standard)', () => {
    const template = resolvePatternTemplate('cta-section');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
  });

  it('has a shadcn pattern template for cta-section:split', () => {
    const template = resolvePatternTemplate('cta-section:split');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
  });

  it('has a shadcn pattern template for cta-section:banner', () => {
    const template = resolvePatternTemplate('cta-section:banner');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
  });

  it('standard template body emits centered layout with Button components', () => {
    const template = resolvePatternTemplate('cta-section');
    const body = template!.body('gap-4');
    expect(body).toContain('Button');
    expect(body).toContain('items-center');
    expect(body).toContain('text-center');
    expect(body).toContain('Start Free Trial');
    expect(body).toContain('Learn More');
  });

  it('standard template uses primary and outline Button variants', () => {
    const template = resolvePatternTemplate('cta-section');
    const body = template!.body('gap-4');
    // AUTO: Primary CTA has no variant (defaults to primary), secondary uses outline
    expect(body).toContain('variant="outline"');
    expect(body).toContain('size="lg"');
  });

  it('split template body emits two-column grid layout', () => {
    const template = resolvePatternTemplate('cta-section:split');
    const body = template!.body('gap-6');
    expect(body).toContain('grid');
    expect(body).toContain('lg:grid-cols-2');
    expect(body).toContain('Button');
    expect(body).toContain('img');
  });

  it('banner template body emits compact horizontal bar', () => {
    const template = resolvePatternTemplate('cta-section:banner');
    const body = template!.body('gap-4');
    expect(body).toContain('justify-between');
    expect(body).toContain('bg-primary/10');
    expect(body).toContain('Button');
    expect(body).toContain('Upgrade Now');
  });

  it('standard template has no card wrapping (contained: false)', () => {
    const template = resolvePatternTemplate('cta-section');
    const body = template!.body('gap-4');
    expect(body).not.toContain('<Card');
    expect(body).not.toContain('CardContent');
  });

  it('emits page with cta-section pattern using standard template', () => {
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
        code: null,
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
    expect(result.path).toBe('src/pages/landing.tsx');
    expect(result.content).toContain('Button');
  });

  it('generated React code has no barrel imports (CRITICAL quality rule)', () => {
    const standard = resolvePatternTemplate('cta-section');
    for (const [path] of standard!.imports) {
      expect(path).toMatch(/^@\/components\/ui\/[a-z-]+$/);
    }
    const split = resolvePatternTemplate('cta-section:split');
    for (const [path] of split!.imports) {
      expect(path).toMatch(/^@\/components\/ui\/[a-z-]+$/);
    }
    const banner = resolvePatternTemplate('cta-section:banner');
    for (const [path] of banner!.imports) {
      expect(path).toMatch(/^@\/components\/ui\/[a-z-]+$/);
    }
  });
});
