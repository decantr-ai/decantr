/**
 * Menu — Vertical navigation menu with items, groups, submenus, and separators.
 * Shares item structure with Dropdown and ContextMenu.
 * Uses createListbox behavior for keyboard navigation.
 *
 * @module decantr/components/menu
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox, caret } from './_behaviors.js';

/**
 * @typedef {Object} MenuItem
 * @property {string} label
 * @property {string} [value]
 * @property {string|Node} [icon]
 * @property {boolean} [disabled]
 * @property {boolean} [separator] - Render as separator instead
 * @property {string} [group] - Group label
 * @property {MenuItem[]} [children] - Submenu items
 * @property {Function} [onclick]
 */

/**
 * @param {Object} [props]
 * @param {MenuItem[]} [props.items]
 * @param {string|Function} [props.selected] - Selected item value
 * @param {Function} [props.onSelect] - Called with value on selection
 * @param {boolean} [props.collapsed=false] - Icon-only mode
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Menu(props = {}) {
  injectBase();
  const { items = [], selected, onSelect, collapsed = false, class: cls } = props;

  const menu = h('nav', {
    class: cx('d-menu', cls),
    role: 'menu'
  });

  let currentSelected = typeof selected === 'function' ? selected() : selected;

  function renderItem(item) {
    if (item.separator) {
      return h('div', { class: 'd-menu-separator', role: 'separator' });
    }
    if (item.group) {
      const groupEl = h('div', { class: 'd-menu-group-label' }, item.group);
      return groupEl;
    }

    const children = [];
    if (item.icon) {
      const iconEl = typeof item.icon === 'string'
        ? h('span', { class: 'd-menu-item-icon', 'aria-hidden': 'true' }, item.icon)
        : item.icon;
      children.push(iconEl);
    }
    if (!collapsed) {
      children.push(h('span', { class: 'd-menu-item-label' }, item.label));
    }
    if (item.children && item.children.length && !collapsed) {
      children.push(caret('right', { class: 'd-menu-item-arrow' }));
    }

    const isSelected = item.value === currentSelected;
    const el = h('button', {
      type: 'button',
      class: cx('d-menu-item', item.disabled && 'd-menu-item-disabled', isSelected && 'd-menu-item-active'),
      role: 'menuitem',
      'aria-disabled': item.disabled ? 'true' : undefined,
      'aria-label': collapsed ? item.label : undefined,
      tabindex: '-1'
    }, ...children);

    if (!item.disabled) {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.onclick) item.onclick(item.value || item.label);
        if (onSelect) onSelect(item.value || item.label);
      });
    }

    // Submenu handling
    if (item.children && item.children.length) {
      const subWrap = h('div', { style: { position: 'relative' } });
      subWrap.appendChild(el);
      const submenu = h('div', { class: 'd-menu-sub', role: 'menu', style: { display: 'none' } });
      item.children.forEach(child => submenu.appendChild(renderItem(child)));
      subWrap.appendChild(submenu);

      el.addEventListener('mouseenter', () => { submenu.style.display = ''; });
      subWrap.addEventListener('mouseleave', () => { submenu.style.display = 'none'; });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); submenu.style.display = ''; const first = submenu.querySelector('.d-menu-item'); if (first) first.focus(); }
      });
      return subWrap;
    }

    return el;
  }

  function render() {
    menu.replaceChildren();
    items.forEach(item => menu.appendChild(renderItem(item)));

    // Wire up keyboard nav
    createListbox(menu, {
      itemSelector: '.d-menu-item:not(.d-menu-item-disabled)',
      activeClass: 'd-menu-item-highlight',
      orientation: 'vertical',
      onSelect: (el) => el.click()
    });
  }

  render();

  if (typeof selected === 'function') {
    createEffect(() => {
      currentSelected = selected();
      render();
    });
  }

  return menu;
}

/**
 * Menubar — Horizontal menu bar.
 * @param {Object} [props]
 * @param {{ label: string, items: MenuItem[] }[]} [props.menus]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
Menu.Bar = function Menubar(props = {}) {
  injectBase();
  const { menus = [], class: cls } = props;

  const bar = h('div', { class: cx('d-menubar', cls), role: 'menubar' });

  menus.forEach(menuDef => {
    const trigger = h('button', {
      type: 'button',
      class: 'd-menubar-item',
      'aria-haspopup': 'menu',
      'aria-expanded': 'false'
    }, menuDef.label);

    const dropdown = h('div', {
      class: 'd-dropdown-menu',
      role: 'menu',
      popover: 'auto',
      style: { position: 'absolute', top: '100%', left: '0' }
    });

    menuDef.items.forEach(item => {
      if (item.separator) {
        dropdown.appendChild(h('div', { class: 'd-dropdown-separator', role: 'separator' }));
        return;
      }
      const el = h('button', {
        type: 'button',
        class: cx('d-dropdown-item', item.disabled && 'd-dropdown-item-disabled'),
        role: 'menuitem',
        tabindex: '-1'
      }, h('span', { class: 'd-dropdown-item-label' }, item.label));

      if (!item.disabled) {
        el.addEventListener('click', () => {
          dropdown.hidePopover();
          if (item.onclick) item.onclick(item.value || item.label);
        });
      }
      dropdown.appendChild(el);
    });

    const wrap = h('div', { style: { position: 'relative', display: 'inline-flex' } });
    wrap.appendChild(trigger);
    wrap.appendChild(dropdown);

    trigger.addEventListener('click', () => {
      if (dropdown.matches(':popover-open')) dropdown.hidePopover();
      else dropdown.showPopover();
    });

    dropdown.addEventListener('toggle', (e) => {
      trigger.setAttribute('aria-expanded', e.newState === 'open' ? 'true' : 'false');
    });

    bar.appendChild(wrap);
  });

  return bar;
};
