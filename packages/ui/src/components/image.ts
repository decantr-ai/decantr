/**
 * Image — Enhanced image with loading state, fallback, and lightbox preview.
 *
 * @module decantr/components/image
 */
import { h, onDestroy } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  fit?: 'cover'|'contain'|'fill'|'none';
  preview?: boolean;
  fallback?: string;
  placeholder?: string;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.src] - Image URL
 * @param {string} [props.alt='']
 * @param {string} [props.width]
 * @param {string} [props.height]
 * @param {'cover'|'contain'|'fill'|'none'} [props.fit='cover']
 * @param {boolean} [props.preview=false] - Enable click-to-zoom lightbox
 * @param {string} [props.fallback] - Fallback text/icon on error
 * @param {string} [props.placeholder] - Placeholder while loading
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Image = component<ImageProps>((props: ImageProps = {} as ImageProps) => {
  injectBase();
  const { src, alt = '', width, height, fit = 'cover', preview = false, fallback = 'Image not available', placeholder, class: cls, ...rest } = props;

  const style = {};
  // @ts-expect-error -- strict-mode fix (auto)
  if (width) style.width = width;
  // @ts-expect-error -- strict-mode fix (auto)
  if (height) style.height = height;

  const container = h('div', {
    class: cx('d-image', preview && 'd-image-preview', cls),
    style,
    ...rest
  });

  const img = h('img', {
    src,
    alt,
    style: { objectFit: fit },
    loading: 'lazy'
  });

  img.addEventListener('error', () => {
    img.remove();
    container.appendChild(h('div', { class: 'd-image-fallback' }, fallback));
  });

  container.appendChild(img);

  if (preview) {
    let activeOverlay: any = null;
    let activeHandler: any = null;

    function dismissOverlay() {
      if (activeOverlay) { activeOverlay.remove(); activeOverlay = null; }
      if (activeHandler) { document.removeEventListener('keydown', activeHandler); activeHandler = null; }
    }

    container.addEventListener('click', () => {
      const overlay = h('div', { class: 'd-image-overlay', role: 'dialog', 'aria-label': 'Image preview' });
      const previewImg = h('img', { src, alt, style: { objectFit: 'contain' } });
      overlay.appendChild(previewImg);

      activeOverlay = overlay;
      // @ts-expect-error -- strict-mode fix (auto)
      activeHandler = (e: Event) => { if (e.key === 'Escape') dismissOverlay(); };

      overlay.addEventListener('click', dismissOverlay);
      document.addEventListener('keydown', activeHandler);

      document.body.appendChild(overlay);
    });

    container.setAttribute('role', 'button');
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', `Preview ${alt || 'image'}`);
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); container.click(); }
    });

    onDestroy(dismissOverlay);
  }

  return container;
})

/**
 * Image.Group — Wraps multiple images for grouped preview navigation.
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */

export interface ImageGroupProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Image.Group = function Group(props: ImageGroupProps = {} as ImageGroupProps, ...children: (string | Node)[]) {
  injectBase();
  const { class: cls, ...rest } = props;
  return h('div', { class: cx('d-space d-space-wrap', cls), ...rest }, ...children);
};
