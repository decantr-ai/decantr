import { h, createEffect, css, injectBase, cx, resolve } from '../_shared.js';
import { DataTable as BaseDataTable } from '../../components/data-table.js';
import { createSignal } from '../../state/index.js';

/**
 * Kit DataTable — Dashboard-optimized data table with kit defaults.
 * Wraps the base DataTable component with dashboard-friendly defaults.
 * @param {Object} [props]
 * @param {Array<{key: string, label: string, sortable?: boolean, filterable?: boolean, width?: string}>} [props.columns]
 * @param {Array<Object>|Function} [props.data]
 * @param {boolean} [props.searchable=true] — Dashboard default: true
 * @param {boolean} [props.striped=true] — Dashboard default: true
 * @param {boolean} [props.hoverable=true] — Dashboard default: true
 * @param {boolean} [props.stickyHeader=true] — Dashboard default: true
 * @param {Object} [props.pagination] — Default: { pageSize: 10 }
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function DataTable(props = {}) {
  injectBase();
  const {
    columns = [],
    data,
    searchable = true,
    striped = true,
    hoverable = true,
    stickyHeader = true,
    pagination = { pageSize: 10 },
    class: cls,
    ...rest
  } = props;

  return BaseDataTable({
    columns,
    data,
    striped,
    hoverable,
    stickyHeader,
    pagination,
    class: cx(cls),
    ...rest
  });
}
