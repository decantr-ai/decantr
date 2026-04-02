/**
 * InputGroup — Compose inputs with addons (text, icons, buttons, selects).
 * CompactGroup — Border-merged mixed controls.
 *
 * @module decantr/components/input-group
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx, reactiveClass, reactiveAttr, resolve } from './_base.js';

import { component } from '../runtime/component.js';
export interface InputGroupProps {
  vertical?: boolean;
  size?: string;
  error?: boolean | (() => boolean);
  disabled?: boolean | (() => boolean);
  class?: string;
  [key: string]: unknown;
}

export interface CompactGroupProps {
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {boolean} [props.vertical=false] - Stack vertically (for textarea header/footer)
 * @param {string} [props.size] - xs|sm|lg - Propagates addon sizing
 * @param {boolean|Function} [props.error] - Error state on whole group
 * @param {boolean|Function} [props.disabled] - Disabled state on whole group
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const InputGroup = component<InputGroupProps>((props: InputGroupProps = {} as InputGroupProps, ...children: (string | Node)[]) => {
  injectBase();

  const { vertical = false, size, error, disabled, class: cls, ...rest } = props;

  const className = cx(
    'd-input-group',
    vertical && 'd-input-group-vertical',
    size && `d-input-group-${size}`,
    cls
  );

  const el = h('div', { class: className, role: 'group', ...rest }, ...children);

  reactiveClass(el, error, className, cx(className, 'd-input-group-error'));
  reactiveAttr(el, disabled, 'data-disabled');

  return el;
})

/**
 * Static addon sub-component.
 * Smart first-arg: string/Node → child, object → props.
 *
 * @param {Object|string|Node} [propsOrChild]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface InputGroupAddonProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
InputGroup.Addon = function Addon(propsOrChild: any, ...children: (string | Node)[]) {
  injectBase();

  // Smart first-arg detection: string, DOM node (has nodeType), or null → treat as child
  if (propsOrChild == null || typeof propsOrChild === 'string' || (propsOrChild && propsOrChild.nodeType)) {
    return h('div', { class: 'd-input-group-addon' },
      ...(propsOrChild != null ? [propsOrChild, ...children] : children));
  }

  const { class: cls, ...rest } = propsOrChild;
  return h('div', { class: cx('d-input-group-addon', cls), ...rest }, ...children);
};

/**
 * CompactGroup — Border-merged mixed controls.
 *
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const CompactGroup = component<CompactGroupProps>((props: CompactGroupProps = {} as CompactGroupProps, ...children: (string | Node)[]) => {
  injectBase();

  const { class: cls, ...rest } = props;
  return h('div', { class: cx('d-compact-group', cls), role: 'group', ...rest }, ...children);
})
