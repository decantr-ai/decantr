/**
 * Sparkline layout.
 * Minimal line rendering — no axes, no legend, no title.
 */

import { scaleLinear } from '../_shared.js';

/**
 * @param {Object} spec — resolved sparkline spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} layout
 */
export function layoutSparkline(spec, width, height) {
  const data = Array.isArray(spec.data) ? spec.data : [];

  // If data is array of numbers, convert to indexed objects
  const isFlat = data.length > 0 && typeof data[0] === 'number';
  const points = isFlat
    ? data.map((v, i) => ({ x: i, y: v }))
    : data.map(d => ({ x: +d[spec.x], y: +d[spec.y] }));

  if (points.length === 0) {
    return { type: 'sparkline', width, height, points: [], dataLength: 0 };
  }

  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (const p of points) {
    if (p.x < xMin) xMin = p.x;
    if (p.x > xMax) xMax = p.x;
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }

  const pad = 2; // px padding
  const xScale = scaleLinear([xMin, xMax], [pad, width - pad]);
  const yScale = scaleLinear([yMin, yMax], [height - pad, pad]);

  const scaled = points.map(p => ({ x: xScale(p.x), y: yScale(p.y) }));

  return {
    type: 'sparkline',
    width, height,
    points: scaled,
    dataLength: points.length
  };
}
