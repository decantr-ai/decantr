/**
 * InputNumber — Numeric input with increment/decrement buttons.
 *
 * @module decantr/components/input-number
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx, reactiveAttr } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value]
 * @param {number} [props.min=-Infinity]
 * @param {number} [props.max=Infinity]
 * @param {number} [props.step=1]
 * @param {number} [props.precision] - Decimal places
 * @param {boolean|Function} [props.disabled]
 * @param {boolean} [props.controls=true] - Show +/- buttons
 * @param {string} [props.placeholder]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function InputNumber(props = {}) {
  injectBase();
  const { value, min = -Infinity, max = Infinity, step = 1, precision, disabled, controls = true, placeholder, onchange, class: cls, ...rest } = props;

  let current = typeof value === 'function' ? value() : (value ?? 0);

  const input = h('input', {
    type: 'text',
    inputmode: 'decimal',
    class: 'd-inputnumber-input',
    placeholder,
    role: 'spinbutton',
    'aria-valuemin': min === -Infinity ? undefined : String(min),
    'aria-valuemax': max === Infinity ? undefined : String(max),
    'aria-valuenow': String(current),
    ...rest
  });

  function format(n) {
    return precision !== undefined ? n.toFixed(precision) : String(n);
  }

  function clamp(n) {
    return Math.max(min, Math.min(max, n));
  }

  function setValue(n) {
    current = clamp(n);
    input.value = format(current);
    input.setAttribute('aria-valuenow', String(current));
    updateStepState();
    if (onchange) onchange(current);
  }

  function updateStepState() {
    if (decBtn) { current <= min ? decBtn.setAttribute('disabled', '') : decBtn.removeAttribute('disabled'); }
    if (incBtn) { current >= max ? incBtn.setAttribute('disabled', '') : incBtn.removeAttribute('disabled'); }
  }

  input.value = format(current);

  input.addEventListener('change', () => {
    const parsed = parseFloat(input.value);
    if (!isNaN(parsed)) setValue(parsed);
    else input.value = format(current);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); setValue(current + step); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setValue(current - step); }
  });

  let decBtn = null, incBtn = null;
  const wrap = h('div', { class: cx('d-inputnumber', cls) });

  if (controls) {
    decBtn = h('button', { type: 'button', class: 'd-inputnumber-step', 'aria-label': 'Decrease' }, '\u2212');
    incBtn = h('button', { type: 'button', class: 'd-inputnumber-step', 'aria-label': 'Increase' }, '+');
    decBtn.addEventListener('click', () => setValue(current - step));
    incBtn.addEventListener('click', () => setValue(current + step));
    wrap.appendChild(decBtn);
    wrap.appendChild(input);
    wrap.appendChild(incBtn);
    updateStepState();
  } else {
    wrap.appendChild(input);
  }

  reactiveAttr(input, disabled, 'disabled');

  if (typeof value === 'function') {
    createEffect(() => {
      current = value();
      input.value = format(current);
      input.setAttribute('aria-valuenow', String(current));
      updateStepState();
    });
  }

  return wrap;
}
