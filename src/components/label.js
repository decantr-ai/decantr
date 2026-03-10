/**
 * Label — Form label with optional required indicator.
 *
 * @module decantr/components/label
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.for] - Associated input ID
 * @param {boolean} [props.required]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Label(props = {}, ...children) {
  injectBase();
  const { for: htmlFor, required, class: cls, ...rest } = props;
  return h('label', {
    class: cx('d-label', required && 'd-label-required', cls),
    for: htmlFor,
    ...rest
  }, ...children);
}
