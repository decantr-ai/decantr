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
 * @returns {HTMLDialogElement}
 */
export function Modal(props = {}, ...children) {
  injectBase();

  const { title, visible, onClose, width = '480px', class: cls } = props;

  const closeBtn = h('button', {
    class: 'd-modal-close',
    type: 'button',
    'aria-label': 'Close'
  }, '\u00d7');

  const header = title
    ? h('div', { class: 'd-modal-header' },
        h('span', null, title),
        closeBtn
      )
    : null;

  const body = h('div', { class: 'd-modal-body' }, ...children);

  const dialog = h('dialog', {
    class: cx('d-modal-content', cls),
    style: { width }
  });

  if (header) dialog.appendChild(header);
  dialog.appendChild(body);

  function close() {
    if (dialog.open) dialog.close();
    if (onClose) onClose();
  }

  closeBtn.addEventListener('click', close);

  // Click on backdrop (outside dialog rect) closes
  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom) {
      close();
    }
  });

  // Native dialog fires 'close' on Escape — sync with onClose
  dialog.addEventListener('close', () => {
    if (onClose) onClose();
  });

  if (typeof visible === 'function') {
    createEffect(() => {
      if (visible()) {
        if (!dialog.open) dialog.showModal();
      } else {
        if (dialog.open) dialog.close();
      }
    });
  }

  return dialog;
}
