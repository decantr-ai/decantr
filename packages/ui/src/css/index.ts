import { resolveAtomDecl } from './atoms.js';
import { inject, injectResponsive, injectResponsivePseudo, injectContainer, injectGroupPeer, injectPseudo, injectMediaQuery, CQ_WIDTHS } from './runtime.js';
export { extractCSS, reset, BREAKPOINTS, CQ_WIDTHS } from './runtime.js';
export {
  setTheme, getTheme, getThemeMeta, registerTheme, getThemeList,
  getActiveCSS, resetStyles, setAnimations, getAnimations,
  setStyle, getStyle, getStyleList, registerStyle, mergePluginStyles,
  setMode, getMode, getResolvedMode, onModeChange,
  setShape, getShape, getShapeList,
  setColorblindMode, getColorblindMode
} from './theme-registry.js';

const customAtoms = new Map<string, string>();

/** Regex to detect responsive prefix: _sm:, _md:, _lg:, _xl: */
const BP_RE = /^_(sm|md|lg|xl):(.+)$/;

/** Regex to detect container query prefix: _cq320:, _cq480:, _cq640:, _cq768:, _cq1024: */
const CQ_RE = /^_cq(\d+):(.+)$/;

/** Regex to detect group/peer state prefix: _gh:, _gf:, _ga:, _ph:, _pf:, _pa: */
const GP_RE = /^_(gh|gf|ga|ph|pf|pa):(.+)$/;

/** Regex to detect pseudo-class prefix: _h:, _f:, _fv:, _a:, _fw: */
const PSEUDO_RE = /^_(h|f|fv|a|fw):(.+)$/;

/** Regex to detect motion preference prefix: _motionSafe:, _motionReduce: */
const MOTION_RE = /^_(motionSafe|motionReduce):(.+)$/;
const MOTION_QUERIES = {
  motionSafe: '(prefers-reduced-motion: no-preference)',
  motionReduce: '(prefers-reduced-motion: reduce)'
};

/** Regex to detect opacity modifier: _bgprimary/50, _fgaccent/30 */
const ALPHA_RE = /^(_[a-zA-Z0-9]+)\/(\d+)$/;

/** Regex to detect arbitrary value: _w[512px], _bg[#1a1d24] */
const ARB_RE = /^_([a-zA-Z]+)\[([^\]]+)\]$/;

/** Valid container query widths as a Set for fast lookup */
const CQ_SET = new Set(CQ_WIDTHS);

/**
 * Sanitize an arbitrary CSS value to prevent injection.
 * Strips characters that could break out of a CSS declaration/rule:
 *  - { } — rule breakout
 *  - ; — property injection
 *  - < > — HTML injection if value ends up in SSR output
 * Also blocks url() to prevent data exfiltration via background/etc.
 * @param {string} val
 * @returns {string}
 */
