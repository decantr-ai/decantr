/**
 * Rate — Star rating component.
 * Supports half-star, custom icons, reactive value.
 *
 * @module decantr/components/rate
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';

const { div, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value=0] - Current rating value
 * @param {number} [props.count=5] - Number of stars
 * @param {boolean} [props.half=false] - Allow half-star ratings
 * @param {boolean|Function} [props.disabled=false]
 * @param {boolean} [props.readonly=false]
 * @param {string} [props.size] - sm|lg
 * @param {string} [props.character='★'] - Star character or custom text
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.label] - Label for createFormField
 * @param {string} [props.help] - Help text for createFormField
 * @param {boolean} [props.required] - Required indicator
 * @param {Function} [props.onchange]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Rate(props = {}) {
  injectBase();
  const {
    value = 0, count = 5, half = false, disabled = false, readonly = false,
    size, character = '\u2605', onchange, class: cls,
    error, success, label, help, required,
    'aria-label': ariaLabel
  } = props;

  let current = typeof value === 'function' ? value() : value;
  let hoverVal = -1;

  const container = div({
    class: cx('d-rate', size && `d-rate-${size}`, cls),
    role: 'radiogroup',
    'aria-label': ariaLabel || 'Rating',
    'aria-disabled': (typeof disabled === 'function' ? disabled() : disabled) ? 'true' : 'false'
  });

  // Reactive aria-disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      container.setAttribute('aria-disabled', disabled() ? 'true' : 'false');
    });
  }

  // Error state
  if (typeof error === 'function') {
    createEffect(() => {
      const v = error();
      container.toggleAttribute('data-error', !!v);
      container.setAttribute('aria-invalid', v ? 'true' : 'false');
    });
  } else if (error) {
    container.setAttribute('data-error', '');
    container.setAttribute('aria-invalid', 'true');
  }

  // Success state
  if (typeof success === 'function') {
    createEffect(() => { container.toggleAttribute('data-success', !!success()); });
  } else if (success) {
    container.setAttribute('data-success', '');
  }

  const stars = [];
  const cleanups = [];

  function isDisabled() {
    return readonly || (typeof disabled === 'function' ? disabled() : disabled);
  }

  function updateStars() {
    const displayVal = hoverVal >= 0 ? hoverVal : current;
    stars.forEach((star, i) => {
      const val = i + 1;
      const filled = displayVal >= val;
      const halfFilled = half && displayVal >= val - 0.5 && displayVal < val;
      star.classList.toggle('d-rate-star-active', filled);
      star.classList.toggle('d-rate-star-half', halfFilled && !filled);
      star.setAttribute('aria-checked', filled || halfFilled ? 'true' : 'false');
    });
  }

  for (let i = 0; i < count; i++) {
    const star = buttonTag({
      type: 'button',
      class: 'd-rate-star',
      role: 'radio',
      'aria-label': `${i + 1} star${i > 0 ? 's' : ''}`,
      tabindex: i === 0 ? '0' : '-1'
    }, character);

    const onClick = () => {
      if (isDisabled()) return;
      const newVal = i + 1;
      current = current === newVal ? 0 : newVal;
      updateStars();
      if (onchange) onchange(current);
    };
    star.addEventListener('click', onClick);
    cleanups.push(() => star.removeEventListener('click', onClick));

    if (half) {
      const onMousemove = (e) => {
        if (isDisabled()) return;
        const rect = star.getBoundingClientRect();
        hoverVal = e.clientX < rect.left + rect.width / 2 ? i + 0.5 : i + 1;
        updateStars();
      };
      star.addEventListener('mousemove', onMousemove);
      cleanups.push(() => star.removeEventListener('mousemove', onMousemove));
    } else {
      const onMouseenter = () => {
        if (isDisabled()) return;
        hoverVal = i + 1;
        updateStars();
      };
      star.addEventListener('mouseenter', onMouseenter);
      cleanups.push(() => star.removeEventListener('mouseenter', onMouseenter));
    }

    const onKeydown = (e) => {
      if (isDisabled()) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = half ? 0.5 : 1;
        current = Math.min(count, current + step);
        updateStars();
        if (onchange) onchange(current);
        const next = Math.min(count - 1, i + 1);
        stars[next].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const step = half ? 0.5 : 1;
        current = Math.max(0, current - step);
        updateStars();
        if (onchange) onchange(current);
        const prev = Math.max(0, i - 1);
        stars[prev].focus();
      }
    };
    star.addEventListener('keydown', onKeydown);
    cleanups.push(() => star.removeEventListener('keydown', onKeydown));

    stars.push(star);
    container.appendChild(star);
  }

  const onMouseleave = () => {
    hoverVal = -1;
    updateStars();
  };
  container.addEventListener('mouseleave', onMouseleave);
  cleanups.push(() => container.removeEventListener('mouseleave', onMouseleave));

  updateStars();

  if (typeof value === 'function') {
    createEffect(() => { current = value(); updateStars(); });
  }

  // Cleanup
  onDestroy(() => { cleanups.forEach(fn => fn()); });

  // Form field wrapping
  if (label || help) {
    const { wrapper } = createFormField(container, { label, error, help, required, success });
    return wrapper;
  }

  return container;
}
