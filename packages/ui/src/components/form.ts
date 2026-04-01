/**
 * Form — Form wrapper with validation, layout modes, and field management.
 * Field wraps any form control with label, error, and help text.
 * Re-exports createFormField from _behaviors.js for imperative use.
 *
 * @module decantr/components/form
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';

/**
 * Form — Container for form fields.
 * @param {Object} [props]
 * @param {'vertical'|'horizontal'|'inline'} [props.layout='vertical']
 * @param {Function} [props.onSubmit]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function Form(props = {}, ...children) {
  injectBase();
  const { layout = 'vertical', onSubmit, class: cls, ...rest } = props;

  const form = h('form', {
    class: cx('d-form', layout === 'horizontal' && 'd-form-horizontal', layout === 'inline' && 'd-form-inline', cls),
    ...rest
  }, ...children);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  });

  return form;
}

/**
 * Form.Actions — Button row at bottom of form.
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
Form.Actions = function Actions(props = {}, ...children) {
  injectBase();
  const { class: cls, ...rest } = props;
  return h('div', { class: cx('d-form-actions', cls), ...rest }, ...children);
};

/**
 * Field — Wraps a form control with label, error, and help text.
 * Can be used declaratively as a component.
 *
 * @param {Object} [props]
 * @param {string} [props.label]
 * @param {string|Function} [props.error]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {string} [props.class]
 * @param {...Node} children - The form control(s)
 * @returns {HTMLElement}
 */
export function Field(props = {}, ...children) {
  injectBase();
  const { label, error, help, required, class: cls, ...rest } = props;

  const wrapper = h('div', { class: cx('d-field', cls), ...rest });

  if (label) {
    const labelEl = h('label', { class: 'd-field-label' }, label);
    if (required) {
      labelEl.appendChild(h('span', { class: 'd-field-required', 'aria-hidden': 'true' }, ' *'));
    }
    wrapper.appendChild(labelEl);
  }

  const helpId = help ? `d-field-help-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` : null;

  children.forEach(child => {
    if (child && child.nodeType) {
      // Wire aria-describedby for help text on first form control
      if (helpId && (child.tagName === 'INPUT' || child.tagName === 'SELECT' || child.tagName === 'TEXTAREA' ||
          child.querySelector?.('input,select,textarea'))) {
        const ctrl = child.tagName === 'INPUT' || child.tagName === 'SELECT' || child.tagName === 'TEXTAREA'
          ? child : child.querySelector('input,select,textarea');
        if (ctrl && !ctrl.getAttribute('aria-describedby')) {
          ctrl.setAttribute('aria-describedby', helpId);
        }
      }
      wrapper.appendChild(child);
    }
  });

  if (help) {
    wrapper.appendChild(h('div', { class: 'd-field-help', id: helpId }, help));
  }

  if (error) {
    const errEl = h('div', { class: 'd-field-error', role: 'alert' });
    wrapper.appendChild(errEl);

    if (typeof error === 'function') {
      createEffect(() => {
        const msg = error();
        errEl.textContent = msg || '';
        errEl.style.display = msg ? '' : 'none';
      });
    } else {
      errEl.textContent = error;
    }
  }

  return wrapper;
}

// Re-export for imperative wrapping
export { createFormField };
