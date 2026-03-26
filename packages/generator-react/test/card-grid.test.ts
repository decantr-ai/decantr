import { describe, it, expect } from 'vitest';
import {
  resolvePatternTemplate,
  resolveShadcnComponent,
  collectShadcnImports,
} from '../src/shadcn.js';

describe('card-grid shadcn mappings', () => {
  it('has a pattern template for card-grid (product default)', () => {
    const tmpl = resolvePatternTemplate('card-grid');
    expect(tmpl).not.toBeNull();
    expect(tmpl!.imports.has('@/components/ui/card')).toBe(true);
    expect(tmpl!.imports.has('@/components/ui/button')).toBe(true);
    expect(tmpl!.imports.has('@/components/ui/badge')).toBe(true);
    expect(tmpl!.imports.has('@/components/ui/aspect-ratio')).toBe(true);
  });

  it('card-grid product template emits responsive grid classes', () => {
    const tmpl = resolvePatternTemplate('card-grid');
    const body = tmpl!.body('gap-4');
    expect(body).toContain('grid-cols-1');
    expect(body).toContain('sm:grid-cols-2');
    expect(body).toContain('lg:grid-cols-3');
    expect(body).toContain('xl:grid-cols-4');
    expect(body).toContain('Add to Cart');
  });

  it('has a content preset template', () => {
    const tmpl = resolvePatternTemplate('card-grid:content');
    expect(tmpl).not.toBeNull();
    expect(tmpl!.imports.has('@/components/ui/avatar')).toBe(true);
    const body = tmpl!.body('gap-6');
    expect(body).toContain('md:grid-cols-2');
    expect(body).toContain('lg:grid-cols-3');
    expect(body).toContain('Avatar');
  });

  it('has a collection preset template', () => {
    const tmpl = resolvePatternTemplate('card-grid:collection');
    expect(tmpl).not.toBeNull();
    const body = tmpl!.body('gap-4');
    expect(body).toContain('grid-cols-2');
    expect(body).toContain('lg:grid-cols-3');
    expect(body).toContain('bg-gradient');
    expect(body).toContain('group-hover:scale-105');
  });

  it('has an icon preset template', () => {
    const tmpl = resolvePatternTemplate('card-grid:icon');
    expect(tmpl).not.toBeNull();
    const body = tmpl!.body('gap-3');
    expect(body).toContain('grid-cols-2');
    expect(body).toContain('md:grid-cols-3');
    expect(body).toContain('lg:grid-cols-4');
    expect(body).toContain('text-xs');
  });

  it('AspectRatio component is mapped', () => {
    const result = resolveShadcnComponent('AspectRatio');
    expect(result).not.toBeNull();
    expect(result!.importPath).toBe('@/components/ui/aspect-ratio');
  });

  it('card-grid template body has no barrel imports', () => {
    // AUTO: verify templates don't violate React quality CRITICAL rules
    for (const key of ['card-grid', 'card-grid:content', 'card-grid:collection', 'card-grid:icon']) {
      const tmpl = resolvePatternTemplate(key);
      expect(tmpl).not.toBeNull();
      const body = tmpl!.body('gap-4');
      // No barrel imports from lucide-react or @/components/ui
      expect(body).not.toMatch(/from\s+['"]lucide-react['"]/);
      expect(body).not.toMatch(/from\s+['"]@\/components\/ui['"]/);
    }
  });
});
