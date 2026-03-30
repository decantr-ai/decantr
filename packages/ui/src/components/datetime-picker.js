/**
 * DateTimePicker — Combined date + time selection returning ISO datetime string.
 * Composes DatePicker + TimePicker internally.
 *
 * @module decantr/components/datetime-picker
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createOverlay } from './_behaviors.js';
import { icon } from './icon.js';

const { div, span, button: buttonTag, input } = tags;

const DAYS_HDR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * @param {Object} [props]
 * @param {Date|string|Function} [props.value] - Selected datetime (Date or ISO string)
 * @param {string} [props.placeholder='Select date and time']
 * @param {Date} [props.min] - Minimum selectable datetime
 * @param {Date} [props.max] - Maximum selectable datetime
 * @param {boolean} [props.seconds=false] - Show seconds in time picker
 * @param {boolean} [props.use12h=false] - 12-hour format
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange] - Called with Date object
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function DateTimePicker(props = {}) {
  injectBase();
  const {
    value, placeholder = 'Select date and time',
    min, max, seconds = false, use12h = false,
    disabled, onchange, class: cls
  } = props;

  let selected = parseVal(typeof value === 'function' ? value() : value);
  let viewDate = selected ? new Date(selected) : new Date();
  let _h = selected ? selected.getHours() : 12;
  let _m = selected ? selected.getMinutes() : 0;
  let _s = selected ? selected.getSeconds() : 0;

  function parseVal(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }

  function formatDisplay(d) {
    if (!d) return '';
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    let h = d.getHours(), period = '';
    if (use12h) {
      period = h >= 12 ? ' PM' : ' AM';
      h = h % 12 || 12;
    }
    const time = `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}${seconds ? ':' + String(d.getSeconds()).padStart(2, '0') : ''}${period}`;
    return `${y}-${mo}-${day} ${time}`;
  }

  function buildDateTime(date, hours, mins, secs) {
    const d = new Date(date);
    d.setHours(hours, mins, secs, 0);
    return d;
  }

  // Display
  const displayEl = span({ class: 'd-select-display' });
  const arrow = icon('calendar', { size: '1em', class: 'd-select-arrow' });
  const trigger = buttonTag({
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, arrow);

  const panel = div({ class: 'd-datetimepicker-panel' });
  const wrap = div({ class: cx('d-datetimepicker', cls) }, trigger, panel);

  function updateDisplay() {
    displayEl.textContent = selected ? formatDisplay(selected) : placeholder;
    if (!selected) displayEl.classList.add('d-select-placeholder');
    else displayEl.classList.remove('d-select-placeholder');
  }

  // ─── Calendar rendering ───────────────────────────────
  function renderPanel() {
    panel.replaceChildren();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Calendar section
    const calSection = div({ class: 'd-datetimepicker-date' });

    // Nav header
    const prevBtn = buttonTag({ type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Previous month' }, caret('left'));
    const nextBtn = buttonTag({ type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Next month' }, caret('right'));
    const titleEl = span({ class: 'd-datepicker-title' }, `${MONTHS[month]} ${year}`);

    prevBtn.addEventListener('click', () => { viewDate.setMonth(month - 1); renderPanel(); });
    nextBtn.addEventListener('click', () => { viewDate.setMonth(month + 1); renderPanel(); });

    calSection.appendChild(div({ class: 'd-datepicker-header' },
      div({ class: 'd-datepicker-nav' }, prevBtn), titleEl, div({ class: 'd-datepicker-nav' }, nextBtn)));

    // Weekday headers
    const grid = div({ class: 'd-datepicker-grid', role: 'grid' });
    DAYS_HDR.forEach(d => grid.appendChild(div({ class: 'd-datepicker-weekday' }, d)));

    // Days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();

    function sameDay(a, b) {
      return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    for (let i = firstDay - 1; i >= 0; i--) {
      grid.appendChild(buttonTag({ type: 'button', class: 'd-datepicker-day d-datepicker-day-outside', tabindex: '-1' }, String(daysInPrev - i)));
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dayClass = cx(
        'd-datepicker-day',
        sameDay(d, today) && 'd-datepicker-day-today',
        sameDay(d, selected) && 'd-datepicker-day-selected',
      );
      const btn = buttonTag({ type: 'button', class: dayClass, tabindex: '-1' }, String(i));
      btn.addEventListener('click', () => {
        viewDate = new Date(d);
        selected = buildDateTime(d, _h, _m, _s);
        updateDisplay();
        renderPanel();
        if (onchange) onchange(new Date(selected));
      });
      grid.appendChild(btn);
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      grid.appendChild(buttonTag({ type: 'button', class: 'd-datepicker-day d-datepicker-day-outside', tabindex: '-1' }, String(i)));
    }

    calSection.appendChild(grid);
    panel.appendChild(calSection);

    // ─── Time section ─────────────────────────────────
    const timeSection = div({ class: 'd-datetimepicker-time' });
    const timeLabel = div({ class: 'd-datetimepicker-time-label' }, 'Time');
    timeSection.appendChild(timeLabel);

    const timeRow = div({ class: 'd-datetimepicker-time-row' });

    function createSpinner(val, minV, maxV, onChange) {
      const inp = input({
        type: 'number',
        class: 'd-datetimepicker-spinner',
        min: String(minV),
        max: String(maxV),
        value: String(val).padStart(2, '0'),
      });
      inp.addEventListener('change', () => {
        let v = parseInt(inp.value, 10);
        if (isNaN(v)) v = minV;
        v = Math.max(minV, Math.min(maxV, v));
        inp.value = String(v).padStart(2, '0');
        onChange(v);
      });
      return inp;
    }

    const hInput = createSpinner(use12h ? (_h % 12 || 12) : _h, use12h ? 1 : 0, use12h ? 12 : 23, (v) => {
      _h = use12h ? (v % 12) + (_h >= 12 ? 12 : 0) : v;
      if (selected) { selected = buildDateTime(selected, _h, _m, _s); updateDisplay(); if (onchange) onchange(new Date(selected)); }
    });

    timeRow.appendChild(hInput);
    timeRow.appendChild(span({ class: 'd-datetimepicker-sep' }, ':'));

    const mInput = createSpinner(_m, 0, 59, (v) => {
      _m = v;
      if (selected) { selected = buildDateTime(selected, _h, _m, _s); updateDisplay(); if (onchange) onchange(new Date(selected)); }
    });
    timeRow.appendChild(mInput);

    if (seconds) {
      timeRow.appendChild(span({ class: 'd-datetimepicker-sep' }, ':'));
      const sInput = createSpinner(_s, 0, 59, (v) => {
        _s = v;
        if (selected) { selected = buildDateTime(selected, _h, _m, _s); updateDisplay(); if (onchange) onchange(new Date(selected)); }
      });
      timeRow.appendChild(sInput);
    }

    if (use12h) {
      const ampm = buttonTag({ type: 'button', class: 'd-datetimepicker-ampm' }, _h >= 12 ? 'PM' : 'AM');
      ampm.addEventListener('click', () => {
        _h = _h >= 12 ? _h - 12 : _h + 12;
        ampm.textContent = _h >= 12 ? 'PM' : 'AM';
        if (selected) { selected = buildDateTime(selected, _h, _m, _s); updateDisplay(); if (onchange) onchange(new Date(selected)); }
      });
      timeRow.appendChild(ampm);
    }

    timeSection.appendChild(timeRow);

    // Now button
    const nowBtn = buttonTag({ type: 'button', class: 'd-datetimepicker-now' }, 'Now');
    nowBtn.addEventListener('click', () => {
      const now = new Date();
      selected = now;
      viewDate = new Date(now);
      _h = now.getHours(); _m = now.getMinutes(); _s = now.getSeconds();
      updateDisplay();
      renderPanel();
      if (onchange) onchange(new Date(selected));
    });
    timeSection.appendChild(nowBtn);

    panel.appendChild(timeSection);

    // OK / Close button
    const footer = div({ class: 'd-datetimepicker-footer' });
    const okBtn = buttonTag({ type: 'button', class: 'd-btn d-btn-sm' }, 'OK');
    okBtn.addEventListener('click', () => overlay.close());
    footer.appendChild(okBtn);
    panel.appendChild(footer);
  }

  const overlay = createOverlay(trigger, panel, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen: renderPanel,
  });

  updateDisplay();

  if (typeof value === 'function') {
    createEffect(() => {
      selected = parseVal(value());
      if (selected) {
        viewDate = new Date(selected);
        _h = selected.getHours(); _m = selected.getMinutes(); _s = selected.getSeconds();
      }
      updateDisplay();
    });
  }

  if (typeof disabled === 'function') {
    createEffect(() => { trigger.disabled = !!disabled(); });
  } else if (disabled) {
    trigger.disabled = true;
  }

  onDestroy(() => {
    overlay.destroy();
  });

  return wrap;
}
