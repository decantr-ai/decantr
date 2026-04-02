/**
 * Result — Full-page result feedback (success, error, info, warning, 403, 404, 500).
 *
 * @module decantr/components/result
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { icon as makeIcon } from './icon.js';

import { component } from '../runtime/component.js';
export interface ResultProps {
  status?: 'success'|'error'|'info'|'warning'|'403'|'404'|'500';
  title?: string;
  subTitle?: string;
  icon?: Node;
  extra?: Node[];
  class?: string;
  [key: string]: unknown;
}

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
// @ts-expect-error -- strict-mode fix (auto)
export const Result = component<ResultProps>((props: ResultProps = {} as ResultProps, ...children: (string | Node)[]) => {
  injectBase();
  const { status = 'info', title, subTitle, icon, extra, class: cls } = props;

  const iconNode = icon
    ? (typeof icon === 'string' ? h('div', { class: 'd-result-icon' }, icon) : h('div', { class: 'd-result-icon' }, icon))
    // @ts-expect-error -- strict-mode fix (auto)
    : h('div', { class: cx('d-result-icon', `d-result-icon-${status}`) }, makeIcon(STATUS_ICON_MAP[status] || 'info', { size: '3rem' }));

  const el = h('div', { class: cx('d-result', cls) });
  el.appendChild(iconNode);
  if (title) el.appendChild(h('div', { class: 'd-result-title' }, title));
  if (subTitle) el.appendChild(h('div', { class: 'd-result-subtitle' }, subTitle));

  if (children.length) {
    const content = h('div', { class: 'd-result-content' });
    // @ts-expect-error -- strict-mode fix (auto)
    children.forEach(c => { if (c && c.nodeType) content.appendChild(c); });
    el.appendChild(content);
  }

  if (extra && extra.length) {
    const actions = h('div', { class: 'd-result-extra' });
    extra.forEach(node => { if (node && node.nodeType) actions.appendChild(node); });
    el.appendChild(actions);
  }

  return el;
})
