/**
 * AlertDialog — Confirmation dialog that requires explicit user action.
 * Uses native <dialog> with focus trap. Blocks interaction until resolved.
 *
 * @module decantr/components/alert-dialog
 */
import { h, onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createFocusTrap } from './_behaviors.js';

let _adid = 0;

/**
 * @param {Object} [props]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {Function} props.visible - Signal getter for visibility
 * @param {Function} [props.onConfirm]
 * @param {Function} [props.onCancel]
 * @param {string} [props.confirmText='Confirm']
 * @param {string} [props.cancelText='Cancel']
 * @param {string} [props.variant='destructive'] - Confirm button variant
 * @param {string} [props.class]
 * @returns {HTMLDialogElement}
 */
export function AlertDialog(props = {}) {
  injectBase();
  const { title, description, visible, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'destructive', class: cls } = props;

  const instanceId = _adid++;
  const titleId = title ? `d-alertdialog-t-${instanceId}` : undefined;
  const descId = description ? `d-alertdialog-d-${instanceId}` : undefined;

  const body = h('div', { class: 'd-alertdialog-body' });
  if (title) body.appendChild(h('div', { class: 'd-alertdialog-title', id: titleId }, title));
  if (description) body.appendChild(h('div', { class: 'd-alertdialog-desc', id: descId }, description));

  const cancelBtn = h('button', { type: 'button', class: 'd-btn d-btn-outline' }, cancelText);
  const confirmBtn = h('button', { type: 'button', class: `d-btn d-btn-${variant}` }, confirmText);

  const footer = h('div', { class: 'd-alertdialog-footer' }, cancelBtn, confirmBtn);

  const panel = h('div', { class: cx('d-alertdialog-panel', cls) }, body, footer);

  const dialogAttrs = {
    class: 'd-alertdialog',
    role: 'alertdialog',
    'aria-modal': 'true'
  };
  if (titleId) dialogAttrs['aria-labelledby'] = titleId;
  if (descId) dialogAttrs['aria-describedby'] = descId;

  const dialog = h('dialog', dialogAttrs, panel);

  const focusTrap = createFocusTrap(panel);

  function close() {
    focusTrap.deactivate();
    if (dialog.open) dialog.close();
  }

  cancelBtn.addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  confirmBtn.addEventListener('click', () => {
    close();
    if (onConfirm) onConfirm();
  });

  // Prevent backdrop close (user must use buttons)
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
    if (onCancel) onCancel();
  });

  if (typeof visible === 'function') {
    createEffect(() => {
      if (visible()) {
        if (!dialog.open) dialog.showModal();
        focusTrap.activate();
        // Focus cancel button as initial focus (least destructive action)
        cancelBtn.focus();
      } else {
        close();
      }
    });
  }

  onDestroy(() => {
    focusTrap.deactivate();
    if (dialog.open) dialog.close();
  });

  return dialog;
}
