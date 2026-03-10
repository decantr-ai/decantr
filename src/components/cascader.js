/**
 * Cascader — Multi-level selection dropdown.
 * Each column shows children of the selected parent.
 * Uses createOverlay for dropdown, keyboard navigation per column.
 *
 * @module decantr/components/cascader
 */
import { h } from '../core/index.js';
import { createSignal, createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay, caret } from './_behaviors.js';

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
 * @param {string[]} [props.value] - Array of selected values (path)
 * @param {Function} [props.onChange] - Called with (selectedValues[], selectedOptions[])
 * @param {string} [props.placeholder='Select']
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.clearable=true]
 * @param {string} [props.separator=' / ']
 * @param {'click'|'hover'} [props.expandTrigger='click']
 * @param {boolean} [props.searchable=false]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Cascader(props = {}) {
  injectBase();
  const {
    options = [], value, onChange, placeholder = 'Select', disabled = false,
    clearable = true, separator = ' / ', expandTrigger = 'click',
    searchable = false, class: cls
  } = props;

  const [selectedPath, setSelectedPath] = createSignal(value || []);
  const [columns, setColumns] = createSignal([options]);

  const displayInput = h('input', {
    type: 'text',
    class: 'd-cascader-input',
    placeholder,
    readonly: !searchable,
    disabled: disabled || undefined
  });

  const clearBtn = h('button', { type: 'button', class: 'd-cascader-clear', 'aria-label': 'Clear', style: { display: 'none' } }, '\u00d7');

  const trigger = h('div', {
    class: cx('d-cascader-trigger', disabled && 'd-cascader-disabled', cls),
    tabindex: disabled ? undefined : '0'
  }, displayInput, clearBtn);

  const dropdown = h('div', {
    class: 'd-cascader-dropdown',
    style: { display: 'none' }
  });

  const wrap = h('div', { class: 'd-cascader' }, trigger, dropdown);

  const overlay = createOverlay(trigger, dropdown, {
    trigger: disabled ? 'manual' : 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen: () => { wrap.classList.add('d-cascader-open'); },
    onClose: () => { wrap.classList.remove('d-cascader-open'); if (searchable) displayInput.value = getDisplayText(); }
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
      const colEl = h('div', { class: 'd-cascader-column', role: 'listbox' });

      colOptions.forEach(opt => {
        const isSelected = selectedPath()[colIdx] === opt.value;
        const hasChildren = opt.children && opt.children.length > 0;

        const itemEl = h('div', {
          class: cx('d-cascader-option', isSelected && 'd-cascader-option-active', opt.disabled && 'd-cascader-option-disabled'),
          role: 'option',
          'aria-selected': isSelected ? 'true' : 'false',
          tabindex: '-1'
        },
          h('span', { class: 'd-cascader-option-label' }, opt.label),
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
              // Leaf: finalize selection
              setSelectedPath(newPath);
              setColumns([options]);
              displayInput.value = getDisplayText();
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
      displayInput.value = '';
      clearBtn.style.display = 'none';
      if (onChange) onChange([], []);
    });
  }

  // Search filtering
  if (searchable) {
    displayInput.removeAttribute('readonly');
    displayInput.addEventListener('input', () => {
      const q = displayInput.value.toLowerCase();
      if (!q) { setColumns([options]); renderColumns(); return; }

      // Flatten and filter
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
    displayInput.value = getDisplayText();
    clearBtn.style.display = (clearable && path.length) ? '' : 'none';
  });

  // Render on open
  createEffect(() => {
    renderColumns();
  });

  return wrap;
}
