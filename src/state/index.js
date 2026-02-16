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
