/**
 * Radial bar / Nightingale chart layout.
 * Supports: column, bar, stacked, reversed.
 * @module types/radial
 */

import { scene, arc, text } from '../_scene.js';
import { polar, polarPoint } from '../layouts/polar.js';
import { chartColor, MARGINS_NONE } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutRadial(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const n = data.length;

  const coords = polar(width, height, { innerRadiusRatio: 0.3, padding: 24 });
  const { cx, cy, radius, innerRadius, startAngle, totalAngle } = coords;

  let maxVal = -Infinity;
  for (const d of data) {
    const v = +d[yField] || 0;
    if (v > maxVal) maxVal = v;
  }
  if (maxVal <= 0) maxVal = 1;

  const sliceAngle = totalAngle / n;
  const gap = 0.02;
  const children = [];
  const series = [];

  for (let i = 0; i < n; i++) {
    const d = data[i];
    const val = +d[yField] || 0;
    const sa = startAngle + i * sliceAngle + gap;
    const ea = startAngle + (i + 1) * sliceAngle - gap;
    const outerR = innerRadius + (val / maxVal) * (radius - innerRadius);
    const color = chartColor(i);

    children.push(arc({
      cx, cy, innerR: innerRadius, outerR,
      startAngle: sa, endAngle: ea,
      fill: color, class: 'd-chart-slice',
      data: { label: d[xField], value: val, series: d[xField],
        ariaLabel: `${d[xField]}: ${val}` },
      key: `radial-${i}`
    }));

    // Label
    const midAngle = (sa + ea) / 2;
    const labelPt = polarPoint(cx, cy, radius + 14, midAngle);
    children.push(text({
      x: labelPt.x, y: labelPt.y + 4,
      content: String(d[xField]),
      anchor: labelPt.x > cx ? 'start' : 'end',
      class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
    }));

    series.push({ key: d[xField], color });
  }

  return scene(width, height, children, {
    type: 'radial', series, margins: MARGINS_NONE,
    innerW: width, innerH: height, cx, cy, radius, innerRadius,
    dataLength: data.length
  });
}
