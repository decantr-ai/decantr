import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface ProgressProps {
  value?: number | (() => number);
  max?: number;
  label?: string;
  variant?: string;
  size?: string;
  striped?: boolean;
  animated?: boolean;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value] - Current value (0-100 or 0-max)
 * @param {number} [props.max] - Maximum value (default: 100)
 * @param {string} [props.label]
 * @param {string} [props.variant] - primary|success|warning|error
 * @param {string} [props.size] - sm|md|lg (default: base 8px)
 * @param {boolean} [props.striped]
 * @param {boolean} [props.animated]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Progress = component<ProgressProps>((props: ProgressProps = {} as ProgressProps) => {
  injectBase();

  const { value, max = 100, label, variant, size, striped, animated, class: cls } = props;

  const progressClass = cx(
    'd-progress',
    size && `d-progress-${size}`,
    variant && `d-progress-${variant}`,
    striped && 'd-progress-striped',
    animated && 'd-progress-animated'
  );

  const bar = h('div', { class: 'd-progress-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(max) });
  const progress = h('div', { class: progressClass }, bar);

  // For md/lg sizes, label goes inside the progress bar; otherwise outside
  const labelInside = size === 'md' || size === 'lg';
  let labelEl = null;
  if (label) {
    labelEl = h('span', { class: 'd-progress-label' }, label);
    if (labelInside) {
      progress.appendChild(labelEl);
    }
  }

  const wrap = h('div', { class: cx('d-progress-wrap', cls) }, progress);
  if (label && !labelInside) {
    wrap.appendChild(labelEl);
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

  return wrap;
})
