/**
 * Chord diagram layout.
 * Supports: relationship matrix, ribbon connections.
 * @module types/chord
 */

import { scene, arc, path, text } from '../_scene.js';
import { chordLayout } from '../layouts/hierarchy.js';
import { polar, polarPoint } from '../layouts/polar.js';
import { chartColor, MARGINS_NONE } from '../layouts/_layout-base.js';
import { arcToPath } from '../_scene.js';
import { resolve } from '../_shared.js';

export function layoutChord(spec, width, height) {
  const rawData = resolve(spec.data);
  const matrix = resolve(spec.matrix) || (rawData && rawData.matrix) || (Array.isArray(rawData) ? rawData : []);
  const labels = resolve(spec.labels) || (rawData && rawData.labels) || [];

  const coords = polar(width, height, { padding: 40 });
  const { cx, cy, radius } = coords;
  const outerR = radius;
  const innerR = radius * 0.9;
  const ribbonR = innerR * 0.95;

  const layout = chordLayout(matrix, labels, cx, cy, outerR, innerR);
  const children = [];
  const series = [];

  // Arcs
  for (const a of layout.arcs) {
    const color = chartColor(a.index % 8);
    children.push(arc({
      cx, cy, innerR, outerR,
      startAngle: a.startAngle, endAngle: a.endAngle,
      fill: color, class: 'd-chart-slice',
      data: { label: a.label, value: a.value, series: a.label,
        ariaLabel: `${a.label}: ${a.value}` },
      key: `chord-arc-${a.index}`
    }));

    // Label
    const midAngle = (a.startAngle + a.endAngle) / 2;
    const pt = polarPoint(cx, cy, outerR + 14, midAngle);
    children.push(text({
      x: pt.x, y: pt.y + 4,
      content: a.label, anchor: pt.x > cx ? 'start' : 'end',
      class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
    }));

    series.push({ key: a.label, color });
  }

  // Ribbons
  for (let i = 0; i < layout.ribbons.length; i++) {
    const r = layout.ribbons[i];
    const color = chartColor(r.source.index % 8);

    // Build ribbon path using cubic Bezier
    const s1 = polarPoint(cx, cy, ribbonR, r.source.startAngle);
    const s2 = polarPoint(cx, cy, ribbonR, r.source.endAngle);
    const t1 = polarPoint(cx, cy, ribbonR, r.target.startAngle);
    const t2 = polarPoint(cx, cy, ribbonR, r.target.endAngle);

    const d = `M${s1.x},${s1.y}` +
      `A${ribbonR},${ribbonR},0,${r.source.endAngle - r.source.startAngle > Math.PI ? 1 : 0},1,${s2.x},${s2.y}` +
      `Q${cx},${cy},${t1.x},${t1.y}` +
      `A${ribbonR},${ribbonR},0,${r.target.endAngle - r.target.startAngle > Math.PI ? 1 : 0},1,${t2.x},${t2.y}` +
      `Q${cx},${cy},${s1.x},${s1.y}Z`;

    children.push(path({
      d, fill: color, opacity: 0.3, class: 'd-chart-area',
      data: {
        label: `${labels[r.source.index] || r.source.index} → ${labels[r.target.index] || r.target.index}`,
        value: r.value, series: 'chord-ribbon'
      },
      key: `chord-ribbon-${i}`
    }));
  }

  return scene(width, height, children, {
    type: 'chord', series, layout,
    margins: MARGINS_NONE, innerW: width, innerH: height,
    cx, cy, radius, dataLength: matrix.length
  });
}
