/**
 * InputOTP — One-time password input with individual digit slots.
 *
 * @module decantr/components/input-otp
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number} [props.length=6] - Number of digits
 * @param {string|Function} [props.value]
 * @param {boolean} [props.masked=false] - Show dots instead of digits
 * @param {number} [props.separator] - Insert separator after N digits (e.g. 3 for XXX-XXX)
 * @param {Function} [props.onComplete] - Called with full value when all slots filled
 * @param {Function} [props.onchange]
 * @param {boolean} [props.disabled]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function InputOTP(props = {}) {
  injectBase();
  const { length = 6, value, masked = false, separator, onComplete, onchange, disabled, class: cls } = props;

  const container = h('div', { class: cx('d-otp', cls), role: 'group', 'aria-label': 'One-time password' });
  const slots = [];

  function getValue() {
    return slots.map(s => s.value).join('');
  }

  function focusSlot(idx) {
    if (idx >= 0 && idx < slots.length) slots[idx].focus();
  }

  for (let i = 0; i < length; i++) {
    if (separator && i > 0 && i % separator === 0) {
      container.appendChild(h('span', { class: 'd-otp-separator' }, '\u2013'));
    }

    const slot = h('input', {
      type: masked ? 'password' : 'text',
      inputmode: 'numeric',
      maxlength: '1',
      class: 'd-otp-slot',
      'aria-label': `Digit ${i + 1}`,
      autocomplete: 'one-time-code',
      disabled: disabled ? '' : undefined
    });

    slot.addEventListener('input', (e) => {
      const val = slot.value.replace(/\D/g, '');
      slot.value = val.slice(0, 1);
      if (val && i < length - 1) focusSlot(i + 1);

      const full = getValue();
      if (onchange) onchange(full);
      if (full.length === length && onComplete) onComplete(full);
    });

    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!slot.value && i > 0) { e.preventDefault(); slots[i - 1].value = ''; focusSlot(i - 1); }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); focusSlot(i - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); focusSlot(i + 1);
      }
    });

    slot.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      for (let j = 0; j < Math.min(text.length, length - i); j++) {
        slots[i + j].value = text[j];
      }
      focusSlot(Math.min(i + text.length, length - 1));
      const full = getValue();
      if (onchange) onchange(full);
      if (full.length === length && onComplete) onComplete(full);
    });

    slot.addEventListener('focus', () => slot.select());

    slots.push(slot);
    container.appendChild(slot);
  }

  // Set initial value
  const initVal = typeof value === 'function' ? value() : (value || '');
  for (let i = 0; i < Math.min(initVal.length, length); i++) {
    slots[i].value = initVal[i];
  }

  return container;
}
