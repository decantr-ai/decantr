/**
 * Bar chart layout.
 * Computes bar rectangles from spec + scales.
 */

import { MARGINS, innerDimensions, buildYScale, chartColor } from './_type-base.js';
import { resolve, unique, scaleBand } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} layout
 */
export function layoutBar(spec, width, height) {
  const data = resolve(spec.data);
  const yFields = Array.isArray(spec.y) ? spec.y : [spec.y];
  const categories = unique(data, spec.x);
  const { innerW, innerH, margins } = innerDimensions(width, height, MARGINS);

  const xScale = scaleBand(categories, [0, innerW], 0.2);
  const yScale = buildYScale(data, yFields, innerH, { stacked: !!spec.stacked });
  const bandW = xScale.bandwidth();

  let bars;
  if (spec.stacked && yFields.length > 1) {
    // Stacked bars
    bars = categories.map(cat => {
      const row = data.find(d => d[spec.x] === cat);
      if (!row) return null;
      let cumY = 0;
      const segments = yFields.map((f, i) => {
        const val = +row[f] || 0;
        const y0 = cumY;
        cumY += val;
        return {
          field: f,
          color: chartColor(i),
          x: xScale(cat),
          y: yScale(cumY),
          width: bandW,
          height: yScale(y0) - yScale(cumY),
          value: val,
          raw: row
        };
      });
      return { category: cat, segments };
    }).filter(Boolean);
  } else if (yFields.length > 1) {
    // Grouped bars
    const groupBandW = bandW / yFields.length;
    bars = categories.map(cat => {
      const row = data.find(d => d[spec.x] === cat);
      if (!row) return null;
      const segments = yFields.map((f, i) => {
        const val = +row[f] || 0;
        return {
          field: f,
          color: chartColor(i),
          x: xScale(cat) + i * groupBandW,
          y: yScale(val),
          width: groupBandW * 0.85,
          height: yScale(0) - yScale(val),
          value: val,
          raw: row
        };
      });
      return { category: cat, segments };
    }).filter(Boolean);
  } else {
    // Simple bars
    bars = data.map((d, i) => {
      const val = +d[yFields[0]] || 0;
      return {
        category: d[spec.x],
        segments: [{
          field: yFields[0],
          color: chartColor(0),
          x: xScale(d[spec.x]),
          y: yScale(val),
          width: bandW,
          height: yScale(0) - yScale(val),
          value: val,
          raw: d
        }]
      };
    });
  }

  return {
    type: 'bar',
    width, height, margins, innerW, innerH,
    xScale, yScale, xType: 'band',
    categories, bars, yFields,
    dataLength: data.length
  };
}
