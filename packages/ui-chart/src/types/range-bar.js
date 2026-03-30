/**
 * Range Bar chart layout.
 * Supports: labels, multi-series, horizontal.
 * @module types/range-bar
 */

import { scene, group, rect, text, line } from '../_scene.js';
import { MARGINS, innerDimensions, buildGridNodes, buildYAxisNodes, chartColor } from '../layouts/_layout-base.js';
import { resolve, unique, scaleBand, scaleLinear, extent } from '../_shared.js';

export function layoutRangeBar(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const lowField = spec.low || (Array.isArray(spec.y) ? spec.y[0] : 'low');
  const highField = spec.high || (Array.isArray(spec.y) ? spec.y[1] : 'high');
  const categories = unique(data, xField);

  const margins = { ...MARGINS };
  const { innerW, innerH } = innerDimensions(width, height, margins);
  const xScale = scaleBand(categories, [0, innerW], 0.2);
  const bandW = xScale.bandwidth();

  let yMin = Infinity, yMax = -Infinity;
  for (const d of data) {
    const lo = +d[lowField], hi = +d[highField];
    if (lo < yMin) yMin = lo;
    if (hi > yMax) yMax = hi;
  }
  const pad = (yMax - yMin) * 0.1 || 1;
  const yScale = scaleLinear([yMin - pad, yMax + pad], [innerH, 0]);

  const children = [];
  if (spec.grid !== false) children.push(...buildGridNodes(yScale, innerW));

  children.push(line({ x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' }));
  for (const cat of categories) {
    children.push(text({ x: xScale(cat) + bandW / 2, y: innerH + 18, content: String(cat), anchor: 'middle', class: 'd-chart-axis' }));
  }
  children.push(...buildYAxisNodes(yScale, innerH, spec));

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const lo = +d[lowField], hi = +d[highField];
    const x = xScale(d[xField]);
    children.push(rect({
      x, y: yScale(hi), w: bandW, h: yScale(lo) - yScale(hi),
      fill: chartColor(i % 8), rx: 2, class: 'd-chart-bar',
      data: { label: d[xField], value: `${lo}-${hi}`, series: 'range' },
      key: `rbar-${i}`
    }));

    if (spec.labels) {
      children.push(text({ x: x + bandW / 2, y: yScale(hi) - 6, content: String(hi), anchor: 'middle', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)' }));
      children.push(text({ x: x + bandW / 2, y: yScale(lo) + 14, content: String(lo), anchor: 'middle', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)' }));
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'range-bar', margins, innerW, innerH, dataLength: data.length });
}
