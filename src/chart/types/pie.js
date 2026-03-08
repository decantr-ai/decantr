/**
 * Pie / Donut chart layout.
 * Computes arc angles from spec data.
 */

import { MARGINS_NONE, chartColor } from './_type-base.js';
import { resolve } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} layout
 */
export function layoutPie(spec, width, height) {
  const data = resolve(spec.data);
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const xField = spec.x;

  // Compute total
  let total = 0;
  for (let i = 0; i < data.length; i++) total += Math.abs(+data[i][yField] || 0);
  if (total === 0) total = 1;

  // Compute slices
  let angle = -Math.PI / 2; // Start at top
  const slices = data.map((d, i) => {
    const value = Math.abs(+d[yField] || 0);
    const startAngle = angle;
    const sweep = (value / total) * Math.PI * 2;
    angle += sweep;
    return {
      label: d[xField],
      value,
      percentage: (value / total) * 100,
      startAngle,
      endAngle: startAngle + sweep,
      color: chartColor(i),
      raw: d
    };
  });

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 8;
  const innerRadius = spec.donut !== false ? radius * 0.55 : 0;

  return {
    type: 'pie',
    width, height,
    margins: MARGINS_NONE,
    innerW: width, innerH: height,
    cx, cy, radius, innerRadius,
    slices,
    dataLength: data.length
  };
}
