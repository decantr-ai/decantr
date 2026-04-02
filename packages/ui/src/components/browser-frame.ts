/**
 * BrowserFrame — Decorative browser chrome wrapper with macOS-style title bar.
 * Used for showcasing screenshots, demos, and code previews.
 *
 * @module decantr/components/browser-frame
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface BrowserFrameProps {
  url?: string;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.url] - URL text to display in the address bar
 * @param {string} [props.class]
 * @param {...(HTMLElement|string)} children - Content to render inside the frame
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const BrowserFrame = component<BrowserFrameProps>((props: BrowserFrameProps = {} as BrowserFrameProps, ...children: (string | Node)[]) => {
  injectBase();

  const { url = '', class: cls } = props;

  const frame = h('div', { class: cx('d-browser-frame', cls) });

  // Title bar with traffic light dots + URL
  const bar = h('div', { class: 'd-browser-frame-bar' });
  const dots = h('div', { class: 'd-browser-frame-dots' });
  dots.appendChild(h('span', { class: 'd-browser-frame-dot' }));
  dots.appendChild(h('span', { class: 'd-browser-frame-dot' }));
  dots.appendChild(h('span', { class: 'd-browser-frame-dot' }));
  bar.appendChild(dots);

  if (url) {
    bar.appendChild(h('span', { class: 'd-browser-frame-url' }, url));
  }

  frame.appendChild(bar);

  // Body
  const body = h('div', { class: 'd-browser-frame-body' });
  for (const child of children) {
    if (child instanceof Node) {
      body.appendChild(child);
    } else if (child != null) {
      body.appendChild(document.createTextNode(String(child)));
    }
  }
  frame.appendChild(body);

  return frame;
})
