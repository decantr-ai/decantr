import { createSignal, batch, untrack } from '../state/index.js';

/* Built-in parsers -------------------------------------------------------- */

/** @type {{ parse: (v: string) => string, serialize: (v: string) => string }} */
const string = { parse: v => v, serialize: v => v };
/** @type {{ parse: (v: string) => number, serialize: (v: number) => string }} */
const integer = { parse: v => parseInt(v, 10), serialize: v => String(v) };
/** @type {{ parse: (v: string) => number, serialize: (v: number) => string }} */
const float = { parse: v => parseFloat(v), serialize: v => String(v) };
/** @type {{ parse: (v: string) => boolean, serialize: (v: boolean) => string }} */
const boolean = { parse: v => v === 'true', serialize: v => v ? 'true' : 'false' };
/** @type {{ parse: (v: string) => any, serialize: (v: any) => string }} */
const json = { parse: v => JSON.parse(v), serialize: v => JSON.stringify(v) };
/** @type {{ parse: (v: string) => Date, serialize: (v: Date) => string }} */
const date = { parse: v => new Date(v), serialize: v => v.toISOString() };

/**
 * Factory parser that validates against an allowed set of values.
 * @template {string} T
 * @param {T[]} values
 * @returns {{ parse: (v: string) => T | undefined, serialize: (v: T) => string }}
 */
function enumParser(values) {
  const allowed = new Set(values);
  return { parse: v => allowed.has(v) ? /** @type {T} */ (v) : undefined, serialize: v => v };
}

export const parsers = { string, integer, float, boolean, json, date, enum: enumParser };

/* Internal helpers -------------------------------------------------------- */

/** Detect hash-based routing (`#/...`). */
function isHashMode() {
  return typeof window !== 'undefined' && window.location.hash.startsWith('#/');
}

/**
 * Read current URL search params, respecting routing mode.
 * @returns {URLSearchParams}
 */
function readParams() {
  if (isHashMode()) {
    const hash = window.location.hash.slice(1);
    const qi = hash.indexOf('?');
    return new URLSearchParams(qi >= 0 ? hash.slice(qi + 1) : '');
  }
  return new URLSearchParams(window.location.search);
}

/**
 * Write search params back to URL, preserving routing mode.
 * @param {URLSearchParams} params
 * @param {boolean} push — true = pushState, false = replaceState
 */
function writeParams(params, push) {
  const qs = params.toString();
  const nav = push ? 'pushState' : 'replaceState';
  if (isHashMode()) {
    let hash = window.location.hash.slice(1);
    const qi = hash.indexOf('?');
    const path = qi >= 0 ? hash.slice(0, qi) : hash;
    window.history[nav](null, '', window.location.pathname + window.location.search + '#' + path + (qs ? '?' + qs : ''));
  } else {
    window.history[nav](null, '', window.location.pathname + (qs ? '?' + qs : ''));
  }
}

/* Throttled URL writer (shared across all signals) ------------------------ */

/** @type {number | null} */
let _flushTimer = null;
/** @type {Array<{ key: string, value: string | null, push: boolean }>} */
let _pendingWrites = [];

function scheduleFlush() {
  if (_flushTimer !== null) return;
  _flushTimer = setTimeout(() => {
    _flushTimer = null;
    const writes = _pendingWrites;
    _pendingWrites = [];
    if (writes.length === 0) return;
    const params = readParams();
    let push = false;
    for (const w of writes) {
      if (w.value === null) params.delete(w.key);
      else params.set(w.key, w.value);
      if (w.push) push = true;
    }
    writeParams(params, push);
  }, 50);
}

/* createURLSignal --------------------------------------------------------- */

/**
 * Create a reactive signal backed by a URL search parameter.
 * @template T
 * @param {string} key — URL param name
 * @param {{ parse: (v: string) => T, serialize: (v: T) => string }} parser
 * @param {{ defaultValue?: T, push?: boolean }} [options]
 * @returns {[() => T, (v: T | ((prev: T) => T)) => void]}
 */
export function createURLSignal(key, parser, options = {}) {
  const { defaultValue, push = false } = options;

  function fromURL() {
    const raw = readParams().get(key);
    if (raw === null) return defaultValue;
    const parsed = parser.parse(raw);
    return parsed === undefined ? defaultValue : parsed;
  }

  const [get, set] = createSignal(fromURL());

  // URL -> signal: sync on browser navigation
  const onNav = () => {
    const next = fromURL();
    if (!Object.is(untrack(get), next)) set(next);
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
  }

  /**
   * Update signal value and schedule a throttled URL write.
   * @param {T | ((prev: T) => T)} v
   */
  function setter(v) {
    const prev = untrack(get);
    const next = typeof v === 'function' ? /** @type {Function} */ (v)(prev) : v;
    set(next);
    const serialized = Object.is(next, defaultValue) ? null : parser.serialize(next);
    _pendingWrites.push({ key, value: serialized, push });
    scheduleFlush();
  }

  return [get, setter];
}

/* createURLStore ---------------------------------------------------------- */

/**
 * Create a reactive store backed by multiple URL search parameters.
 * @template {Record<string, { parser: { parse: (v: string) => any, serialize: (v: any) => string }, defaultValue?: any }>} S
 * @param {S} schema
 * @returns {Record<string, any>} — getter/setter pairs, plus values() and reset()
 */
export function createURLStore(schema) {
  const keys = Object.keys(schema);
  /** @type {Record<string, [Function, Function]>} */
  const signals = {};
  const store = {};

  for (const key of keys) {
    const { parser, defaultValue, ...rest } = schema[key];
    const [get, set] = createURLSignal(key, parser, { defaultValue, ...rest });
    signals[key] = [get, set];
    store[key] = get;
    store['set' + key.charAt(0).toUpperCase() + key.slice(1)] = set;
  }

  /** @returns {Record<string, any>} All current values as a plain object. */
  store.values = () => {
    const out = {};
    for (const key of keys) out[key] = signals[key][0]();
    return out;
  };

  /** Reset all params to their defaults. */
  store.reset = () => {
    batch(() => { for (const key of keys) signals[key][1](schema[key].defaultValue); });
  };

  return store;
}
