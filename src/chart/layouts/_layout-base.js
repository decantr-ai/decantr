/**
 * Shared layout contract — base utilities for all layout modules.
 * Axis/grid scene builders, margin computation, tick formatting.
 * @module layouts/_layout-base
 */

import { scaleLinear, scaleBand, scaleTime, extent, unique, padExtent, isDateLike, toDate } from '../_shared.js';
import { scene, group, line, text, rect, gridLines, axisTicks } from '../_scene.js';

// --- Constants ---

/** Default chart margins (px) */
export const MARGINS = { top: 24, right: 16, bottom: 40, left: 48 };

/** No-axes margins (sparkline, pie) */
export const MARGINS_NONE = { top: 0, right: 0, bottom: 0, left: 0 };

/** Pie/donut margins (small padding) */
export const MARGINS_PIE = { top: 4, right: 4, bottom: 4, left: 4 };

// --- Dimensions ---

/**
 * Compute inner dimensions from outer + margins.
 * @param {number} width
 * @param {number} height
 * @param {Object} margins
 * @returns {{ innerW: number, innerH: number, margins: Object }}
 */
export function innerDimensions(width, height, margins) {
  return {
    innerW: Math.max(0, width - margins.left - margins.right),
    innerH: Math.max(0, height - margins.top - margins.bottom),
    margins
  };
}

// --- Scale builders ---

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
 * @param {{ stacked?: boolean, padBottom?: boolean, min?: number, max?: number }} opts
 * @returns {Function}
 */
export function buildYScale(data, yFields, innerH, opts = {}) {
  const fields = Array.isArray(yFields) ? yFields : [yFields];
  let min = opts.min != null ? opts.min : Infinity;
  let max = opts.max != null ? opts.max : -Infinity;

  if (min === Infinity || max === -Infinity) {
    if (opts.stacked) {
      for (let i = 0; i < data.length; i++) {
        let sum = 0;
        for (const f of fields) sum += +data[i][f] || 0;
        if (sum > max) max = sum;
      }
      if (min === Infinity) min = 0;
    } else {
      for (const f of fields) {
        const [lo, hi] = extent(data, f);
        if (lo < min) min = lo;
        if (hi > max) max = hi;
      }
    }
  }

  if (opts.padBottom !== false && min > 0) min = 0;
  const ext = padExtent([min, max], 0.05);
  if (ext[0] > 0 && min === 0) ext[0] = 0;
  return scaleLinear(ext, [innerH, 0]);
}

// --- Formatting ---

/**
 * Format a number for axis labels.
 * @param {number} v
 * @returns {string}
 */
export function formatNumber(v) {
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
export function formatDate(d) {
  if (!(d instanceof Date)) d = new Date(d);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * Format duration (ms) to human-readable.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  if (ms < 3600000) return (ms / 60000).toFixed(1) + 'm';
  return (ms / 3600000).toFixed(1) + 'h';
}

/**
 * Format percentage.
 * @param {number} v — 0-100 or 0-1
 * @returns {string}
 */
export function formatPercent(v) {
  const pct = v > 1 ? v : v * 100;
  return pct.toFixed(1) + '%';
}

// --- Tick computation ---

/**
 * Compute axis tick positions and labels.
 * @param {Function} scale — scale with .ticks() method
 * @param {string} type — 'linear'|'time'|'band'
 * @param {number} [count=5]
 * @param {Function} [format]
 * @returns {{ value: any, position: number, label: string }[]}
 */
export function computeTicks(scale, type, count = 5, format) {
  if (type === 'band') return [];

  const ticks = scale.ticks(count);
  return ticks.map(t => ({
    value: t,
    position: scale(t),
    label: format ? format(t) : (type === 'time' ? formatDate(t) : formatNumber(t))
  }));
}

/**
 * Get chart color for a series index.
 * Uses CSS custom properties (--d-chart-0 through --d-chart-7).
 * For 8-31, uses extended palette. For 32+, cycles.
 * @param {number} index
 * @returns {string}
 */
export function chartColor(index) {
  return `var(--d-chart-${index % 8})`;
}

/**
 * Extended chart color — uses extended palette tokens for 8+ series.
 * @param {number} index
 * @returns {string}
 */
export function chartColorExtended(index) {
  if (index < 8) return `var(--d-chart-${index})`;
  if (index < 32) return `var(--d-chart-${index % 8}-ext-${Math.floor((index - 8) / 8) + 1})`;
  return `var(--d-chart-${index % 8})`;
}

/** Total base chart palette size */
export const PALETTE_SIZE = 8;

// --- Scene builders ---

/**
 * Build X-axis scene nodes.
 * @param {Function} xScale
 * @param {string} xType
 * @param {number} innerH
 * @param {number} innerW
 * @param {Object} spec
 * @param {Object} [layout] — for band labels
 * @returns {Object[]}
 */
export function buildXAxisNodes(xScale, xType, innerH, innerW, spec, layout) {
  const nodes = [
    line({ x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' })
  ];

  if (xType === 'band' && layout && layout.categories) {
    const bandW = xScale.bandwidth();
    for (const cat of layout.categories) {
      const x = xScale(cat) + bandW / 2;
      nodes.push(text({ x, y: innerH + 20, content: String(cat), anchor: 'middle', class: 'd-chart-axis' }));
    }
  } else if (xType !== 'band') {
    const fmt = spec.xFormat || (xType === 'time' ? formatDate : formatNumber);
    const ticks = computeTicks(xScale, xType, 6, fmt);
    for (const t of ticks) {
      nodes.push(text({ x: t.position, y: innerH + 20, content: t.label, anchor: 'middle', class: 'd-chart-axis' }));
    }
  }

  return nodes;
}

/**
 * Build Y-axis scene nodes.
 * @param {Function} yScale
 * @param {number} innerH
 * @param {Object} spec
 * @returns {Object[]}
 */
export function buildYAxisNodes(yScale, innerH, spec) {
  const fmt = spec.yFormat || formatNumber;
  const ticks = yScale.ticks(5);
  const nodes = [
    line({ x1: 0, y1: 0, x2: 0, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' })
  ];

  for (const t of ticks) {
    const y = yScale(t);
    nodes.push(text({ x: -8, y: y + 4, content: fmt(t), anchor: 'end', class: 'd-chart-axis' }));
  }

  return nodes;
}

/**
 * Build grid line scene nodes.
 * @param {Function} yScale
 * @param {number} innerW
 * @returns {Object[]}
 */
export function buildGridNodes(yScale, innerW) {
  const ticks = yScale.ticks(5);
  return ticks.map(t => line({
    x1: 0, y1: yScale(t), x2: innerW, y2: yScale(t),
    class: 'd-chart-grid'
  }));
}
