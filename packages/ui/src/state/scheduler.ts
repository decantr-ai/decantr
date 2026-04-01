import type { ReactiveNode, Owner } from '../types.js';

const pending: Set<ReactiveNode> = new Set();
let flushing = false;
let scheduled = false;

let _currentEffect: ReactiveNode | null = null;

/** Get the current effect (needed for live binding in bundled code). */
export function getCurrentEffect(): ReactiveNode | null {
  return _currentEffect;
}

export function setCurrentEffect(effect: ReactiveNode | null): void {
  _currentEffect = effect;
}

// ─── Ownership Tree ─────────────────────────────────────────

let currentOwner: Owner | null = null;

export function getOwner(): Owner | null {
  return currentOwner;
}

export function runWithOwner<T>(owner: Owner | null, fn: () => T): T {
  const prev = currentOwner;
  currentOwner = owner;
  try {
    return fn();
  } finally {
    currentOwner = prev;
  }
}

/** Create an independent reactive scope. */
export function createRoot<T>(fn: (dispose: () => void) => T): T {
  const owner: Owner = { children: new Set(), cleanups: [], _parent: currentOwner };
  if (currentOwner) currentOwner.children.add(owner);
  const prev = currentOwner;
  currentOwner = owner;
  let result: T;
  try {
    result = fn(() => disposeOwner(owner));
  } finally {
    currentOwner = prev;
  }
  return result;
}

/** Register a cleanup with the current owner. */
export function registerCleanup(cleanup: () => void): void {
  if (currentOwner) {
    currentOwner.cleanups.push(cleanup);
  }
}

/** Create a child owner under the current owner. */
export function createChildOwner(): Owner {
  const child: Owner = { children: new Set(), cleanups: [], _parent: currentOwner };
  if (currentOwner) {
    currentOwner.children.add(child);
  }
  return child;
}

/** Dispose an owner and all its descendants. */
export function disposeOwner(owner: Owner): void {
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

/** Set error handler on current owner. */
export function onError(handler: (err: unknown) => void): void {
  if (currentOwner) {
    currentOwner.onError = handler;
  }
}

/** Walk up owner tree to find error handler. */
export function handleError(error: unknown, owner: Owner | null): void {
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

export function scheduleEffect(effect: ReactiveNode): void {
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
export function flush(): void {
  if (flushing) return;
  flushing = true;
  scheduled = false;

  while (pending.size > 0) {
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

export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) flush();
  }
}

export function isBatching(): boolean {
  return batchDepth > 0;
}
