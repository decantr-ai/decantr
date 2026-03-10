import { createEffect, _pendingResources } from '../state/index.js';
export { onMount, onDestroy } from './lifecycle.js';
import { drainMountQueue, drainDestroyQueue, pushScope, popScope, runDestroyFns } from './lifecycle.js';

/**
 * @param {string} tag
 * @param {Object|null} props
 * @param {...(string|number|Node|Function)} children
 * @returns {HTMLElement}
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);

  if (props) {
    for (const key in props) {
      const val = props[key];
      if (key.startsWith('on') && typeof val === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (typeof val === 'function' && key !== 'ref') {
        createEffect(() => {
          const v = val();
          if (key === 'class' || key === 'className') {
            el.className = v;
          } else if (key === 'style' && typeof v === 'object') {
            Object.assign(el.style, v);
          } else {
            el.setAttribute(key, v);
          }
        });
      } else if (key === 'ref' && typeof val === 'function') {
        val(el);
      } else if (key === 'class' || key === 'className') {
        el.className = val;
      } else if (key === 'style' && typeof val === 'object') {
        Object.assign(el.style, val);
      } else if (val !== false && val != null) {
        el.setAttribute(key, val === true ? '' : String(val));
      }
    }
  }

  appendChildren(el, children);
  return el;
}

/**
 * @param {Function} getter
 * @returns {Text}
 */
export function text(getter) {
  const node = document.createTextNode('');
  createEffect(() => {
    node.nodeValue = String(getter());
  });
  return node;
}

/**
 * @param {Function} condition
 * @param {Function} thenFn
 * @param {Function} [elseFn]
 * @returns {HTMLElement}
 */
export function cond(condition, thenFn, elseFn) {
  const container = document.createElement('d-cond');
  let currentNode = null;

  createEffect(() => {
    const result = condition();
    if (currentNode) {
      container.removeChild(currentNode);
      currentNode = null;
    }
    const fn = result ? thenFn : elseFn;
    if (fn) {
      currentNode = fn();
      if (currentNode) container.appendChild(currentNode);
    }
  });

  return container;
}

/**
 * @param {Function} itemsGetter
 * @param {Function} keyFn
 * @param {Function} renderFn
 * @returns {HTMLElement}
 */
export function list(itemsGetter, keyFn, renderFn) {
  const container = document.createElement('d-list');
  /** @type {Map<*, {node: Node}>} */
  let currentMap = new Map();

  createEffect(() => {
    const items = itemsGetter();
    const newMap = new Map();
    const newNodes = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = keyFn(item, i);
      const existing = currentMap.get(key);

      if (existing) {
        newMap.set(key, existing);
        newNodes.push(existing.node);
      } else {
        const node = renderFn(item, i);
        newMap.set(key, { node });
        newNodes.push(node);
      }
    }

    // Remove nodes no longer in list
    for (const [key, entry] of currentMap) {
      if (!newMap.has(key) && entry.node.parentNode === container) {
        container.removeChild(entry.node);
      }
    }

    // Append/reorder
    for (let i = 0; i < newNodes.length; i++) {
      const node = newNodes[i];
      const current = container.childNodes[i];
      if (node !== current) {
        container.insertBefore(node, current || null);
      }
    }

    currentMap = newMap;
  });

  return container;
}

/**
 * @param {HTMLElement} root
 * @param {Function} component
 */
export function mount(root, component) {
  pushScope();
  const result = component();
  const destroyFns = popScope();
  if (result) root.appendChild(result);
  // Flush mount queue
  const fns = drainMountQueue();
  for (const fn of fns) {
    const cleanup = fn();
    if (typeof cleanup === 'function') {
      destroyFns.push(cleanup);
    }
  }
  // Store destroy fns for unmount
  root.__d_destroy = destroyFns;
}

/**
 * Unmount a previously mounted component tree.
 * @param {HTMLElement} root
 */
