import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx, reactiveAttr } from './_base.js';
import { Spinner } from './spinner.js';
import { icon as renderIcon } from './icon.js';

import { component } from '../runtime/component.js';
export interface ButtonProps {
  variant?: string;
  size?: string;
  disabled?: boolean | (() => boolean);
  loading?: boolean | (() => boolean);
  class?: string;
  block?: boolean;
  rounded?: boolean;
  onclick?: (e: MouseEvent) => void;
  iconLeft?: unknown;
  iconRight?: unknown;
  type?: unknown;
  [key: string]: unknown;
}

const SPINNER_SIZE = {
  xs: 'xs', sm: 'xs', default: 'sm', lg: 'default',
  icon: 'sm', 'icon-xs': 'xs', 'icon-sm': 'xs', 'icon-lg': 'sm'
};

/**
 * Shared variant resolver — reusable by any element needing button styles.
 * @param {Object} [props]
 * @param {string} [props.variant] - default|primary|secondary|tertiary|destructive|success|warning|outline|ghost|link
 * @param {string} [props.size] - xs|sm|lg|icon|icon-xs|icon-sm|icon-lg
 * @returns {string} CSS class string
 */
export function buttonVariants({ variant = 'default', size = 'default' } = {}) {
  return cx('d-btn', `d-btn-${variant}`, size && size !== 'default' && `d-btn-${size}`);
}

/**
 * @param {Object} [props]
 * @param {string} [props.variant] - default|primary|secondary|tertiary|destructive|success|warning|outline|ghost|link
 * @param {string} [props.size] - xs|sm|lg|icon|icon-xs|icon-sm|icon-lg
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|Function} [props.loading]
 * @param {string} [props.class]
 * @param {boolean} [props.block]
 * @param {boolean} [props.rounded]
 * @param {Function} [props.onclick]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const Button = component<ButtonProps>((props: ButtonProps = {} as ButtonProps, ...children: (string | Node)[]) => {
  injectBase();

  const { variant, size, disabled, loading, block, rounded, iconLeft, iconRight, class: cls, onclick, type, ...rest } = props;

  const variantCls = buttonVariants({ variant, size });
  const className = cx(
    variantCls,
    block && 'd-btn-block',
    rounded && 'd-btn-rounded',
    cls
  );

  const btnProps = { class: className, type: type || 'button', ...rest };
  // @ts-expect-error -- strict-mode fix (auto)
  if (onclick) btnProps.onclick = onclick;

  // Resolve icon props — accept string name or Node
  // @ts-expect-error -- strict-mode fix (auto)
  const leftIcon = iconLeft ? (typeof iconLeft === 'string' ? renderIcon(iconLeft, { size: '1em' }) : iconLeft) : null;
  // @ts-expect-error -- strict-mode fix (auto)
  const rightIcon = iconRight ? (typeof iconRight === 'string' ? renderIcon(iconRight, { size: '1em' }) : iconRight) : null;

  const allChildren = [];
  if (leftIcon) allChildren.push(leftIcon);
  allChildren.push(...children);
  if (rightIcon) allChildren.push(rightIcon);

  // @ts-expect-error -- strict-mode fix (auto)
  const el = h('button', btnProps, ...allChildren);

  reactiveAttr(el, disabled, 'disabled');

  const resolvedSize = size || 'default';

  if (typeof loading === 'function') {
    createEffect(() => {
      const v = loading();
      if (v) {
        el.className = cx(className, 'd-btn-loading');
        el.setAttribute('disabled', '');
        el.setAttribute('aria-busy', 'true');
        _addSpinner(el, resolvedSize);
      } else {
        el.className = className;
        el.removeAttribute('aria-busy');
        _removeSpinner(el);
        if (typeof disabled === 'function' ? !disabled() : !disabled) {
          el.removeAttribute('disabled');
        }
      }
    });
  } else if (loading) {
    el.className = cx(className, 'd-btn-loading');
    el.setAttribute('disabled', '');
    el.setAttribute('aria-busy', 'true');
    _addSpinner(el, resolvedSize);
  }

  return el;
})

function _addSpinner(el: any, size: any) {
  if (el.querySelector('.d-btn-spinner')) return;
  const overlay = document.createElement('span');
  overlay.className = 'd-btn-spinner';
  // @ts-expect-error -- strict-mode fix (auto)
  overlay.appendChild(Spinner({ size: SPINNER_SIZE[size] || 'sm' }));
  el.appendChild(overlay);
}

function _removeSpinner(el: any) {
  const overlay = el.querySelector('.d-btn-spinner');
  if (overlay) overlay.remove();
}

/**
 * Button.Group — groups buttons with connected borders.
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */

export interface ButtonGroupProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
Button.Group = function Group(props: ButtonGroupProps = {} as ButtonGroupProps, ...children: (string | Node)[]) {
  injectBase();
  const { class: cls, ...rest } = props;
  return h('div', { class: cx('d-btn-group', cls), role: 'group', ...rest }, ...children);
};
