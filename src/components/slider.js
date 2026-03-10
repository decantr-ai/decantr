import { h, onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value] — Current value (default: 0)
 * @param {number} [props.min] — Minimum (default: 0)
 * @param {number} [props.max] — Maximum (default: 100)
 * @param {number} [props.step] — Step increment (default: 1)
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange] — Called with new value
 * @param {Function} [props.oninput] — Called during drag with current value
 * @param {boolean} [props.showValue] — Show value label (default: false)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Slider(props = {}) {
  injectBase();

  const {
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    onchange,
    oninput,
    showValue = false,
    class: cls
  } = props;

  let currentValue = typeof value === 'function' ? value() : value;

  const track = h('div', { class: 'd-slider-track' });
  const fill = h('div', { class: 'd-slider-fill' });
  const thumb = h('div', {
    class: 'd-slider-thumb',
    role: 'slider',
    tabindex: '0',
    'aria-valuemin': String(min),
    'aria-valuemax': String(max),
    'aria-valuenow': String(currentValue),
    'aria-label': 'Slider'
  });

  track.appendChild(fill);
  track.appendChild(thumb);

  const valueLabel = showValue ? h('span', { class: 'd-slider-value' }, String(currentValue)) : null;

  const wrap = h('div', { class: cx('d-slider', cls) }, track);
  if (valueLabel) wrap.appendChild(valueLabel);

  function clamp(val) {
    const stepped = Math.round((val - min) / step) * step + min;
    return Math.max(min, Math.min(max, stepped));
  }

  function getPercent(val) {
    return ((val - min) / (max - min)) * 100;
  }

  function updateUI() {
    const pct = getPercent(currentValue);
    fill.style.width = `${pct}%`;
    thumb.style.left = `${pct}%`;
    thumb.setAttribute('aria-valuenow', String(currentValue));
    if (valueLabel) valueLabel.textContent = String(currentValue);
  }

  function setValue(val) {
    const clamped = clamp(val);
    if (clamped === currentValue) return;
    currentValue = clamped;
    updateUI();
    if (oninput) oninput(currentValue);
  }

  function commitValue() {
    if (onchange) onchange(currentValue);
  }

  // Mouse drag
  let dragging = false;

  function onPointerDown(e) {
    if (typeof disabled === 'function' ? disabled() : disabled) return;
    e.preventDefault();
    dragging = true;
    wrap.classList.add('d-slider-active');
    updateFromEvent(e);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    updateFromEvent(e);
  }

  function onPointerUp() {
    dragging = false;
    wrap.classList.remove('d-slider-active');
    commitValue();
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }

  function updateFromEvent(e) {
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setValue(min + pct * (max - min));
  }

  track.addEventListener('pointerdown', onPointerDown);
  thumb.addEventListener('pointerdown', onPointerDown);

  // Keyboard
  thumb.addEventListener('keydown', (e) => {
    if (typeof disabled === 'function' ? disabled() : disabled) return;
    let newVal = currentValue;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      newVal = currentValue + step;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      newVal = currentValue - step;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newVal = min;
    } else if (e.key === 'End') {
      e.preventDefault();
      newVal = max;
    } else {
      return;
    }
    setValue(newVal);
    commitValue();
  });

  updateUI();

  onDestroy(() => {
    // Clean up any in-progress drag listeners
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  });

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      currentValue = value();
      updateUI();
    });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      wrap.classList.toggle('d-slider-disabled', disabled());
    });
  } else if (disabled) {
    wrap.classList.add('d-slider-disabled');
  }

  return wrap;
}
