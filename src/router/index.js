import { createSignal, createEffect, createRoot, getOwner, untrack } from '../state/index.js';
import { getAnimations } from '../css/theme-registry.js';
import { h } from '../core/index.js';
import { disposeNode } from '../core/component.js';
import { drainMountQueue, runDestroyFns } from '../core/lifecycle.js';
import { hashStrategy } from './hash.js';
import { historyStrategy } from './history.js';
import { createLiveRegion } from '../components/_behaviors.js';

/** @type {ReturnType<typeof createRouter>|null} */
let activeRouter = null;

/** @type {RegExp} */
const UNSAFE_URL = /^(javascript|data):|^https?:\/\//i;

/**
 * Validate a navigation path. Only relative paths starting with '/' are allowed.
 * @param {string} path
 * @returns {string} validated path
 */
function validatePath(path) {
  if (typeof path !== 'string' || UNSAFE_URL.test(path.trim())) {
    throw new Error(`Invalid route path: ${path}`);
  }
  if (path[0] !== '/') throw new Error(`Route path must start with /: ${path}`);
  return path;
}

/**
 * Parse query string from a full path.
 * @param {string} fullPath
 * @returns {{ pathname: string, search: string, query: Object<string, string> }}
 */
function parsePath(fullPath) {
  const qIdx = fullPath.indexOf('?');
  if (qIdx === -1) return { pathname: fullPath, search: '', query: {} };
  const pathname = fullPath.slice(0, qIdx);
  const search = fullPath.slice(qIdx);
  const query = {};
  const sp = new URLSearchParams(search);
  sp.forEach((v, k) => { query[k] = v; });
  return { pathname, search, query };
}

/**
 * Compile a single route path segment into a regex + param keys.
 * @param {string} path
 * @returns {{ regex: RegExp, keys: string[] }}
 */
function compilePath(path) {
  const keys = [];
  const pattern = path
    .replace(/:([^/]+)/g, (_, key) => { keys.push(key); return '([^/]+)'; })
    .replace(/\*/g, '(.*)');
  return { regex: new RegExp(`^${pattern}$`), keys };
}

/**
 * Flatten nested route tree into a list of compiled entries.
 * Each entry has: fullPath, regex, keys, components[], name?, meta
 * components[] is the chain from root layout to leaf component.
 * @param {Array} routes
 * @param {string} parentPath
 * @param {Array} parentComponents
 * @param {Object} parentMeta
 * @returns {Array<{ fullPath: string, regex: RegExp, keys: string[], components: Function[], name?: string, meta: Object }>}
 */
function flattenRoutes(routes, parentPath = '', parentComponents = [], parentMeta = {}) {
  /** @type {Array} */
  const result = [];
  for (const r of routes) {
    const seg = r.path === '*' ? '*' : r.path;
    const full = seg === '*' ? parentPath + '/*' :
      parentPath + (seg.startsWith('/') ? seg : (seg ? '/' + seg : ''));
    const normalized = full.replace(/\/+/g, '/') || '/';
    const chain = r.component ? [...parentComponents, r.component] : [...parentComponents];
    const mergedMeta = { ...parentMeta, ...(r.meta || {}) };

    if (r.children && r.children.length) {
      result.push(...flattenRoutes(r.children, normalized, chain, mergedMeta));
    } else {
      const { regex, keys } = compilePath(normalized);
      result.push({ fullPath: normalized, regex, keys, components: chain, name: r.name, meta: mergedMeta });
    }
  }
  return result;
}

/**
 * Build name-to-path lookup from route config.
 * @param {Array} routes
 * @param {string} parentPath
 * @returns {Map<string, string>}
 */
function buildNameMap(routes, parentPath = '') {
  const map = new Map();
  for (const r of routes) {
    const seg = r.path === '*' ? '*' : r.path;
    const full = seg === '*' ? parentPath + '/*' :
      parentPath + (seg.startsWith('/') ? seg : (seg ? '/' + seg : ''));
    const normalized = full.replace(/\/+/g, '/') || '/';
    if (r.name) map.set(r.name, normalized);
    if (r.children) {
      for (const [k, v] of buildNameMap(r.children, normalized)) map.set(k, v);
    }
  }
  return map;
}

