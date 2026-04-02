/**
 * Label — Form label with optional required indicator.
 *
 * @module decantr/components/label
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface LabelProps {
  for?: string;
  required?: boolean;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.for] - Associated input ID
 * @param {boolean} [props.required]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const Label = component<LabelProps>((props: LabelProps = {} as LabelProps, ...children: (string | Node)[]) => {
  injectBase();
  const { for: htmlFor, required, class: cls, ...rest } = props;
  return h('label', {
    class: cx('d-label', required && 'd-label-required', cls),
    for: htmlFor,
    ...rest
  }, ...children);
})
