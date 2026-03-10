/**
 * ColorPicker — Color selection with saturation panel, hue/alpha sliders, and presets.
 * Uses createOverlay + createDrag behaviors.
 *
 * @module decantr/components/color-picker
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay, createDrag } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {string|Function} [props.value='#1366D9'] - Hex color value
 * @param {boolean} [props.alpha=false] - Show alpha slider
 * @param {string[]} [props.presets] - Preset color swatches
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ColorPicker(props = {}) {
  injectBase();
  const { value = '#1366D9', alpha = false, presets, disabled, onchange, class: cls } = props;

  let current = typeof value === 'function' ? value() : value;
  let _h = 0, _s = 100, _v = 100, _a = 1;

  // Parse hex to HSV
  function hexToHSV(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let hue = 0;
    if (d !== 0) {
      if (max === r) hue = ((g - b) / d + 6) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue *= 60;
    }
    return { h: hue, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 };
  }

  function hsvToHex(hue, sat, val) {
    const s = sat / 100, v = val / 100;
    const c = v * s, x = c * (1 - Math.abs((hue / 60) % 2 - 1)), m = v - c;
    let r, g, b;
    if (hue < 60) [r, g, b] = [c, x, 0];
    else if (hue < 120) [r, g, b] = [x, c, 0];
    else if (hue < 180) [r, g, b] = [0, c, x];
    else if (hue < 240) [r, g, b] = [0, x, c];
    else if (hue < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const toHex = n => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  const init = hexToHSV(current);
  _h = init.h; _s = init.s; _v = init.v;

  // Swatch trigger
  const swatch = h('div', { class: 'd-colorpicker-swatch', style: { background: current } });
  const hexLabel = h('span', null, current);
  const trigger = h('button', {
    type: 'button',
    class: 'd-colorpicker-trigger',
    'aria-label': 'Pick color'
  }, swatch, hexLabel);

  // Panel
  const satThumb = h('div', { class: 'd-colorpicker-thumb' });
  const satPanel = h('div', { class: 'd-colorpicker-saturation' }, satThumb);
  const hueThumb = h('div', { class: 'd-colorpicker-thumb', style: { top: '50%' } });
  const hueBar = h('div', { class: 'd-colorpicker-hue' }, hueThumb);

  const panel = h('div', { class: 'd-colorpicker-panel', style: { display: 'none' } });
  panel.appendChild(satPanel);
  panel.appendChild(hueBar);

  if (presets && presets.length) {
    const presetsRow = h('div', { class: 'd-colorpicker-presets' });
    presets.forEach(color => {
      const p = h('button', {
        type: 'button',
        class: 'd-colorpicker-preset',
        style: { background: color },
        'aria-label': color
      });
      p.addEventListener('click', () => {
        current = color;
        const hsv = hexToHSV(color);
        _h = hsv.h; _s = hsv.s; _v = hsv.v;
        update();
      });
      presetsRow.appendChild(p);
    });
    panel.appendChild(presetsRow);
  }

  const wrap = h('div', { class: cx('d-colorpicker', cls) }, trigger, panel);

  function update() {
    current = hsvToHex(_h, _s, _v);
    swatch.style.background = current;
    hexLabel.textContent = current;
    satPanel.style.background = `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${_h},100%,50%))`;
    satThumb.style.left = `${_s}%`;
    satThumb.style.top = `${100 - _v}%`;
    hueThumb.style.left = `${(_h / 360) * 100}%`;
    if (onchange) onchange(current);
  }

  // Saturation drag
  createDrag(satPanel, {
    onMove(x, y) {
      const rect = satPanel.getBoundingClientRect();
      _s = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
      _v = Math.max(0, Math.min(100, 100 - ((y - rect.top) / rect.height) * 100));
      update();
    }
  });

  // Hue drag
  createDrag(hueBar, {
    onMove(x) {
      const rect = hueBar.getBoundingClientRect();
      _h = Math.max(0, Math.min(360, ((x - rect.left) / rect.width) * 360));
      update();
    }
  });

  createOverlay(trigger, panel, { trigger: 'click', closeOnEscape: true, closeOnOutside: true });

  update();

  if (typeof value === 'function') {
    createEffect(() => {
      current = value();
      const hsv = hexToHSV(current);
      _h = hsv.h; _s = hsv.s; _v = hsv.v;
      update();
    });
  }

  return wrap;
}