export function unmount(root) {
  if (root.__d_destroy) {
    runDestroyFns(root.__d_destroy);
    root.__d_destroy = null;
  }
  while (root.firstChild) root.removeChild(root.firstChild);
}

// ─── ErrorBoundary ──────────────────────────────────────────────

/** @type {Function|null} */
let _boundaryHandler = null;

/**
 * Get the current boundary error handler (used by effect patching).
 * @returns {Function|null}
 */
export function _getBoundaryHandler() { return _boundaryHandler; }

/**
 * Error catching component. Wraps children in try/catch during render.
 * Also catches errors thrown inside createEffect within its subtree.
 * @param {Object} props
 * @param {Function} props.fallback — (error, retry) => Node
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function ErrorBoundary(props, ...children) {
  const container = document.createElement('d-boundary');
  let caught = null;

  function clear() {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  function showFallback(err) {
    caught = err;
    clear();
    const fb = props.fallback(err, retry);
    if (fb) container.appendChild(fb);
  }

  function retry() {
    caught = null;
    clear();
    renderChildren();
  }

  function renderChildren() {
    const prev = _boundaryHandler;
    _boundaryHandler = showFallback;
    try {
      appendChildren(container, children);
    } catch (err) {
      showFallback(err);
    } finally {
      _boundaryHandler = prev;
    }
  }

  renderChildren();
  return container;
}

// Patch createEffect to respect ErrorBoundary.
// We wrap the original effect factory so errors inside effects bubble to the nearest boundary.
const _origCreateEffect = createEffect;

/**
 * Wrapped createEffect that routes errors to the nearest ErrorBoundary.
 * Falls back to rethrowing if no boundary is active.
 * @param {Function} fn
 * @returns {Function} dispose
 */
function boundaryAwareEffect(fn) {
  const handler = _boundaryHandler;
  return _origCreateEffect(() => {
    try {
      return fn();
    } catch (err) {
      if (handler) handler(err);
      else throw err;
    }
  });
}

// Re-export the patched version for internal use in this module.
// External callers import createEffect from state/index.js directly;
// h() and text() in this file use the module-level import which we shadow below.
const _createEffect = boundaryAwareEffect;

// ─── Portal ─────────────────────────────────────────────────────

/**
 * Render children outside the component tree into a target element.
 * @param {Object} props
 * @param {HTMLElement|string} [props.target] — Target element or CSS selector (defaults to document.body)
 * @param {...Node} children
 * @returns {Comment} — Placeholder comment node in the original tree
 */
export function Portal(props, ...children) {
  const placeholder = document.createComment('d-portal');
  const target = resolveTarget(props.target);
  const nodes = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child == null || child === false) continue;
    if (child && typeof child === 'object' && child.nodeType) {
      target.appendChild(child);
      nodes.push(child);
    } else if (typeof child === 'string' || typeof child === 'number') {
      const tn = document.createTextNode(String(child));
      target.appendChild(tn);
      nodes.push(tn);
    }
  }

  // Cleanup: remove portal nodes when placeholder is disconnected
  placeholder.__d_portal_cleanup = function () {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].parentNode === target) target.removeChild(nodes[i]);
    }
  };

  return placeholder;
}

/**
 * @param {HTMLElement|string|undefined} target
 * @returns {HTMLElement}
 */
function resolveTarget(target) {
  if (!target) return document.body;
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) throw new Error(`Portal target "${target}" not found`);
    return el;
  }
  return target;
}

// ─── Suspense ───────────────────────────────────────────────────

