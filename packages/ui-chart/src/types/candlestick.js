/**
 * Candlestick / OHLC chart layout.
 * Supports: hollow variant, volume overlay.
 * @module types/candlestick
 */

import { scene, group, rect, line, text } from '../_scene.js';
import { MARGINS, innerDimensions, buildGridNodes, buildYAxisNodes, chartColor } from '../layouts/_layout-base.js';
import { resolve, scaleBand, scaleLinear, unique, extent } from '../_shared.js';

export function layoutCandlestick(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const openField = spec.open || 'open';
  const highField = spec.high || 'high';
  const lowField = spec.low || 'low';
  const closeField = spec.close || 'close';
  const volumeField = spec.volume;

  const margins = { ...MARGINS };
  if (volumeField) margins.bottom += 60; // extra space for volume
  const { innerW, innerH: rawInnerH } = innerDimensions(width, height, margins);
  const volumeH = volumeField ? 50 : 0;
  const innerH = rawInnerH - volumeH;

  const categories = data.map(d => d[xField]);
  const xScale = scaleBand(categories, [0, innerW], 0.1);
  const bandW = xScale.bandwidth();

  // Y scale from high/low range
  let yMin = Infinity, yMax = -Infinity;
  for (const d of data) {
    const lo = +d[lowField], hi = +d[highField];
    if (lo < yMin) yMin = lo;
    if (hi > yMax) yMax = hi;
  }
  const pad = (yMax - yMin) * 0.05;
  const yScale = scaleLinear([yMin - pad, yMax + pad], [innerH, 0]);

  const children = [];
  if (spec.grid !== false) children.push(...buildGridNodes(yScale, innerW));

  // X axis
  children.push(line({ x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' }));
  // Show every Nth label to avoid overlap
  const labelInterval = Math.max(1, Math.floor(categories.length / 8));
  for (let i = 0; i < categories.length; i++) {
    if (i % labelInterval !== 0) continue;
    const x = xScale(categories[i]) + bandW / 2;
    children.push(text({ x, y: innerH + 18, content: String(categories[i]), anchor: 'middle', class: 'd-chart-axis' }));
  }
  children.push(...buildYAxisNodes(yScale, innerH, spec));

  // Candles
  const upColor = 'var(--d-success)';
  const downColor = 'var(--d-error)';

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const open = +d[openField], close = +d[closeField];
    const high = +d[highField], low = +d[lowField];
    const isUp = close >= open;
    const color = isUp ? upColor : downColor;
    const cx = xScale(d[xField]) + bandW / 2;
    const bodyW = bandW * 0.6;

    // Wick (high to low)
    children.push(line({ x1: cx, y1: yScale(high), x2: cx, y2: yScale(low), stroke: color, strokeWidth: 1 }));

    // Body
    const bodyTop = yScale(Math.max(open, close));
    const bodyBottom = yScale(Math.min(open, close));
    const bodyH = Math.max(1, bodyBottom - bodyTop);

    if (spec.hollow && isUp) {
      children.push(rect({
        x: cx - bodyW / 2, y: bodyTop, w: bodyW, h: bodyH,
        fill: 'none', stroke: color, strokeWidth: 1.5,
        class: 'd-chart-bar',
        data: { label: String(d[xField]), value: `O:${open} H:${high} L:${low} C:${close}`, series: 'candle' },
        key: `candle-${i}`
      }));
    } else {
      children.push(rect({
        x: cx - bodyW / 2, y: bodyTop, w: bodyW, h: bodyH,
        fill: color, class: 'd-chart-bar',
        data: { label: String(d[xField]), value: `O:${open} H:${high} L:${low} C:${close}`, series: 'candle' },
        key: `candle-${i}`
      }));
    }
  }

  // Volume overlay
  if (volumeField) {
    const volMax = Math.max(...data.map(d => +d[volumeField] || 0), 1);
    const volScale = scaleLinear([0, volMax], [0, volumeH]);
    const volY0 = innerH + 30;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const vol = +d[volumeField] || 0;
      const isUp = +d[closeField] >= +d[openField];
      const h = volScale(vol);
      children.push(rect({
        x: xScale(d[xField]), y: volY0 + volumeH - h, w: bandW, h,
        fill: isUp ? upColor : downColor, opacity: 0.3,
        key: `vol-${i}`
      }));
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'candlestick', margins, innerW, innerH, dataLength: data.length });
}
