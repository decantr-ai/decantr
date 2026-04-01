import { h, onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createFocusTrap } from './_behaviors.js';

const MODAL_SECTIONS = ['d-modal-header', 'd-modal-body', 'd-modal-footer'];
let _mid = 0;

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
  const titleId = title ? 'd-modal-t-' + (_mid++) : undefined;

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
        h('span', { class: 'd-modal-title', id: titleId }, title),
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

  const dialogAttrs = {
    class: 'd-modal-content',
    'aria-modal': 'true'
  };
  if (titleId) dialogAttrs['aria-labelledby'] = titleId;

  const dialog = h('dialog', dialogAttrs, panel);

  let _closing = false;
  const EXIT_DURATION = 150;
  const _canAnimate = typeof document !== 'undefined' && typeof document.getAnimations === 'function';

  function animateClose(callback) {
    if (_closing) return;
    if (!_canAnimate) {
      if (dialog.open) dialog.close();
      if (callback) callback();
      return;
    }
    _closing = true;
    panel.style.animation = `d-scaleout ${EXIT_DURATION}ms var(--d-easing-accelerate, ease-in) both`;
    dialog.style.animation = `d-fadeout ${EXIT_DURATION}ms var(--d-easing-accelerate, ease-in) both`;
    setTimeout(() => {
      _closing = false;
      panel.style.animation = '';
      dialog.style.animation = '';
      if (dialog.open) dialog.close();
      if (callback) callback();
    }, EXIT_DURATION);
  }

  function close() {
    if (!dialog.open) return;
    animateClose(() => { if (onClose) onClose(); });
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

  // Intercept Escape — animate before native close
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
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
        if (dialog.open) animateClose();
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
