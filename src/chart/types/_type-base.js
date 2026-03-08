/**
 * Shared layout utilities for all chart types.
 * Axis computation, grid lines, legend layout, margins.
 */

import { scaleLinear, scaleBand, scaleTime, extent, unique, padExtent, isDateLike, toDate } from '../_shared.js';

/** Default chart margins (px) */
export const MARGINS = { top: 24, right: 16, bottom: 40, left: 48 };

/** No-axes margins (sparkline, pie) */
export const MARGINS_NONE = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Compute inner dimensions from outer + margins.
 * @param {number} width
 * @param {number} height
 * @param {{ top: number, right: number, bottom: number, left: number }} margins
 * @returns {{ innerW: number, innerH: number, margins: Object }}
 */
export function innerDimensions(width, height, margins) {
  return {
    innerW: Math.max(0, width - margins.left - margins.right),
    innerH: Math.max(0, height - margins.top - margins.bottom),
    margins
  };
}

/**
 * Build an X scale from data + field + inner width.
 * Auto-detects band (categorical) vs linear/time (numeric/date).
 * @param {Object[]} data
 * @param {string} xField
 * @param {number} innerW
 * @returns {{ scale: Function, type: 'band'|'linear'|'time' }}
 */
export function buildXScale(data, xField, innerW) {
  const values = data.map(d => d[xField]);

  if (isDateLike(values)) {
    const dates = values.map(toDate);
    const [min, max] = [Math.min(...dates), Math.max(...dates)];
    return { scale: scaleTime([new Date(min), new Date(max)], [0, innerW]), type: 'time' };
  }

  if (typeof values[0] === 'number') {
    const ext = padExtent(extent(data, xField));
    return { scale: scaleLinear(ext, [0, innerW]), type: 'linear' };
  }

  // Categorical
  const cats = unique(data, xField);
  return { scale: scaleBand(cats, [0, innerW]), type: 'band' };
}

/**
 * Build a Y scale from data + field(s) + inner height.
 * Always linear, domain goes bottom→top (range inverted).
 * @param {Object[]} data
 * @param {string|string[]} yFields
 * @param {number} innerH
 * @param {{ stacked?: boolean, padBottom?: boolean }} opts
 * @returns {Function}
 */
export function buildYScale(data, yFields, innerH, opts = {}) {
  const fields = Array.isArray(yFields) ? yFields : [yFields];
  let min = Infinity, max = -Infinity;

  if (opts.stacked) {
    // For stacked: sum all y fields per row
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      for (const f of fields) sum += +data[i][f] || 0;
      if (sum > max) max = sum;
    }
    min = 0;
  } else {
    for (const f of fields) {
      const [lo, hi] = extent(data, f);
      if (lo < min) min = lo;
      if (hi > max) max = hi;
    }
  }

  if (opts.padBottom !== false && min > 0) min = 0;
  const ext = padExtent([min, max], 0.05);
  if (ext[0] > 0 && min === 0) ext[0] = 0;
  return scaleLinear(ext, [innerH, 0]);
}

/**
 * Compute axis tick positions.
 * @param {Function} scale — scale with .ticks() method
 * @param {string} type — 'linear'|'time'|'band'
 * @param {number} count
 * @returns {{ value: any, position: number, label: string }[]}
 */
export function computeTicks(scale, type, count = 5, format) {
  if (type === 'band') {
    // Band scale doesn't have .ticks; use domain values
    const domain = [];
    // Reconstruct from map — band scale stores map internally
    // We return positions directly from the scale
    return [];  // Handled specially by renderers (labels from data)
  }

  const ticks = scale.ticks(count);
  return ticks.map(t => ({
    value: t,
    position: scale(t),
    label: format ? format(t) : (type === 'time' ? formatDate(t) : formatNumber(t))
  }));
}

/**
 * Compute grid line positions from Y ticks.
 * @param {Function} yScale
 * @param {number} count
 * @returns {{ position: number, label: string }[]}
 */
export function computeGridLines(yScale, count = 5) {
  const ticks = yScale.ticks(count);
  return ticks.map(t => ({
    position: yScale(t),
    label: formatNumber(t)
  }));
}

/**
 * Format a number for axis labels.
 * @param {number} v
 * @returns {string}
 */
function formatNumber(v) {
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

/**
 * Format a date for axis labels.
 * @param {Date} d
 * @returns {string}
 */
function formatDate(d) {
  if (!(d instanceof Date)) d = new Date(d);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

/**
 * Get chart color for a series index.
 * Uses CSS custom properties (--d-chart-0 through --d-chart-7).
 * @param {number} index
 * @returns {string}
 */
export function chartColor(index) {
  return `var(--d-chart-${index % 8})`;
}

/** Total chart palette size */
export const PALETTE_SIZE = 8;
