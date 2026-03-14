/**
 * Tooltip — Informational popup that appears on hover or focus.
 * Uses createOverlay behavior with hover trigger.
 *
 * @module decantr/components/tooltip
 */
import { onDestroy } from '../core/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

const { div } = tags;

/**
 * @param {Object} [props]
 * @param {string} props.content - Tooltip text
 * @param {string} [props.position] - top|bottom|left|right (default: top)
 * @param {number} [props.delay] - Show delay in ms (default: 200)
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function Tooltip(props = {}, ...children) {
  injectBase();

  const { content, position = 'top', delay = 200, class: cls } = props;

  const tooltipId = `d-tooltip-${_tooltipId++}`;

  const tooltipEl = div({
    class: cx('d-tooltip', `d-tooltip-${position}`, cls),
    role: 'tooltip',
    id: tooltipId
  }, content);

  const wrapper = div({ class: 'd-tooltip-wrap', 'aria-describedby': tooltipId }, ...children, tooltipEl);

  const overlay = createOverlay(wrapper, tooltipEl, {
    trigger: 'hover',
    hoverDelay: delay,
    hoverCloseDelay: 0,
    closeOnEscape: true,
    closeOnOutside: false
  });

  // Keyboard a11y: show on focusin, hide on focusout
  wrapper.addEventListener('focusin', () => overlay.open());
  wrapper.addEventListener('focusout', () => overlay.close());

  onDestroy(() => {
    overlay.destroy();
  });

  return wrapper;
}

let _tooltipId = 0;
