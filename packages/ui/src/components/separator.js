import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {boolean} [props.vertical]
 * @param {string} [props.label]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Separator(props = {}) {
  injectBase();

  const { vertical, label, class: cls } = props;

  if (label) {
    return h('div', {
      class: cx('d-separator', vertical && 'd-separator-vertical', cls),
      role: 'separator'
    },
      h('span', { class: 'd-separator-line' }),
      h('span', { class: 'd-separator-label' }, label),
      h('span', { class: 'd-separator-line' })
    );
  }

  return h('hr', {
    class: cx('d-separator', vertical && 'd-separator-vertical', cls),
    role: 'separator'
  });
}
