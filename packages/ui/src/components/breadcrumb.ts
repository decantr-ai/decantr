import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { icon } from './icon.js';
import { createOverlay, createListbox } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface BreadcrumbProps {
  separator?: 'chevron'|'slash'|'dot'|string|HTMLElement;
  size?: 'sm'|'lg';
  maxItems?: number;
  class?: string;
  items?: unknown;
  [key: string]: unknown;
}

const { nav: navTag, ol, li, span, button: buttonTag, a } = tags;

/**
 * @param {Object} [props]
 * @param {{ label: string, href?: string, onclick?: Function, icon?: string, disabled?: boolean }[]|Function} props.items - Static array or signal getter
 * @param {'chevron'|'slash'|'dot'|string|HTMLElement} [props.separator] - Separator type (default: 'chevron')
 * @param {'sm'|'lg'} [props.size] - Size variant
 * @param {number} [props.maxItems] - Collapse middle items into ellipsis dropdown
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Breadcrumb = component<BreadcrumbProps>((props: BreadcrumbProps = {} as BreadcrumbProps) => {
  injectBase();

  const { items: itemsProp = [], separator = 'chevron', size, maxItems, class: cls } = props;
  const isReactive = typeof itemsProp === 'function';

  const nav = navTag({
    class: cx('d-breadcrumb', size && `d-breadcrumb-${size}`, cls),
    'aria-label': 'Breadcrumb'
  });
  const list = ol({ class: 'd-breadcrumb-list' });

  function renderSeparator() {
    const sep = span({ class: 'd-breadcrumb-separator', 'aria-hidden': 'true' });
    if (separator === 'chevron') {
      sep.appendChild(icon('chevron-right', { size: '1em' }));
    } else if (separator === 'slash') {
      sep.textContent = '/';
    } else if (separator === 'dot') {
      sep.textContent = '\u00B7';
    } else if (typeof separator === 'object' && separator.nodeType === 1) {
      sep.appendChild(separator.cloneNode(true));
    } else {
      sep.textContent = separator;
    }
    return sep;
  }

  function renderIcon(name) {
    return icon(name, { size: '1em', class: 'd-breadcrumb-icon' });
  }

  function renderItem(item, isLast) {
    const el = li({ class: 'd-breadcrumb-item' });

    if (isLast) {
      const cur = span({ class: 'd-breadcrumb-current', 'aria-current': 'page' });
      if (item.icon) cur.appendChild(renderIcon(item.icon));
      cur.appendChild(document.createTextNode(item.label));
      el.appendChild(cur);
    } else if (item.disabled) {
      const s = span({ class: 'd-breadcrumb-link d-breadcrumb-link-disabled', 'aria-disabled': 'true' });
      if (item.icon) s.appendChild(renderIcon(item.icon));
      s.appendChild(document.createTextNode(item.label));
      el.appendChild(s);
      el.appendChild(renderSeparator());
    } else if (item.href) {
      const link = a({ class: 'd-breadcrumb-link', href: item.href });
      if (item.icon) link.appendChild(renderIcon(item.icon));
      link.appendChild(document.createTextNode(item.label));
      el.appendChild(link);
      el.appendChild(renderSeparator());
    } else {
      const linkProps = { class: 'd-breadcrumb-link' };
      if (item.onclick) linkProps.onclick = item.onclick;
      const btn = buttonTag(linkProps);
      if (item.icon) btn.appendChild(renderIcon(item.icon));
      btn.appendChild(document.createTextNode(item.label));
      el.appendChild(btn);
      el.appendChild(renderSeparator());
    }

    return el;
  }

  /**
   * Render items into the list, handling collapse logic.
   * Returns a cleanup function for any overlay/listbox created.
   */
  function renderItems(items) {
    list.replaceChildren();

    const shouldCollapse = maxItems && maxItems > 1 && items.length > maxItems;

    if (shouldCollapse) {
      const firstItems = items.slice(0, 1);
      const hiddenItems = items.slice(1, items.length - (maxItems - 1));
      const lastItems = items.slice(items.length - (maxItems - 1));

      // Render first item
      firstItems.forEach(item => list.appendChild(renderItem(item, false)));

      // Render ellipsis collapse
      const collapseWrap = li({ class: 'd-breadcrumb-item' });
      const collapseInner = span({ class: 'd-breadcrumb-collapse' });

      const ellipsisBtn = buttonTag({
        class: 'd-breadcrumb-ellipsis',
        'aria-haspopup': 'menu',
        'aria-label': 'Show more breadcrumbs'
      });
      ellipsisBtn.appendChild(icon('more-horizontal', { size: '1em' }));

      const menu = span({
        class: 'd-breadcrumb-menu',
        role: 'menu'
      });
      menu.style.display = 'none';

      hiddenItems.forEach(item => {
        const menuItem = item.href
          ? a({ class: 'd-dropdown-item', href: item.href, role: 'menuitem' })
          : buttonTag({ class: 'd-dropdown-item', role: 'menuitem' });
        if (item.onclick) menuItem.onclick = item.onclick;
        if (item.disabled) {
          menuItem.classList.add('d-dropdown-item-disabled');
          menuItem.setAttribute('aria-disabled', 'true');
        }
        if (item.icon) menuItem.appendChild(renderIcon(item.icon));
        menuItem.appendChild(document.createTextNode(item.label));
        menu.appendChild(menuItem);
      });

      collapseInner.appendChild(ellipsisBtn);
      collapseInner.appendChild(menu);
      collapseWrap.appendChild(collapseInner);
      collapseWrap.appendChild(renderSeparator());
      list.appendChild(collapseWrap);

      // Wire overlay + listbox behaviors
      const overlay = createOverlay(ellipsisBtn, menu, {
        trigger: 'click',
        closeOnEscape: true,
        closeOnOutside: true
      });

      const listbox = createListbox(menu, {
        itemSelector: '.d-dropdown-item:not(.d-dropdown-item-disabled)',
        activeClass: 'd-dropdown-item-highlight',
        orientation: 'vertical',
        onSelect: (el) => el.click()
      });

      // Render last items
      lastItems.forEach((item, i) => {
        const isLast = i === lastItems.length - 1;
        list.appendChild(renderItem(item, isLast));
      });

      return () => { overlay.destroy(); listbox.destroy(); };
    } else {
      items.forEach((item, i) => {
        list.appendChild(renderItem(item, i === items.length - 1));
      });
      return null;
    }
  }

  let _cleanup = null;

  if (isReactive) {
    createEffect(() => {
      if (_cleanup) { _cleanup(); _cleanup = null; }
      _cleanup = renderItems(itemsProp());
    });
  } else {
    _cleanup = renderItems(itemsProp);
  }

  onDestroy(() => { if (_cleanup) _cleanup(); });

  nav.appendChild(list);
  return nav;
})
