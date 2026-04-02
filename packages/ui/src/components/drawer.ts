/**
 * Drawer — Slide-over panel from any edge of the screen.
 * Uses native <dialog> with focus trap. Supports compound sub-components.
 *
 * @module decantr/components/drawer
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFocusTrap } from './_behaviors.js';
import { icon } from './icon.js';

import { component } from '../runtime/component.js';
export interface DrawerProps {
  visible?: () => boolean;
  onClose?: () => void;
  side?: 'left'|'right'|'top'|'bottom';
  title?: string;
  footer?: Node | Node[];
  size?: string;
  closeOnOutside?: boolean;
  width?: string;
  height?: string;
  class?: string;
  [key: string]: unknown;
}

const { div, button, span, dialog: dialogTag } = tags;

const DRAWER_SECTIONS = ['d-drawer-header', 'd-drawer-body', 'd-drawer-footer'];

function hasSection(children: any) {
  return children.some((c: any) =>
    c && typeof c === 'object' && c.nodeType === 1 &&
    (c.className || '').split(/\s+/).some((cls: any) => DRAWER_SECTIONS.includes(cls))
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
// @ts-expect-error -- strict-mode fix (auto)
export const Drawer = component<DrawerProps>((props: DrawerProps = {} as DrawerProps, ...children: (string | Node)[]) => {
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
  // @ts-expect-error -- strict-mode fix (auto)
  }, icon('x', { size: '1em' }));

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
    // @ts-expect-error -- strict-mode fix (auto)
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
  let _closing = false;
  const EXIT_DURATION = 200;
  const _canAnimate = typeof document !== 'undefined' && typeof document.getAnimations === 'function';

  // Reverse slide-out direction based on side
  const exitAnim = {
    left: 'd-slideout-l', right: 'd-slideout-r',
    top: 'd-slideout-t', bottom: 'd-slideout-b'
  }[side] || 'd-slideout-r';

  function animateClose(callback: any) {
    if (_closing) return;
    if (!_canAnimate) {
      // @ts-expect-error -- strict-mode fix (auto)
      if (dialog.open) dialog.close();
      if (callback) callback();
      return;
    }
    _closing = true;
    panel.style.animation = `${exitAnim} ${EXIT_DURATION}ms var(--d-easing-accelerate, ease-in) both`;
    dialog.style.animation = `d-fadeout ${EXIT_DURATION}ms var(--d-easing-accelerate, ease-in) both`;
    setTimeout(() => {
      _closing = false;
      panel.style.animation = '';
      dialog.style.animation = '';
      // @ts-expect-error -- strict-mode fix (auto)
      if (dialog.open) dialog.close();
      if (callback) callback();
    }, EXIT_DURATION);
  }

  function close() {
    // @ts-expect-error -- strict-mode fix (auto)
    if (!dialog.open) return;
    animateClose(() => {
      trap.deactivate();
      if (onClose) onClose();
    });
  }

  // Close button calls close() with animation
  closeBtn.addEventListener('click', close);

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

  // Intercept Escape — animate before native close
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });

  if (typeof visible === 'function') {
    createEffect(() => {
      if (visible()) {
        // @ts-expect-error -- strict-mode fix (auto)
        if (!dialog.open) { dialog.showModal(); trap.activate(); }
      } else {
        // @ts-expect-error -- strict-mode fix (auto)
        if (dialog.open) animateClose(() => { trap.deactivate(); });
      }
    });
  }

  onDestroy(() => {
    trap.deactivate();
  });

  return dialog;
})

/**
 * Drawer.Header — drawer header section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface DrawerHeaderProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Drawer.Header = function DrawerHeader(props: DrawerHeaderProps = {} as DrawerHeaderProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-drawer-header', cls) }, ...children);
};

/**
 * Drawer.Body — drawer body section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface DrawerBodyProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Drawer.Body = function DrawerBody(props: DrawerBodyProps = {} as DrawerBodyProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-drawer-body', cls) }, ...children);
};

/**
 * Drawer.Footer — drawer footer section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface DrawerFooterProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Drawer.Footer = function DrawerFooter(props: DrawerFooterProps = {} as DrawerFooterProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return div({ class: cx('d-drawer-footer', cls) }, ...children);
};
