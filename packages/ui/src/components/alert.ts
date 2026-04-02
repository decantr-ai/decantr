import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface AlertProps {
  variant?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: string | Node;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.variant] - info|success|warning|error (default: info)
 * @param {boolean} [props.dismissible]
 * @param {Function} [props.onDismiss]
 * @param {string|Node} [props.icon]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const Alert = component<AlertProps>((props: AlertProps = {} as AlertProps, ...children: (string | Node)[]) => {
  injectBase();

  const { variant = 'info', dismissible, onDismiss, icon, class: cls } = props;

  const alertRole = (variant === 'error' || variant === 'warning') ? 'alert' : 'status';
  const alertClass = cx('d-alert', `d-alert-${variant}`, cls);
  const el = h('div', { class: alertClass, role: alertRole });

  if (icon) {
    const iconEl = typeof icon === 'string'
      ? h('span', { class: 'd-alert-icon', 'aria-hidden': 'true' }, icon)
      : h('span', { class: 'd-alert-icon', 'aria-hidden': 'true' }, icon);
    el.appendChild(iconEl);
  }

  const body = h('div', { class: 'd-alert-body' }, ...children);
  el.appendChild(body);

  if (dismissible) {
    const closeBtn = h('button', {
      class: 'd-alert-dismiss',
      'aria-label': 'Dismiss',
      type: 'button'
    }, '\u00d7');
    closeBtn.addEventListener('click', () => {
      el.remove();
      if (onDismiss) onDismiss();
    });
    el.appendChild(closeBtn);
  }

  return el;
})
