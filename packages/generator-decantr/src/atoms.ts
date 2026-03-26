import type { IRBreakpointEntry } from '@decantr/generator-core';

// AUTO: Valid breakpoint prefixes for Decantr responsive atoms
const BREAKPOINT_PREFIXES = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

/** Convert IR gap number to atom string */
export function gapAtom(gap: string): string {
  return `_gap${gap}`;
}

// AUTO: Density-to-gap mapping for clarity-driven gap scaling
const DENSITY_GAP_MAP: Record<string, string> = {
  compact: '2',
  comfortable: '4',
  spacious: '6',
};

/** Resolve gap value from density level with optional content_gap_shift from recipe */
export function densityGap(
  densityLevel: string,
  contentGapShift?: number,
): string {
  const base = parseInt(DENSITY_GAP_MAP[densityLevel] || '4', 10);
  const shifted = Math.max(1, Math.min(8, base + (contentGapShift || 0)));
  return String(shifted);
}

/** Build grid atom string from IRGridNode properties */
export function gridAtoms(
  cols: number,
  spans: Record<string, number> | null,
  breakpoint: string | null,
  gap: string,
): string {
  if (spans && breakpoint) {
    // AUTO: Weighted grid with responsive breakpoint — single col on mobile, weighted at breakpoint
    return `_grid _gc1 _${breakpoint}:gc${cols} ${gapAtom(gap)}`;
  }

  if (spans) {
    // Weighted grid: total cols = sum of spans
    return `_grid _gc${cols} ${gapAtom(gap)}`;
  }

  if (breakpoint) {
    // Responsive equal grid: collapse to 1 col below breakpoint
    return `_grid _gc1 _${breakpoint}:gc${cols} ${gapAtom(gap)}`;
  }

  // Equal grid without responsive collapse
  return `_grid _gc${cols} ${gapAtom(gap)}`;
}

/** Build multi-breakpoint cascading grid atoms.
 *  Emits _gc1 (mobile default) then ascending breakpoint:gcN atoms.
 *  Example: _grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4 */
export function multiBreakpointGridAtoms(
  breakpoints: IRBreakpointEntry[],
  gap: string,
): string {
  // AUTO: Sort breakpoints by cascade order so atoms emit in ascending size
  const order = BREAKPOINT_PREFIXES as readonly string[];
  const sorted = [...breakpoints].sort(
    (a, b) => order.indexOf(a.at) - order.indexOf(b.at),
  );
  const bpAtoms = sorted.map(bp => `_${bp.at}:gc${bp.cols}`).join(' ');
  return `_grid _gc1 ${bpAtoms} ${gapAtom(gap)}`;
}

/** Build container query grid atoms.
 *  Wrapper gets _container, children use @-prefixed breakpoints.
 *  Example: _grid _container _@sm:gc2 _@lg:gc3 _gap4 */
export function containerGridAtoms(
  breakpoints: IRBreakpointEntry[],
  gap: string,
): string {
  const order = BREAKPOINT_PREFIXES as readonly string[];
  const sorted = [...breakpoints].sort(
    (a, b) => order.indexOf(a.at) - order.indexOf(b.at),
  );
  const bpAtoms = sorted.map(bp => `_@${bp.at}:gc${bp.cols}`).join(' ');
  return `_grid _container ${bpAtoms} ${gapAtom(gap)}`;
}

/** Build surface atom string for a page container */
export function surfaceAtoms(surface: string | undefined, gap: string): string {
  return surface || `_flex _col _gap${gap} _p4 _overflow[auto] _flex1`;
}

/** Build span atom for a weighted grid child */
export function spanAtom(weight: number): string {
  return `_span${weight}`;
}

/** Build breakpoint-prefixed span atom for responsive weighted grids */
export function responsiveSpanAtom(weight: number, breakpoint: string): string {
  return `_${breakpoint}:span${weight}`;
}

/** Build container-query-prefixed span atom */
export function containerSpanAtom(weight: number, breakpoint: string): string {
  return `_@${breakpoint}:span${weight}`;
}
