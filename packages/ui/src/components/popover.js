/**
 * Popover — Floating content panel attached to a trigger element.
 * Uses createOverlay behavior for show/hide, click-outside, escape.
 *
 * @module decantr/components/popover
 */
import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

const { div } = tags;

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
    portal: usePortal = true,
    class: cls
  } = props;

  const content = div({
    class: cx('d-popover-content', `d-popover-${position}`, align !== 'center' && `d-popover-align-${align}`, cls),
    role: 'dialog'
  }, ...children);

  const wrap = div({ class: 'd-popover' });

  const triggerEl = typeof trigger === 'function' ? trigger() : tags.button({ type: 'button' }, 'Open');
  triggerEl.setAttribute('aria-haspopup', 'dialog');
  triggerEl.setAttribute('aria-expanded', 'false');
  wrap.appendChild(triggerEl);
  wrap.appendChild(content);

  const overlay = createOverlay(triggerEl, content, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    portal: usePortal,
    placement: position,
    align: align === 'center' ? 'center' : align === 'end' ? 'end' : 'start',
    onOpen: () => wrap.classList.add('d-popover-open'),
    onClose: () => wrap.classList.remove('d-popover-open')
  });

  onDestroy(() => {
    overlay.destroy();
  });

  return wrap;
}
