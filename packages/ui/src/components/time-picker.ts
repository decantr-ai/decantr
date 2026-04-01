/**
 * TimePicker — Time selection with scrollable hour/minute/second columns.
 * Uses renderTimeColumns primitive, createFieldOverlay behavior.
 *
 * @module decantr/components/time-picker
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { icon } from './icon.js';
import { applyFieldState, createFieldOverlay, renderTimeColumns } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface TimePickerProps {
  value?: string | (() => string);
  placeholder?: string;
  seconds?: boolean;
  use12h?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabled?: boolean | (() => boolean);
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  required?: boolean;
  onchange?: (value: unknown) => void;
  class?: string;
  [key: string]: unknown;
}

const { div, button: buttonTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {string|Function} [props.value]
 * @param {string} [props.placeholder='Select time']
 * @param {boolean} [props.seconds=false]
 * @param {boolean} [props.use12h=false]
 * @param {number} [props.hourStep=1]
 * @param {number} [props.minuteStep=1]
 * @param {number} [props.secondStep=1]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const TimePicker = component<TimePickerProps>((props: TimePickerProps = {} as TimePickerProps) => {
  injectBase();
  const {
    value, placeholder = 'Select time', seconds = false, use12h = false,
    hourStep = 1, minuteStep = 1, secondStep = 1, disabled,
    error, success, variant, size, label, help, required, onchange, class: cls
  } = props;

  let _h = 0, _m = 0, _s = 0, _period = 'AM';

  function parseTime(v) {
    if (!v) return;
    const parts = v.split(':').map(Number);
    _h = parts[0] || 0;
    _m = parts[1] || 0;
    _s = parts[2] || 0;
    if (use12h) {
      _period = _h >= 12 ? 'PM' : 'AM';
      _h = _h % 12 || 12;
    }
  }

  function formatTime() {
    let hour = _h;
    if (use12h) hour = _period === 'PM' ? (_h === 12 ? 12 : _h + 12) : (_h === 12 ? 0 : _h);
    const hh = String(hour).padStart(2, '0');
    const mm = String(_m).padStart(2, '0');
    if (seconds) return `${hh}:${mm}:${String(_s).padStart(2, '0')}`;
    return `${hh}:${mm}`;
  }

  function displayTime() {
    const hh = String(_h).padStart(2, '0');
    const mm = String(_m).padStart(2, '0');
    let t = `${hh}:${mm}`;
    if (seconds) t += `:${String(_s).padStart(2, '0')}`;
    if (use12h) t += ` ${_period}`;
    return t;
  }

  parseTime(typeof value === 'function' ? value() : value);

  const displayEl = span({ class: 'd-select-display' });
  const trigger = buttonTag({
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, icon('clock', { size: '1em', class: 'd-select-arrow' }));

  const panel = div({ class: 'd-timepicker-panel' });
  const wrap = div({ class: cx('d-timepicker', cls) }, trigger, panel);

  applyFieldState(wrap, { error, success, disabled, variant, size });

  function updateDisplay() {
    const initVal = typeof value === 'function' ? value() : value;
    displayEl.textContent = initVal || _h || _m || _s ? displayTime() : placeholder;
    if (!initVal && !_h && !_m && !_s) displayEl.classList.add('d-select-placeholder');
    else displayEl.classList.remove('d-select-placeholder');
  }

  function emitChange() {
    updateDisplay();
    if (onchange) onchange(formatTime());
  }

  function renderPanel() {
    panel.replaceChildren();
    panel.appendChild(renderTimeColumns({
      hours: _h,
      minutes: _m,
      seconds: seconds ? _s : undefined,
      hourStep,
      minuteStep,
      secondStep,
      use12h,
      period: _period,
      onChange: (vals) => {
        _h = vals.hours;
        _m = vals.minutes;
        if (vals.seconds !== undefined) _s = vals.seconds;
        if (vals.period) _period = vals.period;
        emitChange();
      }
    }));
  }

  const overlay = createFieldOverlay(trigger, panel, {
    trigger: 'click',
    matchWidth: false,
    onOpen: renderPanel
  });

  updateDisplay();

  if (typeof value === 'function') {
    createEffect(() => { parseTime(value()); updateDisplay(); });
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => { trigger.disabled = disabled(); });
  } else if (disabled) {
    trigger.disabled = true;
  }

  onDestroy(() => { overlay.destroy(); });

  if (label || help) {
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
