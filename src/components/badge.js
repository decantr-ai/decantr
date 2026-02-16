import { h, text } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number|Function} [props.count]
 * @param {string} [props.color] - CSS color override
 * @param {boolean} [props.dot] - Show as dot instead of pill
 * @param {string} [props.status] - success|error|warning|processing
 * @param {string} [props.class]
 * @param {...Node} children - If provided, badge wraps as superscript
 * @returns {HTMLElement}
 */
export function Badge(props = {}, ...children) {
  injectBase();

  const { count, color, dot, status, class: cls } = props;

  const statusColor = status === 'success' ? 'var(--c7)'
    : status === 'error' ? 'var(--c9)'
    : status === 'warning' ? 'var(--c8)'
    : status === 'processing' ? 'var(--c1)'
    : null;

  const bgColor = color || statusColor;

  if (dot) {
    const dotEl = h('span', {
      class: cx('d-badge-dot', status === 'processing' && 'd-badge-processing', cls)
    });
    if (bgColor) dotEl.style.background = bgColor;

    if (children.length) {
      return h('span', { class: 'd-badge-wrapper' },
        ...children,
        h('span', { class: 'd-badge-sup' }, dotEl)
      );
    }
    return dotEl;
  }

  const badgeClass = cx('d-badge', status === 'processing' && 'd-badge-processing', cls);
  const badgeEl = h('span', { class: badgeClass });
  if (bgColor) badgeEl.style.background = bgColor;

  if (typeof count === 'function') {
    badgeEl.appendChild(text(() => String(count())));
  } else if (count !== undefined) {
    badgeEl.appendChild(document.createTextNode(String(count)));
  }

  if (children.length) {
    return h('span', { class: 'd-badge-wrapper' },
      ...children,
      h('span', { class: 'd-badge-sup' }, badgeEl)
    );
  }

  return badgeEl;
}
