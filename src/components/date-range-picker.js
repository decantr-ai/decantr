/**
 * DateRangePicker — Two calendar panels for selecting a date range.
 * Supports preset ranges and hover preview.
 * Uses createOverlay behavior.
 *
 * @module decantr/components/date-range-picker
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * @param {Object} [props]
 * @param {Array<Date>|Function} [props.value] - [startDate, endDate]
 * @param {string} [props.placeholder='Select range']
 * @param {Date} [props.min]
 * @param {Date} [props.max]
 * @param {Function} [props.onchange] - ([start, end]) => void
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function DateRangePicker(props = {}) {
  injectBase();
  const { value, placeholder = 'Select range', min, max, onchange, disabled, class: cls } = props;

  let rangeStart = null;
  let rangeEnd = null;
  let hoverDate = null;
  let picking = false; // true after first click, waiting for second
  let leftDate = new Date();
  let rightDate = new Date();
  rightDate.setMonth(rightDate.getMonth() + 1);

  function parseRange(v) {
    if (!v || !Array.isArray(v)) return;
    const s = v[0] instanceof Date ? v[0] : v[0] ? new Date(v[0]) : null;
    const e = v[1] instanceof Date ? v[1] : v[1] ? new Date(v[1]) : null;
    if (s && !isNaN(s)) rangeStart = s;
    if (e && !isNaN(e)) rangeEnd = e;
    if (rangeStart) {
      leftDate = new Date(rangeStart);
      rightDate = new Date(rangeStart);
      rightDate.setMonth(rightDate.getMonth() + 1);
    }
  }

  parseRange(typeof value === 'function' ? value() : value);

  function formatDate(d) {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function isDisabled(d) {
    if (min && d < min) return true;
    if (max && d > max) return true;
    return false;
  }

  function inRange(d, start, end) {
    if (!start || !end) return false;
    const t = d.getTime();
    return t >= start.getTime() && t <= end.getTime();
  }

  // Display
  const displayEl = h('span', { class: 'd-select-display' });
  const arrow = h('span', { class: 'd-select-arrow' }, '\uD83D\uDCC5');
  const trigger = h('button', {
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, arrow);

  const panel = h('div', { class: 'd-daterange-panel', style: { display: 'none' } });
  const wrap = h('div', { class: cx('d-daterange', cls) }, trigger, panel);

  function updateDisplay() {
    if (rangeStart && rangeEnd) {
      displayEl.textContent = `${formatDate(rangeStart)} — ${formatDate(rangeEnd)}`;
      displayEl.classList.remove('d-select-placeholder');
    } else {
      displayEl.textContent = placeholder;
      displayEl.classList.add('d-select-placeholder');
    }
  }

  function selectDay(d) {
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

  function applyPreset(start, end) {
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
    const d = (offset) => { const r = new Date(today); r.setDate(r.getDate() + offset); return r; };
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

  function renderCalendar(container, viewDate) {
    container.replaceChildren();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Header
    const prevBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Previous month' }, '\u2039');
    const nextBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Next month' }, '\u203A');
    const title = h('span', { class: 'd-datepicker-title' }, `${MONTHS[month]} ${year}`);

    prevBtn.addEventListener('click', () => {
      leftDate.setMonth(leftDate.getMonth() - 1);
      rightDate.setMonth(rightDate.getMonth() - 1);
      renderPanel();
    });
    nextBtn.addEventListener('click', () => {
      leftDate.setMonth(leftDate.getMonth() + 1);
      rightDate.setMonth(rightDate.getMonth() + 1);
      renderPanel();
    });

    container.appendChild(h('div', { class: 'd-datepicker-header' },
      h('div', { class: 'd-datepicker-nav' }, prevBtn),
      title,
      h('div', { class: 'd-datepicker-nav' }, nextBtn)
    ));

    // Weekday headers
    const grid = h('div', { class: 'd-datepicker-grid', role: 'grid' });
    DAYS.forEach(d => grid.appendChild(h('div', { class: 'd-datepicker-weekday' }, d)));

    // Days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();

    // Determine effective range for highlighting
    const effStart = rangeStart;
    const effEnd = picking && hoverDate ? (hoverDate >= rangeStart ? hoverDate : rangeStart) : rangeEnd;
    const effMin = effStart && effEnd && effEnd < effStart ? effEnd : effStart;
    const effMax = effStart && effEnd && effEnd < effStart ? effStart : effEnd;

    function dayClasses(d) {
      const classes = ['d-datepicker-day'];
      if (sameDay(d, today)) classes.push('d-datepicker-day-today');
      if (isDisabled(d)) classes.push('d-datepicker-day-disabled');
      if (effMin && effMax) {
        if (sameDay(d, effMin)) classes.push('d-datepicker-day-selected', 'd-datepicker-day-range-start');
        if (sameDay(d, effMax)) classes.push('d-datepicker-day-selected', 'd-datepicker-day-range-end');
        if (inRange(d, effMin, effMax) && !sameDay(d, effMin) && !sameDay(d, effMax)) {
          classes.push('d-datepicker-day-in-range');
        }
      } else if (effMin && sameDay(d, effMin)) {
        classes.push('d-datepicker-day-selected');
      }
      return classes.join(' ');
    }

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.appendChild(h('div', { class: 'd-datepicker-day d-datepicker-day-outside' }, String(daysInPrev - i)));
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dis = isDisabled(d);
      const btn = h('button', {
        type: 'button',
        class: dayClasses(d),
        tabindex: '-1',
        disabled: dis ? '' : undefined
      }, String(i));
      if (!dis) {
        btn.addEventListener('click', () => selectDay(d));
        btn.addEventListener('mouseenter', () => {
          if (picking) {
            hoverDate = d;
            renderPanel();
          }
        });
      }
      grid.appendChild(btn);
    }

    // Next month filler
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      grid.appendChild(h('div', { class: 'd-datepicker-day d-datepicker-day-outside' }, String(i)));
    }

    container.appendChild(grid);
  }

  function renderPanel() {
    panel.replaceChildren();

    // Presets sidebar
    const presets = h('div', { class: 'd-daterange-presets' });
    getPresets().forEach(p => {
      const btn = h('button', { type: 'button', class: 'd-daterange-preset' }, p.label);
      btn.addEventListener('click', () => applyPreset(p.start, p.end));
      presets.appendChild(btn);
    });

    // Two calendars
    const leftCal = h('div', { class: 'd-daterange-calendar' });
    const rightCal = h('div', { class: 'd-daterange-calendar' });
    renderCalendar(leftCal, leftDate);
    renderCalendar(rightCal, rightDate);

    const calendars = h('div', { class: 'd-daterange-calendars' }, leftCal, rightCal);
    panel.appendChild(presets);
    panel.appendChild(calendars);
  }

  const overlay = createOverlay(trigger, panel, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
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
      trigger.disabled = disabled();
      trigger.setAttribute('aria-disabled', String(!!disabled()));
    });
  } else if (disabled) {
    trigger.disabled = true;
    trigger.setAttribute('aria-disabled', 'true');
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      parseRange(value());
      updateDisplay();
    });
  }

  updateDisplay();
  return wrap;
}
