/**
 * Funnel / Pyramid chart layout.
 * @module types/funnel
 */

import { scene, polygon, text } from '../_scene.js';
import { chartColor, MARGINS } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutFunnel(spec, width, height) {
  const data = resolve(spec.data);
  const xField = spec.x;
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const isPyramid = spec.pyramid === true;

  const margins = { top: 16, right: 40, bottom: 16, left: 40 };
  const innerW = width - margins.left - margins.right;
  const innerH = height - margins.top - margins.bottom;

  const maxVal = Math.max(...data.map(d => Math.abs(+d[yField] || 0)), 1);
  const n = data.length;
  const segH = innerH / n;
  const gap = 4;

  const children = [];
  const series = [];

  for (let i = 0; i < n; i++) {
    const d = data[i];
    const val = Math.abs(+d[yField] || 0);
    const nextVal = i < n - 1 ? Math.abs(+data[i + 1][yField] || 0) : (isPyramid ? 0 : val * 0.5);

    const topW = (val / maxVal) * innerW;
    const bottomW = (nextVal / maxVal) * innerW;
    const cx = innerW / 2;
    const y0 = i * segH + gap / 2;
    const y1 = (i + 1) * segH - gap / 2;

    const points = [
      { x: cx - topW / 2, y: y0 },
      { x: cx + topW / 2, y: y0 },
      { x: cx + bottomW / 2, y: y1 },
      { x: cx - bottomW / 2, y: y1 }
    ];

    const color = chartColor(i);
    children.push(polygon({
      points, fill: color, class: 'd-chart-slice',
      data: { label: d[xField], value: val, series: d[xField],
        ariaLabel: `${d[xField]}: ${val}` },
      key: `funnel-${i}`
    }));

    // Label
    const ly = (y0 + y1) / 2 + 4;
    children.push(text({
      x: cx, y: ly, content: `${d[xField]} (${val})`,
      anchor: 'middle', fill: 'var(--d-fg)',
      fontSize: 'var(--d-text-sm)', fontWeight: 'var(--d-fw-title)'
    }));

    series.push({ key: d[xField], color });
  }

  return scene(width, height, [
    { type: 'group', transform: `translate(${margins.left},${margins.top})`, children }
  ], { type: 'funnel', series, margins, innerW, innerH, dataLength: data.length });
}
