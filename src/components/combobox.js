import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createListbox, createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay } from './_primitives.js';

const { div, input: inputTag } = tags;

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string, disabled?: boolean }[]} [props.options]
 * @param {string|Function} [props.value]
 * @param {string} [props.placeholder='Search...']
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - 'xs'|'sm'|'lg'
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {Function} [props.onchange]
 * @param {Function} [props.onfilter]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Combobox(props = {}) {
  injectBase();

  const {
    options = [], value, placeholder = 'Search...', disabled, error, success,
    variant, size, label, help, required, onchange, onfilter,
    'aria-label': ariaLabel, class: cls
  } = props;

  let currentValue = typeof value === 'function' ? value() : (value || '');
  let filtered = [...options];

  const input = inputTag({
    type: 'text',
    class: 'd-combobox-input',
    placeholder,
    role: 'combobox',
    autocomplete: 'off',
    'aria-expanded': 'false',
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list',
    'aria-label': ariaLabel
  });

  const arrow = caret('down', { class: 'd-combobox-arrow' });
  const inputWrap = div({ class: 'd-combobox-input-wrap' }, input, arrow);
  const listboxEl = div({ class: 'd-combobox-listbox', role: 'listbox' });

  const wrap = div({ class: cx('d-combobox', cls) }, inputWrap, listboxEl);

  applyFieldState(wrap, { error, success, disabled, variant, size });

  const overlay = createFieldOverlay(inputWrap, listboxEl, {
    onOpen: () => {
      filterOptions(input.value);
      renderList();
      wrap.classList.add('d-combobox-open');
      input.setAttribute('aria-expanded', 'true');
    },
    onClose: () => {
      wrap.classList.remove('d-combobox-open');
      input.setAttribute('aria-expanded', 'false');
    }
  });

  const listbox = createListbox(listboxEl, {
    itemSelector: '.d-combobox-option:not(.d-combobox-option-disabled)',
    activeClass: 'd-combobox-option-highlight',
    orientation: 'vertical',
    onSelect: (el, idx) => {
      const selectableFiltered = filtered.filter(o => !o.disabled);
      if (selectableFiltered[idx]) selectOption(selectableFiltered[idx].value);
    }
  });

  function updateDisplay() {
    const opt = options.find(o => o.value === currentValue);
    input.value = opt ? opt.label : '';
  }

  function filterOptions(query) {
    if (onfilter) {
      filtered = onfilter(query, options);
    } else {
      const q = query.toLowerCase();
      filtered = q ? options.filter(o => o.label.toLowerCase().includes(q)) : [...options];
    }
  }

  function renderList() {
    listboxEl.replaceChildren();
    if (filtered.length === 0) {
      listboxEl.appendChild(div({ class: 'd-combobox-empty' }, 'No results'));
      return;
    }
    filtered.forEach((opt) => {
      const el = div({
        class: cx('d-combobox-option', opt.value === currentValue && 'd-combobox-option-active', opt.disabled && 'd-combobox-option-disabled'),
        role: 'option',
        'aria-selected': opt.value === currentValue ? 'true' : 'false'
      }, opt.label);
      if (!opt.disabled) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectOption(opt.value);
        });
      }
      listboxEl.appendChild(el);
    });
    listbox.reset();
  }

  function selectOption(val) {
    currentValue = val;
    updateDisplay();
    overlay.close();
    if (onchange) onchange(val);
  }

  input.addEventListener('focus', () => {
    if (!overlay.isOpen()) overlay.open();
  });

  input.addEventListener('input', () => {
    if (!overlay.isOpen()) overlay.open();
    filterOptions(input.value);
    renderList();
  });

  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    if (overlay.isOpen()) overlay.close();
    else { input.focus(); overlay.open(); }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!overlay.isOpen()) overlay.open();
      listbox.handleKeydown(e);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (overlay.isOpen()) listbox.selectCurrent();
    } else if (e.key === 'Escape') {
      overlay.close();
      updateDisplay();
    }
  });

  onDestroy(() => {
    overlay.destroy();
    listbox.destroy();
  });

  updateDisplay();

  if (typeof value === 'function') {
    createEffect(() => { currentValue = value(); updateDisplay(); });
  }

  if (typeof disabled === 'function') {
    createEffect(() => { input.disabled = disabled(); });
  } else if (disabled) {
    input.disabled = true;
  }

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
}
