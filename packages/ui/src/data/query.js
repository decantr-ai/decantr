/**
 * Server state / query cache module for Decantr.
 *
 * Exports: createQuery, createInfiniteQuery, createMutation, queryClient
 *
 * Zero dependencies beyond Decantr's own reactive primitives.
 * @module data/query
 */

import { createSignal, createEffect, createMemo, batch, untrack } from '../state/index.js';
import { trackPending } from '../runtime/index.js';

// ─── Request Middleware ──────────────────────────────────────────

/**
 * @typedef {Object} MiddlewareContext
 * @property {string}  url
 * @property {string}  method
 * @property {Object}  headers
 * @property {*}       body
 * @property {*}       [response]  — populated on the way back through middleware
 */

/** @type {Array<(ctx: MiddlewareContext, next: () => Promise<*>) => Promise<*>>} */
const middlewareChain = [];

/**
 * Execute the middleware chain for a request context.
 * Each middleware calls `next()` to pass control to the next middleware.
 * Response flows back through in reverse order.
 * @param {MiddlewareContext} ctx
 * @param {() => Promise<*>} finalHandler — the actual fetch at the end of the chain
 * @returns {Promise<*>}
 */
async function runMiddleware(ctx, finalHandler) {
  let index = 0;
  async function next() {
    if (index < middlewareChain.length) {
      const mw = middlewareChain[index++];
      return mw(ctx, next);
    }
    return finalHandler();
  }
  return await next();
}

// ─── Glob Pattern Matching ──────────────────────────────────────

/**
 * Convert a glob pattern to a RegExp.
 * Supports `*` (any segment chars) and `**` (any path including dots).
 * @param {string} pattern
 * @returns {RegExp}
 */
function globToRegex(pattern) {
  let re = '';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '*' && pattern[i + 1] === '*') {
      re += '.*';
      i++; // skip second *
    } else if (ch === '*') {
      re += '[^.]*';
    } else if (ch === '?') {
      re += '[^.]';
    } else if ('.+^${}()|[]\\'.indexOf(ch) !== -1) {
      re += '\\' + ch;
    } else {
      re += ch;
    }
  }
  return new RegExp('^' + re + '$');
}

// ─── Internal cache ─────────────────────────────────────────────

/**
 * @typedef {Object} CacheEntry
 * @property {*}               data
 * @property {number}          timestamp
 * @property {Set<Function>}   subscribers   — active refetch callbacks
 * @property {Promise|null}    fetchPromise  — in-flight dedup
 * @property {AbortController|null} abortController
 */

/** @type {Map<string, CacheEntry>} */
const cache = new Map();

/** @type {Map<string, number>} */
const gcTimers = new Map();

/**
 * Get or create a cache entry.
 * @param {string} key
 * @returns {CacheEntry}
 */
function getEntry(key) {
  let entry = cache.get(key);
  if (!entry) {
    entry = { data: undefined, timestamp: 0, subscribers: new Set(), fetchPromise: null, abortController: null };
    cache.set(key, entry);
  }
  return entry;
}

/**
 * Schedule garbage collection for an inactive cache entry.
 * @param {string} key
 * @param {number} cacheTime
 */
function scheduleGC(key, cacheTime) {
  if (gcTimers.has(key)) clearTimeout(gcTimers.get(key));
  gcTimers.set(key, setTimeout(() => {
    const entry = cache.get(key);
    if (entry && entry.subscribers.size === 0) {
      cache.delete(key);
      gcTimers.delete(key);
    }
  }, cacheTime));
}

/**
 * Cancel a pending GC timer.
 * @param {string} key
 */
function cancelGC(key) {
  if (gcTimers.has(key)) {
    clearTimeout(gcTimers.get(key));
    gcTimers.delete(key);
  }
}

// ─── createQuery ────────────────────────────────────────────────

