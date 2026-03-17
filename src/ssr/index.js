/**
 * Decantr SSR — Server-Side Rendering + Hydration
 *
 * Separate entry point that works in Node.js without DOM globals.
 * renderToString/renderToStream build a VNode tree and serialize to HTML.
 * hydrate() walks existing DOM and attaches signal bindings + event listeners.
 *
 * IMPORTANT: This module must NOT import `document` at module level.
 * renderToString and renderToStream work in pure Node.js.
 * hydrate() requires a browser environment (it operates on existing DOM).
 */

import { resolveAtomDecl, ALIASES } from '../css/atoms.js';

// ─── SSR Atom Resolution (no DOM injection) ────────────────────

/**
 * Resolve atom classes for SSR without injecting CSS into DOM.
 * Mirrors the logic of css() from ../css/index.js but skips inject().
 * @param {...string} classes
 * @returns {string}
 */
function ssrCss(...classes) {
  const result = [];
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    if (!cls) continue;
    const parts = cls.split(/\s+/);
    for (const part of parts) {
      if (!part) continue;
      if (part === '_group') { result.push('d-group'); continue; }
      if (part === '_peer') { result.push('d-peer'); continue; }
      // For SSR we pass through all class names — CSS is extracted at build time
      // or injected by the client-side runtime during hydration.
      result.push(part);
    }
  }
  return result.join(' ');
}

// ─── HTML Escaping ──────────────────────────────────────────────

/**
 * Escape HTML special characters in text content.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape HTML special characters in attribute values.
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── VNode Types ────────────────────────────────────────────────

/**
 * @typedef {{ tag: string, props: Object|null, children: Array<VNode|TextVNode|string>, _id: number }} VNode
 * @typedef {{ text: string, _id: number }} TextVNode
 */

/** HTML void elements — self-closing, no children */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** Boolean HTML attributes — rendered as `attr` not `attr="value"` */
const BOOLEAN_ATTRS = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked',
  'controls', 'default', 'defer', 'disabled', 'formnovalidate',
  'hidden', 'inert', 'ismap', 'itemscope', 'loop', 'multiple',
  'muted', 'nomodule', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected',
]);

// ─── SSR Context ────────────────────────────────────────────────

/** Global VNode ID counter — reset per render call */
let _nextId = 0;

/** Whether we are currently inside an SSR render pass */
let _ssrActive = false;

/**
 * Evaluate a value without triggering signal subscriptions.
 * In SSR mode signals are evaluated eagerly without tracking.
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function ssrUntrack(fn) {
  // In SSR we don't have reactive tracking, so just call the function
  return fn();
}

// ─── SSR Primitives ─────────────────────────────────────────────

/**
 * SSR version of h() — creates a VNode, not a DOM element.
 * Event handlers (on*) are stored but not serialized to HTML.
 * Functions in props are eagerly evaluated with ssrUntrack().
 * @param {string} tag
 * @param {Object|null} props
 * @param {...*} children
 * @returns {VNode}
 */
function ssrH(tag, props, ...children) {
  const id = _nextId++;
  const resolvedProps = {};
  const handlers = {};

  if (props) {
    for (const key in props) {
      const val = props[key];

      // Event handlers — store separately, do not serialize
      if (key.startsWith('on') && typeof val === 'function') {
        handlers[key] = val;
        continue;
      }

      // ref callbacks — skip in SSR
      if (key === 'ref') continue;

      // Reactive props — evaluate eagerly
      if (typeof val === 'function') {
        const evaluated = ssrUntrack(val);
        if (key === 'class' || key === 'className') {
          resolvedProps['class'] = evaluated;
        } else if (key === 'style' && typeof evaluated === 'object') {
          resolvedProps['style'] = styleObjToString(evaluated);
        } else if (evaluated !== false && evaluated != null) {
          resolvedProps[key] = evaluated === true ? true : String(evaluated);
        }
      } else if (key === 'class' || key === 'className') {
        resolvedProps['class'] = val;
      } else if (key === 'style' && typeof val === 'object') {
        resolvedProps['style'] = styleObjToString(val);
      } else if (val !== false && val != null) {
        resolvedProps[key] = val === true ? true : String(val);
      }
    }
  }

  // Flatten children
  const flatChildren = flattenChildren(children);

  return {
    tag,
    props: resolvedProps,
    children: flatChildren,
    _handlers: handlers,
    _id: id,
  };
}