/**
 * Resolve a named route to a path string.
 * @param {Map<string, string>} nameMap
 * @param {{ name: string, params?: Object }} to
 * @returns {string}
 */
function resolveNamedRoute(nameMap, to) {
  const pattern = nameMap.get(to.name);
  if (!pattern) throw new Error(`Unknown route name: ${to.name}`);
  let path = pattern;
  if (to.params) {
    for (const [k, v] of Object.entries(to.params)) {
      path = path.replace(`:${k}`, encodeURIComponent(String(v)));
    }
  }
  return path;
}

/** @type {Map<Function, Function>} Cache for lazy-loaded components */
const lazyCache = new Map();

/**
 * Resolve a component — handles lazy (async) components with caching.
 * @param {Function} component
 * @returns {Promise<Function>|Function}
 */
function resolveComponent(component) {
  if (lazyCache.has(component)) return lazyCache.get(component);
  let result;
  try {
    result = component.__isLazy ? component() : component;
  } catch (_) {
    return component;
  }
  if (result && typeof result.then === 'function') {
    const promise = result.then(resolved => {
      const comp = typeof resolved === 'function' ? resolved :
        (resolved && resolved.default ? resolved.default : resolved);
      lazyCache.set(component, comp);
      return comp;
    });
    return promise;
  }
  return result;
}

/**
 * Detect if a component is lazy (returns a Promise when called with no args).
 * We mark it during route compilation to avoid false positives.
 * @param {Function} fn
 * @returns {boolean}
 */
function isLazyComponent(fn) {
  if (!fn || typeof fn !== 'function') return false;
  // Heuristic: function body contains import() or returns Promise
  // More reliable: try calling it and check for .then
  // We use a safe probe — only if the function has 0 declared params
  if (fn.length > 0) return false;
  try {
    const r = fn();
    if (r && typeof r.then === 'function') {
      // It's async — but we need to not lose this promise.
      // Store it immediately in the cache as a pending promise
      const promise = r.then(resolved => {
        const comp = typeof resolved === 'function' ? resolved :
          (resolved && resolved.default ? resolved.default : resolved);
        lazyCache.set(fn, comp);
        return comp;
      });
      lazyCache.set(fn, promise);
      fn.__isLazy = true;
      return true;
    }
  } catch (_) {
    // Not lazy — just a regular component
  }
  return false;
}

/**
 * @typedef {{
 *   mode?: 'hash'|'history',
 *   base?: string,
 *   routes: Array<{path: string, component?: Function, children?: Array, name?: string, meta?: Object}>,
 *   transitions?: boolean,
 *   scrollBehavior?: 'top'|'restore'|false,
 *   beforeEach?: (to: Object, from: Object) => undefined|false|string,
 *   afterEach?: (to: Object, from: Object) => void
 * }} RouterConfig
 */

/**
 * Create a router instance.
 * @param {RouterConfig} config
 * @returns {{ navigate: Function, outlet: Function, current: Function, path: Function, destroy: Function, onNavigate: Function }}
 */
