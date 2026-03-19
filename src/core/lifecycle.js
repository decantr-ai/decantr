import { getOwner, registerCleanup } from '../state/scheduler.js';

/** @type {Function[]} */
let mountQueue = [];
/** @type {Function[]} */
let destroyQueue = [];
/** @type {Function[][]} */
let scopeStack = [];

/**
 * @param {Function} fn
 */
export function onMount(fn) {
  mountQueue.push(fn);
}

/**
 * Register a cleanup function. Prefers ownership tree when inside a
 * component()/createRoot() scope, falls back to scope stack otherwise.
 * Guarded against double execution.
 *
 * @param {Function} fn - Cleanup callback
 */
export function onCleanup(fn) {
  let disposed = false;
  const guarded = () => {
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

/**
 * Backward-compatible alias for onCleanup.
 * @param {Function} fn
 */
export const onDestroy = onCleanup;

/**
 * @returns {Function[]}
 */
export function drainMountQueue() {
  const fns = mountQueue;
  mountQueue = [];
  return fns;
}

/**
 * @returns {Function[]}
 */
export function drainDestroyQueue() {
  const fns = destroyQueue;
  destroyQueue = [];
  return fns;
}

/**
 * Push a new destroy scope. Callbacks registered via onDestroy() within this
 * scope are collected separately and returned by popScope().
 * @returns {void}
 */
export function pushScope() {
  scopeStack.push([]);
}

/**
 * Pop the current destroy scope and return its callbacks.
 * @returns {Function[]}
 */
export function popScope() {
  return scopeStack.pop() || [];
}

/**
 * Run all destroy callbacks in an array.
 * @param {Function[]} fns
 */
export function runDestroyFns(fns) {
  for (let i = 0; i < fns.length; i++) {
    try { fns[i](); } catch (_) { /* swallow destroy errors */ }
  }
}