/**
 * SSR version of text() — evaluates getter once, returns TextVNode.
 * @param {Function} getter
 * @returns {TextVNode}
 */
function ssrText(getter) {
  const id = _nextId++;
  const value = ssrUntrack(getter);
  return { text: String(value), _id: id, _reactive: true };
}

/**
 * SSR version of cond() — evaluates predicate once, returns the active branch.
 * Wraps result in a d-cond VNode for hydration matching.
 * @param {Function} condition
 * @param {Function} thenFn
 * @param {Function} [elseFn]
 * @returns {VNode}
 */
function ssrCond(condition, thenFn, elseFn) {
  const id = _nextId++;
  const result = ssrUntrack(condition);
  const fn = result ? thenFn : elseFn;
  const child = fn ? fn() : null;
  const children = child != null ? [normalizeVNode(child)] : [];

  return {
    tag: 'd-cond',
    props: {},
    children,
    _handlers: {},
    _id: id,
  };
}

/**
 * SSR version of list() — evaluates items once, maps through renderFn.
 * Wraps result in a d-list VNode for hydration matching.
 * @param {Function} itemsGetter
 * @param {Function} keyFn
 * @param {Function} renderFn
 * @returns {VNode}
 */
function ssrList(itemsGetter, keyFn, renderFn) {
  const id = _nextId++;
  const items = ssrUntrack(itemsGetter);
  const children = [];

  if (Array.isArray(items)) {
    for (let i = 0; i < items.length; i++) {
      const child = renderFn(items[i], i);
      if (child != null) {
        children.push(normalizeVNode(child));
      }
    }
  }

  return {
    tag: 'd-list',
    props: {},
    children,
    _handlers: {},
    _id: id,
  };
}

/**
 * SSR-safe onMount — no-op during SSR (mount callbacks don't run on server).
 * @param {Function} _fn
 */
function ssrOnMount(_fn) {
  // No-op in SSR — mount callbacks run only on client
}

/**
 * SSR-safe onDestroy — no-op during SSR.
 * @param {Function} _fn
 */
function ssrOnDestroy(_fn) {
  // No-op in SSR — destroy callbacks run only on client
}

// ─── VNode Helpers ──────────────────────────────────────────────

/**
 * Normalize a value into a VNode or TextVNode.
 * @param {*} value
 * @returns {VNode|TextVNode|null}
 */
function normalizeVNode(value) {
  if (value == null || value === false) return null;
  if (typeof value === 'object' && (value.tag || value.text !== undefined)) return value;
  if (typeof value === 'function') {
    // Reactive text — evaluate eagerly
    const text = String(ssrUntrack(value));
    return { text, _id: _nextId++, _reactive: true };
  }
  return { text: String(value), _id: _nextId++ };
}

/**
 * Flatten nested arrays and normalize children to VNodes.
 * @param {Array} children
 * @returns {Array<VNode|TextVNode>}
 */
function flattenChildren(children) {
  const result = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child == null || child === false) continue;
    if (Array.isArray(child)) {
      const flat = flattenChildren(child);
      for (let j = 0; j < flat.length; j++) result.push(flat[j]);
    } else {
      const normalized = normalizeVNode(child);
      if (normalized) result.push(normalized);
    }
  }
  return result;
}

/**
 * Convert a style object to a CSS string.
 * @param {Object} obj
 * @returns {string}
 */
