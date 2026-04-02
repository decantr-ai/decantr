import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { applyFieldState } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface TextareaProps {
  placeholder?: string;
  value?: string | (() => string);
  disabled?: boolean | (() => boolean);
  readonly?: boolean | (() => boolean);
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  rows?: number;
  resize?: string;
  label?: string;
  help?: string;
  required?: boolean;
  oninput?: (e: Event) => void;
  ref?: (el: HTMLElement) => void;
  'aria-label'?: string;
  class?: string;
  [key: string]: unknown;
}

const { div, textarea: textareaTag } = tags;

/**
 * @param {Object} [props]
 * @param {string} [props.placeholder]
 * @param {string|Function} [props.value]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|Function} [props.readonly]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {number} [props.rows=3]
 * @param {string} [props.resize='vertical'] - 'none'|'vertical'|'horizontal'|'both'
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {Function} [props.oninput]
 * @param {Function} [props.ref]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Textarea = component<TextareaProps>((props: TextareaProps = {} as TextareaProps) => {
  injectBase();

  const {
    placeholder, value, disabled, readonly, error, success,
    variant, size, rows = 3, resize = 'vertical',
    label, help, required, oninput, ref,
    'aria-label': ariaLabel, class: cls
  } = props;

  const textareaProps = { class: 'd-textarea', rows };
  // @ts-expect-error -- strict-mode fix (auto)
  if (placeholder) textareaProps.placeholder = placeholder;
  // @ts-expect-error -- strict-mode fix (auto)
  if (readonly && typeof readonly !== 'function') textareaProps.readonly = '';
  // @ts-expect-error -- strict-mode fix (auto)
  if (oninput) textareaProps.oninput = oninput;
  // @ts-expect-error -- strict-mode fix (auto)
  if (ariaLabel) textareaProps['aria-label'] = ariaLabel;
  // @ts-expect-error -- strict-mode fix (auto)
  if (required) textareaProps.required = '';

  const textareaEl = textareaTag(textareaProps);
  // resize is runtime-derived from prop
  textareaEl.style.resize = resize;

  if (ref) ref(textareaEl);

  // Reactive value
  if (typeof value === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { textareaEl.value = value(); });
  } else if (value !== undefined) {
    // @ts-expect-error -- strict-mode fix (auto)
    textareaEl.value = value;
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { textareaEl.disabled = disabled(); });
  } else if (disabled) {
    // @ts-expect-error -- strict-mode fix (auto)
    textareaEl.disabled = true;
  }

  // Reactive readonly
  if (typeof readonly === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { textareaEl.readOnly = readonly(); });
  }

  const wrap = div({ class: cx('d-textarea-wrap', cls) }, textareaEl);

  // @ts-expect-error -- strict-mode fix (auto)
  applyFieldState(wrap, { error, success, disabled, readonly, variant, size });

  if (label || help) {
    // @ts-expect-error -- strict-mode fix (auto)
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
