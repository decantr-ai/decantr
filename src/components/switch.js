import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

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

  const { checked, disabled, label, onchange, class: cls } = props;

  const input = h('input', { type: 'checkbox', class: 'd-switch-native', role: 'switch' });
  const track = h('span', { class: 'd-switch-track' },
    h('span', { class: 'd-switch-thumb' })
  );
  const wrapper = h('label', { class: cx('d-switch', cls) }, input, track);

  if (label) {
    wrapper.appendChild(h('span', { class: 'd-switch-label' }, label));
  }

  if (onchange) {
    input.addEventListener('change', () => onchange(input.checked));
  }

  if (typeof checked === 'function') {
    createEffect(() => {
      input.checked = checked();
      wrapper.classList.toggle('d-switch-checked', input.checked);
    });
  } else if (checked) {
    input.checked = true;
    wrapper.classList.add('d-switch-checked');
  }

  if (typeof disabled === 'function') {
    createEffect(() => {
      if (disabled()) input.setAttribute('disabled', '');
      else input.removeAttribute('disabled');
    });
  } else if (disabled) {
    input.setAttribute('disabled', '');
  }

  input.addEventListener('change', () => {
    wrapper.classList.toggle('d-switch-checked', input.checked);
  });

  return wrapper;
}
