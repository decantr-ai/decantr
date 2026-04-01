/**
 * AspectRatio — Constrains child to a fixed aspect ratio.
 *
 * @module decantr/components/aspect-ratio
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface AspectRatioProps {
  ratio?: number;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {number} [props.ratio=16/9] - Width/height ratio
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export const AspectRatio = component<AspectRatioProps>((props: AspectRatioProps = {} as AspectRatioProps, ...children: (string | Node)[]) => {
  injectBase();
  const { ratio = 16 / 9, class: cls, ...rest } = props;
  return h('div', {
    class: cx('d-aspect', cls),
    style: { aspectRatio: String(ratio) },
    ...rest
  }, ...children);
})
