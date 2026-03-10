/**
 * Result — Full-page result feedback (success, error, info, warning, 403, 404, 500).
 *
 * @module decantr/components/result
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

const STATUS_ICONS = {
  success: '\u2705',
  error: '\u274c',
  info: '\u2139\ufe0f',
  warning: '\u26a0\ufe0f',
  403: '\ud83d\udeab',
  404: '\ud83d\udd0d',
  500: '\ud83d\udca5'
};

/**
 * @param {Object} [props]
 * @param {'success'|'error'|'info'|'warning'|'403'|'404'|'500'} [props.status='info']
 * @param {string} [props.title]
 * @param {string} [props.subTitle]
 * @param {Node} [props.icon] - Custom icon override
 * @param {Node[]} [props.extra] - Action buttons at bottom
 * @param {string} [props.class]
 * @param {...Node} children - Additional content
 * @returns {HTMLElement}
 */
export function Result(props = {}, ...children) {
  injectBase();
  const { status = 'info', title, subTitle, icon, extra, class: cls } = props;

  const iconNode = icon
    ? (typeof icon === 'string' ? h('div', { class: 'd-result-icon' }, icon) : h('div', { class: 'd-result-icon' }, icon))
    : h('div', { class: cx('d-result-icon', `d-result-icon-${status}`) }, STATUS_ICONS[status] || STATUS_ICONS.info);

  const el = h('div', { class: cx('d-result', cls) });
  el.appendChild(iconNode);
  if (title) el.appendChild(h('div', { class: 'd-result-title' }, title));
  if (subTitle) el.appendChild(h('div', { class: 'd-result-subtitle' }, subTitle));

  if (children.length) {
    const content = h('div', { class: 'd-result-content' });
    children.forEach(c => { if (c && c.nodeType) content.appendChild(c); });
    el.appendChild(content);
  }

  if (extra && extra.length) {
    const actions = h('div', { class: 'd-result-extra' });
    extra.forEach(node => { if (node && node.nodeType) actions.appendChild(node); });
    el.appendChild(actions);
  }

  return el;
}