function styleObjToString(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const parts = [];
  for (const key in obj) {
    const value = obj[key];
    if (value == null) continue;
    // Convert camelCase to kebab-case
    const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
    parts.push(`${cssKey}:${value}`);
  }
  return parts.join(';');
}

// ─── VNode Serialization ────────────────────────────────────────

/**
 * Serialize a VNode tree to an HTML string.
 * @param {VNode|TextVNode|null} node
 * @returns {string}
 */
function serializeVNode(node) {
  if (!node) return '';

  // Text node
  if (node.text !== undefined) {
    return escapeHTML(node.text);
  }

  const { tag, props, children, _id } = node;

  // Build opening tag
  let html = '<' + tag;

  // Add hydration marker
  html += ` data-d-id="${_id}"`;

  // Serialize attributes
  if (props) {
    for (const key in props) {
      const val = props[key];
      if (val == null || val === false) continue;

      if (BOOLEAN_ATTRS.has(key)) {
        if (val) html += ' ' + key;
      } else {
        html += ` ${key}="${escapeAttr(String(val))}"`;
      }
    }
  }

  // Void element — self-closing
  if (VOID_ELEMENTS.has(tag)) {
    return html + '>';
  }

  html += '>';

  // Serialize children
  for (let i = 0; i < children.length; i++) {
    html += serializeVNode(children[i]);
  }

  html += '</' + tag + '>';
  return html;
}

/**
 * Yield VNode chunks for streaming.
 * @param {VNode|TextVNode|null} node
 * @param {function(string): void} push — called for each chunk
 */
function streamVNode(node, push) {
  if (!node) return;

  // Text node
  if (node.text !== undefined) {
    push(escapeHTML(node.text));
    return;
  }

  const { tag, props, children, _id } = node;

  // Build opening tag
  let html = '<' + tag;
  html += ` data-d-id="${_id}"`;

  if (props) {
    for (const key in props) {
      const val = props[key];
      if (val == null || val === false) continue;
      if (BOOLEAN_ATTRS.has(key)) {
        if (val) html += ' ' + key;
      } else {
        html += ` ${key}="${escapeAttr(String(val))}"`;
      }
    }
  }

  if (VOID_ELEMENTS.has(tag)) {
    push(html + '>');
    return;
  }

  push(html + '>');

  // Stream children
  for (let i = 0; i < children.length; i++) {
    streamVNode(children[i], push);
  }

  push('</' + tag + '>');
}

// ─── SSR Execution Context ──────────────────────────────────────

/**
 * Execute a function with SSR versions of h, text, cond, list, onMount, onDestroy.
 * Uses import indirection: components call the SSR versions when _ssrActive is true.
 *
 * @template T
 * @param {Function} componentFn — () => VNode tree
 * @returns {VNode|TextVNode|null}
 */
function runInSSRContext(componentFn) {
  _nextId = 0;
  _ssrActive = true;

  // Store original globals if they exist
  const prevH = globalThis.__d_ssr_h;
  const prevText = globalThis.__d_ssr_text;
  const prevCond = globalThis.__d_ssr_cond;
  const prevList = globalThis.__d_ssr_list;
  const prevCss = globalThis.__d_ssr_css;
  const prevOnMount = globalThis.__d_ssr_onMount;
  const prevOnDestroy = globalThis.__d_ssr_onDestroy;
  const prevActive = globalThis.__d_ssr_active;

  // Install SSR implementations on globalThis
  globalThis.__d_ssr_h = ssrH;
  globalThis.__d_ssr_text = ssrText;
  globalThis.__d_ssr_cond = ssrCond;
  globalThis.__d_ssr_list = ssrList;
  globalThis.__d_ssr_css = ssrCss;
  globalThis.__d_ssr_onMount = ssrOnMount;
  globalThis.__d_ssr_onDestroy = ssrOnDestroy;
  globalThis.__d_ssr_active = true;

  try {
    const result = componentFn();
    return normalizeVNode(result);
  } finally {
    _ssrActive = false;

    // Restore previous values
    globalThis.__d_ssr_h = prevH;
    globalThis.__d_ssr_text = prevText;
    globalThis.__d_ssr_cond = prevCond;
    globalThis.__d_ssr_list = prevList;
    globalThis.__d_ssr_css = prevCss;
    globalThis.__d_ssr_onMount = prevOnMount;
    globalThis.__d_ssr_onDestroy = prevOnDestroy;
    globalThis.__d_ssr_active = prevActive;
  }
}

