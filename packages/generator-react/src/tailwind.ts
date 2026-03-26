/**
 * Map Decantr atoms to Tailwind CSS classes.
 *
 * AUTO: Hybrid approach — static map for known atoms, regex patterns for
 * parameterized values (spacing, grid, responsive prefixes, arbitrary values).
 */

/** Convert gap number to Tailwind gap class */
export function gapClass(gap: string): string {
  return `gap-${gap}`;
}

/** Convert IR grid to Tailwind grid classes */
export function gridClasses(
  cols: number,
  spans: Record<string, number> | null,
  breakpoint: string | null,
  gap: string,
): string {
  if (spans) {
    return `grid grid-cols-${cols} ${gapClass(gap)}`;
  }

  if (breakpoint) {
    return `grid grid-cols-1 ${breakpoint}:grid-cols-${cols} ${gapClass(gap)}`;
  }

  return `grid grid-cols-${cols} ${gapClass(gap)}`;
}

/** Convert span weight to Tailwind col-span class */
export function spanClass(weight: number): string {
  return `col-span-${weight}`;
}

/** Convert IR surface intent to Tailwind container classes */
export function surfaceClasses(surface: string | undefined, gap: string): string {
  if (surface) {
    return atomsToTailwind(surface);
  }
  return `flex flex-col ${gapClass(gap)} p-4 overflow-auto flex-1`;
}

// AUTO: Static map covers all fixed-name atoms. Parameterized atoms (spacing,
// grid cols/spans, sizing, typography sizes, etc.) are handled by pattern
// matching in translateAtomByPattern().

