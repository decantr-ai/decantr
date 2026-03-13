import { h, text } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number|Function} [props.count]
 * @param {string} [props.color] - CSS color override
 * @param {boolean} [props.dot] - Show as dot instead of pill
 * @param {string} [props.status] - success|error|warning|processing
 * @param {string} [props.variant] - Alias for status
 * @param {string} [props.class]
 * @param {...Node} children - If provided, badge wraps as superscript
 * @returns {HTMLElement}
 */
export function Badge(props = {}, ...children) {
  injectBase();

  const { count, color, dot, status, variant, class: cls } = props;
  const resolvedStatus = status || variant;

  const statusColor = resolvedStatus === 'success' ? 'var(--d-success)'
    : resolvedStatus === 'error' ? 'var(--d-error)'
    : resolvedStatus === 'warning' ? 'var(--d-warning)'
    : resolvedStatus === 'processing' ? 'var(--d-primary)'
    : resolvedStatus === 'primary' ? 'var(--d-primary)'
    : resolvedStatus === 'accent' ? 'var(--d-accent)'
    : resolvedStatus === 'info' ? 'var(--d-info)'
    : null;

  const bgColor = color || statusColor;

  if (dot) {
    const dotEl = h('span', {
      class: cx('d-badge-dot', resolvedStatus === 'processing' && 'd-badge-processing', cls)
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

  const badgeClass = cx('d-badge', resolvedStatus === 'processing' && 'd-badge-processing', cls);
  const badgeEl = h('span', { class: badgeClass });
  if (bgColor) badgeEl.style.background = bgColor;

  if (typeof count === 'function') {
    badgeEl.appendChild(text(() => String(count())));
  } else if (count !== undefined) {
    badgeEl.appendChild(document.createTextNode(String(count)));
  }

  if (children.length) {
    // Label mode: string children are the badge's own text (e.g. Badge({variant:'primary'}, 'New'))
    // Wrapper mode: DOM element children get the badge as a superscript overlay
    const isLabel = children.every(c => typeof c === 'string' || typeof c === 'number');
    if (isLabel) {
      for (const child of children) {
        badgeEl.appendChild(document.createTextNode(String(child)));
      }
      return badgeEl;
    }
    return h('span', { class: 'd-badge-wrapper' },
      ...children,
      h('span', { class: 'd-badge-sup' }, badgeEl)
    );
  }

  return badgeEl;
}
