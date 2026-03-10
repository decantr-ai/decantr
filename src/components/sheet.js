/**
 * Sheet — Slide-over panel from any edge of the screen.
 * Uses native <dialog> with focus trap. Like a Drawer.
 *
 * @module decantr/components/sheet
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createFocusTrap } from './_behaviors.js';

const SHEET_SECTIONS = ['d-sheet-header', 'd-sheet-body', 'd-sheet-footer'];

function hasSection(children) {
  return children.some(c =>
    c && typeof c === 'object' && c.nodeType === 1 &&
    (c.className || '').split(/\s+/).some(cls => SHEET_SECTIONS.includes(cls))
  );
}

/**
 * @param {Object} [props]
 * @param {string} [props.title]
 * @param {Node|Node[]} [props.footer] - Footer content (wrapped in d-sheet-footer)
 * @param {Function} props.visible - Signal getter for visibility
 * @param {Function} [props.onClose]
 * @param {'left'|'right'|'top'|'bottom'} [props.side='right']
 * @param {string} [props.size] - CSS width/height (default: 320px)
 * @param {boolean} [props.closeOnOutside=true]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLDialogElement}
 */
export function Sheet(props = {}, ...children) {
  injectBase();
  const { title, footer, visible, onClose, side = 'right', size = '320px', closeOnOutside = true, class: cls } = props;

  const closeBtn = h('button', { type: 'button', class: 'd-sheet-close', 'aria-label': 'Close' }, '\u00d7');

  const sizeStyle = (side === 'left' || side === 'right') ? { width: size } : { height: size };

  const panel = h('div', {
    class: cx('d-sheet-panel', `d-sheet-${side}`),
    style: sizeStyle
  });

  if (hasSection(children)) {
    // Explicit sections — pass through directly
    children.forEach(c => { if (c) panel.appendChild(c); });
  } else {
    // Auto-wrap: title → header, children → body, footer → footer
    const header = h('div', { class: 'd-sheet-header' });
    if (title) header.appendChild(h('span', { class: 'd-sheet-title' }, title));
    header.appendChild(closeBtn);
    panel.appendChild(header);

    if (children.length) {
      panel.appendChild(h('div', { class: 'd-sheet-body' }, ...children));
    }
    if (footer) {
      const footerChildren = Array.isArray(footer) ? footer : [footer];
      panel.appendChild(h('div', { class: 'd-sheet-footer' }, ...footerChildren));
    }
  }

  const dialog = h('dialog', {
    class: cx('d-sheet', cls),
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title || 'Panel'
  }, panel);

  const trap = createFocusTrap(dialog);

  function close() {
    if (dialog.open) dialog.close();
  }

  closeBtn.addEventListener('click', () => { close(); if (onClose) onClose(); });

  dialog.addEventListener('close', () => { trap.deactivate(); if (onClose) onClose(); });

  if (closeOnOutside) {
    dialog.addEventListener('click', (e) => {
      const rect = panel.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        close();
        if (onClose) onClose();
      }
    });
  }

  dialog.addEventListener('cancel', (e) => {
    if (onClose) onClose();
  });

  if (typeof visible === 'function') {
    createEffect(() => {
      if (visible()) {
        if (!dialog.open) { dialog.showModal(); trap.activate(); }
      } else {
        close();
      }
    });
  }

  return dialog;
}

/**
 * Sheet.Header - sheet header section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Sheet.Header = function SheetHeader(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-sheet-header', cls) }, ...children);
};

/**
 * Sheet.Body - sheet body section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Sheet.Body = function SheetBody(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-sheet-body', cls) }, ...children);
};

/**
 * Sheet.Footer - sheet footer section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Sheet.Footer = function SheetFooter(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-sheet-footer', cls) }, ...children);
};
