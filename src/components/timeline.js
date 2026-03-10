/**
 * Timeline — Vertical sequence of events with connecting lines.
 *
 * @module decantr/components/timeline
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ label?: string, content: string|Node, color?: string, icon?: string|Node, time?: string }[]} [props.items]
 * @param {'left'|'right'|'alternate'} [props.mode='left']
 * @param {boolean} [props.pending=false] - Show pending last item
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Timeline(props = {}) {
  injectBase();
  const { items = [], mode = 'left', pending = false, class: cls } = props;

  const container = h('div', {
    class: cx('d-timeline', mode === 'alternate' && 'd-timeline-alternate', cls)
  });

  items.forEach((item, i) => {
    const el = h('div', { class: 'd-timeline-item' });

    // Dot
    const dot = h('div', { class: cx('d-timeline-dot', item.icon && 'd-timeline-dot-lg') });
    if (item.icon) {
      if (typeof item.icon === 'string') dot.textContent = item.icon;
      else dot.appendChild(item.icon);
    }
    if (item.color) dot.style.backgroundColor = item.color;
    el.appendChild(dot);

    // Line (not on last item unless pending)
    if (i < items.length - 1 || pending) {
      const line = h('div', { class: 'd-timeline-line' });
      if (item.color) line.style.backgroundColor = item.color;
      el.appendChild(line);
    }

    // Content
    const content = h('div', { class: 'd-timeline-content' });
    if (item.time) content.appendChild(h('div', { class: 'd-timeline-label' }, item.time));
    if (typeof item.content === 'string') {
      content.appendChild(h('div', null, item.content));
    } else if (item.content?.nodeType) {
      content.appendChild(item.content);
    }
    el.appendChild(content);

    container.appendChild(el);
  });

  if (pending) {
    const pendingItem = h('div', { class: 'd-timeline-item' });
    const dot = h('div', { class: 'd-timeline-dot', style: { opacity: '0.3' } });
    pendingItem.appendChild(dot);
    pendingItem.appendChild(h('div', { class: 'd-timeline-content' },
      h('div', { style: { color: 'var(--d-muted)' } }, typeof pending === 'string' ? pending : 'Loading...')
    ));
    container.appendChild(pendingItem);
  }

  return container;
}
