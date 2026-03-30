/**
 * Gauge chart layout.
 * Supports: radial, linear, horizontal, bullet, segments, target markers.
 * @module types/gauge
 */

import { scene, arc, line, text, rect, circle } from '../_scene.js';
import { polar, polarPoint } from '../layouts/polar.js';
import { MARGINS_NONE } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutGauge(spec, width, height) {
  const rawData = resolve(spec.data);
  const val = resolve(spec.value) ?? (typeof rawData === 'number' ? rawData : Array.isArray(rawData) ? (+rawData[0]?.[spec.y] || +rawData[0] || 0) : 0);
  const min = spec.min ?? 0;
  const max = spec.max ?? 100;
  const target = spec.target;
  const segments = spec.segments || [];
  const variant = spec.variant || 'radial';

  if (variant === 'bullet' || variant === 'linear' || variant === 'horizontal') {
    return layoutLinearGauge(spec, val, min, max, target, segments, width, height);
  }

  return layoutRadialGauge(spec, val, min, max, target, segments, width, height);
}

function layoutRadialGauge(spec, val, min, max, target, segments, width, height) {
  const startAngle = -Math.PI * 0.75;
  const endAngle = Math.PI * 0.75;
  const totalAngle = endAngle - startAngle;
  const coords = polar(width, height, { innerRadiusRatio: 0.7, padding: 24, startAngle, endAngle });
  const { cx, cy, radius, innerRadius } = coords;

  const children = [];
  const range = max - min || 1;
  const fraction = Math.max(0, Math.min(1, (val - min) / range));

  // Background track
  children.push(arc({
    cx, cy, innerR: innerRadius, outerR: radius,
    startAngle, endAngle,
    fill: 'var(--d-border)', opacity: 0.2
  }));

  // Segments
  if (segments.length) {
    for (const seg of segments) {
      const sa = startAngle + ((seg.from - min) / range) * totalAngle;
      const ea = startAngle + ((seg.to - min) / range) * totalAngle;
      children.push(arc({
        cx, cy, innerR: innerRadius, outerR: radius,
        startAngle: sa, endAngle: ea,
        fill: seg.color || 'var(--d-muted)', opacity: 0.3
      }));
    }
  }

  // Value arc
  const valAngle = startAngle + fraction * totalAngle;
  const valueColor = getValueColor(fraction);
  children.push(arc({
    cx, cy, innerR: innerRadius, outerR: radius,
    startAngle, endAngle: valAngle,
    fill: valueColor, class: 'd-chart-slice',
    data: { label: 'value', value: val, series: 'gauge' },
    key: 'gauge-value'
  }));

  // Needle
  const needlePt = polarPoint(cx, cy, innerRadius - 4, valAngle);
  children.push(line({ x1: cx, y1: cy, x2: needlePt.x, y2: needlePt.y, stroke: 'var(--d-fg)', strokeWidth: 2 }));
  children.push(circle({ cx, cy, r: 4, fill: 'var(--d-fg)' }));

  // Target marker
  if (target != null) {
    const tFrac = Math.max(0, Math.min(1, (target - min) / range));
    const tAngle = startAngle + tFrac * totalAngle;
    const tPt = polarPoint(cx, cy, radius + 6, tAngle);
    children.push(line({
      x1: polarPoint(cx, cy, innerRadius - 2, tAngle).x,
      y1: polarPoint(cx, cy, innerRadius - 2, tAngle).y,
      x2: tPt.x, y2: tPt.y,
      stroke: 'var(--d-warning)', strokeWidth: 2
    }));
  }

  // Value text
  children.push(text({
    x: cx, y: cy + radius * 0.35,
    content: String(val), anchor: 'middle',
    fontSize: 'var(--d-text-2xl)', fontWeight: 'var(--d-fw-heading)',
    fill: 'var(--d-fg)'
  }));

  // Min/Max labels
  const minPt = polarPoint(cx, cy, radius + 14, startAngle);
  const maxPt = polarPoint(cx, cy, radius + 14, endAngle);
  children.push(text({ x: minPt.x, y: minPt.y + 4, content: String(min), anchor: 'end', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)' }));
  children.push(text({ x: maxPt.x, y: maxPt.y + 4, content: String(max), anchor: 'start', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)' }));

  return scene(width, height, children, {
    type: 'gauge', margins: MARGINS_NONE,
    innerW: width, innerH: height,
    value: val, min, max, fraction, dataLength: 1
  });
}

function layoutLinearGauge(spec, val, min, max, target, segments, width, height) {
  const margins = { top: 20, right: 16, bottom: 20, left: 16 };
  const barH = Math.min(24, height / 3);
  const innerW = width - margins.left - margins.right;
  const cy = height / 2;
  const range = max - min || 1;
  const fraction = Math.max(0, Math.min(1, (val - min) / range));

  const children = [];

  // Background track
  children.push(rect({ x: 0, y: cy - barH / 2, w: innerW, h: barH, rx: barH / 2, fill: 'var(--d-border)', opacity: 0.2 }));

  // Segments
  if (segments.length) {
    for (const seg of segments) {
      const x0 = ((seg.from - min) / range) * innerW;
      const x1 = ((seg.to - min) / range) * innerW;
      children.push(rect({ x: x0, y: cy - barH / 2, w: x1 - x0, h: barH, fill: seg.color || 'var(--d-muted)', opacity: 0.3 }));
    }
  }

  // Value bar
  children.push(rect({
    x: 0, y: cy - barH / 2, w: fraction * innerW, h: barH,
    rx: barH / 2, fill: getValueColor(fraction),
    data: { label: 'value', value: val, series: 'gauge' },
    key: 'gauge-bar'
  }));

  // Target line
  if (target != null) {
    const tx = ((target - min) / range) * innerW;
    children.push(line({ x1: tx, y1: cy - barH, x2: tx, y2: cy + barH, stroke: 'var(--d-warning)', strokeWidth: 2 }));
  }

  // Min/Max labels
  children.push(text({ x: 0, y: cy + barH / 2 + 16, content: String(min), anchor: 'start', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)' }));
  children.push(text({ x: innerW, y: cy + barH / 2 + 16, content: String(max), anchor: 'end', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)' }));

  // Value text
  children.push(text({ x: fraction * innerW, y: cy - barH / 2 - 8, content: String(val), anchor: 'middle', fontSize: 'var(--d-text-base)', fontWeight: 'var(--d-fw-heading)', fill: 'var(--d-fg)' }));

  return scene(width, height, [
    group({ transform: `translate(${margins.left},0)` }, children)
  ], { type: 'gauge', margins, innerW, innerH: height, value: val, min, max, fraction, dataLength: 1 });
}

import { group } from '../_scene.js';

function getValueColor(fraction) {
  if (fraction < 0.33) return 'var(--d-error)';
  if (fraction < 0.66) return 'var(--d-warning)';
  return 'var(--d-success)';
}
