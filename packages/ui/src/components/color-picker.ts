/**
 * ColorPicker — Color selection with lightness/chroma panel, hue slider, and presets.
 * Uses OKLCH color space for perceptually uniform manipulation.
 * Uses createFieldOverlay + createDrag behaviors.
 *
 * @module decantr/components/color-picker
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect, untrack } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag, createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay, hexToOklch, oklchToHex } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface ColorPickerProps {
  value?: string | (() => string);
  alpha?: boolean;
  presets?: string[];
  disabled?: boolean | (() => boolean);
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  onchange?: (value: unknown) => void;
  class?: string;
  [key: string]: unknown;
}

const { div, button: buttonTag, span, input: inputTag } = tags;

const HEX_RE = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const STEP_L = 0.01;
const STEP_C = 0.01;
const STEP_H = 1;
const STEP_A = 0.01;

/**
 * @param {Object} [props]
 * @param {string|Function} [props.value='#1366D9']
 * @param {boolean} [props.alpha=false]
 * @param {string[]} [props.presets]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const ColorPicker = component<ColorPickerProps>((props: ColorPickerProps = {} as ColorPickerProps) => {
  injectBase();
  const {
    value = '#1366D9', alpha = false, presets, disabled,
    error, success, variant, size, label, help, onchange, class: cls
  } = props;

  let current = typeof value === 'function' ? untrack(value) : value;
  let oklch = hexToOklch(current);
  let _init = true;

  // Swatch trigger
  const swatch = div({ class: 'd-colorpicker-swatch' });
  swatch.style.background = current;
  const hexLabel = span(current);
  const trigger = buttonTag({
    type: 'button',
    class: 'd-colorpicker-trigger',
    'aria-label': 'Pick color'
  }, swatch, hexLabel);

  // Saturation/lightness panel
  const satThumb = div({ class: 'd-colorpicker-thumb' });
  const satPanel = div({
    class: 'd-colorpicker-saturation',
    role: 'slider',
    'aria-label': 'Color saturation and lightness',
    'aria-valuetext': '',
    tabindex: '0'
  }, satThumb);

  // Hue bar
  const hueThumb = div({ class: 'd-colorpicker-thumb' });
  hueThumb.style.top = '50%';
  const hueBar = div({
    class: 'd-colorpicker-hue',
    role: 'slider',
    'aria-label': 'Hue',
    'aria-valuemin': '0',
    'aria-valuemax': '360',
    'aria-valuenow': '0',
    tabindex: '0'
  }, hueThumb);

  // Panel container
  const panel = div({ class: 'd-colorpicker-panel', role: 'dialog', 'aria-label': 'Color picker' });

  // Controls group (sat + bars) — intimate gap via .d-colorpicker-controls
  const controls = div({ class: 'd-colorpicker-controls' });
  controls.appendChild(satPanel);
  const hueWrap = div({ class: 'd-colorpicker-bar-wrap' });
  hueWrap.appendChild(hueBar);
  controls.appendChild(hueWrap);

  // Alpha bar (optional)
  let alphaBar, alphaThumb, alphaDrag, alphaInput;
  if (alpha) {
    alphaThumb = div({ class: 'd-colorpicker-thumb' });
    alphaThumb.style.top = '50%';
    alphaBar = div({
      class: 'd-colorpicker-alpha',
      role: 'slider',
      'aria-label': 'Opacity',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '100',
      tabindex: '0'
    }, alphaThumb);
    const alphaWrap = div({ class: 'd-colorpicker-bar-wrap' });
    alphaWrap.appendChild(alphaBar);
    controls.appendChild(alphaWrap);
  }
  panel.appendChild(controls);

  // Hex input
  const hexInput = inputTag({
    type: 'text',
    'aria-label': 'Hex color value',
    spellcheck: 'false',
    autocomplete: 'off'
  });
  const hexInputRow = div({ class: 'd-colorpicker-input' });
  hexInputRow.appendChild(hexInput);

  if (alpha) {
    alphaInput = inputTag({
      type: 'text',
      'aria-label': 'Opacity percentage',
      spellcheck: 'false',
      autocomplete: 'off'
    });
    alphaInput.style.width = '3.5em';
    alphaInput.style.flex = 'none';
    hexInputRow.appendChild(alphaInput);
  }
  panel.appendChild(hexInputRow);

  // Hex input change handler
  hexInput.addEventListener('change', () => {
    const val = hexInput.value.trim();
    if (HEX_RE.test(val)) {
      const hex = val.startsWith('#') ? val : `#${val}`;
      current = hex;
      oklch = hexToOklch(hex);
      update();
    } else {
      hexInput.value = current;
    }
  });

  // Alpha input change handler
  if (alpha && alphaInput) {
    alphaInput.addEventListener('change', () => {
      const raw = alphaInput.value.replace('%', '').trim();
      const num = parseFloat(raw);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        oklch.a = num / 100;
        update();
      } else {
        alphaInput.value = `${Math.round(oklch.a * 100)}%`;
      }
    });
  }

  // Presets
  if (presets && presets.length) {
    const presetsSection = div({ class: 'd-colorpicker-presets-section' });
    const presetsLabel = span({ class: 'd-colorpicker-presets-label' }, 'Presets');
    const presetsRow = div({ class: 'd-colorpicker-presets' });
    presets.forEach(color => {
      const p = buttonTag({
        type: 'button',
        class: 'd-colorpicker-preset',
        'aria-label': color
      });
      p.style.background = color;
      p.addEventListener('click', () => {
        current = color;
        oklch = hexToOklch(color);
        update();
      });
      presetsRow.appendChild(p);
    });
    presetsSection.appendChild(presetsLabel);
    presetsSection.appendChild(presetsRow);
    panel.appendChild(presetsSection);
  }

  const wrap = div({ class: cx('d-colorpicker', cls) }, trigger, panel);
  applyFieldState(wrap, { error, success, disabled, variant, size });

  function update() {
    const a = alpha ? oklch.a : 1;
    current = oklchToHex(oklch.l, oklch.c, oklch.h, a);
    swatch.style.background = current;
    hexLabel.textContent = current;
    // OKLCH-based gradient: vary chroma (x) and lightness (y) at fixed hue
    const hueHex = oklchToHex(0.7, 0.15, oklch.h);
    satPanel.style.background = `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,${hueHex})`;
    // Map L (0-1) to Y position (1=top, 0=bottom) and C (0-0.4) to X position
    satThumb.style.left = `${Math.min(100, (oklch.c / 0.4) * 100)}%`;
    satThumb.style.top = `${Math.max(0, (1 - oklch.l) * 100)}%`;
    hueThumb.style.left = `${(oklch.h / 360) * 100}%`;
    // Hex input sync
    hexInput.value = current;
    // ARIA updates
    satPanel.setAttribute('aria-valuetext', `Lightness ${Math.round(oklch.l * 100)}%, Chroma ${Math.round((oklch.c / 0.4) * 100)}%`);
    hueBar.setAttribute('aria-valuenow', String(Math.round(oklch.h)));
    // Alpha updates
    if (alpha && alphaBar) {
      const pct = Math.round(a * 100);
      alphaThumb.style.left = `${pct}%`;
      alphaBar.style.background = `linear-gradient(to right,transparent,${oklchToHex(oklch.l, oklch.c, oklch.h)})`;
      alphaBar.setAttribute('aria-valuenow', String(pct));
      if (alphaInput) alphaInput.value = `${pct}%`;
    }
    if (onchange && !_init) onchange(current);
  }

  // Saturation/lightness drag — OKLCH L/C plane
  const satDrag = createDrag(satPanel, {
    onMove(x, y) {
      const rect = satPanel.getBoundingClientRect();
      oklch.c = Math.max(0, Math.min(0.4, ((x - rect.left) / rect.width) * 0.4));
      oklch.l = Math.max(0, Math.min(1, 1 - ((y - rect.top) / rect.height)));
      update();
    }
  });

  // Hue drag
  const hueDrag = createDrag(hueBar, {
    onMove(x) {
      const rect = hueBar.getBoundingClientRect();
      oklch.h = Math.max(0, Math.min(360, ((x - rect.left) / rect.width) * 360));
      update();
    }
  });

  // Alpha drag
  if (alpha && alphaBar) {
    alphaDrag = createDrag(alphaBar, {
      onMove(x) {
        const rect = alphaBar.getBoundingClientRect();
        oklch.a = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        update();
      }
    });
  }

  // Keyboard support for saturation panel
  satPanel.addEventListener('keydown', (e) => {
    let handled = true;
    switch (e.key) {
      case 'ArrowRight': oklch.c = Math.min(0.4, oklch.c + STEP_C); break;
      case 'ArrowLeft': oklch.c = Math.max(0, oklch.c - STEP_C); break;
      case 'ArrowUp': oklch.l = Math.min(1, oklch.l + STEP_L); break;
      case 'ArrowDown': oklch.l = Math.max(0, oklch.l - STEP_L); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); update(); }
  });

  // Keyboard support for hue bar
  hueBar.addEventListener('keydown', (e) => {
    let handled = true;
    switch (e.key) {
      case 'ArrowRight': oklch.h = Math.min(360, oklch.h + STEP_H); break;
      case 'ArrowLeft': oklch.h = Math.max(0, oklch.h - STEP_H); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); update(); }
  });

  // Keyboard support for alpha bar
  if (alpha && alphaBar) {
    alphaBar.addEventListener('keydown', (e) => {
      let handled = true;
      switch (e.key) {
        case 'ArrowRight': oklch.a = Math.min(1, oklch.a + STEP_A); break;
        case 'ArrowLeft': oklch.a = Math.max(0, oklch.a - STEP_A); break;
        default: handled = false;
      }
      if (handled) { e.preventDefault(); update(); }
    });
  }

  const overlay = createFieldOverlay(trigger, panel, {
    trigger: 'click',
    matchWidth: false
  });

  update();

  if (typeof value === 'function') {
    createEffect(() => {
      current = value();
      oklch = hexToOklch(current);
      update();
    });
  }
  _init = false;

  onDestroy(() => {
    overlay.destroy();
    satDrag.destroy();
    hueDrag.destroy();
    if (alphaDrag) alphaDrag.destroy();
  });

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, variant, size });
    return wrapper;
  }

  return wrap;
})
