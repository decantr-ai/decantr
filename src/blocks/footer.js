import { h } from '../core/index.js';
import { injectBlockBase } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ title: string, links: { label: string, href?: string, onclick?: Function }[] }[]} [props.columns]
 * @param {string} [props.copyright]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Footer(props = {}) {
  injectBlockBase();

  const { columns = [], copyright, class: cls } = props;

  const footer = h('footer', { class: `d-footer${cls ? ' ' + cls : ''}` });

  if (columns.length) {
    const colsEl = h('div', { class: 'd-footer-columns' });

    for (const col of columns) {
      const colEl = h('div', { class: 'd-footer-column' });
      colEl.appendChild(h('div', { class: 'd-footer-column-title' }, col.title));

      const ul = h('ul', null);
      for (const link of col.links) {
        const attrs = { class: 'd-footer-link' };
        if (link.href) attrs.href = link.href;
        if (link.onclick) attrs.onclick = link.onclick;
        const tag = link.href ? 'a' : 'span';
        ul.appendChild(h('li', null, h(tag, attrs, link.label)));
      }
      colEl.appendChild(ul);
      colsEl.appendChild(colEl);
    }

    footer.appendChild(colsEl);
  }

  if (copyright) {
    footer.appendChild(h('div', { class: 'd-footer-copyright' }, copyright));
  }

  return footer;
}
