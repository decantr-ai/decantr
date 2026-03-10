/**
 * Rate — Star rating component.
 * Supports half-star, custom icons, reactive value.
 *
 * @module decantr/components/rate
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value=0] - Current rating value
 * @param {number} [props.count=5] - Number of stars
 * @param {boolean} [props.half=false] - Allow half-star ratings
 * @param {boolean|Function} [props.disabled=false]
 * @param {boolean} [props.readonly=false]
 * @param {string} [props.size] - sm|default|lg
 * @param {string} [props.character='★'] - Star character or custom text
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Rate(props = {}) {
  injectBase();
  const { value = 0, count = 5, half = false, disabled = false, readonly = false, size, character = '\u2605', onchange, class: cls } = props;

  let current = typeof value === 'function' ? value() : value;
  let hoverVal = -1;

  const container = h('div', {
    class: cx('d-rate', size && `d-rate-${size}`, cls),
    role: 'radiogroup',
    'aria-label': 'Rating',
    'aria-disabled': (typeof disabled === 'function' ? disabled() : disabled) ? 'true' : 'false'
  });

  const stars = [];

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
    const star = h('button', {
      type: 'button',
      class: 'd-rate-star',
      role: 'radio',
      'aria-label': `${i + 1} star${i > 0 ? 's' : ''}`,
      tabindex: i === 0 ? '0' : '-1'
    }, character);

    star.addEventListener('click', () => {
      if (isDisabled()) return;
      const newVal = i + 1;
      current = current === newVal ? 0 : newVal;
      updateStars();
      if (onchange) onchange(current);
    });

    if (half) {
      star.addEventListener('mousemove', (e) => {
        if (isDisabled()) return;
        const rect = star.getBoundingClientRect();
        hoverVal = e.clientX < rect.left + rect.width / 2 ? i + 0.5 : i + 1;
        updateStars();
      });
    } else {
      star.addEventListener('mouseenter', () => {
        if (isDisabled()) return;
        hoverVal = i + 1;
        updateStars();
      });
    }

    star.addEventListener('keydown', (e) => {
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
    });

    stars.push(star);
    container.appendChild(star);
  }

  container.addEventListener('mouseleave', () => {
    hoverVal = -1;
    updateStars();
  });

  updateStars();

  if (typeof value === 'function') {
    createEffect(() => { current = value(); updateStars(); });
  }

  return container;
}
