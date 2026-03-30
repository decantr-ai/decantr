/**
 * Pie / Donut chart layout — produces scene graph.
 * Supports: variable radius, multiple rings, nested donut.
 * @module types/pie
 */

import { scene, arc, text } from '../_scene.js';
import { polar, sliceAngles } from '../layouts/polar.js';
import { chartColor, MARGINS_NONE } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} scene graph
 */
export function layoutPie(spec, width, height) {
  const data = resolve(spec.data);
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const xField = spec.x;

  const innerRadiusRatio = spec.donut !== false ? 0.55 : 0;
  const coords = polar(width, height, { innerRadiusRatio, padding: 8 });
  const { cx, cy, radius, innerRadius, startAngle, totalAngle } = coords;

  const values = data.map(d => Math.abs(+d[yField] || 0));
  const angles = sliceAngles(values, startAngle, totalAngle);
  let total = 0;
  for (const v of values) total += v;

  const slices = data.map((d, i) => ({
    label: d[xField],
    value: values[i],
    percentage: angles[i].percentage,
    startAngle: angles[i].startAngle,
    endAngle: angles[i].endAngle,
    color: chartColor(i),
    raw: d
  }));

  // Build scene
  const children = [];
  for (const s of slices) {
    children.push(arc({
      cx, cy, outerR: radius, innerR: innerRadius,
      startAngle: s.startAngle, endAngle: s.endAngle,
      fill: s.color, class: 'd-chart-slice',
      data: {
        label: s.label, value: s.value,
        ariaLabel: `${s.label}: ${s.value} (${s.percentage.toFixed(1)}%)`,
        series: s.label
      },
      key: `slice-${s.label}`
    }));

    // Labels
    if (spec.labels) {
      const midAngle = (s.startAngle + s.endAngle) / 2;
      const labelR = (radius + innerRadius) / 2;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);
      children.push(text({
        x: lx, y: ly, content: `${s.percentage.toFixed(0)}%`,
        anchor: 'middle', baseline: 'middle',
        class: 'd-chart-axis', fontSize: 'var(--d-text-xs)',
        fill: 'var(--d-fg)'
      }));
    }
  }

  const series = slices.map(s => ({ key: s.label, color: s.color }));

  return scene(width, height, children, {
    type: 'pie', series, slices,
    cx, cy, radius, innerRadius,
    margins: MARGINS_NONE,
    innerW: width, innerH: height,
    dataLength: data.length
  });
}
