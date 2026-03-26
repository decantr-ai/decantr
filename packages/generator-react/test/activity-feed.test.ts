import { describe, it, expect } from 'vitest';
import { resolvePatternTemplate, resolveShadcnComponent, collectShadcnImports } from '../src/shadcn.js';
import { emitPage } from '../src/emit-page.js';
import type { IRPageNode, IRPatternNode } from '@decantr/generator-core';

describe('activity-feed React generator', () => {
  it('has a shadcn pattern template for activity-feed', () => {
    const template = resolvePatternTemplate('activity-feed');
    expect(template).not.toBeNull();
    expect(template!.imports.has('@/components/ui/avatar')).toBe(true);
    expect(template!.imports.has('@/components/ui/badge')).toBe(true);
    expect(template!.imports.has('@/components/ui/scroll-area')).toBe(true);
    expect(template!.imports.has('@/components/ui/separator')).toBe(true);
  });

  it('template body emits Avatar, Badge, and ScrollArea components', () => {
    const template = resolvePatternTemplate('activity-feed');
    const body = template!.body('gap-4');
    expect(body).toContain('Avatar');
    expect(body).toContain('AvatarFallback');
    expect(body).toContain('Badge');
    expect(body).toContain('ScrollArea');
    expect(body).toContain('Separator');
    expect(body).toContain('Load more');
  });

  it('maps ScrollArea to shadcn component', () => {
    const mapping = resolveShadcnComponent('ScrollArea');
    expect(mapping).not.toBeNull();
    expect(mapping!.importPath).toBe('@/components/ui/scroll-area');
  });

  it('collects Avatar imports with AvatarImage and AvatarFallback', () => {
    const imports = collectShadcnImports(['Avatar']);
    const avatarImports = imports.get('@/components/ui/avatar');
    expect(avatarImports).toBeDefined();
    expect(avatarImports).toContain('Avatar');
    expect(avatarImports).toContain('AvatarImage');
    expect(avatarImports).toContain('AvatarFallback');
  });

  it('emits page with activity-feed pattern using template', () => {
    const patternNode: IRPatternNode = {
      type: 'pattern',
      id: 'activity-feed',
      children: [],
      pattern: {
        patternId: 'activity-feed',
        preset: 'standard',
        alias: 'activity-feed',
        layout: 'column',
        contained: true,
        standalone: false,
        code: null,
        components: ['Avatar', 'Badge', 'Button'],
      },
      card: null,
      visualEffects: null,
      wireProps: null,
      spatial: { gap: '4' },
    };

    const page: IRPageNode = {
      type: 'page',
      id: 'feed',
      children: [patternNode],
      pageId: 'feed',
      surface: '_flex _col _gap4 _p4 _overflow[auto] _flex1',
      wiring: null,
    };

    const result = emitPage(page);
    expect(result.path).toBe('src/pages/feed.tsx');
    expect(result.content).toContain('Avatar');
    expect(result.content).toContain('Badge');
    expect(result.content).toContain('ScrollArea');
  });

  it('generated React code has no barrel imports (CRITICAL quality rule)', () => {
    const template = resolvePatternTemplate('activity-feed');
    // AUTO: Verify imports use specific paths, not barrels
    for (const [path] of template!.imports) {
      expect(path).toMatch(/^@\/components\/ui\/[a-z-]+$/);
    }
  });
});
