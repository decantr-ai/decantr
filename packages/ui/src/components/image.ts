/**
 * Image — Enhanced image with loading state, fallback, and lightbox preview.
 *
 * @module decantr/components/image
 */
import { h, onDestroy } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

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
export function Image(props = {}) {
  injectBase();
  const { src, alt = '', width, height, fit = 'cover', preview = false, fallback = 'Image not available', placeholder, class: cls, ...rest } = props;

  const style = {};
  if (width) style.width = width;
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
    let activeOverlay = null;
    let activeHandler = null;

    function dismissOverlay() {
      if (activeOverlay) { activeOverlay.remove(); activeOverlay = null; }
      if (activeHandler) { document.removeEventListener('keydown', activeHandler); activeHandler = null; }
    }

    container.addEventListener('click', () => {
      const overlay = h('div', { class: 'd-image-overlay', role: 'dialog', 'aria-label': 'Image preview' });
      const previewImg = h('img', { src, alt, style: { objectFit: 'contain' } });
      overlay.appendChild(previewImg);

      activeOverlay = overlay;
      activeHandler = (e) => { if (e.key === 'Escape') dismissOverlay(); };

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
}

/**
 * Image.Group — Wraps multiple images for grouped preview navigation.
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
Image.Group = function Group(props = {}, ...children) {
  injectBase();
  const { class: cls, ...rest } = props;
  return h('div', { class: cx('d-space d-space-wrap', cls), ...rest }, ...children);
};
