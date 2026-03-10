/**
 * Message — Lightweight global feedback message (top-center).
 * Simpler than notification: just type + content, auto-dismiss.
 *
 * @module decantr/components/message
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

let _container = null;

function getContainer() {
  if (_container) return _container;
  if (typeof document === 'undefined') return null;
  _container = h('div', { class: 'd-message-container' });
  document.body.appendChild(_container);
  return _container;
}

const ICONS = {
  info: '\u2139\ufe0f',
  success: '\u2705',
  warning: '\u26a0\ufe0f',
  error: '\u274c',
  loading: '\u23f3'
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
export function message(props = {}) {
  injectBase();
  const { content, type = 'info', duration = 3000, icon, onClose, class: cls } = props;

  const container = getContainer();
  if (!container) return { close() {} };

  const iconEl = icon
    ? (typeof icon === 'string' ? h('span', { class: 'd-message-icon' }, icon) : icon)
    : h('span', { class: 'd-message-icon' }, ICONS[type] || ICONS.info);

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
message.info = (content, duration) => message({ content, type: 'info', duration });
message.success = (content, duration) => message({ content, type: 'success', duration });
message.warning = (content, duration) => message({ content, type: 'warning', duration });
message.error = (content, duration) => message({ content, type: 'error', duration });
message.loading = (content, duration = 0) => message({ content, type: 'loading', duration });

/** Reset message container (for testing) */
export function resetMessages() {
  if (_container && _container.parentNode) _container.parentNode.removeChild(_container);
  _container = null;
}
