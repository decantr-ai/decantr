import { getOwner, registerCleanup } from '../state/scheduler.js';

let mountQueue: Array<() => void | (() => void)> = [];
let destroyQueue: Array<() => void> = [];
let scopeStack: Array<Array<() => void>> = [];

export function onMount(fn: () => void | (() => void)): void {
  mountQueue.push(fn);
}

/**
 * Register a cleanup function. Prefers ownership tree when inside a
 * component()/createRoot() scope, falls back to scope stack otherwise.
 * Guarded against double execution.
 */
export function onCleanup(fn: () => void): void {
  let disposed = false;
  const guarded = (): void => {
    if (disposed) return;
    disposed = true;
    fn();
  };

  if (getOwner()) {
    registerCleanup(guarded);
  } else if (scopeStack.length > 0) {
    scopeStack[scopeStack.length - 1].push(guarded);
  } else {
    destroyQueue.push(guarded);
  }
}

/** Backward-compatible alias for onCleanup. */
export const onDestroy: (fn: () => void) => void = onCleanup;

export function drainMountQueue(): Array<() => void | (() => void)> {
  const fns = mountQueue;
  mountQueue = [];
  return fns;
}

export function drainDestroyQueue(): Array<() => void> {
  const fns = destroyQueue;
  destroyQueue = [];
  return fns;
}

/**
 * Push a new destroy scope. Callbacks registered via onDestroy() within this
 * scope are collected separately and returned by popScope().
 */
export function pushScope(): void {
  scopeStack.push([]);
}

/** Pop the current destroy scope and return its callbacks. */
export function popScope(): Array<() => void> {
  return scopeStack.pop() || [];
}

/** Run all destroy callbacks in an array. */
export function runDestroyFns(fns: Array<() => void>): void {
  for (let i = 0; i < fns.length; i++) {
    try { fns[i](); } catch (_) { /* swallow destroy errors */ }
  }
}
