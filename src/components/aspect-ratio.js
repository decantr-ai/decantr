/**
 * AspectRatio — Constrains child to a fixed aspect ratio.
 *
 * @module decantr/components/aspect-ratio
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number} [props.ratio=16/9] - Width/height ratio
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function AspectRatio(props = {}, ...children) {
  injectBase();
  const { ratio = 16 / 9, class: cls, ...rest } = props;
  return h('div', {
    class: cx('d-aspect', cls),
    style: { aspectRatio: String(ratio) },
    ...rest
  }, ...children);
}
