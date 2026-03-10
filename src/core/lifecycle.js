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
 * @param {Function} fn — registered to current scope if one exists, else global queue
 */
export function onDestroy(fn) {
  if (scopeStack.length > 0) {
    scopeStack[scopeStack.length - 1].push(fn);
  } else {
    destroyQueue.push(fn);
  }
}

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
