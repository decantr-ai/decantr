import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {Function} [props.trigger] — Function returning trigger element
 * @param {string} [props.position] — 'top'|'bottom'|'left'|'right' (default: 'bottom')
 * @param {string} [props.align] — 'start'|'center'|'end' (default: 'center')
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Popover(props = {}, ...children) {
  injectBase();

  const {
    trigger,
    position = 'bottom',
    align = 'center',
    class: cls
  } = props;

  const content = h('div', {
    class: cx('d-popover-content', `d-popover-${position}`, align !== 'center' && `d-popover-align-${align}`, cls),
    role: 'dialog',
    style: { display: 'none' }
  }, ...children);

  const wrap = h('div', { class: 'd-popover' });

  const triggerEl = typeof trigger === 'function' ? trigger() : h('button', { type: 'button' }, 'Open');
  triggerEl.setAttribute('aria-haspopup', 'dialog');
  triggerEl.setAttribute('aria-expanded', 'false');
  wrap.appendChild(triggerEl);
  wrap.appendChild(content);

  createOverlay(triggerEl, content, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen: () => wrap.classList.add('d-popover-open'),
    onClose: () => wrap.classList.remove('d-popover-open')
  });

  return wrap;
}