// ─── Public API: renderToString ─────────────────────────────────

/**
 * Render a component to an HTML string.
 *
 * The component function is called in an SSR context where:
 * - h() creates VNodes instead of DOM elements
 * - text() evaluates getters once without reactive tracking
 * - cond()/list() evaluate eagerly without creating effects
 * - onMount()/onDestroy() are no-ops
 * - Signals are read once without subscriptions
 *
 * Each element includes a `data-d-id` attribute for hydration matching.
 *
 * @param {Function} component — component function that returns a VNode tree
 * @returns {string} HTML string
 */
export function renderToString(component) {
  const vnode = runInSSRContext(component);
  return serializeVNode(vnode);
}

// ─── Public API: renderToStream ─────────────────────────────────

/**
 * Render a component to a ReadableStream of HTML chunks.
 *
 * Same SSR semantics as renderToString but yields chunks incrementally.
 * Uses the Web Streams API (available in Node.js 18+).
 *
 * @param {Function} component — component function that returns a VNode tree
 * @returns {ReadableStream}
 */
export function renderToStream(component) {
  // Build VNode tree synchronously (same as renderToString)
  const vnode = runInSSRContext(component);

  return new ReadableStream({
    start(controller) {
      try {
        streamVNode(vnode, chunk => {
          controller.enqueue(chunk);
        });
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    }
  });
}

// ─── Public API: hydrate ────────────────────────────────────────

/**
 * Hydrate an existing DOM tree produced by renderToString/renderToStream.
 *
 * This function:
 * 1. Runs the component function in client mode (creates real DOM structures)
 * 2. Walks existing DOM in parallel with component output
 * 3. Reuses existing DOM nodes instead of creating new ones
 * 4. Attaches event listeners, signal subscriptions, and reactive effects
 * 5. Drains the onMount queue
 *
 * The existing DOM must match the component's initial render output structurally.
 * Matching is done by position (depth-first walk), not by data-d-id.
 *
 * @param {HTMLElement} root — the DOM root containing SSR HTML
 * @param {Function} component — the same component function used for SSR
 */
export function hydrate(root, component) {
  // Dynamically import core/state to avoid loading DOM globals at module level
  // These must be available in the browser environment when hydrate() is called
  const { createEffect } = _requireState();
  const { pushScope, popScope, drainMountQueue, runDestroyFns } = _requireLifecycle();

  pushScope();

  // Run the component in client mode to get the real DOM tree
  const clientTree = component();

  const destroyFns = popScope();

  // Walk the existing SSR DOM and the client-produced DOM in parallel
  // to attach event listeners and reactive bindings
  if (clientTree && root.firstChild) {
    _hydrateNode(root.firstChild, clientTree, root, createEffect);
  } else if (clientTree && !root.firstChild) {
    // SSR HTML is empty but client produced content — append it
    root.appendChild(clientTree);
  }

  // Drain mount queue
  const mountFns = drainMountQueue();
  for (const fn of mountFns) {
    const cleanup = fn();
    if (typeof cleanup === 'function') {
      destroyFns.push(cleanup);
    }
  }

  // Store destroy functions for unmount
  root.__d_destroy = destroyFns;
}

// ─── Hydration Walker ───────────────────────────────────────────

/**
 * Hydrate a single DOM node by reconciling it with the client-produced node.
 * Attaches event listeners and reactive bindings from the client node
 * onto the existing server-rendered DOM node.
 *
 * @param {Node} ssrNode — existing DOM node from SSR
 * @param {Node} clientNode — freshly created DOM node from client render
 * @param {Node} parent — parent of ssrNode
 * @param {Function} createEffect — reactive effect factory
 */
function _hydrateNode(ssrNode, clientNode, parent, createEffect) {
  if (!ssrNode || !clientNode) return;

  // Text node hydration
  if (ssrNode.nodeType === 3 && clientNode.nodeType === 3) {
    // If the client text node has reactive effects attached via createEffect,
    // they will update ssrNode.nodeValue when signals change.
    // We need to "redirect" client effects to update the SSR node instead.
    // The simplest approach: copy any pending reactive subscription.
    // Since the client node was created by text() which uses createEffect internally,
    // the effect already observes the signal. We just need to ensure updates
    // target the SSR node. We do this by patching nodeValue.
    if (clientNode.nodeValue !== ssrNode.nodeValue) {
      // Initial value mismatch — use client value (more recent)
      ssrNode.nodeValue = clientNode.nodeValue;
    }

    // Redirect reactive updates: any effect that sets clientNode.nodeValue
    // should instead set ssrNode.nodeValue. We achieve this by making
    // clientNode.nodeValue a proxy to ssrNode.
    _redirectTextUpdates(ssrNode, clientNode);
    return;
  }

  // Element node hydration
  if (ssrNode.nodeType === 1 && clientNode.nodeType === 1) {
    // Attach event listeners from the client node to the SSR node
    if (clientNode._listeners) {
      for (const [type, fns] of clientNode._listeners) {
        for (const fn of fns) {
          ssrNode.addEventListener(type, fn);
        }
      }
    }

    // Copy over any special properties the client-side h() set up
    // (reactive class, reactive attributes, etc.)
    // The client-side createEffect calls will be trying to update clientNode.
    // We redirect them to ssrNode.
    _redirectElementUpdates(ssrNode, clientNode, createEffect);

    // Recursively hydrate children
    const ssrChildren = ssrNode.childNodes || [];
    const clientChildren = clientNode.childNodes || [];
    const maxLen = Math.max(ssrChildren.length, clientChildren.length);

    for (let i = 0; i < maxLen; i++) {
      const ssrChild = ssrChildren[i];
      const clientChild = clientChildren[i];

      if (ssrChild && clientChild) {
        _hydrateNode(ssrChild, clientChild, ssrNode, createEffect);
      } else if (!ssrChild && clientChild) {
        // Client has extra node — append it (SSR missed it)
        ssrNode.appendChild(clientChild);
      }
      // If SSR has extra node but client doesn't — leave it (stale SSR content)
    }

    return;
  }

  // Comment node (e.g., Portal placeholder) — skip
  if (ssrNode.nodeType === 8) return;
}

/**
 * Redirect text node updates from client node to SSR node.
 * When createEffect updates clientNode.nodeValue, the update
 * should also apply to ssrNode.
 *
 * @param {Text} ssrNode
 * @param {Text} clientNode
 */
function _redirectTextUpdates(ssrNode, clientNode) {
  // Observe changes to clientNode.nodeValue and mirror them to ssrNode
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(clientNode), 'nodeValue'
  ) || Object.getOwnPropertyDescriptor(clientNode, 'nodeValue');

  if (originalDescriptor && originalDescriptor.set) {
    // If nodeValue is a setter (real DOM), intercept writes
    Object.defineProperty(clientNode, 'nodeValue', {
      get() {
        return ssrNode.nodeValue;
      },
      set(v) {
        ssrNode.nodeValue = v;
      },
      configurable: true,
    });
  } else {
    // In test environments, nodeValue is a plain property.
    // Use polling or direct assignment check.
    // For simplicity in test DOM: replace clientNode in parent with ssrNode
    // The effects that reference clientNode should be updated.
    // Actually, in the test DOM nodeValue is just a field.
    // We can define a setter on the instance.
    let _val = clientNode.nodeValue;
    Object.defineProperty(clientNode, 'nodeValue', {
      get() { return ssrNode.nodeValue; },
      set(v) { ssrNode.nodeValue = v; },
      configurable: true,
    });
  }
}

