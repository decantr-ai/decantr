/**
 * Sunburst chart layout.
 * Supports: nesting, color range, drill-down.
 * @module types/sunburst
 */

import { scene, arc, text } from '../_scene.js';
import { buildHierarchy, sunburstLayout } from '../layouts/hierarchy.js';
import { polar, polarPoint } from '../layouts/polar.js';
import { chartColor, MARGINS_NONE } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutSunburst(spec, width, height) {
  const data = resolve(spec.data);
  const idField = spec.id || 'id';
  const parentField = spec.parent || 'parent';
  const valueField = spec.value || (Array.isArray(spec.y) ? spec.y[0] : (spec.y !== 'y' ? spec.y : null)) || 'value';
  const labelField = spec.label || spec.x || idField;
  const maxDepth = spec.maxDepth || 4;

  const coords = polar(width, height, { innerRadiusRatio: 0.15, padding: 16 });
  const { cx, cy, radius, innerRadius } = coords;

  const root = buildHierarchy(data, idField, parentField, valueField);
  const segments = sunburstLayout(root, cx, cy, radius, innerRadius, maxDepth);

  const children = [];
  const series = [];

  for (const seg of segments) {
    const color = chartColor((seg.depth - 1) % 8);
    const opacity = 0.4 + 0.5 * (1 - (seg.depth - 1) / maxDepth);

    children.push(arc({
      cx: seg.cx, cy: seg.cy,
      innerR: seg.innerR, outerR: seg.outerR,
      startAngle: seg.startAngle, endAngle: seg.endAngle,
      fill: color, opacity, class: 'd-chart-slice',
      data: {
        label: seg.data?.[labelField] || seg.id,
        value: seg.value, series: 'sunburst',
        ariaLabel: `${seg.data?.[labelField] || seg.id}: ${seg.value}`
      },
      key: `sunburst-${seg.id}`
    }));

    // Label for large enough segments
    const angleSpan = seg.endAngle - seg.startAngle;
    if (angleSpan > 0.3 && seg.outerR - seg.innerR > 20) {
      const midAngle = (seg.startAngle + seg.endAngle) / 2;
      const midR = (seg.innerR + seg.outerR) / 2;
      const pt = polarPoint(cx, cy, midR, midAngle);
      children.push(text({
        x: pt.x, y: pt.y + 4,
        content: String(seg.data?.[labelField] || seg.id).slice(0, 10),
        anchor: 'middle', fill: 'var(--d-fg)',
        fontSize: 'var(--d-text-xs)'
      }));
    }

    series.push({ key: seg.id, color });
  }

  return scene(width, height, children, {
    type: 'sunburst', series, segments,
    margins: MARGINS_NONE, innerW: width, innerH: height,
    cx, cy, radius, innerRadius, dataLength: data.length
  });
}
