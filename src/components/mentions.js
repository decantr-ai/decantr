/**
 * Mentions — Textarea with @mention autocomplete dropdown.
 * Uses createOverlay + createListbox behaviors.
 *
 * @module decantr/components/mentions
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string }[]} [props.options] - Mention suggestions
 * @param {string} [props.prefix='@'] - Trigger character
 * @param {string|Function} [props.value]
 * @param {string} [props.placeholder]
 * @param {number} [props.rows=3]
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange]
 * @param {Function} [props.onSelect] - Called with selected mention
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Mentions(props = {}) {
  injectBase();
  const { options = [], prefix = '@', value, placeholder, rows = 3, disabled, onchange, onSelect, class: cls } = props;

  let mentionStart = -1;
  let mentionQuery = '';

  const textarea = h('textarea', {
    class: 'd-textarea',
    placeholder,
    rows: String(rows),
    disabled: (typeof disabled === 'function' ? disabled() : disabled) ? '' : undefined
  });

  if (typeof value === 'function') textarea.value = value();
  else if (value) textarea.value = value;

  const dropdown = h('div', {
    class: 'd-mentions-dropdown',
    role: 'listbox',
    style: { display: 'none' }
  });

  const wrap = h('div', { class: cx('d-mentions', cls) });
  const textWrap = h('div', { class: 'd-textarea-wrap' }, textarea);
  wrap.appendChild(textWrap);
  wrap.appendChild(dropdown);

  const listbox = createListbox(dropdown, {
    itemSelector: '.d-mentions-option',
    activeClass: 'd-option-active',
    orientation: 'vertical',
    onSelect: (el) => {
      const val = el.dataset.value;
      insertMention(val);
    }
  });

  function showDropdown(filtered) {
    dropdown.replaceChildren();
    if (!filtered.length) { dropdown.style.display = 'none'; return; }

    filtered.forEach(opt => {
      const el = h('div', {
        class: 'd-mentions-option',
        role: 'option',
        'data-value': opt.value
      }, opt.label);
      el.addEventListener('click', () => insertMention(opt.value));
      dropdown.appendChild(el);
    });

    dropdown.style.display = '';
    listbox.highlight(0);
  }

  function hideDropdown() {
    dropdown.style.display = 'none';
    mentionStart = -1;
    mentionQuery = '';
  }

  function insertMention(val) {
    const text = textarea.value;
    const before = text.slice(0, mentionStart);
    const after = text.slice(textarea.selectionStart);
    textarea.value = `${before}${prefix}${val} ${after}`;
    const cursorPos = before.length + prefix.length + val.length + 1;
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();
    hideDropdown();
    if (onSelect) onSelect(val);
    if (onchange) onchange(textarea.value);
  }

  textarea.addEventListener('input', () => {
    const pos = textarea.selectionStart;
    const text = textarea.value;

    // Find mention trigger
    let triggerIdx = -1;
    for (let i = pos - 1; i >= 0; i--) {
      if (text[i] === prefix) { triggerIdx = i; break; }
      if (text[i] === ' ' || text[i] === '\n') break;
    }

    if (triggerIdx >= 0) {
      mentionStart = triggerIdx;
      mentionQuery = text.slice(triggerIdx + prefix.length, pos).toLowerCase();
      const filtered = options.filter(o =>
        o.label.toLowerCase().includes(mentionQuery) || o.value.toLowerCase().includes(mentionQuery)
      );
      showDropdown(filtered);
    } else {
      hideDropdown();
    }

    if (onchange) onchange(textarea.value);
  });

  textarea.addEventListener('keydown', (e) => {
    if (dropdown.style.display !== 'none') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        listbox.handleKeydown(e);
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    }
  });

  textarea.addEventListener('blur', () => {
    setTimeout(hideDropdown, 150);
  });

  return wrap;
}
