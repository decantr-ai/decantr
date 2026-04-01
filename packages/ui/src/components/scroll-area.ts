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
export const ScrollArea = component<ScrollAreaProps>((props: ScrollAreaProps = {} as ScrollAreaProps, ...children: (string | Node)[]) => {
  injectBase();
  const { height, width, direction = 'vertical', class: cls, ...rest } = props;

  const style = {};
  if (height) style.height = height;
  if (width) style.width = width;

  const viewportStyle = {};
  if (direction === 'vertical') viewportStyle.overflowX = 'hidden';
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