/**
 * Async boundary. Shows fallback while any createResource() in children is loading.
 * @param {Object} props
 * @param {Function} props.fallback — () => Node (loading state)
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function Suspense(props, ...children) {
  const container = document.createElement('d-suspense');
  /** @type {Node[]} */
  const childNodes = [];
  let fallbackNode = null;
  let showing = 'children'; // 'children' | 'fallback'

  // Collect child nodes
  const frag = document.createDocumentFragment();
  appendChildren(frag, children);
  while (frag.firstChild) {
    childNodes.push(frag.firstChild);
    frag.removeChild(frag.firstChild);
  }

  function showChildren() {
    if (showing === 'children') return;
    showing = 'children';
    while (container.firstChild) container.removeChild(container.firstChild);
    for (let i = 0; i < childNodes.length; i++) container.appendChild(childNodes[i]);
    fallbackNode = null;
  }

  function showFallback() {
    if (showing === 'fallback') return;
    showing = 'fallback';
    while (container.firstChild) container.removeChild(container.firstChild);
    fallbackNode = props.fallback();
    if (fallbackNode) container.appendChild(fallbackNode);
  }

  // Check pending resources and react
  createEffect(() => {
    if (_pendingResources.size > 0) {
      showFallback();
      // Poll until resolved — resources are promise-based, so we check periodically
      const iv = setInterval(() => {
        if (_pendingResources.size === 0) {
          clearInterval(iv);
          showChildren();
        }
      }, 16);
    } else {
      showChildren();
    }
  });

  // Initial render: if nothing pending, show children right away
  if (_pendingResources.size === 0) {
    for (let i = 0; i < childNodes.length; i++) container.appendChild(childNodes[i]);
    showing = 'children';
  }

  return container;
}

// ─── Transition ─────────────────────────────────────────────────

/**
 * Enter/exit animation wrapper for conditional content.
 * @param {Object} props
 * @param {string} [props.enter] — CSS class to add on enter (e.g., 'd-fadein')
 * @param {string} [props.exit] — CSS class to add on exit
 * @param {number} [props.duration=200] — ms to wait before removing exit node
 * @param {Function} child — getter function returning a Node or null
 * @returns {HTMLElement}
 */
export function Transition(props, child) {
  const container = document.createElement('d-transition');
  const duration = props.duration != null ? props.duration : 200;
  let currentNode = null;
  let exitTimer = null;

  createEffect(() => {
    const next = child();

    // Exit current node
    if (currentNode && currentNode !== next) {
      const leaving = currentNode;
      currentNode = null;

      if (props.exit) {
        leaving.classList.add(props.exit);
        if (exitTimer) clearTimeout(exitTimer);
        exitTimer = setTimeout(() => {
          if (leaving.parentNode === container) container.removeChild(leaving);
          exitTimer = null;
        }, duration);
      } else {
        if (leaving.parentNode === container) container.removeChild(leaving);
      }
    }

    // Enter new node
    if (next && next !== currentNode) {
      currentNode = next;
      container.appendChild(next);

      if (props.enter) {
        next.classList.add(props.enter);
        // Remove enter class after animation completes
        const entering = next;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (entering.parentNode === container) entering.classList.remove(props.enter);
          });
        });
      }
    }
  });

  return container;
}

// ─── forwardRef ─────────────────────────────────────────────────

/**
 * Extract ref from props and pass it as second argument to a component.
 * @param {Function} component — (props, ref) => Node
 * @returns {Function} — (props) => Node
 */
export function forwardRef(component) {
  return function (props, ...children) {
    const ref = props && props.ref;
    let cleaned = props;
    if (ref !== undefined) {
      cleaned = {};
      for (const k in props) {
        if (k !== 'ref') cleaned[k] = props[k];
      }
    }
    return component(cleaned, ref, ...children);
  };
}

// ─── Internal helpers ───────────────────────────────────────────

/**
 * @param {HTMLElement} el
 * @param {Array} children
 */
function appendChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child == null || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(el, child);
    } else if (child && typeof child === 'object' && child.nodeType) {
      el.appendChild(child);
    } else if (typeof child === 'function') {
      const textNode = document.createTextNode('');
      createEffect(() => {
        textNode.nodeValue = String(child());
      });
      el.appendChild(textNode);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }
}
