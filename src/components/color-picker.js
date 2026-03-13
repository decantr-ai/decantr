/**
 * ColorPicker — Color selection with lightness/chroma panel, hue slider, and presets.
 * Uses OKLCH color space for perceptually uniform manipulation.
 * Uses createFieldOverlay + createDrag behaviors.
 *
 * @module decantr/components/color-picker
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag, createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay, hexToOklch, oklchToHex } from './_primitives.js';

const { div, button: buttonTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {string|Function} [props.value='#1366D9']
 * @param {boolean} [props.alpha=false]
 * @param {string[]} [props.presets]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - 'xs'|'sm'|'lg'
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ColorPicker(props = {}) {
  injectBase();
  const {
    value = '#1366D9', alpha = false, presets, disabled,
    error, success, variant, size, label, help, onchange, class: cls
  } = props;

  let current = typeof value === 'function' ? value() : value;
  let oklch = hexToOklch(current);

  // Swatch trigger
  const swatch = div({ class: 'd-colorpicker-swatch' });
  swatch.style.background = current;
  const hexLabel = span(current);
  const trigger = buttonTag({
    type: 'button',
    class: 'd-colorpicker-trigger',
    'aria-label': 'Pick color'
  }, swatch, hexLabel);

  // Panel
  const satThumb = div({ class: 'd-colorpicker-thumb' });
  const satPanel = div({ class: 'd-colorpicker-saturation' }, satThumb);
  const hueThumb = div({ class: 'd-colorpicker-thumb' });
  hueThumb.style.top = '50%';
  const hueBar = div({ class: 'd-colorpicker-hue' }, hueThumb);

  const panel = div({ class: 'd-colorpicker-panel' });
  panel.appendChild(satPanel);
  panel.appendChild(hueBar);

  if (presets && presets.length) {
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
    panel.appendChild(presetsRow);
  }

  const wrap = div({ class: cx('d-colorpicker', cls) }, trigger, panel);
  applyFieldState(wrap, { error, success, disabled, variant, size });

  function update() {
    current = oklchToHex(oklch.l, oklch.c, oklch.h);
    swatch.style.background = current;
    hexLabel.textContent = current;
    // OKLCH-based gradient: vary chroma (x) and lightness (y) at fixed hue
    const hueHex = oklchToHex(0.7, 0.15, oklch.h);
    satPanel.style.background = `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,${hueHex})`;
    // Map L (0-1) to Y position (1=top, 0=bottom) and C (0-0.4) to X position
    satThumb.style.left = `${Math.min(100, (oklch.c / 0.4) * 100)}%`;
    satThumb.style.top = `${Math.max(0, (1 - oklch.l) * 100)}%`;
    hueThumb.style.left = `${(oklch.h / 360) * 100}%`;
    if (onchange) onchange(current);
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

  onDestroy(() => {
    overlay.destroy();
    satDrag.destroy();
    hueDrag.destroy();
  });

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, variant, size });
    return wrapper;
  }

  return wrap;
}
