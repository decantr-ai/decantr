/**
 * Switch — Toggle switch with accessible role="switch".
 *
 * @module decantr/components/switch
 */
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface SwitchProps {
  checked?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);
  label?: string;
  error?: boolean | string | (() => boolean | string);
  size?: string;
  name?: string;
  required?: boolean;
  onchange?: (value: unknown) => void;
  ref?: (el: HTMLElement) => void;
  'aria-label'?: string;
  class?: string;
  [key: string]: unknown;
}

const { label: labelTag, input: inputTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.checked]
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.label]
 * @param {boolean|string|Function} [props.error]
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.name] - Form field name
 * @param {boolean} [props.required]
 * @param {Function} [props.onchange]
 * @param {Function} [props.ref] - Called with the input element
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Switch = component<SwitchProps>((props: SwitchProps = {} as SwitchProps) => {
  injectBase();

  const {
    checked,
    disabled,
    label,
    error,
    size,
    name,
    required,
    onchange,
    ref,
    'aria-label': ariaLabel,
    class: cls
  } = props;

  const inputProps = { type: 'checkbox', class: 'd-switch-native', role: 'switch' };
  if (ariaLabel) inputProps['aria-label'] = ariaLabel;
  if (name) inputProps.name = name;
  if (required) inputProps.required = '';

  const input = inputTag(inputProps);
  const track = span({ class: 'd-switch-track' }, span({ class: 'd-switch-thumb' }));
  const wrapper = labelTag({ class: cx('d-switch', size && `d-switch-${size}`, cls) }, input, track);

  if (label) wrapper.appendChild(span({ class: 'd-switch-label' }, label));
  if (onchange) input.addEventListener('change', () => onchange(input.checked));
  if (ref) ref(input);

  // Checked state — always set aria-checked
  if (typeof checked === 'function') {
    createEffect(() => {
      input.checked = checked();
      input.setAttribute('aria-checked', String(input.checked));
    });
  } else {
    input.checked = !!checked;
    input.setAttribute('aria-checked', String(!!checked));
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      input.disabled = v;
      if (v) wrapper.setAttribute('data-disabled', '');
      else wrapper.removeAttribute('data-disabled');
    });
  } else if (disabled) {
    input.disabled = true;
    wrapper.setAttribute('data-disabled', '');
  }

  // Reactive error
  if (typeof error === 'function') {
    createEffect(() => {
      const v = error();
      if (v) wrapper.setAttribute('data-error', '');
      else wrapper.removeAttribute('data-error');
      input.setAttribute('aria-invalid', v ? 'true' : 'false');
    });
  } else if (error) {
    wrapper.setAttribute('data-error', '');
    input.setAttribute('aria-invalid', 'true');
  }

  return wrapper;
})
