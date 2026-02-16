import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.title]
 * @param {Function} props.visible - Signal getter for visibility
 * @param {Function} [props.onClose]
 * @param {string} [props.width] - CSS width (default: 480px)
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function Modal(props = {}, ...children) {
  injectBase();

  const { title, visible, onClose, width = '480px', class: cls } = props;

  // Sentinel element in the component tree
  const sentinel = h('d-modal', null);

  let overlay = null;

  function close() {
    if (onClose) onClose();
  }

  function handleKeydown(e) {
    if (e.type === 'keydown' && e.key === 'Escape') close();
  }

  function buildOverlay() {
    const header = title
      ? h('div', { class: 'd-modal-header' },
          h('span', null, title),
          h('button', { class: 'd-modal-close', onclick: close }, '\u00d7')
        )
      : null;

    const body = h('div', { class: 'd-modal-body' }, ...children);

    const content = h('div', {
      class: cx('d-modal-content', cls),
      style: { width }
    });

    if (header) content.appendChild(header);
    content.appendChild(body);

    // Prevent click on content from closing
    content.addEventListener('click', e => {
      e._stopModal = true;
    });

    const ov = h('div', { class: 'd-modal-overlay' }, content);

    ov.addEventListener('click', e => {
      if (!e._stopModal) close();
    });

    return ov;
  }

  createEffect(() => {
    const show = visible();
    if (show && !overlay) {
      overlay = buildOverlay();
      if (typeof document !== 'undefined') {
        document.body.appendChild(overlay);
        if (typeof window !== 'undefined') {
          window.addEventListener('keydown', handleKeydown);
        }
      }
    } else if (!show && overlay) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeydown);
      }
      overlay = null;
    }
  });

  return sentinel;
}