/**
 * Reactive server-state query with caching, deduplication, and background refetch.
 *
 * @template T
 * @param {string|(() => string)} key — static key or reactive key getter
 * @param {(ctx: { key: string, signal: AbortSignal }) => Promise<T>} fetcher
 * @param {Object} [options]
 * @param {number}   [options.staleTime=0]            — ms before data is considered stale
 * @param {number}   [options.cacheTime=300000]        — ms to retain inactive cache entries
 * @param {number}   [options.retry=3]                 — retry attempts on failure
 * @param {number}   [options.refetchInterval]         — auto-refetch interval in ms
 * @param {boolean}  [options.refetchOnWindowFocus=true]
 * @param {() => boolean} [options.enabled]            — reactive getter; false = idle
 * @param {(raw: T) => *} [options.select]             — transform raw data
 * @param {T}        [options.initialData]
 * @param {T}        [options.placeholderData]
 * @returns {{ data: () => T, status: () => string, error: () => Error|null, isLoading: () => boolean, isStale: () => boolean, isFetching: () => boolean, refetch: () => Promise<void>, setData: (v: T) => void }}
 */
export function createQuery(key, fetcher, options = {}) {
  const {
    staleTime = 0,
    cacheTime = 300000,
    retry = 3,
    refetchInterval,
    refetchOnWindowFocus = true,
    enabled,
    select,
    initialData,
    placeholderData
  } = options;

  const resolveKey = typeof key === 'function' ? key : () => key;

  // Signals
  const init = initialData !== undefined ? initialData : placeholderData;
  const [data, _setData] = createSignal(init !== undefined ? (select ? select(init) : init) : undefined);
  const [status, setStatus] = createSignal(init !== undefined ? 'success' : 'idle');
  const [_queryError, _setQueryError] = createSignal(/** @type {Error|null} */ (null));
  let _errorObserved = false;

  /** @type {() => Error|null} */
  function error() {
    _errorObserved = true;
    return _queryError();
  }

  function setError(err) {
    _setQueryError(err);
    if (err && globalThis.__DECANTR_DEV__) {
      _errorObserved = false;
      queueMicrotask(() => {
        if (!_errorObserved) {
          const k = untrack(resolveKey);
          console.warn('[decantr] Query "' + k + '" failed but error() was never read. Ensure your UI handles query errors.', err);
        }
      });
    }
  }

  const [isFetching, setIsFetching] = createSignal(false);

  const isLoading = createMemo(() => status() === 'loading');
  const isStale = createMemo(() => {
    const k = untrack(resolveKey);
    const entry = cache.get(k);
    if (!entry || !entry.timestamp) return true;
    return Date.now() - entry.timestamp > staleTime;
  });

  let currentKey = /** @type {string|null} */ (null);
  let intervalId = /** @type {number|null} */ (null);
  let focusHandler = /** @type {Function|null} */ (null);

  /**
   * Core fetch with retry and deduplication.
   * @param {string} k
   * @param {boolean} [background=false]
   * @returns {Promise<void>}
   */
  async function doFetch(k, background = false) {
    const entry = getEntry(k);

    // Deduplication: if an identical fetch is already in flight, piggyback on it
    if (entry.fetchPromise) {
      try {
        await entry.fetchPromise;
        const raw = entry.data;
        batch(() => {
          _setData(select ? select(raw) : raw);
          setStatus('success');
          setError(null);
        });
      } catch (err) {
        batch(() => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus('error');
        });
      }
      return;
    }

    // Abort previous fetch for this entry
    if (entry.abortController) {
      entry.abortController.abort();
      entry.abortController = null;
    }

    const ac = new AbortController();
    entry.abortController = ac;

    if (!background) {
      setStatus(entry.data !== undefined ? 'success' : 'loading');
    }
    setIsFetching(true);

    const promise = (async () => {
      let lastErr;
      for (let attempt = 0; attempt <= retry; attempt++) {
        if (ac.signal.aborted) return;
        try {
          /** @type {*} */
          let result;
          if (middlewareChain.length > 0) {
            const ctx = { url: k, method: 'GET', headers: {}, body: undefined };
            result = await runMiddleware(ctx, () => fetcher({ key: k, signal: ac.signal }));
          } else {
            result = await fetcher({ key: k, signal: ac.signal });
          }
          if (ac.signal.aborted) return;
          entry.data = result;
          entry.timestamp = Date.now();
          batch(() => {
            _setData(select ? select(result) : result);
            setStatus('success');
            setError(null);
            setIsFetching(false);
          });
          return;
        } catch (err) {
          if (ac.signal.aborted) return;
          // Don't retry AbortError
          if (err && err.name === 'AbortError') return;
          lastErr = err instanceof Error ? err : new Error(String(err));
          if (attempt < retry) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
      // All retries exhausted
      if (!ac.signal.aborted) {
        batch(() => {
          setError(lastErr);
          setStatus('error');
          setIsFetching(false);
        });
      }
    })();

    entry.fetchPromise = promise;
    trackPending(promise);

    try {
      await promise;
    } finally {
      if (entry.fetchPromise === promise) entry.fetchPromise = null;
      if (entry.abortController === ac) entry.abortController = null;
    }
  }

  /**
   * Public refetch — forces a fresh fetch for the current key.
   * @returns {Promise<void>}
   */
  async function refetch() {
    const k = untrack(resolveKey);
    if (!k) return;
    const entry = getEntry(k);
    // Kill existing in-flight so we start fresh
    if (entry.fetchPromise) {
      if (entry.abortController) entry.abortController.abort();
      entry.fetchPromise = null;
    }
    await doFetch(k, false);
  }

  /**
   * Manually overwrite cached data for the current key.
   * @param {T} value
   */
  function setData(value) {
    const k = untrack(resolveKey);
    if (!k) return;
    const entry = getEntry(k);
    entry.data = value;
    entry.timestamp = Date.now();
    _setData(select ? select(value) : value);
    setStatus('success');
    setError(null);
  }

  // Subscribe / unsubscribe helper for cache entry
  function subscribe(k) {
    const entry = getEntry(k);
    cancelGC(k);
    entry.subscribers.add(refetch);
  }

  function unsubscribe(k) {
    const entry = cache.get(k);
    if (entry) {
      entry.subscribers.delete(refetch);
      if (entry.subscribers.size === 0) scheduleGC(k, cacheTime);
    }
  }

  // Reactive key tracking — triggers fetch when key changes
  createEffect(() => {
    const isEnabled = enabled ? enabled() : true;
    const k = resolveKey();

    if (!isEnabled || !k) {
      if (status() !== 'idle') setStatus('idle');
      return;
    }

    // Key changed — clean up old subscription
    if (currentKey && currentKey !== k) {
      unsubscribe(currentKey);
      const oldEntry = cache.get(currentKey);
      if (oldEntry && oldEntry.abortController) {
        oldEntry.abortController.abort();
      }
    }
    currentKey = k;
    subscribe(k);

    const entry = cache.get(k);
    // Stale-while-revalidate: serve cached data immediately
    if (entry && entry.data !== undefined) {
      const raw = entry.data;
      const isDataStale = Date.now() - entry.timestamp > staleTime;
      batch(() => {
        _setData(select ? select(raw) : raw);
        setStatus('success');
        setError(null);
      });
      if (isDataStale) {
        doFetch(k, true);
      }
    } else {
      doFetch(k, false);
    }

    // Cleanup on re-run / disposal
    return () => {
      unsubscribe(k);
    };
  });

  // Refetch interval
  if (refetchInterval) {
    createEffect(() => {
      const isEnabled = enabled ? enabled() : true;
      if (!isEnabled) return;
      intervalId = setInterval(() => {
        const k = untrack(resolveKey);
        if (k) doFetch(k, true);
      }, refetchInterval);
      return () => {
        if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
      };
    });
  }

  // Window focus refetch
  if (refetchOnWindowFocus && typeof window !== 'undefined') {
    focusHandler = () => {
      const isEnabled = enabled ? untrack(enabled) : true;
      if (!isEnabled) return;
      const k = untrack(resolveKey);
      if (!k) return;
      const entry = cache.get(k);
      if (!entry || Date.now() - entry.timestamp > staleTime) {
        doFetch(k, true);
      }
    };
    window.addEventListener('focus', focusHandler);
    createEffect(() => {
      return () => {
        if (focusHandler) {
          window.removeEventListener('focus', focusHandler);
          focusHandler = null;
        }
      };
    });
  }

  return { data, status, error, isLoading, isStale, isFetching, refetch, setData };
}

// ─── createInfiniteQuery ────────────────────────────────────────

/**
 * Infinite / paginated query. Accumulates pages and exposes a flat `allItems` view.
 *
 * @template T
 * @param {string|(() => string)} key
 * @param {(ctx: { key: string, pageParam: *, signal: AbortSignal }) => Promise<T>} fetcher
 * @param {Object} options
 * @param {(lastPage: T, allPages: T[]) => *} options.getNextPageParam — return next cursor or undefined
 * @param {number}  [options.staleTime=0]
 * @param {number}  [options.cacheTime=300000]
 * @param {number}  [options.retry=3]
 * @param {() => boolean} [options.enabled]
 * @returns {{ pages: () => T[], allItems: () => *[], hasNextPage: () => boolean, fetchNextPage: () => Promise<void>, isFetchingNextPage: () => boolean, refetch: () => Promise<void> }}
 */
export function createInfiniteQuery(key, fetcher, options = {}) {
  const {
    getNextPageParam,
    staleTime = 0,
    cacheTime = 300000,
    retry = 3,
    enabled
  } = options;

  const resolveKey = typeof key === 'function' ? key : () => key;

  const [pages, setPages] = createSignal(/** @type {T[]} */ ([]));
  const [isFetchingNextPage, setIsFetchingNextPage] = createSignal(false);
  const [status, setStatus] = createSignal(/** @type {string} */ ('idle'));
  const [error, setError] = createSignal(/** @type {Error|null} */ (null));

  const allItems = createMemo(() => {
    const p = pages();
    const items = [];
    for (let i = 0; i < p.length; i++) {
      const page = p[i];
      if (Array.isArray(page)) {
        for (let j = 0; j < page.length; j++) items.push(page[j]);
      } else if (page && typeof page === 'object' && Array.isArray(page.items)) {
        for (let j = 0; j < page.items.length; j++) items.push(page.items[j]);
      } else if (page && typeof page === 'object' && Array.isArray(page.data)) {
        for (let j = 0; j < page.data.length; j++) items.push(page.data[j]);
      } else {
        items.push(page);
      }
    }
    return items;
  });

  const hasNextPage = createMemo(() => {
    const p = pages();
    if (p.length === 0) return true; // not yet fetched
    return getNextPageParam(p[p.length - 1], p) !== undefined;
  });

  /** @type {AbortController|null} */
  let ac = null;

  /**
   * Fetch a single page with retry.
   * @param {string} k
   * @param {*} pageParam
   * @param {AbortSignal} signal
   * @returns {Promise<T>}
   */
  async function fetchPage(k, pageParam, signal) {
    let lastErr;
    for (let attempt = 0; attempt <= retry; attempt++) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      try {
        if (middlewareChain.length > 0) {
          const ctx = { url: k, method: 'GET', headers: {}, body: undefined };
          return await runMiddleware(ctx, () => fetcher({ key: k, pageParam, signal }));
        }
        return await fetcher({ key: k, pageParam, signal });
      } catch (err) {
        if (signal.aborted || (err && err.name === 'AbortError')) throw err;
        lastErr = err instanceof Error ? err : new Error(String(err));
        if (attempt < retry) {
          await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 30000)));
        }
      }
    }
    throw lastErr;
  }

  /**
   * Fetch the first page (or refetch all pages).
   * @returns {Promise<void>}
   */
  async function fetchInitial() {
    const k = untrack(resolveKey);
    if (!k) return;
    if (ac) ac.abort();
    ac = new AbortController();
    const signal = ac.signal;

    setStatus('loading');
    setIsFetchingNextPage(false);

    const promise = (async () => {
      try {
        const firstPage = await fetchPage(k, undefined, signal);
        if (signal.aborted) return;
        batch(() => {
          setPages([firstPage]);
          setStatus('success');
          setError(null);
        });
        // Update cache entry
        const entry = getEntry(k);
        entry.data = [firstPage];
        entry.timestamp = Date.now();
      } catch (err) {
        if (signal.aborted || (err && err.name === 'AbortError')) return;
        batch(() => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus('error');
        });
      }
    })();

    trackPending(promise);
    await promise;
  }

  /**
   * Fetch the next page.
   * @returns {Promise<void>}
   */
  async function fetchNextPage() {
    const k = untrack(resolveKey);
    if (!k) return;
    const currentPages = untrack(pages);
    if (currentPages.length === 0) return await fetchInitial();

    const nextParam = getNextPageParam(currentPages[currentPages.length - 1], currentPages);
    if (nextParam === undefined) return;

    if (ac) ac.abort();
    ac = new AbortController();
    const signal = ac.signal;

    setIsFetchingNextPage(true);

    try {
      const nextPage = await fetchPage(k, nextParam, signal);
      if (signal.aborted) return;
      batch(() => {
        setPages(prev => [...prev, nextPage]);
        setIsFetchingNextPage(false);
        setError(null);
      });
      const entry = getEntry(k);
      entry.data = untrack(pages);
      entry.timestamp = Date.now();
    } catch (err) {
      if (signal.aborted || (err && err.name === 'AbortError')) return;
      batch(() => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsFetchingNextPage(false);
      });
    }
  }

  // Initial fetch driven by reactive key + enabled
  createEffect(() => {
    const isEnabled = enabled ? enabled() : true;
    const k = resolveKey();
    if (!isEnabled || !k) {
      if (untrack(status) !== 'idle') setStatus('idle');
      return;
    }

    const entry = cache.get(k);
    if (entry && entry.data !== undefined && Date.now() - entry.timestamp <= staleTime) {
      batch(() => {
        setPages(entry.data);
        setStatus('success');
        setError(null);
      });
    } else {
      fetchInitial();
    }

    return () => {
      if (ac) { ac.abort(); ac = null; }
      const e = cache.get(k);
      if (e && e.subscribers.size === 0) scheduleGC(k, cacheTime);
    };
  });

  return { pages, allItems, hasNextPage, fetchNextPage, isFetchingNextPage, refetch: fetchInitial };
}

