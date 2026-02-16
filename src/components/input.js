import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.type] - text|password|number|email|search
 * @param {string} [props.placeholder]
 * @param {string|Function} [props.value]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean} [props.readonly]
 * @param {string|Node} [props.prefix]
 * @param {string|Node} [props.suffix]
 * @param {boolean|Function} [props.error]
 * @param {Function} [props.oninput]
 * @param {Function} [props.ref]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Input(props = {}) {
  injectBase();

  const {
    type = 'text', placeholder, value, disabled, readonly,
    prefix, suffix, error, oninput, ref, class: cls
  } = props;

  const wrapClass = cx('d-input-wrap', cls);
  const inputProps = { class: 'd-input', type };

  if (placeholder) inputProps.placeholder = placeholder;
  if (readonly) inputProps.readonly = '';
  if (oninput) inputProps.oninput = oninput;

  const inputEl = h('input', inputProps);

  if (ref) ref(inputEl);

  // Handle reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      inputEl.value = value();
    });
  } else if (value !== undefined) {
    inputEl.value = value;
  }

  // Handle reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      if (v) inputEl.setAttribute('disabled', '');
      else inputEl.removeAttribute('disabled');
    });
  } else if (disabled) {
    inputEl.setAttribute('disabled', '');
  }

  const children = [];
  if (prefix) {
    const prefixEl = typeof prefix === 'string'
      ? h('span', { class: 'd-input-prefix' }, prefix)
      : h('span', { class: 'd-input-prefix' }, prefix);
    children.push(prefixEl);
  }
  children.push(inputEl);
  if (suffix) {
    const suffixEl = typeof suffix === 'string'
      ? h('span', { class: 'd-input-suffix' }, suffix)
      : h('span', { class: 'd-input-suffix' }, suffix);
    children.push(suffixEl);
  }

  const wrap = h('div', { class: wrapClass }, ...children);

  // Handle reactive error
  if (typeof error === 'function') {
    createEffect(() => {
      const v = error();
      if (v) {
        wrap.className = cx(wrapClass, 'd-input-error');
      } else {
        wrap.className = wrapClass;
      }
    });
  } else if (error) {
    wrap.className = cx(wrapClass, 'd-input-error');
  }

  return wrap;
}
