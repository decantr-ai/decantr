/**
 * NavigationMenu — Horizontal nav bar with hover-triggered dropdown panels.
 * Supports grid-layout dropdown content with descriptions.
 * Uses createOverlay with hover trigger.
 *
 * @module decantr/components/navigation-menu
 */
import { onDestroy } from '../runtime/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay, createRovingTabindex, createListbox, caret } from './_behaviors.js';

const { div, nav: navTag, ul, li, a, button: buttonTag } = tags;

/**
 * @typedef {Object} NavMenuItem
 * @property {string} label
 * @property {string} [href]
 * @property {Array<{label: string, href: string, description?: string}>} [children]
 */

/**
 * @param {Object} [props]
 * @param {NavMenuItem[]} [props.items]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function NavigationMenu(props = {}) {
  injectBase();
  const { items = [], class: cls } = props;

  const navEl = navTag({ class: cx('d-navmenu', cls), 'aria-label': 'Navigation' });
  const list = ul({ class: 'd-navmenu-list', role: 'menubar' });
  const overlays = [];
  const _cleanups = [];

  items.forEach((item, idx) => {
    const hasChildren = item.children && item.children.length;
    const liEl = li({ class: 'd-navmenu-trigger', role: 'none' });

    if (hasChildren) {
      const btn = buttonTag({
        type: 'button',
        class: 'd-navmenu-item',
        role: 'menuitem',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        tabindex: idx === 0 ? '0' : '-1'
      }, item.label, caret('down'));

      const content = div({
        class: 'd-navmenu-content',
        role: 'menu'
      });

      // Grid of links
      const useGrid = item.children.length > 1;
      const grid = div({ class: useGrid ? 'd-navmenu-grid' : '' });

      item.children.forEach(child => {
        const link = a({
          class: 'd-navmenu-link',
          href: child.href || '#',
          role: 'menuitem',
          tabindex: '-1'
        });

        link.appendChild(div(null, child.label));

        if (child.description) {
          link.appendChild(div({ class: 'd-navmenu-link-desc' }, child.description));
        }

        link.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            ov.close();
            btn.focus();
          }
        });

        grid.appendChild(link);
      });

      content.appendChild(grid);

      const ov = createOverlay(btn, content, {
        trigger: 'hover',
        closeOnEscape: true,
        closeOnOutside: false,
        hoverDelay: 100,
        hoverCloseDelay: 200,
        onOpen: () => {
          // Close other overlays
          overlays.forEach((o, i) => { if (i !== idx && o) o.close(); });
          // Focus first link
          const firstLink = content.querySelector('.d-navmenu-link');
          if (firstLink) firstLink.setAttribute('tabindex', '0');
        }
      });
      overlays.push(ov);
      _cleanups.push(() => ov.destroy());

      // Keyboard: open on Enter/Space/ArrowDown
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          ov.open();
          requestAnimationFrame(() => {
            const first = content.querySelector('.d-navmenu-link');
            if (first) first.focus();
          });
        }
      });

      // Arrow key nav within dropdown via createListbox
      const lb = createListbox(content, {
        itemSelector: '.d-navmenu-link',
        activeClass: 'd-navmenu-link-highlight',
        orientation: 'vertical',
        loop: true,
        onHighlight: (el) => { if (el) el.focus(); }
      });
      _cleanups.push(() => lb.destroy());

      // Escape still needs custom handling to close overlay and return focus
      content.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          ov.close();
          btn.focus();
        }
      });

      liEl.appendChild(btn);
      liEl.appendChild(content);
    } else {
      // Simple link item
      const link = a({
        class: 'd-navmenu-item',
        href: item.href || '#',
        role: 'menuitem',
        tabindex: idx === 0 ? '0' : '-1'
      }, item.label);
      liEl.appendChild(link);
      overlays.push(null);
    }

    list.appendChild(liEl);
  });

  // Roving tabindex for top-level items
  const roving = createRovingTabindex(list, {
    itemSelector: '[role="menuitem"]',
    orientation: 'horizontal',
    loop: true
  });
  _cleanups.push(() => roving.destroy());

  navEl.appendChild(list);

  onDestroy(() => {
    _cleanups.forEach(fn => fn());
  });

  return navEl;
}
