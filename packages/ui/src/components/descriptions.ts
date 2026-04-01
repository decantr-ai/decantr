/**
 * Descriptions — Key-value pair display, like a detail panel.
 *
 * @module decantr/components/descriptions
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface DescriptionsProps {
  title?: string;
  columns?: number;
  layout?: 'horizontal'|'vertical';
  bordered?: boolean;
  class?: string;
  items?: unknown;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string} [props.title]
 * @param {{ label: string, value: string|Node, span?: number }[]} [props.items]
 * @param {number} [props.columns=3]
 * @param {'horizontal'|'vertical'} [props.layout='horizontal']
 * @param {boolean} [props.bordered=false]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const Descriptions = component<DescriptionsProps>((props: DescriptionsProps = {} as DescriptionsProps) => {
  injectBase();
  const { title, items = [], columns = 3, layout = 'horizontal', bordered, class: cls } = props;

  const container = h('div', {
    class: cx('d-descriptions', layout === 'horizontal' && 'd-descriptions-horizontal', cls)
  });

  if (title) {
    container.appendChild(h('div', { class: 'd-descriptions-title' }, title));
  }

  const table = h('table', { class: 'd-descriptions-table' });
  const tbody = h('tbody', null);

  if (layout === 'horizontal') {
    // Group items into rows based on column count
    let currentRow = null;
    let currentSpan = 0;

    items.forEach(item => {
      const span = item.span || 1;
      if (!currentRow || currentSpan + span > columns) {
        currentRow = h('tr', null);
        tbody.appendChild(currentRow);
        currentSpan = 0;
      }
      currentRow.appendChild(h('td', { class: 'd-descriptions-label' }, item.label));
      const contentEl = h('td', { class: 'd-descriptions-content', colspan: span > 1 ? String(span * 2 - 1) : undefined });
      if (typeof item.value === 'object' && item.value?.nodeType) contentEl.appendChild(item.value);
      else contentEl.textContent = String(item.value ?? '');
      currentRow.appendChild(contentEl);
      currentSpan += span;
    });
  } else {
    // Vertical: each item is its own row
    items.forEach(item => {
      const labelRow = h('tr', null, h('td', { class: 'd-descriptions-label', colspan: '2' }, item.label));
      tbody.appendChild(labelRow);
      const contentEl = h('td', { class: 'd-descriptions-content', colspan: '2' });
      if (typeof item.value === 'object' && item.value?.nodeType) contentEl.appendChild(item.value);
      else contentEl.textContent = String(item.value ?? '');
      tbody.appendChild(h('tr', null, contentEl));
    });
  }

  table.appendChild(tbody);
  container.appendChild(table);
  return container;
})
