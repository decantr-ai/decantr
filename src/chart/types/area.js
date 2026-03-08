/**
 * Area chart layout.
 * Extends line layout with fill polygon coordinates.
 */

import { MARGINS, innerDimensions, buildXScale, buildYScale, chartColor } from './_type-base.js';
import { resolve, groupBy, downsampleLTTB } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} layout
 */
export function layoutArea(spec, width, height) {
  const data = resolve(spec.data);
  const { innerW, innerH, margins } = innerDimensions(width, height, MARGINS);
  const { scale: xScale, type: xType } = buildXScale(data, spec.x, innerW);
  const yFields = Array.isArray(spec.y) ? spec.y : [spec.y];
  const yScale = buildYScale(data, yFields, innerH, { stacked: !!spec.stacked });
  const baseline = yScale(0);

  let series;
  if (spec.stacked && yFields.length > 1) {
    // Stacked areas — compute cumulative baselines
    const prevBaselines = data.map(() => baseline);
    series = yFields.map((f, i) => {
      const points = data.map((d, j) => {
        const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
        const val = +d[f] || 0;
        const y1 = prevBaselines[j];
        const y0 = yScale(yScale.invert(y1) + val);
        // Update baseline to new top for next layer
        const top = y0;
        return { x: xScale(xVal), y0: top, y1, raw: d };
      });
      // Update prevBaselines for next series
      for (let j = 0; j < data.length; j++) prevBaselines[j] = points[j].y0;
      return { key: f, color: chartColor(i), points };
    });
  } else if (spec.series) {
    const groups = groupBy(data, spec.series);
    series = [...groups.entries()].map(([key, rows], i) => {
      const sampled = rows.length > innerW * 2 ? downsampleLTTB(rows, spec.x, yFields[0], Math.round(innerW * 2)) : rows;
      return {
        key,
        color: chartColor(i),
        points: sampled.map(d => {
          const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
          return { x: xScale(xVal), y0: yScale(+d[yFields[0]]), y1: baseline, raw: d };
        })
      };
    });
  } else {
    series = yFields.map((f, i) => {
      const sampled = data.length > innerW * 2 ? downsampleLTTB(data, spec.x, f, Math.round(innerW * 2)) : data;
      return {
        key: f,
        color: chartColor(i),
        points: sampled.map(d => {
          const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
          return { x: xScale(xVal), y0: yScale(+d[f]), y1: baseline, raw: d };
        })
      };
    });
  }

  return {
    type: 'area',
    width, height, margins, innerW, innerH,
    xScale, yScale, xType,
    series, baseline,
    dataLength: data.length
  };
}
