/**
 * BackTop — Floating scroll-to-top button that appears after scrolling.
 *
 * @module decantr/components/back-top
 */
import { h, onCleanup } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { icon } from './icon.js';

import { component } from '../runtime/component.js';
export interface BackTopProps {
  visibilityHeight?: number;
  target?: HTMLElement;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {number} [props.visibilityHeight=400] - Scroll threshold in px
 * @param {HTMLElement} [props.target] - Scroll container (default: window)
 * @param {string} [props.class]
 * @param {...Node} children - Custom button content
 * @returns {HTMLElement}
 */
export const BackTop = component<BackTopProps>((props: BackTopProps = {} as BackTopProps, ...children: (string | Node)[]) => {
  injectBase();
  const { visibilityHeight = 400, target, class: cls } = props;

  const hasCustomContent = children.flat().filter(c => c && c.nodeType).length > 0;
  const content = hasCustomContent
    ? children.flat().filter(c => c && c.nodeType)
    : [icon('arrow-up', { size: '1.25em' })];

  const btn = h('button', {
    type: 'button',
    class: cx('d-backtop', 'd-backtop-hidden', cls),
    'aria-label': 'Scroll to top'
  }, ...content);

  function getScrollTop() {
    if (target) return target.scrollTop;
    return document.documentElement.scrollTop || document.body.scrollTop;
  }

  function scrollToTop() {
    const scrollEl = target || window;
    if (scrollEl.scrollTo) {
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollEl.scrollTop = 0;
    }
  }

  function onScroll() {
    const scrollTop = getScrollTop();
    if (scrollTop >= visibilityHeight) {
      btn.classList.remove('d-backtop-hidden');
      btn.classList.add('d-backtop-visible');
    } else {
      btn.classList.remove('d-backtop-visible');
      btn.classList.add('d-backtop-hidden');
    }
  }

  btn.addEventListener('click', scrollToTop);

  // Attach scroll listener
  const scrollTarget = target || window;
  scrollTarget.addEventListener('scroll', onScroll, { passive: true });

  // Initial check
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(onScroll);
  }

  // Cleanup scroll listener when component is disposed
  onCleanup(() => {
    scrollTarget.removeEventListener('scroll', onScroll);
  });

  return btn;
})
