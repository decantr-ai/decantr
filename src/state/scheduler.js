/** @typedef {{ run: Function, level: number, sources?: Set, disposed?: boolean }} ReactiveNode */

/** @type {Set<ReactiveNode>} */
const pending = new Set();
let flushing = false;
let scheduled = false;

/** @type {ReactiveNode|null} */
let _currentEffect = null;

/**
 * Get the current effect (needed for live binding in bundled code)
 * @returns {ReactiveNode|null}
 */
export function getCurrentEffect() {
  return _currentEffect;
}

/**
 * @param {ReactiveNode|null} effect
 */
export function setCurrentEffect(effect) {
  _currentEffect = effect;
}

// ─── Ownership Tree ─────────────────────────────────────────

/** @typedef {{ children: Set<Owner>, cleanups: Function[], onError?: Function, context?: Map }} Owner */

/** @type {Owner|null} */
let currentOwner = null;

/**
 * @returns {Owner|null}
 */
export function getOwner() {
  return currentOwner;
}

/**
 * @param {Owner|null} owner
 * @param {Function} fn
 * @returns {*}
 */
export function runWithOwner(owner, fn) {
  const prev = currentOwner;
  currentOwner = owner;
  try {
    return fn();
  } finally {
    currentOwner = prev;
  }
}

/**
 * Create an independent reactive scope.
 * @param {Function} fn
 * @returns {*}
 */
export function createRoot(fn) {
  /** @type {Owner} */
  const owner = { children: new Set(), cleanups: [] };
  const prev = currentOwner;
  currentOwner = owner;
  let result;
  try {
    result = fn(() => disposeOwner(owner));
  } finally {
    currentOwner = prev;
  }
  return result;
}

/**
 * Register current node with owner tree.
 * @param {Function} cleanup
 */
export function registerCleanup(cleanup) {
  if (currentOwner) {
    currentOwner.cleanups.push(cleanup);
  }
}

/**
 * Create a child owner under the current owner.
 * @returns {Owner}
 */
export function createChildOwner() {
  /** @type {Owner} */
  const child = { children: new Set(), cleanups: [] };
  if (currentOwner) {
    currentOwner.children.add(child);
    child._parent = currentOwner;
  }
  return child;
}

/**
 * Dispose an owner and all its descendants.
 * @param {Owner} owner
 */
export function disposeOwner(owner) {
  // Dispose children first (depth-first)
  for (const child of owner.children) {
    disposeOwner(child);
  }
  owner.children.clear();
  // Run cleanups in reverse order
  for (let i = owner.cleanups.length - 1; i >= 0; i--) {
    try { owner.cleanups[i](); } catch (_) {}
  }
  owner.cleanups.length = 0;
  // Remove from parent
  if (owner._parent) {
    owner._parent.children.delete(owner);
    owner._parent = null;
  }
}

// ─── Error Boundaries ───────────────────────────────────────

/**
 * Set error handler on current owner.
 * @param {Function} handler — (error) => void
 */
export function onError(handler) {
  if (currentOwner) {
    currentOwner.onError = handler;
  }
}

/**
 * Walk up owner tree to find error handler.
 * @param {Error} error
 * @param {Owner|null} owner
 */
export function handleError(error, owner) {
  let current = owner;
  while (current) {
    if (current.onError) {
      try {
        current.onError(error);
        return;
      } catch (e) {
        // Handler itself threw — continue up
        error = e instanceof Error ? e : new Error(String(e));
      }
    }
    current = current._parent || null;
  }
  // No handler found — rethrow
  throw error;
}

// ─── Scheduling & Flush ─────────────────────────────────────

/**
 * @param {ReactiveNode} effect
 */
export function scheduleEffect(effect) {
  if (effect.disposed) return;
  pending.add(effect);
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}

/**
 * Topological flush — sort pending effects by level (lowest first).
 * Effects with lower levels (closer to signals) run first,
 * preventing diamond-problem double-firing.
 */
export function flush() {
  if (flushing) return;
  flushing = true;
  scheduled = false;

  while (pending.size > 0) {
    // Sort by level for topological ordering
    const effects = [...pending].sort((a, b) => (a.level || 0) - (b.level || 0));
    pending.clear();
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      if (!effect.disposed) {
        effect.run();
      }
    }
  }

  flushing = false;
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
