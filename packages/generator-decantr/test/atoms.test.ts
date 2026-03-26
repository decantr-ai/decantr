import { describe, it, expect } from 'vitest';
import {
  gapAtom, gridAtoms, surfaceAtoms, spanAtom,
  densityGap, multiBreakpointGridAtoms, containerGridAtoms,
  responsiveSpanAtom, containerSpanAtom,
} from '../src/atoms.js';

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

  it('weighted grid with breakpoint: _grid _gc1 _md:gc4 _gap4', () => {
    expect(gridAtoms(4, { a: 3, b: 1 }, 'md', '4')).toBe('_grid _gc1 _md:gc4 _gap4');
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

describe('densityGap', () => {
  it('compact → "2"', () => {
    expect(densityGap('compact')).toBe('2');
  });

  it('comfortable → "4"', () => {
    expect(densityGap('comfortable')).toBe('4');
  });

  it('spacious → "6"', () => {
    expect(densityGap('spacious')).toBe('6');
  });

  it('applies positive content_gap_shift', () => {
    expect(densityGap('comfortable', 1)).toBe('5');
  });

  it('applies negative content_gap_shift', () => {
    expect(densityGap('comfortable', -1)).toBe('3');
  });

  it('clamps to minimum 1', () => {
    expect(densityGap('compact', -5)).toBe('1');
  });

  it('clamps to maximum 8', () => {
    expect(densityGap('spacious', 10)).toBe('8');
  });

  it('defaults to comfortable for unknown density', () => {
    expect(densityGap('unknown')).toBe('4');
  });
});

describe('multiBreakpointGridAtoms', () => {
  it('emits cascading breakpoint atoms', () => {
    const bps = [
      { at: 'sm', cols: 2 },
      { at: 'lg', cols: 3 },
      { at: 'xl', cols: 4 },
    ];
    expect(multiBreakpointGridAtoms(bps, '4')).toBe(
      '_grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4',
    );
  });

  it('sorts breakpoints by cascade order', () => {
    const bps = [
      { at: 'xl', cols: 4 },
      { at: 'sm', cols: 2 },
      { at: 'lg', cols: 3 },
    ];
    expect(multiBreakpointGridAtoms(bps, '4')).toBe(
      '_grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4',
    );
  });

  it('handles single breakpoint', () => {
    expect(multiBreakpointGridAtoms([{ at: 'md', cols: 2 }], '4')).toBe(
      '_grid _gc1 _md:gc2 _gap4',
    );
  });

  it('applies density gap', () => {
    expect(multiBreakpointGridAtoms([{ at: 'lg', cols: 3 }], '6')).toBe(
      '_grid _gc1 _lg:gc3 _gap6',
    );
  });
});

describe('containerGridAtoms', () => {
  it('emits container query atoms with @ prefix', () => {
    const bps = [
      { at: 'sm', cols: 2 },
      { at: 'lg', cols: 3 },
    ];
    expect(containerGridAtoms(bps, '4')).toBe(
      '_grid _container _@sm:gc2 _@lg:gc3 _gap4',
    );
  });

  it('sorts breakpoints by cascade order', () => {
    const bps = [
      { at: 'lg', cols: 3 },
      { at: 'sm', cols: 2 },
    ];
    expect(containerGridAtoms(bps, '4')).toBe(
      '_grid _container _@sm:gc2 _@lg:gc3 _gap4',
    );
  });
});

describe('responsiveSpanAtom', () => {
  it('emits breakpoint-prefixed span', () => {
    expect(responsiveSpanAtom(3, 'md')).toBe('_md:span3');
  });

  it('works with all breakpoints', () => {
    expect(responsiveSpanAtom(2, 'sm')).toBe('_sm:span2');
    expect(responsiveSpanAtom(1, 'xl')).toBe('_xl:span1');
    expect(responsiveSpanAtom(4, '2xl')).toBe('_2xl:span4');
  });
});

describe('containerSpanAtom', () => {
  it('emits @-prefixed span', () => {
    expect(containerSpanAtom(3, 'md')).toBe('_@md:span3');
  });

  it('works with all breakpoints', () => {
    expect(containerSpanAtom(2, 'lg')).toBe('_@lg:span2');
  });
});
