/**
 * Data Pipeline — transforms, aggregations, streaming, virtual windowing.
 * All functions are composable and return new arrays.
 * @module _data
 */

// --- Transform functions ---

/**
 * Filter data rows by predicate.
 * @param {Object[]} data
 * @param {Function} predicate — (row) => boolean
 * @returns {Object[]}
 */
export function filter(data, predicate) {
  return data.filter(predicate);
}

/**
 * Sort data by field.
 * @param {Object[]} data
 * @param {string} field
 * @param {'asc'|'desc'} [order='asc']
 * @returns {Object[]}
 */
export function sortBy(data, field, order = 'asc') {
  const sorted = [...data];
  const dir = order === 'desc' ? -1 : 1;
  sorted.sort((a, b) => {
    const av = a[field], bv = b[field];
    if (av < bv) return -dir;
    if (av > bv) return dir;
    return 0;
  });
  return sorted;
}

/**
 * Aggregate data by group field.
 * @param {Object[]} data
 * @param {string} groupField — field to group by
 * @param {string} aggField — field to aggregate
 * @param {'sum'|'avg'|'min'|'max'|'count'} fn
 * @returns {Object[]} — [{ [groupField], [aggField] }]
 */
export function aggregate(data, groupField, aggField, fn) {
  const groups = new Map();
  for (const d of data) {
    const key = d[groupField];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(+d[aggField] || 0);
  }

  return [...groups.entries()].map(([key, values]) => {
    let result;
    switch (fn) {
      case 'sum': result = values.reduce((s, v) => s + v, 0); break;
      case 'avg': result = values.reduce((s, v) => s + v, 0) / values.length; break;
      case 'min': result = Math.min(...values); break;
      case 'max': result = Math.max(...values); break;
      case 'count': result = values.length; break;
      default: result = values.reduce((s, v) => s + v, 0);
    }
    return { [groupField]: key, [aggField]: result };
  });
}

/**
 * Pivot table transformation.
 * @param {Object[]} data
 * @param {string} rowField
 * @param {string} colField
 * @param {string} valueField
 * @returns {Object[]}
 */
export function pivot(data, rowField, colField, valueField) {
  const rows = new Map();
  for (const d of data) {
    const rowKey = d[rowField];
    if (!rows.has(rowKey)) rows.set(rowKey, { [rowField]: rowKey });
    rows.get(rowKey)[d[colField]] = +d[valueField] || 0;
  }
  return [...rows.values()];
}

/**
 * Running cumulative sum.
 * @param {Object[]} data
 * @param {string} field
 * @returns {Object[]}
 */
export function cumulative(data, field) {
  let sum = 0;
  return data.map(d => {
    sum += +d[field] || 0;
    return { ...d, [field]: sum };
  });
}

/**
 * Normalize values to 0-100% of total.
 * @param {Object[]} data
 * @param {string[]} fields
 * @returns {Object[]}
 */
export function normalize(data, fields) {
  return data.map(d => {
    let total = 0;
    for (const f of fields) total += Math.abs(+d[f] || 0);
    if (total === 0) total = 1;
    const result = { ...d };
    for (const f of fields) result[f] = ((+d[f] || 0) / total) * 100;
    return result;
  });
}

// --- Statistical functions ---

/**
 * Histogram binning.
 * @param {Object[]} data
 * @param {string} field
 * @param {number} [binCount] — auto if not provided
 * @returns {{ lo: number, hi: number, count: number }[]}
 */
export function binData(data, field, binCount) {
  const values = data.map(d => +d[field]).filter(v => !isNaN(v)).sort((a, b) => a - b);
  if (!values.length) return [];

  const n = binCount || Math.max(5, Math.ceil(Math.sqrt(values.length)));
  const min = values[0], max = values[values.length - 1];
  const width = (max - min) / n || 1;

  const bins = [];
  for (let i = 0; i < n; i++) {
    const lo = min + i * width;
    const hi = lo + width;
    const count = values.filter(v => v >= lo && (i === n - 1 ? v <= hi : v < hi)).length;
    bins.push({ lo, hi, count });
  }
  return bins;
}

/**
 * Box plot statistics.
 * @param {Object[]} data
 * @param {string} field
 * @returns {{ q1, median, q3, whiskerLow, whiskerHigh, outliers, min, max, mean }}
 */
export function boxStats(data, field) {
  const values = data.map(d => +d[field]).filter(v => !isNaN(v)).sort((a, b) => a - b);
  if (!values.length) return { q1: 0, median: 0, q3: 0, whiskerLow: 0, whiskerHigh: 0, outliers: [], min: 0, max: 0, mean: 0 };

  const q = (p) => {
    const idx = (values.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return lo === hi ? values[lo] : values[lo] + (values[hi] - values[lo]) * (idx - lo);
  };

  const median = q(0.5), q1 = q(0.25), q3 = q(0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const whiskerLow = values.find(v => v >= lowerFence) ?? values[0];
  const whiskerHigh = [...values].reverse().find(v => v <= upperFence) ?? values[values.length - 1];
  const outliers = values.filter(v => v < lowerFence || v > upperFence);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;

  return { q1, median, q3, whiskerLow, whiskerHigh, outliers, min: values[0], max: values[values.length - 1], mean };
}

// --- Virtual windowing ---

/**
 * Extract visible data window using binary search.
 * O(log n) for datasets with sorted x values.
 * @param {Object[]} data — sorted by xField
 * @param {string} xField
 * @param {number[]} viewport — [minX, maxX]
 * @returns {Object[]}
 */
export function virtualWindow(data, xField, viewport) {
  if (!data.length) return [];
  const [minX, maxX] = viewport;

  // Binary search for start index
  let lo = 0, hi = data.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (+data[mid][xField] < minX) lo = mid + 1;
    else hi = mid;
  }
  const startIdx = lo;

  // Binary search for end index
  lo = startIdx; hi = data.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (+data[mid][xField] > maxX) hi = mid - 1;
    else lo = mid;
  }
  const endIdx = hi;

  // Include one point before and after for line continuity
  const start = Math.max(0, startIdx - 1);
  const end = Math.min(data.length - 1, endIdx + 1);

  return data.slice(start, end + 1);
}
