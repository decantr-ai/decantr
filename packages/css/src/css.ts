/**
 * Decantr CSS - Main css() function.
 */

import { resolveAtomDecl } from './atoms.js';
import {
  CQ_WIDTHS,
  inject,
  injectContainer,
  injectGroupPeer,
  injectMediaQuery,
  injectPseudo,
  injectResponsive,
  injectResponsiveMax,
  injectResponsiveMaxPseudo,
  injectResponsivePseudo,
} from './runtime.js';

/** Custom atoms defined by user */
const customAtoms = new Map<string, string>();

/** Regex patterns for prefix detection */
const BP_RE = /^_(sm|md|lg|xl):(.+)$/;
/**
 * Max-width variants: '_mdmax:none' → `display:none` at (md - 0.02)px and below.
 * Mirrors the min-width BP_RE form but with the 'max' suffix appended to the
 * breakpoint key. Useful for "hide below this breakpoint" / "swap layout at
 * small viewports" expressions that mobile-first min-width queries can't
 * directly express.
 */
const BP_MAX_RE = /^_(sm|md|lg|xl)max:(.+)$/;
const CQ_RE = /^_cq(\d+):(.+)$/;
const GP_RE = /^_(gh|gf|ga|ph|pf|pa):(.+)$/;
const PSEUDO_RE = /^_(h|f|fv|a|fw):(.+)$/;
const MOTION_RE = /^_(motionSafe|motionReduce):(.+)$/;
const ALPHA_RE = /^(_[a-zA-Z0-9]+)\/(\d+)$/;
const ARB_RE = /^_([a-zA-Z]+)\[([^\]]+)\]$/;

const MOTION_QUERIES: Record<string, string> = {
  motionSafe: '(prefers-reduced-motion: no-preference)',
  motionReduce: '(prefers-reduced-motion: reduce)',
};

const PSEUDO_NAMES: Record<string, string> = {
  h: 'hover',
  f: 'focus',
  fv: 'focus-visible',
  a: 'active',
  fw: 'focus-within',
};

const CQ_SET = new Set(CQ_WIDTHS);

/** Property prefix map for arbitrary values */
const ARB_PROPS: Record<string, string> = {
  w: 'width',
  h: 'height',
  mw: 'max-width',
  mh: 'max-height',
  maxw: 'max-width',
  maxh: 'max-height',
  minw: 'min-width',
  minh: 'min-height',
  p: 'padding',
  pt: 'padding-top',
  pr: 'padding-right',
  pb: 'padding-bottom',
  pl: 'padding-left',
  px: 'padding-inline',
  py: 'padding-block',
  m: 'margin',
  mt: 'margin-top',
  mr: 'margin-right',
  mb: 'margin-bottom',
  ml: 'margin-left',
  mx: 'margin-inline',
  my: 'margin-block',
  gap: 'gap',
  gx: 'column-gap',
  gy: 'row-gap',
  t: 'font-size',
  fs: 'font-size',
  lh: 'line-height',
  fw: 'font-weight',
  ls: 'letter-spacing',
  leading: 'line-height',
  tracking: 'letter-spacing',
  r: 'border-radius',
  rounded: 'border-radius',
  bg: 'background',
  fg: 'color',
  bc: 'border-color',
  bw: 'border-width',
  bt: 'border-top',
  bb: 'border-bottom',
  br: 'border-right',
  bl: 'border-left',
  border: 'border',
  z: 'z-index',
  op: 'opacity',
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  inset: 'inset',
  shadow: 'box-shadow',
  bf: 'backdrop-filter',
  outline: 'outline',
  trans: 'transition',
  object: 'object-fit',
  gc: 'grid-template-columns',
  gr: 'grid-template-rows',
  // Additional content-observed bracket atoms (P0-3 expansion). The v1
  // harness report flagged the page-pack Surface emitting atoms the
  // runtime didn't resolve; same class of silent-failure applies when
  // pattern JSONs use prefixes not in this map. These additions cover
  // every bracket prefix observed across the 209 archetype + 80+ pattern
  // JSONs in decantr-content.
  overflow: 'overflow',
  pointer: 'pointer-events',
  text: 'text-align',
  whitespace: 'white-space',
  items: 'align-items',
  justify: 'justify-content',
  aspect: 'aspect-ratio',
  snap: 'scroll-snap-type',
  // Note: 'scale' intentionally omitted — use the numeric `_scale95` /
  // `_scale100` / `_scale105` atoms. Bracket form would need value wrapping
  // (`scale(1.05)` vs `1.05`) which the generic emitter can't do.
  display: 'display',
  position: 'position',
  pos: 'position',
  cursor: 'cursor',
};

/**
 * Sanitize an arbitrary CSS value to prevent injection.
 */
