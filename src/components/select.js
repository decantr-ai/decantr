import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string, disabled?: boolean }[]} [props.options]
 * @param {string|Function} [props.value]
 * @param {string} [props.placeholder]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|Function} [props.error]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Select(props = {}) {
  injectBase();

  const { options = [], value, placeholder, disabled, error, onchange, class: cls } = props;

  let open = false;
  let activeIndex = -1;
  let currentValue = typeof value === 'function' ? value() : (value || '');

  const wrapClass = cx('d-select-wrap', cls);
  const display = h('span', { class: 'd-select-display' });
  const arrow = h('span', { class: 'd-select-arrow' }, '\u25BE');
  const trigger = h('button', {
    type: 'button',
    class: 'd-select',
    role: 'combobox',
    'aria-expanded': 'false',
    'aria-haspopup': 'listbox'
  }, display, arrow);

  const dropdown = h('div', { class: 'd-select-dropdown', role: 'listbox' });
  dropdown.style.display = 'none';

  const wrap = h('div', { class: wrapClass }, trigger, dropdown);

  function updateDisplay() {
    const opt = options.find(o => o.value === currentValue);
    display.textContent = opt ? opt.label : (placeholder || '');
    if (!opt && placeholder) display.classList.add('d-select-placeholder');
    else display.classList.remove('d-select-placeholder');
  }

  function renderOptions() {
    dropdown.replaceChildren();
    options.forEach((opt, i) => {
      const el = h('div', {
        class: cx('d-select-option', opt.value === currentValue && 'd-select-option-active', opt.disabled && 'd-select-option-disabled'),
        role: 'option',
        'aria-selected': opt.value === currentValue ? 'true' : 'false'
      }, opt.label);
      if (!opt.disabled) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectOption(opt.value);
        });
      }
      dropdown.appendChild(el);
    });
  }

  function selectOption(val) {
    currentValue = val;
    updateDisplay();
    closeDropdown();
    if (onchange) onchange(val);
  }

  function openDropdown() {
    if (open) return;
    open = true;
    activeIndex = options.findIndex(o => o.value === currentValue);
    renderOptions();
    dropdown.style.display = '';
    trigger.setAttribute('aria-expanded', 'true');
    wrap.classList.add('d-select-open');
  }

  function closeDropdown() {
    if (!open) return;
    open = false;
    dropdown.style.display = 'none';
    trigger.setAttribute('aria-expanded', 'false');
    wrap.classList.remove('d-select-open');
  }

  trigger.addEventListener('click', () => {
    if (open) closeDropdown();
    else openDropdown();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openDropdown();
      activeIndex = Math.min(activeIndex + 1, options.length - 1);
      highlightOption();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) openDropdown();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightOption();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && activeIndex >= 0 && !options[activeIndex].disabled) {
        selectOption(options[activeIndex].value);
      } else if (!open) {
        openDropdown();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  function highlightOption() {
    const items = dropdown.children;
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle('d-select-option-highlight', i === activeIndex);
    }
  }

  // Click outside to close
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      if (open && !wrap.contains(e.target)) closeDropdown();
    });
  }

  updateDisplay();

  if (typeof value === 'function') {
    createEffect(() => {
      currentValue = value();
      updateDisplay();
      if (open) renderOptions();
    });
  }

  if (typeof disabled === 'function') {
    createEffect(() => {
      if (disabled()) trigger.setAttribute('disabled', '');
      else trigger.removeAttribute('disabled');
    });
  } else if (disabled) {
    trigger.setAttribute('disabled', '');
  }

  if (typeof error === 'function') {
    createEffect(() => {
      wrap.className = error() ? cx(wrapClass, 'd-select-error') : wrapClass;
    });
  } else if (error) {
    wrap.className = cx(wrapClass, 'd-select-error');
  }

  return wrap;
}
