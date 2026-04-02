/**
 * Mentions — Textarea with @mention autocomplete dropdown.
 * Uses createFieldOverlay + createListbox behaviors.
 *
 * @module decantr/components/mentions
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox, createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface MentionsProps {
  prefix?: string;
  value?: string | (() => string);
  placeholder?: string;
  rows?: number;
  disabled?: boolean | (() => boolean);
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  required?: boolean;
  onchange?: (value: unknown) => void;
  onSelect?: (value: unknown) => void;
  class?: string;
  options?: unknown;
  [key: string]: unknown;
}

const { div, textarea: textareaTag } = tags;

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string }[]} [props.options]
 * @param {string} [props.prefix='@']
 * @param {string|Function} [props.value]
 * @param {string} [props.placeholder]
 * @param {number} [props.rows=3]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {Function} [props.onchange]
 * @param {Function} [props.onSelect]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Mentions = component<MentionsProps>((props: MentionsProps = {} as MentionsProps) => {
  injectBase();
  const {
    options = [], prefix = '@', value, placeholder, rows = 3,
    disabled, error, success, variant, size, label, help, required,
    onchange, onSelect, class: cls
  } = props;

  let mentionStart = -1;
  let mentionQuery = '';

  const textarea = textareaTag({
    class: 'd-textarea',
    placeholder,
    rows: String(rows)
  });

  // @ts-expect-error -- strict-mode fix (auto)
  if (typeof value === 'function') textarea.value = value();
  // @ts-expect-error -- strict-mode fix (auto)
  else if (value) textarea.value = value;

  // Reactive disabled
  if (typeof disabled === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { textarea.disabled = disabled(); });
  } else if (disabled) {
    // @ts-expect-error -- strict-mode fix (auto)
    textarea.disabled = true;
  }

  const dropdown = div({ class: 'd-mentions-dropdown', role: 'listbox' });

  const textWrap = div({ class: 'd-textarea-wrap' }, textarea);
  const wrap = div({ class: cx('d-mentions', cls) }, textWrap, dropdown);

  // @ts-expect-error -- strict-mode fix (auto)
  applyFieldState(textWrap, { error, success, disabled, variant, size });

  const overlay = createFieldOverlay(textWrap, dropdown, {
    matchWidth: true,
    onClose: () => {
      mentionStart = -1;
      mentionQuery = '';
    }
  });

  const listbox = createListbox(dropdown, {
    itemSelector: '.d-mentions-option',
    activeClass: 'd-option-active',
    orientation: 'vertical',
    onSelect: (el) => {
      // @ts-expect-error -- strict-mode fix (auto)
      const val = el.dataset.value;
      insertMention(val);
    }
  });

  function showDropdown(filtered: any) {
    dropdown.replaceChildren();
    if (!filtered.length) { overlay.close(); return; }

    filtered.forEach((opt: any) => {
      const el = div({
        class: 'd-mentions-option',
        role: 'option',
        'data-value': opt.value
      }, opt.label);
      el.addEventListener('click', () => insertMention(opt.value));
      dropdown.appendChild(el);
    });

    if (!overlay.isOpen()) overlay.open();
    listbox.highlight(0);
  }

  function insertMention(val: any) {
    // @ts-expect-error -- strict-mode fix (auto)
    const text = textarea.value;
    const before = text.slice(0, mentionStart);
    // @ts-expect-error -- strict-mode fix (auto)
    const after = text.slice(textarea.selectionStart);
    // @ts-expect-error -- strict-mode fix (auto)
    textarea.value = `${before}${prefix}${val} ${after}`;
    const cursorPos = before.length + prefix.length + val.length + 1;
    // @ts-expect-error -- strict-mode fix (auto)
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
    overlay.close();
    if (onSelect) onSelect(val);
    // @ts-expect-error -- strict-mode fix (auto)
    if (onchange) onchange(textarea.value);
  }

  textarea.addEventListener('input', () => {
    // @ts-expect-error -- strict-mode fix (auto)
    const pos = textarea.selectionStart;
    // @ts-expect-error -- strict-mode fix (auto)
    const text = textarea.value;

    let triggerIdx = -1;
    for (let i = pos - 1; i >= 0; i--) {
      if (text[i] === prefix) { triggerIdx = i; break; }
      if (text[i] === ' ' || text[i] === '\n') break;
    }

    if (triggerIdx >= 0) {
      mentionStart = triggerIdx;
      mentionQuery = text.slice(triggerIdx + prefix.length, pos).toLowerCase();
      // @ts-expect-error -- strict-mode fix (auto)
      const filtered = options.filter((o: any) =>
        o.label.toLowerCase().includes(mentionQuery) || o.value.toLowerCase().includes(mentionQuery)
      );
      showDropdown(filtered);
    } else {
      overlay.close();
    }

    // @ts-expect-error -- strict-mode fix (auto)
    if (onchange) onchange(textarea.value);
  });

  textarea.addEventListener('keydown', (e) => {
    if (overlay.isOpen()) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        listbox.handleKeydown(e);
      } else if (e.key === 'Escape') {
        overlay.close();
      }
    }
  });

  onDestroy(() => {
    overlay.destroy();
    listbox.destroy();
  });

  if (label || help) {
    // @ts-expect-error -- strict-mode fix (auto)
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
