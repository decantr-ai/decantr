import { describe, it, expect, beforeEach } from 'vitest';
import { css, define } from '../src/css.js';
import { reset, extractCSS } from '../src/runtime.js';

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
