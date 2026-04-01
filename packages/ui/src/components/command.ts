/**
 * Command — Command palette / spotlight search dialog.
 * Combines search input + filtered list of actions.
 * Uses native <dialog> two-layer pattern, createListbox for keyboard navigation, createFocusTrap.
 *
 * @module decantr/components/command
 */
import { h } from '../runtime/index.js';
import { createSignal, createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox, createFocusTrap } from './_behaviors.js';
import { icon } from './icon.js';

import { component } from '../runtime/component.js';
export interface CommandProps {
  visible?: () => boolean;
  onSelect?: (value: unknown) => void;
  onClose?: () => void;
  placeholder?: string;
  filter?: (...args: unknown[]) => unknown;
  class?: string;
  items?: unknown;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {Function} props.visible - Signal getter for visibility
 * @param {{ label: string, value?: string, icon?: string|Node, group?: string, shortcut?: string, disabled?: boolean, onSelect?: Function }[]} [props.items]
 * @param {Function} [props.onSelect] - Called with selected item
 * @param {Function} [props.onClose]
 * @param {string} [props.placeholder='Type a command or search...']
 * @param {Function} [props.filter] - Custom filter: (item, query) => boolean
 * @param {string} [props.class]
 * @returns {HTMLDialogElement}
 */
export const Command = component<CommandProps>((props: CommandProps = {} as CommandProps) => {
  injectBase();
  const { visible, items = [], onSelect, onClose, placeholder = 'Type a command or search...', filter, class: cls } = props;

  const input = h('input', {
    type: 'text',
    class: 'd-command-input',
    placeholder,
    autocomplete: 'off',
    spellcheck: 'false'
  });

  const searchWrap = h('div', { class: 'd-command-search' },
    h('span', { class: 'd-command-search-icon', 'aria-hidden': 'true' }, icon('search', { size: '1em' })),
    input
  );

  const listEl = h('div', { class: 'd-command-list', role: 'listbox' });
  const emptyEl = h('div', { class: 'd-command-empty', style: { display: 'none' } }, 'No results found.');

  const panel = h('div', { class: cx('d-command-panel', cls) }, searchWrap, listEl, emptyEl);

  const dialog = h('dialog', {
    class: 'd-command',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'Command palette'
  }, panel);

  const trap = createFocusTrap(dialog);

  const listbox = createListbox(listEl, {
    itemSelector: '.d-command-item:not(.d-command-item-disabled)',
    activeClass: 'd-command-item-active',
    orientation: 'vertical',
    onSelect: (el) => {
      const idx = parseInt(el.dataset.index, 10);
      const item = _filteredItems[idx];
      if (item) {
        if (item.onSelect) item.onSelect(item);
        if (onSelect) onSelect(item);
        close();
      }
    }
  });

  let _filteredItems = [];

  const defaultFilter = (item, query) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return item.label.toLowerCase().includes(q) || (item.value && item.value.toLowerCase().includes(q));
  };

  function renderItems(query) {
    const filterFn = filter || defaultFilter;
    _filteredItems = items.filter(item => filterFn(item, query));

    listEl.replaceChildren();
    let currentGroup = null;

    _filteredItems.forEach((item, i) => {
      if (item.group && item.group !== currentGroup) {
        currentGroup = item.group;
        listEl.appendChild(h('div', { class: 'd-command-group' }, currentGroup));
      }

      const children = [];
      if (item.icon) {
        children.push(typeof item.icon === 'string'
          ? h('span', { class: 'd-command-item-icon', 'aria-hidden': 'true' }, icon(item.icon, { size: '1em' }))
          : item.icon);
      }
      children.push(h('span', { class: 'd-command-item-label' }, item.label));
      if (item.shortcut) {
        children.push(h('span', { class: 'd-command-item-shortcut' }, item.shortcut));
      }

      const el = h('div', {
        class: cx('d-command-item', item.disabled && 'd-command-item-disabled'),
        role: 'option',
        tabindex: '-1',
        'data-index': String(i)
      }, ...children);

      if (!item.disabled) {
        el.addEventListener('click', () => {
          if (item.onSelect) item.onSelect(item);
          if (onSelect) onSelect(item);
          close();
        });
      }

      listEl.appendChild(el);
    });

    emptyEl.style.display = _filteredItems.length ? 'none' : '';
    listbox.reset();
    if (_filteredItems.length) listbox.highlight(0);
  }

  input.addEventListener('input', () => renderItems(input.value));

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => {
    trap.deactivate();
    input.value = '';
    if (onClose) onClose();
  });

  dialog.addEventListener('cancel', () => {
    if (onClose) onClose();
  });

  // Backdrop click closes
  dialog.addEventListener('click', (e) => {
    const rect = panel.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom) {
      close();
    }
  });

  // Key forwarding: let listbox handle arrows while input has focus
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
      listbox.handleKeydown(e);
    }
  });

  if (typeof visible === 'function') {
    createEffect(() => {
      if (visible()) {
        if (!dialog.open) {
          renderItems('');
          dialog.showModal();
          trap.activate();
          input.focus();
        }
      } else {
        close();
      }
    });
  }

  return dialog;
})
