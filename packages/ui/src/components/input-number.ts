/**
 * InputNumber — Numeric input with increment/decrement buttons.
 *
 * @module decantr/components/input-number
 */
import { createEffect } from '../state/index.js';
import { onDestroy } from '../runtime/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { icon } from './icon.js';
import { applyFieldState } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface InputNumberProps {
  value?: number | (() => number);
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean | (() => boolean);
  controls?: boolean;
  placeholder?: string;
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  required?: boolean;
  onchange?: (value: unknown) => void;
  'aria-label'?: string;
  class?: string;
  [key: string]: unknown;
}

const { div, input: inputTag, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value]
 * @param {number} [props.min=-Infinity]
 * @param {number} [props.max=Infinity]
 * @param {number} [props.step=1]
 * @param {number} [props.precision]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean} [props.controls=true]
 * @param {string} [props.placeholder]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {Function} [props.onchange]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const InputNumber = component<InputNumberProps>((props: InputNumberProps = {} as InputNumberProps) => {
  injectBase();
  const {
    value, min = -Infinity, max = Infinity, step = 1, precision,
    disabled, controls = true, placeholder, error, success,
    variant, size, label, help, required, onchange,
    'aria-label': ariaLabel, class: cls
  } = props;

  let current = typeof value === 'function' ? value() : (value ?? 0);
  let _disabled = typeof disabled === 'function' ? disabled() : !!disabled;

  const input = inputTag({
    type: 'text',
    inputmode: 'decimal',
    class: 'd-inputnumber-input',
    placeholder,
    role: 'spinbutton',
    'aria-valuemin': min === -Infinity ? undefined : String(min),
    'aria-valuemax': max === Infinity ? undefined : String(max),
    'aria-valuenow': String(current),
    'aria-label': ariaLabel
  });

  function format(n) {
    return precision !== undefined ? n.toFixed(precision) : String(n);
  }

  function clamp(n) {
    return Math.max(min, Math.min(max, n));
  }

  let decBtn = null, incBtn = null;

  function setValue(n) {
    current = clamp(n);
    input.value = format(current);
    input.setAttribute('aria-valuenow', String(current));
    updateStepState();
    if (onchange) onchange(current);
  }

  function updateStepState() {
    if (decBtn) { (_disabled || current <= min) ? decBtn.setAttribute('disabled', '') : decBtn.removeAttribute('disabled'); }
    if (incBtn) { (_disabled || current >= max) ? incBtn.setAttribute('disabled', '') : incBtn.removeAttribute('disabled'); }
  }

  input.value = format(current);

  function handleChange() {
    const parsed = parseFloat(input.value);
    if (!isNaN(parsed)) setValue(parsed);
    else input.value = format(current);
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowUp') { e.preventDefault(); setValue(current + step); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setValue(current - step); }
  }

  function handleDec() { setValue(current - step); }
  function handleInc() { setValue(current + step); }

  input.addEventListener('change', handleChange);
  input.addEventListener('keydown', handleKeydown);

  const wrap = div({ class: cx('d-inputnumber', cls) });

  if (controls) {
    decBtn = buttonTag({ type: 'button', class: 'd-inputnumber-step', 'aria-label': 'Decrease' }, icon('minus', { size: '1em' }));
    incBtn = buttonTag({ type: 'button', class: 'd-inputnumber-step', 'aria-label': 'Increase' }, icon('plus', { size: '1em' }));
    decBtn.addEventListener('click', handleDec);
    incBtn.addEventListener('click', handleInc);
    wrap.appendChild(decBtn);
    wrap.appendChild(input);
    wrap.appendChild(incBtn);
    updateStepState();
  } else {
    wrap.appendChild(input);
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      _disabled = disabled();
      input.disabled = _disabled;
      updateStepState();
    });
  } else if (disabled) {
    input.disabled = true;
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      current = value();
      input.value = format(current);
      input.setAttribute('aria-valuenow', String(current));
      updateStepState();
    });
  }

  onDestroy(() => {
    input.removeEventListener('change', handleChange);
    input.removeEventListener('keydown', handleKeydown);
    if (decBtn) decBtn.removeEventListener('click', handleDec);
    if (incBtn) incBtn.removeEventListener('click', handleInc);
  });

  applyFieldState(wrap, { error, success, disabled, variant, size });

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
