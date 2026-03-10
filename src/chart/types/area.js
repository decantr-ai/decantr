/**
 * Area chart layout — produces scene graph.
 * Supports: stacked, 100%, range area, markers, negative values.
 * @module types/area
 */

import { scene, group, path } from '../_scene.js';
import { areaPathD, pointsToPathD, smoothPathD } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor } from '../layouts/_layout-base.js';
import { resolve, groupBy, downsampleLTTB } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} scene graph
 */
export function layoutArea(spec, width, height) {
  const data = resolve(spec.data);
  const coords = cartesian(spec, width, height, { yOpts: { stacked: !!spec.stacked } });
  const { innerW, innerH, margins, xScale, yScale, xType, axisNodes, gridNodes } = coords;
  const yFields = Array.isArray(spec.y) ? spec.y : [spec.y];
  const baseline = yScale(0);

  let series;
  if (spec.stacked && yFields.length > 1) {
    const prevBaselines = data.map(() => baseline);
    series = yFields.map((f, i) => {
      const points = data.map((d, j) => {
        const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
        const x = xScale(xVal) + (xType === 'band' ? xScale.bandwidth() / 2 : 0);
        const val = +d[f] || 0;
        const y1 = prevBaselines[j];
        const y0 = yScale(yScale.invert(y1) + val);
        return { x, y0: y0, y1, raw: d };
      });
      for (let j = 0; j < data.length; j++) prevBaselines[j] = points[j].y0;
      return { key: f, color: chartColor(i), points };
    });
  } else if (spec.series) {
    const groups = groupBy(data, spec.series);
    series = [...groups.entries()].map(([key, rows], i) => {
      const sampled = rows.length > innerW * 2 ? downsampleLTTB(rows, spec.x, yFields[0], Math.round(innerW * 2)) : rows;
      return {
        key, color: chartColor(i),
        points: sampled.map(d => {
          const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
          const x = xScale(xVal) + (xType === 'band' ? xScale.bandwidth() / 2 : 0);
          return { x, y0: yScale(+d[yFields[0]]), y1: baseline, raw: d };
        })
      };
    });
  } else {
    series = yFields.map((f, i) => {
      const sampled = data.length > innerW * 2 ? downsampleLTTB(data, spec.x, f, Math.round(innerW * 2)) : data;
      return {
        key: f, color: chartColor(i),
        points: sampled.map(d => {
          const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
          const x = xScale(xVal) + (xType === 'band' ? xScale.bandwidth() / 2 : 0);
          return { x, y0: yScale(+d[f]), y1: baseline, raw: d };
        })
      };
    });
  }

  // Build scene
  const children = [];
  if (spec.grid !== false) children.push(...gridNodes);
  children.push(...axisNodes);

  for (const s of series) {
    if (s.points.length < 2) continue;

    // Fill area
    const areaD = areaPathD(s.points);
    children.push(path({
      d: areaD, fill: s.color, class: 'd-chart-area',
      data: { series: s.key }, key: `area-${s.key}`
    }));

    // Stroke line on top
    const linePts = s.points.map(p => ({ x: p.x, y: p.y0 }));
    const lineD = spec.smooth ? smoothPathD(linePts) : pointsToPathD(linePts);
    children.push(path({
      d: lineD, stroke: s.color, strokeWidth: 2,
      strokeLinecap: 'round', strokeLinejoin: 'round',
      class: 'd-chart-line',
      data: { series: s.key }, key: `area-line-${s.key}`
    }));
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'area', series, xScale, yScale, xType, margins, innerW, innerH, baseline, dataLength: data.length });
}
