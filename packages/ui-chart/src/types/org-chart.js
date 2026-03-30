/**
 * Org chart layout — Walker tree layout.
 * Supports: expand/collapse, orientations (top-down, left-right).
 * @module types/org-chart
 */

import { scene, group, rect, text, path } from '../_scene.js';
import { buildHierarchy, walkerLayout } from '../layouts/hierarchy.js';
import { chartColor, MARGINS } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutOrgChart(spec, width, height) {
  const data = resolve(spec.data);
  const idField = spec.id || 'id';
  const parentField = spec.parent || 'parent';
  const labelField = spec.label || spec.x || 'label';
  const valueField = spec.y || 'value';
  const orientation = spec.orientation || 'top-down';

  const margins = { top: 16, right: 16, bottom: 16, left: 16 };
  const innerW = width - margins.left - margins.right;
  const innerH = height - margins.top - margins.bottom;

  const root = buildHierarchy(data, idField, parentField, valueField);
  const layout = walkerLayout(root, innerW, innerH, orientation, {
    nodeWidth: spec.nodeWidth || 120,
    nodeHeight: spec.nodeHeight || 50,
    siblingGap: 16,
    levelGap: 60
  });

  const children = [];

  // Edges
  for (const edge of layout.edges) {
    const midY = (edge.y0 + edge.y1) / 2;
    let d;
    if (orientation === 'left-right') {
      const midX = (edge.x0 + edge.x1) / 2;
      d = `M${edge.x0},${edge.y0}C${midX},${edge.y0},${midX},${edge.y1},${edge.x1},${edge.y1}`;
    } else {
      d = `M${edge.x0},${edge.y0}C${edge.x0},${midY},${edge.x1},${midY},${edge.x1},${edge.y1}`;
    }
    children.push(path({
      d, stroke: 'var(--d-border)', strokeWidth: 1.5,
      class: 'd-chart-line', key: `org-edge-${edge.source}-${edge.target}`
    }));
  }

  // Nodes
  for (const n of layout.nodes) {
    const color = chartColor(n.depth % 8);
    const nodeData = n.data;

    children.push(rect({
      x: n.x, y: n.y, w: n.w, h: n.h,
      rx: 6, fill: color, opacity: 0.15,
      stroke: color, strokeWidth: 1.5,
      class: 'd-chart-bar',
      data: {
        label: nodeData?.[labelField] || n.id,
        value: n.value, series: 'org-chart'
      },
      key: `org-node-${n.id}`
    }));

    // Node label
    const label = String(nodeData?.[labelField] || n.id).slice(0, 18);
    children.push(text({
      x: n.x + n.w / 2, y: n.y + n.h / 2 + 4,
      content: label, anchor: 'middle', fill: 'var(--d-fg)',
      fontSize: 'var(--d-text-xs)', fontWeight: 'var(--d-fw-title)'
    }));

    // Expand/collapse indicator
    if (n.children && n.children.length > 0) {
      children.push(text({
        x: n.x + n.w - 12, y: n.y + 14,
        content: `(${n.children.length})`, anchor: 'middle',
        fill: 'var(--d-muted)', fontSize: '8px'
      }));
    }
  }

  const series = layout.nodes.map(n => ({
    key: n.data?.[labelField] || n.id,
    color: chartColor(n.depth % 8)
  }));

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'org-chart', series, layout, margins, innerW, innerH, dataLength: data.length });
}
