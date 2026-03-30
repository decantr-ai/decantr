/**
 * Bubble chart layout — scatter with size encoding.
 * @module types/bubble
 */

import { scene, group, circle, text } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor } from '../layouts/_layout-base.js';
import { resolve, groupBy, extent } from '../_shared.js';

export function layoutBubble(spec, width, height) {
  const data = resolve(spec.data);
  const coords = cartesian(spec, width, height);
  const { innerW, innerH, margins, xScale, yScale, xType, axisNodes, gridNodes } = coords;
  const yField = Array.isArray(spec.y) ? spec.y[0] : spec.y;
  const sizeField = spec.size || spec.z || yField;
  const [sizeMin, sizeMax] = extent(data, sizeField);
  const minR = 4, maxR = Math.min(innerW, innerH) / 12;

  function bubbleR(v) {
    const t = sizeMax > sizeMin ? (v - sizeMin) / (sizeMax - sizeMin) : 0.5;
    return minR + Math.sqrt(t) * (maxR - minR);
  }

  let series;
  if (spec.series) {
    const groups = groupBy(data, spec.series);
    series = [...groups.entries()].map(([key, rows], i) => ({
      key, color: chartColor(i),
      points: rows.map(d => ({ ...mapPt(d, spec, xScale, yScale, xType, yField), r: bubbleR(+d[sizeField]) }))
    }));
  } else {
    series = [{ key: yField, color: chartColor(0),
      points: data.map(d => ({ ...mapPt(d, spec, xScale, yScale, xType, yField), r: bubbleR(+d[sizeField]) }))
    }];
  }

  const children = [];
  if (spec.grid !== false) children.push(...gridNodes);
  children.push(...axisNodes);

  for (const s of series) {
    for (let i = 0; i < s.points.length; i++) {
      const p = s.points[i];
      children.push(circle({
        cx: p.x, cy: p.y, r: p.r,
        fill: s.color, opacity: 0.7, class: 'd-chart-point',
        data: { series: s.key, value: p.raw[yField], label: String(p.raw[spec.x]) },
        key: `bubble-${s.key}-${i}`
      }));
    }
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'bubble', series, margins, innerW, innerH, dataLength: data.length });
}

function mapPt(d, spec, xScale, yScale, xType, yField) {
  const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
  const x = xScale(xVal) + (xType === 'band' ? xScale.bandwidth() / 2 : 0);
  return { x, y: yScale(+d[yField]), raw: d };
}
