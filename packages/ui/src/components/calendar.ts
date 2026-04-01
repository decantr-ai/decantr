/**
 * Calendar — Full calendar display with day cells and events.
 *
 * @module decantr/components/calendar
 */
import { h } from '../runtime/index.js';
import { createEffect, createSignal } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { caret } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface CalendarProps {
  value?: Date|Function;
  mode?: 'month'|'year';
  mini?: boolean;
  dateCellRender?: (...args: unknown[]) => unknown;
  onSelect?: (value: unknown) => void;
  onPanelChange?: (...args: unknown[]) => unknown;
  class?: string;
  [key: string]: unknown;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * @param {Object} [props]
 * @param {Date|Function} [props.value] - Selected date
 * @param {'month'|'year'} [props.mode='month']
 * @param {boolean} [props.mini=false] - Compact mode (no cell content)
 * @param {Function} [props.dateCellRender] - (date) => Node — custom cell content
 * @param {Function} [props.onSelect] - Called with selected date
 * @param {Function} [props.onPanelChange] - Called with (date, mode)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Calendar = component<CalendarProps>((props: CalendarProps = {} as CalendarProps) => {
  injectBase();
  const { value, mode: initMode = 'month', mini = false, dateCellRender, onSelect, onPanelChange, class: cls } = props;

  const [getView, setView] = createSignal(typeof value === 'function' ? (value() || new Date()) : (value || new Date()));
  const [getMode, setMode] = createSignal(initMode);

  const container = h('div', { class: cx('d-calendar', mini && 'd-calendar-mini', cls) });

  function render() {
    container.replaceChildren();
    const viewDate = getView();
    const mode = getMode();

    // Header
    const headerRow = h('div', { class: 'd-calendar-header' });
    const prevBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Previous' }, caret('left'));
    const nextBtn = h('button', { type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Next' }, caret('right'));
    const title = h('span', { class: 'd-calendar-title' },
      mode === 'month' ? `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}` : String(viewDate.getFullYear())
    );

    prevBtn.addEventListener('click', () => {
      const d = new Date(viewDate);
      if (mode === 'month') d.setMonth(d.getMonth() - 1);
      else d.setFullYear(d.getFullYear() - 1);
      setView(d);
      if (onPanelChange) onPanelChange(d, mode);
    });
    nextBtn.addEventListener('click', () => {
      const d = new Date(viewDate);
      if (mode === 'month') d.setMonth(d.getMonth() + 1);
      else d.setFullYear(d.getFullYear() + 1);
      setView(d);
      if (onPanelChange) onPanelChange(d, mode);
    });

    headerRow.appendChild(h('div', { class: 'd-datepicker-nav' }, prevBtn));
    headerRow.appendChild(title);
    headerRow.appendChild(h('div', { class: 'd-datepicker-nav' }, nextBtn));
    container.appendChild(headerRow);

    if (mode === 'month') renderMonth(viewDate);
    else renderYear(viewDate);
  }

  function renderMonth(viewDate) {
    const grid = h('div', { class: 'd-calendar-grid' });
    DAYS.forEach(d => grid.appendChild(h('div', { class: 'd-calendar-weekday' }, mini ? d[0] : d)));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const selected = typeof value === 'function' ? value() : value;

    // Filler for previous month
    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(h('div', { class: 'd-calendar-cell', style: { opacity: '0.3' } }));
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isToday = d.toDateString() === today.toDateString();
      const isSel = selected && d.toDateString() === new Date(selected).toDateString();

      const cell = h('button', {
        type: 'button',
        class: cx('d-calendar-cell', isToday && 'd-datepicker-day-today', isSel && 'd-datepicker-day-selected')
      });

      cell.appendChild(h('div', { class: 'd-calendar-cell-content' }, String(i)));
      if (dateCellRender && !mini) {
        const custom = dateCellRender(d);
        if (custom) cell.appendChild(custom);
      }

      cell.addEventListener('click', () => {
        if (onSelect) onSelect(d);
      });

      grid.appendChild(cell);
    }

    container.appendChild(grid);
  }

  function renderYear(viewDate) {
    const grid = h('div', { class: 'd-datepicker-months' });
    MONTHS.forEach((m, i) => {
      const btn = h('button', { type: 'button', class: 'd-datepicker-month' }, m.slice(0, 3));
      btn.addEventListener('click', () => {
        const d = new Date(viewDate);
        d.setMonth(i);
        setView(d);
        setMode('month');
        if (onPanelChange) onPanelChange(d, 'month');
      });
      grid.appendChild(btn);
    });
    container.appendChild(grid);
  }

  createEffect(render);
  return container;
})
