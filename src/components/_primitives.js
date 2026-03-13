/**
 * Shared rendering primitives for Decantr components.
 * Eliminates duplication across calendar, time, menu, and field components.
 *
 * @module decantr/components/_primitives
 */
import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { cx } from './_base.js';
import { caret, createOverlay, positionPanel } from './_behaviors.js';

const { div, button, span } = tags;

// ─── CALENDAR RENDERING ──────────────────────────────────────
// Used by: DatePicker, DateRangePicker

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export { MONTHS };

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Render a calendar month grid with navigation header.
 *
 * @param {Object} opts
 * @param {Date} opts.viewDate - Month/year to display
 * @param {Date} [opts.selected] - Selected date (highlight)
 * @param {Date} [opts.rangeStart] - Range start for range pickers
 * @param {Date} [opts.rangeEnd] - Range end for range pickers
 * @param {Date} [opts.hoverDate] - Hover date for range preview
 * @param {Function} [opts.isDisabled] - (date) => boolean
 * @param {Function} opts.onSelect - (date) => void
 * @param {Function} [opts.onHover] - (date) => void
 * @param {Function} opts.onNav - (delta) => void  — called with -1/+1 for month nav
 * @param {Function} [opts.onTitleClick] - () => void — switch to month view
 * @returns {HTMLElement}
 */
export function renderCalendar(opts) {
  const { viewDate, selected, rangeStart, rangeEnd, hoverDate, isDisabled, onSelect, onHover, onNav, onTitleClick } = opts;
  const container = div({ class: 'd-datepicker-calendar' });
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Header
  const prevBtn = button({ type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Previous month' }, '\u2039');
  const nextBtn = button({ type: 'button', class: 'd-datepicker-nav-btn', 'aria-label': 'Next month' }, '\u203A');
  const titleBtn = onTitleClick
    ? button({ type: 'button', class: 'd-datepicker-title' }, `${MONTHS[month]} ${year}`)
    : span({ class: 'd-datepicker-title' }, `${MONTHS[month]} ${year}`);

  prevBtn.addEventListener('click', () => onNav(-1));
  nextBtn.addEventListener('click', () => onNav(1));
  if (onTitleClick) titleBtn.addEventListener('click', onTitleClick);

  container.appendChild(div({ class: 'd-datepicker-header' },
    div({ class: 'd-datepicker-nav' }, prevBtn),
    titleBtn,
    div({ class: 'd-datepicker-nav' }, nextBtn)
  ));

  // Grid
  const grid = div({ class: 'd-datepicker-grid', role: 'grid' });
  DAYS.forEach(d => grid.appendChild(div({ class: 'd-datepicker-weekday' }, d)));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();

  // Effective range for highlighting
  const effStart = rangeStart;
  const effEnd = hoverDate && rangeStart ? (hoverDate >= rangeStart ? hoverDate : rangeStart) : rangeEnd;
  const effMin = effStart && effEnd && effEnd < effStart ? effEnd : effStart;
  const effMax = effStart && effEnd && effEnd < effStart ? effStart : effEnd;

  function dayClasses(d, outside) {
    const c = ['d-datepicker-day'];
    if (outside) c.push('d-datepicker-day-outside');
    if (sameDay(d, today)) c.push('d-datepicker-day-today');
    if (isDisabled && isDisabled(d)) c.push('d-datepicker-day-disabled');
    if (sameDay(d, selected)) c.push('d-datepicker-day-selected');
    if (effMin && effMax) {
      if (sameDay(d, effMin)) c.push('d-datepicker-day-selected', 'd-datepicker-day-range-start');
      if (sameDay(d, effMax)) c.push('d-datepicker-day-selected', 'd-datepicker-day-range-end');
      const t = d.getTime();
      if (t > effMin.getTime() && t < effMax.getTime()) c.push('d-datepicker-day-in-range');
    }
    return c.join(' ');
  }

  // Previous month filler
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrev - i);
    const btn = button({ type: 'button', class: dayClasses(d, true), tabindex: '-1' }, String(daysInPrev - i));
    btn.addEventListener('click', () => onSelect(d));
    grid.appendChild(btn);
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dis = isDisabled && isDisabled(d);
    const btn = button({
      type: 'button',
      class: dayClasses(d, false),
      tabindex: '-1',
      disabled: dis ? '' : undefined
    }, String(i));
    if (!dis) {
      btn.addEventListener('click', () => onSelect(d));
      if (onHover) btn.addEventListener('mouseenter', () => onHover(d));
    }
    grid.appendChild(btn);
  }

  // Next month filler
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const btn = button({ type: 'button', class: dayClasses(d, true), tabindex: '-1' }, String(i));
    btn.addEventListener('click', () => onSelect(d));
    grid.appendChild(btn);
  }

  container.appendChild(grid);
  return container;
}


// ─── TIME COLUMNS ────────────────────────────────────────────
// Used by: TimePicker, TimeRangePicker

