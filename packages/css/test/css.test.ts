import { beforeEach, describe, expect, it } from 'vitest';
import { css, define } from '../src/css.js';
import { extractCSS, reset } from '../src/runtime.js';

describe('css()', () => {
  beforeEach(() => {
    reset();
  });

  describe('basic atoms', () => {
    it('processes single atom', () => {
      const result = css('_flex');
      expect(result).toBe('_flex');
      expect(extractCSS()).toContain('display:flex');
    });

    it('processes multiple atoms', () => {
      const result = css('_flex _col _gap4');
      expect(result).toBe('_flex _col _gap4');
      expect(extractCSS()).toContain('display:flex');
      expect(extractCSS()).toContain('flex-direction:column');
      expect(extractCSS()).toContain('gap:1rem');
    });

    it('handles multiple arguments', () => {
      const result = css('_flex', '_col', '_gap4');
      expect(result).toBe('_flex _col _gap4');
    });

    it('passes through unknown classes', () => {
      const result = css('_flex my-custom-class');
      expect(result).toBe('_flex my-custom-class');
    });

    it('handles falsy values', () => {
      const result = css('_flex', null, undefined, false, '_col');
      expect(result).toBe('_flex _col');
    });
  });

  describe('responsive prefixes', () => {
    it('handles _sm: prefix', () => {
      const result = css('_sm:gc3');
      expect(result).toBe('_sm:gc3');
      expect(extractCSS()).toContain('@media(min-width:640px)');
      expect(extractCSS()).toContain('grid-template-columns:repeat(3,minmax(0,1fr))');
    });

    it('handles _lg: prefix', () => {
      const result = css('_lg:gap8');
      expect(result).toBe('_lg:gap8');
      expect(extractCSS()).toContain('@media(min-width:1024px)');
    });

    it('handles _mdmax: max-width prefix', () => {
      const result = css('_mdmax:none');
      expect(result).toBe('_mdmax:none');
      const cssText = extractCSS();
      // (768 - 0.02) = 767.98 — the standard mobile-first / desktop-first
      // handoff value.
      expect(cssText).toContain('@media(max-width:767.98px)');
      expect(cssText).toContain('display:none');
    });

    it('handles _smmax: max-width prefix with pseudo', () => {
      const result = css('_smmax:h:bgmuted');
      expect(result).toBe('_smmax:h:bgmuted');
      const cssText = extractCSS();
      expect(cssText).toContain('@media(max-width:639.98px)');
      expect(cssText).toContain(':hover');
    });

    it('handles _lgmax: max-width prefix', () => {
      const result = css('_lgmax:gc1');
      expect(result).toBe('_lgmax:gc1');
      expect(extractCSS()).toContain('@media(max-width:1023.98px)');
    });
  });

  describe('pseudo-class prefixes', () => {
    it('handles _h: (hover) prefix', () => {
      const result = css('_h:bgprimary');
      expect(result).toBe('_h:bgprimary');
      expect(extractCSS()).toContain(':hover');
    });

    it('handles _f: (focus) prefix', () => {
      const result = css('_f:ring2');
      expect(result).toBe('_f:ring2');
      expect(extractCSS()).toContain(':focus');
    });
  });

  describe('special classes', () => {
    it('handles _group', () => {
      const result = css('_group');
      expect(result).toBe('d-group');
    });

    it('handles _peer', () => {
      const result = css('_peer');
      expect(result).toBe('d-peer');
    });
  });

  describe('arbitrary values', () => {
    it('handles _w[512px]', () => {
      const result = css('_w[512px]');
      expect(result).toBe('_w[512px]');
      expect(extractCSS()).toContain('width:512px');
    });

    it('handles _overflow[auto] (P0-3 ARB expansion)', () => {
      const result = css('_overflow[auto]');
      expect(result).toBe('_overflow[auto]');
      expect(extractCSS()).toContain('overflow:auto');
    });

    it('handles _whitespace[pre] (P0-3 ARB expansion)', () => {
      const result = css('_whitespace[pre]');
      expect(result).toBe('_whitespace[pre]');
      expect(extractCSS()).toContain('white-space:pre');
    });

    it('handles _text[left] (P0-3 ARB expansion)', () => {
      const result = css('_text[left]');
      expect(result).toBe('_text[left]');
      expect(extractCSS()).toContain('text-align:left');
    });

    it('handles _border[1px_solid_var(--d-border)] (P0-3 ARB expansion)', () => {
      const result = css('_border[1px_solid_var(--d-border)]');
      expect(result).toBe('_border[1px_solid_var(--d-border)]');
      const cssText = extractCSS();
      expect(cssText).toContain('border:1px solid var(--d-border)');
    });

    it('handles _aspect[16/9] (P0-3 ARB expansion)', () => {
      const result = css('_aspect[16/9]');
      expect(result).toBe('_aspect[16/9]');
      expect(extractCSS()).toContain('aspect-ratio:16/9');
    });

    it('handles _rounded[100px] (P0-3 ARB expansion)', () => {
      const result = css('_rounded[100px]');
      expect(result).toBe('_rounded[100px]');
      expect(extractCSS()).toContain('border-radius:100px');
    });

    it('escapes decimal arbitrary values in base selectors', () => {
      const result = css('_maxw[1.5rem]');
      expect(result).toBe('_maxw[1.5rem]');
      const cssText = extractCSS();
      expect(cssText).toContain('._maxw\\[1\\.5rem\\]');
      expect(cssText).toContain('max-width:1.5rem');
    });

    it('escapes decimal arbitrary values in responsive selectors', () => {
      const result = css('_lg:gc[1.05fr_1fr]');
      expect(result).toBe('_lg:gc[1.05fr_1fr]');
      const cssText = extractCSS();
      expect(cssText).toContain('._lg\\:gc\\[1\\.05fr_1fr\\]');
      expect(cssText).toContain('grid-template-columns:1.05fr 1fr');
    });

    it('escapes decimal arbitrary values in max-width responsive selectors', () => {
      const result = css('_mdmax:p[0.75rem]');
      expect(result).toBe('_mdmax:p[0.75rem]');
      const cssText = extractCSS();
      expect(cssText).toContain('._mdmax\\:p\\[0\\.75rem\\]');
      expect(cssText).toContain('padding:0.75rem');
    });

    it('escapes decimal arbitrary values in container query selectors', () => {
      const result = css('_cq640:maxw[1.5rem]');
      expect(result).toBe('_cq640:maxw[1.5rem]');
      const cssText = extractCSS();
      expect(cssText).toContain('._cq640\\:maxw\\[1\\.5rem\\]');
      expect(cssText).toContain('max-width:1.5rem');
    });

    it('escapes decimal arbitrary values in media query selectors', () => {
      const result = css('_motionSafe:maxw[1.5rem]');
      expect(result).toBe('_motionSafe:maxw[1.5rem]');
      const cssText = extractCSS();
      expect(cssText).toContain('._motionSafe\\:maxw\\[1\\.5rem\\]');
      expect(cssText).toContain('max-width:1.5rem');
    });

    it('handles hyphenated arbitrary values from content packs', () => {
      const result = css('_h-[52px] _grid-cols-[1fr_320px]');
      expect(result).toBe('_h-[52px] _grid-cols-[1fr_320px]');
      const cssText = extractCSS();
      expect(cssText).toContain('._h-\\[52px\\]');
      expect(cssText).toContain('height:52px');
      expect(cssText).toContain('._grid-cols-\\[1fr_320px\\]');
      expect(cssText).toContain('grid-template-columns:1fr 320px');
    });

    it('handles alpha colors with hyphenated semantic color aliases', () => {
      const result = css('_bg-background/85');
      expect(result).toBe('_bg-background/85');
      const cssText = extractCSS();
      expect(cssText).toContain('._bg-background\\/85');
      expect(cssText).toContain('background:color-mix(in srgb,var(--d-bg) 85%,transparent)');
    });

    it('escapes responsive hyphenated arbitrary values from content packs', () => {
      const result = css('_lg:grid-cols-[1.05fr_1fr]');
      expect(result).toBe('_lg:grid-cols-[1.05fr_1fr]');
      const cssText = extractCSS();
      expect(cssText).toContain('._lg\\:grid-cols-\\[1\\.05fr_1fr\\]');
      expect(cssText).toContain('grid-template-columns:1.05fr 1fr');
    });
  });
});

describe('define()', () => {
  beforeEach(() => {
    reset();
  });

  it('allows defining custom atoms', () => {
    define('_myatom', 'color:red;font-size:20px');
    const result = css('_myatom');
    expect(result).toBe('_myatom');
    expect(extractCSS()).toContain('color:red;font-size:20px');
  });
});
