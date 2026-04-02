import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { applyFieldState } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string | (() => string);
  disabled?: boolean | (() => boolean);
  readonly?: boolean | (() => boolean);
  prefix?: string | Node;
  suffix?: string | Node;
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  loading?: boolean | (() => boolean);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  required?: boolean;
  oninput?: (e: Event) => void;
  onchange?: (value: unknown) => void;
  ref?: (el: HTMLElement) => void;
  'aria-label'?: string;
  class?: string;
  [key: string]: unknown;
}

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
export const Input = component<InputProps>((props: InputProps = {} as InputProps) => {
  injectBase();

  const {
    type = 'text', placeholder, value, disabled, readonly,
    prefix, suffix, error, success, loading, variant, size,
    label, help, required, oninput, onchange, ref,
    'aria-label': ariaLabel, class: cls
  } = props;

  const inputProps = { class: 'd-input', type };
  // @ts-expect-error -- strict-mode fix (auto)
  if (placeholder) inputProps.placeholder = placeholder;
  // @ts-expect-error -- strict-mode fix (auto)
  if (readonly && typeof readonly !== 'function') inputProps.readonly = '';
  // @ts-expect-error -- strict-mode fix (auto)
  if (oninput) inputProps.oninput = oninput;
  // @ts-expect-error -- strict-mode fix (auto)
  if (onchange) inputProps.onchange = onchange;
  // @ts-expect-error -- strict-mode fix (auto)
  if (ariaLabel) inputProps['aria-label'] = ariaLabel;
  // @ts-expect-error -- strict-mode fix (auto)
  if (required) { inputProps.required = ''; inputProps['aria-required'] = 'true'; }

  const inputEl = inputTag(inputProps);
  if (ref) ref(inputEl);

  // Reactive value
  if (typeof value === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { inputEl.value = value(); });
  } else if (value !== undefined) {
    // @ts-expect-error -- strict-mode fix (auto)
    inputEl.value = value;
  }

  // Reactive disabled on the input itself
  if (typeof disabled === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { inputEl.disabled = disabled(); });
  } else if (disabled) {
    // @ts-expect-error -- strict-mode fix (auto)
    inputEl.disabled = true;
  }

  // Reactive readonly
  if (typeof readonly === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { inputEl.readOnly = readonly(); });
  }

  const children = [];
  if (prefix) children.push(span({ class: 'd-input-prefix' }, prefix));
  children.push(inputEl);
  if (suffix) children.push(span({ class: 'd-input-suffix' }, suffix));

  const wrap = div({ class: cx('d-input-wrap', cls) }, ...children);

  // Apply .d-field state
  // @ts-expect-error -- strict-mode fix (auto)
  applyFieldState(wrap, { error, success, disabled, readonly, loading, variant, size });

  // createFormField wrapper if label/help provided
  if (label || help) {
    // @ts-expect-error -- strict-mode fix (auto)
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
