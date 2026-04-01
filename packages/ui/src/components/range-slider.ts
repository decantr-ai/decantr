/**
 * RangeSlider — Dual-thumb slider for selecting a numeric range.
 * Keyboard accessible with ARIA slider pattern.
 * Uses createDrag behavior for pointer interaction.
 *
 * @module decantr/components/range-slider
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface RangeSliderProps {
  value?: Array<number>|Function;
  min?: number;
  max?: number;
  step?: number;
  onchange?: (value: unknown) => void;
  disabled?: boolean | (() => boolean);
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {Array<number>|Function} [props.value] - [min, max]
 * @param {number} [props.min=0]
 * @param {number} [props.max=100]
 * @param {number} [props.step=1]
 * @param {Function} [props.onchange] - ([low, high]) => void
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const RangeSlider = component<RangeSliderProps>((props: RangeSliderProps = {} as RangeSliderProps) => {
  injectBase();
  const {
    value, min: pMin = 0, max: pMax = 100, step = 1,
    onchange, disabled, class: cls
  } = props;

  let low = pMin;
  let high = pMax;

  function parseValue(v) {
    if (!v || !Array.isArray(v)) return;
    low = clamp(v[0] ?? pMin);
    high = clamp(v[1] ?? pMax);
    if (low > high) { const t = low; low = high; high = t; }
  }

  function clamp(v) {
    return Math.min(pMax, Math.max(pMin, Math.round(v / step) * step));
  }

  function pct(v) {
    return ((v - pMin) / (pMax - pMin)) * 100;
  }

  parseValue(typeof value === 'function' ? value() : value);

  const track = h('div', { class: 'd-rangeslider-track' });
  const fill = h('div', { class: 'd-rangeslider-fill' });

  const thumbLow = h('div', {
    class: 'd-rangeslider-thumb',
    role: 'slider',
    tabindex: '0',
    'aria-valuemin': String(pMin),
    'aria-valuemax': String(pMax),
    'aria-valuenow': String(low),
    'aria-label': 'Range start'
  });

  const thumbHigh = h('div', {
    class: 'd-rangeslider-thumb',
    role: 'slider',
    tabindex: '0',
    'aria-valuemin': String(pMin),
    'aria-valuemax': String(pMax),
    'aria-valuenow': String(high),
    'aria-label': 'Range end'
  });

  const container = h('div', {
    class: cx('d-rangeslider', cls),
    role: 'group',
    'aria-label': 'Range slider'
  }, track, fill, thumbLow, thumbHigh);

  function syncDOM() {
    const lp = pct(low);
    const hp = pct(high);
    thumbLow.style.left = lp + '%';
    thumbHigh.style.left = hp + '%';
    fill.style.left = lp + '%';
    fill.style.width = (hp - lp) + '%';
    thumbLow.setAttribute('aria-valuenow', String(low));
    thumbHigh.setAttribute('aria-valuenow', String(high));
  }

  function emit() {
    if (onchange) onchange([low, high]);
  }

  function valueFromX(clientX) {
    const rect = container.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return clamp(pMin + ratio * (pMax - pMin));
  }

  // Drag for low thumb
  createDrag(thumbLow, {
    onMove: (x) => {
      const v = valueFromX(x);
      if (v <= high) { low = v; } else { low = high; high = v; }
      syncDOM();
    },
    onEnd: () => emit()
  });

  // Drag for high thumb
  createDrag(thumbHigh, {
    onMove: (x) => {
      const v = valueFromX(x);
      if (v >= low) { high = v; } else { high = low; low = v; }
      syncDOM();
    },
    onEnd: () => emit()
  });

  // Click on track to move nearest thumb
  container.addEventListener('pointerdown', (e) => {
    if (e.target === thumbLow || e.target === thumbHigh) return;
    const v = valueFromX(e.clientX);
    if (Math.abs(v - low) <= Math.abs(v - high)) {
      low = v;
      thumbLow.focus();
    } else {
      high = v;
      thumbHigh.focus();
    }
    syncDOM();
    emit();
  });

  // Keyboard
  function handleKey(e, isLow) {
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step;
    else if (e.key === 'Home') { delta = pMin - (isLow ? low : high); }
    else if (e.key === 'End') { delta = pMax - (isLow ? low : high); }
    else return;
    e.preventDefault();
    if (isLow) {
      low = clamp(low + delta);
      if (low > high) low = high;
    } else {
      high = clamp(high + delta);
      if (high < low) high = low;
    }
    syncDOM();
    emit();
  }

  thumbLow.addEventListener('keydown', (e) => handleKey(e, true));
  thumbHigh.addEventListener('keydown', (e) => handleKey(e, false));

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      if (v) { container.setAttribute('data-disabled', ''); container.setAttribute('aria-disabled', 'true'); }
      else { container.removeAttribute('data-disabled'); container.removeAttribute('aria-disabled'); }
    });
  } else if (disabled) {
    container.setAttribute('data-disabled', '');
    container.setAttribute('aria-disabled', 'true');
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => { parseValue(value()); syncDOM(); });
  }

  syncDOM();
  return container;
})
