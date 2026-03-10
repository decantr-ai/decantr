import { currentEffect, setCurrentEffect, scheduleEffect, isBatching, flush } from './scheduler.js';
export { batch } from './scheduler.js';

/**
 * @template T
 * @param {T} initialValue
 * @returns {[() => T, (v: T | ((prev: T) => T)) => void]}
 */
export function createSignal(initialValue) {
  let value = initialValue;
  /** @type {Set<{run: Function}>} */
  const subscribers = new Set();

  function getter() {
    if (currentEffect) subscribers.add(currentEffect);
    return value;
  }

  function setter(next) {
    const prev = value;
    value = typeof next === 'function' ? next(prev) : next;
    if (!Object.is(prev, value)) {
      if (isBatching()) {
        for (const sub of subscribers) scheduleEffect(sub);
      } else {
        const subs = [...subscribers];
        for (let i = 0; i < subs.length; i++) subs[i].run();
      }
    }
  }

  return [getter, setter];
}

/**
 * @param {Function} fn
 * @returns {Function} dispose
 */
export function createEffect(fn) {
  let cleanup = null;
  let disposed = false;

  const effect = {
    run() {
      if (disposed) return;
      if (typeof cleanup === 'function') cleanup();
      const prev = currentEffect;
      setCurrentEffect(effect);
      try {
        cleanup = fn();
      } finally {
        setCurrentEffect(prev);
      }
    }
  };

  effect.run();

  return function dispose() {
    disposed = true;
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
  };
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {() => T}
 */
export function createMemo(fn) {
  /** @type {T} */
  let cached;
  let dirty = true;
  /** @type {Set<{run: Function}>} */
  const subscribers = new Set();

  const effect = {
    run() {
      dirty = true;
      const subs = [...subscribers];
      for (let i = 0; i < subs.length; i++) subs[i].run();
    }
  };

  // Track dependencies
  const prev = currentEffect;
  setCurrentEffect(effect);
  try {
    cached = fn();
    dirty = false;
  } finally {
    setCurrentEffect(prev);
  }

  return function getter() {
    if (currentEffect) subscribers.add(currentEffect);
    if (dirty) {
      const prev = currentEffect;
      setCurrentEffect(effect);
      try {
        cached = fn();
        dirty = false;
      } finally {
        setCurrentEffect(prev);
      }
    }
    return cached;
  };
}

/**
 * @template T
 * @param {T} initialValue
 * @returns {T}
 */
export function untrack(fn) {
  const prev = currentEffect;
  setCurrentEffect(null);
  try {
    return fn();
  } finally {
    setCurrentEffect(prev);
  }
}

/**
 * Read a signal getter without subscribing. Alias for untrack().
 * Aligns with TC39 Signals proposal terminology.
 * @template T
 * @param {() => T} getter
 * @returns {T}
 */
export function peek(getter) {
  return untrack(getter);
}

export function createStore(initialValue) {
  /** @type {Map<string|symbol, Set<{run: Function}>>} */
  const subscribers = new Map();

  function getSubscribers(prop) {
    let subs = subscribers.get(prop);
    if (!subs) {
      subs = new Set();
      subscribers.set(prop, subs);
    }
    return subs;
  }

  return new Proxy(initialValue, {
    get(target, prop, receiver) {
      if (currentEffect) getSubscribers(prop).add(currentEffect);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const prev = target[prop];
      const result = Reflect.set(target, prop, value, receiver);
      if (!Object.is(prev, value)) {
        const subs = subscribers.get(prop);
        if (subs) {
          if (isBatching()) {
            for (const sub of subs) scheduleEffect(sub);
          } else {
            const arr = [...subs];
            for (let i = 0; i < arr.length; i++) arr[i].run();
          }
        }
      }
      return result;
    }
  });
}

/**
 * @template T
 * @param {string} key - localStorage key
 * @param {T} initialValue - fallback if no stored value
 * @returns {[() => T, (v: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  const [get, set] = createSignal(stored !== null ? JSON.parse(stored) : initialValue);
  return [get, (v) => {
    const next = typeof v === 'function' ? v(get()) : v;
    set(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(next));
  }];
}

/** @type {Set<Promise>} */
export const _pendingResources = new Set();

/**
 * @template T
 * @param {() => Promise<T>} fetcher
 * @param {{ initialValue?: T, lazy?: boolean }} [options]
 * @returns {{ data: () => T|undefined, loading: () => boolean, error: () => Error|null, refetch: () => Promise<void>, mutate: (v: T) => void }}
 */
export function createResource(fetcher, options = {}) {
  const [data, setData] = createSignal(options.initialValue);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);

  async function load() {
    setLoading(true);
    setError(null);
    const p = fetcher();
    _pendingResources.add(p);
    try {
      const result = await p;
      setData(() => result);
      setLoading(false);
    } catch (e) {
      setError(() => e instanceof Error ? e : new Error(String(e)));
      setLoading(false);
    } finally {
      _pendingResources.delete(p);
    }
  }

  if (!options.lazy) load();

  return {
    data,
    loading,
    error,
    refetch: load,
    mutate(v) { setData(() => v); }
  };
}

