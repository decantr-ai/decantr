/**
 * Heatmap chart layout.
 * Supports: labels, calendar layout, continuous color scale.
 * @module types/heatmap
 */

import { scene, group, rect, text, line } from '../_scene.js';
import { MARGINS, innerDimensions } from '../layouts/_layout-base.js';
import { resolve, unique } from '../_shared.js';

export function layoutHeatmap(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const yField = spec.row || spec.series || (Array.isArray(spec.y) ? spec.y[0] : spec.y);
  const valueField = spec.value || (Array.isArray(spec.y) ? spec.y[1] : 'value');

  const xCats = unique(data, xField);
  const yCats = unique(data, yField);

  const margins = { ...MARGINS, left: 72 };
  const { innerW, innerH } = innerDimensions(width, height, margins);

  const cellW = innerW / (xCats.length || 1);
  const cellH = innerH / (yCats.length || 1);

  // Value range for color mapping
  let vMin = Infinity, vMax = -Infinity;
  for (const d of data) {
    const v = +d[valueField];
    if (v < vMin) vMin = v;
    if (v > vMax) vMax = v;
  }

  const colorStops = spec.colorScale || ['#f0f9ff', '#0369a1'];
  function cellColor(v) {
    const t = vMax > vMin ? (v - vMin) / (vMax - vMin) : 0.5;
    return lerpHex(colorStops[0], colorStops[colorStops.length - 1], t);
  }

  // Build lookup
  const lookup = new Map();
  for (const d of data) lookup.set(`${d[xField]}|${d[yField]}`, d);

  const children = [];

  // X labels
  for (let i = 0; i < xCats.length; i++) {
    children.push(text({
      x: i * cellW + cellW / 2, y: -8,
      content: String(xCats[i]), anchor: 'middle', class: 'd-chart-axis'
    }));
  }

  // Y labels
  for (let j = 0; j < yCats.length; j++) {
    children.push(text({
      x: -8, y: j * cellH + cellH / 2 + 4,
      content: String(yCats[j]), anchor: 'end', class: 'd-chart-axis'
    }));
  }

  // Cells
  for (let j = 0; j < yCats.length; j++) {
    for (let i = 0; i < xCats.length; i++) {
      const d = lookup.get(`${xCats[i]}|${yCats[j]}`);
      const val = d ? +d[valueField] : 0;
      const x = i * cellW;
      const y = j * cellH;

      children.push(rect({
        x: x + 1, y: y + 1, w: cellW - 2, h: cellH - 2,
        rx: 2, fill: cellColor(val),
        class: 'd-chart-bar',
        data: { label: `${xCats[i]}, ${yCats[j]}`, value: val, series: 'heatmap' },
        key: `heat-${i}-${j}`
      }));

      if (spec.labels && cellW > 30 && cellH > 20) {
        children.push(text({
          x: x + cellW / 2, y: y + cellH / 2 + 4,
          content: String(val), anchor: 'middle', fill: val > (vMin + vMax) / 2 ? '#fff' : '#000',
          fontSize: 'var(--d-text-xs)'
        }));
      }
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'heatmap', margins, innerW, innerH, dataLength: data.length });
}

function lerpHex(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}
