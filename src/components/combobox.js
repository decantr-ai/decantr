import { h, onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { caret } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string, disabled?: boolean }[]} [props.options]
 * @param {string|Function} [props.value] — Selected value
 * @param {string} [props.placeholder]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|Function} [props.error]
 * @param {Function} [props.onchange] — Called with selected value
 * @param {Function} [props.onfilter] — Custom filter function(query, options) → options[]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Combobox(props = {}) {
  injectBase();

  const {
    options = [],
    value,
    placeholder = 'Search...',
    disabled,
    error,
    onchange,
    onfilter,
    class: cls
  } = props;

  let open = false;
  let activeIndex = -1;
  let currentValue = typeof value === 'function' ? value() : (value || '');
  let filtered = [...options];

  const input = h('input', {
    type: 'text',
    class: 'd-combobox-input',
    placeholder,
    role: 'combobox',
    autocomplete: 'off',
    'aria-expanded': 'false',
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list'
  });

  const arrow = caret('down', { class: 'd-combobox-arrow' });
  const inputWrap = h('div', { class: 'd-combobox-input-wrap' }, input, arrow);

  const listbox = h('div', { class: 'd-combobox-listbox', role: 'listbox' });
  listbox.style.display = 'none';

  const wrap = h('div', { class: cx('d-combobox', cls) }, inputWrap, listbox);

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
    listbox.replaceChildren();
    if (filtered.length === 0) {
      listbox.appendChild(h('div', { class: 'd-combobox-empty' }, 'No results'));
      return;
    }
    filtered.forEach((opt, i) => {
      const el = h('div', {
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
      listbox.appendChild(el);
    });
  }

  function selectOption(val) {
    currentValue = val;
    updateDisplay();
    closeList();
    if (onchange) onchange(val);
  }

  function openList() {
    if (open) return;
    open = true;
    filterOptions(input.value);
    renderList();
    listbox.style.display = '';
    input.setAttribute('aria-expanded', 'true');
    wrap.classList.add('d-combobox-open');
  }

  function closeList() {
    if (!open) return;
    open = false;
    activeIndex = -1;
    listbox.style.display = 'none';
    input.setAttribute('aria-expanded', 'false');
    wrap.classList.remove('d-combobox-open');
  }

  function highlightOption(idx) {
    const items = listbox.querySelectorAll('.d-combobox-option:not(.d-combobox-option-disabled)');
    items.forEach((el, i) => el.classList.toggle('d-combobox-option-highlight', i === idx));
    activeIndex = idx;
  }

  input.addEventListener('focus', openList);
  input.addEventListener('input', () => {
    if (!open) openList();
    filterOptions(input.value);
    renderList();
    activeIndex = -1;
  });

  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    if (open) closeList();
    else { input.focus(); openList(); }
  });

  input.addEventListener('keydown', (e) => {
    const items = listbox.querySelectorAll('.d-combobox-option:not(.d-combobox-option-disabled)');
    const len = items.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openList();
      highlightOption(activeIndex < len - 1 ? activeIndex + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) openList();
      highlightOption(activeIndex > 0 ? activeIndex - 1 : len - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && activeIndex >= 0 && activeIndex < len) {
        const val = filtered.filter(o => !o.disabled)[activeIndex];
        if (val) selectOption(val.value);
      }
    } else if (e.key === 'Escape') {
      closeList();
      updateDisplay();
    }
  });

  // Click outside
  const onDocClick = (e) => {
    if (open && !wrap.contains(e.target)) {
      closeList();
      updateDisplay();
    }
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('click', onDocClick);
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', onDocClick);
    }
  });

  updateDisplay();

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      currentValue = value();
      updateDisplay();
    });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => { input.disabled = disabled(); });
  } else if (disabled) {
    input.disabled = true;
  }

  // Reactive error
  if (typeof error === 'function') {
    createEffect(() => {
      wrap.className = cx('d-combobox', error() && 'd-combobox-error', cls);
    });
  } else if (error) {
    wrap.classList.add('d-combobox-error');
  }

  return wrap;
}
