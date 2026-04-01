/**
 * Deep reactive store with per-property subscriptions,
 * Immer-like produce(), and structural-sharing reconcile().
 * @module state/store
 */
import { batch } from './index.js';
import { getCurrentEffect, isBatching, scheduleEffect } from './scheduler.js';

/** @type {WeakMap<object, object>} raw target -> proxy */
const proxyCache = new WeakMap();
/** @type {WeakMap<object, Map<string|symbol, Set>>} target -> prop -> subscribers */
const subMaps = new WeakMap();
/** @type {WeakMap<object, object>} proxy -> raw target */
const proxyToRaw = new WeakMap();

const MUTATORS = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'];

function getSubs(prop, target) {
  let map = subMaps.get(target);
  if (!map) { map = new Map(); subMaps.set(target, map); }
  let s = map.get(prop);
  if (!s) { s = new Set(); map.set(prop, s); }
  return s;
}

function track(subs) {
  const eff = getCurrentEffect();
  if (!eff) return;
  subs.add(eff);
  if (eff.sources) eff.sources.add(subs);
}

function notify(subs) {
  if (!subs || subs.size === 0) return;
  if (isBatching()) {
    for (const sub of subs) scheduleEffect(sub);
  } else {
    const arr = [...subs];
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i].disposed) arr[i].run();
    }
  }
}

function notifyAll(target) {
  const map = subMaps.get(target);
  if (!map) return;
  for (const subs of map.values()) notify(subs);
}

/** @param {*} v */
function isProxyable(v) {
  return v !== null && typeof v === 'object' && !Object.isFrozen(v);
}

/** Unwrap proxy to raw target (identity if not proxied). */
function toRaw(v) {
  return (v && proxyToRaw.get(v)) || v;
}

/** Wrap a value in a deep reactive proxy (cached per identity). */
function wrap(target) {
  if (proxyCache.has(target)) return proxyCache.get(target);
  const isArr = Array.isArray(target);

  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      if (prop === '__raw') return target;
      if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver);

      if (isArr && MUTATORS.includes(/** @type {string} */ (prop))) {
        return (...args) => {
          batch(() => {
            Array.prototype[prop].apply(target, args.map(a => toRaw(a)));
            notify(getSubs('length', target));
            notifyAll(target);
          });
          return target.length;
        };
      }

      track(getSubs(prop, target));
      const value = Reflect.get(target, prop, receiver);
      return isProxyable(value) ? wrap(value) : value;
    },

    set(target, prop, value) {
      const raw = toRaw(value);
      const prev = target[prop];
      if (Object.is(prev, raw)) return true;
      target[prop] = raw;
      notify(getSubs(prop, target));
      if (isArr && prop !== 'length') notify(getSubs('length', target));
      return true;
    },

    deleteProperty(target, prop) {
      const had = prop in target;
      const result = Reflect.deleteProperty(target, prop);
      if (had) notify(getSubs(prop, target));
      return result;
    },

    has(target, prop) {
      track(getSubs(prop, target));
      return Reflect.has(target, prop);
    },

    ownKeys(target) {
      track(getSubs('@@keys', target));
      return Reflect.ownKeys(target);
    }
  });

  proxyCache.set(target, proxy);
  proxyToRaw.set(proxy, target);
  return proxy;
}

// ─── createDeepStore ─────────────────────────────────────────

/**
 * Create a deeply reactive store. Nested objects/arrays are lazily
 * wrapped in reactive proxies with per-property subscription tracking.
 * @template T
 * @param {T} init - Plain object or array
 * @returns {T} Deep reactive proxy
 */
export function createDeepStore<T extends object>(init: T): T {
  if (!isProxyable(init)) {
    throw new Error('createDeepStore requires a plain object or array');
  }
  return wrap(init) as T;
}

// ─── produce ─────────────────────────────────────────────────

/**
 * Immer-like mutation. Executes recipe against a draft proxy that records
 * mutations, then fires notifications in a single batch.
 * @template T
 * @param {T} store - Deep reactive store
 * @param {(draft: T) => void} recipe - Mutation function
 */
