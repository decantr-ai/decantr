/**
 * SortableList — Drag-to-reorder list with keyboard support and drop indicators.
 * Builds on createDrag behavior from _behaviors.js.
 *
 * @module decantr/components/sortable-list
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag } from './_behaviors.js';
import { icon } from './icon.js';

import { component } from '../runtime/component.js';
export interface SortableListProps {
  items?: unknown[];
  keyFn?: (item: unknown, index: number) => string;
  renderFn?: (item: unknown, index: number, handle: HTMLElement) => HTMLElement;
  onReorder?: (...args: unknown[]) => unknown;
  direction?: 'vertical'|'horizontal';
  disabled?: boolean;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} props
 * @param {Array} props.items - Array of items to render
 * @param {Function} [props.keyFn] - (item, index) => unique key string
 * @param {Function} props.renderFn - (item, index, handle) => HTMLElement. `handle` is the drag handle element.
 * @param {Function} [props.onReorder] - Called with new items array after reorder
 * @param {'vertical'|'horizontal'} [props.direction='vertical']
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const SortableList = component<SortableListProps>((props: SortableListProps = {} as SortableListProps) => {
  injectBase();

  const {
    items: initialItems,
    keyFn = (_, i) => String(i),
    renderFn,
    onReorder,
    direction = 'vertical',
    disabled = false,
    class: cls,
  } = props;

  let items = [...initialItems];
  const isVertical = direction === 'vertical';

  const container = h('div', {
    class: cx('d-sortable', isVertical ? 'd-sortable-v' : 'd-sortable-h', cls),
    role: 'list',
    'aria-label': 'Reorderable list',
  });

  // Live region for screen reader announcements
  const liveRegion = h('div', { class: 'd-sr-only', 'aria-live': 'assertive', 'aria-atomic': 'true' });
  container.appendChild(liveRegion);

  function announce(msg) { liveRegion.textContent = msg; }

  // Indicator for drop position
  const indicator = h('div', { class: 'd-sortable-indicator' });

  let dragIdx = -1;
  let dropIdx = -1;

  function render() {
    // Remove all children except live region
    while (container.children.length > 1) container.removeChild(container.lastChild);

    items.forEach((item, i) => {
      const handle = h('div', {
        class: 'd-sortable-handle',
        'aria-hidden': 'true',
      }, icon('grip-vertical', { size: '1em' }));

      const row = renderFn(item, i, handle);
      row.setAttribute('role', 'listitem');
      row.classList.add('d-sortable-item');
      row.setAttribute('data-sortable-index', String(i));
      row.setAttribute('tabindex', i === 0 ? '0' : '-1');
      row.setAttribute('aria-roledescription', 'sortable item');

      if (!disabled) {
        // Drag behavior on handle
        createDrag(handle, {
          onStart: () => {
            dragIdx = i;
            row.classList.add('d-sortable-dragging');
            container.classList.add('d-sortable-active');
          },
          onMove: (x, y) => {
            // Determine drop index by position
            const children = getItemElements();
            let newDropIdx = items.length;
            for (let j = 0; j < children.length; j++) {
              const rect = children[j].getBoundingClientRect();
              const mid = isVertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
              const pos = isVertical ? y : x;
              if (pos < mid) { newDropIdx = j; break; }
            }
            if (newDropIdx !== dropIdx) {
              dropIdx = newDropIdx;
              positionIndicator(dropIdx);
            }
          },
          onEnd: () => {
            row.classList.remove('d-sortable-dragging');
            container.classList.remove('d-sortable-active');
            indicator.remove();
            if (dragIdx >= 0 && dropIdx >= 0 && dragIdx !== dropIdx && dragIdx !== dropIdx - 1) {
              const moved = items.splice(dragIdx, 1)[0];
              const insertAt = dropIdx > dragIdx ? dropIdx - 1 : dropIdx;
              items.splice(insertAt, 0, moved);
              render();
              if (onReorder) onReorder([...items]);
            }
            dragIdx = -1;
            dropIdx = -1;
          }
        });

        // Keyboard reorder: Alt+Arrow to move
        row.addEventListener('keydown', (e) => {
          if (!e.altKey) {
            // Arrow navigation without Alt
            if (e.key === (isVertical ? 'ArrowDown' : 'ArrowRight')) {
              e.preventDefault();
              focusItem(i + 1);
            } else if (e.key === (isVertical ? 'ArrowUp' : 'ArrowLeft')) {
              e.preventDefault();
              focusItem(i - 1);
            }
            return;
          }

          const moveUp = e.key === (isVertical ? 'ArrowUp' : 'ArrowLeft');
          const moveDown = e.key === (isVertical ? 'ArrowDown' : 'ArrowRight');

          if (moveUp && i > 0) {
            e.preventDefault();
            [items[i], items[i - 1]] = [items[i - 1], items[i]];
            render();
            focusItem(i - 1);
            announce(`Moved to position ${i}`);
            if (onReorder) onReorder([...items]);
          } else if (moveDown && i < items.length - 1) {
            e.preventDefault();
            [items[i], items[i + 1]] = [items[i + 1], items[i]];
            render();
            focusItem(i + 1);
            announce(`Moved to position ${i + 2}`);
            if (onReorder) onReorder([...items]);
          }
        });
      }

      container.appendChild(row);
    });
  }

  function getItemElements() {
    return [...container.querySelectorAll('.d-sortable-item')];
  }

  function focusItem(idx) {
    const els = getItemElements();
    if (idx >= 0 && idx < els.length) {
      els.forEach(el => el.setAttribute('tabindex', '-1'));
      els[idx].setAttribute('tabindex', '0');
      els[idx].focus();
    }
  }

  function positionIndicator(idx) {
    const children = getItemElements();
    indicator.remove();
    if (idx <= children.length) {
      const ref = idx < children.length ? children[idx] : null;
      container.insertBefore(indicator, ref);
    }
  }

  render();
  return container;
})
