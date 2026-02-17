import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.variant] - primary|secondary|destructive|success|warning|outline|ghost|link (default: none)
 * @param {string} [props.size] - sm|lg (default: normal)
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|Function} [props.loading]
 * @param {string} [props.class]
 * @param {boolean} [props.block]
 * @param {Function} [props.onclick]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Button(props = {}, ...children) {
  injectBase();

  const { variant, size, disabled, loading, block, class: cls, onclick, ...rest } = props;

  const className = cx(
    'd-btn',
    variant && `d-btn-${variant}`,
    size && `d-btn-${size}`,
    block && 'd-btn-block',
    cls
  );

  const btnProps = { class: className, ...rest };

  if (onclick) btnProps.onclick = onclick;

  const el = h('button', btnProps, ...children);

  // Handle reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      if (v) el.setAttribute('disabled', '');
      else el.removeAttribute('disabled');
    });
  } else if (disabled) {
    el.setAttribute('disabled', '');
  }

  // Handle reactive loading
  if (typeof loading === 'function') {
    createEffect(() => {
      const v = loading();
      if (v) {
        el.className = cx(className, 'd-btn-loading');
        el.setAttribute('disabled', '');
      } else {
        el.className = className;
        if (typeof disabled === 'function' ? !disabled() : !disabled) {
          el.removeAttribute('disabled');
        }
      }
    });
  } else if (loading) {
    el.className = cx(className, 'd-btn-loading');
    el.setAttribute('disabled', '');
  }

  return el;
}