function sanitizeArbValue(val: string): string {
  let safe = val.replace(/[{}<>;]/g, '');
  safe = safe.replace(/url\s*\(/gi, '');
  return safe;
}

/**
 * Resolve an atom name to its CSS declaration.
 */
function resolveAtom(atomPart: string): { className: string; decl: string } | null {
  // 1. Custom atoms first
  const custom = customAtoms.get(atomPart);
  if (custom) return { className: atomPart, decl: custom };

  // 2. Algorithmic resolution
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

  // 4. Arbitrary value: _w[512px]
  const arbMatch = atomPart.match(ARB_RE);
  if (arbMatch) {
    const [, propPrefix, rawValue] = arbMatch;
    const cssProp = ARB_PROPS[propPrefix] || ARB_PROPS[propPrefix.toLowerCase()];
    if (cssProp) {
      const value = sanitizeArbValue(rawValue.replace(/_/g, ' '));
      if (!value) return null;
      return { className: atomPart, decl: `${cssProp}:${value}` };
    }
    return null;
  }

  return null;
}

/**
 * Escape special characters in a CSS class name.
 */
function escapeClass(cls: string): string {
  return cls
    .replace(/:/g, '\\:')
    .replace(/\//g, '\\/')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/,/g, '\\,')
    .replace(/\+/g, '\\+');
}

/**
 * Process atom strings and inject CSS.
 * @param classes - One or more class strings
 * @returns Space-separated class names
 */
export function css(...classes: (string | undefined | null | false)[]): string {
  const result: string[] = [];

  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    if (!cls) continue;

    // Support space-separated classes in a single string
    const parts = cls.split(/\s+/);
    for (const part of parts) {
      if (!part) continue;

      // Special handling: _group -> d-group, _peer -> d-peer
      if (part === '_group') {
        result.push('d-group');
        continue;
      }
      if (part === '_peer') {
        result.push('d-peer');
        continue;
      }
      if (part === '_prose') {
        result.push('d-prose');
        continue;
      }
      if (part === '_divideY') {
        result.push('d-divide-y');
        continue;
      }
      if (part === '_divideX') {
        result.push('d-divide-x');
        continue;
      }

      // Motion preference prefix
      const motionMatch = part.match(MOTION_RE);
      if (motionMatch) {
        const [, motionPrefix, innerAtom] = motionMatch;
        const resolved = resolveAtom(`_${innerAtom}`);
        if (resolved) {
          injectMediaQuery(part, resolved.decl, MOTION_QUERIES[motionPrefix]);
        }
        result.push(part);
        continue;
      }

      // Max-width responsive prefix: _mdmax:none  (check before BP_RE because
      // 'mdmax' would partially match 'md' under looser rules).
      const bpMaxMatch = part.match(BP_MAX_RE);
      if (bpMaxMatch) {
        const [, bp, innerAtom] = bpMaxMatch;

        const pseudoInner = innerAtom.match(/^(h|f|fv|a|fw):(.+)$/);
        if (pseudoInner) {
          const [, pseudoPrefix, atomName] = pseudoInner;
          const resolved = resolveAtom(`_${atomName}`);
          if (resolved) {
            injectResponsiveMaxPseudo(part, resolved.decl, bp, PSEUDO_NAMES[pseudoPrefix]);
          }
          result.push(part);
          continue;
        }

        const resolved = resolveAtom(`_${innerAtom}`);
        if (resolved) {
          injectResponsiveMax(part, resolved.decl, bp);
        }
        result.push(part);
        continue;
      }

      // Responsive prefix: _sm:gc3
      const bpMatch = part.match(BP_RE);
      if (bpMatch) {
        const [, bp, innerAtom] = bpMatch;

        // Check for responsive + pseudo: _sm:h:bgmuted
        const pseudoInner = innerAtom.match(/^(h|f|fv|a|fw):(.+)$/);
        if (pseudoInner) {
          const [, pseudoPrefix, atomName] = pseudoInner;
          const resolved = resolveAtom(`_${atomName}`);
          if (resolved) {
            injectResponsivePseudo(part, resolved.decl, bp, PSEUDO_NAMES[pseudoPrefix]);
          }
          result.push(part);
          continue;
        }

        const resolved = resolveAtom(`_${innerAtom}`);
        if (resolved) {
          injectResponsive(part, resolved.decl, bp);
        }
        result.push(part);
        continue;
      }

      // Container query prefix: _cq640:gc3
      const cqMatch = part.match(CQ_RE);
      if (cqMatch) {
        const width = Number(cqMatch[1]);
        const innerAtom = cqMatch[2];
        if (CQ_SET.has(width as (typeof CQ_WIDTHS)[number])) {
          const resolved = resolveAtom(`_${innerAtom}`);
          if (resolved) {
            injectContainer(part, resolved.decl, width);
          }
        }
        result.push(part);
        continue;
      }

      // Group/peer state prefix: _gh:fgprimary
      const gpMatch = part.match(GP_RE);
      if (gpMatch) {
        const [, prefix, atomName] = gpMatch;
        const resolved = resolveAtom(`_${atomName}`);
        if (resolved) {
          injectGroupPeer(part, resolved.decl, prefix);
        }
        result.push(part);
        continue;
      }

      // Pseudo-class prefix: _h:bgprimary
      const pseudoMatch = part.match(PSEUDO_RE);
      if (pseudoMatch) {
        const [, prefix, innerAtom] = pseudoMatch;
        const resolved = resolveAtom(`_${innerAtom}`);
        if (resolved) {
          injectPseudo(part, resolved.decl, prefix);
        }
        result.push(part);
        continue;
      }

      // Try to resolve atom
      const resolved = resolveAtom(part);
      if (resolved) {
        const needsEscape = /[/[\]#%(),+]/.test(resolved.className);
        inject(
          resolved.className,
          resolved.decl,
          needsEscape ? escapeClass(resolved.className) : undefined,
        );
        result.push(part);
      } else {
        // Pass through unknown classes
        result.push(part);
      }
    }
  }

  return result.join(' ');
}

/**
 * Define a custom atom.
 * @param name - Atom name (e.g., '_myatom')
 * @param declaration - CSS declaration(s)
 */
export function define(name: string, declaration: string): void {
  customAtoms.set(name, declaration);
}
