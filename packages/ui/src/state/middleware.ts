import { createSignal, createEffect, batch } from './index.js';

export interface MiddlewareHooks<T = any> {
  onGet?: (value: T) => T;
  onSet?: (next: T, prev: T) => T | undefined;
  _attach?: (setter: Function) => void;
  _hasHydrated?: boolean;
  _hydrated?: T;
}

export interface StoreMiddlewareHooks {
  onGet?: (value: any, prop: string | symbol) => any;
  onSet?: (next: any, prev: any, prop: string | symbol) => any;
}

export function withMiddleware<T>(
  signal: [() => T, (v: T | ((prev: T) => T)) => void],
  middlewares: Array<() => MiddlewareHooks<T>>,
  options?: { name?: string }
): [() => T, (v: T | ((prev: T) => T)) => void] {
  const [rawGet, rawSet] = signal;
  const chain = middlewares.map(m => m());

  // Wire _attach hooks (used by undoMiddleware to get a reference to rawSet)
  for (let i = 0; i < chain.length; i++) {
    // @ts-expect-error -- strict-mode fix (auto)
    if (typeof chain[i]._attach === 'function') chain[i]._attach(rawSet);
  }

  // Hydrate from persistMiddleware if present
  for (let i = 0; i < chain.length; i++) {
    // @ts-expect-error -- strict-mode fix (auto)
    if (chain[i]._hasHydrated) rawSet(chain[i]._hydrated);
  }

  function getter() {
    let value = rawGet();
    for (let i = 0; i < chain.length; i++) {
      // @ts-expect-error -- strict-mode fix (auto)
      if (chain[i].onGet) value = chain[i].onGet(value);
    }
    return value;
  }

  function setter(next: any) {
    const prev = rawGet();
    let resolved = typeof next === 'function' ? next(prev) : next;
    for (let i = 0; i < chain.length; i++) {
      if (chain[i].onSet) {
        // @ts-expect-error -- strict-mode fix (auto)
        resolved = chain[i].onSet(resolved, prev);
        if (resolved === undefined) return;
      }
    }
    rawSet(resolved);
  }

  // Preserve _subscribers for reactive tracking
  // @ts-expect-error -- strict-mode fix (auto)
  getter._subscribers = rawGet._subscribers;

  return [getter, setter];
}

/**
 * Apply a middleware chain to a store proxy.
 * Returns a new Proxy with middleware interception on property get/set.
 *
 * @template {object} T
 * @param {T} store - Proxy-based store from createStore
 * @param {Array<() => { onGet?: (v: any, prop: string|symbol) => any, onSet?: (next: any, prev: any, prop: string|symbol) => any }>} middlewares
 * @returns {T}
 */
