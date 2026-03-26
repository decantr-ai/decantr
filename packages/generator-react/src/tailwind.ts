/**
 * Map IR spatial values to Tailwind CSS classes.
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
    // Weighted: total span count as grid columns
    return `grid grid-cols-${cols} ${gapClass(gap)}`;
  }

  if (breakpoint) {
    // Responsive: collapse to 1 col below breakpoint
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

/**
 * Map common Decantr atoms to Tailwind equivalents.
 */
export const ATOM_TO_TAILWIND: Record<string, string> = {
  '_flex': 'flex',
  '_col': 'flex-col',
  '_row': 'flex-row',
  '_aic': 'items-center',
  '_jcc': 'justify-center',
  '_jcsb': 'justify-between',
  '_tc': 'text-center',
  '_wfull': 'w-full',
  '_hfull': 'h-full',
  '_relative': 'relative',
  '_absolute': 'absolute',
  '_overflow[hidden]': 'overflow-hidden',
  '_overflow[auto]': 'overflow-auto',
  '_flex1': 'flex-1',
  '_nounder': 'no-underline',
  '_r2': 'rounded',
  '_r4': 'rounded-lg',
  '_borderB': 'border-b',
  '_p4': 'p-4',
  '_p6': 'p-6',
  '_px3': 'px-3',
  '_px4': 'px-4',
  '_px6': 'px-6',
  '_px8': 'px-8',
  '_py3': 'py-3',
  '_py4': 'py-4',
  '_pt3': 'pt-3',
  '_mb4': 'mb-4',
  '_gap1': 'gap-1',
  '_gap2': 'gap-2',
  '_gap3': 'gap-3',
  '_gap4': 'gap-4',
  '_gap5': 'gap-5',
  '_gap6': 'gap-6',
  '_gap8': 'gap-8',
  // Semantic colors → Tailwind + shadcn CSS variables
  '_bgbg': 'bg-background',
  '_bgmuted': 'bg-muted',
  '_bgprimary': 'bg-primary',
  '_fgfg': 'text-foreground',
  '_fgmuted': 'text-muted-foreground',
  '_fgprimary': 'text-primary',
  // Typography
  '_heading1': 'text-4xl font-bold tracking-tight',
  '_heading2': 'text-3xl font-semibold tracking-tight',
  '_heading3': 'text-2xl font-semibold',
  '_heading4': 'text-xl font-semibold',
  '_heading5': 'text-lg font-semibold',
  '_body': 'text-base',
  '_bodysm': 'text-sm',
  // Flexbox
  '_flexCol': 'flex-col',
  '_itemsCenter': 'items-center',
  '_textCenter': 'text-center',
};

/** Translate a Decantr atom string to Tailwind classes */
export function atomsToTailwind(atomString: string): string {
  return atomString
    .split(/\s+/)
    .map(atom => ATOM_TO_TAILWIND[atom] || translateArbitraryAtom(atom))
    .filter(Boolean)
    .join(' ');
}

function translateArbitraryAtom(atom: string): string {
  // Skip recipe-specific decorators
  if (atom.startsWith('d-')) return '';

  // Handle _gap{n}
  const gapMatch = atom.match(/^_gap(\d+)$/);
  if (gapMatch) return `gap-${gapMatch[1]}`;

  // Handle _p{n}
  const pMatch = atom.match(/^_p(\d+)$/);
  if (pMatch) return `p-${pMatch[1]}`;

  // Handle _m{n}
  const mMatch = atom.match(/^_m(\d+)$/);
  if (mMatch) return `m-${mMatch[1]}`;

  // Handle _py{n}
  const pyMatch = atom.match(/^_py(\d+)$/);
  if (pyMatch) return `py-${pyMatch[1]}`;

  // Handle _px{n}
  const pxMatch = atom.match(/^_px(\d+)$/);
  if (pxMatch) return `px-${pxMatch[1]}`;

  // Handle _w[value], _h[value], _mw[value]
  const arbitraryMatch = atom.match(/^_(\w+)\[([^\]]+)\]$/);
  if (arbitraryMatch) {
    const prefix = arbitraryMatch[1];
    const value = arbitraryMatch[2];
    const prefixMap: Record<string, string> = {
      w: 'w', h: 'h', mw: 'max-w', mh: 'max-h',
      minw: 'min-w', minh: 'min-h',
    };
    const twPrefix = prefixMap[prefix];
    if (twPrefix) return `${twPrefix}-[${value}]`;
  }

  // Handle responsive prefixes like _lg:gc2
  if (atom.includes(':')) return '';

  // Unrecognized atom, skip
  return '';
}
