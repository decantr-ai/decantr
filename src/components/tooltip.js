import { h, onDestroy } from '../core/index.js';
import { injectBase, cx } from './_base.js';

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

  const tooltipEl = h('div', {
    class: cx('d-tooltip', `d-tooltip-${position}`, cls),
    role: 'tooltip',
    style: { display: 'none' }
  }, content);

  const wrapper = h('div', { class: 'd-tooltip-wrap' }, ...children, tooltipEl);

  let showTimer = null;

  function show() {
    showTimer = setTimeout(() => { tooltipEl.style.display = ''; }, delay);
  }

  function hide() {
    clearTimeout(showTimer);
    tooltipEl.style.display = 'none';
  }

  wrapper.addEventListener('mouseenter', show);
  wrapper.addEventListener('mouseleave', hide);
  wrapper.addEventListener('focusin', show);
  wrapper.addEventListener('focusout', hide);

  onDestroy(() => {
    clearTimeout(showTimer);
  });

  return wrapper;
}
