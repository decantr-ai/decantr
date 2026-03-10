/**
 * Sankey diagram layout.
 * Supports: flow diagram, iterative node positioning, cubic Bezier links.
 * @module types/sankey
 */

import { scene, group, rect, path, text } from '../_scene.js';
import { sankeyLayout } from '../layouts/hierarchy.js';
import { chartColor, MARGINS } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutSankey(spec, width, height) {
  const rawData = resolve(spec.data);
  const nodes = resolve(spec.nodes) || (rawData && rawData.nodes) || (Array.isArray(rawData) ? rawData : []);
  const links = resolve(spec.links) || (rawData && rawData.links) || [];

  const margins = { top: 16, right: 16, bottom: 16, left: 16 };
  const innerW = width - margins.left - margins.right;
  const innerH = height - margins.top - margins.bottom;

  const layout = sankeyLayout(nodes, links, innerW, innerH, {
    nodeWidth: spec.nodeWidth || 20,
    nodePadding: spec.nodePadding || 12,
    iterations: 32
  });

  const children = [];
  const series = [];

  // Links (curved Bezier paths)
  for (let i = 0; i < layout.links.length; i++) {
    const l = layout.links[i];
    const curvature = 0.5;
    const xi = l.x0 + (l.x1 - l.x0) * curvature;
    const d = `M${l.x0},${l.y0}C${xi},${l.y0},${xi},${l.y1},${l.x1},${l.y1}`;

    children.push(path({
      d, stroke: chartColor(i % 8), strokeWidth: Math.max(1, l.width),
      opacity: 0.4, strokeLinecap: 'butt',
      class: 'd-chart-line',
      data: { label: `${l.source.id} → ${l.target.id}`, value: l.value, series: 'sankey-link' },
      key: `sankey-link-${i}`
    }));
  }

  // Nodes
  for (let i = 0; i < layout.nodes.length; i++) {
    const n = layout.nodes[i];
    const color = chartColor(i % 8);

    children.push(rect({
      x: n.x, y: n.y, w: n.w, h: Math.max(1, n.h),
      fill: color, class: 'd-chart-bar',
      data: { label: n.label, value: n.value, series: 'sankey-node' },
      key: `sankey-node-${n.id}`
    }));

    // Label
    const labelX = n.x < innerW / 2 ? n.x + n.w + 6 : n.x - 6;
    const anchor = n.x < innerW / 2 ? 'start' : 'end';
    children.push(text({
      x: labelX, y: n.y + n.h / 2 + 4,
      content: n.label, anchor,
      class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
    }));

    series.push({ key: n.label, color });
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'sankey', series, layout, margins, innerW, innerH, dataLength: nodes.length });
}
