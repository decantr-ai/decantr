import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { applyFieldState } from './_primitives.js';

const { div, input: inputTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {string} [props.type='text']
 * @param {string} [props.placeholder]
 * @param {string|Function} [props.value]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|Function} [props.readonly]
 * @param {string|Node} [props.prefix]
 * @param {string|Node} [props.suffix]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {boolean|Function} [props.loading]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {Function} [props.oninput]
 * @param {Function} [props.onchange]
 * @param {Function} [props.ref]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Input(props = {}) {
  injectBase();

  const {
    type = 'text', placeholder, value, disabled, readonly,
    prefix, suffix, error, success, loading, variant, size,
    label, help, required, oninput, onchange, ref,
    'aria-label': ariaLabel, class: cls
  } = props;

  const inputProps = { class: 'd-input', type };
  if (placeholder) inputProps.placeholder = placeholder;
  if (readonly && typeof readonly !== 'function') inputProps.readonly = '';
  if (oninput) inputProps.oninput = oninput;
  if (onchange) inputProps.onchange = onchange;
  if (ariaLabel) inputProps['aria-label'] = ariaLabel;
  if (required) { inputProps.required = ''; inputProps['aria-required'] = 'true'; }

  const inputEl = inputTag(inputProps);
  if (ref) ref(inputEl);

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => { inputEl.value = value(); });
  } else if (value !== undefined) {
    inputEl.value = value;
  }

  // Reactive disabled on the input itself
  if (typeof disabled === 'function') {
    createEffect(() => { inputEl.disabled = disabled(); });
  } else if (disabled) {
    inputEl.disabled = true;
  }

  // Reactive readonly
  if (typeof readonly === 'function') {
    createEffect(() => { inputEl.readOnly = readonly(); });
  }

  const children = [];
  if (prefix) children.push(span({ class: 'd-input-prefix' }, prefix));
  children.push(inputEl);
  if (suffix) children.push(span({ class: 'd-input-suffix' }, suffix));

  const wrap = div({ class: cx('d-input-wrap', cls) }, ...children);

  // Apply .d-field state
  applyFieldState(wrap, { error, success, disabled, readonly, loading, variant, size });

  // createFormField wrapper if label/help provided
  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
}
