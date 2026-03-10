import { h, onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createFocusTrap } from './_behaviors.js';

const MODAL_SECTIONS = ['d-modal-header', 'd-modal-body', 'd-modal-footer'];

function hasSection(children) {
  return children.some(c =>
    c && typeof c === 'object' && c.nodeType === 1 &&
    (c.className || '').split(/\s+/).some(cls => MODAL_SECTIONS.includes(cls))
  );
}

/**
 * @param {Object} [props]
 * @param {string} [props.title]
 * @param {Node|Node[]} [props.footer] - Footer content (wrapped in d-modal-footer)
 * @param {Function} props.visible - Signal getter for visibility
 * @param {Function} [props.onClose]
 * @param {string} [props.width] - CSS width (default: 480px)
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLDialogElement}
 */
export function Modal(props = {}, ...children) {
  injectBase();

  const { title, footer, visible, onClose, width = '480px', class: cls } = props;

  const closeBtn = h('button', {
    class: 'd-modal-close',
    type: 'button',
    'aria-label': 'Close'
  }, '\u00d7');

  const panel = h('div', {
    class: cx('d-modal-panel', cls),
    style: { width }
  });

  if (hasSection(children)) {
    // Explicit sections — pass through directly
    children.forEach(c => { if (c) panel.appendChild(c); });
  } else {
    // Auto-wrap: title → header, children → body, footer → footer
    if (title) {
      panel.appendChild(h('div', { class: 'd-modal-header' },
        h('span', { class: 'd-modal-title' }, title),
        closeBtn
      ));
    }
    if (children.length) {
      panel.appendChild(h('div', { class: 'd-modal-body' }, ...children));
    }
    if (footer) {
      const footerChildren = Array.isArray(footer) ? footer : [footer];
      panel.appendChild(h('div', { class: 'd-modal-footer' }, ...footerChildren));
    }
  }

  // Ensure close button exists in panel (for explicit section mode without header)
  if (!panel.querySelector('.d-modal-close')) {
    const firstChild = panel.firstChild;
    if (firstChild) firstChild.appendChild(closeBtn);
  }

  const dialog = h('dialog', {
    class: 'd-modal-content'
  }, panel);

  function close() {
    if (dialog.open) dialog.close();
    if (onClose) onClose();
  }

  closeBtn.addEventListener('click', close);

  // Click on backdrop (outside panel rect) closes
  dialog.addEventListener('click', (e) => {
    const rect = panel.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom) {
      close();
    }
  });

  // Native dialog fires 'close' on Escape — sync with onClose
  dialog.addEventListener('close', () => {
    if (onClose) onClose();
  });

  // Focus trap for accessibility (WCAG AA)
  const focusTrap = createFocusTrap(panel);

  if (typeof visible === 'function') {
    createEffect(() => {
      if (visible()) {
        if (!dialog.open) dialog.showModal();
        focusTrap.activate();
      } else {
        focusTrap.deactivate();
        if (dialog.open) dialog.close();
      }
    });
  }

  onDestroy(() => {
    focusTrap.deactivate();
    if (dialog.open) dialog.close();
  });

  return dialog;
}

/**
 * Modal.Header - modal header section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Modal.Header = function ModalHeader(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-modal-header', cls) }, ...children);
};

/**
 * Modal.Body - modal body section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Modal.Body = function ModalBody(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-modal-body', cls) }, ...children);
};

/**
 * Modal.Footer - modal footer section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Modal.Footer = function ModalFooter(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-modal-footer', cls) }, ...children);
};