/**
 * Render scrollable time selection columns.
 *
 * @param {Object} opts
 * @param {number} opts.hours - Selected hour
 * @param {number} opts.minutes - Selected minute
 * @param {number} [opts.seconds] - Selected second (omit to hide seconds column)
 * @param {number} [opts.hourStep=1]
 * @param {number} [opts.minuteStep=1]
 * @param {number} [opts.secondStep=1]
 * @param {boolean} [opts.use12h=false]
 * @param {string} [opts.period='AM'] - AM/PM for 12h mode
 * @param {Function} opts.onChange - ({ hours, minutes, seconds?, period? }) => void
 * @returns {HTMLElement}
 */
export function renderTimeColumns(opts) {
  const { hours, minutes, seconds, hourStep = 1, minuteStep = 1, secondStep = 1, use12h = false, period = 'AM', onChange } = opts;

  const container = div({ class: 'd-timepicker-columns' });

  function createColumn(count, step, selected, startAt, onSelect) {
    const col = div({ class: 'd-timepicker-column' });
    for (let i = startAt; i < count; i += step) {
      const cell = button({
        type: 'button',
        class: cx('d-timepicker-cell', i === selected && 'd-timepicker-cell-selected'),
        tabindex: '-1'
      }, String(i).padStart(2, '0'));
      cell.addEventListener('click', () => {
        onSelect(i);
        col.querySelectorAll('.d-timepicker-cell').forEach(c => c.classList.remove('d-timepicker-cell-selected'));
        cell.classList.add('d-timepicker-cell-selected');
      });
      col.appendChild(cell);
    }
    requestAnimationFrame(() => {
      const sel = col.querySelector('.d-timepicker-cell-selected');
      if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'center' });
    });
    return col;
  }

  // Hour column
  const maxH = use12h ? 13 : 24;
  const startH = use12h ? 1 : 0;
  container.appendChild(createColumn(maxH, hourStep, hours, startH, (v) => {
    onChange({ hours: v, minutes, seconds, period });
  }));

  // Minute column
  container.appendChild(createColumn(60, minuteStep, minutes, 0, (v) => {
    onChange({ hours, minutes: v, seconds, period });
  }));

  // Second column (optional)
  if (seconds !== undefined) {
    container.appendChild(createColumn(60, secondStep, seconds, 0, (v) => {
      onChange({ hours, minutes, seconds: v, period });
    }));
  }

  // AM/PM column (12h mode)
  if (use12h) {
    const periodCol = div({ class: 'd-timepicker-column' });
    ['AM', 'PM'].forEach(p => {
      const cell = button({
        type: 'button',
        class: cx('d-timepicker-cell', p === period && 'd-timepicker-cell-selected'),
        tabindex: '-1'
      }, p);
      cell.addEventListener('click', () => {
        onChange({ hours, minutes, seconds, period: p });
        periodCol.querySelectorAll('.d-timepicker-cell').forEach(c => c.classList.remove('d-timepicker-cell-selected'));
        cell.classList.add('d-timepicker-cell-selected');
      });
      periodCol.appendChild(cell);
    });
    container.appendChild(periodCol);
  }

  return container;
}


// ─── MENU ITEMS ──────────────────────────────────────────────
// Used by: ContextMenu, Dropdown

/**
 * Render menu items into a container.
 *
 * @param {HTMLElement} container
 * @param {{ label: string, value?: string, icon?: string|Node, shortcut?: string, disabled?: boolean, separator?: boolean, onclick?: Function }[]} items
 * @param {Object} [opts]
 * @param {Function} [opts.onSelect] - (value|label) => void
 * @param {Function} [opts.onClose] - () => void — close menu after selection
 * @returns {void}
 */
export function renderMenuItems(container, items, opts = {}) {
  const { onSelect, onClose } = opts;
  container.replaceChildren();

  items.forEach(item => {
    if (item.separator) {
      container.appendChild(div({ class: 'd-dropdown-separator', role: 'separator' }));
      return;
    }
    const children = [];
    if (item.icon) {
      children.push(typeof item.icon === 'string'
        ? span({ class: 'd-dropdown-item-icon', 'aria-hidden': 'true' }, item.icon)
        : item.icon);
    }
    children.push(span({ class: 'd-dropdown-item-label' }, item.label));
    if (item.shortcut) {
      children.push(span({ class: 'd-dropdown-item-shortcut' }, item.shortcut));
    }

    const el = div({
      class: cx('d-dropdown-item', item.disabled && 'd-dropdown-item-disabled'),
      role: 'menuitem',
      tabindex: '-1'
    }, ...children);

    if (!item.disabled) {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onClose) onClose();
        if (item.onclick) item.onclick(item.value || item.label);
        if (onSelect) onSelect(item.value || item.label);
      });
    }
    container.appendChild(el);
  });
}


// ─── FIELD STATE ─────────────────────────────────────────────
// Used by: ALL 14 field components

