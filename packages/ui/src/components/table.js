import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ key: string, label: string, width?: string, render?: Function }[]} props.columns
 * @param {Object[]} props.data
 * @param {boolean} [props.striped]
 * @param {boolean} [props.hoverable]
 * @param {boolean} [props.compact]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Table(props = {}) {
  injectBase();

  const { columns = [], data = [], striped, hoverable, compact, class: cls } = props;

  const tableClass = cx(
    'd-table',
    striped && 'd-table-striped',
    hoverable && 'd-table-hover',
    compact && 'd-table-compact',
    cls
  );

  const thead = h('thead', null,
    h('tr', null, ...columns.map(col =>
      h('th', { class: 'd-th', style: col.width ? { width: col.width } : undefined }, col.label)
    ))
  );

  const tbody = h('tbody', null, ...data.map(row =>
    h('tr', { class: 'd-tr' }, ...columns.map(col => {
      const val = row[col.key];
      const content = col.render ? col.render(val, row) : (val != null ? String(val) : '');
      return h('td', { class: 'd-td' }, content);
    }))
  ));

  return h('div', { class: 'd-table-wrap' },
    h('table', { class: tableClass }, thead, tbody)
  );
}
