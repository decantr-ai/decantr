/**
 * Box Plot chart layout.
 * Supports: multi-series, horizontal, whisker types (min-max, 1.5IQR).
 * @module types/box-plot
 */

import { scene, group, rect, line, circle, text } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor, MARGINS, innerDimensions, buildGridNodes, buildYAxisNodes } from '../layouts/_layout-base.js';
import { resolve, unique, scaleBand, scaleLinear, extent } from '../_shared.js';

export function layoutBoxPlot(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const whiskerType = spec.whiskerType || '1.5IQR';
  const categories = unique(data, xField);

  const margins = { ...MARGINS };
  const { innerW, innerH } = innerDimensions(width, height, margins);

  const xScale = scaleBand(categories, [0, innerW], 0.3);
  const bandW = xScale.bandwidth();

  // Compute box stats per category
  const boxes = categories.map((cat, ci) => {
    const values = data.filter(d => d[xField] === cat).map(d => +d[yField]).sort((a, b) => a - b);
    return { category: cat, color: chartColor(ci), ...computeBoxStats(values, whiskerType) };
  });

  // Y scale from overall range
  let yMin = Infinity, yMax = -Infinity;
  for (const b of boxes) {
    if (b.whiskerLow < yMin) yMin = b.whiskerLow;
    if (b.whiskerHigh > yMax) yMax = b.whiskerHigh;
    for (const o of b.outliers) {
      if (o < yMin) yMin = o;
      if (o > yMax) yMax = o;
    }
  }
  const pad = (yMax - yMin) * 0.1 || 1;
  const yScale = scaleLinear([yMin - pad, yMax + pad], [innerH, 0]);

  const children = [];
  if (spec.grid !== false) children.push(...buildGridNodes(yScale, innerW));

  // X axis labels
  children.push(line({ x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' }));
  for (const cat of categories) {
    const x = xScale(cat) + bandW / 2;
    children.push(text({ x, y: innerH + 18, content: String(cat), anchor: 'middle', class: 'd-chart-axis' }));
  }
  children.push(...buildYAxisNodes(yScale, innerH, spec));

  // Draw boxes
  for (const b of boxes) {
    const cx = xScale(b.category) + bandW / 2;
    const boxW = bandW * 0.6;
    const x0 = cx - boxW / 2;

    // Whisker lines
    children.push(line({ x1: cx, y1: yScale(b.whiskerHigh), x2: cx, y2: yScale(b.q3), stroke: b.color, strokeWidth: 1.5, strokeDash: '3,2' }));
    children.push(line({ x1: cx, y1: yScale(b.q1), x2: cx, y2: yScale(b.whiskerLow), stroke: b.color, strokeWidth: 1.5, strokeDash: '3,2' }));

    // Whisker caps
    const capW = boxW * 0.4;
    children.push(line({ x1: cx - capW, y1: yScale(b.whiskerHigh), x2: cx + capW, y2: yScale(b.whiskerHigh), stroke: b.color, strokeWidth: 1.5 }));
    children.push(line({ x1: cx - capW, y1: yScale(b.whiskerLow), x2: cx + capW, y2: yScale(b.whiskerLow), stroke: b.color, strokeWidth: 1.5 }));

    // Box (Q1 to Q3)
    children.push(rect({
      x: x0, y: yScale(b.q3), w: boxW, h: yScale(b.q1) - yScale(b.q3),
      fill: b.color, opacity: 0.3, stroke: b.color, strokeWidth: 1.5,
      class: 'd-chart-bar',
      data: { label: b.category, value: `Q1:${b.q1.toFixed(1)} Med:${b.median.toFixed(1)} Q3:${b.q3.toFixed(1)}`, series: b.category },
      key: `box-${b.category}`
    }));

    // Median line
    children.push(line({ x1: x0, y1: yScale(b.median), x2: x0 + boxW, y2: yScale(b.median), stroke: b.color, strokeWidth: 2 }));

    // Outliers
    for (const o of b.outliers) {
      children.push(circle({ cx, cy: yScale(o), r: 3, fill: 'none', stroke: b.color, strokeWidth: 1.5, class: 'd-chart-point' }));
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'box-plot', boxes, margins, innerW, innerH, dataLength: data.length });
}

function computeBoxStats(sorted, whiskerType) {
  const n = sorted.length;
  if (n === 0) return { q1: 0, median: 0, q3: 0, whiskerLow: 0, whiskerHigh: 0, outliers: [] };

  const median = quantile(sorted, 0.5);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;

  let whiskerLow, whiskerHigh, outliers = [];

  if (whiskerType === 'min-max') {
    whiskerLow = sorted[0];
    whiskerHigh = sorted[n - 1];
  } else {
    // 1.5 IQR
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    whiskerLow = sorted.find(v => v >= lowerFence) ?? sorted[0];
    whiskerHigh = [...sorted].reverse().find(v => v <= upperFence) ?? sorted[n - 1];
    outliers = sorted.filter(v => v < lowerFence || v > upperFence);
  }

  return { q1, median, q3, whiskerLow, whiskerHigh, outliers };
}

function quantile(sorted, p) {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
