/**
 * Range Area chart layout.
 * Supports: difference, inverted, labels.
 * @module types/range-area
 */

import { scene, group, path, text } from '../_scene.js';
import { pointsToPathD } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor } from '../layouts/_layout-base.js';
import { resolve } from '../_shared.js';

export function layoutRangeArea(spec, width, height) {
  const data = resolve(spec.data);
  const lowField = spec.low || (Array.isArray(spec.y) ? spec.y[0] : 'low');
  const highField = spec.high || (Array.isArray(spec.y) ? spec.y[1] : 'high');

  const coords = cartesian({ ...spec, y: [lowField, highField] }, width, height);
  const { innerW, innerH, margins, xScale, yScale, xType, axisNodes, gridNodes } = coords;

  const children = [];
  if (spec.grid !== false) children.push(...gridNodes);
  children.push(...axisNodes);

  // Map points
  const points = data.map(d => {
    const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
    const x = xScale(xVal) + (xType === 'band' ? xScale.bandwidth() / 2 : 0);
    return { x, yLow: yScale(+d[lowField]), yHigh: yScale(+d[highField]) };
  });

  // Area fill
  let areaD = `M${points[0].x},${points[0].yHigh}`;
  for (let i = 1; i < points.length; i++) areaD += `L${points[i].x},${points[i].yHigh}`;
  for (let i = points.length - 1; i >= 0; i--) areaD += `L${points[i].x},${points[i].yLow}`;
  areaD += 'Z';

  children.push(path({ d: areaD, fill: chartColor(0), opacity: 0.2, class: 'd-chart-area', key: 'range-area-fill' }));

  // Upper and lower bounds
  children.push(path({
    d: pointsToPathD(points.map(p => ({ x: p.x, y: p.yHigh }))),
    stroke: chartColor(0), strokeWidth: 1.5, class: 'd-chart-line', key: 'range-area-high'
  }));
  children.push(path({
    d: pointsToPathD(points.map(p => ({ x: p.x, y: p.yLow }))),
    stroke: chartColor(0), strokeWidth: 1.5, strokeDash: '4,3', class: 'd-chart-line', key: 'range-area-low'
  }));

  const series = [{ key: `${lowField}-${highField}`, color: chartColor(0) }];

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'range-area', series, margins, innerW, innerH, dataLength: data.length });
}
