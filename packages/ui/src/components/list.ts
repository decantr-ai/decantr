/**
 * List — Data list with items, avatars, actions, and grid mode.
 *
 * @module decantr/components/list
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface ListProps {
  renderItem?: (item: unknown, index: number) => Node;
  header?: string;
  footer?: string;
  bordered?: boolean;
  grid?: number;
  loading?: boolean;
  emptyText?: string;
  class?: string;
  items?: unknown;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {{ title?: string, description?: string, avatar?: Node, extra?: Node, actions?: Node[] }[]|Function} [props.items]
 * @param {Function} [props.renderItem] - Custom render: (item, index) => Node
 * @param {string} [props.header]
 * @param {string} [props.footer]
 * @param {boolean} [props.bordered=false]
 * @param {number} [props.grid] - Grid columns (enables grid mode)
 * @param {boolean} [props.loading=false]
 * @param {string} [props.emptyText='No data']
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const List = component<ListProps>((props: ListProps = {} as ListProps) => {
  injectBase();
  const { items, renderItem, header, footer, bordered, grid, loading, emptyText = 'No data', class: cls } = props;

  const container = h('div', { class: cx('d-list', bordered && 'd-list-bordered', cls), role: 'list' });

  function render() {
    container.replaceChildren();

    if (header) container.appendChild(h('div', { class: 'd-list-header' }, header));

    const data = typeof items === 'function' ? items() : (items || []);

    // @ts-expect-error -- strict-mode fix (auto)
    if (typeof loading === 'function' ? loading() : loading) {
      container.appendChild(h('div', { class: 'd-list-loading' }, '\u23F3'));
      return;
    }

    if (!data.length) {
      container.appendChild(h('div', { class: 'd-empty' },
        h('div', { class: 'd-empty-desc' }, emptyText)
      ));
      if (footer) container.appendChild(h('div', { class: 'd-list-footer' }, footer));
      return;
    }

    const body = grid
      ? h('div', { class: 'd-list-grid', style: { gridTemplateColumns: `repeat(${grid},1fr)`, gap: 'var(--d-sp-3)' } })
      : document.createDocumentFragment();

    data.forEach((item: any, i: number) => {
      if (renderItem) {
        const node = renderItem(item, i);
        if (node) body.appendChild(node);
        return;
      }

      const el = h('div', { class: 'd-list-item', role: 'listitem' });

      if (item.avatar) {
        el.appendChild(h('div', { class: 'd-list-item-avatar' }, item.avatar));
      }

      const meta = h('div', { class: 'd-list-item-meta' });
      if (item.title) meta.appendChild(h('div', { class: 'd-list-item-title' }, item.title));
      if (item.description) meta.appendChild(h('div', { class: 'd-list-item-desc' }, item.description));
      el.appendChild(meta);

      if (item.extra) el.appendChild(item.extra);

      if (item.actions && item.actions.length) {
        const actions = h('div', { class: 'd-list-item-actions' });
        item.actions.forEach((a: any) => actions.appendChild(a));
        el.appendChild(actions);
      }

      body.appendChild(el);
    });

    container.appendChild(grid ? body : body);
    if (footer) container.appendChild(h('div', { class: 'd-list-footer' }, footer));
  }

  render();

  if (typeof items === 'function') {
    createEffect(() => { items(); render(); });
  }
  if (typeof loading === 'function') {
    // @ts-expect-error -- strict-mode fix (auto)
    createEffect(() => { loading(); render(); });
  }

  return container;
})

/**
 * List.Item — Standalone list item.
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */

export interface ListItemProps {
  class?: string;
  [key: string]: unknown;
}

// @ts-expect-error -- strict-mode fix (auto)
List.Item = function Item(props: ListItemProps = {} as ListItemProps, ...children: (string | Node)[]) {
  injectBase();
  const { class: cls, ...rest } = props;
  return h('div', { class: cx('d-list-item', cls), role: 'listitem', ...rest }, ...children);
};

// @ts-expect-error -- strict-mode fix (auto)
List.Item.Meta = function Meta(props = {}) {
  injectBase();
  // @ts-expect-error -- strict-mode fix (auto)
  const { title, description, avatar, class: cls } = props;
  const el = h('div', { class: cx('d-list-item-meta', cls) });
  if (title) el.appendChild(h('div', { class: 'd-list-item-title' }, title));
  if (description) el.appendChild(h('div', { class: 'd-list-item-desc' }, description));
  return el;
};
