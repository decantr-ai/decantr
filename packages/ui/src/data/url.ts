import { createSignal, batch, untrack } from '../state/index.js';

export interface URLParser<T> {
  parse: (v: string) => T;
  serialize: (v: T) => string;
}

/* Built-in parsers -------------------------------------------------------- */

const string: URLParser<string> = { parse: (v: string) => v, serialize: (v: string) => v };
const integer: URLParser<number> = { parse: (v: string) => parseInt(v, 10), serialize: (v: number) => String(v) };
const float: URLParser<number> = { parse: (v: string) => parseFloat(v), serialize: (v: number) => String(v) };
const boolean: URLParser<boolean> = { parse: (v: string) => v === 'true', serialize: (v: boolean) => v ? 'true' : 'false' };
const json: URLParser<any> = { parse: (v: string) => JSON.parse(v), serialize: (v: any) => JSON.stringify(v) };
const date: URLParser<Date> = { parse: (v: string) => new Date(v), serialize: (v: Date) => v.toISOString() };

/**
 * Factory parser that validates against an allowed set of values.
 * @template {string} T
 * @param {T[]} values
 * @returns {{ parse: (v: string) => T | undefined, serialize: (v: T) => string }}
 */
function enumParser<T extends string>(values: T[]): URLParser<T | undefined> {
  const allowed = new Set(values);
  return { parse: (v: string) => allowed.has(v as T) ? v as T : undefined, serialize: (v: T | undefined) => v as string };
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
export function createURLSignal<T>(key: string, parser: URLParser<T>, options: { defaultValue?: T; push?: boolean } = {}): [() => T, (v: T | ((prev: T) => T)) => void] {
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
export function createURLStore(schema: Record<string, { parser: URLParser<any>; defaultValue?: any; push?: boolean }>): Record<string, any> {
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
