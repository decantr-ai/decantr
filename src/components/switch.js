import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx, reactiveAttr } from './_base.js';

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.checked]
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.label]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Switch(props = {}) {
  injectBase();

  const { checked, disabled, label, size, onchange, class: cls } = props;

  const input = h('input', { type: 'checkbox', class: 'd-switch-native', role: 'switch' });
  const track = h('span', { class: 'd-switch-track' },
    h('span', { class: 'd-switch-thumb' })
  );
  const wrapper = h('label', { class: cx('d-switch', size && `d-switch-${size}`, cls) }, input, track);

  if (label) {
    wrapper.appendChild(h('span', { class: 'd-switch-label' }, label));
  }

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
