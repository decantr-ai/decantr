/**
 * @module devtools
 * Development-only reactive debugging tools for the Decantr framework.
 *
 * All exports are no-ops when `globalThis.__DECANTR_DEVTOOLS__` is not set,
 * ensuring zero production cost. Call `enableDevTools()` to activate.
 *
 * @example
 * import { enableDevTools, inspectSignal, label, snapshot, restore } from './devtools.js';
 * import { createSignal, createEffect } from './index.js';
 *
 * enableDevTools();
 * const [count, setCount] = createSignal(0);
 * label(count, 'count');
 * console.log(inspectSignal(count));
 * // { value: 0, subscriberCount: 0, id: 1, label: 'count' }
 */

import { createSignal, createEffect, createMemo } from './index.js';

// ─── Public Types ────────────────────────────────────────────────────────────

export interface TraceEntry {
  id: number;
  label: string;
  type: string;
  timestamp: number;
  duration: number;
  trigger: string | null;
}

export interface SignalInfo {
  value: any;
  subscriberCount: number;
  id: number;
  label: string;
}

export interface ReactiveGraph {
  nodes: Array<{ id: number; type: string; label: string; value: any; level: number }>;
  edges: Array<{ from: number; to: number }>;
}

export interface SnapshotData {
  id: string;
  timestamp: number;
  values: Map<string, any>;
}

export interface LeakReport {
  orphanedEffects: number;
  growingSubscribers: Array<{ label: string; count: number }>;
}

// ─── Internal State ─────────────────────────────────────────────────────────

interface NodeMeta { id: number; label: string; type: string; }

const _meta = new WeakMap<Function, NodeMeta>();

const _nodes = new Map<number, { ref: Function; type: string; effectObj?: any }>();

const _effectToNodeId = new WeakMap<object, number>();
const _setters = new WeakMap<Function, Function>();
const _snapshots = new Map<string, SnapshotData>();

/** Auto-incrementing node id counter. */
let _nextId = 1;

let _traceBuffer: TraceEntry[] = [];

/** Write cursor in the circular buffer. */
let _traceIndex = 0;

/** Total trace entries ever recorded (may exceed buffer capacity). */
let _traceTotal = 0;

/** Maximum trace history entries. */
let _maxTraceEntries = 1000;

/** Maximum stored snapshots. */
let _maxSnapshots = 50;

let _lastTrigger: NodeMeta | null = null;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Check whether devtools are currently active.
 * @returns {boolean}
 */
function isActive() {
  // @ts-expect-error -- strict-mode fix (auto)
  return !!globalThis.__DECANTR_DEVTOOLS__;
}

/**
 * Register a reactive node in both _meta (WeakMap) and _nodes (Map).
 * @param {Function} target - Public-facing getter or dispose function.
 * @param {string} type - 'signal' | 'effect' | 'memo'
 * @param {string} [name] - Optional human-readable label.
 * @param {object} [effectObj] - Internal effect object (for graph edge resolution).
 * @returns {number} Assigned id.
 */
function registerNode(target: Function, type: string, name?: string, effectObj?: any): number {
  const id = _nextId++;
  const entry = { id, label: name || `${type}#${id}`, type };
  _meta.set(target, entry);
  const nodeEntry = { ref: target, type };
  if (effectObj) {
    // @ts-expect-error -- strict-mode fix (auto)
    nodeEntry.effectObj = effectObj;
    _effectToNodeId.set(effectObj, id);
  }
  _nodes.set(id, nodeEntry);
  return id;
}

/**
 * Write a trace entry into the circular buffer.
 * @param {number} id
 * @param {string} lbl
 * @param {string} type
 * @param {number} duration - Execution time in ms.
 * @param {string|null} trigger - Label of the triggering signal.
 */
function recordTrace(id: number, lbl: string, type: string, duration: number, trigger: string | null) {
  const entry: TraceEntry = { id, label: lbl, type, timestamp: Date.now(), duration, trigger };

  if (_traceBuffer.length < _maxTraceEntries) {
    _traceBuffer.push(entry);
  } else {
    _traceBuffer[_traceIndex] = entry;
  }
  _traceIndex = (_traceIndex + 1) % _maxTraceEntries;
  _traceTotal++;
}

