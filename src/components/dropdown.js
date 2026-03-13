/**
 * Dropdown — Menu triggered by a button.
 * Uses renderMenuItems primitive + createListbox + createOverlay behaviors.
 *
 * @module decantr/components/dropdown
 */
import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createListbox, createOverlay } from './_behaviors.js';
import { renderMenuItems } from './_primitives.js';

const { div, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {Function} [props.trigger] — Function returning trigger element
 * @param {{ label: string, value?: string, icon?: string|Node, shortcut?: string, disabled?: boolean, separator?: boolean, onclick?: Function }[]} [props.items]
 * @param {string} [props.align] — 'left'|'right' (default: 'left')
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Dropdown(props = {}) {
  injectBase();

  const { trigger, items = [], align = 'left', class: cls } = props;

  const menu = div({
    class: cx('d-dropdown-menu', align === 'right' && 'd-dropdown-right'),
    role: 'menu',
    tabindex: '-1'
  });

  const wrap = div({ class: cx('d-dropdown', cls) });

  const triggerEl = typeof trigger === 'function' ? trigger() : buttonTag({ type: 'button', class: 'd-dropdown-trigger' }, 'Menu');
  triggerEl.setAttribute('aria-haspopup', 'menu');
  triggerEl.setAttribute('aria-expanded', 'false');
  wrap.appendChild(triggerEl);
  wrap.appendChild(menu);

  // Overlay handles show/hide, click-outside, escape, ARIA expanded
  const overlay = createOverlay(triggerEl, menu, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen() {
      renderMenuItems(menu, items, { onClose: closeMenu });
      listbox.reset();
      wrap.classList.add('d-dropdown-open');
      if (typeof menu.focus === 'function') menu.focus();
    },
    onClose() {
      wrap.classList.remove('d-dropdown-open');
      if (typeof triggerEl.focus === 'function') triggerEl.focus();
    }
  });

  function closeMenu() {
    overlay.close();
  }

  // Listbox handles arrow keys, enter/space selection, home/end
  const listbox = createListbox(menu, {
    itemSelector: '.d-dropdown-item:not(.d-dropdown-item-disabled)',
    activeClass: 'd-dropdown-item-highlight',
    orientation: 'vertical',
    onSelect: (el) => el.click()
  });

  // ArrowDown on trigger opens menu and highlights first item
  triggerEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!overlay.isOpen()) {
        overlay.open();
      }
      listbox.highlight(0);
    }
  });

  onDestroy(() => {
    overlay.destroy();
    listbox.destroy();
  });

  return wrap;
}
