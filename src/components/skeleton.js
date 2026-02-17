import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.variant] - text|rect|circle (default: text)
 * @param {string} [props.width]
 * @param {string} [props.height]
 * @param {number} [props.lines] - Number of text lines
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Skeleton(props = {}) {
  injectBase();

  const { variant = 'text', width, height, lines, class: cls } = props;

  if (lines && lines > 1) {
    const container = h('div', { class: cx('d-skeleton-group', cls) });
    for (let i = 0; i < lines; i++) {
      const line = h('div', { class: 'd-skeleton d-skeleton-text' });
      if (i === lines - 1) line.style.width = '60%';
      container.appendChild(line);
    }
    return container;
  }

  const skeletonClass = cx(
    'd-skeleton',
    variant === 'circle' ? 'd-skeleton-circle' : variant === 'rect' ? 'd-skeleton-rect' : 'd-skeleton-text',
    cls
  );

  const el = h('div', { class: skeletonClass, 'aria-hidden': 'true' });
  if (width) el.style.width = width;
  if (height) el.style.height = height;

  return el;
}
