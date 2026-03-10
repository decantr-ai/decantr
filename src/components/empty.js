/**
 * Empty — Placeholder for empty states (no data, no results, etc.).
 *
 * @module decantr/components/empty
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string|Node} [props.icon] - Custom icon (default: generic empty icon)
 * @param {string} [props.description='No data']
 * @param {string} [props.class]
 * @param {...Node} children - Optional action buttons below description
 * @returns {HTMLElement}
 */
export function Empty(props = {}, ...children) {
  injectBase();
  const { icon, description = 'No data', class: cls, ...rest } = props;

  const container = h('div', { class: cx('d-empty', cls), ...rest });

  const iconEl = h('div', { class: 'd-empty-icon' });
  if (icon) {
    if (typeof icon === 'string') iconEl.textContent = icon;
    else iconEl.appendChild(icon);
  } else {
    iconEl.textContent = '\uD83D\uDDC3';
  }
  container.appendChild(iconEl);

  if (description) {
    container.appendChild(h('div', { class: 'd-empty-desc' }, description));
  }

  children.forEach(child => {
    if (child && child.nodeType) container.appendChild(child);
  });

  return container;
}
