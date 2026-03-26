import { describe, it, expect } from 'vitest';
import { gapClass, gridClasses, spanClass, surfaceClasses, atomsToTailwind } from '../src/tailwind.js';

describe('gapClass', () => {
  it('"4" → "gap-4"', () => {
    expect(gapClass('4')).toBe('gap-4');
  });

  it('"6" → "gap-6"', () => {
    expect(gapClass('6')).toBe('gap-6');
  });
});

describe('gridClasses', () => {
  it('equal 2-col → "grid grid-cols-2 gap-4"', () => {
    expect(gridClasses(2, null, null, '4')).toBe('grid grid-cols-2 gap-4');
  });

  it('responsive 2-col at lg → "grid grid-cols-1 lg:grid-cols-2 gap-4"', () => {
    expect(gridClasses(2, null, 'lg', '4')).toBe('grid grid-cols-1 lg:grid-cols-2 gap-4');
  });

  it('weighted 4-span → "grid grid-cols-4 gap-4"', () => {
    expect(gridClasses(4, { a: 3, b: 1 }, null, '4')).toBe('grid grid-cols-4 gap-4');
  });
});

describe('spanClass', () => {
  it('weight 3 → "col-span-3"', () => {
    expect(spanClass(3)).toBe('col-span-3');
  });
});

describe('surfaceClasses', () => {
  it('returns default when no surface', () => {
    expect(surfaceClasses(undefined, '4')).toBe('flex flex-col gap-4 p-4 overflow-auto flex-1');
  });
});

describe('atomsToTailwind', () => {
  it('maps common layout atoms', () => {
    expect(atomsToTailwind('_flex _col _gap4 _p4')).toBe('flex flex-col gap-4 p-4');
  });

  it('maps semantic colors to shadcn vars', () => {
    expect(atomsToTailwind('_bgmuted _fgprimary')).toBe('bg-muted text-primary');
  });

  it('maps typography atoms', () => {
    expect(atomsToTailwind('_heading1')).toBe('text-4xl font-bold tracking-tight');
  });

  it('handles arbitrary value atoms _w[640px]', () => {
    expect(atomsToTailwind('_w[640px]')).toContain('w-[640px]');
  });

  it('drops recipe-specific decorators (d-glass, d-mesh)', () => {
    expect(atomsToTailwind('_flex d-glass d-mesh')).toBe('flex');
  });

  it('handles _gap{n} patterns dynamically', () => {
    expect(atomsToTailwind('_gap8')).toBe('gap-8');
  });

  it('handles _p{n} patterns dynamically', () => {
    expect(atomsToTailwind('_p6')).toBe('p-6');
  });
});
