/** Convert IR gap number to atom string */
export function gapAtom(gap: string): string {
  return `_gap${gap}`;
}

/** Build grid atom string from IRGridNode properties */
export function gridAtoms(
  cols: number,
  spans: Record<string, number> | null,
  breakpoint: string | null,
  gap: string,
): string {
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

/** Build surface atom string for a page container */
export function surfaceAtoms(surface: string | undefined, gap: string): string {
  return surface || `_flex _col _gap${gap} _p4 _overflow[auto] _flex1`;
}

/** Build span atom for a weighted grid child */
export function spanAtom(weight: number): string {
  return `_span${weight}`;
}
