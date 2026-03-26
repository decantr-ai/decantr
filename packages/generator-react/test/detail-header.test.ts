import { describe, it, expect } from 'vitest';
import { resolvePatternTemplate, resolveShadcnComponent, collectShadcnImports } from '../src/shadcn.js';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

describe('detail-header React generator', () => {
  it('has a shadcn pattern template for detail-header (standard)', () => {
    const template = resolvePatternTemplate('detail-header');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/badge')).toBe(true);
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
    expect(template!.imports.has('@/components/ui/breadcrumb')).toBe(true);
    expect(template!.imports.has('@/components/ui/separator')).toBe(true);
    expect(template!.imports.has('@/components/ui/dropdown-menu')).toBe(true);
  });

  it('has a shadcn pattern template for detail-header:profile', () => {
    const template = resolvePatternTemplate('detail-header:profile');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/avatar')).toBe(true);
    expect(template!.imports.has('@/components/ui/badge')).toBe(true);
    expect(template!.imports.has('@/components/ui/button')).toBe(true);
    expect(template!.imports.has('@/components/ui/separator')).toBe(true);
  });

  it('standard template body emits Breadcrumb, Badge, Button, and DropdownMenu', () => {
    const template = resolvePatternTemplate('detail-header');
    const body = template!.body('gap-4');
    expect(body).toContain('Breadcrumb');
    expect(body).toContain('BreadcrumbLink');
    expect(body).toContain('Badge');
    expect(body).toContain('Button');
    expect(body).toContain('DropdownMenu');
    expect(body).toContain('border-b');
  });

  it('profile template body emits Avatar with AvatarImage and AvatarFallback', () => {
    const template = resolvePatternTemplate('detail-header:profile');
    const body = template!.body('gap-6');
    expect(body).toContain('Avatar');
    expect(body).toContain('AvatarImage');
    expect(body).toContain('AvatarFallback');
    expect(body).toContain('Separator');
    expect(body).toContain('Follow');
    expect(body).toContain('Message');
  });

  it('standard template has no card wrapping (contained: false)', () => {
    const template = resolvePatternTemplate('detail-header');
    const body = template!.body('gap-4');
    // AUTO: detail-header is standalone with no Card wrapping
    expect(body).not.toContain('<Card');
    expect(body).not.toContain('CardContent');
  });

  it('profile template has no card wrapping (contained: false)', () => {
    const template = resolvePatternTemplate('detail-header:profile');
    const body = template!.body('gap-6');
    expect(body).not.toContain('<Card');
    expect(body).not.toContain('CardContent');
  });

  it('emits page with detail-header pattern using standard template', () => {
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
        code: null,
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
    expect(result.path).toBe('src/pages/item-detail.tsx');
    expect(result.content).toContain('Breadcrumb');
    expect(result.content).toContain('Badge');
    expect(result.content).toContain('Button');
  });

  it('generated React code has no barrel imports (CRITICAL quality rule)', () => {
    const standard = resolvePatternTemplate('detail-header');
    for (const [path] of standard!.imports) {
      expect(path).toMatch(/^@\/components\/ui\/[a-z-]+$/);
    }
    const profile = resolvePatternTemplate('detail-header:profile');
    for (const [path] of profile!.imports) {
      expect(path).toMatch(/^@\/components\/ui\/[a-z-]+$/);
    }
  });
});
