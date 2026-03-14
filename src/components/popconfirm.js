/**
 * Popconfirm — Confirmation popover attached to a trigger element.
 * Uses createOverlay behavior for positioning.
 *
 * @module decantr/components/popconfirm
 */
import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

const { div, span, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {string} [props.title='Are you sure?']
 * @param {string} [props.description]
 * @param {Function} [props.onConfirm]
 * @param {Function} [props.onCancel]
 * @param {string} [props.confirmText='Yes']
 * @param {string} [props.cancelText='No']
 * @param {Node} [props.icon]
 * @param {'top'|'bottom'|'left'|'right'} [props.position='top']
 * @param {Function} props.trigger - Returns trigger element
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Popconfirm(props = {}) {
  injectBase();
  const {
    title = 'Are you sure?', description, onConfirm, onCancel,
    confirmText = 'Yes', cancelText = 'No', icon, position = 'top',
    trigger, class: cls
  } = props;

  const triggerEl = typeof trigger === 'function' ? trigger() : buttonTag({ type: 'button' }, 'Click');

  const cancelBtn = buttonTag({ type: 'button', class: 'd-btn d-btn-sm d-btn-outline' }, cancelText);
  const confirmBtn = buttonTag({ type: 'button', class: 'd-btn d-btn-sm d-btn-primary' }, confirmText);

  const body = div({ class: 'd-popconfirm-body' });
  if (icon) body.appendChild(span({ class: 'd-popconfirm-icon' }, typeof icon === 'string' ? icon : icon));
  const textWrap = div({ class: 'd-popconfirm-text' });
  textWrap.appendChild(div({ class: 'd-popconfirm-title' }, title));
  if (description) textWrap.appendChild(div({ class: 'd-popconfirm-desc' }, description));
  body.appendChild(textWrap);

  const footer = div({ class: 'd-popconfirm-footer' }, cancelBtn, confirmBtn);

  const content = div({
    class: cx('d-popconfirm', `d-popover-${position}`, cls)
  }, body, footer);

  const wrap = div({ class: 'd-popconfirm-wrap' }, triggerEl, content);

  const overlay = createOverlay(triggerEl, content, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true
  });

  cancelBtn.addEventListener('click', () => { overlay.close(); if (onCancel) onCancel(); });
  confirmBtn.addEventListener('click', () => { overlay.close(); if (onConfirm) onConfirm(); });

  onDestroy(() => {
    overlay.destroy();
  });

  return wrap;
}
