/**
 * Number/date/duration formatting — extracted + extended.
 * @module _format
 */

/**
 * Format a number for display.
 * @param {number} v
 * @returns {string}
 */
export function formatNumber(v) {
  if (v == null || isNaN(v)) return '';
  if (Math.abs(v) >= 1e12) return (v / 1e12).toFixed(1) + 'T';
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

/**
 * Format a date for display.
 * @param {Date|number|string} d
 * @returns {string}
 */
export function formatDate(d) {
  if (!(d instanceof Date)) d = new Date(d);
  if (isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * Format a date with time.
 * @param {Date|number|string} d
 * @returns {string}
 */
export function formatDateTime(d) {
  if (!(d instanceof Date)) d = new Date(d);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${h}:${m}`;
}

/**
 * Format a duration in milliseconds.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  if (ms < 3600000) return (ms / 60000).toFixed(1) + 'm';
  if (ms < 86400000) return (ms / 3600000).toFixed(1) + 'h';
  return (ms / 86400000).toFixed(1) + 'd';
}

/**
 * Format a percentage.
 * @param {number} v — 0-1 or 0-100
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(v, decimals = 1) {
  const pct = v > 1 ? v : v * 100;
  return pct.toFixed(decimals) + '%';
}

/**
 * Format bytes to human-readable.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}

/**
 * Format currency.
 * @param {number} v
 * @param {string} [symbol='$']
 * @returns {string}
 */
export function formatCurrency(v, symbol = '$') {
  return symbol + formatNumber(v);
}

/**
 * Create a custom number formatter.
 * @param {Object} opts
 * @param {string} [opts.prefix='']
 * @param {string} [opts.suffix='']
 * @param {number} [opts.decimals=1]
 * @param {boolean} [opts.compact=true]
 * @returns {(v: number) => string}
 */
export function createFormatter(opts = {}) {
  const { prefix = '', suffix = '', decimals = 1, compact = true } = opts;
  return function(v) {
    const formatted = compact ? formatNumber(v) : v.toFixed(decimals);
    return prefix + formatted + suffix;
  };
}
