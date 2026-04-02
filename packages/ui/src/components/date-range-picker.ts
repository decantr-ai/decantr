/**
 * DateRangePicker — Two calendar panels for selecting a date range.
 * Uses renderCalendar primitive, createFieldOverlay behavior.
 *
 * @module decantr/components/date-range-picker
 */
import { onDestroy } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { icon as iconHelper } from './icon.js';
import { applyFieldState, createFieldOverlay, renderCalendar } from './_primitives.js';

import { component } from '../runtime/component.js';
export interface DateRangePickerProps {
  value?: Array<Date>|Function;
  placeholder?: string;
  min?: Date;
  max?: Date;
  onchange?: (value: unknown) => void;
  disabled?: boolean | (() => boolean);
  error?: boolean | string | (() => boolean | string);
  success?: boolean | string | (() => boolean | string);
  variant?: string;
  size?: string;
  label?: string;
  help?: string;
  required?: boolean;
  class?: string;
  [key: string]: unknown;
}

const { div, button: buttonTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {Array<Date>|Function} [props.value]
 * @param {string} [props.placeholder='Select range']
 * @param {Date} [props.min]
 * @param {Date} [props.max]
 * @param {Function} [props.onchange]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - xs|sm|lg
 * @param {string} [props.label]
 * @param {string} [props.help]
 * @param {boolean} [props.required]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const DateRangePicker = component<DateRangePickerProps>((props: DateRangePickerProps = {} as DateRangePickerProps) => {
  injectBase();
  const {
    value, placeholder = 'Select range', min, max, onchange,
    disabled, error, success, variant, size, label, help, required, class: cls
  } = props;

  let rangeStart: any = null;
  let rangeEnd: any = null;
  let hoverDate: any = null;
  let picking = false;
  let leftDate = new Date();
  let rightDate = new Date();
  rightDate.setMonth(rightDate.getMonth() + 1);

  function parseRange(v: any) {
    if (!v || !Array.isArray(v)) return;
    const s = v[0] instanceof Date ? v[0] : v[0] ? new Date(v[0]) : null;
    const e = v[1] instanceof Date ? v[1] : v[1] ? new Date(v[1]) : null;
    // @ts-expect-error -- strict-mode fix (auto)
    if (s && !isNaN(s)) rangeStart = s;
    // @ts-expect-error -- strict-mode fix (auto)
    if (e && !isNaN(e)) rangeEnd = e;
    if (rangeStart) {
      leftDate = new Date(rangeStart);
      rightDate = new Date(rangeStart);
      rightDate.setMonth(rightDate.getMonth() + 1);
    }
  }

  parseRange(typeof value === 'function' ? value() : value);

  function formatDate(d: any) {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function isDisabled(d: any) {
    if (min && d < min) return true;
    if (max && d > max) return true;
    return false;
  }

  // Display
  const displayEl = span({ class: 'd-select-display' });
  // @ts-expect-error -- strict-mode fix (auto)
  const arrow = span({ class: 'd-select-arrow' }, iconHelper('calendar', { size: 14 }));
  const trigger = buttonTag({
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, arrow);

  const panel = div({ class: 'd-daterange-panel' });
  const wrap = div({ class: cx('d-daterange', cls) }, trigger, panel);

  // @ts-expect-error -- strict-mode fix (auto)
  applyFieldState(wrap, { error, success, disabled, variant, size });

  function updateDisplay() {
    if (rangeStart && rangeEnd) {
      displayEl.textContent = `${formatDate(rangeStart)} — ${formatDate(rangeEnd)}`;
      displayEl.classList.remove('d-select-placeholder');
    } else {
      displayEl.textContent = placeholder;
      displayEl.classList.add('d-select-placeholder');
    }
  }

  function selectDay(d: any) {
    if (isDisabled(d)) return;
    if (!picking) {
      rangeStart = d;
      rangeEnd = null;
      picking = true;
      renderPanel();
    } else {
      if (d < rangeStart) {
        rangeEnd = rangeStart;
        rangeStart = d;
      } else {
        rangeEnd = d;
      }
      picking = false;
      hoverDate = null;
      updateDisplay();
      overlay.close();
      if (onchange) onchange([rangeStart, rangeEnd]);
    }
  }

  function applyPreset(start: any, end: any) {
    rangeStart = start;
    rangeEnd = end;
    picking = false;
    hoverDate = null;
    leftDate = new Date(start);
    rightDate = new Date(start);
    rightDate.setMonth(rightDate.getMonth() + 1);
    updateDisplay();
    overlay.close();
    if (onchange) onchange([rangeStart, rangeEnd]);
  }

  function getPresets() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = (offset: any) => { const r = new Date(today); r.setDate(r.getDate() + offset); return r; };
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    return [
      { label: 'Today', start: today, end: today },
      { label: 'Last 7 days', start: d(-6), end: today },
      { label: 'Last 30 days', start: d(-29), end: today },
      { label: 'This month', start: monthStart, end: today },
      { label: 'Last month', start: lastMonthStart, end: lastMonthEnd },
    ];
  }

  function renderPanel() {
    panel.replaceChildren();

    // Presets sidebar
    const presets = div({ class: 'd-daterange-presets' });
    getPresets().forEach(p => {
      const btn = buttonTag({ type: 'button', class: 'd-daterange-preset' }, p.label);
      btn.addEventListener('click', () => applyPreset(p.start, p.end));
      presets.appendChild(btn);
    });

    // Two calendars using shared renderCalendar primitive
    const leftCal = renderCalendar({
      viewDate: leftDate,
      rangeStart,
      rangeEnd,
      hoverDate: picking ? hoverDate : null,
      isDisabled,
      onSelect: selectDay,
      onHover: picking ? (d) => { hoverDate = d; renderPanel(); } : undefined,
      onNav: (delta) => {
        leftDate.setMonth(leftDate.getMonth() + delta);
        rightDate.setMonth(rightDate.getMonth() + delta);
        renderPanel();
      }
    });

    const rightCal = renderCalendar({
      viewDate: rightDate,
      rangeStart,
      rangeEnd,
      hoverDate: picking ? hoverDate : null,
      isDisabled,
      onSelect: selectDay,
      onHover: picking ? (d) => { hoverDate = d; renderPanel(); } : undefined,
      onNav: (delta) => {
        leftDate.setMonth(leftDate.getMonth() + delta);
        rightDate.setMonth(rightDate.getMonth() + delta);
        renderPanel();
      }
    });

    const calendars = div({ class: 'd-daterange-calendars' }, leftCal, rightCal);
    panel.appendChild(presets);
    panel.appendChild(calendars);
  }

  const overlay = createFieldOverlay(trigger, panel, {
    trigger: 'click',
    matchWidth: false,
    onOpen: () => {
      picking = false;
      hoverDate = null;
      if (rangeStart) {
        leftDate = new Date(rangeStart);
        rightDate = new Date(rangeStart);
        rightDate.setMonth(rightDate.getMonth() + 1);
      }
      renderPanel();
    },
    onClose: () => {
      picking = false;
      hoverDate = null;
    }
  });

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      // @ts-expect-error -- strict-mode fix (auto)
      trigger.disabled = disabled();
      trigger.setAttribute('aria-disabled', String(!!disabled()));
    });
  } else if (disabled) {
    // @ts-expect-error -- strict-mode fix (auto)
    trigger.disabled = true;
    trigger.setAttribute('aria-disabled', 'true');
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => { parseRange(value()); updateDisplay(); });
  }

  onDestroy(() => { overlay.destroy(); });

  updateDisplay();

  if (label || help) {
    // @ts-expect-error -- strict-mode fix (auto)
    const { wrapper } = createFormField(wrap, { label, error, help, required, success, variant, size });
    return wrapper;
  }

  return wrap;
})
