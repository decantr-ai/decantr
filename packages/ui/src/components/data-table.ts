import { h, onDestroy } from '../runtime/index.js';
import { createSignal, createEffect, batch } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { caret, createCheckControl, createLiveRegion } from './_behaviors.js';

import { component } from '../runtime/component.js';
export interface DataTableProps {
  data?: Array<Object>|Function;
  pagination?: Record<string, unknown>;
  selection?: 'single'|'multi'|'none';
  onSelectionChange?: (value: unknown) => void;
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  onSort?: (...args: unknown[]) => unknown;
  rowKey?: (...args: unknown[]) => unknown;
  onCellEdit?: (...args: unknown[]) => unknown;
  expandable?: boolean;
  expandRender?: (...args: unknown[]) => unknown;
  exportable?: boolean;
  emptyText?: string;
  class?: string;
  columns?: unknown;
  [key: string]: unknown;
}

const { div, button: buttonTag, span, label: labelTag } = tags;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const resolve = (v: any) => typeof v === 'function' ? v() : v;
const ROW_H = 40;
const VIRT_THRESHOLD = 500;
const MIN_COL_W = 50;

function defaultCmp(a: any, b: any) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function csvCell(v: any) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ═══════════════════════════════════════════════════════════════
// DATATABLE COMPONENT
// ═══════════════════════════════════════════════════════════════

