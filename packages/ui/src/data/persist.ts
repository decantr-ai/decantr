import { createSignal, createEffect, batch } from '../state/index.js';

/**
 * Signal backed by localStorage or sessionStorage with cross-tab sync.
 * @template T
 * @param {string} key — storage key
 * @param {T} init — fallback value when storage is empty
 * @param {{ storage?: 'local' | 'session', serialize?: (v: T) => string, deserialize?: (s: string) => T }} [options]
 * @returns {[() => T, (v: T | ((prev: T) => T)) => void]}
 */
export function createPersisted<T>(key: string, init: T, options: { storage?: 'local' | 'session'; serialize?: (v: T) => string; deserialize?: (s: string) => T } = {}): [() => T, (v: T | ((prev: T) => T)) => void] {
  const storageType = options.storage || 'local';
  const serialize = options.serialize || JSON.stringify;
  const deserialize = options.deserialize || JSON.parse;

  /** @returns {Storage | null} */
  function getStore() {
    if (typeof globalThis === 'undefined') return null;
    try { return storageType === 'session' ? globalThis.sessionStorage : globalThis.localStorage; }
    catch (_) { return null; }
  }

  // Read initial value from storage
  let initial = init;
  const store = getStore();
  if (store) {
    try {
      const raw = store.getItem(key);
      if (raw !== null) initial = deserialize(raw);
    } catch (_) { /* corrupt data — use init */ }
  }

  const [get, set] = createSignal(initial);

  // Persist on every change
  createEffect(() => {
    const value = get();
    const s = getStore();
    if (s) {
      try { s.setItem(key, serialize(value)); }
      catch (_) { /* storage full */ }
    }
  });

  // Cross-tab sync via storage event (localStorage only)
  if (storageType === 'local' && typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('storage', /** @param {StorageEvent} e */ (e) => {
      if (e.key !== key || e.storageArea !== getStore()) return;
      if (e.newValue === null) {
        set(init);
      } else {
        try { set(deserialize(e.newValue)); }
        catch (_) { /* corrupt cross-tab data */ }
      }
    });
  }

  return [get, /** @param {T | ((prev: T) => T)} next */ (next) => set(next)];
}

/**
 * Reactive IndexedDB binding with lazy connection.
 * @param {string} dbName
 * @param {string} storeName
 * @returns {{ get: <T>(key: IDBValidKey) => Promise<T>, set: (key: IDBValidKey, value: any) => Promise<void>, delete: (key: IDBValidKey) => Promise<void>, getAll: <T>() => Promise<T[]>, clear: () => Promise<void> }}
 */
export interface IndexedDBStore {
  get: <T>(key: IDBValidKey) => Promise<T>;
  set: (key: IDBValidKey, value: any) => Promise<void>;
  delete: (key: IDBValidKey) => Promise<void>;
  getAll: <T>() => Promise<T[]>;
  clear: () => Promise<void>;
}

export function createIndexedDB(dbName: string, storeName: string): IndexedDBStore {
  /** @type {IDBDatabase | null} */
  let db: any = null;
  /** @type {Promise<IDBDatabase> | null} */
  let opening: any = null;

  function open() {
    if (db) return Promise.resolve(db);
    if (opening) return opening;
    if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is not available'));
    opening = new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(storeName)) req.result.createObjectStore(storeName);
      };
      req.onsuccess = () => { db = req.result; opening = null; resolve(db); };
      req.onerror = () => { opening = null; reject(req.error); };
    });
    return opening;
  }

  /** @param {IDBTransactionMode} mode @param {(s: IDBObjectStore) => IDBRequest} fn */
  function tx(mode: any, fn: any) {
    return open().then((d: any) => new Promise((resolve, reject) => {
      const t = d.transaction(storeName, mode);
      const req = fn(t.objectStore(storeName));
      if (req) {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } else {
        t.oncomplete = () => resolve(undefined);
        t.onerror = () => reject(t.error);
      }
    }));
  }

  return {
    /** @template T @param {IDBValidKey} key @returns {Promise<T>} */
    get(key) { return tx('readonly', (s: any) => s.get(key)); },
    /** @param {IDBValidKey} key @param {any} value @returns {Promise<void>} */
    set(key, value) { return tx('readwrite', (s: any) => s.put(value, key)); },
    /** @param {IDBValidKey} key @returns {Promise<void>} */
    delete(key) { return tx('readwrite', (s: any) => s.delete(key)); },
    /** @template T @returns {Promise<T[]>} */
    getAll() { return tx('readonly', (s: any) => s.getAll()); },
    /** @returns {Promise<void>} */
    clear() { return tx('readwrite', (s: any) => s.clear()); }
  };
}

