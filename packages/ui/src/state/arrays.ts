import { createSignal, createEffect, createMemo, untrack, batch, createRoot } from './index.js';

/**
 * Keyed array mapping — maintains stable per-item scopes using reference equality.
 * When the source list changes, only added/removed items trigger scope creation/disposal.
 * Reordering existing items is a no-op for their mapped outputs.
 *
 * @template T, U
 * @param {() => T[]} list - Signal getter returning the source array
 * @param {(item: T, index: () => number) => U} mapFn - Mapping function per item
 * @returns {() => U[]}
 */
export function mapArray<T, U>(list: () => T[], mapFn: (item: T, index: () => number) => U): () => U[] {
  /** @type {Map<T, { result: U, dispose: Function, idx: [() => number, (v: number) => void] }>} */
  let cache = new Map();
  /** @type {U[]} */
  let mapped = [];

  return createMemo(() => {
    const items = list() || [];
    const len = items.length;

    return untrack(() => {
      /** @type {Map<T, { result: U, dispose: Function, idx: [() => number, (v: number) => void] }>} */
      const next = new Map();
      /** @type {U[]} */
      const result = new Array(len);

      // Retain existing entries, create new ones
      for (let i = 0; i < len; i++) {
        const item = items[i];
        const existing = cache.get(item);

        if (existing) {
          // Move — update index signal, reuse result
          existing.idx[1](i);
          result[i] = existing.result;
          next.set(item, existing);
          // Remove from old cache so we know what's left to dispose
          cache.delete(item);
        } else if (next.has(item)) {
          // Duplicate reference — create a separate scope
          const [getIdx, setIdx] = createSignal(i);
          let row;
          const dispose = createRoot((d) => {
            row = mapFn(item, getIdx);
            return d;
          });
          result[i] = row;
          // Store under a unique wrapper to avoid key collision
          // For duplicates we just push the result; they won't be cache-hit
          next.set(Object.create(null), { result: row, dispose, idx: [getIdx, setIdx] });
        } else {
          // New item
          const [getIdx, setIdx] = createSignal(i);
          let row;
          const dispose = createRoot((d) => {
            row = mapFn(item, getIdx);
            return d;
          });
          result[i] = row;
          next.set(item, { result: row, dispose, idx: [getIdx, setIdx] });
        }
      }

      // Dispose removed items
      for (const [, entry] of cache) {
        entry.dispose();
      }

      cache = next;
      mapped = result;
      return mapped;
    });
  });
}

/**
 * Index-based array mapping — fixed positions with updating item signals.
 * Each index position gets a stable scope. When the item at position N changes,
 * only the item signal for that position fires.
 *
 * @template T, U
 * @param {() => T[]} list - Signal getter returning the source array
 * @param {(item: () => T, index: number) => U} mapFn - Mapping function per index
 * @returns {() => U[]}
 */
export function indexArray<T, U>(list: () => T[], mapFn: (item: () => T, index: number) => U): () => U[] {
  /** @type {{ result: U, dispose: Function, setItem: (v: T) => void }[]} */
  let rows: any[] = [];
  /** @type {U[]} */
  let mapped = [];

  return createMemo(() => {
    const items = list() || [];
    const len = items.length;

    return untrack(() => {
      const prevLen = rows.length;

      // Shrink — dispose excess rows
      if (len < prevLen) {
        for (let i = len; i < prevLen; i++) {
          rows[i].dispose();
        }
        rows.length = len;
      }

      // Update existing rows
      const end = Math.min(len, prevLen);
      for (let i = 0; i < end; i++) {
        rows[i].setItem(items[i]);
      }

      // Grow — create new rows
      for (let i = prevLen; i < len; i++) {
        const [getItem, setItem] = createSignal(items[i]);
        let result;
        const dispose = createRoot((d) => {
          result = mapFn(getItem, i);
          return d;
        });
        rows.push({ result, dispose, setItem });
      }

      // Rebuild output array
      mapped = new Array(len);
      for (let i = 0; i < len; i++) {
        mapped[i] = rows[i].result;
      }
      return mapped;
    });
  });
}

/**
 * Stable derived collection — projects source items through a transform,
 * maintaining a cache keyed by `keyFn`. Only new or changed items re-run
 * `projectFn`. Removals are pruned each cycle.
 *
 * @template T, K, U
 * @param {() => T[]} source - Signal getter returning the source array
 * @param {(item: T) => K} keyFn - Extracts a stable key from each item
 * @param {(item: T) => U} projectFn - Transforms item into projected value
 * @returns {() => U[]}
 */
export function createProjection<T, K, U>(source: () => T[], keyFn: (item: T) => K, projectFn: (item: T) => U): () => U[] {
  /** @type {Map<K, { value: U, item: T }>} */
  let cache = new Map();

  return createMemo(() => {
    const items = source() || [];

    return untrack(() => {
      /** @type {Map<K, { value: U, item: T }>} */
      const next = new Map();
      /** @type {U[]} */
      const result = new Array(items.length);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const key = keyFn(item);
        const existing = cache.get(key);

        if (existing && Object.is(existing.item, item)) {
          // Same item reference — reuse projection
          result[i] = existing.value;
          next.set(key, existing);
        } else {
          // New or changed item — re-project
          const value = projectFn(item);
          result[i] = value;
          next.set(key, { value, item });
        }
      }

      cache = next;
      return result;
    });
  });
}
