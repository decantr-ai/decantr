/**
 * Histogram chart layout.
 * Supports: auto/specified bins, missing bins.
 * @module types/histogram
 */

import { scene, group, rect, text } from '../_scene.js';
import { chartColor, MARGINS, innerDimensions, buildGridNodes, buildYAxisNodes } from '../layouts/_layout-base.js';
import { resolve, scaleLinear, scaleBand, extent } from '../_shared.js';
import { line } from '../_scene.js';

export function layoutHistogram(spec, width, height) {
  const data = resolve(spec.data);
  const field = spec.x || (Array.isArray(spec.y) ? spec.y[0] : (spec.y !== 'y' ? spec.y : null)) || 'value';
  const values = data.map(d => +d[field]).filter(v => !isNaN(v));

  const margins = { ...MARGINS };
  const { innerW, innerH } = innerDimensions(width, height, margins);

  // Compute bins
  const binCount = spec.bins || Math.max(5, Math.ceil(Math.sqrt(values.length)));
  const [minVal, maxVal] = extent(data, field);
  const binWidth = spec.binWidth || (maxVal - minVal) / binCount || 1;
  const bins = [];

  for (let i = 0; i < binCount; i++) {
    const lo = minVal + i * binWidth;
    const hi = lo + binWidth;
    const count = values.filter(v => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
    bins.push({ lo, hi, count, label: `${lo.toFixed(1)}-${hi.toFixed(1)}` });
  }

  const xScale = scaleLinear([minVal, minVal + binCount * binWidth], [0, innerW]);
  const maxCount = Math.max(...bins.map(b => b.count), 1);
  const yScale = scaleLinear([0, maxCount * 1.1], [innerH, 0]);

  const children = [];

  // Grid
  if (spec.grid !== false) children.push(...buildGridNodes(yScale, innerW));

  // X axis
  children.push(line({ x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' }));
  for (const bin of bins) {
    const x = xScale((bin.lo + bin.hi) / 2);
    children.push(text({ x, y: innerH + 18, content: bin.lo.toFixed(0), anchor: 'middle', class: 'd-chart-axis' }));
  }

  // Y axis
  children.push(...buildYAxisNodes(yScale, innerH, spec));

  // Bars
  const gap = 1;
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];
    const x = xScale(bin.lo) + gap;
    const w = xScale(bin.hi) - xScale(bin.lo) - gap * 2;
    const y = yScale(bin.count);
    const h = innerH - y;
    children.push(rect({
      x, y, w: Math.max(0, w), h: Math.max(0, h),
      fill: chartColor(0), class: 'd-chart-bar',
      data: { label: bin.label, value: bin.count, series: field },
      key: `hist-${i}`
    }));
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'histogram', bins, margins, innerW, innerH, dataLength: data.length });
}
