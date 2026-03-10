/**
 * Affix — Pins content to viewport on scroll (sticky wrapper).
 *
 * @module decantr/components/affix
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number} [props.offsetTop=0] - Offset from top in px when fixed
 * @param {number} [props.offsetBottom] - If set, pins to bottom instead
 * @param {Function} [props.onChange] - Called with (fixed: boolean) on state change
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function Affix(props = {}, ...children) {
  injectBase();
  const { offsetTop = 0, offsetBottom, onChange, class: cls, ...rest } = props;

  const placeholder = h('div', { class: cx('d-affix', cls), ...rest });
  const content = h('div', null, ...children);
  placeholder.appendChild(content);

  let fixed = false;

  function check() {
    const rect = placeholder.getBoundingClientRect();
    const shouldFix = offsetBottom !== undefined
      ? (window.innerHeight - rect.bottom) < offsetBottom
      : rect.top < offsetTop;

    if (shouldFix && !fixed) {
      fixed = true;
      content.classList.add('d-affix-fixed');
      if (offsetBottom !== undefined) {
        content.style.bottom = `${offsetBottom}px`;
      } else {
        content.style.top = `${offsetTop}px`;
      }
      content.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      if (onChange) onChange(true);
    } else if (!shouldFix && fixed) {
      fixed = false;
      content.classList.remove('d-affix-fixed');
      content.style.top = '';
      content.style.bottom = '';
      content.style.width = '';
      placeholder.style.height = '';
      if (onChange) onChange(false);
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
  }

  return placeholder;
}