/**
 * Redirect element property updates from client node to SSR node.
 * This covers reactive className, setAttribute, style updates
 * that createEffect applies to the client-created element.
 *
 * @param {Element} ssrNode
 * @param {Element} clientNode
 * @param {Function} createEffect
 */
function _redirectElementUpdates(ssrNode, clientNode, createEffect) {
  // Intercept className writes
  const classDesc = Object.getOwnPropertyDescriptor(clientNode, 'className') ||
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(clientNode), 'className');

  Object.defineProperty(clientNode, 'className', {
    get() { return ssrNode.className; },
    set(v) { ssrNode.className = v; },
    configurable: true,
  });

  // Intercept setAttribute calls
  const origSetAttribute = clientNode.setAttribute;
  if (origSetAttribute) {
    clientNode.setAttribute = function(name, value) {
      ssrNode.setAttribute(name, value);
    };
  }

  // Intercept style assignments
  if (clientNode.style && ssrNode.style) {
    const ssrStyle = ssrNode.style;
    clientNode.style = new Proxy(ssrStyle, {
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
      get(target, prop) {
        return target[prop];
      }
    });
  }
}

// ─── Lazy Module Resolution ─────────────────────────────────────
// These helpers lazily import core modules so that the SSR entry point
// does not pull in DOM-dependent code at module level.