/**
 * Read trace entries in chronological order.
 * @param {number} limit - Max entries to return.
 * @returns {TraceEntry[]}
 */
function readTrace(limit: number): TraceEntry[] {
  const len = _traceBuffer.length;
  const count = Math.min(len, limit);
  if (count === 0) return [];

  if (len < _maxTraceEntries) {
    // Buffer has not wrapped — entries are already chronological
    return _traceBuffer.slice(len - count);
  }

  // Buffer has wrapped — _traceIndex points to the oldest slot
  const result = new Array(count);
  const start = _traceIndex; // oldest entry position
  const offset = len - count;
  for (let i = 0; i < count; i++) {
    result[i] = _traceBuffer[(start + offset + i) % len];
  }
  return result;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Activate devtools instrumentation.
 *
 * Sets `globalThis.__DECANTR_DEVTOOLS__ = true` and configures limits.
 * After calling this, use the module's `label()`, `registerSignalSetter()`,
 * and the `*Tracked` factory wrappers to register reactive nodes for
 * inspection, tracing, and snapshotting.
 *
 * Safe to call multiple times — subsequent calls update options only.
 *
 * @param {{ maxTraceEntries?: number, maxSnapshots?: number }} [options]
 * @returns {void}
 */
export function enableDevTools(options?: { maxTraceEntries?: number; maxSnapshots?: number }): void {
  // @ts-expect-error -- strict-mode fix (auto)
  globalThis.__DECANTR_DEVTOOLS__ = true;

  if (options) {
    if (typeof options.maxTraceEntries === 'number' && options.maxTraceEntries > 0) {
      _maxTraceEntries = options.maxTraceEntries;
    }
    if (typeof options.maxSnapshots === 'number' && options.maxSnapshots > 0) {
      _maxSnapshots = options.maxSnapshots;
    }
  }

  // Shrink trace buffer if new limit is smaller
  if (_traceBuffer.length > _maxTraceEntries) {
    _traceBuffer = readTrace(_maxTraceEntries);
    _traceIndex = 0;
  }
}

/**
 * Inspect a signal getter and return its current debug state.
 *
 * Also works on memo getters (they expose `_subscribers` the same way).
 * Returns `null` if devtools are not enabled or the function is not a
 * recognized reactive getter.
 *
 * @param {Function} getter - A signal or memo getter.
 * @returns {{ value: any, subscriberCount: number, id: number, label: string }|null}
 */
export function inspectSignal(getter: any): SignalInfo | null {
  if (!isActive()) return null;
  if (typeof getter !== 'function') return null;

  const meta = _meta.get(getter);
  const subscribers = getter._subscribers;
  const subscriberCount = subscribers instanceof Set ? subscribers.size : 0;

  if (meta) {
    return {
      value: getter(),
      subscriberCount,
      id: meta.id,
      label: meta.label
    };
  }

  // Unregistered signal — still return useful info if it has _subscribers
  if (subscribers instanceof Set) {
    return {
      value: getter(),
      subscriberCount,
      id: -1,
      label: '(unlabeled)'
    };
  }

  return null;
}

/**
 * Assign a human-readable debug label to a reactive node.
 *
 * Works on signal getters, memo getters, and effect dispose functions.
 * If the node was not previously registered (e.g. created before
 * `enableDevTools()`), it is registered on first `label()` call.
 *
 * @param {Function} target - Signal getter, memo getter, or effect dispose.
 * @param {string} name - Debug label.
 * @returns {void}
 */
export function label(target: Function, name: string): void {
  if (!isActive()) return;
  if (typeof target !== 'function' || typeof name !== 'string') return;

  const existing = _meta.get(target);
  if (existing) {
    existing.label = name;
    return;
  }

  // Infer node type from shape
  let type = 'unknown';
  // @ts-expect-error -- strict-mode fix (auto)
  if (target._subscribers instanceof Set) {
    // Both signals and memos expose _subscribers — distinguish by checking
    // whether there is a setter registered (signals have one, memos don't).
    type = _setters.has(target) ? 'signal' : 'signal';
    // Conservative: default to 'signal' — label() is called before we can
    // reliably distinguish. Callers can use registerSignalSetter to clarify.
  } else if (target.name === 'dispose') {
    type = 'effect';
  }
  registerNode(target, type, name);
}

/**
 * Register a signal's setter so `snapshot()`/`restore()` can capture and
 * write values. Also registers the getter as a 'signal' node if not already
 * tracked.
 *
 * @param {Function} getter - Signal getter from `createSignal`.
 * @param {Function} setter - Signal setter from `createSignal`.
 * @returns {void}
 */
export function registerSignalSetter(getter: Function, setter: Function): void {
  if (!isActive()) return;
  _setters.set(getter, setter);
  // Ensure the getter is registered as a node
  if (!_meta.has(getter)) {
    registerNode(getter, 'signal');
  }
}

/**
 * Build the full reactive dependency graph from all registered nodes.
 *
 * Nodes represent signals, effects, and memos. Edges flow from source
 * (signal/memo) to subscriber (effect/memo).
 *
 * Edge resolution works by iterating each signal/memo's `_subscribers` set
 * and matching each internal effect object back to a registered node via
 * `_effectToNodeId`.
 *
 * @returns {{ nodes: Array<{ id: number, type: string, label: string, value: any, level: number }>, edges: Array<{ from: number, to: number }> }|null}
 */
export function getReactiveGraph(): ReactiveGraph | null {
  if (!isActive()) return null;

  /** @type {Array<{ id: number, type: string, label: string, value: any, level: number }>} */
  const nodes = [];
  /** @type {Array<{ from: number, to: number }>} */
  const edges = [];

  // Collect all nodes
  for (const [nodeId, entry] of _nodes) {
    const meta = _meta.get(entry.ref);
    if (!meta) continue;

    let value;
    let level = 0;

    if (entry.type === 'signal' || entry.type === 'memo') {
      try {
        // Safe to call getter here — no currentEffect is set at module scope
        value = entry.ref();
      } catch (_) {
        value = '<error>';
      }
    }

    if (entry.effectObj && typeof entry.effectObj.level === 'number') {
      level = entry.effectObj.level;
    }

    nodes.push({ id: nodeId, type: entry.type, label: meta.label, value, level });
  }

  // Build edges: for each signal/memo, walk its subscribers and resolve
  for (const [nodeId, entry] of _nodes) {
    if (entry.type !== 'signal' && entry.type !== 'memo') continue;

    // @ts-expect-error -- strict-mode fix (auto)
    const subs = entry.ref._subscribers;
    if (!(subs instanceof Set)) continue;

    for (const subscriber of subs) {
      const targetId = _effectToNodeId.get(subscriber);
      if (targetId !== undefined && targetId !== nodeId) {
        edges.push({ from: nodeId, to: targetId });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Retrieve the execution trace log.
 *
 * Returns an array of trace entries in chronological order, recording what
 * effects and memos ran, when, how long they took, and what signal triggered
 * each execution.
 *
 * @param {{ limit?: number }} [options]
 * @returns {TraceEntry[]|null} Returns `null` if devtools are not enabled.
 */
export function getTrace(options?: { limit?: number }): TraceEntry[] | null {
  if (!isActive()) return null;

  const limit = (options && typeof options.limit === 'number')
    ? options.limit
    : _traceBuffer.length;
  return readTrace(Math.max(0, limit));
}

/**
 * Capture a snapshot of all labeled signals that have a registered setter.
 *
 * Returns a snapshot object whose `id` can be passed to `restore()` to
 * reinstate the captured values.
 *
 * @returns {{ id: string, timestamp: number, values: Map<string, any> }|null}
 */
export function snapshot(): SnapshotData | null {
  if (!isActive()) return null;

  /** @type {Map<string, any>} */
  const values = new Map();

  for (const [, entry] of _nodes) {
    if (entry.type !== 'signal') continue;
    if (!_setters.has(entry.ref)) continue;

    const meta = _meta.get(entry.ref);
    if (!meta) continue;

    try {
      values.set(meta.label, entry.ref());
    } catch (_) {
      // Skip signals that throw on read
    }
  }

  const id = `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ts = Date.now();
  const snap = { id, timestamp: ts, values };

  // Enforce max snapshots — evict oldest
  if (_snapshots.size >= _maxSnapshots) {
    const oldest = _snapshots.keys().next().value;
    // @ts-expect-error -- strict-mode fix (auto)
    _snapshots.delete(oldest);
  }

  _snapshots.set(id, snap);
  return snap;
}

/**
 * Restore a previously captured snapshot by writing all captured signal
 * values back through their registered setters.
 *
 * @param {string} snapshotId - The `id` from a previous `snapshot()` call.
 * @returns {boolean} `true` if at least one signal was restored.
 */
export function restore(snapshotId: string): boolean {
  if (!isActive()) return false;
  if (typeof snapshotId !== 'string') return false;

  const snap = _snapshots.get(snapshotId);
  if (!snap) return false;

  // Build label -> setter lookup
  /** @type {Map<string, Function>} */
  const labelToSetter = new Map();
  for (const [, entry] of _nodes) {
    if (entry.type !== 'signal') continue;
    const meta = _meta.get(entry.ref);
    if (!meta) continue;
    const setter = _setters.get(entry.ref);
    if (!setter) continue;
    labelToSetter.set(meta.label, setter);
  }

  let restored = false;
  for (const [lbl, value] of snap.values) {
    const setter = labelToSetter.get(lbl);
    if (setter) {
      setter(value);
      restored = true;
    }
  }
  return restored;
}

/**
 * Detect potential memory leaks in the reactive graph.
 *
 * Scans all registered signal/memo subscriber sets for:
 * 1. **Orphaned effects** — subscribers marked `.disposed` but still present
 *    in a subscriber set (should have been cleaned up).
 * 2. **Growing subscribers** — subscriber sets whose size exceeds a threshold,
 *    which may indicate effects subscribing in a loop without cleanup.
 *
 * @param {{ subscriberThreshold?: number }} [options]
 * @returns {{ orphanedEffects: number, growingSubscribers: Array<{ label: string, count: number }> }|null}
 */
export function detectLeaks(options?: { subscriberThreshold?: number }): LeakReport | null {
  if (!isActive()) return null;

  const threshold = (options && typeof options.subscriberThreshold === 'number')
    ? options.subscriberThreshold
    : 10;

  let orphanedEffects = 0;
  /** @type {Array<{ label: string, count: number }>} */
  const growingSubscribers = [];

  for (const [, entry] of _nodes) {
    if (entry.type !== 'signal' && entry.type !== 'memo') continue;

    // @ts-expect-error -- strict-mode fix (auto)
    const subs = entry.ref._subscribers;
    if (!(subs instanceof Set)) continue;

    const meta = _meta.get(entry.ref);
    const lbl = meta ? meta.label : '(unlabeled)';

    // Count orphaned subscribers
    for (const subscriber of subs) {
      if (subscriber.disposed) {
        orphanedEffects++;
      }
    }

    // Flag suspiciously large subscriber sets
    if (subs.size > threshold) {
      growingSubscribers.push({ label: lbl, count: subs.size });
    }
  }

  return { orphanedEffects, growingSubscribers };
}

// ─── Instrumented Factory Wrappers ──────────────────────────────────────────
//
// Drop-in replacements for createSignal / createEffect / createMemo that
// automatically register nodes, record traces, and store effect object
// references for graph edge resolution.
//
// For nodes created *before* devtools are enabled, use label() +
// registerSignalSetter() to register them manually.

/**
 * Instrumented `createSignal`.
 *
 * Returns the same `[getter, setter]` tuple but registers the signal for
 * inspection and wraps the setter to attribute trigger sources.
 *
 * @template T
 * @param {T} initialValue
 * @param {{ label?: string }} [options]
 * @returns {[() => T, (v: T | ((prev: T) => T)) => void]}
 */
export function createSignalTracked<T>(initialValue: T, options?: { label?: string }): [() => T, (v: T | ((prev: T) => T)) => void] {
  const [getter, setter] = createSignal(initialValue);
  if (!isActive()) return [getter, setter];

  const name = (options && options.label) ? options.label : undefined;
  registerNode(getter, 'signal', name);
  _setters.set(getter, setter);

  const meta = _meta.get(getter);

  /**
   * Wrapped setter that records trigger attribution before delegating.
   * @param {T | ((prev: T) => T)} next
   */
  function trackedSetter(next: any) {
    // @ts-expect-error -- strict-mode fix (auto)
    _lastTrigger = meta;
    try {
      setter(next);
    } finally {
      _lastTrigger = null;
    }
  }

  return [getter, trackedSetter];
}

/**
 * Instrumented `createEffect`.
 *
 * Wraps the user function to record execution duration and trigger source
 * into the trace buffer.
 *
 * @param {Function} fn
 * @param {{ label?: string }} [options]
 * @returns {Function} dispose
 */
export function createEffectTracked(fn: Function, options?: { label?: string }): Function {
  // @ts-expect-error -- strict-mode fix (auto)
  if (!isActive()) return createEffect(fn);

  /** @type {{ id: number, label: string, type: string }|null} */
  let meta: any = null;

  // We need the internal effect object for graph resolution. The scheduler
  // creates it inside createEffect — we capture it through the _subscribers
  // sets that get populated when the effect first runs.
  const dispose = createEffect(() => {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const result = fn();
    const elapsed = typeof performance !== 'undefined'
      ? performance.now() - start
      : Date.now() - start;

    if (meta) {
      const triggerLabel = _lastTrigger ? _lastTrigger.label : null;
      recordTrace(meta.id, meta.label, 'effect', elapsed, triggerLabel);
    }

    return result;
  });

  const name = (options && options.label) ? options.label : undefined;
  registerNode(dispose, 'effect', name);
  meta = _meta.get(dispose);

  return dispose;
}

/**
 * Instrumented `createMemo`.
 *
 * Wraps the computation to record execution traces.
 *
 * @template T
 * @param {() => T} fn
 * @param {{ label?: string }} [options]
 * @returns {() => T}
 */
export function createMemoTracked<T>(fn: () => T, options?: { label?: string }): () => T {
  if (!isActive()) return createMemo(fn);

  /** @type {{ id: number, label: string, type: string }|null} */
  let meta: any = null;

  const getter = createMemo(() => {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const result = fn();
    const elapsed = typeof performance !== 'undefined'
      ? performance.now() - start
      : Date.now() - start;

    if (meta) {
      const triggerLabel = _lastTrigger ? _lastTrigger.label : null;
      recordTrace(meta.id, meta.label, 'memo', elapsed, triggerLabel);
    }

    return result;
  });

  const name = (options && options.label) ? options.label : undefined;
  registerNode(getter, 'memo', name);
  meta = _meta.get(getter);

  return getter;
}

// ─── Reset / Teardown ───────────────────────────────────────────────────────

/**
 * Reset all devtools internal state. Intended for test teardown.
 * Does not clear `globalThis.__DECANTR_DEVTOOLS__`.
 * @returns {void}
 */
export function _reset(): void {
  _nodes.clear();
  _snapshots.clear();
  _traceBuffer = [];
  _traceIndex = 0;
  _traceTotal = 0;
  _nextId = 1;
  _lastTrigger = null;
}

/**
 * Disable devtools and clear all state.
 * @returns {void}
 */
export function disableDevTools(): void {
  // @ts-expect-error -- strict-mode fix (auto)
  globalThis.__DECANTR_DEVTOOLS__ = false;
  _reset();
}
