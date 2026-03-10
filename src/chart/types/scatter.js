/**
 * Scatter chart layout — produces scene graph.
 * Supports: multi-series, custom markers, labels, multi-axis.
 * @module types/scatter
 */

import { scene, group, circle, text } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor } from '../layouts/_layout-base.js';
import { resolve, groupBy } from '../_shared.js';

export function layoutScatter(spec, width, height) {
  const data = resolve(spec.data);
  const coords = cartesian(spec, width, height);
  const { innerW, innerH, margins, xScale, yScale, xType, axisNodes, gridNodes } = coords;
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const markerSize = spec.markerSize || 4;

  let series;
  if (spec.series) {
    const groups = groupBy(data, spec.series);
    series = [...groups.entries()].map(([key, rows], i) => ({
      key, color: chartColor(i),
      points: rows.map(d => mapPoint(d, spec, xScale, yScale, xType, yField))
    }));
  } else {
    series = [{
      key: yField, color: chartColor(0),
      points: data.map(d => mapPoint(d, spec, xScale, yScale, xType, yField))
    }];
  }

  const children = [];
  if (spec.grid !== false) children.push(...gridNodes);
  children.push(...axisNodes);

  for (const s of series) {
    for (let i = 0; i < s.points.length; i++) {
      const p = s.points[i];
      children.push(circle({
        cx: p.x, cy: p.y, r: markerSize,
        fill: s.color, class: 'd-chart-point',
        data: { series: s.key, value: p.raw[yField], label: String(p.raw[spec.x]) },
        key: `scatter-${s.key}-${i}`
      }));

      if (spec.labels) {
        children.push(text({
          x: p.x, y: p.y - markerSize - 4,
          content: String(p.raw[yField]), anchor: 'middle',
          class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
        }));
      }
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'scatter', series, margins, innerW, innerH, dataLength: data.length });
}

function mapPoint(d, spec, xScale, yScale, xType, yField) {
  const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
  const x = xScale(xVal) + (xType === 'band' ? xScale.bandwidth() / 2 : 0);
  return { x, y: yScale(+d[yField]), raw: d };
}
