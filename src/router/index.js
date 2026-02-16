import { createSignal, createEffect } from '../state/index.js';
import { h } from '../core/index.js';
import { hashStrategy } from './hash.js';
import { historyStrategy } from './history.js';

/** @type {ReturnType<typeof createRouter>|null} */
let activeRouter = null;

/**
 * @param {{ path: string }} route
 * @returns {{ regex: RegExp, keys: string[] }}
 */
function compileRoute(route) {
  const keys = [];
  const pattern = route.path
    .replace(/:([^/]+)/g, (_, key) => { keys.push(key); return '([^/]+)'; })
    .replace(/\*/g, '(.*)');
  return { regex: new RegExp(`^${pattern}$`), keys };
}

/**
 * @param {{ mode: 'hash'|'history', routes: Array<{path: string, component: Function}> }} config
 */
export function createRouter(config) {
  const strategy = config.mode === 'hash' ? hashStrategy : historyStrategy;
  const compiled = config.routes.map(r => ({
    ...r,
    ...compileRoute(r)
  }));

  const [path, setPath] = createSignal(strategy.current());
  const [route, setRoute] = createSignal(matchRoute(strategy.current()));

  function matchRoute(currentPath) {
    for (const r of compiled) {
      const match = currentPath.match(r.regex);
      if (match) {
        const params = {};
        r.keys.forEach((key, i) => { params[key] = match[i + 1]; });
        return { path: currentPath, params, component: r.component, matched: true };
      }
    }
    return { path: currentPath, params: {}, component: null, matched: false };
  }

  function handlePathChange(newPath) {
    setPath(newPath);
    setRoute(matchRoute(newPath));
  }

  const unlisten = strategy.listen(handlePathChange);

  function navigate(to) {
    strategy.push(to);
    // hash strategy triggers hashchange; history strategy triggers popstate
    // Both call handlePathChange via the listener
  }

  function outlet() {
    const container = document.createElement('d-route');
    let currentNode = null;

    createEffect(() => {
      const r = route();
      if (currentNode) {
        container.removeChild(currentNode);
        currentNode = null;
      }
      if (r.component) {
        currentNode = r.component(r.params);
        if (currentNode) container.appendChild(currentNode);
      }
    });

    return container;
  }

  function destroy() {
    unlisten();
    if (activeRouter === router) activeRouter = null;
  }

  const router = { navigate, outlet, current: route, path, destroy };
  activeRouter = router;
  return router;
}

/**
 * @param {{ href: string, class?: string }} props
 * @param {...any} children
 * @returns {HTMLAnchorElement}
 */
export function link(props, ...children) {
  const { href, ...rest } = props;
  const el = h('a', {
    ...rest,
    href,
    onclick(e) {
      e.preventDefault();
      navigate(href);
    }
  }, ...children);
  return el;
}

/**
 * @param {string} path
 */
export function navigate(path) {
  if (activeRouter) {
    activeRouter.navigate(path);
  }
}

/**
 * @returns {() => { path: string, params: Object, component: Function|null, matched: boolean }}
 */
export function useRoute() {
  if (activeRouter) return activeRouter.current;
  throw new Error('No active router. Call createRouter() first.');
}
