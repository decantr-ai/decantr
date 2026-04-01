/**
 * Statistic — Display a numeric value with label, prefix/suffix, and trend.
 * Supports countdown timer.
 *
 * @module decantr/components/statistic
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { icon } from './icon.js';

import { component } from '../runtime/component.js';
export interface StatisticProps {
  label?: string;
  value?: number|string|Function;
  precision?: number;
  prefix?: string | Node;
  suffix?: string | Node;
  trend?: 'up'|'down';
  trendValue?: string;
  groupSeparator?: boolean;
  animate?: boolean|number;
  class?: string;
  [key: string]: unknown;
}

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
 * @param {boolean|number} [props.animate=false] - Animate count-up on mount. true = 1000ms, number = custom duration in ms
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Statistic = component<StatisticProps>((props: StatisticProps = {} as StatisticProps) => {
  injectBase();
  const { label, value, precision, prefix, suffix, trend, trendValue, groupSeparator = true, animate = false, class: cls } = props;

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

  /**
   * Animate count-up from 0 to target using rAF with easeOutExpo.
   */
  function animateCountUp(target) {
    const duration = typeof animate === 'number' ? animate : 1000;
    const startTime = performance.now();
    const from = 0;
    const to = typeof target === 'number' ? target : parseFloat(target);
    if (isNaN(to)) { valueSpan.textContent = formatValue(target); return; }

    // Infer precision from target to avoid decimal explosion during animation
    const targetStr = String(target);
    const dotIdx = targetStr.indexOf('.');
    const inferredPrecision = dotIdx === -1 ? 0 : targetStr.length - dotIdx - 1;

    function easeOutExpo(t) {
      return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function formatAnimFrame(num) {
      if (precision !== undefined) return formatValue(num);
      // Use inferred precision during animation frames
      let v = inferredPrecision === 0 ? Math.round(num) : parseFloat(num.toFixed(inferredPrecision));
      let s = inferredPrecision === 0 ? String(v) : v.toFixed(inferredPrecision);
      if (groupSeparator) {
        const parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        s = parts.join('.');
      }
      return s;
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = from + (to - from) * easeOutExpo(progress);
      valueSpan.textContent = progress >= 1 ? formatValue(to) : formatAnimFrame(current);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function update() {
    const v = typeof value === 'function' ? value() : value;
    valueSpan.textContent = formatValue(v);
  }

  if (animate && typeof requestAnimationFrame !== 'undefined') {
    const v = typeof value === 'function' ? value() : value;
    animateCountUp(v);
  } else {
    update();
  }

  if (typeof value === 'function') {
    createEffect(update);
  }

  if (trend) {
    const trendEl = h('div', {
      class: cx('d-statistic-trend', `d-statistic-trend-${trend}`)
    });
    trendEl.appendChild(icon(trend === 'up' ? 'trending-up' : 'trending-down', { size: '1em' }));
    if (trendValue) trendEl.appendChild(h('span', null, trendValue));
    container.appendChild(trendEl);
  }

  return container;
})

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

export interface StatisticCountdownProps {
  class?: string;
  [key: string]: unknown;
}

Statistic.Countdown = function Countdown(props: StatisticCountdownProps = {} as StatisticCountdownProps) {
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
