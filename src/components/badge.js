import { h, text } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { icon as iconHelper } from './icon.js';

/**
 * @param {Object} [props]
 * @param {number|Function} [props.count]
 * @param {string} [props.color] - CSS color override
 * @param {boolean} [props.dot] - Show as dot instead of pill
 * @param {string} [props.status] - success|error|warning|processing
 * @param {string} [props.variant] - Alias for status
 * @param {boolean} [props.solid] - Use saturated/solid colors instead of subtle
 * @param {string|Node} [props.icon] - Leading icon (string = icon name, Node = element)
 * @param {string} [props.class]
 * @param {...Node} children - If provided, badge wraps as superscript
 * @returns {HTMLElement}
 */
export function Badge(props = {}, ...children) {
  injectBase();

  const { count, color, dot, status, variant, solid, icon, class: cls } = props;
  const resolvedStatus = status || variant;

  // Known statuses that have CSS variant classes
  const cssVariants = ['success', 'error', 'warning', 'info', 'processing'];
  const hasCssVariant = cssVariants.includes(resolvedStatus);

  // Fallback inline color for non-CSS variants (primary, accent, custom)
  const statusColor = !hasCssVariant ? (
    resolvedStatus === 'primary' ? 'var(--d-primary)'
    : resolvedStatus === 'accent' ? 'var(--d-accent)'
    : null
  ) : null;

  const bgColor = color || statusColor;

  if (dot) {
    const dotEl = h('span', {
      class: cx('d-badge-dot', hasCssVariant && `d-badge-${resolvedStatus}`, cls)
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

  const badgeClass = cx('d-badge', solid && 'd-badge-solid', hasCssVariant && `d-badge-${resolvedStatus}`, cls);
  const badgeEl = h('span', { class: badgeClass });
  if (bgColor) badgeEl.style.background = bgColor;

  if (typeof count === 'function') {
    badgeEl.appendChild(text(() => String(count())));
  } else if (count !== undefined) {
    badgeEl.appendChild(document.createTextNode(String(count)));
  }

  // Resolve icon prop into a DOM element
  if (icon) {
    const iconEl = typeof icon === 'string'
      ? iconHelper(icon, { size: '1em', class: 'd-badge-icon' })
      : icon;
    if (iconEl && !iconEl.classList.contains('d-badge-icon')) {
      iconEl.classList.add('d-badge-icon');
    }
    iconEl.setAttribute('aria-hidden', 'true');
    badgeEl.appendChild(iconEl);
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
