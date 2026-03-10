/**
 * NavigationMenu — Horizontal nav bar with hover-triggered dropdown panels.
 * Supports grid-layout dropdown content with descriptions.
 * Uses createOverlay with hover trigger.
 *
 * @module decantr/components/navigation-menu
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay, createRovingTabindex, caret } from './_behaviors.js';

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

  const nav = h('nav', { class: cx('d-navmenu', cls), 'aria-label': 'Navigation' });
  const list = h('ul', { class: 'd-navmenu-list', role: 'menubar' });
  const overlays = [];

  items.forEach((item, idx) => {
    const hasChildren = item.children && item.children.length;
    const li = h('li', { class: 'd-navmenu-trigger', role: 'none' });

    if (hasChildren) {
      const btn = h('button', {
        type: 'button',
        class: 'd-navmenu-item',
        role: 'menuitem',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        tabindex: idx === 0 ? '0' : '-1'
      }, item.label, caret('down'));

      const content = h('div', {
        class: 'd-navmenu-content',
        role: 'menu',
        style: { display: 'none' }
      });

      // Grid of links
      const useGrid = item.children.length > 1;
      const grid = h('div', { class: useGrid ? 'd-navmenu-grid' : '' });

      item.children.forEach(child => {
        const link = h('a', {
          class: 'd-navmenu-link',
          href: child.href || '#',
          role: 'menuitem',
          tabindex: '-1'
        });

        const labelEl = h('div', null, child.label);
        link.appendChild(labelEl);

        if (child.description) {
          link.appendChild(h('div', { class: 'd-navmenu-link-desc' }, child.description));
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
          overlays.forEach((o, i) => { if (i !== idx) o.close(); });
          // Focus first link
          const firstLink = content.querySelector('.d-navmenu-link');
          if (firstLink) firstLink.setAttribute('tabindex', '0');
        }
      });
      overlays.push(ov);

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

      // Arrow key nav within dropdown
      content.addEventListener('keydown', (e) => {
        const links = [...content.querySelectorAll('.d-navmenu-link')];
        const cur = links.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = cur < links.length - 1 ? cur + 1 : 0;
          links[next]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = cur > 0 ? cur - 1 : links.length - 1;
          links[prev]?.focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          ov.close();
          btn.focus();
        }
      });

      li.appendChild(btn);
      li.appendChild(content);
    } else {
      // Simple link item
      const link = h('a', {
        class: 'd-navmenu-item',
        href: item.href || '#',
        role: 'menuitem',
        tabindex: idx === 0 ? '0' : '-1'
      }, item.label);
      li.appendChild(link);
      overlays.push(null);
    }

    list.appendChild(li);
  });

  // Roving tabindex for top-level items
  createRovingTabindex(list, {
    itemSelector: '[role="menuitem"]',
    orientation: 'horizontal',
    loop: true
  });

  nav.appendChild(list);
  return nav;
}
