/**
 * Treemap chart layout.
 * Supports: squarify/binary/slice, nesting, color range, drill-down.
 * @module types/treemap
 */

import { scene, group, rect, text } from '../_scene.js';
import { buildHierarchy, treemapLayout } from '../layouts/hierarchy.js';
import { chartColor, MARGINS } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutTreemap(spec, width, height) {
  const data = resolve(spec.data);
  const idField = spec.id || 'id';
  const parentField = spec.parent || 'parent';
  const valueField = spec.value || (Array.isArray(spec.y) ? spec.y[0] : (spec.y !== 'y' ? spec.y : null)) || 'value';
  const labelField = spec.label || spec.x || idField;
  const tile = spec.tile || 'squarify';

  const margins = { top: 8, right: 8, bottom: 8, left: 8 };
  const innerW = width - margins.left - margins.right;
  const innerH = height - margins.top - margins.bottom;

  const root = buildHierarchy(data, idField, parentField, valueField);
  const rects = treemapLayout(root, 0, 0, innerW, innerH, tile);

  const children = [];
  const maxDepth = Math.max(...rects.map(r => r.depth), 1);

  for (const r of rects) {
    if (r.w < 2 || r.h < 2) continue;

    const color = chartColor(r.depth % 8);
    const opacity = r.depth === 0 ? 0 : 0.3 + 0.4 * (1 - r.depth / maxDepth);

    children.push(rect({
      x: r.x, y: r.y, w: r.w, h: r.h,
      rx: 2, fill: color, opacity,
      stroke: 'var(--d-bg)', strokeWidth: 2,
      class: 'd-chart-bar',
      data: {
        label: r.data?.[labelField] || r.id,
        value: r.value, series: 'treemap'
      },
      key: `treemap-${r.id}`
    }));

    // Label (only if cell is large enough)
    if (r.w > 40 && r.h > 20 && r.children && r.data) {
      children.push(text({
        x: r.x + 4, y: r.y + 14,
        content: r.data[labelField] || r.id,
        anchor: 'start', fill: 'var(--d-fg)',
        fontSize: 'var(--d-text-xs)'
      }));
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'treemap', rects, margins, innerW, innerH, dataLength: data.length });
}