let _stateModule = null;
let _lifecycleModule = null;

/**
 * @returns {{ createEffect: Function }}
 */
function _requireState() {
  // When hydrate() is called in the browser, the state module is available.
  // We import it lazily to avoid loading it during SSR (server-side).
  if (!_stateModule) {
    // In a browser/test environment, this will be available via the module graph
    // We use a dynamic technique to avoid static analysis pulling it into SSR bundles
    try {
      // For Node.js test environments that have already loaded the module
      _stateModule = { createEffect: globalThis.__d_state_createEffect };
      if (!_stateModule.createEffect) {
        throw new Error('Not cached');
      }
    } catch {
      // Fallback: assume the module has been loaded and is available
      _stateModule = { createEffect: function(fn) { fn(); return () => {}; } };
    }
  }
  return _stateModule;
}

/**
 * @returns {{ pushScope: Function, popScope: Function, drainMountQueue: Function, runDestroyFns: Function }}
 */
function _requireLifecycle() {
  if (!_lifecycleModule) {
    try {
      _lifecycleModule = {
        pushScope: globalThis.__d_lifecycle_pushScope,
        popScope: globalThis.__d_lifecycle_popScope,
        drainMountQueue: globalThis.__d_lifecycle_drainMountQueue,
        runDestroyFns: globalThis.__d_lifecycle_runDestroyFns,
      };
      if (!_lifecycleModule.pushScope) throw new Error('Not cached');
    } catch {
      // Fallback no-ops for environments where lifecycle isn't loaded
      _lifecycleModule = {
        pushScope: () => {},
        popScope: () => [],
        drainMountQueue: () => [],
        runDestroyFns: () => {},
      };
    }
  }
  return _lifecycleModule;
}

// ─── Hydration Bootstrap ────────────────────────────────────────

/**
 * Install hydration helpers that make core modules available to hydrate().
 * Call this once on the client before calling hydrate().
 *
 * @param {{ createEffect: Function }} stateMod — the state module
 * @param {{ pushScope: Function, popScope: Function, drainMountQueue: Function, runDestroyFns: Function }} lifecycleMod — lifecycle module
 */
