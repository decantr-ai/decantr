import { describe, it, expect } from 'vitest';
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
      expect(resolveAtomDecl('_heading1')).toBe('font-size:2.25rem;line-height:2.5rem;font-weight:700');
    });
  });

  describe('container atoms', () => {
    it('resolves _container to max-width:1200px containment', () => {
      expect(resolveAtomDecl('_container')).toBe('max-width:1200px;margin-inline:auto;width:100%;padding-inline:1rem');
    });

    it('resolves _containersm to max-width:640px containment', () => {
      expect(resolveAtomDecl('_containersm')).toBe('max-width:640px;margin-inline:auto;width:100%;padding-inline:1rem');
    });

    it('resolves _containermd to max-width:768px containment', () => {
      expect(resolveAtomDecl('_containermd')).toBe('max-width:768px;margin-inline:auto;width:100%;padding-inline:1rem');
    });

    it('resolves _containerlg to max-width:1024px containment', () => {
      expect(resolveAtomDecl('_containerlg')).toBe('max-width:1024px;margin-inline:auto;width:100%;padding-inline:1rem');
    });

    it('resolves _containerxl to max-width:1400px containment', () => {
      expect(resolveAtomDecl('_containerxl')).toBe('max-width:1400px;margin-inline:auto;width:100%;padding-inline:1rem');
    });

    it('resolves _containerfull to max-width:100% containment', () => {
      expect(resolveAtomDecl('_containerfull')).toBe('max-width:100%;margin-inline:auto;width:100%;padding-inline:1rem');
    });

    it('resolves _cqinline to container-type:inline-size', () => {
      expect(resolveAtomDecl('_cqinline')).toBe('container-type:inline-size');
    });
  });

  describe('font family atoms', () => {
    it('resolves _fontmono to font-family with mono stack', () => {
      expect(resolveAtomDecl('_fontmono')).toBe('font-family:var(--d-font-mono,ui-monospace,monospace)');
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

  describe('unknown atoms', () => {
    it('returns null for unknown atoms', () => {
      expect(resolveAtomDecl('_unknownAtom')).toBeNull();
    });
  });
});