function sanitizeArbValue(val: any) {
  // Strip dangerous characters
  let safe = val.replace(/[{}<>;]/g, '');
  // Block url() — case-insensitive, with optional whitespace
  safe = safe.replace(/url\s*\(/gi, '');
  return safe;
}

/** Property prefix map for arbitrary values */
const ARB_PROPS = {
  w: 'width', h: 'height', mw: 'max-width', mh: 'max-height',
  minw: 'min-width', minh: 'min-height',
  p: 'padding', pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left',
  px: 'padding-inline', py: 'padding-block',
  m: 'margin', mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left',
  mx: 'margin-inline', my: 'margin-block',
  gap: 'gap', gx: 'column-gap', gy: 'row-gap',
  t: 'font-size', fs: 'font-size', lh: 'line-height', fw: 'font-weight', ls: 'letter-spacing',
  r: 'border-radius', bg: 'background', fg: 'color', bc: 'border-color',
  bw: 'border-width', bt: 'border-top', bb: 'border-bottom', br: 'border-right', bl: 'border-left',
  z: 'z-index', op: 'opacity',
  top: 'top', right: 'right', bottom: 'bottom', left: 'left', inset: 'inset',
  shadow: 'box-shadow', bf: 'backdrop-filter',
  outline: 'outline', trans: 'transition', object: 'object-fit',
  gc: 'grid-template-columns', gr: 'grid-template-rows',
};

/**
 * Resolve an atom name to its CSS declaration.
 * Handles: standard atoms, opacity modifiers (/N), and arbitrary values ([val]).
 * @param {string} atomPart — e.g. '_p4', '_bgprimary/50', '_w[512px]'
 * @returns {{ className: string, decl: string }|null}
 */
function resolveAtom(atomPart: string): { className: string; decl: string } | null {
  // 1. Custom atoms first (user-defined via define())
  const custom = customAtoms.get(atomPart);
  if (custom) return { className: atomPart, decl: custom };

  // 2. Algorithmic resolution (handles aliases, direct, patterns, residual)
  const decl = resolveAtomDecl(atomPart);
  if (decl) return { className: atomPart, decl };

  // 3. Opacity modifier: _bgprimary/50
  const alphaMatch = atomPart.match(ALPHA_RE);
  if (alphaMatch) {
    const [, base, alphaStr] = alphaMatch;
    const baseDecl = customAtoms.get(base) || resolveAtomDecl(base);
    if (baseDecl) {
      const alpha = Number(alphaStr);
      if (alpha >= 0 && alpha <= 100) {
        // Extract property:var(--d-*) pattern for color-mix
        const colorMatch = baseDecl.match(/^(background|color|border-color):(var\(--[^)]+\))$/);
        if (colorMatch) {
          const [, prop, varRef] = colorMatch;
          return {
            className: atomPart,
            decl: `${prop}:color-mix(in srgb,${varRef} ${alpha}%,transparent)`,
          };
        }
      }
    }
    return null;
  }

  // 3. Arbitrary value: _w[512px]
  const arbMatch = atomPart.match(ARB_RE);
  if (arbMatch) {
    const [, propPrefix, rawValue] = arbMatch;
    // @ts-expect-error -- strict-mode fix (auto)
    const cssProp = ARB_PROPS[propPrefix] || ARB_PROPS[propPrefix.toLowerCase()];
    if (cssProp) {
      // Convert underscores to spaces in value (e.g., 0_4px_6px → 0 4px 6px)
      // Sanitize to prevent CSS injection via rule breakout or property injection
      const value = sanitizeArbValue(rawValue.replace(/_/g, ' '));
      if (!value) return null;
      return { className: atomPart, decl: `${cssProp}:${value}` };
    }
    return null;
  }

  // Dev-mode warning for unresolved atoms (atoms start with _)
  if (atomPart.startsWith('_') && typeof globalThis !== 'undefined' && globalThis.__DECANTR_DEV__) {
    console.warn(`[decantr] Unknown atom: "${atomPart}" — no CSS will be generated. Check reference/atoms.md`);
  }

  return null;
}

/**
 * Escape special characters in a CSS class name for use in selectors.
 * @param {string} cls
 * @returns {string}
 */