export function createRouter(config) {
  const strategy = config.mode === 'history' ? historyStrategy : hashStrategy;
  const base = (config.base || '').replace(/\/+$/, '');
  const useTransitions = !!config.transitions;
  const scrollBehavior = config.scrollBehavior !== undefined ? config.scrollBehavior : 'top';
  const beforeEach = config.beforeEach || null;
  const afterEach = config.afterEach || null;

  /** @type {Array<(to: Object, from: Object) => void>} */
  const listeners = [];

  // Compile routes
  const compiled = flattenRoutes(config.routes);
  const nameMap = buildNameMap(config.routes);

  // Probe for lazy components during init
  for (const entry of compiled) {
    for (let i = 0; i < entry.components.length; i++) {
      isLazyComponent(entry.components[i]);
    }
  }

  /**
   * Strip base path prefix from a full path.
   * @param {string} path
   * @returns {string}
   */
  function stripBase(path) {
    if (!base) return path;
    if (path.startsWith(base)) return path.slice(base.length) || '/';
    return path;
  }

  const [navigating, setNavigating] = createSignal(false);

  // Persistent live region for route change announcements
  let _liveRegion = null;
  if (typeof document !== 'undefined') {
    _liveRegion = createLiveRegion({ politeness: 'polite' });
  }

  /** @type {Map<string, number>} scroll position cache */
  const scrollPositions = new Map();

  const initialFull = stripBase(strategy.current());
  const { pathname: initPath, query: initQuery } = parsePath(initialFull);

  // Start with empty components — handleNavigation (async) will resolve lazy components
  // and set the real route. This prevents the outlet from rendering unresolved components.
  const [route, setRoute] = createSignal({ path: initPath, params: {}, query: initQuery, component: null, components: [], matched: false, meta: {} });

  /**
   * Match a pathname against compiled routes.
   * @param {string} pathname
   * @param {Object} query
   * @returns {{ path: string, params: Object, query: Object, component: Function|null, components: Function[], matched: boolean, name?: string }}
   */
  function matchRoute(pathname, query) {
    for (const entry of compiled) {
      const match = pathname.match(entry.regex);
      if (match) {
        const params = {};
        entry.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
        // Leaf component is last in chain
        const component = entry.components[entry.components.length - 1] || null;
        return {
          path: pathname, params, query, component,
          components: entry.components, matched: true, name: entry.name, meta: entry.meta || {}
        };
      }
    }
    return { path: pathname, params: {}, query, component: null, components: [], matched: false, meta: {} };
  }

  /**
   * Core navigation handler. Applies guards, updates signal, manages scroll.
   * @param {string} newPath
   * @param {{ replace?: boolean, skipGuards?: boolean }} [opts]
   */
  async function handleNavigation(newPath, opts = {}) {
    const { pathname, query } = parsePath(newPath);
    const to = matchRoute(pathname, query);
    const from = route();

    // Before guard
    if (!opts.skipGuards && beforeEach) {
      let result;
      try {
        result = beforeEach(to, from);
      } catch (e) {
        if (globalThis.__DECANTR_DEV__) console.error('[decantr] Error in beforeEach guard:', e);
        return; // Cancel navigation on guard error
      }
      if (result === false) return;
      if (typeof result === 'string') {
        // Redirect — validate and navigate
        validatePath(result);
        const redirectPath = base + result;
        if (opts.replace) {
          strategy.replace(redirectPath);
        } else {
          strategy.push(redirectPath);
        }
        return;
      }
    }

    // Save scroll position for current path
    if (scrollBehavior === 'restore' && from.path) {
      scrollPositions.set(from.path, window.scrollY || 0);
    }

    // Resolve lazy components
    setNavigating(true);
    try {
      const resolvedComponents = [];
      for (const comp of to.components) {
        const resolved = resolveComponent(comp);
        if (resolved && typeof resolved.then === 'function') {
          resolvedComponents.push(await resolved);
        } else {
          resolvedComponents.push(resolved);
        }
      }
      to.components = resolvedComponents;
      to.component = resolvedComponents[resolvedComponents.length - 1] || null;
    } finally {
      setNavigating(false);
    }

    setRoute(to);

    // After guard
    if (afterEach) {
      try { afterEach(to, from); } catch (e) {
        if (globalThis.__DECANTR_DEV__) console.error('[decantr] Error in afterEach guard:', e);
      }
    }

    // Fire navigation listeners
    for (let i = 0; i < listeners.length; i++) listeners[i](to, from);

    // Focus management — move focus to main content for screen readers
    if (typeof document !== 'undefined') {
      const main = document.querySelector('[role="main"], main');
      if (main) {
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
      // Announce page change via live region
      const pageTitle = to.meta?.title || to.path;
      if (_liveRegion) _liveRegion.announce('Navigated to ' + pageTitle);
    }

    // Scroll handling
    if (scrollBehavior === 'top') {
      if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
    } else if (scrollBehavior === 'restore') {
      const saved = scrollPositions.get(to.path);
      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo(0, saved || 0);
      }
    }
  }

  // Listen to strategy events (back/forward buttons)
  const unlisten = strategy.listen(fullPath => {
    handleNavigation(stripBase(fullPath), { skipGuards: false });
  });

  /**
   * Programmatic navigation.
   * @param {string|{ name: string, params?: Object }} to
   * @param {{ replace?: boolean }} [opts]
   */
  function nav(to, opts = {}) {
    let path;
    if (typeof to === 'object' && to.name) {
      path = resolveNamedRoute(nameMap, to);
    } else {
      path = /** @type {string} */ (to);
    }
    validatePath(path);
    const fullPath = base + path;
    if (opts.replace) {
      strategy.replace(fullPath);
    } else {
      strategy.push(fullPath);
    }
    // Strategy listener triggers handleNavigation
  }

  function back() { window.history.back(); }
  function forward() { window.history.forward(); }

  /**
   * Create an outlet that renders the matched route's component chain.
   * Supports nested layouts via recursive outlet injection.
   * @param {number} [depth=0] — nesting depth (0 = root outlet)
   * @returns {HTMLElement}
   */
  function outlet(depth = 0) {
    const container = document.createElement('d-route');
    let currentNode = null;
    let currentComp = null;
    let currentDestroyFns = [];

    createEffect(() => {
      const r = route();
      const components = r.components || [];
      const comp = components[depth];
      const hasChild = depth + 1 < components.length;

      // Layout components: if the same component is still at this depth,
      // skip re-render — the child outlet handles its own updates
      if (hasChild && comp === currentComp && currentNode) return;

      const swap = () => {
        if (currentNode) {
          // Dispose reactive tree before DOM removal
          disposeNode(currentNode);
          // Run cleanup from previous component's onMount returns
          runDestroyFns(currentDestroyFns);
          currentDestroyFns = [];
          container.removeChild(currentNode);
          currentNode = null;
        }
        currentComp = comp;
        if (!comp) return;

        const args = hasChild
          ? { ...r.params, outlet: () => outlet(depth + 1) }
          : r.params;

        // untrack prevents signal reads during page init from subscribing
        // the outlet effect (e.g., Segmented reading value() at construction)
        let node;
        if (comp.__d_isComponent) {
          // component()-wrapped — creates its own root
          node = untrack(() => comp(args));
        } else {
          // Bare function — wrap in createRoot for automatic cleanup
          createRoot(() => {
            const owner = getOwner();
            node = untrack(() => comp(args));
            if (node && typeof node === 'object' && node.nodeType) {
              node.__d_owner = owner;
            }
          });
        }

        if (node) {
          currentNode = node;
          container.appendChild(currentNode);
          // Drain mount queue for lazy-loaded components (bypasses mount())
          const mountFns = drainMountQueue();
          for (const fn of mountFns) {
            const cleanup = fn();
            if (typeof cleanup === 'function') currentDestroyFns.push(cleanup);
          }
        }
      };

      if (useTransitions && typeof document !== 'undefined' &&
          document.startViewTransition && getAnimations()()) {
        document.startViewTransition(swap);
      } else {
        swap();
      }
    });

    return container;
  }

  /**
   * Subscribe to navigation events. Returns an unsubscribe function.
   * Fires after route change and afterEach guard.
   * @param {(to: Object, from: Object) => void} callback
   * @returns {() => void}
   */
  function onNavigate(callback) {
    listeners.push(callback);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  function destroy() {
    unlisten();
    if (_liveRegion) { _liveRegion.destroy(); _liveRegion = null; }
    if (activeRouter === router) activeRouter = null;
  }

  const router = { navigate: nav, outlet, current: route, path: () => route().path, destroy, onNavigate, nameMap, back, forward, isNavigating: navigating, _base: base };
  activeRouter = router;

  // Run initial navigation to apply guards on first load
  handleNavigation(initialFull, { skipGuards: false });

  return router;
}

/**
 * Navigate programmatically. Delegates to active router.
 * @param {string|{ name: string, params?: Object }} to
 * @param {{ replace?: boolean }} [opts]
 */
export function navigate(to, opts) {
  if (!activeRouter) throw new Error('No active router. Call createRouter() first.');
  activeRouter.navigate(to, opts);
}

/**
 * Create a router-aware anchor element with active link detection.
 * @param {{ href: string, activeClass?: string, exact?: boolean, class?: string }} props
 * @param {...any} children
 * @returns {HTMLAnchorElement}
 */
export function link(props, ...children) {
  const { href, activeClass, exact, ...rest } = props;
  validatePath(href);

  const cls = activeClass || 'd-link-active';

  const basePrefix = activeRouter ? activeRouter._base : '';
  const el = h('a', {
    ...rest,
    href: basePrefix + href,
    onclick(e) {
      e.preventDefault();
      navigate(href);
    }
  }, ...children);

  // Reactive active class
  if (activeRouter) {
    createEffect(() => {
      const r = activeRouter.current();
      const currentPath = r.path;
      const isActive = exact ? currentPath === href :
        (currentPath === href || currentPath.startsWith(href === '/' ? '/__never__' : href + '/'));
      // Special case: '/' only matches exactly unless !exact and href is not '/'
      const active = href === '/' ? currentPath === '/' : isActive;
      if (active) {
        el.classList.add(cls);
      } else {
        el.classList.remove(cls);
      }
    });
  }

  return el;
}

/**
 * Get current route signal.
 * The returned signal includes a `meta` field — an object merged from parent
 * routes down to the matched leaf. Parent meta is applied first, child meta
 * overrides. Example: `{ path: '/admin', meta: { requiresAuth: true, breadcrumb: 'Admin' }, component: AdminPage }`
 * @returns {() => { path: string, params: Object, query: Object, component: Function|null, components: Function[], matched: boolean, name?: string, meta: Object }}
 */
export function useRoute() {
  if (!activeRouter) throw new Error('No active router. Call createRouter() first.');
  return activeRouter.current;
}

/**
 * Reactive search params. Returns [getter, setter] tuple.
 * Getter returns URLSearchParams from current URL query string.
 * Setter updates query params without triggering full navigation.
 * @returns {[() => URLSearchParams, (params: Object|URLSearchParams) => void]}
 */
export function useSearchParams() {
  if (!activeRouter) throw new Error('No active router. Call createRouter() first.');

  const [params, setParams] = createSignal(new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || ''));

  // Track route changes to update search params
  createEffect(() => {
    const r = activeRouter.current();
    const sp = new URLSearchParams();
    if (r.query) {
      for (const [k, v] of Object.entries(r.query)) sp.set(k, v);
    }
    setParams(sp);
  });

  /**
   * Update search params in URL without navigation.
   * @param {Object|URLSearchParams} newParams
   */
  function setter(newParams) {
    const sp = newParams instanceof URLSearchParams ? newParams : new URLSearchParams();
    if (!(newParams instanceof URLSearchParams)) {
      for (const [k, v] of Object.entries(newParams)) sp.set(k, String(v));
    }
    const qs = sp.toString();
    const r = activeRouter.current();
    const basePath = activeRouter._base || '';
    const newPath = basePath + r.path + (qs ? '?' + qs : '');

    // Replace (not push) — query changes shouldn't create history entries
    if (window.location.hash) {
      // Hash mode
      const url = window.location.pathname + window.location.search + '#' + newPath;
      window.history.replaceState(null, '', url);
    } else {
      // History mode
      window.history.replaceState(null, '', newPath);
    }
    setParams(sp);
  }

  return [params, setter];
}

/**
 * Subscribe to navigation events on the active router. Returns an unsubscribe function.
 * @param {(to: Object, from: Object) => void} callback
 * @returns {() => void}
 */
export function onNavigate(callback) {
  if (!activeRouter) throw new Error('No active router. Call createRouter() first.');
  return activeRouter.onNavigate(callback);
}

/**
 * Navigate back in history. Delegates to active router.
 */
export function back() {
  if (!activeRouter) throw new Error('No active router. Call createRouter() first.');
  activeRouter.back();
}

/**
 * Navigate forward in history. Delegates to active router.
 */
export function forward() {
  if (!activeRouter) throw new Error('No active router. Call createRouter() first.');
  activeRouter.forward();
}

/**
 * Reactive boolean signal — true while lazy routes are resolving.
 * @returns {boolean}
 */
export function isNavigating() {
  if (!activeRouter) throw new Error('No active router. Call createRouter() first.');
  return activeRouter.isNavigating();
}
