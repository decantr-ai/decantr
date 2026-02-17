import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value] - Current value (0-100 or 0-max)
 * @param {number} [props.max] - Maximum value (default: 100)
 * @param {string} [props.label]
 * @param {string} [props.variant] - primary|success|warning|error
 * @param {boolean} [props.striped]
 * @param {boolean} [props.animated]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Progress(props = {}) {
  injectBase();

  const { value, max = 100, label, variant, striped, animated, class: cls } = props;

  const barClass = cx(
    'd-progress-bar',
    variant && `d-progress-${variant}`,
    striped && 'd-progress-striped',
    animated && 'd-progress-animated'
  );

  const bar = h('div', { class: barClass, role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(max) });
  const container = h('div', { class: cx('d-progress', cls) }, bar);

  if (label) {
    container.appendChild(h('span', { class: 'd-progress-label' }, label));
  }

  function updateBar(val) {
    const pct = Math.min(Math.max((val / max) * 100, 0), 100);
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(val));
  }

  if (typeof value === 'function') {
    createEffect(() => updateBar(value()));
  } else {
    updateBar(value || 0);
  }

  return container;
}
