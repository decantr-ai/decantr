import { describe, it, expect } from 'vitest';
import { resolveShadcnComponent, collectShadcnImports } from '../src/shadcn.js';

describe('resolveShadcnComponent', () => {
  it('maps Button to shadcn Button', () => {
    const result = resolveShadcnComponent('Button');
    expect(result).not.toBeNull();
    expect(result!.component).toBe('Button');
    expect(result!.importPath).toBe('@/components/ui/button');
  });

  it('maps Modal to shadcn Dialog', () => {
    const result = resolveShadcnComponent('Modal');
    expect(result).not.toBeNull();
    expect(result!.component).toBe('Dialog');
    expect(result!.importPath).toBe('@/components/ui/dialog');
  });

  it('maps Chip to shadcn Badge', () => {
    const result = resolveShadcnComponent('Chip');
    expect(result).not.toBeNull();
    expect(result!.component).toBe('Badge');
  });

  it('returns null for unknown components', () => {
    expect(resolveShadcnComponent('UnknownWidget')).toBeNull();
  });
});

describe('collectShadcnImports', () => {
  it('deduplicates imports from the same path', () => {
    const imports = collectShadcnImports(['Card', 'Card']);
    expect(imports.size).toBe(1);
    const cardImports = imports.get('@/components/ui/card')!;
    expect(cardImports).toContain('Card');
    expect(cardImports).toContain('CardHeader');
  });

  it('collects imports across multiple components', () => {
    const imports = collectShadcnImports(['Button', 'Card', 'Badge']);
    expect(imports.size).toBe(3);
    expect(imports.has('@/components/ui/button')).toBe(true);
    expect(imports.has('@/components/ui/card')).toBe(true);
    expect(imports.has('@/components/ui/badge')).toBe(true);
  });

  it('merges duplicate mappings (Chip + Badge share same path)', () => {
    const imports = collectShadcnImports(['Chip', 'Badge']);
    expect(imports.size).toBe(1);
    expect(imports.get('@/components/ui/badge')).toContain('Badge');
  });
});
