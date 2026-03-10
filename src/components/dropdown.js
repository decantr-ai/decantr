import { h, onDestroy } from '../core/index.js';
import { injectBase, cx } from './_base.js';

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

  let open = false;
  let activeIndex = -1;

  const menu = h('div', {
    class: cx('d-dropdown-menu', align === 'right' && 'd-dropdown-right'),
    role: 'menu',
    tabindex: '-1',
    style: { display: 'none' }
  });

  const wrap = h('div', { class: cx('d-dropdown', cls) });

  const triggerEl = typeof trigger === 'function' ? trigger() : h('button', { type: 'button', class: 'd-dropdown-trigger' }, 'Menu');
  triggerEl.setAttribute('aria-haspopup', 'menu');
  triggerEl.setAttribute('aria-expanded', 'false');
  wrap.appendChild(triggerEl);
  wrap.appendChild(menu);

  function renderItems() {
    menu.replaceChildren();
    items.forEach((item) => {
      if (item.separator) {
        menu.appendChild(h('div', { class: 'd-dropdown-separator', role: 'separator' }));
        return;
      }
      const children = [];
      if (item.icon) {
        const iconEl = typeof item.icon === 'string' ? h('span', { class: 'd-dropdown-item-icon' }, item.icon) : item.icon;
        children.push(iconEl);
      }
      children.push(h('span', { class: 'd-dropdown-item-label' }, item.label));
      if (item.shortcut) {
        children.push(h('span', { class: 'd-dropdown-item-shortcut' }, item.shortcut));
      }
      const el = h('div', {
        class: cx('d-dropdown-item', item.disabled && 'd-dropdown-item-disabled'),
        role: 'menuitem',
        tabindex: '-1',
        'aria-disabled': item.disabled ? 'true' : undefined
      }, ...children);
      if (!item.disabled) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          closeMenu();
          if (item.onclick) item.onclick(item.value || item.label);
        });
      }
      menu.appendChild(el);
    });
  }

  function getSelectableItems() {
    return [...menu.querySelectorAll('.d-dropdown-item:not(.d-dropdown-item-disabled)')];
  }

  function highlightIndex(idx) {
    const selectables = getSelectableItems();
    selectables.forEach((el, i) => {
      el.classList.toggle('d-dropdown-item-highlight', i === idx);
    });
    activeIndex = idx;
  }

  function openMenu() {
    if (open) return;
    open = true;
    activeIndex = -1;
    renderItems();
    menu.style.display = '';
    triggerEl.setAttribute('aria-expanded', 'true');
    wrap.classList.add('d-dropdown-open');
    if (typeof menu.focus === 'function') menu.focus();
  }

  function closeMenu() {
    if (!open) return;
    open = false;
    menu.style.display = 'none';
    triggerEl.setAttribute('aria-expanded', 'false');
    wrap.classList.remove('d-dropdown-open');
    if (typeof triggerEl.focus === 'function') triggerEl.focus();
  }

  triggerEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (open) closeMenu();
    else openMenu();
  });

  triggerEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) openMenu();
      highlightIndex(0);
    }
  });

  menu.addEventListener('keydown', (e) => {
    const selectables = getSelectableItems();
    const len = selectables.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex(activeIndex < len - 1 ? activeIndex + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex(activeIndex > 0 ? activeIndex - 1 : len - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < len) {
        selectables[activeIndex].click();
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      closeMenu();
    }
  });

  // Outside click to close
  const onDocClick = (e) => {
    if (open && !wrap.contains(e.target)) closeMenu();
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('click', onDocClick);
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', onDocClick);
    }
  });

  return wrap;
}
