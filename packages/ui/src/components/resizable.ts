/**
 * Resizable — Split pane layout with draggable handle.
 * Uses createDrag behavior for pointer-based resizing.
 *
 * @module decantr/components/resizable
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface ResizableProps {
  direction?: 'horizontal'|'vertical';
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  onResize?: (...args: unknown[]) => unknown;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {'horizontal'|'vertical'} [props.direction='horizontal']
 * @param {number} [props.defaultSize=50] - Default size of first panel in %
 * @param {number} [props.minSize=10] - Min size in %
 * @param {number} [props.maxSize=90] - Max size in %
 * @param {Function} [props.onResize] - Called with new size %
 * @param {string} [props.class]
 * @param {...Node} children - Exactly 2 children (panels)
 * @returns {HTMLElement}
 */
export const Resizable = component<ResizableProps>((props: ResizableProps = {} as ResizableProps, ...children: (string | Node)[]) => {
  injectBase();
  const { direction = 'horizontal', defaultSize = 50, minSize = 10, maxSize = 90, onResize, class: cls, ...rest } = props;

  const isVert = direction === 'vertical';
  let size = defaultSize;

  const panel1 = h('div', { class: 'd-resizable-panel' });
  const panel2 = h('div', { class: 'd-resizable-panel' });

  if (children[0]) panel1.appendChild(children[0]);
  if (children[1]) panel2.appendChild(children[1]);

  const handleBar = h('div', { class: 'd-resizable-handle-bar' });
  const handle = h('div', {
    class: cx('d-resizable-handle', isVert && 'd-resizable-handle-vertical'),
    role: 'separator',
    'aria-orientation': isVert ? 'horizontal' : 'vertical',
    tabindex: '0',
    'aria-valuenow': String(size),
    'aria-valuemin': String(minSize),
    'aria-valuemax': String(maxSize)
  }, handleBar);

  const container = h('div', {
    class: cx('d-resizable', isVert && 'd-resizable-vertical', cls),
    ...rest
  }, panel1, handle, panel2);

  function applySize() {
    const prop = isVert ? 'height' : 'width';
    panel1.style[prop] = `${size}%`;
    panel2.style[prop] = `${100 - size}%`;
    handle.setAttribute('aria-valuenow', String(Math.round(size)));
    if (onResize) onResize(size);
  }

  createDrag(handle, {
    onMove(x, y, dx, dy) {
      const rect = container.getBoundingClientRect();
      const total = isVert ? rect.height : rect.width;
      const delta = isVert ? dy : dx;
      const pct = (delta / total) * 100;
      size = Math.max(minSize, Math.min(maxSize, defaultSize + pct));
      applySize();
    },
    onStart() { container.style.userSelect = 'none'; },
    onEnd() { container.style.userSelect = ''; }
  });

  // Keyboard support
  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === (isVert ? 'ArrowUp' : 'ArrowLeft')) { e.preventDefault(); size = Math.max(minSize, size - step); applySize(); }
    else if (e.key === (isVert ? 'ArrowDown' : 'ArrowRight')) { e.preventDefault(); size = Math.min(maxSize, size + step); applySize(); }
    else if (e.key === 'Home') { e.preventDefault(); size = minSize; applySize(); }
    else if (e.key === 'End') { e.preventDefault(); size = maxSize; applySize(); }
  });

  applySize();
  return container;
})