/**
 * Apply reactive field state (error, success, disabled, readonly, variant, size, loading)
 * to a .d-field element. Single source of truth for all field components.
 *
 * @param {HTMLElement} el - The .d-field container element
 * @param {Object} props
 * @param {boolean|string|Function} [props.error]
 * @param {boolean|string|Function} [props.success]
 * @param {boolean|Function} [props.disabled]
 * @param {boolean|Function} [props.readonly]
 * @param {boolean|Function} [props.loading]
 * @param {string} [props.variant='outlined'] - 'outlined'|'filled'|'ghost'
 * @param {string} [props.size] - 'xs'|'sm'|'lg'
 * @returns {{ destroy: Function }}
 */
export function applyFieldState(el, props = {}) {
  const { error, success, disabled, readonly, loading, variant, size } = props;

  // Static class setup
  el.classList.add('d-field');
  if (variant && variant !== 'outlined') el.classList.add(`d-field-${variant}`);
  if (size) el.classList.add(`d-field-${size}`);

  // Reactive error
  if (typeof error === 'function') {
    createEffect(() => {
      const v = error();
      if (v) el.setAttribute('data-error', typeof v === 'string' ? v : '');
      else el.removeAttribute('data-error');
    });
  } else if (error) {
    el.setAttribute('data-error', typeof error === 'string' ? error : '');
  }

  // Reactive success
  if (typeof success === 'function') {
    createEffect(() => {
      const v = success();
      if (v) el.setAttribute('data-success', typeof v === 'string' ? v : '');
      else el.removeAttribute('data-success');
    });
  } else if (success) {
    el.setAttribute('data-success', typeof success === 'string' ? success : '');
  }

  // Reactive disabled
  if (typeof disabled === 'function') {
    createEffect(() => {
      const v = disabled();
      if (v) el.setAttribute('data-disabled', '');
      else el.removeAttribute('data-disabled');
    });
  } else if (disabled) {
    el.setAttribute('data-disabled', '');
  }

  // Reactive readonly
  if (typeof readonly === 'function') {
    createEffect(() => {
      const v = readonly();
      if (v) el.setAttribute('readonly', '');
      else el.removeAttribute('readonly');
    });
  } else if (readonly) {
    el.setAttribute('readonly', '');
  }

  return { destroy() {} };
}


// ─── FIELD OVERLAY ───────────────────────────────────────────
// Used by: Select, Combobox, DatePicker, TimePicker, Cascader, TreeSelect, ColorPicker, Mentions

/**
 * Create an overlay with field-standard defaults (matchWidth, portal, placement).
 * Thin wrapper around createOverlay + positionPanel.
 *
 * @param {HTMLElement} triggerEl
 * @param {HTMLElement} panelEl
 * @param {Object} [opts] - Passed to createOverlay, with these defaults:
 *   trigger: 'manual', portal: true, matchWidth: true, closeOnEscape: true, closeOnOutside: true
 * @returns {{ open, close, toggle, isOpen, destroy }}
 */
export function createFieldOverlay(triggerEl, panelEl, opts = {}) {
  return createOverlay(triggerEl, panelEl, {
    trigger: 'manual',
    portal: true,
    matchWidth: true,
    closeOnEscape: true,
    closeOnOutside: true,
    ...opts
  });
}


// ─── OKLCH COLOR MATH ────────────────────────────────────────
// Used by: ColorPicker

/**
 * Convert hex color to OKLCH components.
 * @param {string} hex
 * @returns {{ l: number, c: number, h: number }} l: 0-1, c: 0-0.4, h: 0-360
 */
export function hexToOklch(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // sRGB → linear RGB
  const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);

  // Linear RGB → OKLab
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_c = Math.cbrt(l_), m_c = Math.cbrt(m_), s_c = Math.cbrt(s_);

  const L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c;
  const a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c;
  const bk = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c;

  const C = Math.sqrt(a * a + bk * bk);
  let H = Math.atan2(bk, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

/**
 * Convert OKLCH to hex color.
 * @param {number} L - Lightness 0-1
 * @param {number} C - Chroma 0-0.4
 * @param {number} H - Hue 0-360
 * @returns {string} hex color
 */
export function oklchToHex(L, C, H) {
  const hRad = H * (Math.PI / 180);
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab → linear RGB via LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l_c = l_ * l_ * l_, m_c = m_ * m_ * m_, s_c = s_ * s_ * s_;

  let lr = +4.0767416621 * l_c - 3.3077115913 * m_c + 0.2309699292 * s_c;
  let lg = -1.2684380046 * l_c + 2.6097574011 * m_c - 0.3413193965 * s_c;
  let lb = -0.0041960863 * l_c - 0.7034186147 * m_c + 1.7076147010 * s_c;

  // Clamp
  lr = Math.max(0, Math.min(1, lr));
  lg = Math.max(0, Math.min(1, lg));
  lb = Math.max(0, Math.min(1, lb));

  // Linear → sRGB
  const toSrgb = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  const toHex = (c) => Math.round(Math.max(0, Math.min(255, toSrgb(c) * 255))).toString(16).padStart(2, '0');

  return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
}
