import { createEffect } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';

const { nav: navTag, ul, li, button: buttonTag, span } = tags;

/**
 * @param {Object} [props]
 * @param {number|Function} props.total
 * @param {number} [props.perPage=10]
 * @param {number|Function} [props.current=1]
 * @param {Function} [props.onchange]
 * @param {number} [props.siblings=1]
 * @param {string} [props.size] - sm|lg
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Pagination(props = {}) {
  injectBase();

  const { total, perPage = 10, current = 1, onchange, siblings = 1, size, class: cls } = props;

  const nav = navTag({ class: cx('d-pagination', size && `d-pagination-${size}`, cls), 'aria-label': 'Pagination' });
  const list = ul({ class: 'd-pagination-list' });
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

  // Use event delegation on the list
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.d-pagination-btn');
    if (!btn || btn.disabled) return;
    const page = btn.dataset.page;
    if (page && onchange) onchange(Number(page));
  });

  function render() {
    list.replaceChildren();
    const cur = resolve(current);
    const pageCount = getPageCount();

    // Prev button
    const prevBtn = buttonTag({
      class: cx('d-pagination-btn', 'd-pagination-prev', cur <= 1 && 'd-pagination-disabled'),
      type: 'button',
      'aria-label': 'Previous page',
      disabled: cur <= 1 ? '' : undefined,
      'data-page': String(cur - 1)
    }, '\u2039');
    list.appendChild(li(prevBtn));

    // Page buttons
    const range = getRange(cur, pageCount);
    for (const page of range) {
      if (page === '...') {
        list.appendChild(li(span({ class: 'd-pagination-ellipsis' }, '\u2026')));
        continue;
      }
      const btn = buttonTag({
        class: cx('d-pagination-btn', page === cur && 'd-pagination-active'),
        type: 'button',
        'aria-label': `Page ${page}`,
        'aria-current': page === cur ? 'page' : undefined,
        'data-page': String(page)
      }, String(page));
      list.appendChild(li(btn));
    }

    // Next button
    const nextBtn = buttonTag({
      class: cx('d-pagination-btn', 'd-pagination-next', cur >= pageCount && 'd-pagination-disabled'),
      type: 'button',
      'aria-label': 'Next page',
      disabled: cur >= pageCount ? '' : undefined,
      'data-page': String(cur + 1)
    }, '\u203A');
    list.appendChild(li(nextBtn));
  }

  render();

  if (typeof current === 'function' || typeof total === 'function') {
    createEffect(render);
  }

  return nav;
}
