/**
 * Waterfall chart layout.
 * Supports: horizontal, connectors, subtotals.
 * @module types/waterfall
 */

import { scene, group, rect, line, text } from '../_scene.js';
import { MARGINS, innerDimensions, buildGridNodes, buildYAxisNodes } from '../layouts/_layout-base.js';
import { resolve, unique, scaleBand, scaleLinear } from '../_shared.js';

export function layoutWaterfall(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const categories = data.map(d => d[xField]);

  const margins = { ...MARGINS };
  const { innerW, innerH } = innerDimensions(width, height, margins);
  const xScale = scaleBand(categories, [0, innerW], 0.2);
  const bandW = xScale.bandwidth();

  // Compute running totals
  const items = [];
  let running = 0;
  for (const d of data) {
    const val = +d[yField] || 0;
    const isTotal = d.total === true || d.subtotal === true;

    if (isTotal) {
      items.push({ label: d[xField], start: 0, end: running, value: running, isTotal: true, raw: d });
    } else {
      const start = running;
      running += val;
      items.push({ label: d[xField], start, end: running, value: val, isTotal: false, raw: d });
    }
  }

  // Y scale
  let yMin = 0, yMax = 0;
  for (const it of items) {
    yMin = Math.min(yMin, it.start, it.end);
    yMax = Math.max(yMax, it.start, it.end);
  }
  const pad = (yMax - yMin) * 0.1 || 10;
  const yScale = scaleLinear([yMin - pad, yMax + pad], [innerH, 0]);

  const children = [];
  if (spec.grid !== false) children.push(...buildGridNodes(yScale, innerW));

  // X axis
  children.push(line({ x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' }));
  for (const cat of categories) {
    const x = xScale(cat) + bandW / 2;
    children.push(text({ x, y: innerH + 18, content: String(cat), anchor: 'middle', class: 'd-chart-axis' }));
  }
  children.push(...buildYAxisNodes(yScale, innerH, spec));

  // Bars + connectors
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const x = xScale(it.label);
    const top = yScale(Math.max(it.start, it.end));
    const bottom = yScale(Math.min(it.start, it.end));
    const h = Math.max(1, bottom - top);

    let color;
    if (it.isTotal) color = 'var(--d-primary)';
    else if (it.value >= 0) color = 'var(--d-success)';
    else color = 'var(--d-error)';

    children.push(rect({
      x, y: top, w: bandW, h, rx: Math.min(4, bandW / 4), fill: color, class: 'd-chart-bar',
      data: { label: it.label, value: it.value, series: 'waterfall' },
      key: `wf-${i}`
    }));

    // Connector line to next bar
    if (i < items.length - 1 && !items[i + 1].isTotal) {
      const nextX = xScale(items[i + 1].label);
      children.push(line({
        x1: x + bandW, y1: yScale(it.end),
        x2: nextX, y2: yScale(it.end),
        stroke: 'var(--d-muted)', strokeDash: '3,2', strokeWidth: 1
      }));
    }

    // Value label
    if (spec.labels) {
      children.push(text({
        x: x + bandW / 2, y: top - 6,
        content: it.value >= 0 ? `+${it.value}` : String(it.value),
        anchor: 'middle', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
      }));
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'waterfall', items, margins, innerW, innerH, dataLength: data.length });
}
