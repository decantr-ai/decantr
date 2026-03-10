/**
 * Popconfirm — Confirmation popover attached to a trigger element.
 * Uses createOverlay behavior for positioning.
 *
 * @module decantr/components/popconfirm
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

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

  const triggerEl = typeof trigger === 'function' ? trigger() : h('button', { type: 'button' }, 'Click');

  const cancelBtn = h('button', { type: 'button', class: 'd-btn d-btn-sm d-btn-outline' }, cancelText);
  const confirmBtn = h('button', { type: 'button', class: 'd-btn d-btn-sm d-btn-primary' }, confirmText);

  const body = h('div', { class: 'd-popconfirm-body' });
  if (icon) body.appendChild(h('span', { class: 'd-popconfirm-icon' }, typeof icon === 'string' ? icon : icon));
  const textWrap = h('div', { class: 'd-popconfirm-text' });
  textWrap.appendChild(h('div', { class: 'd-popconfirm-title' }, title));
  if (description) textWrap.appendChild(h('div', { class: 'd-popconfirm-desc' }, description));
  body.appendChild(textWrap);

  const footer = h('div', { class: 'd-popconfirm-footer' }, cancelBtn, confirmBtn);

  const content = h('div', {
    class: cx('d-popconfirm', `d-popover-${position}`, cls),
    style: { display: 'none' }
  }, body, footer);

  const wrap = h('div', { class: 'd-popconfirm-wrap' }, triggerEl, content);

  const overlay = createOverlay(triggerEl, content, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true
  });

  cancelBtn.addEventListener('click', () => { overlay.close(); if (onCancel) onCancel(); });
  confirmBtn.addEventListener('click', () => { overlay.close(); if (onConfirm) onConfirm(); });

  return wrap;
}