/**
 * DataTable — Enterprise data grid with sorting, pagination, selection,
 * column pinning, cell editing, row expansion, filtering, export, virtual
 * scrolling, and column resizing.
 *
 * @param {Object} props
 * @param {Array<{key:string,label:string,width?:string,sortable?:boolean,filterable?:boolean,pinned?:'left'|'right',render?:Function,editable?:boolean,align?:'left'|'center'|'right',sort?:Function}>} props.columns
 * @param {Array<Object>|Function} props.data
 * @param {Object} [props.pagination]
 * @param {'single'|'multi'|'none'} [props.selection='none']
 * @param {Function} [props.onSelectionChange]
 * @param {boolean} [props.striped=false]
 * @param {boolean} [props.hoverable=true]
 * @param {boolean} [props.stickyHeader=false]
 * @param {Function} [props.onSort]
 * @param {Function} [props.rowKey]
 * @param {Function} [props.onCellEdit]
 * @param {boolean} [props.expandable=false]
 * @param {Function} [props.expandRender]
 * @param {boolean} [props.exportable=false]
 * @param {string} [props.emptyText='No data']
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const DataTable = component<DataTableProps>((props: DataTableProps = {} as DataTableProps) => {
  injectBase();

  const {
    columns: rawCols = [],
    data: rawData,
    pagination: pgCfg,
    selection = 'none',
    onSelectionChange,
    striped = false,
    hoverable = true,
    stickyHeader = false,
    onSort,
    rowKey = (r, i) => i,
    onCellEdit,
    expandable = false,
    expandRender,
    exportable = false,
    emptyText = 'No data',
    class: cls
  } = props;

  // ─────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────

  const [sortCols, setSortCols] = createSignal([]);
  const [page, setPage] = createSignal(1);
  const [pageSize, setPageSize] = createSignal(pgCfg ? pgCfg.pageSize || 10 : 10);
  const [selected, setSelected] = createSignal(new Set());
  let lastClickIdx = -1;
  const [expanded, setExpanded] = createSignal(new Set());
  const [filters, setFilters] = createSignal({});
  const [colWidths, setColWidths] = createSignal({});
  const [scrollTop, setScrollTop] = createSignal(0);

  // Live region for announcing sort/filter changes
  const _dtLive = typeof document !== 'undefined' ? createLiveRegion() : null;

  // ─────────────────────────────────────────────────────────────
  // DERIVED DATA PIPELINE
  // ─────────────────────────────────────────────────────────────

  const getData = () => resolve(rawData) || [];

  const getFiltered = () => {
    const d = getData();
    const f = filters();
    // @ts-expect-error -- strict-mode fix (auto)
    const keys = Object.keys(f).filter(k => f[k]);
    if (!keys.length) return d;
    return d.filter((row: any) =>
      keys.every(k => {
        const v = row[k];
        // @ts-expect-error -- strict-mode fix (auto)
        return v != null && String(v).toLowerCase().includes(f[k].toLowerCase());
      })
    );
  };

  const getSorted = () => {
    const d = getFiltered();
    const sc = sortCols();
    if (!sc.length) return d;
    const sorted = [...d];
    sorted.sort((a, b) => {
      for (const { key, direction } of sc) {
        // @ts-expect-error -- strict-mode fix (auto)
        const col = rawCols.find((c: any) => c.key === key);
        const cmp = col && col.sort ? col.sort : defaultCmp;
        const r = cmp(a[key], b[key]);
        if (r !== 0) return direction === 'asc' ? r : -r;
      }
      return 0;
    });
    return sorted;
  };

  const getTotal = () => {
    if (pgCfg && pgCfg.serverSide && pgCfg.total != null) return resolve(pgCfg.total);
    return getSorted().length;
  };

  // @ts-expect-error -- strict-mode fix (auto)
  const getPageCount = () => Math.max(1, Math.ceil(getTotal() / pageSize()));

  const getPageData = () => {
    const sorted = getSorted();
    if (!pgCfg || pgCfg.serverSide) return sorted;
    const ps = pageSize();
    const p = page();
    // @ts-expect-error -- strict-mode fix (auto)
    return sorted.slice((p - 1) * ps, p * ps);
  };

  // ─────────────────────────────────────────────────────────────
  // SORT LOGIC
  // ─────────────────────────────────────────────────────────────

  function handleSort(key: any, multi: any) {
    // @ts-expect-error -- strict-mode fix (auto)
    setSortCols(prev => {
      // @ts-expect-error -- strict-mode fix (auto)
      const idx = prev.findIndex(s => s.key === key);
      let next;
      if (idx === -1) {
        const entry = { key, direction: 'asc' };
        next = multi ? [...prev, entry] : [entry];
      } else {
        const cur = prev[idx];
        // @ts-expect-error -- strict-mode fix (auto)
        if (cur.direction === 'asc') {
          next = [...prev];
          // @ts-expect-error -- strict-mode fix (auto)
          next[idx] = { key, direction: 'desc' };
        } else {
          next = prev.filter((_, i) => i !== idx);
        }
        // @ts-expect-error -- strict-mode fix (auto)
        if (!multi && next.length > 1) next = next.filter(s => s.key === key);
      }
      if (onSort && next.length) onSort(next[next.length - 1]);
      // Announce sort change to screen readers
      if (_dtLive && next.length) {
        const last = next[next.length - 1];
        // @ts-expect-error -- strict-mode fix (auto)
        const col = rawCols.find((c: any) => c.key === last.key);
        if (col) _dtLive.announce(`Sorted by ${col.label} ${last.direction === 'asc' ? 'ascending' : 'descending'}`);
      }
      return next;
    });
    setPage(1);
  }

  // ─────────────────────────────────────────────────────────────
  // SELECTION LOGIC
  // ─────────────────────────────────────────────────────────────

  function fireSelection(set: any) {
    if (!onSelectionChange) return;
    const data = getPageData();
    onSelectionChange(data.filter((r: any, i: number) => set.has(rowKey(r, i))));
  }

  function toggleSelect(row: any, idx: any, shiftKey: any) {
    if (selection === 'none') return;
    const key = rowKey(row, idx);

    if (selection === 'single') {
      setSelected(prev => {
        const next = new Set();
        if (!prev.has(key)) next.add(key);
        fireSelection(next);
        return next;
      });
    } else {
      if (shiftKey && lastClickIdx >= 0) {
        const rows = getPageData();
        const lo = Math.min(lastClickIdx, idx);
        const hi = Math.max(lastClickIdx, idx);
        setSelected(prev => {
          const next = new Set(prev);
          for (let i = lo; i <= hi; i++) next.add(rowKey(rows[i], i));
          fireSelection(next);
          return next;
        });
      } else {
        setSelected(prev => {
          const next = new Set(prev);
          next.has(key) ? next.delete(key) : next.add(key);
          fireSelection(next);
          return next;
        });
      }
      lastClickIdx = idx;
    }
  }

  function toggleSelectAll() {
    const rows = getPageData();
    const sel = selected();
    const allKeys = rows.map((r: any, i: number) => rowKey(r, i));
    const allSelected = allKeys.length > 0 && allKeys.every((k: number) => sel.has(k));
    const next = new Set(sel);
    if (allSelected) allKeys.forEach((k: number) => next.delete(k));
    else allKeys.forEach((k: number) => next.add(k));
    setSelected(next);
    fireSelection(next);
  }

  // ─────────────────────────────────────────────────────────────
  // EXPAND / FILTER / EXPORT
  // ─────────────────────────────────────────────────────────────

  function toggleExpand(row: any, idx: any) {
    const key = rowKey(row, idx);
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function setFilter(key: any, value: any) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    // Announce filter result count
    if (_dtLive) {
      // Defer to let the filtered data recalculate
      setTimeout(() => {
        const total = getFiltered().length;
        _dtLive.announce(`${total} result${total !== 1 ? 's' : ''} found`);
      }, 100);
    }
  }

  function exportCSV() {
    const rows = getSorted();
    // @ts-expect-error -- strict-mode fix (auto)
    const header = rawCols.map((c: any) => csvCell(c.label)).join(',');
    // @ts-expect-error -- strict-mode fix (auto)
    const body = rows.map((r: any) => rawCols.map((c: any) => csvCell(r[c.key])).join(',')).join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────────────────────
  // CELL EDITING
  // ─────────────────────────────────────────────────────────────

  function startEdit(td: any, row: any, col: any) {
    if (td.querySelector('input')) return;
    const oldValue = row[col.key];
    td.classList.add('d-datatable-td-editing');
    const input = h('input', {
      type: 'text',
      value: oldValue != null ? String(oldValue) : '',
      class: 'd-datatable-edit-input',
      onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') cancelEdit();
      },
      onBlur() { commitEdit(); }
    });

    td.textContent = '';
    td.appendChild(input);
    input.focus();
    // @ts-expect-error -- strict-mode fix (auto)
    input.select();

    function commitEdit() {
      // @ts-expect-error -- strict-mode fix (auto)
      const newValue = input.value;
      td.classList.remove('d-datatable-td-editing');
      td.textContent = newValue;
      if (newValue !== String(oldValue ?? '') && onCellEdit) {
        onCellEdit({ row, column: col, value: newValue, oldValue });
      }
    }

    function cancelEdit() {
      td.classList.remove('d-datatable-td-editing');
      td.textContent = oldValue != null ? String(oldValue) : '';
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COLUMN RESIZE
  // ─────────────────────────────────────────────────────────────

  let _resizeCleanup: any = null;

  function initResize(e: Event, col: any, thEl: any) {
    e.preventDefault();
    // @ts-expect-error -- strict-mode fix (auto)
    const startX = e.clientX;
    const startW = thEl.offsetWidth;

    function onMove(ev: any) {
      const diff = ev.clientX - startX;
      const newW = Math.max(MIN_COL_W, startW + diff);
      setColWidths(prev => ({ ...prev, [col.key]: newW }));
      thEl.style.width = newW + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      _resizeCleanup = null;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    _resizeCleanup = onUp;
  }

  // ─────────────────────────────────────────────────────────────
  // PIN OFFSETS
  // ─────────────────────────────────────────────────────────────

  function getEffectiveCols() { return rawCols; }

  // ─────────────────────────────────────────────────────────────
  // BUILD DOM
  // ─────────────────────────────────────────────────────────────

  const root = div({
    class: cx('d-datatable', cls),
    role: 'region',
    'aria-label': 'Data table'
  });

  // Toolbar
  if (exportable) {
    root.appendChild(div({ class: 'd-datatable-header' },
      buttonTag({
        class: 'd-datatable-export-btn',
        type: 'button',
        onclick: exportCSV,
        'aria-label': 'Export as CSV'
      }, 'Export CSV')
    ));
  }

  // Scroll container
  const scrollWrap = div({ class: 'd-datatable-scroll' });
  scrollWrap.style.overflow = 'auto';
  scrollWrap.style.position = 'relative';

  // Table element
  const table = h('table', {
    class: cx('d-datatable-table', striped && 'd-datatable-striped', hoverable && 'd-datatable-hoverable'),
    role: 'grid',
    'aria-rowcount': '-1'
  });

  // thead
  const thead = h('thead', { class: stickyHeader ? 'd-datatable-sticky' : null });
  const headerRow = h('tr');

  // Expand spacer column
  if (expandable) {
    headerRow.appendChild(h('th', {
      class: 'd-datatable-th',
      'aria-label': 'Expand'
    }));
    // @ts-expect-error -- strict-mode fix (auto)
    headerRow.lastChild.style.width = '40px';
  }

  // Selection column
  if (selection === 'multi') {
    const selAllTh = h('th', { class: 'd-datatable-th' });
    selAllTh.style.width = '40px';
    const { wrap: selAllWrap, input: selAllCb } = createCheckControl({ 'aria-label': 'Select all rows' });
    selAllCb.addEventListener('change', toggleSelectAll);
    selAllTh.appendChild(selAllWrap);
    headerRow.appendChild(selAllTh);

    createEffect(() => {
      const sel = selected();
      const rows = getPageData();
      const allKeys = rows.map((r: any, i: number) => rowKey(r, i));
      const allSel = allKeys.length > 0 && allKeys.every((k: number) => sel.has(k));
      const someSel = !allSel && allKeys.some((k: number) => sel.has(k));
      selAllCb.checked = allSel;
      selAllCb.indeterminate = someSel;
    });
  }

  // Data columns
  // @ts-expect-error -- strict-mode fix (auto)
  rawCols.forEach((col: any) => {
    const th = h('th', {
      class: cx(
        'd-datatable-th',
        col.sortable && 'd-datatable-th-sortable',
        col.pinned === 'left' && 'd-datatable-pinned-left',
        col.pinned === 'right' && 'd-datatable-pinned-right'
      ),
      'aria-sort': 'none'
    });
    th.style.width = col.width || 'auto';
    th.style.textAlign = col.align || 'left';
    if (col.pinned) { th.style.position = 'sticky'; th.style.zIndex = '3'; }

    th.appendChild(span(col.label));

    if (col.sortable) {
      const sortIndicator = span({ class: 'd-datatable-sort-icon', 'aria-hidden': 'true' });
      th.appendChild(sortIndicator);

      createEffect(() => {
        const sc = sortCols();
        // @ts-expect-error -- strict-mode fix (auto)
        const entry = sc.find(s => s.key === col.key);
        // @ts-expect-error -- strict-mode fix (auto)
        sortIndicator.replaceChildren(entry ? (entry.direction === 'asc' ? caret('up') : caret('down')) : caret('down'));
        // @ts-expect-error -- strict-mode fix (auto)
        th.setAttribute('aria-sort', entry ? (entry.direction === 'asc' ? 'ascending' : 'descending') : 'none');
        // @ts-expect-error -- strict-mode fix (auto)
        th.classList.toggle('d-datatable-th-sorted-asc', !!(entry && entry.direction === 'asc'));
        // @ts-expect-error -- strict-mode fix (auto)
        th.classList.toggle('d-datatable-th-sorted-desc', !!(entry && entry.direction === 'desc'));
      });

      th.addEventListener('click', (e) => handleSort(col.key, e.shiftKey));
      th.style.cursor = 'pointer';
      th.style.userSelect = 'none';
    }

    if (col.filterable) {
      const filterWrap = span({ class: 'd-datatable-filter-wrap' });
      filterWrap.style.position = 'relative';
      filterWrap.style.display = 'inline-block';

      const filterBtn = buttonTag({
        class: 'd-datatable-filter-icon',
        type: 'button',
        'aria-label': `Filter ${col.label}`
      }, '\u25BD');
      filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const popup = filterWrap.querySelector('.d-datatable-filter-popup');
        if (popup) {
          // @ts-expect-error -- strict-mode fix (auto)
          popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
          // @ts-expect-error -- strict-mode fix (auto)
          if (popup.style.display === 'block') popup.querySelector('input').focus();
        }
      });

      const filterPopup = div({ class: 'd-datatable-filter-popup' });
      filterPopup.style.display = 'none';
      filterPopup.addEventListener('click', (e) => e.stopPropagation());

      const filterInput = h('input', {
        type: 'text',
        placeholder: `Filter ${col.label}...`,
        'aria-label': `Filter by ${col.label}`,
        // @ts-expect-error -- strict-mode fix (auto)
        oninput(e: Event) { setFilter(col.key, e.target.value); }
      });
      filterPopup.appendChild(filterInput);
      filterWrap.appendChild(filterBtn);
      filterWrap.appendChild(filterPopup);
      th.appendChild(filterWrap);

      createEffect(() => {
        const f = filters();
        // @ts-expect-error -- strict-mode fix (auto)
        filterBtn.classList.toggle('d-datatable-filter-active', !!f[col.key]);
      });
    }

    const handle = span({
      class: 'd-datatable-resize-handle',
      tabindex: '0',
      role: 'separator',
      'aria-orientation': 'vertical',
      'aria-label': `Resize ${col.label} column`
    });
    handle.addEventListener('mousedown', (e) => initResize(e, col, th));
    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = e.key === 'ArrowRight' ? 10 : -10;
        const newW = Math.max(MIN_COL_W, th.offsetWidth + delta);
        setColWidths(prev => ({ ...prev, [col.key]: newW }));
        th.style.width = newW + 'px';
      }
    });
    th.appendChild(handle);

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // tbody (reactive)
  const tbody = h('tbody');
  table.appendChild(tbody);

  let useVirtual = false;
  const spacerTop = h('tr', { 'aria-hidden': 'true' });
  spacerTop.style.height = '0px';
  spacerTop.appendChild(h('td'));
  // @ts-expect-error -- strict-mode fix (auto)
  spacerTop.firstChild.style.padding = '0';
  // @ts-expect-error -- strict-mode fix (auto)
  spacerTop.firstChild.style.border = 'none';

  const spacerBottom = h('tr', { 'aria-hidden': 'true' });
  spacerBottom.style.height = '0px';
  spacerBottom.appendChild(h('td'));
  // @ts-expect-error -- strict-mode fix (auto)
  spacerBottom.firstChild.style.padding = '0';
  // @ts-expect-error -- strict-mode fix (auto)
  spacerBottom.firstChild.style.border = 'none';

  function buildRow(row: any, idx: any) {
    const key = rowKey(row, idx);
    const sel = selected();
    const exp = expanded();
    const isSelected = sel.has(key);
    const isExpanded = exp.has(key);

    const tr = h('tr', {
      class: cx('d-datatable-row', isSelected && 'd-datatable-row-selected', isExpanded && 'd-datatable-row-expanded'),
      'data-row-key': key,
      'aria-rowindex': idx + 2,
      onclick(e: MouseEvent) { toggleSelect(row, idx, e.shiftKey); }
    });

    if (expandable) {
      const expandTd = h('td', { class: 'd-datatable-td' });
      expandTd.style.width = '40px';
      expandTd.style.textAlign = 'center';
      const expandBtn = buttonTag({
        type: 'button',
        class: 'd-datatable-expand-btn',
        'aria-label': isExpanded ? 'Collapse row' : 'Expand row',
        'aria-expanded': isExpanded ? 'true' : 'false'
      }, isExpanded ? caret('down') : caret('right'));
      expandBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleExpand(row, idx); });
      expandTd.appendChild(expandBtn);
      tr.appendChild(expandTd);
    }

    if (selection === 'multi') {
      const cbTd = h('td', { class: 'd-datatable-td' });
      cbTd.style.width = '40px';
      cbTd.style.textAlign = 'center';
      const { wrap: cbWrap, input: rowCb } = createCheckControl({ 'aria-label': `Select row ${idx + 1}` });
      rowCb.checked = isSelected;
      rowCb.addEventListener('click', (e) => e.stopPropagation());
      rowCb.addEventListener('change', () => toggleSelect(row, idx, false));
      cbTd.appendChild(cbWrap);
      tr.appendChild(cbTd);
    }

    // @ts-expect-error -- strict-mode fix (auto)
    rawCols.forEach((col: any) => {
      const val = row[col.key];
      const content = col.render ? col.render(val, row)
        : (val != null && typeof val === 'object' && val.nodeType ? val : (val != null ? String(val) : ''));

      const td = h('td', {
        class: cx('d-datatable-td', col.pinned === 'left' && 'd-datatable-pinned-left', col.pinned === 'right' && 'd-datatable-pinned-right')
      });
      td.style.textAlign = col.align || 'left';
      if (col.pinned) { td.style.position = 'sticky'; td.style.zIndex = '1'; }

      if (typeof content === 'object' && content instanceof Node) td.appendChild(content);
      else td.textContent = content;

      if (col.editable) {
        td.addEventListener('dblclick', (e) => { e.stopPropagation(); startEdit(td, row, col); });
        td.style.cursor = 'text';
      }

      tr.appendChild(td);
    });

    const frag = [tr];

    if (expandable && isExpanded && expandRender) {
      // @ts-expect-error -- strict-mode fix (auto)
      const totalCols = rawCols.length + (selection === 'multi' ? 1 : 0) + 1;
      const expandTr = h('tr', { class: 'd-datatable-expand-row' });
      const expandTd = h('td', { colspan: totalCols, class: 'd-datatable-td' });
      const content = expandRender(row);
      if (content instanceof Node) expandTd.appendChild(content);
      // @ts-expect-error -- strict-mode fix (auto)
      else expandTd.textContent = content;
      expandTr.appendChild(expandTd);
      frag.push(expandTr);
    }

    return frag;
  }

  createEffect(() => {
    const rows = getPageData();
    selected(); expanded(); filters(); sortCols(); page(); pageSize();

    // Update aria-rowcount with total filtered row count
    table.setAttribute('aria-rowcount', getTotal() + 1);

    while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

    if (rows.length === 0) {
      // @ts-expect-error -- strict-mode fix (auto)
      const totalCols = rawCols.length + (selection === 'multi' ? 1 : 0) + (expandable ? 1 : 0);
      tbody.appendChild(h('tr', { class: 'd-datatable-empty' },
        h('td', { colspan: totalCols, class: 'd-datatable-td' }, emptyText)
      ));
      return;
    }

    useVirtual = rows.length > VIRT_THRESHOLD;

    if (useVirtual) {
      const containerH = scrollWrap.clientHeight || 400;
      const st = scrollTop();
      const visibleStart = Math.max(0, Math.floor(st / ROW_H) - 5);
      const visibleEnd = Math.min(rows.length, Math.ceil((st + containerH) / ROW_H) + 5);

      spacerTop.style.height = (visibleStart * ROW_H) + 'px';
      spacerBottom.style.height = ((rows.length - visibleEnd) * ROW_H) + 'px';

      tbody.appendChild(spacerTop);
      for (let i = visibleStart; i < visibleEnd; i++) {
        buildRow(rows[i], i).forEach(tr => tbody.appendChild(tr));
      }
      tbody.appendChild(spacerBottom);
    } else {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < rows.length; i++) {
        buildRow(rows[i], i).forEach(tr => frag.appendChild(tr));
      }
      tbody.appendChild(frag);
    }
  });

  const onScroll = () => {
    if (useVirtual) setScrollTop(scrollWrap.scrollTop);
  };
  scrollWrap.addEventListener('scroll', onScroll);

  onDestroy(() => {
    scrollWrap.removeEventListener('scroll', onScroll);
    if (_resizeCleanup) _resizeCleanup();
    if (_dtLive) _dtLive.destroy();
  });

  scrollWrap.appendChild(table);
  root.appendChild(scrollWrap);

  // Pagination
  if (pgCfg) {
    const pgBar = div({ class: 'd-datatable-pagination', role: 'navigation', 'aria-label': 'Table pagination' });

    const sizeLabel = labelTag({ class: 'd-datatable-page-size' }, 'Rows: ');
    const sizeSelect = h('select', {
      'aria-label': 'Rows per page',
      onchange(e: Event) {
        // @ts-expect-error -- strict-mode fix (auto)
        batch(() => { setPageSize(Number(e.target.value)); setPage(1); });
        // @ts-expect-error -- strict-mode fix (auto)
        if (pgCfg.onPageChange) pgCfg.onPageChange({ page: 1, pageSize: Number(e.target.value) });
      }
    });
    [10, 20, 50, 100].forEach(n => {
      const opt = h('option', { value: n }, String(n));
      // @ts-expect-error -- strict-mode fix (auto)
      if (n === (pgCfg.pageSize || 10)) opt.selected = true;
      sizeSelect.appendChild(opt);
    });
    sizeLabel.appendChild(sizeSelect);
    pgBar.appendChild(sizeLabel);

    const pgInfo = span({ class: 'd-datatable-page-info' });
    pgBar.appendChild(pgInfo);

    const prevBtn = buttonTag({
      type: 'button', class: 'd-datatable-page-btn', 'aria-label': 'Previous page'
    }, caret('left'), ' Prev');
    prevBtn.addEventListener('click', () => {
      const p = page();
      // @ts-expect-error -- strict-mode fix (auto)
      if (p > 1) { setPage(p - 1); if (pgCfg.onPageChange) pgCfg.onPageChange({ page: p - 1, pageSize: pageSize() }); }
    });

    const nextBtn = buttonTag({
      type: 'button', class: 'd-datatable-page-btn', 'aria-label': 'Next page'
    }, 'Next ', caret('right'));
    nextBtn.addEventListener('click', () => {
      const p = page();
      // @ts-expect-error -- strict-mode fix (auto)
      if (p < getPageCount()) { setPage(p + 1); if (pgCfg.onPageChange) pgCfg.onPageChange({ page: p + 1, pageSize: pageSize() }); }
    });

    pgBar.appendChild(prevBtn);
    pgBar.appendChild(nextBtn);

    createEffect(() => {
      const p = page();
      const pc = getPageCount();
      const total = getTotal();
      const ps = pageSize();
      // @ts-expect-error -- strict-mode fix (auto)
      const start = (p - 1) * ps + 1;
      // @ts-expect-error -- strict-mode fix (auto)
      const end = Math.min(p * ps, total);
      pgInfo.textContent = total > 0 ? `${start}\u2013${end} of ${total}` : '0 results';
      // @ts-expect-error -- strict-mode fix (auto)
      prevBtn.disabled = p <= 1;
      // @ts-expect-error -- strict-mode fix (auto)
      nextBtn.disabled = p >= pc;
    });

    root.appendChild(pgBar);
  }

  // Pin offsets
  createEffect(() => {
    colWidths();
    const allCols = getEffectiveCols();
    const ths = headerRow.querySelectorAll('.d-datatable-th');
    const extraCols = (expandable ? 1 : 0) + (selection === 'multi' ? 1 : 0);

    let leftAcc = 0;
    // @ts-expect-error -- strict-mode fix (auto)
    allCols.forEach((col: any, ci: any) => {
      if (col.pinned !== 'left') return;
      const thIdx = ci + extraCols;
      const th = ths[thIdx];
      if (!th) return;
      // @ts-expect-error -- strict-mode fix (auto)
      th.style.left = leftAcc + 'px';
      const tds = tbody.querySelectorAll(`tr > .d-datatable-td:nth-child(${thIdx + 1})`);
      // @ts-expect-error -- strict-mode fix (auto)
      tds.forEach(td => { td.style.left = leftAcc + 'px'; });
      // @ts-expect-error -- strict-mode fix (auto)
      leftAcc += th.offsetWidth;
    });

    let rightAcc = 0;
    // @ts-expect-error -- strict-mode fix (auto)
    for (let ci = allCols.length - 1; ci >= 0; ci--) {
      // @ts-expect-error -- strict-mode fix (auto)
      const col = allCols[ci];
      if (col.pinned !== 'right') continue;
      const thIdx = ci + extraCols;
      const th = ths[thIdx];
      if (!th) continue;
      // @ts-expect-error -- strict-mode fix (auto)
      th.style.right = rightAcc + 'px';
      const tds = tbody.querySelectorAll(`tr > .d-datatable-td:nth-child(${thIdx + 1})`);
      // @ts-expect-error -- strict-mode fix (auto)
      tds.forEach(td => { td.style.right = rightAcc + 'px'; });
      // @ts-expect-error -- strict-mode fix (auto)
      rightAcc += th.offsetWidth;
    }
  });

  return root;
})
