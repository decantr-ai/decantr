/**
 * Drawer — Slide-over panel from any edge of the screen.
 * Uses native <dialog> with focus trap. Supports compound sub-components.
 *
 * @module decantr/components/drawer
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFocusTrap } from './_behaviors.js';

const { div, button, span, dialog: dialogTag } = tags;

const DRAWER_SECTIONS = ['d-drawer-header', 'd-drawer-body', 'd-drawer-footer'];

function hasSection(children) {
  return children.some(c =>
    c && typeof c === 'object' && c.nodeType === 1 &&
    (c.className || '').split(/\s+/).some(cls => DRAWER_SECTIONS.includes(cls))
  );
}

/**
 * @param {Object} [props]
 * @param {Function} props.visible — Signal getter returning boolean
 * @param {Function} [props.onClose]
 * @param {'left'|'right'|'top'|'bottom'} [props.side='right']
 * @param {string} [props.title]
 * @param {Node|Node[]} [props.footer] — Footer content (wrapped in d-drawer-footer)
 * @param {string} [props.size] — CSS width/height (default: '320px')
 * @param {boolean} [props.closeOnOutside=true]
 * @param {string} [props.width] — Deprecated: use size
 * @param {string} [props.height] — Deprecated: use size
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLDialogElement}
 */
export function Drawer(props = {}, ...children) {
  injectBase();

  const {
    visible,
    onClose,
    side = 'right',
    title,
    footer,
    size,
    closeOnOutside = true,
    width,
    height,
    class: cls
  } = props;

  const isHorizontal = side === 'left' || side === 'right';
  const effectiveSize = size || (isHorizontal ? width : height) || '320px';

  const closeBtn = button({
    class: 'd-drawer-close',
    type: 'button',
    'aria-label': 'Close drawer'
  }, '\u00D7');

  const panel = div({
    class: cx('d-drawer-panel', `d-drawer-${side}`)
  });

  // Set size — runtime value from user prop
  if (isHorizontal) {
    panel.style.width = effectiveSize;
  } else {
    panel.style.height = effectiveSize;
  }

  if (hasSection(children)) {
    // Explicit sections — pass through directly
    children.forEach(c => { if (c) panel.appendChild(c); });
  } else {
    // Auto-wrap: title → header, children → body, footer → footer
    const headerChildren = [];
    if (title) headerChildren.push(span({ class: 'd-drawer-title' }, title));
    headerChildren.push(closeBtn);
    panel.appendChild(div({ class: 'd-drawer-header' }, ...headerChildren));

    if (children.length) {
      panel.appendChild(div({ class: 'd-drawer-body' }, ...children));
    }
    if (footer) {
      const footerChildren = Array.isArray(footer) ? footer : [footer];
      panel.appendChild(div({ class: 'd-drawer-footer' }, ...footerChildren));
    }
  }

  const dialog = dialogTag({
    class: cx('d-drawer', cls),
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title || 'Drawer'
  }, panel);

  const trap = createFocusTrap(dialog);

  function close() {
    if (dialog.open) dialog.close();
  }

  // Close button calls close() only — onClose fires from dialog 'close' event
  closeBtn.addEventListener('click', close);

  dialog.addEventListener('close', () => {
    trap.deactivate();
    if (onClose) onClose();
  });

  // Click on backdrop (outside panel rect) closes
  if (closeOnOutside) {
    dialog.addEventListener('click', (e) => {
      const rect = panel.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top || e.clientY > rect.bottom) {
        close();
      }
    });
  }

  dialog.addEventListener('cancel', () => {
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

  onDestroy(() => {
    trap.deactivate();
  });

  return dialog;
}

/**
 * Drawer.Header — drawer header section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Drawer.Header = function DrawerHeader(props = {}, ...children) {
  const { class: cls } = props;
  return div({ class: cx('d-drawer-header', cls) }, ...children);
};

/**
 * Drawer.Body — drawer body section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Drawer.Body = function DrawerBody(props = {}, ...children) {
  const { class: cls } = props;
  return div({ class: cx('d-drawer-body', cls) }, ...children);
};

/**
 * Drawer.Footer — drawer footer section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Drawer.Footer = function DrawerFooter(props = {}, ...children) {
  const { class: cls } = props;
  return div({ class: cx('d-drawer-footer', cls) }, ...children);
};
