import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';

const { label: labelTag, input: inputTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {boolean|Function} [props.checked]
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.label]
 * @param {boolean} [props.indeterminate]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.help] - Help text for createFormField
 * @param {boolean} [props.required]
 * @param {string} [props.size] - 'xs'|'sm'|'lg'
 * @param {Function} [props.onchange]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Checkbox(props = {}) {
  injectBase();

  const { checked, disabled, label, indeterminate, error, success, help, required, size, onchange, 'aria-label': ariaLabel, class: cls } = props;

  const inputProps = { type: 'checkbox', class: 'd-checkbox-native' };
  if (ariaLabel) inputProps['aria-label'] = ariaLabel;

  const input = inputTag(inputProps);
  const check = span({ class: 'd-checkbox-check' });
  const wrapper = labelTag({ class: cx('d-checkbox', size && `d-checkbox-${size}`, cls) }, input, check);

  if (label) wrapper.appendChild(span({ class: 'd-checkbox-label' }, label));
  if (indeterminate) input.indeterminate = true;
  if (onchange) input.addEventListener('change', () => onchange(input.checked));
  if (required) input.required = true;

  if (typeof checked === 'function') {
    createEffect(() => { input.checked = checked(); });
  } else if (checked) {
    input.checked = true;
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => { input.disabled = disabled(); });
  } else if (disabled) {
    input.disabled = true;
  }

  // Reactive error — mark wrapper with data-error
  if (typeof error === 'function') {
    createEffect(() => {
      const v = error();
      wrapper.toggleAttribute('data-error', !!v);
      input.setAttribute('aria-invalid', v ? 'true' : 'false');
    });
  } else if (error) {
    wrapper.setAttribute('data-error', '');
    input.setAttribute('aria-invalid', 'true');
  }

  // Reactive success
  if (typeof success === 'function') {
    createEffect(() => { wrapper.toggleAttribute('data-success', !!success()); });
  } else if (success) {
    wrapper.setAttribute('data-success', '');
  }

  // Form field wrapping (when help is provided)
  if (help) {
    const { wrapper: formWrapper } = createFormField(wrapper, { label, error, help, required, success });
    return formWrapper;
  }

  return wrapper;
}
