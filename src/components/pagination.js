import { h } from '../core/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number|Function} props.total — Total number of items
 * @param {number} [props.perPage] — Items per page (default: 10)
 * @param {number|Function} [props.current] — Current page (1-indexed, default: 1)
 * @param {Function} [props.onchange] — Called with page number
 * @param {number} [props.siblings] — Pages shown around current (default: 1)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Pagination(props = {}) {
  injectBase();

  const {
    total,
    perPage = 10,
    current = 1,
    onchange,
    siblings = 1,
    class: cls
  } = props;

  const nav = h('nav', { class: cx('d-pagination', cls), 'aria-label': 'Pagination' });
  const list = h('ul', { class: 'd-pagination-list' });
  nav.appendChild(list);

  function resolve(v) { return typeof v === 'function' ? v() : v; }

  function getPageCount() {
    return Math.max(1, Math.ceil(resolve(total) / perPage));
  }

  function getRange(cur, pageCount) {
    const range = [];
    const left = Math.max(2, cur - siblings);
    const right = Math.min(pageCount - 1, cur + siblings);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < pageCount - 1) range.push('...');
    if (pageCount > 1) range.push(pageCount);
    return range;
  }

  function render() {
    list.replaceChildren();
    const cur = resolve(current);
    const pageCount = getPageCount();

    // Prev button
    const prev = h('li', null,
      h('button', {
        class: cx('d-pagination-btn', 'd-pagination-prev', cur <= 1 && 'd-pagination-disabled'),
        type: 'button',
        'aria-label': 'Previous page',
        disabled: cur <= 1 ? '' : undefined
      }, '\u2039')
    );
    prev.querySelector('button').addEventListener('click', () => {
      if (cur > 1 && onchange) onchange(cur - 1);
    });
    list.appendChild(prev);

    // Page buttons
    const range = getRange(cur, pageCount);
    for (const page of range) {
      if (page === '...') {
        list.appendChild(h('li', null, h('span', { class: 'd-pagination-ellipsis' }, '\u2026')));
        continue;
      }
      const btn = h('button', {
        class: cx('d-pagination-btn', page === cur && 'd-pagination-active'),
        type: 'button',
        'aria-label': `Page ${page}`,
        'aria-current': page === cur ? 'page' : undefined
      }, String(page));
      btn.addEventListener('click', () => {
        if (page !== cur && onchange) onchange(page);
      });
      list.appendChild(h('li', null, btn));
    }

    // Next button
    const next = h('li', null,
      h('button', {
        class: cx('d-pagination-btn', 'd-pagination-next', cur >= pageCount && 'd-pagination-disabled'),
        type: 'button',
        'aria-label': 'Next page',
        disabled: cur >= pageCount ? '' : undefined
      }, '\u203A')
    );
    next.querySelector('button').addEventListener('click', () => {
      if (cur < pageCount && onchange) onchange(cur + 1);
    });
    list.appendChild(next);
  }

  render();

  // Reactive updates
  if (typeof current === 'function' || typeof total === 'function') {
    createEffect(render);
  }

  return nav;
}
