import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {Function} props.visible — Signal getter returning boolean
 * @param {Function} [props.onClose]
 * @param {string} [props.side] — 'left'|'right'|'top'|'bottom' (default: 'right')
 * @param {string} [props.title]
 * @param {string} [props.width] — CSS width for left/right drawers (default: '320px')
 * @param {string} [props.height] — CSS height for top/bottom drawers (default: '320px')
 * @param {string} [props.class]
 * @returns {HTMLDialogElement}
 */
export function Drawer(props = {}, ...children) {
  injectBase();

  const {
    visible,
    onClose,
    side = 'right',
    title,
    width = '320px',
    height = '320px',
    class: cls
  } = props;

  const closeBtn = h('button', {
    class: 'd-drawer-close',
    type: 'button',
    'aria-label': 'Close drawer'
  }, '\u00D7');

  const headerChildren = [];
  if (title) headerChildren.push(h('span', { class: 'd-drawer-title' }, title));
  headerChildren.push(closeBtn);
  const header = h('div', { class: 'd-drawer-header' }, ...headerChildren);

  const body = h('div', { class: 'd-drawer-body' }, ...children);

  const panel = h('div', {
    class: cx('d-drawer-panel', `d-drawer-${side}`)
  }, header, body);

  // Set size
  if (side === 'left' || side === 'right') {
    panel.style.width = width;
  } else {
    panel.style.height = height;
  }

  const dialog = h('dialog', {
    class: cx('d-drawer', cls),
    'aria-label': title || 'Drawer'
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
