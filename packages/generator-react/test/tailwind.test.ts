import { describe, it, expect } from 'vitest';
import { gapClass, gridClasses, spanClass, surfaceClasses, atomsToTailwind } from '../src/tailwind.js';

// ── Existing utility function tests ──

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

// ── Layout atoms ──

describe('layout atoms', () => {
  it.each([
    ['_flex', 'flex'],
    ['_grid', 'grid'],
    ['_row', 'flex-row'],
    ['_col', 'flex-col'],
    ['_wrap', 'flex-wrap'],
    ['_nowrap', 'flex-nowrap'],
    ['_inline', 'inline'],
    ['_block', 'block'],
    ['_hidden', 'hidden'],
    ['_relative', 'relative'],
    ['_absolute', 'absolute'],
    ['_fixed', 'fixed'],
    ['_sticky', 'sticky'],
    ['_inset0', 'inset-0'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Flex alignment ──

describe('flex alignment atoms', () => {
  it.each([
    ['_items[center]', 'items-center'],
    ['_items[start]', 'items-start'],
    ['_items[end]', 'items-end'],
    ['_items[stretch]', 'items-stretch'],
    ['_items[baseline]', 'items-baseline'],
    ['_justify[center]', 'justify-center'],
    ['_justify[between]', 'justify-between'],
    ['_justify[start]', 'justify-start'],
    ['_justify[end]', 'justify-end'],
    ['_justify[around]', 'justify-around'],
    ['_justify[evenly]', 'justify-evenly'],
    ['_self[center]', 'self-center'],
    ['_self[start]', 'self-start'],
    ['_self[end]', 'self-end'],
    ['_self[stretch]', 'self-stretch'],
    ['_flex1', 'flex-1'],
    ['_flexnone', 'flex-none'],
    ['_flexauto', 'flex-auto'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Grid columns and spans ──

describe('grid columns', () => {
  it.each(
    Array.from({ length: 12 }, (_, i) => [`_gc${i + 1}`, `grid-cols-${i + 1}`]),
  )('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each(
    Array.from({ length: 12 }, (_, i) => [`_span${i + 1}`, `col-span-${i + 1}`]),
  )('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each(
    Array.from({ length: 6 }, (_, i) => [`_gr${i + 1}`, `grid-rows-${i + 1}`]),
  )('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each(
    Array.from({ length: 6 }, (_, i) => [`_rspan${i + 1}`, `row-span-${i + 1}`]),
  )('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Spacing: gap ──

describe('gap atoms', () => {
  it.each(
    Array.from({ length: 13 }, (_, i) => [`_gap${i}`, `gap-${i}`]),
  )('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each([
    ['_gapx4', 'gap-x-4'],
    ['_gapx8', 'gap-x-8'],
    ['_gapy2', 'gap-y-2'],
    ['_gapy6', 'gap-y-6'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Spacing: padding ──

describe('padding atoms', () => {
  it.each(
    Array.from({ length: 13 }, (_, i) => [`_p${i}`, `p-${i}`]),
  )('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each(
    Array.from({ length: 13 }, (_, i) => [`_px${i}`, `px-${i}`]),
  )('%s → %s (px)', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each(
    Array.from({ length: 13 }, (_, i) => [`_py${i}`, `py-${i}`]),
  )('%s → %s (py)', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each([
    ['_pt0', 'pt-0'], ['_pt4', 'pt-4'], ['_pt12', 'pt-12'],
    ['_pb0', 'pb-0'], ['_pb4', 'pb-4'], ['_pb12', 'pb-12'],
    ['_pl0', 'pl-0'], ['_pl4', 'pl-4'], ['_pl12', 'pl-12'],
    ['_pr0', 'pr-0'], ['_pr4', 'pr-4'], ['_pr12', 'pr-12'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Spacing: margin ──

describe('margin atoms', () => {
  it.each(
    Array.from({ length: 13 }, (_, i) => [`_m${i}`, `m-${i}`]),
  )('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it.each([
    ['_mx0', 'mx-0'], ['_mx4', 'mx-4'], ['_mx12', 'mx-12'],
    ['_my0', 'my-0'], ['_my4', 'my-4'], ['_my12', 'my-12'],
    ['_mt0', 'mt-0'], ['_mt4', 'mt-4'], ['_mt12', 'mt-12'],
    ['_mb0', 'mb-0'], ['_mb4', 'mb-4'], ['_mb12', 'mb-12'],
    ['_ml0', 'ml-0'], ['_ml4', 'ml-4'], ['_ml12', 'ml-12'],
    ['_mr0', 'mr-0'], ['_mr4', 'mr-4'], ['_mr12', 'mr-12'],
    ['_mxauto', 'mx-auto'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Sizing ──

describe('sizing atoms', () => {
  it.each([
    ['_w[100%]', 'w-full'],
    ['_w[auto]', 'w-auto'],
    ['_w[50%]', 'w-1/2'],
    ['_h[100%]', 'h-full'],
    ['_h[auto]', 'h-auto'],
    ['_h[100vh]', 'h-screen'],
    ['_minH[0]', 'min-h-0'],
    ['_minH[100vh]', 'min-h-screen'],
    ['_maxW[sm]', 'max-w-sm'],
    ['_maxW[md]', 'max-w-md'],
    ['_maxW[lg]', 'max-w-lg'],
    ['_maxW[xl]', 'max-w-xl'],
    ['_maxW[2xl]', 'max-w-2xl'],
    ['_maxW[3xl]', 'max-w-3xl'],
    ['_maxW[4xl]', 'max-w-4xl'],
    ['_maxW[5xl]', 'max-w-5xl'],
    ['_maxW[6xl]', 'max-w-6xl'],
    ['_maxW[7xl]', 'max-w-7xl'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Typography ──

describe('typography atoms', () => {
  it.each([
    ['_text[center]', 'text-center'],
    ['_text[left]', 'text-left'],
    ['_text[right]', 'text-right'],
    ['_text[xs]', 'text-xs'],
    ['_text[sm]', 'text-sm'],
    ['_text[base]', 'text-base'],
    ['_text[lg]', 'text-lg'],
    ['_text[xl]', 'text-xl'],
    ['_text[2xl]', 'text-2xl'],
    ['_text[3xl]', 'text-3xl'],
    ['_text[4xl]', 'text-4xl'],
    ['_text[5xl]', 'text-5xl'],
    ['_text[6xl]', 'text-6xl'],
    ['_text[7xl]', 'text-7xl'],
    ['_text[8xl]', 'text-8xl'],
    ['_text[9xl]', 'text-9xl'],
    ['_font[bold]', 'font-bold'],
    ['_font[semibold]', 'font-semibold'],
    ['_font[medium]', 'font-medium'],
    ['_font[normal]', 'font-normal'],
    ['_font[light]', 'font-light'],
    ['_leading[tight]', 'leading-tight'],
    ['_leading[normal]', 'leading-normal'],
    ['_leading[relaxed]', 'leading-relaxed'],
    ['_tracking[tight]', 'tracking-tight'],
    ['_tracking[wide]', 'tracking-wide'],
    ['_truncate', 'truncate'],
    ['_uppercase', 'uppercase'],
    ['_lowercase', 'lowercase'],
    ['_capitalize', 'capitalize'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it('heading presets expand to multiple classes', () => {
    expect(atomsToTailwind('_heading1')).toBe('text-4xl font-bold tracking-tight');
    expect(atomsToTailwind('_heading2')).toBe('text-3xl font-semibold tracking-tight');
  });
});

// ── Semantic colors ──

describe('color atoms', () => {
  it.each([
    ['_fgprimary', 'text-primary'],
    ['_fgsecondary', 'text-secondary'],
    ['_fgmuted', 'text-muted-foreground'],
    ['_fgaccent', 'text-accent-foreground'],
    ['_fgdestructive', 'text-destructive'],
    ['_bgprimary', 'bg-primary'],
    ['_bgsecondary', 'bg-secondary'],
    ['_bgmuted', 'bg-muted'],
    ['_bgaccent', 'bg-accent'],
    ['_bgcard', 'bg-card'],
    ['_bgbackground', 'bg-background'],
    ['_bcborder', 'border-border'],
    ['_bcprimary', 'border-primary'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });

  it('opacity modifiers: _bgprimary/50 → bg-primary/50', () => {
    expect(atomsToTailwind('_bgprimary/50')).toBe('bg-primary/50');
  });

  it('opacity modifiers: _fgmuted/75 → text-muted-foreground/75', () => {
    expect(atomsToTailwind('_fgmuted/75')).toBe('text-muted-foreground/75');
  });

  it('opacity modifiers: _bcborder/25 → border-border/25', () => {
    expect(atomsToTailwind('_bcborder/25')).toBe('border-border/25');
  });
});

// ── Borders ──

describe('border atoms', () => {
  it.each([
    ['_border', 'border'],
    ['_bbsolid', 'border-b'],
    ['_btsolid', 'border-t'],
    ['_rounded', 'rounded-md'],
    ['_rounded[sm]', 'rounded-sm'],
    ['_rounded[lg]', 'rounded-lg'],
    ['_rounded[full]', 'rounded-full'],
    ['_rounded[none]', 'rounded-none'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Effects ──

describe('effect atoms', () => {
  it.each([
    ['_shadow', 'shadow'],
    ['_shadow[sm]', 'shadow-sm'],
    ['_shadow[lg]', 'shadow-lg'],
    ['_shadow[none]', 'shadow-none'],
    ['_overflow[auto]', 'overflow-auto'],
    ['_overflow[hidden]', 'overflow-hidden'],
    ['_overflow[scroll]', 'overflow-scroll'],
    ['_opacity[50]', 'opacity-50'],
    ['_opacity[75]', 'opacity-75'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});

// ── Responsive prefixes ──

describe('responsive prefixes', () => {
  it('_lg:gc2 → lg:grid-cols-2', () => {
    expect(atomsToTailwind('_lg:gc2')).toBe('lg:grid-cols-2');
  });

  it('_sm:hidden → sm:hidden', () => {
    expect(atomsToTailwind('_sm:hidden')).toBe('sm:hidden');
  });

  it('_md:flex → md:flex', () => {
    expect(atomsToTailwind('_md:flex')).toBe('md:flex');
  });

  it('_xl:gap6 → xl:gap-6', () => {
    expect(atomsToTailwind('_xl:gap6')).toBe('xl:gap-6');
  });

  it('_2xl:gc4 → 2xl:grid-cols-4', () => {
    expect(atomsToTailwind('_2xl:gc4')).toBe('2xl:grid-cols-4');
  });

  it('_lg:p8 → lg:p-8', () => {
    expect(atomsToTailwind('_lg:p8')).toBe('lg:p-8');
  });

  it('_md:col → md:flex-col', () => {
    expect(atomsToTailwind('_md:col')).toBe('md:flex-col');
  });

  it('responsive prefix on composite expands all classes', () => {
    expect(atomsToTailwind('_lg:heading1')).toBe('lg:text-4xl lg:font-bold lg:tracking-tight');
  });
});

// ── Arbitrary values ──

describe('arbitrary values', () => {
  it('_bg[#ff0000] → bg-[#ff0000]', () => {
    expect(atomsToTailwind('_bg[#ff0000]')).toBe('bg-[#ff0000]');
  });

  it('_w[calc(100%-2rem)] → w-[calc(100%-2rem)]', () => {
    expect(atomsToTailwind('_w[calc(100%-2rem)]')).toBe('w-[calc(100%-2rem)]');
  });

  it('_p[clamp(1rem,2vw,3rem)] → p-[clamp(1rem,2vw,3rem)]', () => {
    expect(atomsToTailwind('_p[clamp(1rem,2vw,3rem)]')).toBe('p-[clamp(1rem,2vw,3rem)]');
  });

  it('_trans[color_0.15s_ease] → transition-[color_0.15s_ease]', () => {
    expect(atomsToTailwind('_trans[color_0.15s_ease]')).toBe('transition-[color_0.15s_ease]');
  });

  it('_w[640px] → w-[640px]', () => {
    expect(atomsToTailwind('_w[640px]')).toBe('w-[640px]');
  });

  it('_h[300px] → h-[300px]', () => {
    expect(atomsToTailwind('_h[300px]')).toBe('h-[300px]');
  });
});

// ── Compound atom strings ──

describe('compound atom strings', () => {
  it('maps a full layout string', () => {
    expect(atomsToTailwind('_flex _col _gap4 _p4')).toBe('flex flex-col gap-4 p-4');
  });

  it('maps colors + typography', () => {
    expect(atomsToTailwind('_bgmuted _fgprimary _text[lg] _font[bold]'))
      .toBe('bg-muted text-primary text-lg font-bold');
  });

  it('drops recipe decorators in mixed strings', () => {
    expect(atomsToTailwind('_flex d-glass _gap4 d-mesh _p4')).toBe('flex gap-4 p-4');
  });

  it('handles responsive + static atoms together', () => {
    expect(atomsToTailwind('_grid _gc1 _lg:gc3 _gap4'))
      .toBe('grid grid-cols-1 lg:grid-cols-3 gap-4');
  });
});

// ── Legacy alias compat ──

describe('legacy aliases', () => {
  it.each([
    ['_aic', 'items-center'],
    ['_jcc', 'justify-center'],
    ['_jcsb', 'justify-between'],
    ['_tc', 'text-center'],
    ['_wfull', 'w-full'],
    ['_hfull', 'h-full'],
  ])('%s → %s', (atom, expected) => {
    expect(atomsToTailwind(atom)).toBe(expected);
  });
});