// ─── createMutation ─────────────────────────────────────────────

/**
 * Mutation primitive for create / update / delete operations.
 *
 * @template TData, TVariables
 * @param {(variables: TVariables) => Promise<TData>} mutationFn
 * @param {Object} [options]
 * @param {(variables: TVariables) => *}               [options.onMutate]  — optimistic update; return rollback context
 * @param {(data: TData, variables: TVariables, ctx: *) => void}   [options.onSuccess]
 * @param {(error: Error, variables: TVariables, ctx: *) => void}  [options.onError]
 * @param {(data: TData|undefined, error: Error|undefined, variables: TVariables, ctx: *) => void} [options.onSettled]
 * @returns {{ mutate: (variables: TVariables) => void, mutateAsync: (variables: TVariables) => Promise<TData>, isLoading: () => boolean, error: () => Error|null, data: () => TData|undefined, reset: () => void }}
 */
export function createMutation(mutationFn, options = {}) {
  const { onMutate, onSuccess, onError, onSettled } = options;

  const [data, setData] = createSignal(/** @type {TData|undefined} */ (undefined));
  const [error, setError] = createSignal(/** @type {Error|null} */ (null));
  const [isLoading, setIsLoading] = createSignal(false);

  /**
   * Execute the mutation and return the result.
   * @param {TVariables} variables
   * @returns {Promise<TData>}
   */
  async function mutateAsync(variables) {
    let context;
    batch(() => {
      setIsLoading(true);
      setError(null);
    });

    try {
      if (onMutate) context = await onMutate(variables);
    } catch (e) {
      // onMutate failure is non-fatal to the mutation itself
      if (globalThis.__DECANTR_DEV__) console.error('[decantr] Error in onMutate callback:', e);
    }

    try {
      /** @type {*} */
      let result;
      if (middlewareChain.length > 0) {
        const ctx = { url: '', method: 'POST', headers: {}, body: variables };
        result = await runMiddleware(ctx, () => mutationFn(variables));
      } else {
        result = await mutationFn(variables);
      }
      batch(() => {
        setData(() => result);
        setIsLoading(false);
        setError(null);
      });
      if (onSuccess) {
        try { onSuccess(result, variables, context); } catch (e) { if (globalThis.__DECANTR_DEV__) console.error('[decantr] Error in onSuccess callback:', e); }
      }
      if (onSettled) {
        try { onSettled(result, undefined, variables, context); } catch (e) { if (globalThis.__DECANTR_DEV__) console.error('[decantr] Error in onSettled callback:', e); }
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      batch(() => {
        setError(error);
        setIsLoading(false);
      });
      if (onError) {
        try {
          onError(error, variables, context);
        } catch (e) { if (globalThis.__DECANTR_DEV__) console.error('[decantr] Error in onError callback:', e); }
      }
      if (onSettled) {
        try { onSettled(undefined, error, variables, context); } catch (e) { if (globalThis.__DECANTR_DEV__) console.error('[decantr] Error in onSettled callback:', e); }
      }
      throw error;
    }
  }

  /**
   * Fire-and-forget mutation.
   * @param {TVariables} variables
   */
  function mutate(variables) {
    mutateAsync(variables).catch(e => { if (globalThis.__DECANTR_DEV__) console.error('[decantr] Unhandled mutation error:', e); });
  }

  /** Reset mutation state to initial. */
  function reset() {
    batch(() => {
      setData(() => undefined);
      setError(null);
      setIsLoading(false);
    });
  }

  return { mutate, mutateAsync, isLoading, error, data, reset };
}

// ─── queryClient (singleton) ────────────────────────────────────

/**
 * Global query client for imperative cache operations.
 * @type {{ use: (middleware: Function) => () => void, invalidate: (keyPrefix: string) => void, invalidateQueries: (keyPattern: string) => void, prefetch: (key: string, fetcher: Function) => Promise<void>, setCache: (key: string, data: *) => void, getCache: (key: string) => *, clear: () => void }}
 */
export const queryClient = {
  /**
   * Add a request middleware to the chain.
   * Middleware signature: `async (ctx, next) => { ... }`
   * ctx has: `{ url, method, headers, body }`.
   * Middleware runs in order before fetch; response passes back in reverse.
   * Returns an unsubscribe function to remove the middleware.
   * @param {(ctx: MiddlewareContext, next: () => Promise<*>) => Promise<*>} middleware
   * @returns {() => void}
   */
  use(middleware) {
    middlewareChain.push(middleware);
    return () => {
      const idx = middlewareChain.indexOf(middleware);
      if (idx !== -1) middlewareChain.splice(idx, 1);
    };
  },

  /**
   * Invalidate all queries whose key matches a glob pattern.
   * Supports `*` (single segment) and `**` (any depth).
   * Example: 'user.*' matches 'user.profile', 'user.settings'.
   * Invalidated queries are marked stale and refetched if active.
   * @param {string} keyPattern — glob pattern to match cache keys
   */
  invalidateQueries(keyPattern) {
    const regex = globToRegex(keyPattern);
    for (const [k, entry] of cache) {
      if (regex.test(k)) {
        entry.timestamp = 0; // mark stale
        // Trigger refetch for active subscribers
        if (entry.subscribers.size > 0) {
          for (const refetchFn of entry.subscribers) {
            try { refetchFn(); } catch (_) {}
          }
        }
      }
    }
  },
  /**
   * Mark all queries whose key starts with `keyPrefix` as stale.
   * Active queries (those with subscribers) are refetched immediately.
   * @param {string} keyPrefix
   */
  invalidate(keyPrefix) {
    for (const [k, entry] of cache) {
      if (k.startsWith(keyPrefix)) {
        entry.timestamp = 0; // mark stale
        // Trigger refetch for active subscribers
        if (entry.subscribers.size > 0) {
          for (const refetchFn of entry.subscribers) {
            try { refetchFn(); } catch (_) {}
          }
        }
      }
    }
  },

  /**
   * Warm the cache for a key without an active query.
   * @param {string} key
   * @param {(ctx: { key: string, signal: AbortSignal }) => Promise<*>} fetcher
   * @returns {Promise<void>}
   */
  async prefetch(key, fetcher) {
    const entry = getEntry(key);
    if (entry.fetchPromise) {
      await entry.fetchPromise;
      return;
    }
    const ac = new AbortController();
    entry.abortController = ac;
    const promise = (async () => {
      try {
        const result = await fetcher({ key, signal: ac.signal });
        if (!ac.signal.aborted) {
          entry.data = result;
          entry.timestamp = Date.now();
        }
      } finally {
        if (entry.abortController === ac) entry.abortController = null;
      }
    })();
    entry.fetchPromise = promise;
    try { await promise; } finally {
      if (entry.fetchPromise === promise) entry.fetchPromise = null;
    }
  },

  /**
   * Manually write data into the cache.
   * @param {string} key
   * @param {*} data
   */
  setCache(key, data) {
    const entry = getEntry(key);
    entry.data = data;
    entry.timestamp = Date.now();
  },

  /**
   * Read cached data for a key.
   * @param {string} key
   * @returns {*} — cached data or undefined
   */
  getCache(key) {
    const entry = cache.get(key);
    return entry ? entry.data : undefined;
  },

  /**
   * Clear all cache entries, abort in-flight requests, cancel GC timers.
   */
  clear() {
    for (const [, entry] of cache) {
      if (entry.abortController) entry.abortController.abort();
    }
    for (const [, timerId] of gcTimers) {
      clearTimeout(timerId);
    }
    cache.clear();
    gcTimers.clear();
  }
};
