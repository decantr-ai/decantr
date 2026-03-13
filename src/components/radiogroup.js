import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createRovingTabindex } from './_behaviors.js';

const { div, label: labelTag, input: inputTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string, disabled?: boolean }[]} props.options
 * @param {string|Function} [props.value]
 * @param {string} [props.name]
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.orientation='vertical'] - 'vertical'|'horizontal'
 * @param {boolean|string|Function} [props.error]
 * @param {string} [props.size] - xs|sm|lg
 * @param {Function} [props.onchange]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function RadioGroup(props = {}) {
  injectBase();

  const {
    options = [], value, name = `d-radio-${Date.now()}`,
    disabled, orientation = 'vertical', error, size, onchange,
    'aria-label': ariaLabel, class: cls
  } = props;

  let currentValue = typeof value === 'function' ? value() : (value || '');

  const groupProps = {
    class: cx('d-radiogroup', orientation === 'horizontal' && 'd-radiogroup-horizontal', size && `d-radiogroup-${size}`, cls),
    role: 'radiogroup'
  };
  if (ariaLabel) groupProps['aria-label'] = ariaLabel;

  const group = div(groupProps);
  const radios = [];

  options.forEach((opt) => {
    const native = inputTag({
      type: 'radio',
      name,
      value: opt.value,
      class: 'd-radio-native',
      'aria-label': opt.label
    });

    if (opt.value === currentValue) native.checked = true;
    if (opt.disabled) native.disabled = true;

    const indicator = span({ class: 'd-radio-indicator' }, span({ class: 'd-radio-dot' }));
    const label = span({ class: 'd-radio-label' }, opt.label);

    const wrapper = labelTag({
      class: cx('d-radio', opt.disabled && 'd-radio-disabled')
    }, native, indicator, label);

    native.addEventListener('change', () => {
      if (native.checked) {
        currentValue = opt.value;
        updateChecked();
        if (onchange) onchange(opt.value);
      }
    });

    radios.push({ native, wrapper, opt });
    group.appendChild(wrapper);
  });

  function updateChecked() {
    radios.forEach(({ native, opt }) => {
      native.checked = opt.value === currentValue;
    });
  }

  // Use createRovingTabindex for keyboard navigation
  createRovingTabindex(group, {
    itemSelector: '.d-radio-native:not([disabled])',
    orientation: orientation === 'horizontal' ? 'horizontal' : 'vertical',
    onFocus: (el) => {
      el.checked = true;
      el.dispatchEvent(new Event('change'));
    }
  });

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      currentValue = value();
      updateChecked();
    });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      radios.forEach(({ native }) => { native.disabled = v; });
      group.toggleAttribute('data-disabled', v);
    });
  } else if (disabled) {
    radios.forEach(({ native }) => { native.disabled = true; });
    group.setAttribute('data-disabled', '');
  }

  // Reactive error
  if (typeof error === 'function') {
    createEffect(() => {
      const v = error();
      group.toggleAttribute('data-error', !!v);
    });
  } else if (error) {
    group.setAttribute('data-error', '');
  }

  return group;
}
