import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ label: string, href?: string, onclick?: Function }[]} props.items
 * @param {string} [props.separator] - Separator character (default: '/')
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Breadcrumb(props = {}) {
  injectBase();

  const { items = [], separator = '/', class: cls } = props;

  const nav = h('nav', { class: cx('d-breadcrumb', cls), 'aria-label': 'Breadcrumb' });
  const ol = h('ol', { class: 'd-breadcrumb-list' });

  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    const li = h('li', { class: 'd-breadcrumb-item' });

    if (isLast) {
      li.appendChild(h('span', { class: 'd-breadcrumb-current', 'aria-current': 'page' }, item.label));
    } else {
      const linkProps = { class: 'd-breadcrumb-link' };
      if (item.href) linkProps.href = item.href;
      if (item.onclick) linkProps.onclick = item.onclick;
      li.appendChild(h(item.href ? 'a' : 'button', linkProps, item.label));
      li.appendChild(h('span', { class: 'd-breadcrumb-separator', 'aria-hidden': 'true' }, separator));
    }

    ol.appendChild(li);
  });

  nav.appendChild(ol);
  return nav;
}
