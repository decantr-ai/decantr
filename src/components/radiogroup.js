import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx, reactiveAttr } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ value: string, label: string, disabled?: boolean }[]} props.options
 * @param {string|Function} [props.value] — Selected value
 * @param {string} [props.name] — Group name for native radios
 * @param {boolean|Function} [props.disabled] — Disable all options
 * @param {string} [props.orientation] — 'vertical'|'horizontal' (default: 'vertical')
 * @param {Function} [props.onchange] — Called with selected value
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function RadioGroup(props = {}) {
  injectBase();

  const {
    options = [],
    value,
    name = `d-radio-${Date.now()}`,
    disabled,
    orientation = 'vertical',
    onchange,
    class: cls
  } = props;

  let currentValue = typeof value === 'function' ? value() : (value || '');

  const group = h('div', {
    class: cx('d-radiogroup', orientation === 'horizontal' && 'd-radiogroup-horizontal', cls),
    role: 'radiogroup'
  });

  const radios = [];

  options.forEach((opt, i) => {
    const native = h('input', {
      type: 'radio',
      name,
      value: opt.value,
      class: 'd-radio-native',
      tabindex: i === 0 ? '0' : '-1',
      'aria-label': opt.label
    });

    if (opt.value === currentValue) native.checked = true;
    if (opt.disabled) native.disabled = true;

    const indicator = h('span', { class: 'd-radio-indicator' },
      h('span', { class: 'd-radio-dot' })
    );
    const label = h('span', { class: 'd-radio-label' }, opt.label);

    const wrapper = h('label', {
      class: cx('d-radio', opt.disabled && 'd-radio-disabled')
    }, native, indicator, label);

    native.addEventListener('change', () => {
      if (native.checked) {
        currentValue = opt.value;
        updateChecked();
        if (onchange) onchange(opt.value);
      }
    });

    // Arrow key navigation
    native.addEventListener('keydown', (e) => {
      let next = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        next = findNext(i, 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        next = findNext(i, -1);
      }
      if (next >= 0) {
        radios[next].native.checked = true;
        radios[next].native.focus();
        radios[next].native.dispatchEvent(new Event('change'));
      }
    });

    radios.push({ native, wrapper, opt });
    group.appendChild(wrapper);
  });

  function findNext(from, dir) {
    let idx = from;
    for (let j = 0; j < options.length; j++) {
      idx = (idx + dir + options.length) % options.length;
      if (!options[idx].disabled) return idx;
    }
    return -1;
  }

  function updateChecked() {
    radios.forEach(({ native, opt }) => {
      native.checked = opt.value === currentValue;
      native.tabIndex = native.checked ? 0 : -1;
    });
  }

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
    });
  } else if (disabled) {
    radios.forEach(({ native }) => { native.disabled = true; });
  }

  return group;
}
