import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createListbox, createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay } from './_primitives.js';

const { div, button: buttonTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string, disabled?: boolean }[]} [props.options]
 * @param {string|Function} [props.value]
 * @param {string} [props.placeholder]
 * @param {boolean|Function} [props.disabled]
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
export function Select(props = {}) {
  injectBase();

  const {
    options = [], value, placeholder, disabled, error, success,
    variant, size, label, help, required, onchange,
    'aria-label': ariaLabel, class: cls
  } = props;

  let currentValue = typeof value === 'function' ? '' : (value || '');

  const display = span({ class: 'd-select-display' });
  const arrow = caret('down', { class: 'd-select-arrow' });
  const triggerProps = {
    type: 'button',
    class: 'd-select',
    role: 'combobox',
    'aria-expanded': 'false',
    'aria-haspopup': 'listbox'
  };
  if (ariaLabel) triggerProps['aria-label'] = ariaLabel;

  const trigger = buttonTag(triggerProps, display, arrow);
  const dropdown = div({ class: 'd-select-dropdown', role: 'listbox' });
  const wrap = div({ class: cx('d-select-wrap', cls) }, trigger, dropdown);

  // Apply .d-field state on wrap
  applyFieldState(wrap, { error, success, disabled, variant, size });

  const overlay = createFieldOverlay(trigger, dropdown, {
    onOpen: () => {
      activeIndex = options.findIndex(o => o.value === currentValue);
      renderOptions();
      wrap.classList.add('d-select-open');
    },
    onClose: () => {
      wrap.classList.remove('d-select-open');
    }
  });

  // Listbox keyboard nav
  const listbox = createListbox(dropdown, {
    itemSelector: '.d-select-option:not(.d-select-option-disabled)',
    activeClass: 'd-select-option-highlight',
    orientation: 'vertical',
    onSelect: (el, idx) => {
      const selectableOpts = options.filter(o => !o.disabled);
      if (selectableOpts[idx]) selectOption(selectableOpts[idx].value);
    }
  });

  let activeIndex = -1;

  function updateDisplay() {
    const opt = options.find(o => o.value === currentValue);
    display.textContent = opt ? opt.label : (placeholder || '');
    if (!opt && placeholder) display.classList.add('d-select-placeholder');
    else display.classList.remove('d-select-placeholder');
  }

  function renderOptions() {
    dropdown.replaceChildren();
    options.forEach((opt) => {
      const el = div({
        class: cx('d-select-option', opt.value === currentValue && 'd-select-option-active', opt.disabled && 'd-select-option-disabled'),
        role: 'option',
        'aria-selected': opt.value === currentValue ? 'true' : 'false'
      }, opt.label);
      if (!opt.disabled) {
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          selectOption(opt.value);
        });
      }
      dropdown.appendChild(el);
    });
    listbox.reset();
  }

  function selectOption(val) {
    currentValue = val;
    updateDisplay();
    overlay.close();
    if (onchange) onchange(val);
  }

  trigger.addEventListener('mousedown', (e) => {
    e.preventDefault();
    overlay.toggle();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!overlay.isOpen()) overlay.open();
      listbox.handleKeydown(e);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (overlay.isOpen()) {
        listbox.selectCurrent();
      } else {
        overlay.open();
      }
    } else if (e.key === 'Escape') {
      overlay.close();
    }
  });

  onDestroy(() => {
    overlay.destroy();
    listbox.destroy();
  });

  updateDisplay();

  if (typeof value === 'function') {
    createEffect(() => {
      currentValue = value();
      updateDisplay();
      if (overlay.isOpen()) renderOptions();
    });
  }

  // Reactive disabled on trigger
  if (typeof disabled === 'function') {
    createEffect(() => { trigger.disabled = disabled(); });
  } else if (disabled) {
    trigger.disabled = true;
  }

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
}
