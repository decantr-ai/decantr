/**
 * DatePicker — Calendar-based date selection with overlay panel.
 * Uses createOverlay behavior. Supports month/year views.
 *
 * @module decantr/components/date-picker
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';
import { icon } from './icon.js';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * @param {Object} [props]
 * @param {Date|string|Function} [props.value] - Selected date
 * @param {string} [props.placeholder='Select date']
 * @param {string} [props.format='yyyy-MM-dd'] - Display format
 * @param {Date} [props.min] - Minimum selectable date
 * @param {Date} [props.max] - Maximum selectable date
 * @param {Function} [props.disabledDate] - (date) => boolean
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function DatePicker(props = {}) {
  injectBase();
  const { value, placeholder = 'Select date', format = 'yyyy-MM-dd', min, max, disabledDate, disabled, onchange, class: cls } = props;

  let selected = parseDate(typeof value === 'function' ? value() : value);
  let viewDate = selected ? new Date(selected) : new Date();
  let viewMode = 'day'; // day | month | year

  function parseDate(v) {
    if (!v) return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }

  function formatDate(d) {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return format.replace('yyyy', y).replace('MM', m).replace('dd', day);
  }

  function isDateDisabled(d) {
    if (min && d < min) return true;
    if (max && d > max) return true;
    if (disabledDate && disabledDate(d)) return true;
    return false;
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  // Display
  const displayEl = h('span', { class: 'd-select-display' });
  const arrow = icon('calendar', { size: '1em', class: 'd-select-arrow' });
  const trigger = h('button', {
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, arrow);

  const panel = h('div', { class: 'd-datepicker-panel', style: { display: 'none' } });
  const wrap = h('div', { class: cx('d-datepicker', cls) }, trigger, panel);

  function updateDisplay() {
    displayEl.textContent = selected ? formatDate(selected) : placeholder;
    if (!selected) displayEl.classList.add('d-select-placeholder');
    else displayEl.classList.remove('d-select-placeholder');
  }

  function renderDayView() {
    panel.replaceChildren();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Header
    const prevBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Previous month' }, '\u2039');
    const nextBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Next month' }, '\u203A');
    const titleBtn = h('button', { type: 'button', class: 'd-datepicker-title' }, `${MONTHS[month]} ${year}`);

    prevBtn.addEventListener('click', () => { viewDate.setMonth(month - 1); renderDayView(); });
    nextBtn.addEventListener('click', () => { viewDate.setMonth(month + 1); renderDayView(); });
    titleBtn.addEventListener('click', () => { viewMode = 'month'; renderMonthView(); });

    const header = h('div', { class: 'd-datepicker-header' },
      h('div', { class: 'd-datepicker-nav' }, prevBtn),
      titleBtn,
      h('div', { class: 'd-datepicker-nav' }, nextBtn)
    );
    panel.appendChild(header);

    // Weekday headers
    const grid = h('div', { class: 'd-datepicker-grid', role: 'grid' });
    DAYS.forEach(d => grid.appendChild(h('div', { class: 'd-datepicker-weekday' }, d)));

    // Days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrev - i);
      const btn = h('button', { type: 'button', class: 'd-datepicker-day d-datepicker-day-outside', tabindex: '-1' }, String(daysInPrev - i));
      btn.addEventListener('click', () => selectDate(d));
      grid.appendChild(btn);
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dis = isDateDisabled(d);
      const cls = cx(
        'd-datepicker-day',
        sameDay(d, today) && 'd-datepicker-day-today',
        sameDay(d, selected) && 'd-datepicker-day-selected',
        dis && 'd-datepicker-day-disabled'
      );
      const btn = h('button', { type: 'button', class: cls, tabindex: '-1', disabled: dis ? '' : undefined }, String(i));
      if (!dis) btn.addEventListener('click', () => selectDate(d));
      grid.appendChild(btn);
    }

    // Next month filler
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const btn = h('button', { type: 'button', class: 'd-datepicker-day d-datepicker-day-outside', tabindex: '-1' }, String(i));
      btn.addEventListener('click', () => selectDate(d));
      grid.appendChild(btn);
    }

    panel.appendChild(grid);
  }

  function renderMonthView() {
    panel.replaceChildren();
    const year = viewDate.getFullYear();

    const prevBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Previous year' }, '\u2039');
    const nextBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Next year' }, '\u203A');
    const titleBtn = h('button', { type: 'button', class: 'd-datepicker-title' }, String(year));

    prevBtn.addEventListener('click', () => { viewDate.setFullYear(year - 1); renderMonthView(); });
    nextBtn.addEventListener('click', () => { viewDate.setFullYear(year + 1); renderMonthView(); });
    titleBtn.addEventListener('click', () => { viewMode = 'year'; renderYearView(); });

    panel.appendChild(h('div', { class: 'd-datepicker-header' },
      h('div', { class: 'd-datepicker-nav' }, prevBtn),
      titleBtn,
      h('div', { class: 'd-datepicker-nav' }, nextBtn)
    ));

    const grid = h('div', { class: 'd-datepicker-months' });
    MONTHS.forEach((m, i) => {
      const isSelected = selected && selected.getFullYear() === year && selected.getMonth() === i;
      const btn = h('button', {
        type: 'button',
        class: cx('d-datepicker-month', isSelected && 'd-datepicker-day-selected')
      }, m);
      btn.addEventListener('click', () => {
        viewDate.setMonth(i);
        viewMode = 'day';
        renderDayView();
      });
      grid.appendChild(btn);
    });
    panel.appendChild(grid);
  }

  function renderYearView() {
    panel.replaceChildren();
    const year = viewDate.getFullYear();
    const startYear = Math.floor(year / 12) * 12;

    const prevBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn' }, '\u2039');
    const nextBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn' }, '\u203A');
    const title = h('span', { class: 'd-datepicker-title' }, `${startYear} - ${startYear + 11}`);

    prevBtn.addEventListener('click', () => { viewDate.setFullYear(year - 12); renderYearView(); });
    nextBtn.addEventListener('click', () => { viewDate.setFullYear(year + 12); renderYearView(); });

    panel.appendChild(h('div', { class: 'd-datepicker-header' },
      h('div', { class: 'd-datepicker-nav' }, prevBtn),
      title,
      h('div', { class: 'd-datepicker-nav' }, nextBtn)
    ));

    const grid = h('div', { class: 'd-datepicker-years' });
    for (let i = 0; i < 12; i++) {
      const y = startYear + i;
      const isSelected = selected && selected.getFullYear() === y;
      const btn = h('button', {
        type: 'button',
        class: cx('d-datepicker-year', isSelected && 'd-datepicker-day-selected')
      }, String(y));
      btn.addEventListener('click', () => {
        viewDate.setFullYear(y);
        viewMode = 'month';
        renderMonthView();
      });
      grid.appendChild(btn);
    }
    panel.appendChild(grid);
  }

  function selectDate(d) {
    selected = d;
    viewDate = new Date(d);
    updateDisplay();
    overlay.close();
    if (onchange) onchange(d);
  }

  const overlay = createOverlay(trigger, panel, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen: () => { viewMode = 'day'; renderDayView(); }
  });

  updateDisplay();

  if (typeof value === 'function') {
    createEffect(() => {
      selected = parseDate(value());
      if (selected) viewDate = new Date(selected);
      updateDisplay();
    });
  }

  return wrap;
}
