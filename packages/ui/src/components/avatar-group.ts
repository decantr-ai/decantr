/**
 * AvatarGroup — Stacked avatar display with overflow count.
 * Shows up to `max` avatars with a +N overflow indicator.
 *
 * @module decantr/components/avatar-group
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface AvatarGroupProps {
  max?: number;
  size?: string;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {number} [props.max=5] - Max visible avatars
 * @param {string} [props.size] - sm|lg|xl
 * @param {string} [props.class]
 * @param {...Node} children - Avatar components
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const AvatarGroup = component<AvatarGroupProps>((props: AvatarGroupProps = {} as AvatarGroupProps, ...children: (string | Node)[]) => {
  injectBase();
  const { max = 5, size, class: cls } = props;

  const group = h('div', {
    class: cx('d-avatar-group', cls),
    role: 'group',
    'aria-label': 'Avatar group'
  });

  // Flatten children
  // @ts-expect-error -- strict-mode fix (auto)
  const avatars = children.flat().filter(c => c && c.nodeType);
  const total = avatars.length;
  const visible = avatars.slice(0, max);

  // Apply size class if provided
  if (size) {
    visible.forEach(av => {
      // @ts-expect-error -- strict-mode fix (auto)
      if (av.classList && !av.classList.contains(`d-avatar-${size}`)) {
        // @ts-expect-error -- strict-mode fix (auto)
        av.classList.add(`d-avatar-${size}`);
      }
    });
  }

  // @ts-expect-error -- strict-mode fix (auto)
  visible.forEach(av => group.appendChild(av));

  // Overflow count
  if (total > max) {
    const sizeClass = size ? `d-avatar d-avatar-${size}` : 'd-avatar';
    const overflow = h('span', {
      class: cx('d-avatar-group-count', sizeClass),
      'aria-label': `${total - max} more`
    }, `+${total - max}`);
    group.appendChild(overflow);
  }

  return group;
})