export const ATOM_TO_TAILWIND: Record<string, string> = {
  // ── Layout ──
  '_flex': 'flex',
  '_grid': 'grid',
  '_row': 'flex-row',
  '_col': 'flex-col',
  '_wrap': 'flex-wrap',
  '_nowrap': 'flex-nowrap',
  '_inline': 'inline',
  '_block': 'block',
  '_hidden': 'hidden',
  '_relative': 'relative',
  '_absolute': 'absolute',
  '_fixed': 'fixed',
  '_sticky': 'sticky',
  '_inset0': 'inset-0',

  // ── Flex alignment (bracket syntax) ──
  '_items[center]': 'items-center',
  '_items[start]': 'items-start',
  '_items[end]': 'items-end',
  '_items[stretch]': 'items-stretch',
  '_items[baseline]': 'items-baseline',
  '_justify[center]': 'justify-center',
  '_justify[between]': 'justify-between',
  '_justify[start]': 'justify-start',
  '_justify[end]': 'justify-end',
  '_justify[around]': 'justify-around',
  '_justify[evenly]': 'justify-evenly',
  '_self[center]': 'self-center',
  '_self[start]': 'self-start',
  '_self[end]': 'self-end',
  '_self[stretch]': 'self-stretch',

  // ── Flex sizing ──
  '_flex1': 'flex-1',
  '_flexnone': 'flex-none',
  '_flexauto': 'flex-auto',

  // ── Legacy shorthand aliases (kept for backward compat) ──
  '_aic': 'items-center',
  '_jcc': 'justify-center',
  '_jcsb': 'justify-between',
  '_tc': 'text-center',
  '_wfull': 'w-full',
  '_hfull': 'h-full',
  '_flexCol': 'flex-col',
  '_itemsCenter': 'items-center',
  '_textCenter': 'text-center',
  '_nounder': 'no-underline',
  '_r2': 'rounded',
  '_r4': 'rounded-lg',
  '_borderB': 'border-b',

  // ── Sizing (named values) ──
  '_w[100%]': 'w-full',
  '_w[auto]': 'w-auto',
  '_w[50%]': 'w-1/2',
  '_h[100%]': 'h-full',
  '_h[auto]': 'h-auto',
  '_h[100vh]': 'h-screen',
  '_minH[0]': 'min-h-0',
  '_minH[100vh]': 'min-h-screen',
  '_maxW[sm]': 'max-w-sm',
  '_maxW[md]': 'max-w-md',
  '_maxW[lg]': 'max-w-lg',
  '_maxW[xl]': 'max-w-xl',
  '_maxW[2xl]': 'max-w-2xl',
  '_maxW[3xl]': 'max-w-3xl',
  '_maxW[4xl]': 'max-w-4xl',
  '_maxW[5xl]': 'max-w-5xl',
  '_maxW[6xl]': 'max-w-6xl',
  '_maxW[7xl]': 'max-w-7xl',

  // ── Typography (alignment) ──
  '_text[center]': 'text-center',
  '_text[left]': 'text-left',
  '_text[right]': 'text-right',

  // ── Typography (sizes) ──
  '_text[xs]': 'text-xs',
  '_text[sm]': 'text-sm',
  '_text[base]': 'text-base',
  '_text[lg]': 'text-lg',
  '_text[xl]': 'text-xl',
  '_text[2xl]': 'text-2xl',
  '_text[3xl]': 'text-3xl',
  '_text[4xl]': 'text-4xl',
  '_text[5xl]': 'text-5xl',
  '_text[6xl]': 'text-6xl',
  '_text[7xl]': 'text-7xl',
  '_text[8xl]': 'text-8xl',
  '_text[9xl]': 'text-9xl',

  // ── Typography (weight) ──
  '_font[bold]': 'font-bold',
  '_font[semibold]': 'font-semibold',
  '_font[medium]': 'font-medium',
  '_font[normal]': 'font-normal',
  '_font[light]': 'font-light',

  // ── Typography (leading / tracking) ──
  '_leading[tight]': 'leading-tight',
  '_leading[normal]': 'leading-normal',
  '_leading[relaxed]': 'leading-relaxed',
  '_tracking[tight]': 'tracking-tight',
  '_tracking[wide]': 'tracking-wide',

  // ── Typography (transforms) ──
  '_truncate': 'truncate',
  '_uppercase': 'uppercase',
  '_lowercase': 'lowercase',
  '_capitalize': 'capitalize',

  // ── Typography (composite presets) ──
  '_heading1': 'text-4xl font-bold tracking-tight',
  '_heading2': 'text-3xl font-semibold tracking-tight',
  '_heading3': 'text-2xl font-semibold',
  '_heading4': 'text-xl font-semibold',
  '_heading5': 'text-lg font-semibold',
  '_body': 'text-base',
  '_bodysm': 'text-sm',

  // ── Semantic colors (fg) ──
  '_fgprimary': 'text-primary',
  '_fgsecondary': 'text-secondary',
  '_fgmuted': 'text-muted-foreground',
  '_fgaccent': 'text-accent-foreground',
  '_fgdestructive': 'text-destructive',
  '_fgfg': 'text-foreground',

  // ── Semantic colors (bg) ──
  '_bgprimary': 'bg-primary',
  '_bgsecondary': 'bg-secondary',
  '_bgmuted': 'bg-muted',
  '_bgaccent': 'bg-accent',
  '_bgcard': 'bg-card',
  '_bgbackground': 'bg-background',
  '_bgbg': 'bg-background',

  // ── Semantic colors (border) ──
  '_bcborder': 'border-border',
  '_bcprimary': 'border-primary',

  // ── Borders ──
  '_border': 'border',
  '_bbsolid': 'border-b',
  '_btsolid': 'border-t',
  '_rounded': 'rounded-md',
  '_rounded[sm]': 'rounded-sm',
  '_rounded[lg]': 'rounded-lg',
  '_rounded[full]': 'rounded-full',
  '_rounded[none]': 'rounded-none',

  // ── Effects ──
  '_shadow': 'shadow',
  '_shadow[sm]': 'shadow-sm',
  '_shadow[lg]': 'shadow-lg',
  '_shadow[none]': 'shadow-none',
  '_overflow[auto]': 'overflow-auto',
  '_overflow[hidden]': 'overflow-hidden',
  '_overflow[scroll]': 'overflow-scroll',

  // ── Spacing (mx-auto) ──
  '_mxauto': 'mx-auto',
};

/** Translate a Decantr atom string to Tailwind classes */
export function atomsToTailwind(atomString: string): string {
  return atomString
    .split(/\s+/)
    .map(atom => resolveAtom(atom))
    .filter(Boolean)
    .join(' ');
}

/** Resolve a single atom to Tailwind class(es) */
function resolveAtom(atom: string): string {
  // Skip recipe-specific decorators
  if (atom.startsWith('d-')) return '';

  // AUTO: Check responsive prefix first (_sm:, _md:, _lg:, _xl:, _2xl:)
  const responsiveMatch = atom.match(/^_(sm|md|lg|xl|2xl):(.+)$/);
  if (responsiveMatch) {
    const prefix = responsiveMatch[1];
    const innerAtom = `_${responsiveMatch[2]}`;
    const resolved = resolveAtom(innerAtom);
    if (resolved) {
      // Apply the responsive prefix to each generated class
      return resolved.split(' ').map(c => `${prefix}:${c}`).join(' ');
    }
    return '';
  }

  // Check static map
  if (ATOM_TO_TAILWIND[atom]) return ATOM_TO_TAILWIND[atom];

  // Opacity modifier on semantic colors: _bgprimary/50 → bg-primary/50
  const opacityMatch = atom.match(/^(_(?:bg|fg|bc)\w+)\/(\d+)$/);
  if (opacityMatch) {
    const base = ATOM_TO_TAILWIND[opacityMatch[1]];
    if (base) return `${base}/${opacityMatch[2]}`;
  }

  // Try pattern-based translation
  return translateAtomByPattern(atom);
}