export function withStoreMiddleware<T extends object>(store: T, middlewares: Array<() => StoreMiddlewareHooks>): T {
  const chain = middlewares.map(m => m());

  return new Proxy(store, {
    get(target, prop, receiver) {
      let value = Reflect.get(target, prop, receiver);
      for (let i = 0; i < chain.length; i++) {
        // @ts-expect-error -- strict-mode fix (auto)
        if (chain[i].onGet) value = chain[i].onGet(value, prop);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      // @ts-expect-error -- strict-mode fix (auto)
      const prev = target[prop];
      let resolved = value;
      for (let i = 0; i < chain.length; i++) {
        if (chain[i].onSet) {
          // @ts-expect-error -- strict-mode fix (auto)
          resolved = chain[i].onSet(resolved, prev, prop);
          if (resolved === undefined) return true;
        }
      }
      return Reflect.set(target, prop, resolved, receiver);
    }
  });
}

/**
 * Console logging middleware for signals and stores.
 * Logs `[label] set: prev -> next` on every setter call.
 *
 * @param {{ label?: string, collapsed?: boolean }} [options]
 * @returns {() => { onSet: (next: any, prev: any) => any }}
 */
export function loggerMiddleware(options?: { label?: string; collapsed?: boolean }): () => { onSet: (next: any, prev: any) => any } {
  const label = (options && options.label) || 'signal';
  const collapsed = (options && options.collapsed) || false;

  return () => ({
    onSet(next, prev) {
      const group = collapsed ? console.groupCollapsed : console.group;
      group.call(console, `[${label}] set`);
      console.log('prev:', prev);
      console.log('next:', next);
      console.groupEnd();
      return next;
    }
  });
}

/**
 * Auto-persist middleware. Reads initial value from storage on creation
 * and writes to storage on every set (debounced if configured).
 *
 * On init, if a stored value exists under `options.key`, it is hydrated
 * into the signal via the `_hasHydrated` / `_hydrated` protocol.
 *
 * @param {{ key: string, storage?: 'local' | 'session', debounce?: number }} options
 * @returns {() => { _hasHydrated: boolean, _hydrated: any, onSet: (next: any, prev: any) => any }}
 */
export function persistMiddleware(options: { key: string; storage?: 'local' | 'session'; debounce?: number }): () => MiddlewareHooks {
  const key = options.key;
  const storageType = options.storage || 'local';
  const debounceMs = options.debounce || 0;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let timer: any = null;

  function getStorage() {
    return storageType === 'session'
      ? (typeof sessionStorage !== 'undefined' ? sessionStorage : null)
      : (typeof localStorage !== 'undefined' ? localStorage : null);
  }

  function writeTo(store: any, value: any) {
    if (!store) return;
    try {
      store.setItem(key, JSON.stringify(value));
    } catch (_) { /* quota exceeded or private browsing */ }
  }

  return () => {
    const store = getStorage();
    let hydrated = false;
    /** @type {any} */
    let hydratedValue;

    if (store) {
      try {
        const raw = store.getItem(key);
        if (raw !== null) {
          hydratedValue = JSON.parse(raw);
          hydrated = true;
        }
      } catch (_) { /* corrupt data */ }
    }

    return {
      _hasHydrated: hydrated,
      _hydrated: hydrated ? hydratedValue : undefined,

      onSet(next, _prev) {
        const s = getStorage();
        if (debounceMs > 0) {
          if (timer !== null) clearTimeout(timer);
          timer = setTimeout(() => writeTo(s, next), debounceMs);
        } else {
          writeTo(s, next);
        }
        return next;
      }
    };
  };
}

/**
 * Validation middleware. Rejects writes that fail the validator function.
 * If validation fails, the set is silently rejected (returns `undefined`).
 *
 * @template T
 * @param {(value: T) => true | string | Error} validator
 *   Return `true` if valid, or an error string / Error object if invalid.
 * @param {{ onError?: (error: string | Error, value: T) => void }} [options]
 * @returns {() => { onSet: (next: T, prev: T) => T | undefined }}
 */
export function validationMiddleware<T>(validator: (value: T) => true | string | Error, options?: { onError?: (error: string | Error, value: T) => void }): () => { onSet: (next: T, prev: T) => T | undefined } {
  const onError = options && options.onError;

  return () => ({
    onSet(next, _prev) {
      const result = validator(next);
      if (result === true) return next;
      if (onError) onError(result, next);
      return undefined;
    }
  });
}

/**
 * Undo/redo middleware. Tracks every set call and exposes controls.
 *
 * Returns an object with:
 * - `middleware` — factory to pass into withMiddleware's array
 * - `undo()` / `redo()` — restore previous/next value
 * - `canUndo` / `canRedo` — signal getters (boolean)
 * - `history()` — returns shallow copy of the undo stack
 *
 * @param {{ maxLength?: number }} [options]
 * @returns {{
 *   middleware: () => { _attach: (setter: Function) => void, onSet: (next: any, prev: any) => any },
 *   undo: () => void,
 *   redo: () => void,
 *   canUndo: () => boolean,
 *   canRedo: () => boolean,
 *   history: () => any[]
 * }}
 */
export interface UndoMiddlewareResult {
  middleware: () => MiddlewareHooks;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  history: () => any[];
}

export function undoMiddleware(options?: { maxLength?: number }): UndoMiddlewareResult {
  const maxLength = (options && options.maxLength) || 100;

  /** @type {any[]} */
  const stack: any[] = [];
  /** @type {any[]} */
  const redoStack: any[] = [];

  const [canUndo, setCanUndo] = createSignal(false);
  const [canRedo, setCanRedo] = createSignal(false);

  let skip = false;
  /** @type {((v: any) => void) | null} */
  let rawSetter: any = null;

  function updateFlags() {
    batch(() => {
      setCanUndo(stack.length > 1);
      setCanRedo(redoStack.length > 0);
    });
  }

  return {
    middleware() {
      return {
        /** @internal Called by withMiddleware to wire the raw setter. */
        _attach(setter) { rawSetter = setter; },

        onSet(next, prev) {
          if (skip) return next;
          // Capture initial value on first write
          if (stack.length === 0) stack.push(prev);
          stack.push(next);
          if (stack.length > maxLength + 1) stack.shift();
          redoStack.length = 0;
          updateFlags();
          return next;
        }
      };
    },

    undo() {
      if (stack.length <= 1 || !rawSetter) return;
      redoStack.push(stack.pop());
      skip = true;
      rawSetter(stack[stack.length - 1]);
      skip = false;
      updateFlags();
    },

    redo() {
      if (redoStack.length === 0 || !rawSetter) return;
      const value = redoStack.pop();
      stack.push(value);
      skip = true;
      rawSetter(value);
      skip = false;
      updateFlags();
    },

    canUndo,
    canRedo,

    /** @returns {any[]} Shallow copy of the undo history stack. */
    history() {
      return stack.slice();
    }
  };
}