/** @type {number} */
let _ctxId = 0;
/** @type {Map<number, any>} */
const _ctxMap = new Map();

/**
 * @template T
 * @param {T} [defaultValue]
 * @returns {{ Provider: (value: T) => (() => void), consume: () => T }}
 */
export function createContext(defaultValue) {
  const id = _ctxId++;
  return {
    Provider(value) {
      const prev = _ctxMap.get(id);
      const hadPrev = _ctxMap.has(id);
      _ctxMap.set(id, value);
      return () => {
        if (hadPrev) _ctxMap.set(id, prev);
        else _ctxMap.delete(id);
      };
    },
    consume() {
      return _ctxMap.has(id) ? _ctxMap.get(id) : defaultValue;
    }
  };
}

/**
 * @template T, U
 * @param {() => T} source — signal getter returning current selected key
 * @returns {(key: U) => boolean} — returns a signal-like getter that's true only when key matches source
 */
export function createSelector(source) {
  /** @type {Map<any, Set<{run: Function}>>} */
  const subs = new Map();
  let prev;

  createEffect(() => {
    const next = source();
    if (!Object.is(prev, next)) {
      const prevSubs = subs.get(prev);
      const nextSubs = subs.get(next);
      prev = next;
      if (prevSubs) {
        const arr = [...prevSubs];
        for (let i = 0; i < arr.length; i++) arr[i].run();
      }
      if (nextSubs) {
        const arr = [...nextSubs];
        for (let i = 0; i < arr.length; i++) arr[i].run();
      }
    }
  });

  return function isSelected(key) {
    if (currentEffect) {
      let set = subs.get(key);
      if (!set) { set = new Set(); subs.set(key, set); }
      set.add(currentEffect);
    }
    return Object.is(key, source());
  };
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {() => T}
 */
export function createDeferred(fn) {
  /** @type {T} */
  let cached;
  let dirty = true;
  let initialized = false;
  /** @type {Set<{run: Function}>} */
  const subscribers = new Set();

  const effect = {
    run() {
      dirty = true;
      const arr = [...subscribers];
      for (let i = 0; i < arr.length; i++) arr[i].run();
    }
  };

  return function getter() {
    if (currentEffect) subscribers.add(currentEffect);
    if (!initialized || dirty) {
      const prev = currentEffect;
      setCurrentEffect(effect);
      try {
        cached = fn();
        dirty = false;
        initialized = true;
      } finally {
        setCurrentEffect(prev);
      }
    }
    return cached;
  };
}

/**
 * @template T
 * @param {[() => T, (v: T) => void]} signal — [getter, setter] tuple from createSignal
 * @param {{ maxLength?: number }} [options]
 * @returns {{ undo: () => void, redo: () => void, canUndo: () => boolean, canRedo: () => boolean, clear: () => void }}
 */
export function createHistory(signal, options = {}) {
  const maxLength = options.maxLength || 100;
  const [get, set] = signal;
  /** @type {T[]} */
  const undoStack = [];
  /** @type {T[]} */
  const redoStack = [];
  const [canUndo, setCanUndo] = createSignal(false);
  const [canRedo, setCanRedo] = createSignal(false);
  let skipTrack = false;

  // Track changes to the signal
  createEffect(() => {
    const v = get();
    if (skipTrack) return;
    if (undoStack.length === 0 || !Object.is(undoStack[undoStack.length - 1], v)) {
      undoStack.push(v);
      if (undoStack.length > maxLength + 1) undoStack.shift();
      redoStack.length = 0;
      setCanUndo(undoStack.length > 1);
      setCanRedo(false);
    }
  });

  return {
    canUndo,
    canRedo,
    undo() {
      if (undoStack.length <= 1) return;
      const current = undoStack.pop();
      redoStack.push(current);
      skipTrack = true;
      set(undoStack[undoStack.length - 1]);
      skipTrack = false;
      setCanUndo(undoStack.length > 1);
      setCanRedo(true);
    },
    redo() {
      if (redoStack.length === 0) return;
      const v = redoStack.pop();
      undoStack.push(v);
      skipTrack = true;
      set(v);
      skipTrack = false;
      setCanUndo(true);
      setCanRedo(redoStack.length > 0);
    },
    clear() {
      const current = get();
      undoStack.length = 0;
      redoStack.length = 0;
      undoStack.push(current);
      setCanUndo(false);
      setCanRedo(false);
    }
  };
}
