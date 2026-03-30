/**
 * Backward-compatible re-exports from layouts/_layout-base.js.
 * All layout utilities have moved to the layouts/ directory.
 * This file preserves import paths used by tests and external code.
 * @module types/_type-base
 */

export {
  MARGINS,
  MARGINS_NONE,
  innerDimensions,
  buildXScale,
  buildYScale,
  computeTicks,
  chartColor,
  PALETTE_SIZE
} from '../layouts/_layout-base.js';

// Re-export computeGridLines for tests
export function computeGridLines(yScale, count = 5) {
  const ticks = yScale.ticks(count);
  return ticks.map(t => ({
    position: yScale(t),
    label: String(t)
  }));
}
