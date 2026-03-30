/**
 * Banner — Full-width announcement bar for cookie consent, maintenance notices, promotions.
 * Optionally sticky to top or bottom of viewport.
 *
 * @module decantr/components/banner
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {'info'|'success'|'warning'|'error'} [props.variant='info']
 * @param {boolean} [props.dismissible=false]
 * @param {Function} [props.onDismiss]
 * @param {'top'|'bottom'|false} [props.sticky=false] - Sticky position
 * @param {string|Node} [props.icon]
 * @param {string|Node} [props.action] - Action slot (button/link)
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Banner(props = {}, ...children) {
  injectBase();

  const { variant = 'info', dismissible = false, onDismiss, sticky = false, icon, action, class: cls } = props;

  const bannerClass = cx(
    'd-banner',
    `d-banner-${variant}`,
    sticky === 'top' && 'd-banner-sticky-top',
    sticky === 'bottom' && 'd-banner-sticky-bottom',
    cls
  );

  const el = h('div', { class: bannerClass, role: 'banner' });

  if (icon) {
    const iconEl = typeof icon === 'string'
      ? h('span', { class: 'd-banner-icon', 'aria-hidden': 'true' }, icon)
      : h('span', { class: 'd-banner-icon', 'aria-hidden': 'true' }, icon);
    el.appendChild(iconEl);
  }

  const body = h('div', { class: 'd-banner-body' }, ...children);
  el.appendChild(body);

  if (action) {
    const actionEl = h('div', { class: 'd-banner-action' },
      typeof action === 'string' ? h('span', null, action) : action
    );
    el.appendChild(actionEl);
  }

  if (dismissible) {
    const closeBtn = h('button', {
      class: 'd-banner-dismiss',
      'aria-label': 'Dismiss banner',
      type: 'button'
    }, '\u00d7');
    closeBtn.addEventListener('click', () => {
      el.remove();
      if (onDismiss) onDismiss();
    });
    el.appendChild(closeBtn);
  }

  return el;
}
