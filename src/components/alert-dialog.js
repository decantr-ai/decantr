/**
 * AlertDialog — Confirmation dialog that requires explicit user action.
 * Uses native <dialog> with focus trap. Blocks interaction until resolved.
 *
 * @module decantr/components/alert-dialog
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

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

  const body = h('div', { class: 'd-alertdialog-body' });
  if (title) body.appendChild(h('div', { class: 'd-alertdialog-title', id: 'd-alertdialog-title' }, title));
  if (description) body.appendChild(h('div', { class: 'd-alertdialog-desc' }, description));

  const cancelBtn = h('button', { type: 'button', class: 'd-btn d-btn-outline' }, cancelText);
  const confirmBtn = h('button', { type: 'button', class: `d-btn d-btn-${variant}` }, confirmText);

  const footer = h('div', { class: 'd-alertdialog-footer' }, cancelBtn, confirmBtn);

  const panel = h('div', { class: cx('d-alertdialog-panel', cls) }, body, footer);

  const dialog = h('dialog', {
    class: 'd-alertdialog',
    role: 'alertdialog',
    'aria-modal': 'true',
    'aria-labelledby': title ? 'd-alertdialog-title' : undefined
  }, panel);

  function close() {
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
      if (visible()) { if (!dialog.open) dialog.showModal(); }
      else close();
    });
  }

  return dialog;
}
