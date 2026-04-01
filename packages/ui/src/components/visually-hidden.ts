/**
 * VisuallyHidden — Screen-reader-only content wrapper.
 * Renders content that is visually hidden but accessible to assistive technology.
 *
 * @module decantr/components/visually-hidden
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function VisuallyHidden(props = {}, ...children) {
  injectBase();
  const { class: cls, ...rest } = props;
  return h('span', { class: cx('d-sr-only', cls), ...rest }, ...children);
}
