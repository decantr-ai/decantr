/**
 * Testing utilities for Decantr's reactive state system.
 *
 * Provides helpers for synchronous effect flushing, scoped reactive contexts,
 * mock signals with instrumentation, and assertion wrappers.
 *
 * @module test/state
 */

import { createSignal, createEffect, createRoot, createStore } from '../state/index.js';
import { flush } from '../state/scheduler.js';

// ─── flushEffects ────────────────────────────────────────────

/**
 * Synchronously flush all pending batched effects.
 * Call after mutating signals inside `batch()` to force immediate propagation.
 */
export function flushEffects() {
  flush();
}

// ─── withScope ───────────────────────────────────────────────

/**
 * Run `fn` inside an isolated reactive root that auto-disposes on completion.
 * All signals, effects, and memos created within `fn` are cleaned up automatically.
 *
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function withScope(fn) {
  /** @type {T} */
  let result;
  createRoot((dispose) => {
    try {
      result = fn();
    } finally {
      dispose();
    }
  });
  return result;
}

// ─── mockSignal ──────────────────────────────────────────────

/**
 * Create an instrumented signal for testing.
 * Tracks read/write counts and value history.
 *
 * @template T
 * @param {T} initialValue
 * @returns {{
 *   get: () => T,
 *   set: (v: T | ((prev: T) => T)) => void,
 *   getter: () => T,
 *   setter: (v: T | ((prev: T) => T)) => void,
 *   readCount: number,
 *   writeCount: number,
 *   history: T[],
 *   reset: () => void
 * }}
 */
export function mockSignal(initialValue) {
  const [getter, setter] = createSignal(initialValue);

  /** @type {T[]} */
  const history = [initialValue];

  const mock = {
    readCount: 0,
    writeCount: 0,
    history,

    /**
     * Read the current value. Increments `readCount`.
     * Participates in reactive tracking (safe inside effects).
     * @returns {T}
     */
    get() {
      mock.readCount++;
      return getter();
    },

    /**
     * Write a new value. Increments `writeCount` and appends to `history`.
     * @param {T | ((prev: T) => T)} v
     */
    set(v) {
      mock.writeCount++;
      setter(v);
      history.push(getter());
    },

    /** Alias — pass to APIs that expect a getter function. */
    get getter() { return mock.get; },

    /** Alias — pass to APIs that expect a setter function. */
    get setter() { return mock.set; },

    /**
     * Reset to initial value, clear counters, and truncate history.
     */
    reset() {
      mock.readCount = 0;
      mock.writeCount = 0;
      history.length = 0;
      history.push(initialValue);
      setter(initialValue);
    }
  };

  return mock;
}

// ─── expectEffect ────────────────────────────────────────────

/**
 * Run a reactive effect and return assertion helpers.
 * The effect is tracked for run-count and can be disposed manually.
 *
 * @param {Function} fn — effect body (same signature as `createEffect`)
 * @returns {{
 *   runCount: number,
 *   toHaveRun: () => void,
 *   toHaveRunTimes: (n: number) => void,
 *   dispose: () => void
 * }}
 */
export function expectEffect(fn) {
  let runCount = 0;

  const dispose = createEffect(() => {
    runCount++;
    return fn();
  });

  const handle = {
    /** Current number of times the effect body has executed. */
    get runCount() { return runCount; },

    /**
     * Assert that the effect has executed at least once.
     * @throws {Error} if the effect never ran
     */
    toHaveRun() {
      if (runCount === 0) {
        throw new Error('Expected effect to have run, but it never executed');
      }
    },

    /**
     * Assert that the effect has executed exactly `n` times.
     * @param {number} n
     * @throws {Error} if count does not match
     */
    toHaveRunTimes(n) {
      if (runCount !== n) {
        throw new Error(
          `Expected effect to have run ${n} time(s), but it ran ${runCount} time(s)`
        );
      }
    },

    /**
     * Dispose the effect so it stops reacting to signal changes.
     */
    dispose
  };

  return handle;
}

// ─── expectSignal ────────────────────────────────────────────

/**
 * Wrap a signal getter with assertion helpers.
 *
 * @template T
 * @param {() => T} getter — signal getter function
 * @returns {{
 *   toEqual: (expected: T) => void,
 *   toBeTruthy: () => void,
 *   toBeFalsy: () => void
 * }}
 */
export function expectSignal(getter) {
  return {
    /**
     * Assert that the signal's current value equals `expected` (via `Object.is`).
     * @param {T} expected
     * @throws {Error} if values are not equal
     */
    toEqual(expected) {
      const actual = getter();
      if (!Object.is(actual, expected)) {
        throw new Error(
          `Expected signal to equal ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
        );
      }
    },

    /**
     * Assert that the signal's current value is truthy.
     * @throws {Error} if value is falsy
     */
    toBeTruthy() {
      const actual = getter();
      if (!actual) {
        throw new Error(
          `Expected signal to be truthy, but got ${JSON.stringify(actual)}`
        );
      }
    },

    /**
     * Assert that the signal's current value is falsy.
     * @throws {Error} if value is truthy
     */
    toBeFalsy() {
      const actual = getter();
      if (actual) {
        throw new Error(
          `Expected signal to be falsy, but got ${JSON.stringify(actual)}`
        );
      }
    }
  };
}

// ─── createTestStore ─────────────────────────────────────────

/**
 * Create a reactive store with change recording.
 * Every property mutation is captured in `changes` for later assertions.
 *
 * @template {Record<string, any>} T
 * @param {T} init — initial store values
 * @returns {{
 *   proxy: T,
 *   changes: Array<{ prop: string, prev: any, next: any }>,
 *   reset: () => void
 * }}
 */
export function createTestStore(init) {
  const snapshot = { ...init };
  const store = createStore({ ...init });

  /** @type {Array<{ prop: string, prev: any, next: any }>} */
  const changes = [];

  const proxy = new Proxy(store, {
    set(target, prop, value) {
      const prev = target[prop];
      target[prop] = value;
      changes.push({ prop: /** @type {string} */ (prop), prev, next: value });
      return true;
    }
  });

  return {
    proxy,
    changes,

    /**
     * Reset all properties to initial values and clear the change log.
     */
    reset() {
      changes.length = 0;
      for (const key of Object.keys(snapshot)) {
        store[key] = snapshot[key];
      }
    }
  };
}

// ─── settled ─────────────────────────────────────────────────

/**
 * Wait for all microtasks to settle. Useful after async signal updates.
 *
 * @param {{ timeout?: number }} [options]
 * @returns {Promise<void>}
 */
export function settled(options = {}) {
  const { timeout } = options;

  const tick = () => new Promise((resolve) => { queueMicrotask(resolve); });

  if (timeout == null) {
    // Drain two rounds of microtasks to catch cascading effects
    return tick().then(tick);
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`settled() timed out after ${timeout}ms`));
    }, timeout);

    tick().then(tick).then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}
