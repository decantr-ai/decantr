/**
 * Cascader — Multi-level selection dropdown.
 * Each column shows children of the selected parent.
 * Uses createFieldOverlay + createListbox.
 *
 * @module decantr/components/cascader
 */
import { onDestroy } from '../runtime/index.js';
import { createSignal, createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface CascaderProps {
  options?: CascaderOption[];
  value?: string[];
  onChange?: (...args: unknown[]) => unknown;
  placeholder?: string;
  disabled?: boolean | (() => boolean);
  clearable?: boolean;
  separator?: string;
  expandTrigger?: 'click'|'hover';
  searchable?: boolean;
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  required?: boolean;
  class?: string;
  [key: string]: unknown;
}

const { div, input: inputTag, button: buttonTag, span } = tags;

/**
 * @typedef {Object} CascaderOption
 * @property {string} label
 * @property {string} value
 * @property {CascaderOption[]} [children]
 * @property {boolean} [disabled]
 */

/**
 * @param {Object} [props]
 * @param {CascaderOption[]} [props.options]
 * @param {string[]} [props.value]
 * @param {Function} [props.onChange]
 * @param {string} [props.placeholder='Select']
 * @param {boolean|Function} [props.disabled]
 * @param {boolean} [props.clearable=true]
 * @param {string} [props.separator=' / ']
 * @param {'click'|'hover'} [props.expandTrigger='click']
 * @param {boolean} [props.searchable=false]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Cascader = component<CascaderProps>((props: CascaderProps = {} as CascaderProps) => {
  injectBase();
  const {
    options = [], value, onChange, placeholder = 'Select', disabled = false,
    clearable = true, separator = ' / ', expandTrigger = 'click',
    searchable = false, error, success, variant, size,
    label, help, required, class: cls
  } = props;

  const [selectedPath, setSelectedPath] = createSignal(value || []);
  const [columns, setColumns] = createSignal([options]);

  const clearBtn = span({ class: 'd-cascader-clear', role: 'button', 'aria-label': 'Clear', tabindex: '-1' }, '\u00d7');
  clearBtn.style.display = 'none';

  // Both modes use a div trigger with role=combobox + tabindex.
  // Non-searchable: display span + caret (select-like affordance, no fake <input readonly>).
  // Searchable: real <input> for typing.
  let trigger, displayEl, setDisplayText;

  if (searchable) {
    displayEl = inputTag({
      type: 'text',
      class: 'd-cascader-input',
      placeholder
    });
    setDisplayText = (t) => { displayEl.value = t; };
    trigger = div({
      class: 'd-cascader-trigger',
      role: 'combobox',
      'aria-expanded': 'false',
      'aria-haspopup': 'listbox',
      tabindex: disabled ? undefined : '0'
    }, displayEl, clearBtn);
  } else {
    const displaySpan = span({ class: 'd-cascader-display' });
    const placeholderSpan = span({ class: 'd-cascader-placeholder' }, placeholder);
    displayEl = displaySpan;
    setDisplayText = (t) => {
      displaySpan.textContent = t;
      placeholderSpan.style.display = t ? 'none' : '';
      displaySpan.style.display = t ? '' : 'none';
    };
    trigger = div({
      class: 'd-cascader-trigger',
      role: 'combobox',
      'aria-expanded': 'false',
      'aria-haspopup': 'listbox',
      tabindex: disabled ? undefined : '0'
    }, placeholderSpan, displaySpan, clearBtn, caret('down'));
  }

  const dropdown = div({ class: 'd-cascader-dropdown' });

  const wrap = div({ class: cx('d-cascader', cls) }, trigger, dropdown);

  applyFieldState(wrap, { error, success, disabled, variant, size });

  const overlay = createFieldOverlay(trigger, dropdown, {
    trigger: disabled ? 'manual' : 'click',
    matchWidth: false,
    onOpen: () => {
      wrap.classList.add('d-cascader-open');
      trigger.setAttribute('aria-expanded', 'true');
    },
    onClose: () => {
      wrap.classList.remove('d-cascader-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (searchable) setDisplayText(getDisplayText());
    }
  });

  function getDisplayText() {
    const path = selectedPath();
    if (!path.length) return '';
    const labels = [];
    let current = options;
    for (const val of path) {
      const opt = current.find(o => o.value === val);
      if (!opt) break;
      labels.push(opt.label);
      current = opt.children || [];
    }
    return labels.join(separator);
  }

  function renderColumns() {
    const cols = columns();
    dropdown.replaceChildren();

    cols.forEach((colOptions, colIdx) => {
      const colEl = div({ class: 'd-cascader-column', role: 'listbox' });

      colOptions.forEach(opt => {
        const isSelected = selectedPath()[colIdx] === opt.value;
        const hasChildren = opt.children && opt.children.length > 0;

        const itemEl = div({
          class: cx('d-cascader-option', isSelected && 'd-cascader-option-active', opt.disabled && 'd-cascader-option-disabled'),
          role: 'option',
          'aria-selected': isSelected ? 'true' : 'false',
          tabindex: '-1'
        },
          span({ class: 'd-cascader-option-label' }, opt.label),
          hasChildren ? caret('right', { class: 'd-cascader-option-arrow' }) : null
        );

        if (!opt.disabled) {
          const selectItem = () => {
            const newPath = selectedPath().slice(0, colIdx);
            newPath[colIdx] = opt.value;

            if (hasChildren) {
              const newCols = cols.slice(0, colIdx + 1);
              newCols.push(opt.children);
              setColumns(newCols);
              setSelectedPath(newPath);
            } else {
              setSelectedPath(newPath);
              setColumns([options]);
              setDisplayText(getDisplayText());
              overlay.close();
              if (onChange) {
                const selectedOpts = [];
                let cur = options;
                for (const v of newPath) {
                  const o = cur.find(x => x.value === v);
                  if (o) { selectedOpts.push(o); cur = o.children || []; }
                }
                onChange(newPath, selectedOpts);
              }
            }
            renderColumns();
          };

          if (expandTrigger === 'hover' && hasChildren) {
            itemEl.addEventListener('mouseenter', selectItem);
          }
          itemEl.addEventListener('click', selectItem);
        }

        colEl.appendChild(itemEl);
      });

      dropdown.appendChild(colEl);
    });
  }

  // Clear
  if (clearable) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedPath([]);
      setColumns([options]);
      setDisplayText('');
      clearBtn.style.display = 'none';
      if (onChange) onChange([], []);
    });
  }

  // Search filtering (only available in searchable mode with input trigger)
  if (searchable) {
    displayEl.addEventListener('input', () => {
      const q = displayEl.value.toLowerCase();
      if (!q) { setColumns([options]); renderColumns(); return; }

      const flat = [];
      function walk(opts, path, labels) {
        opts.forEach(o => {
          const newPath = [...path, o.value];
          const newLabels = [...labels, o.label];
          if (o.children && o.children.length) walk(o.children, newPath, newLabels);
          else flat.push({ label: newLabels.join(separator), value: newPath, option: o });
        });
      }
      walk(options, [], []);

      const filtered = flat.filter(f => f.label.toLowerCase().includes(q));
      const searchCol = filtered.map(f => ({
        label: f.label, value: f.value.join(','), children: null, _path: f.value
      }));

      setColumns([searchCol]);
      renderColumns();
    });
  }

  // Sync display
  createEffect(() => {
    const path = selectedPath();
    setDisplayText(getDisplayText());
    clearBtn.style.display = (clearable && path.length) ? '' : 'none';
  });

  createEffect(() => { renderColumns(); });

  onDestroy(() => { overlay.destroy(); });

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      trigger.setAttribute('tabindex', v ? '' : '0');
      if (searchable) displayEl.disabled = v;
    });
  } else if (disabled && searchable) {
    displayEl.disabled = true;
  }

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
