/**
 * Transfer — Dual-list transfer component with search and selection.
 *
 * @module decantr/components/transfer
 */
import { h } from '../core/index.js';
import { createEffect, createSignal } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ key: string, label: string, disabled?: boolean }[]} [props.dataSource=[]]
 * @param {string[]} [props.targetKeys=[]] - Keys in right panel
 * @param {boolean} [props.searchable=false]
 * @param {string[]} [props.titles=['Source', 'Target']]
 * @param {Function} [props.onchange] - Called with (targetKeys, direction, movedKeys)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Transfer(props = {}) {
  injectBase();
  const { dataSource = [], targetKeys: initTarget = [], searchable = false, titles = ['Source', 'Target'], onchange, class: cls } = props;

  let targetKeys = [...initTarget];
  let leftChecked = new Set();
  let rightChecked = new Set();

  const container = h('div', { class: cx('d-transfer', cls) });

  function getLeftItems() {
    return dataSource.filter(d => !targetKeys.includes(d.key));
  }

  function getRightItems() {
    return dataSource.filter(d => targetKeys.includes(d.key));
  }

  function renderPanel(items, checked, searchFilter, title) {
    const panel = h('div', { class: 'd-transfer-panel' });

    // Header
    const allChecked = items.length > 0 && items.filter(i => !i.disabled).every(i => checked.has(i.key));
    const selectAll = h('input', { type: 'checkbox' });
    selectAll.checked = allChecked;
    selectAll.indeterminate = checked.size > 0 && !allChecked;
    selectAll.addEventListener('change', () => {
      if (selectAll.checked) items.filter(i => !i.disabled).forEach(i => checked.add(i.key));
      else checked.clear();
      render();
    });

    const header = h('div', { class: 'd-transfer-header' },
      h('label', { style: { display: 'flex', alignItems: 'center', gap: 'var(--d-sp-2)', cursor: 'pointer' } },
        selectAll,
        h('span', null, `${checked.size}/${items.length}`)
      ),
      h('span', null, title)
    );
    panel.appendChild(header);

    // Search
    let filteredItems = items;
    if (searchable) {
      const search = h('input', {
        type: 'text',
        class: 'd-input',
        placeholder: 'Search...',
        style: { fontSize: 'var(--d-text-sm)' }
      });
      search.addEventListener('input', () => {
        searchFilter.value = search.value.toLowerCase();
        render();
      });
      panel.appendChild(h('div', { class: 'd-transfer-search' }, search));
      if (searchFilter.value) {
        filteredItems = items.filter(i => i.label.toLowerCase().includes(searchFilter.value));
      }
    }

    // Body
    const body = h('div', { class: 'd-transfer-body' });
    filteredItems.forEach(item => {
      const cb = h('input', { type: 'checkbox', disabled: item.disabled ? '' : undefined });
      cb.checked = checked.has(item.key);
      cb.addEventListener('change', () => {
        if (cb.checked) checked.add(item.key);
        else checked.delete(item.key);
        render();
      });

      const row = h('div', {
        class: cx('d-transfer-item', item.disabled && 'd-transfer-item-disabled')
      }, cb, h('span', null, item.label));

      if (!item.disabled) {
        row.addEventListener('click', (e) => {
          if (e.target === cb) return;
          cb.checked = !cb.checked;
          if (cb.checked) checked.add(item.key);
          else checked.delete(item.key);
          render();
        });
      }

      body.appendChild(row);
    });
    panel.appendChild(body);

    return panel;
  }

  const leftSearch = { value: '' };
  const rightSearch = { value: '' };

  function render() {
    container.replaceChildren();

    const leftItems = getLeftItems();
    const rightItems = getRightItems();

    const leftPanel = renderPanel(leftItems, leftChecked, leftSearch, titles[0]);
    const rightPanel = renderPanel(rightItems, rightChecked, rightSearch, titles[1]);

    // Action buttons
    const moveRight = h('button', {
      type: 'button',
      class: 'd-btn d-btn-sm',
      disabled: leftChecked.size === 0 ? '' : undefined,
      'aria-label': 'Move to target'
    }, '\u203A');
    const moveLeft = h('button', {
      type: 'button',
      class: 'd-btn d-btn-sm',
      disabled: rightChecked.size === 0 ? '' : undefined,
      'aria-label': 'Move to source'
    }, '\u2039');

    moveRight.addEventListener('click', () => {
      const moved = [...leftChecked];
      targetKeys = [...targetKeys, ...moved];
      leftChecked.clear();
      render();
      if (onchange) onchange(targetKeys, 'right', moved);
    });

    moveLeft.addEventListener('click', () => {
      const moved = [...rightChecked];
      targetKeys = targetKeys.filter(k => !rightChecked.has(k));
      rightChecked.clear();
      render();
      if (onchange) onchange(targetKeys, 'left', moved);
    });

    const actions = h('div', { class: 'd-transfer-actions' }, moveRight, moveLeft);

    container.appendChild(leftPanel);
    container.appendChild(actions);
    container.appendChild(rightPanel);
  }

  render();
  return container;
}
