/**
 * Line chart layout.
 * Computes polyline path data from spec + scales.
 */

import { MARGINS, innerDimensions, buildXScale, buildYScale, chartColor } from './_type-base.js';
import { resolve, groupBy, downsampleLTTB } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} layout
 */
export function layoutLine(spec, width, height) {
  const data = resolve(spec.data);
  const { innerW, innerH, margins } = innerDimensions(width, height, MARGINS);
  const { scale: xScale, type: xType } = buildXScale(data, spec.x, innerW);
  const yFields = spec.y;
  const fields = Array.isArray(yFields) ? yFields : [yFields];
  const yScale = buildYScale(data, fields, innerH);

  // Multi-series: by field array or by series key
  let series;
  if (spec.series) {
    const groups = groupBy(data, spec.series);
    series = [...groups.entries()].map(([key, rows], i) => {
      const sampled = rows.length > innerW * 2 ? downsampleLTTB(rows, spec.x, fields[0], Math.round(innerW * 2)) : rows;
      return {
        key,
        color: chartColor(i),
        points: sampled.map(d => ({ x: xScale(xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x])), y: yScale(+d[fields[0]]), raw: d }))
      };
    });
  } else {
    series = fields.map((f, i) => {
      const sampled = data.length > innerW * 2 ? downsampleLTTB(data, spec.x, f, Math.round(innerW * 2)) : data;
      return {
        key: f,
        color: chartColor(i),
        points: sampled.map(d => ({ x: xScale(xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x])), y: yScale(+d[f]), raw: d }))
      };
    });
  }

  return {
    type: 'line',
    width, height, margins, innerW, innerH,
    xScale, yScale, xType,
    series,
    dataLength: data.length
  };
}
