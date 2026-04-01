/**
 * ContextMenu — Right-click menu overlay.
 * Uses renderMenuItems primitive + createListbox + createOverlay behaviors.
 *
 * @module decantr/components/context-menu
 */
import { onDestroy } from '../runtime/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox, createOverlay } from './_behaviors.js';
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

  const menu = div({
    class: cx('d-contextmenu', cls),
    role: 'menu',
    tabindex: '-1'
  });

  // Use createOverlay with manual trigger for programmatic open/close
  // The overlay manages display, escape-to-close, and click-outside
  const dummyTrigger = target || div();
  const overlay = createOverlay(dummyTrigger, menu, {
    trigger: 'manual',
    closeOnEscape: true,
    closeOnOutside: true,
    onClose: () => {}
  });

  const listbox = createListbox(menu, {
    itemSelector: '.d-dropdown-item:not(.d-dropdown-item-disabled)',
    activeClass: 'd-dropdown-item-highlight',
    orientation: 'vertical',
    onSelect: (el) => el.click()
  });

  // Attach to target
  if (target) {
    target.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      renderMenuItems(menu, items, { onSelect, onClose: () => overlay.close() });
      listbox.reset();
      // Position at cursor — runtime values from user interaction
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      menu.style.position = 'fixed';
      overlay.open();
      menu.focus();
    });
  }

  if (typeof document !== 'undefined') {
    document.body.appendChild(menu);
  }

  onDestroy(() => {
    overlay.destroy();
    listbox.destroy();
    if (menu.parentNode) menu.parentNode.removeChild(menu);
  });

  return menu;
}
