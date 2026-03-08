import { createEffect } from '../state/index.js';
import { getTheme } from '../css/theme-registry.js';

/**
 * Resolve a prop that may be a signal getter or a static value.
 * @template T
 * @param {T|Function} prop
 * @returns {T}
 */
export function resolve(prop) {
  return typeof prop === 'function' ? prop() : prop;
}

// --- Scales ---

/**
 * Linear scale: maps [domainMin, domainMax] → [rangeMin, rangeMax].
 * @param {number[]} domain — [min, max]
 * @param {number[]} range — [min, max] in pixels
 * @returns {{ (v: number) => number, ticks: (count?: number) => number[], invert: (px: number) => number }}
 */
export function scaleLinear(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const rSpan = r1 - r0;

  function scale(v) {
    return r0 + ((v - d0) / span) * rSpan;
  }

  scale.invert = function (px) {
    return d0 + ((px - r0) / rSpan) * span;
  };

  scale.ticks = function (count = 5) {
    const step = niceStep(span / count);
    const start = Math.ceil(d0 / step) * step;
    const result = [];
    for (let v = start; v <= d1; v += step) {
      result.push(+v.toPrecision(12));
    }
    return result;
  };

  return scale;
}

/**
 * Band scale: maps discrete values → pixel bands with padding.
 * @param {any[]} domain — discrete values
 * @param {number[]} range — [min, max] in pixels
 * @param {number} padding — 0..1, space between bands
 * @returns {{ (v: any) => number, bandwidth: () => number }}
 */
export function scaleBand(domain, range, padding = 0.2) {
  const [r0, r1] = range;
  const n = domain.length || 1;
  const totalPad = padding * (n + 1);
  const bandWidth = (r1 - r0) / (n + totalPad);
  const step = bandWidth * (1 + padding);
  const offset = bandWidth * padding;
  const map = new Map();
  for (let i = 0; i < domain.length; i++) {
    map.set(domain[i], r0 + offset + i * step);
  }

  function scale(v) {
    return map.get(v) ?? r0;
  }

  scale.bandwidth = function () {
    return bandWidth;
  };

  return scale;
}

/**
 * Time scale: maps Date values → pixel positions.
 * @param {Date[]} domain — [min, max] dates
 * @param {number[]} range — [min, max] in pixels
 * @returns {{ (v: Date|number) => number, ticks: (count?: number) => Date[] }}
 */
export function scaleTime(domain, range) {
  const d0 = +domain[0];
  const d1 = +domain[1];
  const inner = scaleLinear([d0, d1], range);

  function scale(v) {
    return inner(+v);
  }

  scale.invert = function (px) {
    return new Date(inner.invert(px));
  };

  scale.ticks = function (count = 5) {
    return inner.ticks(count).map(t => new Date(t));
  };

  return scale;
}

// --- Nice step for axis ticks ---

function niceStep(rawStep) {
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let nice;
  if (norm <= 1.5) nice = 1;
  else if (norm <= 3) nice = 2;
  else if (norm <= 7) nice = 5;
  else nice = 10;
  return nice * mag;
}

// --- Data utilities ---

/**
 * Compute extent (min, max) of a numeric field.
 * @param {Object[]} data
 * @param {string} field
 * @returns {[number, number]}
 */
export function extent(data, field) {
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const v = +data[i][field];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
}

/**
 * Get unique values of a field (preserving order).
 * @param {Object[]} data
 * @param {string} field
 * @returns {any[]}
 */
export function unique(data, field) {
  const seen = new Set();
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const v = data[i][field];
    if (!seen.has(v)) {
      seen.add(v);
      result.push(v);
    }
  }
  return result;
}

/**
 * Group data by a field value.
 * @param {Object[]} data
 * @param {string} field
 * @returns {Map<any, Object[]>}
 */
export function groupBy(data, field) {
  const groups = new Map();
  for (let i = 0; i < data.length; i++) {
    const key = data[i][field];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(data[i]);
  }
  return groups;
}

/**
 * LTTB downsampling — Largest Triangle Three Buckets.
 * Preserves visual shape of time series for line/area charts.
 * @param {Object[]} data — sorted by x
 * @param {string} xField
 * @param {string} yField
 * @param {number} targetCount — desired output length
 * @returns {Object[]}
 */
export function downsampleLTTB(data, xField, yField, targetCount) {
  if (data.length <= targetCount) return data;

  const result = [data[0]]; // Always keep first
  const bucketSize = (data.length - 2) / (targetCount - 2);

  let prevIndex = 0;
  for (let i = 1; i < targetCount - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor(i * bucketSize) + 1, data.length - 1);
    const nextBucketStart = Math.min(Math.floor(i * bucketSize) + 1, data.length - 1);
    const nextBucketEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, data.length - 1);

    // Average of next bucket
    let avgX = 0, avgY = 0, count = 0;
    for (let j = nextBucketStart; j <= nextBucketEnd; j++) {
      avgX += +data[j][xField];
      avgY += +data[j][yField];
      count++;
    }
    avgX /= count;
    avgY /= count;

    // Find point in current bucket with largest triangle area
    let maxArea = -1;
    let maxIndex = bucketStart;
    const px = +data[prevIndex][xField];
    const py = +data[prevIndex][yField];

    for (let j = bucketStart; j <= bucketEnd; j++) {
      const area = Math.abs(
        (px - avgX) * (+data[j][yField] - py) -
        (px - +data[j][xField]) * (avgY - py)
      );
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    result.push(data[maxIndex]);
    prevIndex = maxIndex;
  }

  result.push(data[data.length - 1]); // Always keep last
  return result;
}

/**
 * Pad a numeric extent by a fraction for visual breathing room.
 * @param {[number, number]} ext
 * @param {number} fraction — default 0.05 (5%)
 * @returns {[number, number]}
 */
export function padExtent(ext, fraction = 0.05) {
  const span = ext[1] - ext[0] || 1;
  const pad = span * fraction;
  return [ext[0] - pad, ext[1] + pad];
}

/**
 * Detect if values look like dates.
 * @param {any[]} values
 * @returns {boolean}
 */
export function isDateLike(values) {
  if (!values.length) return false;
  const v = values[0];
  if (v instanceof Date) return true;
  if (typeof v === 'string' && !isNaN(Date.parse(v))) return true;
  return false;
}

/**
 * Parse a value as a Date if needed.
 * @param {any} v
 * @returns {Date}
 */
export function toDate(v) {
  return v instanceof Date ? v : new Date(v);
}