export function installHydrationRuntime(stateMod, lifecycleMod) {
  _stateModule = stateMod;
  _lifecycleModule = lifecycleMod;

  // Also set globals for lazy resolution
  if (stateMod.createEffect) globalThis.__d_state_createEffect = stateMod.createEffect;
  if (lifecycleMod.pushScope) globalThis.__d_lifecycle_pushScope = lifecycleMod.pushScope;
  if (lifecycleMod.popScope) globalThis.__d_lifecycle_popScope = lifecycleMod.popScope;
  if (lifecycleMod.drainMountQueue) globalThis.__d_lifecycle_drainMountQueue = lifecycleMod.drainMountQueue;
  if (lifecycleMod.runDestroyFns) globalThis.__d_lifecycle_runDestroyFns = lifecycleMod.runDestroyFns;
}

// ─── Direct SSR Builders (for components using SSR directly) ────

/**
 * Check if we're currently in SSR mode.
 * Components can use this to branch between SSR and client rendering.
 * @returns {boolean}
 */
export function isSSR() {
  return _ssrActive || !!globalThis.__d_ssr_active;
}

/**
 * Get the SSR-safe h() function.
 * Returns ssrH during SSR, null otherwise.
 * @returns {Function|null}
 */
export function getSSRH() {
  return _ssrActive ? ssrH : (globalThis.__d_ssr_h || null);
}

/**
 * Get the SSR-safe text() function.
 * Returns ssrText during SSR, null otherwise.
 * @returns {Function|null}
 */
export function getSSRText() {
  return _ssrActive ? ssrText : (globalThis.__d_ssr_text || null);
}

/**
 * Get the SSR-safe cond() function.
 * @returns {Function|null}
 */
export function getSSRCond() {
  return _ssrActive ? ssrCond : (globalThis.__d_ssr_cond || null);
}

/**
 * Get the SSR-safe list() function.
 * @returns {Function|null}
 */
export function getSSRList() {
  return _ssrActive ? ssrList : (globalThis.__d_ssr_list || null);
}

/**
 * Get the SSR-safe css() function.
 * @returns {Function|null}
 */
export function getSSRCss() {
  return _ssrActive ? ssrCss : (globalThis.__d_ssr_css || null);
}

// ─── SSR Component Wrapper ──────────────────────────────────────

/**
 * Create an SSR-compatible component that works in both server and client contexts.
 * Returns a wrapper that delegates to SSR primitives during renderToString
 * and to normal DOM primitives in the browser.
 *
 * Usage:
 * ```js
 * import { ssrComponent } from 'decantr/ssr';
 *
 * const MyComponent = ssrComponent((h, text, cond, list, css) => {
 *   return (props) => h('div', { class: css('_flex _p4') }, text(() => props.title));
 * });
 * ```
 *
 * @param {Function} factory — (h, text, cond, list, css) => componentFn
 * @returns {Function}
 */
export function ssrComponent(factory) {
  return function(...args) {
    if (isSSR()) {
      const impl = factory(ssrH, ssrText, ssrCond, ssrList, ssrCss);
      return impl(...args);
    }
    // In client mode, we need the real implementations
    // They should be imported normally by the consuming code
    throw new Error(
      'ssrComponent() called in client mode without real implementations. ' +
      'Import h, text, cond, list, css directly for client rendering.'
    );
  };
}

// ─── Exported SSR Primitives ────────────────────────────────────

// Export SSR primitives for direct use in universal components
export {
  ssrH,
  ssrText,
  ssrCond,
  ssrList,
  ssrCss,
  ssrOnMount,
  ssrOnDestroy,
};

// Export internals for testing
export const _internals = {
  serializeVNode,
  streamVNode,
  flattenChildren,
  normalizeVNode,
  escapeHTML,
  escapeAttr,
  styleObjToString,
  VOID_ELEMENTS,
  BOOLEAN_ATTRS,
  _hydrateNode,
  _redirectTextUpdates,
  _redirectElementUpdates,
  runInSSRContext,
};
