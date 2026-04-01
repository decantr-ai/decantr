/**
 * HoverCard — Content card that appears on hover over a trigger.
 * Uses createOverlay behavior with hover trigger.
 *
 * @module decantr/components/hover-card
 */
import { onDestroy } from '../runtime/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

const { div, span } = tags;

/**
 * @param {Object} [props]
 * @param {Function} [props.trigger] - Returns trigger element
 * @param {'top'|'bottom'|'left'|'right'} [props.position='bottom']
 * @param {number} [props.openDelay=300]
 * @param {number} [props.closeDelay=200]
 * @param {string} [props.class]
 * @param {...Node} children - Card content
 * @returns {HTMLElement}
 */
export function HoverCard(props = {}, ...children) {
  injectBase();
  const { trigger, position = 'bottom', openDelay = 300, closeDelay = 200, class: cls, ...rest } = props;

  const triggerEl = typeof trigger === 'function' ? trigger() : span(null, 'Hover me');

  const content = div({
    class: cx('d-hovercard-content', `d-popover-${position}`, cls),
    ...rest
  }, ...children);

  const wrap = div({ class: 'd-hovercard' }, triggerEl, content);

  const overlay = createOverlay(triggerEl, content, {
    trigger: 'hover',
    hoverDelay: openDelay,
    hoverCloseDelay: closeDelay,
    closeOnEscape: true
  });

  onDestroy(() => {
    overlay.destroy();
  });

  return wrap;
}
