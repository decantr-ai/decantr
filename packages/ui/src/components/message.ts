/**
 * Message — Lightweight global feedback message (top-center).
 * Simpler than notification: just type + content, auto-dismiss.
 *
 * @module decantr/components/message
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { icon as makeIcon } from './icon.js';

export interface messageProps {
  content?: string;
  type?: 'info'|'success'|'warning'|'error'|'loading';
  duration?: number;
  icon?: Node;
  onClose?: () => void;
  class?: string;
  [key: string]: unknown;
}

let _container: any = null;

function getContainer() {
  if (_container) return _container;
  if (typeof document === 'undefined') return null;
  _container = h('div', { class: 'd-message-container' });
  document.body.appendChild(_container);
  return _container;
}

const ICON_MAP = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'x-circle',
  loading: 'loader'
};

/**
 * @param {Object} props
 * @param {string} props.content - Message text
 * @param {'info'|'success'|'warning'|'error'|'loading'} [props.type='info']
 * @param {number} [props.duration=3000] - 0 = manual close only
 * @param {Node} [props.icon] - Custom icon node
 * @param {Function} [props.onClose]
 * @param {string} [props.class]
 * @returns {{ close: Function }}
 */
export function message(props: messageProps = {} as messageProps) {
  injectBase();
  const { content, type = 'info', duration = 3000, icon, onClose, class: cls } = props;

  const container = getContainer();
  if (!container) return { close() {} };

  const iconEl = icon
    ? (typeof icon === 'string' ? h('span', { class: 'd-message-icon' }, icon) : icon)
    // @ts-expect-error -- strict-mode fix (auto)
    : h('span', { class: 'd-message-icon' }, makeIcon(ICON_MAP[type] || 'info', { size: '1.25em' }));

  const el = h('div', {
    class: cx('d-message', `d-message-${type}`, cls),
    role: 'status',
    'aria-live': 'polite'
  }, iconEl, h('span', { class: 'd-message-text' }, content));

  container.appendChild(el);

  function close() {
    el.classList.add('d-message-exit');
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
    if (onClose) onClose();
  }

  if (duration > 0) setTimeout(close, duration);

  return { close };
}

// Convenience methods
message.info = (content: string, duration?: number) => message({ content, type: 'info', duration });
message.success = (content: string, duration?: number) => message({ content, type: 'success', duration });
message.warning = (content: string, duration?: number) => message({ content, type: 'warning', duration });
message.error = (content: string, duration?: number) => message({ content, type: 'error', duration });
message.loading = (content: string, duration: number = 0) => message({ content, type: 'loading', duration });

/** Reset message container (for testing) */
export function resetMessages() {
  if (_container && _container.parentNode) _container.parentNode.removeChild(_container);
  _container = null;
}
