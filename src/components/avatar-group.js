/**
 * AvatarGroup — Stacked avatar display with overflow count.
 * Shows up to `max` avatars with a +N overflow indicator.
 *
 * @module decantr/components/avatar-group
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number} [props.max=5] - Max visible avatars
 * @param {string} [props.size] - Avatar size class suffix (sm, lg, xl)
 * @param {string} [props.class]
 * @param {...Node} children - Avatar components
 * @returns {HTMLElement}
 */
export function AvatarGroup(props = {}, ...children) {
  injectBase();
  const { max = 5, size, class: cls } = props;

  const group = h('div', {
    class: cx('d-avatar-group', cls),
    role: 'group',
    'aria-label': 'Avatar group'
  });

  // Flatten children
  const avatars = children.flat().filter(c => c && c.nodeType);
  const total = avatars.length;
  const visible = avatars.slice(0, max);

  // Apply size class if provided
  if (size) {
    visible.forEach(av => {
      if (av.classList && !av.classList.contains(`d-avatar-${size}`)) {
        av.classList.add(`d-avatar-${size}`);
      }
    });
  }

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
}
