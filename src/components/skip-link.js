/**
 * SkipLink — Accessible skip navigation link.
 * Visually hidden by default, visible on :focus for keyboard users.
 *
 * @module decantr/components/skip-link
 */
import { h } from '../core/index.js';
import { injectBase } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.target='#main-content'] - CSS selector or ID of target element
 * @param {string} [props.label='Skip to main content']
 * @returns {HTMLElement}
 */
export function SkipLink(props = {}) {
  injectBase();
  const { target = '#main-content', label = 'Skip to main content' } = props;

  const el = h('a', {
    href: target,
    class: 'd-skip-link'
  }, label);

  el.addEventListener('click', (e) => {
    e.preventDefault();
    const dest = document.querySelector(target);
    if (dest) {
      if (!dest.hasAttribute('tabindex')) dest.setAttribute('tabindex', '-1');
      dest.focus({ preventScroll: false });
    }
  });

  return el;
}
