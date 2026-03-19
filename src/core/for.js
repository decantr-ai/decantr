import { createRoot, registerCleanup } from '../state/scheduler.js';
import { createEffect } from '../state/index.js';

/**
 * Keyed list rendering with per-item reactive disposal.
 * Each item gets its own createRoot scope. When an item is removed from
 * the list, its scope is disposed (killing all owned effects/signals).
 *
 * @param {Function} each - Signal getter returning an array
 * @param {Function} keyFn - (item, index) => unique key
 * @param {Function} renderFn - (item, index) => Node
 * @returns {HTMLElement}
 */
export function For(each, keyFn, renderFn) {
  const container = document.createElement('d-for');
  /** @type {Map<*, {node: Node, dispose: Function}>} */
  let currentMap = new Map();

  createEffect(() => {
    const items = each();
    const newMap = new Map();
    const newNodes = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = keyFn(item, i);
      const existing = currentMap.get(key);

      if (existing) {
        newMap.set(key, existing);
        newNodes.push(existing.node);
      } else {
        let node;
        let itemDispose;
        createRoot((dispose) => {
          itemDispose = dispose;
          node = renderFn(item, i);
        });
        newMap.set(key, { node, dispose: itemDispose });
        newNodes.push(node);
      }
    }

    // Dispose removed items
    for (const [key, entry] of currentMap) {
      if (!newMap.has(key)) {
        if (entry.dispose) entry.dispose();
        if (entry.node && entry.node.parentNode === container) {
          container.removeChild(entry.node);
        }
      }
    }

    // Append/reorder
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i];
      const current = container.childNodes[i];
      if (node !== current) {
        container.insertBefore(node, current || null);
      }
    }

    currentMap = newMap;
  });

  // When parent scope is disposed, clean up all remaining items
  registerCleanup(() => {
    for (const [, entry] of currentMap) {
      if (entry.dispose) entry.dispose();
    }
  });

  return container;
}