// AUTO: Pattern rules for parameterized atoms. Order matters — more specific
// patterns before more general ones.

const PATTERN_RULES: Array<{ re: RegExp; fn: (m: RegExpMatchArray) => string }> = [
  // Grid columns: _gc1.._gc12
  { re: /^_gc(\d+)$/, fn: m => `grid-cols-${m[1]}` },
  // Column spans: _span1.._span12
  { re: /^_span(\d+)$/, fn: m => `col-span-${m[1]}` },
  // Grid rows: _gr1.._gr6
  { re: /^_gr(\d+)$/, fn: m => `grid-rows-${m[1]}` },
  // Row spans: _rspan1.._rspan6
  { re: /^_rspan(\d+)$/, fn: m => `row-span-${m[1]}` },

  // Gap (directional): _gapx{n}, _gapy{n}
  { re: /^_gapx(\d+)$/, fn: m => `gap-x-${m[1]}` },
  { re: /^_gapy(\d+)$/, fn: m => `gap-y-${m[1]}` },
  // Gap: _gap{n}
  { re: /^_gap(\d+)$/, fn: m => `gap-${m[1]}` },

  // Padding: _px{n}, _py{n}, _pt{n}, _pb{n}, _pl{n}, _pr{n}, _p{n}
  { re: /^_px(\d+)$/, fn: m => `px-${m[1]}` },
  { re: /^_py(\d+)$/, fn: m => `py-${m[1]}` },
  { re: /^_pt(\d+)$/, fn: m => `pt-${m[1]}` },
  { re: /^_pb(\d+)$/, fn: m => `pb-${m[1]}` },
  { re: /^_pl(\d+)$/, fn: m => `pl-${m[1]}` },
  { re: /^_pr(\d+)$/, fn: m => `pr-${m[1]}` },
  { re: /^_p(\d+)$/, fn: m => `p-${m[1]}` },

  // Margin: _mx{n}, _my{n}, _mt{n}, _mb{n}, _ml{n}, _mr{n}, _m{n}
  { re: /^_mx(\d+)$/, fn: m => `mx-${m[1]}` },
  { re: /^_my(\d+)$/, fn: m => `my-${m[1]}` },
  { re: /^_mt(\d+)$/, fn: m => `mt-${m[1]}` },
  { re: /^_mb(\d+)$/, fn: m => `mb-${m[1]}` },
  { re: /^_ml(\d+)$/, fn: m => `ml-${m[1]}` },
  { re: /^_mr(\d+)$/, fn: m => `mr-${m[1]}` },
  { re: /^_m(\d+)$/, fn: m => `m-${m[1]}` },

  // Opacity standalone: _opacity[{n}]
  { re: /^_opacity\[(\d+)\]$/, fn: m => `opacity-${m[1]}` },

  // Arbitrary transition: _trans[value]
  { re: /^_trans\[([^\]]+)\]$/, fn: m => `transition-[${m[1]}]` },

  // Arbitrary values for sizing/spacing: _w[...], _h[...], _maxW[...], etc.
  // AUTO: Only fires when the bracket value wasn't caught by the static map
  {
    re: /^_(\w+)\[([^\]]+)\]$/,
    fn: m => {
      const prefixMap: Record<string, string> = {
        w: 'w', h: 'h', mw: 'max-w', mh: 'max-h',
        maxW: 'max-w', maxH: 'max-h',
        minW: 'min-w', minH: 'min-h',
        minw: 'min-w', minh: 'min-h',
        p: 'p', m: 'm', bg: 'bg',
        text: 'text', font: 'font',
        leading: 'leading', tracking: 'tracking',
        rounded: 'rounded', shadow: 'shadow',
        overflow: 'overflow',
        items: 'items', justify: 'justify', self: 'self',
      };
      const twPrefix = prefixMap[m[1]];
      if (twPrefix) return `${twPrefix}-[${m[2]}]`;
      // Unknown prefix — pass through as arbitrary
      return `${m[1]}-[${m[2]}]`;
    },
  },
];

function translateAtomByPattern(atom: string): string {
  for (const rule of PATTERN_RULES) {
    const match = atom.match(rule.re);
    if (match) return rule.fn(match);
  }
  // Unrecognized atom — skip
  return '';
}
