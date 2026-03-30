import { createSignal, createMemo, batch } from '../state/index.js';

/**
 * @template T
 * @template {string|number} ID
 * @typedef {Object} EntityStore
 * @property {(entities: T[]) => void} addMany
 * @property {(entity: T) => void} upsert
 * @property {(id: ID, partial: Partial<T>) => void} update
 * @property {(id: ID) => void} remove
 * @property {() => void} clear
 * @property {(id: ID) => () => T|undefined} get
 * @property {() => T[]} all
 * @property {() => number} count
 * @property {(predicate: (entity: T) => boolean) => () => T[]} filter
 * @property {(comparator: (a: T, b: T) => number) => () => T[]} sorted
 * @property {(opts: { page: () => number, size: () => number }) => () => T[]} paginated
 */

/**
 * @template T
 * @template {string|number} [ID=string]
 * @typedef {Object} EntityStoreOptions
 * @property {(entity: T) => ID} getId - Extract the unique identifier from an entity
 */

/**
 * Create a normalized entity collection store with per-entity reactivity.
 *
 * Entities are stored in a `Map<ID, T>` for O(1) lookups. A collection-level
 * version signal drives derived views (`all`, `count`, `filter`, `sorted`,
 * `paginated`). Per-entity signals are lazily created on first `.get(id)` call
 * so that fine-grained subscriptions only pay for what they use.
 *
 * @template T
 * @template {string|number} [ID=string]
 * @param {EntityStoreOptions<T, ID>} options
 * @returns {EntityStore<T, ID>}
 *
 * @example
 * ```js
 * const users = createEntityStore({ getId: u => u.id });
 * users.addMany([{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]);
 * const alice = users.get('1'); // memo — only re-runs when entity '1' changes
 * console.log(alice().name);    // 'Alice'
 * ```
 */
export function createEntityStore(options) {
  const { getId } = options;

  // ── Internal storage ──────────────────────────────────────────────────

  /** @type {Map<ID, T>} */
  const entities = new Map();

  /**
   * Collection-level version counter. Incremented on any structural change
   * (add, remove, clear). Derived memos read this to know when to recompute.
   */
  const [version, setVersion] = createSignal(0);

  /**
   * Per-entity signal cache. Lazily populated by `.get(id)`.
   * Each entry is a `[getter, setter]` tuple from `createSignal`.
   * @type {Map<ID, [() => T|undefined, (v: T|undefined) => void]>}
   */
  const entitySignals = new Map();

  // ── Helpers ───────────────────────────────────────────────────────────

  /** Bump the collection version so all derived views recompute. */
  function bump() {
    setVersion(v => v + 1);
  }

  /**
   * Notify the per-entity signal for `id`, if one exists.
   * @param {ID} id
   * @param {T|undefined} value
   */
  function notifyEntity(id, value) {
    const sig = entitySignals.get(id);
    if (sig) sig[1](value);
  }

  /**
   * Internal: set a single entity in the map and notify.
   * Returns true if this was a new insertion (structural change).
   * @param {T} entity
   * @returns {boolean}
   */
  function setEntity(entity) {
    const id = getId(entity);
    const existed = entities.has(id);
    entities.set(id, entity);
    notifyEntity(id, entity);
    return !existed;
  }

  // ── Public API ────────────────────────────────────────────────────────

  /**
   * Batch-add multiple entities. Entities with duplicate IDs overwrite
   * existing entries (upsert semantics).
   * @param {T[]} items
   */
  function addMany(items) {
    if (items.length === 0) return;
    batch(() => {
      for (let i = 0; i < items.length; i++) {
        setEntity(items[i]);
      }
      bump();
    });
  }

  /**
   * Add or replace a single entity.
   * @param {T} entity
   */
  function upsert(entity) {
    batch(() => {
      setEntity(entity);
      bump();
    });
  }

  /**
   * Shallow-merge a partial update into an existing entity.
   * No-op if the entity does not exist.
   * @param {ID} id
   * @param {Partial<T>} partial
   */
  function update(id, partial) {
    const existing = entities.get(id);
    if (existing === undefined) return;
    /** @type {T} */
    const merged = { ...existing, ...partial };
    batch(() => {
      entities.set(id, merged);
      notifyEntity(id, merged);
      bump();
    });
  }

  /**
   * Remove an entity by ID. No-op if the entity does not exist.
   * @param {ID} id
   */
  function remove(id) {
    if (!entities.has(id)) return;
    batch(() => {
      entities.delete(id);
      notifyEntity(id, undefined);
      bump();
    });
  }

  /**
   * Remove all entities.
   */
  function clear() {
    if (entities.size === 0) return;
    batch(() => {
      // Notify all existing per-entity signals
      for (const [id] of entitySignals) {
        notifyEntity(id, undefined);
      }
      entities.clear();
      bump();
    });
  }

  /**
   * Get a per-entity memo. Returns a reactive getter that only recomputes
   * when THIS specific entity changes — not when the collection changes.
   *
   * Signals are lazily created and cached in a Map. Subsequent calls with
   * the same `id` return the same memo.
   *
   * @param {ID} id
   * @returns {() => T|undefined}
   */
  function get(id) {
    let sig = entitySignals.get(id);
    if (!sig) {
      sig = createSignal(entities.get(id));
      entitySignals.set(id, sig);
    }
    // Wrap in a memo so downstream effects only fire on value change
    return createMemo(() => {
      const s = entitySignals.get(id);
      return s ? s[0]() : undefined;
    });
  }

  /**
   * Reactive getter: all entities as an array (snapshot order matches
   * insertion order of the underlying Map).
   * @type {() => T[]}
   */
  const all = createMemo(() => {
    version(); // subscribe to structural changes
    return Array.from(entities.values());
  });

  /**
   * Reactive getter: entity count.
   * @type {() => number}
   */
  const count = createMemo(() => {
    version();
    return entities.size;
  });

  /**
   * Create a filtered derived view. The returned memo recomputes whenever
   * the collection changes structurally.
   *
   * @param {(entity: T) => boolean} predicate
   * @returns {() => T[]}
   */
  function filter(predicate) {
    return createMemo(() => {
      version();
      /** @type {T[]} */
      const result = [];
      for (const entity of entities.values()) {
        if (predicate(entity)) result.push(entity);
      }
      return result;
    });
  }

  /**
   * Create a sorted derived view. The returned memo recomputes whenever
   * the collection changes structurally.
   *
   * @param {(a: T, b: T) => number} comparator
   * @returns {() => T[]}
   */
  function sorted(comparator) {
    return createMemo(() => {
      version();
      return Array.from(entities.values()).sort(comparator);
    });
  }

  /**
   * Create a paginated derived view. `page` is 1-indexed. Returns an
   * empty array if the page is out of range.
   * Accepts plain numbers or signal getters for page/size.
   *
   * @param {{ page: number|(() => number), size: number|(() => number) }} opts
   * @returns {() => T[]}
   */
  function paginated(opts) {
    return createMemo(() => {
      version();
      const p = typeof opts.page === 'function' ? opts.page() : opts.page;
      const s = typeof opts.size === 'function' ? opts.size() : opts.size;
      const items = Array.from(entities.values());
      const start = (p - 1) * s;
      return items.slice(start, start + s);
    });
  }

  return {
    addMany,
    upsert,
    update,
    remove,
    clear,
    get,
    all,
    count,
    filter,
    sorted,
    paginated
  };
}