/**
 * BroadcastChannel sync for a signal. Updates propagate across tabs.
 * @template T
 * @param {string} channel — channel name
 * @param {[() => T, (v: T) => void]} signal — [getter, setter] tuple
 * @returns {() => void} cleanup function
 */
export function createCrossTab<T>(channel: string, signal: [() => T, (v: T) => void]): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {};

  const [get, set] = signal;
  const bc = new BroadcastChannel(channel);
  const tabId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : '__tab_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  let skipEffect = false;

  // Broadcast local changes to other tabs
  createEffect(() => {
    const value = get();
    if (skipEffect) return;
    try { bc.postMessage({ tabId, value }); }
    catch (_) { /* channel closed or clone failed */ }
  });

  // Receive changes from other tabs
  bc.onmessage = (e) => {
    if (e.data && e.data.tabId !== tabId) {
      skipEffect = true;
      set(e.data.value);
      skipEffect = false;
    }
  };

  return () => { bc.close(); };
}

/**
 * Queue operations while offline and flush on reconnect.
 * @template T
 * @param {{ process: (item: T) => Promise<any>, persist?: boolean, key?: string, retryDelay?: number }} options
 * @returns {{ add: (item: T) => void, pending: () => T[], isOnline: () => boolean, flush: () => Promise<void> }}
 */
export interface OfflineQueue<T> {
  add: (item: T) => void;
  pending: () => T[];
  isOnline: () => boolean;
  flush: () => Promise<void>;
}

export function createOfflineQueue<T>(options: { process: (item: T) => Promise<any>; persist?: boolean; key?: string; retryDelay?: number }): OfflineQueue<T> {
  const { process, persist = false, key = '__decantr_offline_queue', retryDelay = 1000 } = options;

  // Restore persisted queue
  let initial = [];
  if (persist && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) initial = JSON.parse(raw);
    } catch (_) { /* corrupt — start fresh */ }
  }

  const [pending, setPending] = createSignal(initial);
  const [isOnline, setIsOnline] = createSignal(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  let flushing = false;

  // Persist queue whenever it changes
  if (persist) {
    createEffect(() => {
      const items = pending();
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem(key, JSON.stringify(items)); }
        catch (_) { /* storage full */ }
      }
    });
  }

  // Listen for online/offline events
  if (typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('online', () => { setIsOnline(true); flush(); });
    globalThis.addEventListener('offline', () => { setIsOnline(false); });
  }

  /** Process items sequentially (FIFO). Failed items stay in queue for retry. */
  async function flush() {
    if (flushing) return;
    flushing = true;
    try {
      while (pending().length > 0 && isOnline()) {
        const item = pending()[0];
        try {
          await process(item);
          setPending((prev: any) => prev.slice(1));
        } catch (_) {
          await new Promise((r) => setTimeout(r, retryDelay));
          if (!isOnline()) break;
        }
      }
    } finally {
      flushing = false;
    }
  }

  return {
    /** @param {T} item — add to queue; triggers flush if online */
    add(item) {
      setPending((prev: any) => [...prev, item]);
      if (isOnline()) flush();
    },
    pending,
    isOnline,
    flush
  };
}
