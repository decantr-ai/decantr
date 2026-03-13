/**
 * ContextMenu — Right-click menu overlay.
 * Uses renderMenuItems primitive + createListbox behavior.
 *
 * @module decantr/components/context-menu
 */
import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox } from './_behaviors.js';
import { renderMenuItems } from './_primitives.js';

const { div } = tags;

/**
 * @param {Object} [props]
 * @param {HTMLElement} props.target
 * @param {{ label: string, value?: string, icon?: string|Node, shortcut?: string, disabled?: boolean, separator?: boolean, onclick?: Function }[]} [props.items]
 * @param {Function} [props.onSelect]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ContextMenu(props = {}) {
  injectBase();
  const { target, items = [], onSelect, class: cls } = props;

  let _open = false;

  const menu = div({
    class: cx('d-contextmenu', cls),
    role: 'menu',
    tabindex: '-1'
  });
  menu.style.display = 'none';

  function closeMenu() {
    if (!_open) return;
    _open = false;
    menu.style.display = 'none';
  }

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
      renderMenuItems(menu, items, { onSelect, onClose: closeMenu });
      listbox.reset();
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      menu.style.position = 'fixed';
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
