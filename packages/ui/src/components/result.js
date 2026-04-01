/**
 * Result — Full-page result feedback (success, error, info, warning, 403, 404, 500).
 *
 * @module decantr/components/result
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { icon as makeIcon } from './icon.js';

const STATUS_ICON_MAP = {
  success: 'check-circle',
  error: 'x-circle',
  info: 'info',
  warning: 'alert-triangle',
  403: 'shield',
  404: 'search',
  500: 'alert-circle'
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
    : h('div', { class: cx('d-result-icon', `d-result-icon-${status}`) }, makeIcon(STATUS_ICON_MAP[status] || 'info', { size: '3rem' }));

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
