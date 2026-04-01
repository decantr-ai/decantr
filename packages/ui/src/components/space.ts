/**
 * Space — Flex layout utility for consistent spacing between children.
 * Replaces manual _flex _gap* patterns with a semantic component.
 *
 * @module decantr/components/space
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface SpaceProps {
  direction?: 'horizontal'|'vertical';
  align?: 'start'|'center'|'end'|'between'|'around'|'evenly';
  gap?: number|string;
  wrap?: boolean;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {'horizontal'|'vertical'} [props.direction='horizontal']
 * @param {'start'|'center'|'end'|'between'|'around'|'evenly'} [props.align]
 * @param {number|string} [props.gap] - Gap size (number = sp-N token, string = custom CSS)
 * @param {boolean} [props.wrap=false]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export const Space = component<SpaceProps>((props: SpaceProps = {} as SpaceProps, ...children: (string | Node)[]) => {
  injectBase();
  const { direction = 'horizontal', align, gap, wrap, class: cls, ...rest } = props;

  const className = cx(
    'd-space',
    direction === 'vertical' && 'd-space-vertical',
    wrap && 'd-space-wrap',
    cls
  );

  const style = {};
  if (gap !== undefined) {
    style.gap = typeof gap === 'number' ? `var(--d-sp-${gap})` : gap;
  }
  if (align) {
    const map = { start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between', around: 'space-around', evenly: 'space-evenly' };
    if (direction === 'vertical') style.alignItems = map[align] || align;
    else style.justifyContent = map[align] || align;
  }

  return h('div', { class: className, style: Object.keys(style).length ? style : undefined, ...rest }, ...children);
})
