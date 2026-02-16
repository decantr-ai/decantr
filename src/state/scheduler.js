/** @type {Set<{run: Function}>} */
const pending = new Set();
let flushing = false;
let scheduled = false;

/** @type {{run: Function}|null} */
export let currentEffect = null;

/**
 * @param {{run: Function}|null} effect
 */
export function setCurrentEffect(effect) {
  currentEffect = effect;
}

/**
 * @param {{run: Function}} effect
 */
export function scheduleEffect(effect) {
  pending.add(effect);
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}

export function flush() {
  if (flushing) return;
  flushing = true;
  scheduled = false;
  const effects = [...pending];
  pending.clear();
  for (let i = 0; i < effects.length; i++) {
    effects[i].run();
  }
  flushing = false;
  if (pending.size > 0) {
    scheduled = true;
    queueMicrotask(flush);
  }
}

let batchDepth = 0;

/**
 * @param {Function} fn
 */
export function batch(fn) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) flush();
  }
}

/**
 * @returns {boolean}
 */
export function isBatching() {
  return batchDepth > 0;
}
