import { describe, expect, it } from 'vitest';
import { resolveAtomDecl } from '../src/atoms.js';

describe('resolveAtomDecl', () => {
  describe('display atoms', () => {
    it('resolves _flex to display:flex', () => {
      expect(resolveAtomDecl('_flex')).toBe('display:flex');
    });

    it('resolves _grid to display:grid', () => {
      expect(resolveAtomDecl('_grid')).toBe('display:grid');
    });

    it('resolves _block to display:block', () => {
      expect(resolveAtomDecl('_block')).toBe('display:block');
    });

    it('resolves _none to display:none', () => {
      expect(resolveAtomDecl('_none')).toBe('display:none');
    });
  });

  describe('flexbox atoms', () => {
    it('resolves _col to flex-direction:column', () => {
      expect(resolveAtomDecl('_col')).toBe('flex-direction:column');
    });

    it('resolves _row to flex-direction:row', () => {
      expect(resolveAtomDecl('_row')).toBe('flex-direction:row');
    });

    it('resolves _wrap to flex-wrap:wrap', () => {
      expect(resolveAtomDecl('_wrap')).toBe('flex-wrap:wrap');
    });

    it('resolves _flex1 to flex:1', () => {
      expect(resolveAtomDecl('_flex1')).toBe('flex:1');
    });
  });

  describe('alignment atoms', () => {
    it('resolves _aic to align-items:center', () => {
      expect(resolveAtomDecl('_aic')).toBe('align-items:center');
    });

    it('resolves _jcc to justify-content:center', () => {
      expect(resolveAtomDecl('_jcc')).toBe('justify-content:center');
    });

    it('resolves _jcsb to justify-content:space-between', () => {
      expect(resolveAtomDecl('_jcsb')).toBe('justify-content:space-between');
    });
  });

  describe('spacing atoms', () => {
    it('resolves _gap4 to gap:1rem', () => {
      expect(resolveAtomDecl('_gap4')).toBe('gap:1rem');
    });

    it('resolves _p4 to padding:1rem', () => {
      expect(resolveAtomDecl('_p4')).toBe('padding:1rem');
    });

    it('resolves _m2 to margin:0.5rem', () => {
      expect(resolveAtomDecl('_m2')).toBe('margin:0.5rem');
    });

    it('resolves _pt8 to padding-top:2rem', () => {
      expect(resolveAtomDecl('_pt8')).toBe('padding-top:2rem');
    });

    it('resolves _px4 to padding-inline:1rem', () => {
      expect(resolveAtomDecl('_px4')).toBe('padding-inline:1rem');
    });

    it('resolves _-mt4 to margin-top:-1rem', () => {
      expect(resolveAtomDecl('_-mt4')).toBe('margin-top:-1rem');
    });

    it('resolves _mauto to margin:auto', () => {
      expect(resolveAtomDecl('_mauto')).toBe('margin:auto');
    });

    it('resolves _mtauto to margin-top:auto', () => {
      expect(resolveAtomDecl('_mtauto')).toBe('margin-top:auto');
    });

    it('resolves _mxauto to margin-inline:auto', () => {
      expect(resolveAtomDecl('_mxauto')).toBe('margin-inline:auto');
    });

    it('resolves _mlauto to margin-left:auto', () => {
      expect(resolveAtomDecl('_mlauto')).toBe('margin-left:auto');
    });
  });

  describe('color atoms', () => {
    it('resolves _bgprimary to background:var(--d-primary)', () => {
      expect(resolveAtomDecl('_bgprimary')).toBe('background:var(--d-primary)');
    });

    it('resolves _fgmuted to color:var(--d-text-muted,var(--d-muted))', () => {
      expect(resolveAtomDecl('_fgmuted')).toBe('color:var(--d-text-muted,var(--d-muted))');
    });
  });

  describe('grid atoms', () => {
    it('resolves _gc3 to grid-template-columns:repeat(3,...)', () => {
      expect(resolveAtomDecl('_gc3')).toBe('grid-template-columns:repeat(3,minmax(0,1fr))');
    });

    it('resolves _span2 to grid-column:span 2/span 2', () => {
      expect(resolveAtomDecl('_span2')).toBe('grid-column:span 2/span 2');
    });
  });

  describe('typography atoms', () => {
    it('resolves _textsm', () => {
      expect(resolveAtomDecl('_textsm')).toBe('font-size:0.875rem;line-height:1.25rem');
    });

    it('resolves _heading1', () => {
      expect(resolveAtomDecl('_heading1')).toBe(
        'font-size:2.25rem;line-height:2.5rem;font-weight:700',
      );
    });
  });

  describe('container atoms', () => {
    it('resolves _container to max-width:1200px containment', () => {
      expect(resolveAtomDecl('_container')).toBe(
        'max-width:1200px;margin-inline:auto;width:100%;padding-inline:1rem',
      );
    });

    it('resolves _containersm to max-width:640px containment', () => {
      expect(resolveAtomDecl('_containersm')).toBe(
        'max-width:640px;margin-inline:auto;width:100%;padding-inline:1rem',
      );
    });

    it('resolves _containermd to max-width:768px containment', () => {
      expect(resolveAtomDecl('_containermd')).toBe(
        'max-width:768px;margin-inline:auto;width:100%;padding-inline:1rem',
      );
    });

    it('resolves _containerlg to max-width:1024px containment', () => {
      expect(resolveAtomDecl('_containerlg')).toBe(
        'max-width:1024px;margin-inline:auto;width:100%;padding-inline:1rem',
      );
    });

    it('resolves _containerxl to max-width:1400px containment', () => {
      expect(resolveAtomDecl('_containerxl')).toBe(
        'max-width:1400px;margin-inline:auto;width:100%;padding-inline:1rem',
      );
    });

    it('resolves _containerfull to max-width:100% containment', () => {
      expect(resolveAtomDecl('_containerfull')).toBe(
        'max-width:100%;margin-inline:auto;width:100%;padding-inline:1rem',
      );
    });

    it('resolves _cqinline to container-type:inline-size', () => {
      expect(resolveAtomDecl('_cqinline')).toBe('container-type:inline-size');
    });
  });

  describe('font family atoms', () => {
    it('resolves _fontmono to font-family with mono stack', () => {
      expect(resolveAtomDecl('_fontmono')).toBe(
        'font-family:var(--d-font-mono,ui-monospace,monospace)',
      );
    });
  });

  describe('color shorthand atoms', () => {
    it('resolves _bgsurf to background:var(--d-surface)', () => {
      expect(resolveAtomDecl('_bgsurf')).toBe('background:var(--d-surface)');
    });

    it('resolves _bgsurfraised to background:var(--d-surface-raised)', () => {
      expect(resolveAtomDecl('_bgsurfraised')).toBe('background:var(--d-surface-raised)');
    });
  });

  describe('max-width shorthand atoms', () => {
    it('resolves _mw640 to max-width:40rem', () => {
      expect(resolveAtomDecl('_mw640')).toBe('max-width:40rem');
    });

    it('resolves _mw480 to max-width:30rem', () => {
      expect(resolveAtomDecl('_mw480')).toBe('max-width:30rem');
    });
  });

  describe('content-authored Tailwind-style aliases', () => {
    it('resolves layout aliases emitted by registry shell atoms', () => {
      expect(resolveAtomDecl('_flex-col')).toBe('flex-direction:column');
      expect(resolveAtomDecl('_flex-1')).toBe('flex:1');
      expect(resolveAtomDecl('_min-h-dvh')).toBe('min-height:100dvh');
      expect(resolveAtomDecl('_max-w-screen-md')).toBe('max-width:768px');
      expect(resolveAtomDecl('_max-w-6xl')).toBe('max-width:72rem');
      expect(resolveAtomDecl('_mx-auto')).toBe('margin-inline:auto');
    });

    it('resolves spaced, color, and border aliases used by content packs', () => {
      expect(resolveAtomDecl('_gap-3')).toBe('gap:0.75rem');
      expect(resolveAtomDecl('_px-4')).toBe('padding-inline:1rem');
      expect(resolveAtomDecl('_pb-20')).toBe('padding-bottom:5rem');
      expect(resolveAtomDecl('_bg-background/85')).toBe(
        'background:color-mix(in srgb,var(--d-bg) 85%,transparent)',
      );
      expect(resolveAtomDecl('_text-text')).toBe('color:var(--d-text)');
      expect(resolveAtomDecl('_text-sm')).toBe('font-size:0.875rem;line-height:1.25rem');
      expect(resolveAtomDecl('_border-b')).toBe('border-bottom:1px solid var(--d-border)');
      expect(resolveAtomDecl('_border-border')).toBe('border-color:var(--d-border)');
      expect(resolveAtomDecl('_backdrop-blur')).toBe(
        'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)',
      );
    });

    it('resolves hyphenated arbitrary-value aliases from content packs', () => {
      expect(resolveAtomDecl('_h-[52px]')).toBe('height:52px');
      expect(resolveAtomDecl('_grid-cols-[1fr_320px]')).toBe('grid-template-columns:1fr 320px');
    });

    it('resolves legacy registry aliases observed in authored content', () => {
      expect(resolveAtomDecl('_relative')).toBe('position:relative');
      expect(resolveAtomDecl('_absolute')).toBe('position:absolute');
      expect(resolveAtomDecl('_mono')).toBe(
        'font-family:var(--d-font-mono,ui-monospace,monospace)',
      );
      expect(resolveAtomDecl('_fggreen')).toBe('color:#22c55e');
      expect(resolveAtomDecl('_borderB')).toBe('border-bottom:1px solid var(--d-border)');
      expect(resolveAtomDecl('_bordermuted/20')).toBe(
        'border-color:color-mix(in srgb,var(--d-muted,var(--d-border)) 20%,transparent)',
      );
      expect(resolveAtomDecl('_maxw-[560px]')).toBe('max-width:560px');
      expect(resolveAtomDecl('_max-h[300px]')).toBe('max-height:300px');
      expect(resolveAtomDecl('_max-w-420')).toBe('max-width:420px');
      expect(resolveAtomDecl('_columns2')).toBe('columns:2');
      expect(resolveAtomDecl('_grid-cols-auto-fill')).toBe(
        'grid-template-columns:repeat(auto-fill,minmax(16rem,1fr))',
      );
      expect(resolveAtomDecl('_grid-cols-auto')).toBe(
        'grid-template-columns:repeat(auto-fit,minmax(0,1fr))',
      );
      expect(resolveAtomDecl('_border-l-4')).toBe('border-left:4px solid var(--d-border)');
      expect(resolveAtomDecl('_borderR')).toBe('border-right:1px solid var(--d-border)');
      expect(resolveAtomDecl('_rounded-r-lg')).toBe(
        'border-top-right-radius:0.5rem;border-bottom-right-radius:0.5rem',
      );
      expect(resolveAtomDecl('_bgPrimary/10')).toBe(
        'background:color-mix(in srgb,var(--d-primary) 10%,transparent)',
      );
      expect(resolveAtomDecl('_bg-gray-950')).toBe('background:#030712');
      expect(resolveAtomDecl('_perspective-1000')).toBe('perspective:1000px');
      expect(resolveAtomDecl('_scale[1.05]')).toBe('transform:scale(1.05)');
      expect(resolveAtomDecl('_-space-x-2')).toBe('margin-left:-0.5rem');
    });
  });

  describe('unknown atoms', () => {
    it('returns null for unknown atoms', () => {
      expect(resolveAtomDecl('_unknownAtom')).toBeNull();
    });
  });
});
