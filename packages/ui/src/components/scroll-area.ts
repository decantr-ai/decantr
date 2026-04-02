/**
 * ScrollArea — Custom scrollable container with thin scrollbar styling.
 *
 * @module decantr/components/scroll-area
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface ScrollAreaProps {
  height?: string;
  width?: string;
  direction?: 'vertical'|'horizontal'|'both';
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.height] - CSS height for the scrollable area
 * @param {string} [props.width] - CSS width
 * @param {'vertical'|'horizontal'|'both'} [props.direction='vertical']
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const ScrollArea = component<ScrollAreaProps>((props: ScrollAreaProps = {} as ScrollAreaProps, ...children: (string | Node)[]) => {
  injectBase();
  const { height, width, direction = 'vertical', class: cls, ...rest } = props;

  const style = {};
  // @ts-expect-error -- strict-mode fix (auto)
  if (height) style.height = height;
  // @ts-expect-error -- strict-mode fix (auto)
  if (width) style.width = width;

  const viewportStyle = {};
  // @ts-expect-error -- strict-mode fix (auto)
  if (direction === 'vertical') viewportStyle.overflowX = 'hidden';
  // @ts-expect-error -- strict-mode fix (auto)
  else if (direction === 'horizontal') viewportStyle.overflowY = 'hidden';

  const viewport = h('div', {
    class: 'd-scrollarea-viewport',
    style: Object.keys(viewportStyle).length ? viewportStyle : undefined,
    tabindex: '0',
    role: 'region',
    'aria-label': 'Scrollable content'
  }, ...children);

  return h('div', {
    class: cx('d-scrollarea', cls),
    style: Object.keys(style).length ? style : undefined,
    ...rest
  }, viewport);
})
