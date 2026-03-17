import {
  currentEffect, setCurrentEffect, scheduleEffect, isBatching, flush,
  getOwner, runWithOwner, createRoot, registerCleanup, createChildOwner,
  disposeOwner, handleError, onError
} from './scheduler.js';

export { batch } from './scheduler.js';
export { createRoot, getOwner, runWithOwner, onError } from './scheduler.js';

/**
 * @template T
 * @param {T} initialValue
 * @returns {[() => T, (v: T | ((prev: T) => T)) => void]}
 */
export function createSignal(initialValue) {
  let value = initialValue;
  /** @type {Set<{run: Function, sources?: Set}>} */
  const subscribers = new Set();

  function getter() {
    if (currentEffect) {
      subscribers.add(currentEffect);
      // Track this signal as a source of the current effect
      if (currentEffect.sources) currentEffect.sources.add(subscribers);
    }
    return value;
  }

  function setter(next) {
    const prev = value;
    value = typeof next === 'function' ? next(prev) : next;
    if (!Object.is(prev, value)) {
      if (isBatching()) {
        for (const sub of subscribers) scheduleEffect(sub);
      } else {
        // Copy to avoid mutation during iteration
        const subs = [...subscribers];
        for (let i = 0; i < subs.length; i++) {
          if (!subs[i].disposed) subs[i].run();
        }
      }
    }
  }

  // Expose subscribers set for dependency cleanup
  getter._subscribers = subscribers;

  return [getter, setter];
}

/**
 * Remove effect from all its tracked signal subscriber sets.
 * @param {{sources?: Set}} effect
 */
function cleanupSources(effect) {
  if (effect.sources) {
    for (const subscriberSet of effect.sources) {
      subscriberSet.delete(effect);
    }
    effect.sources.clear();
  }
}

/**
 * @param {Function} fn
 * @returns {Function} dispose
 */
export function createEffect(fn) {
  let cleanup = null;
  let disposed = false;
  const owner = getOwner();

  const effect = {
    disposed: false,
    level: 0,
    /** @type {Set} */
    sources: new Set(),
    run() {
      if (disposed || effect.disposed) return;
      // Clean up previous sources (dependency cleanup)
      cleanupSources(effect);
      // Run previous cleanup function
      if (typeof cleanup === 'function') {
        try { cleanup(); } catch (_) {}
      }
      const prev = currentEffect;
      setCurrentEffect(effect);
      try {
        cleanup = fn();
      } catch (err) {
        cleanup = null;
        if (owner) {
          handleError(err instanceof Error ? err : new Error(String(err)), owner);
        } else {
          throw err;
        }
      } finally {
        setCurrentEffect(prev);
      }
    }
  };

  // Register with owner for disposal
  const dispose = function dispose() {
    if (disposed) return;
    disposed = true;
    effect.disposed = true;
    cleanupSources(effect);
    if (typeof cleanup === 'function') {
      try { cleanup(); } catch (_) {}
      cleanup = null;
    }
  };

  registerCleanup(dispose);

  effect.run();

  return dispose;
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
  /** @type {Set<{run: Function, sources?: Set}>} */
  const subscribers = new Set();

  const effect = {
    disposed: false,
    level: 0,
    /** @type {Set} */
    sources: new Set(),
    run() {
      dirty = true;
      // Propagate to downstream subscribers
      if (isBatching()) {
        for (const sub of subscribers) scheduleEffect(sub);
      } else {
        const subs = [...subscribers];
        for (let i = 0; i < subs.length; i++) {
          if (!subs[i].disposed) subs[i].run();
        }
      }
    }
  };

  function recompute() {
    // Clean up old sources before re-tracking
    cleanupSources(effect);
    const prev = currentEffect;
    setCurrentEffect(effect);
    try {
      const newVal = fn();
      // Only mark clean and update if value changed (or first run)
      if (dirty) {
        cached = newVal;
        dirty = false;
      }
    } finally {
      setCurrentEffect(prev);
    }
    // Update level based on sources
    let maxLevel = 0;
    for (const src of effect.sources) {
      // Look for the parent signal/memo's level
      if (src._ownerLevel !== undefined) {
        maxLevel = Math.max(maxLevel, src._ownerLevel);
      }
    }
    effect.level = maxLevel + 1;
    subscribers._ownerLevel = effect.level;
  }

  // Initial computation
  recompute();

  // Register disposal with owner
  registerCleanup(() => {
    effect.disposed = true;
    cleanupSources(effect);
  });

  return function getter() {
    if (currentEffect) {
      subscribers.add(currentEffect);
      if (currentEffect.sources) currentEffect.sources.add(subscribers);
    }
    if (dirty) {
      recompute();
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

/**
 * Explicit dependency tracking.
 * @template T, U
 * @param {Array<() => T>|(() => T)} deps
 * @param {(value: T|T[], prev: T|T[]) => U} fn
 * @param {{ defer?: boolean }} [options]
 * @returns {Function} dispose
 */
export function on(deps, fn, options = {}) {
  const depsArray = Array.isArray(deps) ? deps : [deps];
  const single = !Array.isArray(deps);
  let prevValues = depsArray.map(d => d());
  let first = true;

  return createEffect(() => {
    // Read deps inside tracking context
    const values = depsArray.map(d => d());

    // Call fn inside untrack so it doesn't create subscriptions
    if (first && options.defer) {
      first = false;
      prevValues = values;
      return;
    }
    first = false;

    const v = single ? values[0] : values;
    const p = single ? prevValues[0] : prevValues;
    prevValues = values;

    return untrack(() => fn(v, p));
  });
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
      if (currentEffect) {
        const subs = getSubscribers(prop);
        subs.add(currentEffect);
        if (currentEffect.sources) currentEffect.sources.add(subs);
      }
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
            for (let i = 0; i < arr.length; i++) {
              if (!arr[i].disposed) arr[i].run();
            }
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
    disposed: false,
    level: 0,
    sources: new Set(),
    run() {
      dirty = true;
      if (isBatching()) {
        for (const sub of subscribers) scheduleEffect(sub);
      } else {
        const arr = [...subscribers];
        for (let i = 0; i < arr.length; i++) {
          if (!arr[i].disposed) arr[i].run();
        }
      }
    }
  };

  return function getter() {
    if (currentEffect) {
      subscribers.add(currentEffect);
      if (currentEffect.sources) currentEffect.sources.add(subscribers);
    }
    if (!initialized || dirty) {
      cleanupSources(effect);
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
