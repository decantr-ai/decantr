/**
 * Sparkline layout — produces scene graph.
 * Supports: line (default), bar, area variants.
 * @module types/sparkline
 */

import { scene, path, rect } from '../_scene.js';
import { pointsToPathD, areaPathD } from '../_scene.js';
import { scaleLinear } from '../_shared.js';

/**
 * @param {Object} spec — resolved sparkline spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} scene graph
 */
export function layoutSparkline(spec, width, height) {
  const data = Array.isArray(spec.data) ? spec.data : [];

  const isFlat = data.length > 0 && typeof data[0] === 'number';
  const points = isFlat
    ? data.map((v, i) => ({ x: i, y: v }))
    : data.map(d => ({ x: +d[spec.x], y: +d[spec.y] }));

  if (points.length === 0) {
    return scene(width, height, [], { type: 'sparkline', dataLength: 0 });
  }

  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (const p of points) {
    if (p.x < xMin) xMin = p.x;
    if (p.x > xMax) xMax = p.x;
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }

  const pad = 2;
  const xScale = scaleLinear([xMin, xMax], [pad, width - pad]);
  const yScale = scaleLinear([yMin, yMax], [height - pad, pad]);
  const scaled = points.map(p => ({ x: xScale(p.x), y: yScale(p.y) }));

  const variant = spec.variant || 'line';
  const children = [];

  if (variant === 'bar') {
    // Bar sparkline
    const barWidth = Math.max(1, (width - pad * 2) / points.length * 0.8);
    const baseline = yScale(Math.max(0, yMin));
    for (let i = 0; i < scaled.length; i++) {
      children.push(rect({
        x: scaled[i].x - barWidth / 2, y: Math.min(scaled[i].y, baseline),
        w: barWidth, h: Math.abs(scaled[i].y - baseline),
        fill: 'var(--d-chart-0,var(--d-primary))',
        key: `spark-bar-${i}`
      }));
    }
  } else if (variant === 'area') {
    // Area sparkline
    const baseline = height - pad;
    const areaPoints = scaled.map(p => ({ x: p.x, y0: p.y, y1: baseline }));
    children.push(path({
      d: areaPathD(areaPoints),
      fill: 'var(--d-chart-0,var(--d-primary))',
      opacity: 0.15, class: 'd-chart-area'
    }));
    children.push(path({
      d: pointsToPathD(scaled),
      stroke: 'var(--d-chart-0,var(--d-primary))',
      strokeWidth: 1.5, class: 'd-chart-line'
    }));
  } else {
    // Line sparkline (default)
    children.push(path({
      d: pointsToPathD(scaled),
      stroke: 'var(--d-chart-0,var(--d-primary))',
      strokeWidth: 1.5, class: 'd-chart-line'
    }));
  }

  return scene(width, height, children, { type: 'sparkline', dataLength: points.length });
}
