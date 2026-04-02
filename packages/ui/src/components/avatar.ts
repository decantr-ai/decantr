import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { icon } from './icon.js';

import { component } from '../runtime/component.js';
export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: string;
  fallback?: string;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.src] - Image URL
 * @param {string} [props.alt] - Alt text
 * @param {string} [props.size] - sm|lg|xl
 * @param {string} [props.fallback] - Fallback text (initials)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Avatar = component<AvatarProps>((props: AvatarProps = {} as AvatarProps) => {
  injectBase();

  const { src, alt = '', size, fallback, class: cls } = props;

  const avatarClass = cx('d-avatar', size && `d-avatar-${size}`, cls);
  const container = h('div', { class: avatarClass });

  if (src) {
    const img = h('img', { class: 'd-avatar-img', src, alt });
    img.addEventListener('error', () => {
      img.remove();
      container.appendChild(createFallback());
    });
    container.appendChild(img);
  } else {
    container.appendChild(createFallback());
  }

  function createFallback() {
    const text = fallback || alt.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    if (!text) {
      const el = h('span', { class: 'd-avatar-fallback', 'aria-hidden': 'true' });
      // @ts-expect-error -- strict-mode fix (auto)
      el.appendChild(icon('user', { size: '1em' }));
      return el;
    }
    return h('span', { class: 'd-avatar-fallback', 'aria-hidden': 'true' }, text);
  }

  return container;
})
