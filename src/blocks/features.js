import { h } from '../core/index.js';
import { Card } from '../components/card.js';
import { injectBlockBase } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ icon?: string|Node, title: string, description: string }[]} props.items
 * @param {number} [props.columns] - 2|3|4 (default: 3)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Features(props = {}) {
  injectBlockBase();

  const { items = [], columns = 3, class: cls } = props;

  const section = h('section', {
    class: `d-features d-features-${columns}${cls ? ' ' + cls : ''}`
  });

  for (const item of items) {
    const card = Card({ hoverable: true });

    const inner = h('div', { class: 'd-feature-item' });

    if (item.icon) {
      const iconEl = typeof item.icon === 'string'
        ? h('div', { class: 'd-feature-icon' }, item.icon)
        : h('div', { class: 'd-feature-icon' }, item.icon);
      inner.appendChild(iconEl);
    }

    inner.appendChild(h('h3', { class: 'd-feature-title' }, item.title));
    inner.appendChild(h('p', { class: 'd-feature-desc' }, item.description));

    card.appendChild(inner);
    section.appendChild(card);
  }

  return section;
}
