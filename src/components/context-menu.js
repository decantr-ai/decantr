/**
 * ContextMenu — Right-click menu overlay.
 * Shares item rendering with Dropdown/Menu.
 * Uses createListbox behavior for keyboard navigation.
 *
 * @module decantr/components/context-menu
 */
import { h, onDestroy } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {HTMLElement} props.target - Element to attach right-click handler to
 * @param {{ label: string, value?: string, icon?: string|Node, shortcut?: string, disabled?: boolean, separator?: boolean, onclick?: Function }[]} [props.items]
 * @param {Function} [props.onSelect]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ContextMenu(props = {}) {
  injectBase();
  const { target, items = [], onSelect, class: cls } = props;

  let _open = false;

  const menu = h('div', {
    class: cx('d-contextmenu', cls),
    role: 'menu',
    tabindex: '-1'
  });

  function renderItems() {
    menu.replaceChildren();
    items.forEach(item => {
      if (item.separator) {
        menu.appendChild(h('div', { class: 'd-dropdown-separator', role: 'separator' }));
        return;
      }
      const children = [];
      if (item.icon) {
        children.push(typeof item.icon === 'string'
          ? h('span', { class: 'd-dropdown-item-icon', 'aria-hidden': 'true' }, item.icon)
          : item.icon);
      }
      children.push(h('span', { class: 'd-dropdown-item-label' }, item.label));
      if (item.shortcut) {
        children.push(h('span', { class: 'd-dropdown-item-shortcut' }, item.shortcut));
      }

      const el = h('div', {
        class: cx('d-dropdown-item', item.disabled && 'd-dropdown-item-disabled'),
        role: 'menuitem',
        tabindex: '-1'
      }, ...children);

      if (!item.disabled) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          closeMenu();
          if (item.onclick) item.onclick(item.value || item.label);
          if (onSelect) onSelect(item.value || item.label);
        });
      }
      menu.appendChild(el);
    });
  }

  function closeMenu() {
    if (!_open) return;
    _open = false;
    menu.style.display = 'none';
  }

  // Keyboard nav
  const listbox = createListbox(menu, {
    itemSelector: '.d-dropdown-item:not(.d-dropdown-item-disabled)',
    activeClass: 'd-dropdown-item-highlight',
    orientation: 'vertical',
    onSelect: (el) => el.click()
  });

  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Attach to target
  if (target) {
    target.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      renderItems();
      listbox.reset();
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      menu.style.display = '';
      _open = true;
      menu.focus();
    });
  }

  // Outside click to close
  const onDocClick = (e) => {
    if (_open && !menu.contains(e.target)) closeMenu();
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('click', onDocClick);
  }

  // Append to body for proper z-index stacking
  if (typeof document !== 'undefined') {
    document.body.appendChild(menu);
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', onDocClick);
    }
    listbox.destroy();
    if (menu.parentNode) menu.parentNode.removeChild(menu);
  });

  return menu;
}
