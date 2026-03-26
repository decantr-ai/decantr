import { describe, it, expect } from 'vitest';
import { gapAtom, gridAtoms, surfaceAtoms, spanAtom } from '../src/atoms.js';

describe('gapAtom', () => {
  it('"4" → "_gap4"', () => {
    expect(gapAtom('4')).toBe('_gap4');
  });

  it('"6" → "_gap6"', () => {
    expect(gapAtom('6')).toBe('_gap6');
  });
});

describe('gridAtoms', () => {
  it('equal grid: _grid _gc3 _gap4', () => {
    expect(gridAtoms(3, null, null, '4')).toBe('_grid _gc3 _gap4');
  });

  it('responsive grid: _grid _gc1 _lg:gc2 _gap4', () => {
    expect(gridAtoms(2, null, 'lg', '4')).toBe('_grid _gc1 _lg:gc2 _gap4');
  });

  it('weighted grid: _grid _gc4 _gap4', () => {
    expect(gridAtoms(4, { a: 3, b: 1 }, null, '4')).toBe('_grid _gc4 _gap4');
  });
});

describe('surfaceAtoms', () => {
  it('returns custom surface when provided', () => {
    expect(surfaceAtoms('_flex _col _gap6 _p6', '4')).toBe('_flex _col _gap6 _p6');
  });

  it('returns default surface with gap when no custom', () => {
    expect(surfaceAtoms(undefined, '4')).toBe('_flex _col _gap4 _p4 _overflow[auto] _flex1');
  });
});

describe('spanAtom', () => {
  it('weight 3 → _span3', () => {
    expect(spanAtom(3)).toBe('_span3');
  });
});
