import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

let containerCache = {};

function getContainer(position) {
  if (containerCache[position]) return containerCache[position];
  if (typeof document === 'undefined') return null;

  const el = h('div', { class: cx('d-toast-container', `d-toast-${position}`) });
  document.body.appendChild(el);
  containerCache[position] = el;
  return el;
}

/**
 * Show a toast notification.
 * @param {Object} props
 * @param {string} props.message
 * @param {string} [props.variant] - info|success|warning|error (default: info)
 * @param {number} [props.duration] - Auto-dismiss in ms (default: 3000, 0 = manual)
 * @param {string} [props.position] - top-right|top-left|bottom-right|bottom-left (default: top-right)
 * @returns {{ dismiss: Function }}
 */
export function toast(props = {}) {
  injectBase();

  const {
    message,
    variant = 'info',
    duration = 3000,
    position = 'top-right'
  } = props;

  const container = getContainer(position);
  if (!container) return { dismiss: () => {} };

  const toastClass = cx('d-toast', `d-toast-${variant}`);
  const el = h('div', { class: toastClass, role: 'status', 'aria-live': 'polite' },
    h('span', { class: 'd-toast-message' }, message),
    h('button', {
      class: 'd-toast-close',
      'aria-label': 'Dismiss',
      type: 'button'
    }, '\u00d7')
  );

  const dismiss = () => {
    el.classList.add('d-toast-exit');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  };

  el.querySelector('.d-toast-close').addEventListener('click', dismiss);
  container.appendChild(el);

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return { dismiss };
}

/** Reset toast containers (for testing) */
export function resetToasts() {
  for (const el of Object.values(containerCache)) {
    if (el.parentNode) el.parentNode.removeChild(el);
  }
  containerCache = {};
}
