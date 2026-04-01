/**
 * Menu — Vertical navigation menu with items, groups, submenus, and separators.
 * Shares item structure with Dropdown and ContextMenu.
 * Uses createListbox behavior for keyboard navigation.
 * Uses createOverlay for submenu show/hide.
 *
 * @module decantr/components/menu
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox, createOverlay, caret } from './_behaviors.js';
import { icon as iconFn } from './icon.js';

import { component } from '../runtime/component.js';
export interface MenuProps {
  items?: MenuItem[];
  selected?: string | (() => string);
  onSelect?: (value: unknown) => void;
  collapsed?: boolean;
  class?: string;
  [key: string]: unknown;
}

const { div, span, button: buttonTag, nav } = tags;

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
export const Menu = component<MenuProps>((props: MenuProps = {} as MenuProps) => {
  injectBase();
  const { items = [], selected, onSelect, collapsed = false, class: cls } = props;

  const menu = nav({
    class: cx('d-menu', cls),
    role: 'menu'
  });

  let currentSelected = typeof selected === 'function' ? selected() : selected;
  const _cleanups = [];

  function renderItem(item) {
    if (item.separator) {
      return div({ class: 'd-menu-separator', role: 'separator' });
    }
    if (item.group) {
      return div({ class: 'd-menu-group-label' }, item.group);
    }

    const children = [];
    if (item.icon) {
      const iconEl = typeof item.icon === 'string'
        ? iconFn(item.icon, { size: '1em', class: 'd-menu-item-icon' })
        : item.icon;
      children.push(iconEl);
    }
    if (!collapsed) {
      children.push(span({ class: 'd-menu-item-label' }, item.label));
    }
    if (item.children && item.children.length && !collapsed) {
      children.push(caret('right', { class: 'd-menu-item-arrow' }));
    }

    const isSelected = item.value === currentSelected;
    const el = buttonTag({
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

    // Submenu handling via createOverlay
    if (item.children && item.children.length) {
      const subWrap = div({ class: 'd-menu-sub-wrap' });
      subWrap.appendChild(el);
      const submenu = div({ class: 'd-menu-sub', role: 'menu' });
      item.children.forEach(child => submenu.appendChild(renderItem(child)));
      subWrap.appendChild(submenu);

      const ov = createOverlay(el, submenu, {
        trigger: 'hover',
        hoverDelay: 50,
        hoverCloseDelay: 150,
        closeOnEscape: true,
        closeOnOutside: false
      });
      _cleanups.push(() => ov.destroy());

      el.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          ov.open();
          const first = submenu.querySelector('.d-menu-item');
          if (first) first.focus();
        }
      });

      submenu.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          ov.close();
          el.focus();
        }
      });

      return subWrap;
    }

    return el;
  }

  function render() {
    // Destroy previous behavior instances
    _cleanups.forEach(fn => fn());
    _cleanups.length = 0;

    menu.replaceChildren();
    items.forEach(item => menu.appendChild(renderItem(item)));

    // Wire up keyboard nav
    const lb = createListbox(menu, {
      itemSelector: '.d-menu-item:not(.d-menu-item-disabled)',
      activeClass: 'd-menu-item-highlight',
      orientation: 'vertical',
      onSelect: (el) => el.click()
    });
    _cleanups.push(() => lb.destroy());
  }

  render();

  if (typeof selected === 'function') {
    createEffect(() => {
      currentSelected = selected();
      render();
    });
  }

  onDestroy(() => {
    _cleanups.forEach(fn => fn());
  });

  return menu;
})

/**
 * Menubar — Horizontal menu bar.
 * Uses createOverlay for dropdown show/hide and renderMenuItems for content.
 * @param {Object} [props]
 * @param {{ label: string, items: MenuItem[] }[]} [props.menus]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */

export interface MenuBarProps {
  class?: string;
  [key: string]: unknown;
}

Menu.Bar = function Menubar(props: MenuBarProps = {} as MenuBarProps) {
  injectBase();
  const { menus = [], class: cls } = props;

  const bar = div({ class: cx('d-menubar', cls), role: 'menubar' });
  const _cleanups = [];

  menus.forEach(menuDef => {
    const trigger = buttonTag({
      type: 'button',
      class: 'd-menubar-item',
      'aria-haspopup': 'menu',
      'aria-expanded': 'false'
    }, menuDef.label);

    const dropdown = div({
      class: 'd-dropdown-menu',
      role: 'menu',
      tabindex: '-1'
    });

    // Render items using same pattern as Dropdown
    menuDef.items.forEach(item => {
      if (item.separator) {
        dropdown.appendChild(div({ class: 'd-dropdown-separator', role: 'separator' }));
        return;
      }
      const el = buttonTag({
        type: 'button',
        class: cx('d-dropdown-item', item.disabled && 'd-dropdown-item-disabled'),
        role: 'menuitem',
        tabindex: '-1'
      }, span({ class: 'd-dropdown-item-label' }, item.label));

      if (!item.disabled) {
        el.addEventListener('click', () => {
          overlay.close();
          if (item.onclick) item.onclick(item.value || item.label);
        });
      }
      dropdown.appendChild(el);
    });

    const wrap = div({ class: 'd-menubar-wrap' });
    wrap.appendChild(trigger);
    wrap.appendChild(dropdown);

    const overlay = createOverlay(trigger, dropdown, {
      trigger: 'click',
      closeOnEscape: true,
      closeOnOutside: true,
      onOpen: () => {
        wrap.classList.add('d-dropdown-open');
        lb.reset();
        if (typeof dropdown.focus === 'function') dropdown.focus();
      },
      onClose: () => {
        wrap.classList.remove('d-dropdown-open');
      }
    });

    const lb = createListbox(dropdown, {
      itemSelector: '.d-dropdown-item:not(.d-dropdown-item-disabled)',
      activeClass: 'd-dropdown-item-highlight',
      orientation: 'vertical',
      onSelect: (el) => el.click()
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!overlay.isOpen()) overlay.open();
        lb.highlight(0);
      }
    });

    _cleanups.push(() => { overlay.destroy(); lb.destroy(); });

    bar.appendChild(wrap);
  });

  onDestroy(() => {
    _cleanups.forEach(fn => fn());
  });

  return bar;
};
