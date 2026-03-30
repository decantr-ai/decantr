/**
 * Shared polar coordinate layout.
 * Used by pie, radar, radial, gauge, funnel.
 * Handles: center point, available radius, angular scale, radial scale.
 * @module layouts/polar
 */

import { scaleLinear } from '../_shared.js';
import { MARGINS_PIE, innerDimensions } from './_layout-base.js';

/**
 * Build polar coordinate system.
 * @param {number} width
 * @param {number} height
 * @param {Object} [opts]
 * @param {number} [opts.startAngle=-PI/2] — start angle (radians, -PI/2 = 12 o'clock)
 * @param {number} [opts.endAngle=3PI/2] — end angle (full circle by default)
 * @param {number} [opts.innerRadiusRatio=0] — 0=full, 0.55=donut
 * @param {number} [opts.padding=8] — px padding from edges
 * @param {Object} [opts.margins] — override margins
 * @returns {{ cx, cy, radius, innerRadius, startAngle, endAngle, angularScale, radialScale, innerW, innerH, margins }}
 */
export function polar(width, height, opts = {}) {
  const margins = opts.margins || MARGINS_PIE;
  const { innerW, innerH } = innerDimensions(width, height, margins);
  const padding = opts.padding != null ? opts.padding : 8;

  const cx = margins.left + innerW / 2;
  const cy = margins.top + innerH / 2;
  const radius = Math.max(0, Math.min(innerW, innerH) / 2 - padding);
  const innerRadiusRatio = opts.innerRadiusRatio || 0;
  const innerRadius = radius * innerRadiusRatio;

  const startAngle = opts.startAngle != null ? opts.startAngle : -Math.PI / 2;
  const endAngle = opts.endAngle != null ? opts.endAngle : Math.PI * 3 / 2;
  const totalAngle = endAngle - startAngle;

  /**
   * Angular scale — maps [0, total] to [startAngle, endAngle].
   * @param {number} v — value from 0 to total
   * @param {number} total — sum of all values
   * @returns {number} angle in radians
   */
  function angularScale(v, total) {
    return startAngle + (v / (total || 1)) * totalAngle;
  }

  /**
   * Radial scale — maps [domain min, domain max] to [innerRadius, radius].
   * @param {number[]} domain
   * @returns {Function}
   */
  function radialScale(domain) {
    return scaleLinear(domain, [innerRadius, radius]);
  }

  return {
    cx, cy, radius, innerRadius,
    startAngle, endAngle, totalAngle,
    angularScale, radialScale,
    innerW, innerH, margins,
    width, height
  };
}

/**
 * Compute point on polar coordinates.
 * @param {number} cx — center x
 * @param {number} cy — center y
 * @param {number} r — radius
 * @param {number} angle — angle in radians
 * @returns {{ x: number, y: number }}
 */
export function polarPoint(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  };
}

/**
 * Build slice angles from data values.
 * @param {number[]} values
 * @param {number} startAngle
 * @param {number} totalAngle
 * @returns {{ startAngle: number, endAngle: number, percentage: number }[]}
 */
export function sliceAngles(values, startAngle, totalAngle) {
  let total = 0;
  for (let i = 0; i < values.length; i++) total += Math.abs(values[i]) || 0;
  if (total === 0) total = 1;

  let angle = startAngle;
  return values.map(v => {
    const val = Math.abs(v) || 0;
    const sweep = (val / total) * totalAngle;
    const sa = angle;
    angle += sweep;
    return { startAngle: sa, endAngle: sa + sweep, percentage: (val / total) * 100 };
  });
}
