/**
 * DatePicker — Calendar-based date selection with overlay panel.
 * Uses renderCalendar primitive, createFieldOverlay behavior.
 *
 * @module decantr/components/date-picker
 */
import { onDestroy } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createFormField } from './_behaviors.js';
import { icon } from './icon.js';
import { applyFieldState, createFieldOverlay, renderCalendar, MONTHS } from './_primitives.js';

const { div, button: buttonTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {Date|string|Function} [props.value]
 * @param {string} [props.placeholder='Select date']
 * @param {string} [props.format='yyyy-MM-dd']
 * @param {Date} [props.min]
 * @param {Date} [props.max]
 * @param {Function} [props.disabledDate]
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
export function DatePicker(props = {}) {
  injectBase();
  const {
    value, placeholder = 'Select date', format = 'yyyy-MM-dd',
    min, max, disabledDate, disabled, error, success,
    variant, size, label, help, required, onchange, class: cls
  } = props;

  let selected = parseDate(typeof value === 'function' ? value() : value);
  let viewDate = selected ? new Date(selected) : new Date();
  let viewMode = 'day';

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

  // Display
  const displayEl = span({ class: 'd-select-display' });
  const arrow = icon('calendar', { size: '1em', class: 'd-select-arrow' });
  const trigger = buttonTag({
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, arrow);

  const panel = div({ class: 'd-datepicker-panel' });
  const wrap = div({ class: cx('d-datepicker', cls) }, trigger, panel);

  applyFieldState(wrap, { error, success, disabled, variant, size });

  function updateDisplay() {
    displayEl.textContent = selected ? formatDate(selected) : placeholder;
    if (!selected) displayEl.classList.add('d-select-placeholder');
    else displayEl.classList.remove('d-select-placeholder');
  }

  function selectDate(d) {
    selected = d;
    viewDate = new Date(d);
    updateDisplay();
    overlay.close();
    if (onchange) onchange(d);
  }

  function renderDayView() {
    panel.replaceChildren();
    panel.appendChild(renderCalendar({
      viewDate,
      selected,
      isDisabled: isDateDisabled,
      onSelect: selectDate,
      onNav: (delta) => {
        viewDate.setMonth(viewDate.getMonth() + delta);
        renderDayView();
      },
      onTitleClick: () => { viewMode = 'month'; renderMonthView(); }
    }));
  }

  function renderMonthView() {
    panel.replaceChildren();
    const year = viewDate.getFullYear();

    const prevBtn = buttonTag({ type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Previous year' }, '\u2039');
    const nextBtn = buttonTag({ type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Next year' }, '\u203A');
    const titleBtn = buttonTag({ type: 'button', class: 'd-datepicker-title' }, String(year));

    prevBtn.addEventListener('click', () => { viewDate.setFullYear(year - 1); renderMonthView(); });
    nextBtn.addEventListener('click', () => { viewDate.setFullYear(year + 1); renderMonthView(); });
    titleBtn.addEventListener('click', () => { viewMode = 'year'; renderYearView(); });

    panel.appendChild(div({ class: 'd-datepicker-header' },
      div({ class: 'd-datepicker-nav' }, prevBtn),
      titleBtn,
      div({ class: 'd-datepicker-nav' }, nextBtn)
    ));

    const grid = div({ class: 'd-datepicker-months' });
    MONTHS.forEach((m, i) => {
      const isSelected = selected && selected.getFullYear() === year && selected.getMonth() === i;
      const btn = buttonTag({
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

    const prevBtn = buttonTag({ type: 'button', class: 'd-datepicker-nav-btn' }, '\u2039');
    const nextBtn = buttonTag({ type: 'button', class: 'd-datepicker-nav-btn' }, '\u203A');
    const title = span({ class: 'd-datepicker-title' }, `${startYear} - ${startYear + 11}`);

    prevBtn.addEventListener('click', () => { viewDate.setFullYear(year - 12); renderYearView(); });
    nextBtn.addEventListener('click', () => { viewDate.setFullYear(year + 12); renderYearView(); });

    panel.appendChild(div({ class: 'd-datepicker-header' },
      div({ class: 'd-datepicker-nav' }, prevBtn),
      title,
      div({ class: 'd-datepicker-nav' }, nextBtn)
    ));

    const grid = div({ class: 'd-datepicker-years' });
    for (let i = 0; i < 12; i++) {
      const y = startYear + i;
      const isSelected = selected && selected.getFullYear() === y;
      const btn = buttonTag({
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

  const overlay = createFieldOverlay(trigger, panel, {
    trigger: 'click',
    matchWidth: false,
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
}
