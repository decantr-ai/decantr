/**
 * MaskedInput — Format-masked text input for phone numbers, credit cards, dates, etc.
 * Mask tokens: # (digit), A (letter), * (alphanumeric), literals pass through.
 *
 * @module decantr/components/masked-input
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface MaskedInputProps {
  mask?: string;
  placeholder?: string;
  value?: string | (() => string);
  disabled?: boolean | (() => boolean);
  readonly?: boolean;
  error?: string;
  onchange?: (value: unknown) => void;
  oncomplete?: (...args: unknown[]) => unknown;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} props.mask - Mask pattern, e.g. '(###) ###-####', '##/##/####', '####-####-####-####'
 * @param {string} [props.placeholder='_'] - Placeholder character shown in unfilled slots
 * @param {string|Function} [props.value] - Current value (unmasked digits/letters)
 * @param {boolean|Function} [props.disabled]
 * @param {boolean} [props.readonly]
 * @param {string} [props.error] - Error state
 * @param {Function} [props.onchange] - Called with unmasked value string
 * @param {Function} [props.oncomplete] - Called with unmasked value when all slots filled
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const MaskedInput = component<MaskedInputProps>((props: MaskedInputProps = {} as MaskedInputProps) => {
  injectBase();
  const {
    mask,
    placeholder: ph = '_',
    value,
    disabled,
    readonly,
    error,
    onchange,
    oncomplete,
    class: cls,
  } = props;

  if (!mask) throw new Error('MaskedInput requires a mask prop');

  // Parse mask into slot descriptors
  const slots: any[] = [];
  for (let i = 0; i < mask.length; i++) {
    const c = mask[i];
    if (c === '#') slots.push({ type: 'digit', index: i });
    else if (c === 'A') slots.push({ type: 'letter', index: i });
    else if (c === '*') slots.push({ type: 'alnum', index: i });
    else slots.push({ type: 'literal', char: c, index: i });
  }

  const editableSlots = slots.filter(s => s.type !== 'literal');
  const totalEditable = editableSlots.length;

  function testChar(slot: any, ch: any) {
    if (slot.type === 'digit') return /\d/.test(ch);
    if (slot.type === 'letter') return /[a-zA-Z]/.test(ch);
    if (slot.type === 'alnum') return /[a-zA-Z0-9]/.test(ch);
    return false;
  }

  function unmasked(display: any) {
    let raw = '';
    for (const s of editableSlots) {
      const ch = display[s.index];
      if (ch && ch !== ph) raw += ch;
    }
    return raw;
  }

  function toDisplay(raw: any) {
    let out = '';
    let rawIdx = 0;
    for (const s of slots) {
      if (s.type === 'literal') {
        out += s.char;
      } else if (rawIdx < raw.length) {
        out += raw[rawIdx++];
      } else {
        out += ph;
      }
    }
    return out;
  }

  function cursorToEditableIndex(pos: any) {
    let count = 0;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].type !== 'literal') {
        if (i >= pos) return count;
        count++;
      }
    }
    return count;
  }

  function editableIndexToCursor(idx: any) {
    let count = 0;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].type !== 'literal') {
        if (count === idx) return i;
        count++;
      }
    }
    // @ts-expect-error -- strict-mode fix (auto)
    return mask.length;
  }

  function nextEditablePos(pos: any) {
    for (let i = pos; i < slots.length; i++) {
      if (slots[i].type !== 'literal') return i;
    }
    return -1;
  }

  function prevEditablePos(pos: any) {
    for (let i = pos; i >= 0; i--) {
      if (slots[i].type !== 'literal') return i;
    }
    return -1;
  }

  // State
  const initRaw = typeof value === 'function' ? value() : (value || '');
  let _display = toDisplay(initRaw);

  const input = h('input', {
    type: 'text',
    class: cx('d-input', 'd-masked-input', error && 'd-input-error', cls),
    value: _display,
    disabled: (typeof disabled === 'function' ? disabled() : disabled) ? '' : undefined,
    readonly: readonly ? '' : undefined,
    'aria-invalid': error ? 'true' : undefined,
  });

  function sync() {
    // @ts-expect-error -- strict-mode fix (auto)
    input.value = _display;
    const raw = unmasked(_display);
    if (onchange) onchange(raw);
    if (raw.length === totalEditable && oncomplete) oncomplete(raw);
  }

  input.addEventListener('focus', () => {
    // On focus, place cursor at first empty slot
    requestAnimationFrame(() => {
      const firstEmpty = _display.indexOf(ph);
      // @ts-expect-error -- strict-mode fix (auto)
      if (firstEmpty >= 0) input.setSelectionRange(firstEmpty, firstEmpty);
    });
  });

  input.addEventListener('keydown', (e) => {
    // @ts-expect-error -- strict-mode fix (auto)
    const pos = input.selectionStart;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const ep = prevEditablePos(pos - 1);
      if (ep >= 0) {
        const chars = _display.split('');
        chars[ep] = ph;
        _display = chars.join('');
        sync();
        // @ts-expect-error -- strict-mode fix (auto)
        input.setSelectionRange(ep, ep);
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      const ep = nextEditablePos(pos);
      if (ep >= 0) {
        const chars = _display.split('');
        chars[ep] = ph;
        _display = chars.join('');
        sync();
        // @ts-expect-error -- strict-mode fix (auto)
        input.setSelectionRange(pos, pos);
      }
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') return; // let browser handle

    // Regular character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const ep = nextEditablePos(pos);
      if (ep >= 0 && testChar(slots[ep], e.key)) {
        const chars = _display.split('');
        chars[ep] = e.key;
        _display = chars.join('');
        sync();
        // Move cursor to next editable position
        const next = nextEditablePos(ep + 1);
        // @ts-expect-error -- strict-mode fix (auto)
        input.setSelectionRange(next >= 0 ? next : ep + 1, next >= 0 ? next : ep + 1);
      }
    }
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    // @ts-expect-error -- strict-mode fix (auto)
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const chars = _display.split('');
    // @ts-expect-error -- strict-mode fix (auto)
    let rawIdx = cursorToEditableIndex(input.selectionStart);

    for (const ch of text) {
      if (rawIdx >= totalEditable) break;
      const slot = editableSlots[rawIdx];
      if (testChar(slot, ch)) {
        chars[slot.index] = ch;
        rawIdx++;
      }
    }

    _display = chars.join('');
    sync();
    const nextPos = editableIndexToCursor(rawIdx);
    // @ts-expect-error -- strict-mode fix (auto)
    input.setSelectionRange(nextPos, nextPos);
  });

  // Prevent default input behavior (we handle everything via keydown)
  input.addEventListener('input', (e) => {
    // Reset to our controlled state in case browser modified value
    // @ts-expect-error -- strict-mode fix (auto)
    input.value = _display;
  });

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      _display = toDisplay(value());
      // @ts-expect-error -- strict-mode fix (auto)
      input.value = _display;
    });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { input.disabled = !!disabled(); });
  }

  return input;
})
