/**
 * Notification — Stacked notification system (top-right by default).
 * Unlike toast (brief messages), notifications support title, description,
 * icon, actions, and longer durations.
 *
 * @module decantr/components/notification
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

export interface notificationProps {
  title?: string;
  description?: string;
  type?: 'info'|'success'|'warning'|'error';
  duration?: number;
  placement?: 'top-right'|'top-left'|'bottom-right'|'bottom-left';
  icon?: Node;
  action?: Node;
  onClose?: () => void;
  class?: string;
  [key: string]: unknown;
}

let _containers = {};

function getContainer(placement: any) {
  // @ts-expect-error -- strict-mode fix (auto)
  if (_containers[placement]) return _containers[placement];
  if (typeof document === 'undefined') return null;
  const el = h('div', { class: cx('d-notification-container', `d-notification-${placement}`) });
  document.body.appendChild(el);
  // @ts-expect-error -- strict-mode fix (auto)
  _containers[placement] = el;
  return el;
}

/**
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {'info'|'success'|'warning'|'error'} [props.type='info']
 * @param {number} [props.duration=4500] - 0 = no auto-close
 * @param {'top-right'|'top-left'|'bottom-right'|'bottom-left'} [props.placement='top-right']
 * @param {Node} [props.icon]
 * @param {Node} [props.action] - Action button/link node
 * @param {Function} [props.onClose]
 * @param {string} [props.class]
 * @returns {{ close: Function }}
 */
export function notification(props: notificationProps = {} as notificationProps) {
  injectBase();
  const { title, description, type = 'info', duration = 4500, placement = 'top-right', icon, action, onClose, class: cls } = props;

  const container = getContainer(placement);
  if (!container) return { close() {} };

  const closeBtn = h('button', { type: 'button', class: 'd-notification-close', 'aria-label': 'Close' }, '\u00d7');

  const content = h('div', { class: 'd-notification-content' });
  if (title) content.appendChild(h('div', { class: 'd-notification-title' }, title));
  if (description) content.appendChild(h('div', { class: 'd-notification-desc' }, description));
  if (action) content.appendChild(h('div', { class: 'd-notification-action' }, action));

  const el = h('div', {
    class: cx('d-notification', `d-notification-${type}`, cls),
    role: 'alert',
    'aria-live': 'assertive'
  });

  if (icon) el.appendChild(h('div', { class: 'd-notification-icon' }, typeof icon === 'string' ? h('span', null, icon) : icon));
  el.appendChild(content);
  el.appendChild(closeBtn);

  function close() {
    el.classList.add('d-notification-exit');
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
    if (onClose) onClose();
  }

  closeBtn.addEventListener('click', close);
  container.appendChild(el);

  let timer: any;
  if (duration > 0) timer = setTimeout(close, duration);

  // Pause on hover
  el.addEventListener('mouseenter', () => { if (timer) clearTimeout(timer); });
  el.addEventListener('mouseleave', () => { if (duration > 0) timer = setTimeout(close, duration); });

  return { close };
}

/** Reset notification containers (for testing) */
export function resetNotifications() {
  for (const el of Object.values(_containers)) {
    // @ts-expect-error -- strict-mode fix (auto)
    if (el.parentNode) el.parentNode.removeChild(el);
  }
  _containers = {};
}
