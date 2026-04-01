import type { ReactiveNode, Signal, Accessor, Setter, Context, Owner } from '../types.js';
import {
  getCurrentEffect, setCurrentEffect, scheduleEffect, isBatching, flush,
  getOwner, runWithOwner, createRoot, registerCleanup, createChildOwner,
  disposeOwner, handleError, onError
} from './scheduler.js';

export { batch } from './scheduler.js';
export { createRoot, getOwner, runWithOwner, onError } from './scheduler.js';

// Extend the subscriber sets with an optional _ownerLevel for memo leveling
interface SubscriberSet extends Set<ReactiveNode> {
  _ownerLevel?: number;
}

export function createSignal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers: SubscriberSet = new Set();

  function getter(): T {
    const eff = getCurrentEffect();
    if (eff) {
      subscribers.add(eff);
      // Track this signal as a source of the current effect
      if (eff.sources) eff.sources.add(subscribers);
    }
    return value;
  }

  function setter(next: T | ((prev: T) => T)): void {
    const prev = value;
    value = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
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
  (getter as any)._subscribers = subscribers;

  return [getter, setter];
}

/** Remove effect from all its tracked signal subscriber sets. */
function cleanupSources(effect: ReactiveNode): void {
  if (effect.sources) {
    for (const subscriberSet of effect.sources) {
      subscriberSet.delete(effect);
    }
    effect.sources.clear();
  }
}

export function createEffect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | null | void = null;
  let disposed = false;
  const owner = getOwner();

  const effect: ReactiveNode = {
    disposed: false,
    level: 0,
    sources: new Set(),
    run() {
      if (disposed || effect.disposed) return;
      // Clean up previous sources (dependency cleanup)
      cleanupSources(effect);
      // Run previous cleanup function
      if (typeof cleanup === 'function') {
        try { cleanup(); } catch (_) {}
      }
      const prev = getCurrentEffect();
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
  const dispose = function dispose(): void {
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

export function createMemo<T>(fn: () => T): Accessor<T> {
  let cached: T;
  let dirty = true;
  const subscribers: SubscriberSet = new Set();

  const effect: ReactiveNode = {
    disposed: false,
    level: 0,
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

  function recompute(): void {
    // Clean up old sources before re-tracking
    cleanupSources(effect);
    const prev = getCurrentEffect();
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
    for (const src of effect.sources!) {
      // Look for the parent signal/memo's level
      if ((src as SubscriberSet)._ownerLevel !== undefined) {
        maxLevel = Math.max(maxLevel, (src as SubscriberSet)._ownerLevel!);
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

  return function getter(): T {
    const eff = getCurrentEffect();
    if (eff) {
      subscribers.add(eff);
      if (eff.sources) eff.sources.add(subscribers);
    }
    if (dirty) {
      recompute();
    }
    return cached;
  };
}

export function untrack<T>(fn: () => T): T {
  const prev = getCurrentEffect();
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
 */
export function peek<T>(getter: () => T): T {
  return untrack(getter);
}

/** Explicit dependency tracking. */
export function on<T, U>(
  deps: Array<() => T> | (() => T),
  fn: (value: T | T[], prev: T | T[]) => U,
  options: { defer?: boolean } = {}
): () => void {
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

    return untrack(() => fn(v, p)) as void | (() => void);
  });
}

export function createStore<T extends Record<string | symbol, unknown>>(initialValue: T): T {
  const subscribers = new Map<string | symbol, SubscriberSet>();

  function getSubscribers(prop: string | symbol): SubscriberSet {
    let subs = subscribers.get(prop);
    if (!subs) {
      subs = new Set() as SubscriberSet;
      subscribers.set(prop, subs);
    }
    return subs;
  }

  return new Proxy(initialValue, {
    get(target, prop, receiver) {
      const eff = getCurrentEffect();
      if (eff) {
        const subs = getSubscribers(prop);
        subs.add(eff);
        if (eff.sources) eff.sources.add(subs);
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const prev = (target as any)[prop];
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

export function useLocalStorage<T>(key: string, initialValue: T): Signal<T> {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  const [get, set] = createSignal<T>(stored !== null ? JSON.parse(stored) : initialValue);
  return [get, (v: T | ((prev: T) => T)) => {
    const next = typeof v === 'function' ? (v as (prev: T) => T)(get()) : v;
    set(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(next));
  }];
}

let _ctxId = 0;
const _ctxMap = new Map<number, unknown>();

export function createContext<T>(defaultValue: T): { Provider: (value: T) => () => void; consume: () => T } {
  const id = _ctxId++;
  return {
    Provider(value: T): () => void {
      const prev = _ctxMap.get(id);
      const hadPrev = _ctxMap.has(id);
      _ctxMap.set(id, value);
      return () => {
        if (hadPrev) _ctxMap.set(id, prev);
        else _ctxMap.delete(id);
      };
    },
    consume(): T {
      return (_ctxMap.has(id) ? _ctxMap.get(id) : defaultValue) as T;
    }
  };
}

export function createSelector<T>(source: Accessor<T>): (key: T) => boolean {
  const subs = new Map<T, Set<ReactiveNode>>();
  let prev: T | undefined;

  createEffect(() => {
    const next = source();
    if (!Object.is(prev, next)) {
      const prevSubs = subs.get(prev as T);
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

  return function isSelected(key: T): boolean {
    const eff = getCurrentEffect();
    if (eff) {
      let set = subs.get(key);
      if (!set) { set = new Set(); subs.set(key, set); }
      set.add(eff);
    }
    return Object.is(key, source());
  };
}

export function createDeferred<T>(fn: () => T): Accessor<T> {
  let cached: T;
  let dirty = true;
  let initialized = false;
  const subscribers: SubscriberSet = new Set();

  const effect: ReactiveNode = {
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

  return function getter(): T {
    const eff = getCurrentEffect();
    if (eff) {
      subscribers.add(eff);
      if (eff.sources) eff.sources.add(subscribers);
    }
    if (!initialized || dirty) {
      cleanupSources(effect);
      const prev = getCurrentEffect();
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

export function createHistory<T>(
  signal: Signal<T>,
  options: { maxLength?: number } = {}
): {
  undo: () => void;
  redo: () => void;
  canUndo: Accessor<boolean>;
  canRedo: Accessor<boolean>;
  clear: () => void;
} {
  const maxLength = options.maxLength || 100;
  const [get, set] = signal;
  const undoStack: T[] = [];
  const redoStack: T[] = [];
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
      const current = undoStack.pop()!;
      redoStack.push(current);
      skipTrack = true;
      set(undoStack[undoStack.length - 1]);
      skipTrack = false;
      setCanUndo(undoStack.length > 1);
      setCanRedo(true);
    },
    redo() {
      if (redoStack.length === 0) return;
      const v = redoStack.pop()!;
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
