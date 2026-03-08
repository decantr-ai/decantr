import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx, reactiveAttr } from './_base.js';

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.checked]
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.label]
 * @param {boolean} [props.indeterminate]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Checkbox(props = {}) {
  injectBase();

  const { checked, disabled, label, indeterminate, onchange, class: cls } = props;

  const input = h('input', { type: 'checkbox', class: 'd-checkbox-native' });
  const check = h('span', { class: 'd-checkbox-check' });
  const wrapper = h('label', { class: cx('d-checkbox', cls) }, input, check);

  if (label) {
    wrapper.appendChild(h('span', { class: 'd-checkbox-label' }, label));
  }

  if (indeterminate) input.indeterminate = true;

  if (onchange) {
    input.addEventListener('change', () => onchange(input.checked));
  }

  if (typeof checked === 'function') {
    createEffect(() => { input.checked = checked(); });
  } else if (checked) {
    input.checked = true;
  }

  reactiveAttr(input, disabled, 'disabled');

  return wrapper;
}