export function produce<T extends object>(store: T, recipe: (draft: T) => void): void {
  /** @type {Array<{target: object, prop: string|symbol, value: *, type: string}>} */
  const patches = [];
  const drafts = new WeakMap();

  function createDraft(target) {
    const raw = toRaw(target);
    if (drafts.has(raw)) return drafts.get(raw);

    const draft = new Proxy(raw, {
      get(t, prop) {
        if (prop === '__raw') return raw;
        if (typeof prop === 'symbol') return Reflect.get(t, prop);
        if (Array.isArray(t) && MUTATORS.includes(/** @type {string} */ (prop))) {
          return (...args) => {
            const unwrapped = args.map(a => toRaw(a));
            patches.push({ target: t, prop, value: unwrapped, type: 'array' });
            Array.prototype[prop].apply(t, unwrapped);
            return t.length;
          };
        }
        const value = Reflect.get(t, prop);
        return isProxyable(value) ? createDraft(value) : value;
      },
      set(t, prop, value) {
        const v = toRaw(value);
        patches.push({ target: t, prop, value: v, type: 'set' });
        t[prop] = v;
        return true;
      },
      deleteProperty(t, prop) {
        patches.push({ target: t, prop, value: undefined, type: 'delete' });
        delete t[prop];
        return true;
      }
    });

    drafts.set(raw, draft);
    return draft;
  }

  recipe(createDraft(store));

  // Notify in a single batch — mutations already applied to raw targets
  batch(() => {
    const seen = new Set();
    for (const { target, prop, type } of patches) {
      if (type === 'array') {
        const key = target.toString() + '::arr';
        if (!seen.has(key)) {
          seen.add(key);
          notify(getSubs('length', target));
          notifyAll(target);
        }
      } else if (type === 'delete') {
        notify(getSubs(prop, target));
        notify(getSubs('@@keys', target));
      } else {
        notify(getSubs(prop, target));
      }
    }
  });
}

// ─── reconcile ───────────────────────────────────────────────

/**
 * Efficient bulk update with structural sharing. Parallel-walks old and
 * new data, only notifying properties that actually changed.
 * @template T
 * @param {T} store - Deep reactive store
 * @param {T} data - New plain data to reconcile against
 */
export function reconcile<T extends object>(store: T, data: T): void {
  const raw = toRaw(store);
  if (!isProxyable(raw) || !isProxyable(data)) return;
  batch(() => { _reconcile(raw, data); });
}

function _reconcile(target, next) {
  const isArr = Array.isArray(target);
  if (isArr !== Array.isArray(next)) return; // type mismatch
  if (isArr) return _reconcileArray(target, next);

  const oldKeys = Object.keys(target);
  const newKeys = Object.keys(next);
  let keysChanged = false;

  for (let i = 0; i < newKeys.length; i++) {
    const key = newKeys[i];
    const oldVal = target[key];
    const newVal = next[key];

    if (!(key in target)) {
      target[key] = newVal;
      notify(getSubs(key, target));
      keysChanged = true;
      continue;
    }
    if (Object.is(oldVal, newVal)) continue;

    if (isProxyable(oldVal) && isProxyable(newVal)
        && Array.isArray(oldVal) === Array.isArray(newVal)) {
      _reconcile(oldVal, newVal);
    } else {
      target[key] = newVal;
      notify(getSubs(key, target));
    }
  }

  for (let i = 0; i < oldKeys.length; i++) {
    const key = oldKeys[i];
    if (!(key in next)) {
      delete target[key];
      notify(getSubs(key, target));
      keysChanged = true;
    }
  }
  if (keysChanged) notify(getSubs('@@keys', target));
}

function _reconcileArray(target, next) {
  const oldLen = target.length;
  const newLen = next.length;
  let changed = false;

  for (let i = 0; i < Math.min(oldLen, newLen); i++) {
    const oldVal = target[i];
    const newVal = next[i];
    if (Object.is(oldVal, newVal)) continue;
    if (isProxyable(oldVal) && isProxyable(newVal)
        && Array.isArray(oldVal) === Array.isArray(newVal)) {
      _reconcile(oldVal, newVal);
    } else {
      target[i] = newVal;
      notify(getSubs(String(i), target));
      changed = true;
    }
  }

  for (let i = oldLen; i < newLen; i++) {
    target[i] = next[i];
    notify(getSubs(String(i), target));
    changed = true;
  }

  if (newLen < oldLen) {
    for (let i = newLen; i < oldLen; i++) notify(getSubs(String(i), target));
    target.length = newLen;
    changed = true;
  }

  if (changed) {
    notify(getSubs('length', target));
    notify(getSubs('@@keys', target));
  }
}
