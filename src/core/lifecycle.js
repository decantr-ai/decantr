/** @type {Function[]} */
let mountQueue = [];
/** @type {Function[]} */
let destroyQueue = [];

/**
 * @param {Function} fn
 */
export function onMount(fn) {
  mountQueue.push(fn);
}

/**
 * @param {Function} fn
 */
export function onDestroy(fn) {
  destroyQueue.push(fn);
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
