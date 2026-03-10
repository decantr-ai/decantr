/**
 * Statistic — Display a numeric value with label, prefix/suffix, and trend.
 * Supports countdown timer.
 *
 * @module decantr/components/statistic
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.label] - Description label
 * @param {number|string|Function} [props.value] - The statistic value
 * @param {number} [props.precision] - Decimal places
 * @param {string|Node} [props.prefix]
 * @param {string|Node} [props.suffix]
 * @param {'up'|'down'} [props.trend] - Trend direction
 * @param {string} [props.trendValue] - Trend text (e.g. "12%")
 * @param {boolean} [props.groupSeparator=true] - Thousands separator
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Statistic(props = {}) {
  injectBase();
  const { label, value, precision, prefix, suffix, trend, trendValue, groupSeparator = true, class: cls } = props;

  const container = h('div', { class: cx('d-statistic', cls) });

  if (label) {
    container.appendChild(h('div', { class: 'd-statistic-label' }, label));
  }

  const valueRow = h('div', { class: 'd-statistic-value' });

  if (prefix) {
    const pre = h('span', { class: 'd-statistic-prefix' });
    if (typeof prefix === 'string') pre.textContent = prefix;
    else pre.appendChild(prefix);
    valueRow.appendChild(pre);
  }

  const valueSpan = h('span', null);
  valueRow.appendChild(valueSpan);

  if (suffix) {
    const suf = h('span', { class: 'd-statistic-suffix' });
    if (typeof suffix === 'string') suf.textContent = suffix;
    else suf.appendChild(suffix);
    valueRow.appendChild(suf);
  }

  container.appendChild(valueRow);

  function formatValue(v) {
    if (v == null) return '';
    let num = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(num)) return String(v);
    if (precision !== undefined) num = num.toFixed(precision);
    else num = String(num);
    if (groupSeparator) {
      const parts = num.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      num = parts.join('.');
    }
    return num;
  }

  function update() {
    const v = typeof value === 'function' ? value() : value;
    valueSpan.textContent = formatValue(v);
  }

  update();

  if (typeof value === 'function') {
    createEffect(update);
  }

  if (trend) {
    const trendEl = h('div', {
      class: cx('d-statistic-trend', `d-statistic-trend-${trend}`)
    });
    const arrow = trend === 'up' ? '\u2191' : '\u2193';
    trendEl.appendChild(h('span', null, arrow));
    if (trendValue) trendEl.appendChild(h('span', null, trendValue));
    container.appendChild(trendEl);
  }

  return container;
}

/**
 * Statistic.Countdown — Countdown timer.
 * @param {Object} [props]
 * @param {string} [props.label]
 * @param {number|Date} [props.target] - Target time (timestamp or Date)
 * @param {string} [props.format='HH:mm:ss']
 * @param {Function} [props.onFinish]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
Statistic.Countdown = function Countdown(props = {}) {
  injectBase();
  const { label, target, format = 'HH:mm:ss', onFinish, class: cls } = props;

  const container = h('div', { class: cx('d-statistic', cls) });
  if (label) container.appendChild(h('div', { class: 'd-statistic-label' }, label));

  const valueEl = h('div', { class: 'd-statistic-value d-statistic-countdown' });
  container.appendChild(valueEl);

  const targetTime = target instanceof Date ? target.getTime() : (target || 0);

  function formatDuration(ms) {
    if (ms <= 0) return format.replace('HH', '00').replace('mm', '00').replace('ss', '00');
    const totalSec = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSec % 60).padStart(2, '0');
    return format.replace('HH', hours).replace('mm', minutes).replace('ss', seconds);
  }

  function tick() {
    const remaining = targetTime - Date.now();
    valueEl.textContent = formatDuration(remaining);
    if (remaining <= 0) {
      if (onFinish) onFinish();
      return;
    }
    requestAnimationFrame(tick);
  }

  tick();
  return container;
};
