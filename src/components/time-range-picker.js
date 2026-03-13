/**
 * TimeRangePicker — Two time selectors for start/end time range.
 * Uses renderTimeColumns primitive, createFieldOverlay behavior.
 *
 * @module decantr/components/time-range-picker
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { applyFieldState, createFieldOverlay, renderTimeColumns } from './_primitives.js';

const { div, button: buttonTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {Array<string>|Function} [props.value] - ['09:00', '17:00']
 * @param {string} [props.placeholder='Select time range']
 * @param {Function} [props.onchange]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - 'xs'|'sm'|'lg'
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function TimeRangePicker(props = {}) {
  injectBase();
  const {
    value, placeholder = 'Select time range', onchange,
    disabled, error, success, variant, size, label, help, required, class: cls
  } = props;

  let _sh = 9, _sm = 0, _eh = 17, _em = 0;
  let _hasValue = false;

  function parseValue(v) {
    if (!v || !Array.isArray(v) || v.length < 2) return;
    const sp = (v[0] || '').split(':').map(Number);
    const ep = (v[1] || '').split(':').map(Number);
    _sh = sp[0] || 0; _sm = sp[1] || 0;
    _eh = ep[0] || 0; _em = ep[1] || 0;
    _hasValue = true;
  }

  parseValue(typeof value === 'function' ? value() : value);

  function formatTime(hh, mm) {
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  function toMinutes(hh, mm) { return hh * 60 + mm; }
  function isValid() { return toMinutes(_eh, _em) > toMinutes(_sh, _sm); }

  // Display
  const displayEl = span({ class: 'd-select-display' });
  const trigger = buttonTag({
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, span({ class: 'd-select-arrow' }, '\u23F0'));

  const panel = div({ class: 'd-timerange-panel' });
  const wrap = div({ class: cx('d-timerange', cls) }, trigger, panel);

  applyFieldState(wrap, { error, success, disabled, variant, size });

  function updateDisplay() {
    if (_hasValue) {
      displayEl.textContent = `${formatTime(_sh, _sm)} — ${formatTime(_eh, _em)}`;
      displayEl.classList.remove('d-select-placeholder');
    } else {
      displayEl.textContent = placeholder;
      displayEl.classList.add('d-select-placeholder');
    }
  }

  function emitChange() {
    _hasValue = true;
    updateDisplay();
    if (onchange) onchange([formatTime(_sh, _sm), formatTime(_eh, _em)]);
  }

  let errorEl = null;

  function renderValidation() {
    if (!errorEl) return;
    if (!isValid()) {
      errorEl.textContent = 'End time must be after start time';
      errorEl.style.display = '';
    } else {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function renderPanel() {
    panel.replaceChildren();

    // Start time columns
    const startLabel = div({ class: 'd-timerange-label' }, 'Start');
    const startCols = renderTimeColumns({
      hours: _sh,
      minutes: _sm,
      onChange: (vals) => {
        _sh = vals.hours;
        _sm = vals.minutes;
        renderValidation();
        emitChange();
      }
    });
    const startSection = div({ class: 'd-timerange-section' }, startLabel, startCols);

    const divider = div({ class: 'd-timerange-divider' }, '\u2014');

    // End time columns
    const endLabel = div({ class: 'd-timerange-label' }, 'End');
    const endCols = renderTimeColumns({
      hours: _eh,
      minutes: _em,
      onChange: (vals) => {
        _eh = vals.hours;
        _em = vals.minutes;
        renderValidation();
        emitChange();
      }
    });
    const endSection = div({ class: 'd-timerange-section' }, endLabel, endCols);

    errorEl = div({ class: 'd-timerange-error', role: 'alert' });
    errorEl.style.display = 'none';

    const row = div({ class: 'd-timerange-row' }, startSection, divider, endSection);
    panel.appendChild(row);
    panel.appendChild(errorEl);
    renderValidation();
  }

  const overlay = createFieldOverlay(trigger, panel, {
    trigger: 'click',
    matchWidth: false,
    onOpen: renderPanel
  });

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      trigger.disabled = disabled();
      trigger.setAttribute('aria-disabled', String(!!disabled()));
    });
  } else if (disabled) {
    trigger.disabled = true;
    trigger.setAttribute('aria-disabled', 'true');
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => { parseValue(value()); updateDisplay(); });
  }

  onDestroy(() => { overlay.destroy(); });

  updateDisplay();

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
}
