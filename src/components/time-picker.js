/**
 * TimePicker — Time selection with scrollable hour/minute/second columns.
 * Uses createOverlay behavior.
 *
 * @module decantr/components/time-picker
 */
import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { createOverlay } from './_behaviors.js';
import { icon } from './icon.js';

/**
 * @param {Object} [props]
 * @param {string|Function} [props.value] - Time string 'HH:mm' or 'HH:mm:ss'
 * @param {string} [props.placeholder='Select time']
 * @param {boolean} [props.seconds=false] - Show seconds column
 * @param {boolean} [props.use12h=false] - 12-hour format
 * @param {number} [props.hourStep=1]
 * @param {number} [props.minuteStep=1]
 * @param {number} [props.secondStep=1]
 * @param {boolean|Function} [props.disabled]
 * @param {Function} [props.onchange]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function TimePicker(props = {}) {
  injectBase();
  const { value, placeholder = 'Select time', seconds = false, use12h = false, hourStep = 1, minuteStep = 1, secondStep = 1, disabled, onchange, class: cls } = props;

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
    if (seconds) {
      const ss = String(_s).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
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

  const displayEl = h('span', { class: 'd-select-display' });
  const trigger = h('button', {
    type: 'button',
    class: 'd-select',
    'aria-haspopup': 'dialog',
    'aria-expanded': 'false'
  }, displayEl, icon('clock', { size: '1em', class: 'd-select-arrow' }));

  const panel = h('div', { class: 'd-timepicker-panel', style: { display: 'none' } });
  const wrap = h('div', { class: cx('d-timepicker', cls) }, trigger, panel);

  function updateDisplay() {
    const initVal = typeof value === 'function' ? value() : value;
    displayEl.textContent = initVal || _h || _m || _s ? displayTime() : placeholder;
    if (!initVal && !_h && !_m && !_s) displayEl.classList.add('d-select-placeholder');
    else displayEl.classList.remove('d-select-placeholder');
  }

  function createColumn(count, step, selected, onSelect) {
    const col = h('div', { class: 'd-timepicker-column' });
    for (let i = 0; i < count; i += step) {
      const cell = h('button', {
        type: 'button',
        class: cx('d-timepicker-cell', i === selected && 'd-timepicker-cell-selected'),
        tabindex: '-1'
      }, String(i).padStart(2, '0'));
      cell.addEventListener('click', () => {
        onSelect(i);
        col.querySelectorAll('.d-timepicker-cell').forEach(c => c.classList.remove('d-timepicker-cell-selected'));
        cell.classList.add('d-timepicker-cell-selected');
        emitChange();
      });
      col.appendChild(cell);
    }
    // Scroll to selected
    requestAnimationFrame(() => {
      const sel = col.querySelector('.d-timepicker-cell-selected');
      if (sel) sel.scrollIntoView({ block: 'center' });
    });
    return col;
  }

  function emitChange() {
    updateDisplay();
    if (onchange) onchange(formatTime());
  }

  function renderPanel() {
    panel.replaceChildren();
    const maxH = use12h ? 13 : 24;
    const startH = use12h ? 1 : 0;
    const hourCol = h('div', { class: 'd-timepicker-column' });
    for (let i = startH; i < maxH; i += hourStep) {
      const cell = h('button', {
        type: 'button',
        class: cx('d-timepicker-cell', i === _h && 'd-timepicker-cell-selected'),
        tabindex: '-1'
      }, String(i).padStart(2, '0'));
      cell.addEventListener('click', () => {
        _h = i;
        hourCol.querySelectorAll('.d-timepicker-cell').forEach(c => c.classList.remove('d-timepicker-cell-selected'));
        cell.classList.add('d-timepicker-cell-selected');
        emitChange();
      });
      hourCol.appendChild(cell);
    }
    panel.appendChild(hourCol);
    panel.appendChild(createColumn(60, minuteStep, _m, (v) => { _m = v; }));
    if (seconds) panel.appendChild(createColumn(60, secondStep, _s, (v) => { _s = v; }));
    if (use12h) {
      const periodCol = h('div', { class: 'd-timepicker-column' });
      ['AM', 'PM'].forEach(p => {
        const cell = h('button', {
          type: 'button',
          class: cx('d-timepicker-cell', p === _period && 'd-timepicker-cell-selected'),
          tabindex: '-1'
        }, p);
        cell.addEventListener('click', () => {
          _period = p;
          periodCol.querySelectorAll('.d-timepicker-cell').forEach(c => c.classList.remove('d-timepicker-cell-selected'));
          cell.classList.add('d-timepicker-cell-selected');
          emitChange();
        });
        periodCol.appendChild(cell);
      });
      panel.appendChild(periodCol);
    }

    // Scroll to selected items
    requestAnimationFrame(() => {
      panel.querySelectorAll('.d-timepicker-cell-selected').forEach(el => el.scrollIntoView({ block: 'center' }));
    });
  }

  createOverlay(trigger, panel, {
    trigger: 'click',
    closeOnEscape: true,
    closeOnOutside: true,
    onOpen: renderPanel
  });

  updateDisplay();

  if (typeof value === 'function') {
    createEffect(() => { parseTime(value()); updateDisplay(); });
  }

  return wrap;
}
