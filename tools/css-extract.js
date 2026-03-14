import { resolveAtomDecl } from '../src/css/atoms.js';

/** Responsive breakpoints (mobile-first, min-width) */
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 };
const BP_ORDER = ['sm', 'md', 'lg', 'xl'];
const CQ_WIDTHS = new Set([320, 480, 640, 768, 1024]);
const GP_STATE = {
  gh: ['group', 'hover'], gf: ['group', 'focus-within'], ga: ['group', 'active'],
  ph: ['peer', 'hover'], pf: ['peer', 'focus'], pa: ['peer', 'active'],
};

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
  outline: 'outline', trans: 'transition',
};

const BP_RE = /^_(sm|md|lg|xl):(.+)$/;
const CQ_RE = /^_cq(\d+):(.+)$/;
const GP_RE = /^_(gh|gf|ga|ph|pf|pa):(.+)$/;
const ALPHA_RE = /^(_[a-zA-Z0-9]+)\/(\d+)$/;
const ARB_RE = /^_([a-zA-Z]+)\[([^\]]+)\]$/;

function escapeClass(cls) {
  return cls.replace(/:/g, '\\:').replace(/\//g, '\\/').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#').replace(/%/g, '\\%').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/,/g, '\\,').replace(/\+/g, '\\+');
}

/**
 * Resolve a single atom part to a CSS declaration (mirrors runtime resolveAtom logic).
 * @param {string} part
 * @returns {{ className: string, decl: string }|null}
 */
function resolveAtomFull(part) {
  // Direct lookup via algorithmic resolver
  const decl = resolveAtomDecl(part);
  if (decl) return { className: part, decl };

  // Opacity modifier: _bgprimary/50
  const alphaMatch = part.match(ALPHA_RE);
  if (alphaMatch) {
    const [, base, alphaStr] = alphaMatch;
    const baseDecl = resolveAtomDecl(base);
    if (baseDecl) {
      const alpha = Number(alphaStr);
      if (alpha >= 0 && alpha <= 100) {
        const colorMatch = baseDecl.match(/^(background|color|border-color):(var\(--[^)]+\))$/);
        if (colorMatch) {
          return { className: part, decl: `${colorMatch[1]}:color-mix(in srgb,${colorMatch[2]} ${alpha}%,transparent)` };
        }
      }
    }
    return null;
  }

  // Arbitrary value: _w[512px]
  const arbMatch = part.match(ARB_RE);
  if (arbMatch) {
    const [, propPrefix, rawValue] = arbMatch;
    const cssProp = ARB_PROPS[propPrefix] || ARB_PROPS[propPrefix.toLowerCase()];
    if (cssProp) {
      return { className: part, decl: `${cssProp}:${rawValue.replace(/_/g, ' ')}` };
    }
    return null;
  }

  return null;
}

/**
 * @param {string} source
 * @returns {Set<string>}
 */
export function extractClassNames(source) {
  const classes = new Set();

  // Match css('...') calls
  const cssCallRegex = /css\(\s*(['"`])([\s\S]*?)\1/g;
  let match;
  while ((match = cssCallRegex.exec(source)) !== null) {
    const classStr = match[2];
    classStr.split(/\s+/).forEach(c => { if (c) classes.add(c); });
  }

  // Match class: '...' or class: "..." in h() props
  const classPropRegex = /class:\s*(['"])([\s\S]*?)\1/g;
  while ((match = classPropRegex.exec(source)) !== null) {
    const classStr = match[2];
    classStr.split(/\s+/).forEach(c => { if (c) classes.add(c); });
  }

  return classes;
}

/**
 * Generate complete static CSS for all referenced class names.
 * Handles: standard atoms, responsive prefixes, container queries,
 * group/peer states, opacity modifiers, and arbitrary values.
 * @param {Set<string>} classNames
 * @returns {string}
 */
export function generateCSS(classNames) {
  const atomRules = [];
  /** @type {Record<string, string[]>} */
  const bpRules = {};
  const cqRules = [];
  const gpRules = [];

  for (const name of classNames) {
    if (!name || name === '_group' || name === '_peer') continue;

    // Responsive prefix: _sm:gc3
    const bpMatch = name.match(BP_RE);
    if (bpMatch) {
      const [, bp, innerAtom] = bpMatch;
      const resolved = resolveAtomFull(`_${innerAtom}`);
      if (resolved && BREAKPOINTS[bp]) {
        const escaped = escapeClass(name);
        if (!bpRules[bp]) bpRules[bp] = [];
        bpRules[bp].push(`.${escaped}{${resolved.decl}}`);
      }
      continue;
    }

    // Container query prefix: _cq640:gc3
    const cqMatch = name.match(CQ_RE);
    if (cqMatch) {
      const width = Number(cqMatch[1]);
      const innerAtom = cqMatch[2];
      if (CQ_WIDTHS.has(width)) {
        const resolved = resolveAtomFull(`_${innerAtom}`);
        if (resolved) {
          const escaped = escapeClass(name);
          cqRules.push(`@container(min-width:${width}px){.${escaped}{${resolved.decl}}}`);
        }
      }
      continue;
    }

    // Group/peer prefix: _gh:fgprimary
    const gpMatch = name.match(GP_RE);
    if (gpMatch) {
      const [, prefix, atomName] = gpMatch;
      const resolved = resolveAtomFull(`_${atomName}`);
      if (resolved && GP_STATE[prefix]) {
        const escaped = escapeClass(name);
        const [kind, state] = GP_STATE[prefix];
        const combinator = kind === 'group' ? ' ' : ' ~ ';
        gpRules.push(`.d-${kind}:${state}${combinator}.${escaped}{${resolved.decl}}`);
      }
      continue;
    }

    // Standard atom (+ opacity + arbitrary)
    const resolved = resolveAtomFull(name);
    if (resolved) {
      const needsEscape = /[/\[\]#%(),+]/.test(resolved.className);
      const sel = needsEscape ? escapeClass(resolved.className) : resolved.className;
      atomRules.push(`.${sel}{${resolved.decl}}`);
    }
  }

  const parts = [];
  if (atomRules.length > 0 || gpRules.length > 0) {
    parts.push(`@layer d.atoms{${atomRules.join('')}${gpRules.join('')}}`);
  }
  for (const bp of BP_ORDER) {
    if (bpRules[bp] && bpRules[bp].length > 0) {
      parts.push(`@layer d.atoms{@media(min-width:${BREAKPOINTS[bp]}px){${bpRules[bp].join('')}}}`);
    }
  }
  if (cqRules.length > 0) {
    parts.push(`@layer d.atoms{${cqRules.join('')}}`);
  }

  return parts.join('');
}
