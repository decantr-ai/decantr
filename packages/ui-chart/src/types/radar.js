/**
 * Radar chart layout.
 * Supports: line, area, reversed, markers, labels.
 * @module types/radar
 */

import { scene, group, path, circle, text, line, polygon } from '../_scene.js';
import { polar, polarPoint } from '../layouts/polar.js';
import { chartColor, MARGINS_NONE } from '../layouts/_layout-base.js';
import { resolve, groupBy, extent } from '../_shared.js';

export function layoutRadar(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const yFields = Array.isArray(spec.y) ? spec.y : [spec.y];
  const categories = data.map(d => d[xField]);
  const n = categories.length;

  const coords = polar(width, height, { padding: 40 });
  const { cx, cy, radius } = coords;

  // Find value range
  let maxVal = -Infinity;
  for (const d of data) {
    for (const f of yFields) {
      const v = +d[f] || 0;
      if (v > maxVal) maxVal = v;
    }
  }
  if (maxVal <= 0) maxVal = 1;
  const levels = 5;

  const children = [];

  // Grid rings
  for (let l = 1; l <= levels; l++) {
    const r = (l / levels) * radius;
    const ringPts = [];
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
      ringPts.push(polarPoint(cx, cy, r, angle));
    }
    children.push(polygon({
      points: ringPts, fill: 'none',
      stroke: 'var(--d-border)', strokeWidth: 0.5, opacity: 0.5
    }));
  }

  // Axis spokes + labels
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const outer = polarPoint(cx, cy, radius, angle);
    children.push(line({ x1: cx, y1: cy, x2: outer.x, y2: outer.y, stroke: 'var(--d-border)', strokeWidth: 0.5 }));

    const labelPt = polarPoint(cx, cy, radius + 16, angle);
    children.push(text({
      x: labelPt.x, y: labelPt.y + 4,
      content: String(categories[i]),
      anchor: Math.abs(angle + Math.PI / 2) < 0.1 ? 'middle' : (labelPt.x > cx ? 'start' : 'end'),
      class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
    }));
  }

  // Data series
  const series = yFields.map((f, fi) => {
    const color = chartColor(fi);
    const pts = data.map((d, i) => {
      const val = +d[f] || 0;
      const r = (val / maxVal) * radius;
      const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
      return polarPoint(cx, cy, r, angle);
    });

    // Filled area
    children.push(polygon({
      points: pts, fill: color, opacity: 0.15, stroke: color, strokeWidth: 2
    }));

    // Data points
    for (let i = 0; i < pts.length; i++) {
      children.push(circle({
        cx: pts[i].x, cy: pts[i].y, r: 3,
        fill: color, class: 'd-chart-point',
        data: { series: f, value: data[i][f], label: categories[i] },
        key: `radar-${f}-${i}`
      }));
    }

    return { key: f, color, points: pts };
  });

  return scene(width, height, children, {
    type: 'radar', series, margins: MARGINS_NONE,
    innerW: width, innerH: height, dataLength: data.length
  });
}
