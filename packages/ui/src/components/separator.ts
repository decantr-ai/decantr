import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface SeparatorProps {
  vertical?: boolean;
  label?: string;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {boolean} [props.vertical]
 * @param {string} [props.label]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Separator = component<SeparatorProps>((props: SeparatorProps = {} as SeparatorProps) => {
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
})
