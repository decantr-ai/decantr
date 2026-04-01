import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface SliderProps {
  value?: number | (() => number);
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean | (() => boolean);
  onchange?: (value: unknown) => void;
  oninput?: (e: Event) => void;
  showValue?: boolean;
  'aria-label'?: string;
  class?: string;
  [key: string]: unknown;
}

const { div, span } = tags;

/**
 * @param {Object} [props]
 * @param {number|Function} [props.value=0]
 * @param {number} [props.min=0]
 * @param {number} [props.max=100]
 * @param {number} [props.step=1]
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange]
 * @param {Function} [props.oninput]
 * @param {boolean} [props.showValue=false]
 * @param {string} [props['aria-label']]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Slider = component<SliderProps>((props: SliderProps = {} as SliderProps) => {
  injectBase();

  const {
    value = 0, min = 0, max = 100, step = 1,
    disabled, onchange, oninput, showValue = false,
    'aria-label': ariaLabel, class: cls
  } = props;

  let currentValue = typeof value === 'function' ? value() : value;

  const track = div({ class: 'd-slider-track' });
  const fill = div({ class: 'd-slider-fill' });
  const thumb = div({
    class: 'd-slider-thumb',
    role: 'slider',
    tabindex: '0',
    'aria-valuemin': String(min),
    'aria-valuemax': String(max),
    'aria-valuenow': String(currentValue),
    'aria-label': ariaLabel || 'Slider'
  });

  track.appendChild(fill);
  track.appendChild(thumb);

  const valueLabel = showValue ? span({ class: 'd-slider-value' }, String(currentValue)) : null;
  const wrap = div({ class: cx('d-slider', cls) }, track);
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

  // Use createDrag from _behaviors.js
  const trackDrag = createDrag(track, {
    onStart() {
      if (typeof disabled === 'function' ? disabled() : disabled) return;
      wrap.classList.add('d-slider-active');
    },
    onMove(x) {
      if (typeof disabled === 'function' ? disabled() : disabled) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      setValue(min + pct * (max - min));
    },
    onEnd() {
      wrap.classList.remove('d-slider-active');
      commitValue();
    }
  });

  // Click on track to jump
  track.addEventListener('click', (e) => {
    if (typeof disabled === 'function' ? disabled() : disabled) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setValue(min + pct * (max - min));
    commitValue();
  });

  // Keyboard
  thumb.addEventListener('keydown', (e) => {
    if (typeof disabled === 'function' ? disabled() : disabled) return;
    let newVal = currentValue;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); newVal = currentValue + step; }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); newVal = currentValue - step; }
    else if (e.key === 'Home') { e.preventDefault(); newVal = min; }
    else if (e.key === 'End') { e.preventDefault(); newVal = max; }
    else return;
    setValue(newVal);
    commitValue();
  });

  updateUI();

  onDestroy(() => {
    trackDrag.destroy();
  });

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => { currentValue = value(); updateUI(); });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => { wrap.classList.toggle('d-slider-disabled', disabled()); });
  } else if (disabled) {
    wrap.classList.add('d-slider-disabled');
  }

  return wrap;
})
