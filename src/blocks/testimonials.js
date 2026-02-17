import { h } from '../core/index.js';
import { Card } from '../components/card.js';
import { Avatar } from '../components/avatar.js';
import { injectBlockBase } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ quote: string, author: string, role?: string, avatar?: string }[]} props.items
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Testimonials(props = {}) {
  injectBlockBase();

  const { items = [], class: cls } = props;

  const section = h('section', { class: `d-testimonials${cls ? ' ' + cls : ''}` });

  for (const item of items) {
    const card = Card({ hoverable: true, class: 'd-testimonial' });

    card.appendChild(h('div', { class: 'd-testimonial-quote' }, item.quote));

    const authorEl = h('div', { class: 'd-testimonial-author' });

    if (item.avatar) {
      authorEl.appendChild(Avatar({ src: item.avatar, alt: item.author, size: 'sm' }));
    }

    const info = h('div', null,
      h('div', { class: 'd-testimonial-name' }, item.author),
      item.role ? h('div', { class: 'd-testimonial-role' }, item.role) : null
    );
    authorEl.appendChild(info);
    card.appendChild(authorEl);

    section.appendChild(card);
  }

  return section;
}