function escapeClass(cls: string): string {
  return cls.replace(/:/g, '\\:').replace(/\//g, '\\/').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#').replace(/%/g, '\\%').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/,/g, '\\,').replace(/\+/g, '\\+');
}

export function css(...classes: string[]): string {
  const result = [];
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    if (!cls) continue;
    // Support space-separated classes in a single string
    const parts = cls.split(/\s+/);
    for (const part of parts) {
      if (!part) continue;

      // Special handling: _group → d-group, _peer → d-peer
      if (part === '_group') { result.push('d-group'); continue; }
      if (part === '_peer') { result.push('d-peer'); continue; }
      // Component-class atoms: _prose → d-prose, _divideY → d-divide-y, _divideX → d-divide-x
      if (part === '_prose') { result.push('d-prose'); continue; }
      if (part === '_divideY') { result.push('d-divide-y'); continue; }
      if (part === '_divideX') { result.push('d-divide-x'); continue; }

      // Check for motion preference prefix: _motionSafe:trans, _motionReduce:transnone
      const motionMatch = part.match(MOTION_RE);
      if (motionMatch) {
        const [, motionPrefix, innerAtom] = motionMatch;
        const resolved = resolveAtom(`_${innerAtom}`);
        if (resolved) {
          // @ts-expect-error -- strict-mode fix (auto)
          injectMediaQuery(part, resolved.decl, MOTION_QUERIES[motionPrefix]);
          result.push(part);
        } else {
          result.push(part);
        }
        continue;
      }

      // Check for responsive prefix: _sm:gc3 → atom _gc3 at breakpoint sm
      const bpMatch = part.match(BP_RE);
      if (bpMatch) {
        const [, bp, innerAtom] = bpMatch;
        // The inner atom may itself be a group/peer, opacity, or arbitrary
        const gpInner = innerAtom.match(/^(gh|gf|ga|ph|pf|pa):(.+)$/);
        if (gpInner) {
          // Responsive + group/peer: not supported (too complex), pass through
          result.push(part);
          continue;
        }
        // Check for responsive + pseudo: _sm:h:bgmuted
        const pseudoInner = innerAtom.match(/^(h|f|fv|a|fw):(.+)$/);
        if (pseudoInner) {
          const [, pseudoPrefix, atomName] = pseudoInner;
          const resolved = resolveAtom(`_${atomName}`);
          if (resolved) {
            const PSEUDO_NAMES = { h: 'hover', f: 'focus', fv: 'focus-visible', a: 'active', fw: 'focus-within' };
            // @ts-expect-error -- strict-mode fix (auto)
            injectResponsivePseudo(part, resolved.decl, bp, PSEUDO_NAMES[pseudoPrefix]);
            result.push(part);
          } else {
            result.push(part);
          }
          continue;
        }
        const resolved = resolveAtom(`_${innerAtom}`);
        if (resolved) {
          injectResponsive(part, resolved.decl, bp);
          result.push(part);
        } else {
          result.push(part);
        }
        continue;
      }

      // Check for container query prefix: _cq640:gc3
      const cqMatch = part.match(CQ_RE);
      if (cqMatch) {
        const width = Number(cqMatch[1]);
        const innerAtom = cqMatch[2];
        if (CQ_SET.has(width)) {
          const resolved = resolveAtom(`_${innerAtom}`);
          if (resolved) {
            injectContainer(part, resolved.decl, width);
            result.push(part);
          } else {
            result.push(part);
          }
        } else {
          result.push(part);
        }
        continue;
      }

      // Check for group/peer state prefix: _gh:fgprimary
      const gpMatch = part.match(GP_RE);
      if (gpMatch) {
        const [, prefix, atomName] = gpMatch;
        const resolved = resolveAtom(`_${atomName}`);
        if (resolved) {
          injectGroupPeer(part, resolved.decl, prefix);
          result.push(part);
        } else {
          result.push(part);
        }
        continue;
      }

      // Check for pseudo-class prefix: _h:bgprimary, _fv:ring2, _a:scale95
      const pseudoMatch = part.match(PSEUDO_RE);
      if (pseudoMatch) {
        const [, prefix, innerAtom] = pseudoMatch;
        const resolved = resolveAtom(`_${innerAtom}`);
        if (resolved) {
          injectPseudo(part, resolved.decl, prefix);
          result.push(part);
        } else {
          result.push(part);
        }
        continue;
      }

      // Try to resolve (handles direct, opacity, and arbitrary)
      const resolved = resolveAtom(part);
      if (resolved) {
        // Pass escaped class name if it contains special CSS selector characters
        const needsEscape = /[/\[\]#%(),+]/.test(resolved.className);
        inject(resolved.className, resolved.decl, needsEscape ? escapeClass(resolved.className) : undefined);
        result.push(part);
      } else {
        // Pass through unknown classes (user CSS)
        result.push(part);
      }
    }
  }
  return result.join(' ');
}

export function define(name: string, declaration: string): void {
  customAtoms.set(name, declaration);
}

/**
 * Sanitizes a string for safe use in HTML attributes.
 * Escapes <, >, ", ', & characters.
 * @param {string} str
 * @returns {string}
 */
export function sanitize(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
