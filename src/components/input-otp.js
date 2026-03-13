/**
 * InputOTP — One-time password input with individual digit slots.
 *
 * @module decantr/components/input-otp
 */
import { createEffect } from '../state/index.js';
import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';

const { div, input: inputTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {number} [props.length=6]
 * @param {string|Function} [props.value]
 * @param {boolean} [props.masked=false]
 * @param {number} [props.separator]
 * @param {Function} [props.onComplete]
 * @param {Function} [props.onchange]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.size] - sm|lg
 * @param {string} [props.variant] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function InputOTP(props = {}) {
  injectBase();
  const { length = 6, value, masked = false, separator, onComplete, onchange, disabled, error, success, size, variant, label, help, required, 'aria-label': ariaLabel, class: cls } = props;

  const container = div({
    class: cx('d-otp', size && `d-otp-${size}`, cls),
    role: 'group',
    'aria-label': ariaLabel || 'One-time password'
  });
  const slots = [];
  const cleanups = [];

  function getValue() {
    return slots.map(s => s.value).join('');
  }

  function focusSlot(idx) {
    if (idx >= 0 && idx < slots.length) slots[idx].focus();
  }

  for (let i = 0; i < length; i++) {
    if (separator && i > 0 && i % separator === 0) {
      container.appendChild(span({ class: 'd-otp-separator' }, '\u2013'));
    }

    const slotProps = {
      type: masked ? 'password' : 'text',
      inputmode: 'numeric',
      maxlength: '1',
      class: 'd-otp-slot d-field',
      'aria-label': `Digit ${i + 1}`,
      autocomplete: 'one-time-code'
    };

    const slot = inputTag(slotProps);

    const onInput = () => {
      const val = slot.value.replace(/\D/g, '');
      slot.value = val.slice(0, 1);
      if (val && i < length - 1) focusSlot(i + 1);
      const full = getValue();
      if (onchange) onchange(full);
      if (full.length === length && onComplete) onComplete(full);
    };

    const onKeydown = (e) => {
      if (e.key === 'Backspace') {
        if (!slot.value && i > 0) { e.preventDefault(); slots[i - 1].value = ''; focusSlot(i - 1); }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); focusSlot(i - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); focusSlot(i + 1);
      }
    };

    const onPaste = (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      for (let j = 0; j < Math.min(text.length, length - i); j++) {
        slots[i + j].value = text[j];
      }
      focusSlot(Math.min(i + text.length, length - 1));
      const full = getValue();
      if (onchange) onchange(full);
      if (full.length === length && onComplete) onComplete(full);
    };

    const onFocus = () => slot.select();

    slot.addEventListener('input', onInput);
    slot.addEventListener('keydown', onKeydown);
    slot.addEventListener('paste', onPaste);
    slot.addEventListener('focus', onFocus);

    cleanups.push(() => {
      slot.removeEventListener('input', onInput);
      slot.removeEventListener('keydown', onKeydown);
      slot.removeEventListener('paste', onPaste);
      slot.removeEventListener('focus', onFocus);
    });

    slots.push(slot);
    container.appendChild(slot);
  }

  // Set initial value
  const initVal = typeof value === 'function' ? value() : (value || '');
  for (let i = 0; i < Math.min(initVal.length, length); i++) {
    slots[i].value = initVal[i];
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      const v = value() || '';
      for (let i = 0; i < length; i++) {
        slots[i].value = v[i] || '';
      }
    });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      slots.forEach(s => { s.disabled = v; });
    });
  } else if (disabled) {
    slots.forEach(s => { s.disabled = true; });
  }

  // Reactive error
  if (typeof error === 'function') {
    createEffect(() => {
      const v = error();
      if (v) container.setAttribute('data-error', ''); else container.removeAttribute('data-error');
      container.setAttribute('aria-invalid', v ? 'true' : 'false');
      slots.forEach(s => { if (v) s.setAttribute('data-error', ''); else s.removeAttribute('data-error'); });
    });
  } else if (error) {
    container.setAttribute('data-error', '');
    container.setAttribute('aria-invalid', 'true');
    slots.forEach(s => { s.setAttribute('data-error', ''); });
  }

  // Success state on container (for createFormField cascade)
  if (typeof success === 'function') {
    createEffect(() => {
      const v = success();
      if (v) container.setAttribute('data-success', typeof v === 'string' ? v : '');
      else container.removeAttribute('data-success');
    });
  } else if (success) {
    container.setAttribute('data-success', typeof success === 'string' ? success : '');
  }

  onDestroy(() => cleanups.forEach(fn => fn()));

  if (label || help) {
    const { wrapper } = createFormField(container, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return container;
}
