import type { Child } from '../types.js';
import { createEffect, createSignal } from '../state/index.js';
import { disposeNode } from './component.js';
export { onMount, onDestroy, onCleanup } from './lifecycle.js';
export { component } from './component.js';
export { disposeNode };
export { Show } from './show.js';
export { For } from './for.js';
export { injectCSS, isInjected, resetCSS } from './css-inject.js';
import { drainMountQueue, drainDestroyQueue, pushScope, popScope, runDestroyFns } from './lifecycle.js';

// Augment HTMLElement for internal __d_destroy storage
declare global {
  interface HTMLElement {
    __d_destroy?: Array<() => void> | null;
    __d_owner?: any;
  }
  interface Comment {
    __d_portal_cleanup?: () => void;
  }
  // eslint-disable-next-line no-var
  var __DECANTR_DEV__: boolean | undefined;
  var __d_hmr_remount: ((modulePath: string, newModule: { default?: () => HTMLElement }) => void) | undefined;
  var __d_hmr_register: ((modulePath: string, root: HTMLElement) => void) | undefined;
}

export function h(tag: string, props?: Record<string, unknown> | null, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);

  if (props) {
    for (const key in props) {
      const val = props[key];
      if (key.startsWith('on') && typeof val === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), val as EventListener);
      } else if (typeof val === 'function' && key !== 'ref') {
        createEffect(() => {
          const v = (val as () => unknown)();
          if (key === 'class' || key === 'className') {
            el.className = v as string;
          } else if (key === 'style' && typeof v === 'object') {
            Object.assign(el.style, v);
          } else {
            el.setAttribute(key, v as string);
          }
        });
      } else if (key === 'ref' && typeof val === 'function') {
        (val as (el: HTMLElement) => void)(el);
      } else if (key === 'class' || key === 'className') {
        el.className = val as string;
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

export function text(getter: string | (() => string)): Text {
  const fn = typeof getter === 'function' ? getter : () => getter;
  const node = document.createTextNode('');
  createEffect(() => {
    node.nodeValue = String(fn());
  });
  return node;
}

export function mount(root: HTMLElement, component: () => HTMLElement): void {
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

/** Unmount a previously mounted component tree. */
export function unmount(root: HTMLElement): void {
  if (root.__d_destroy) {
    runDestroyFns(root.__d_destroy);
    root.__d_destroy = null;
  }
  while (root.firstChild) root.removeChild(root.firstChild);
}

// ─── Dev-mode HMR remount hook ──────────────────────────────────
// Zero cost in production — entire block gated behind __DECANTR_DEV__

if (typeof globalThis !== 'undefined' && globalThis.__DECANTR_DEV__) {
  const _hmrRoots = new Map<string, HTMLElement>();

  globalThis.__d_hmr_remount = function(modulePath: string, newModule: { default?: () => HTMLElement }) {
    const root = _hmrRoots.get(modulePath);
    if (root && newModule.default) {
      unmount(root);
      mount(root, newModule.default);
      console.log('[decantr hmr] Updated:', modulePath);
    } else if (newModule.default) {
      const appRoot = document.getElementById('app');
      if (appRoot) {
        unmount(appRoot);
        mount(appRoot, newModule.default);
        console.log('[decantr hmr] Remounted app for:', modulePath);
      }
    }
  };

  globalThis.__d_hmr_register = function(modulePath: string, root: HTMLElement) {
    _hmrRoots.set(modulePath, root);
  };
}

// ─── Error Telemetry ────────────────────────────────────────────

interface ErrorInfo {
  error: Error;
  component: string | null;
  stack: string | null;
  context: Record<string, unknown>;
}

let _errorHandler: ((info: ErrorInfo) => void) | null = null;

/**
 * Set a global error telemetry handler.
 * Called whenever an ErrorBoundary catches an error.
 */
export function setErrorHandler(fn: ((info: ErrorInfo) => void) | null): void {
  _errorHandler = typeof fn === 'function' ? fn : null;
}

/** Get the current error telemetry handler (for testing/internal use). */
export function _getErrorHandler(): ((info: ErrorInfo) => void) | null { return _errorHandler; }

// ─── ErrorBoundary ──────────────────────────────────────────────

let _boundaryHandler: ((err: unknown) => void) | null = null;

/** Get the current boundary error handler (used by effect patching). */
export function _getBoundaryHandler(): ((err: unknown) => void) | null { return _boundaryHandler; }

interface ErrorBoundaryProps {
  fallback: (error: unknown, retry: () => void) => Node;
  name?: string;
  context?: Record<string, unknown>;
}

/**
 * Error catching component. Wraps children in try/catch during render.
 * Also catches errors thrown inside createEffect within its subtree.
 */
export function ErrorBoundary(props: ErrorBoundaryProps, ...children: Child[]): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'contents';
  let caught: unknown = null;

  function clear(): void {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  function showFallback(err: unknown): void {
    caught = err;
    if (_errorHandler) {
      try {
        _errorHandler({
          error: err instanceof Error ? err : new Error(String(err)),
          component: props.name || null,
          stack: err instanceof Error ? err.stack || null : null,
          context: props.context || {}
        });
      } catch (_) {
        // Telemetry handler must never break the boundary
      }
    }
    clear();
    const fb = props.fallback(err, retry);
    if (fb) container.appendChild(fb);
  }

  function retry(): void {
    caught = null;
    clear();
    renderChildren();
  }

  function renderChildren(): void {
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
const _origCreateEffect = createEffect;

function boundaryAwareEffect(fn: () => void | (() => void)): () => void {
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
const _createEffect = boundaryAwareEffect;

// ─── Portal ─────────────────────────────────────────────────────

interface PortalProps {
  target?: HTMLElement | string;
}

/**
 * Render children outside the component tree into a target element.
 */
export function Portal(props: PortalProps, ...children: Child[]): Comment {
  const placeholder = document.createComment('d-portal');
  const target = resolveTarget(props.target);
  const nodes: Node[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child == null || child === false) continue;
    if (child && typeof child === 'object' && (child as Node).nodeType) {
      target.appendChild(child as Node);
      nodes.push(child as Node);
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

function resolveTarget(target: HTMLElement | string | undefined): HTMLElement {
  if (!target) return document.body;
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) throw new Error(`Portal target "${target}" not found`);
    return el as HTMLElement;
  }
  return target;
}

// ─── Suspense ───────────────────────────────────────────────────

const [_pendingCount, _setPendingCount] = createSignal(0);

/**
 * Track an async operation for Suspense boundaries.
 * Call this when starting an async operation that Suspense should wait for.
 */
export function trackPending(promise: Promise<unknown>): void {
  _setPendingCount(c => c + 1);
  promise.finally(() => _setPendingCount(c => c - 1));
}

interface SuspenseProps {
  fallback: () => Node;
}

/**
 * Async boundary. Shows fallback while any createQuery() in children is loading.
 */
export function Suspense(props: SuspenseProps, ...children: Child[]): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'contents';
  const childNodes: Node[] = [];
  let fallbackNode: Node | null = null;
  let showing: 'children' | 'fallback' = 'children';

  // Collect child nodes
  const frag = document.createDocumentFragment();
  appendChildren(frag, children);
  while (frag.firstChild) {
    childNodes.push(frag.firstChild);
    frag.removeChild(frag.firstChild);
  }

  function showChildren(): void {
    if (showing === 'children') return;
    showing = 'children';
    container.removeAttribute('aria-busy');
    while (container.firstChild) container.removeChild(container.firstChild);
    for (let i = 0; i < childNodes.length; i++) container.appendChild(childNodes[i]);
    fallbackNode = null;
  }

  function showFallback(): void {
    if (showing === 'fallback') return;
    showing = 'fallback';
    container.setAttribute('aria-busy', 'true');
    while (container.firstChild) container.removeChild(container.firstChild);
    fallbackNode = props.fallback();
    if (fallbackNode) container.appendChild(fallbackNode);
  }

  // React to pending count changes via signal
  createEffect(() => {
    if (_pendingCount() > 0) {
      showFallback();
    } else {
      showChildren();
    }
  });

  // Initial render: if nothing pending, show children right away
  if (_pendingCount() === 0) {
    for (let i = 0; i < childNodes.length; i++) container.appendChild(childNodes[i]);
    showing = 'children';
  }

  return container;
}

// ─── Transition ─────────────────────────────────────────────────

interface TransitionProps {
  enter?: string;
  exit?: string;
  duration?: number;
}

/**
 * Enter/exit animation wrapper for conditional content.
 */
export function Transition(props: TransitionProps, child: () => HTMLElement | null): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'contents';
  const reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 0 : (props.duration != null ? props.duration : 200);
  let currentNode: HTMLElement | null = null;
  let exitTimer: ReturnType<typeof setTimeout> | null = null;

  createEffect(() => {
    const next = child();

    // Exit current node
    if (currentNode && currentNode !== next) {
      const leaving = currentNode;
      currentNode = null;

      if (props.exit && !reducedMotion) {
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

      if (props.enter && !reducedMotion) {
        next.classList.add(props.enter);
        const entering = next;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (entering.parentNode === container) entering.classList.remove(props.enter!);
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
 */
export function forwardRef<P extends Record<string, unknown>>(
  component: (props: P, ref: ((el: HTMLElement) => void) | undefined, ...children: Child[]) => HTMLElement
): (props: P & { ref?: (el: HTMLElement) => void }, ...children: Child[]) => HTMLElement {
  return function (props: P & { ref?: (el: HTMLElement) => void }, ...children: Child[]): HTMLElement {
    const ref = props && props.ref;
    let cleaned: any = props;
    if (ref !== undefined) {
      cleaned = {} as P;
      for (const k in props) {
        if (k !== 'ref') (cleaned as any)[k] = (props as any)[k];
      }
    }
    return component(cleaned, ref, ...children);
  };
}

// ─── Internal helpers ───────────────────────────────────────────

function appendChildren(el: Node, children: Child[]): void {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child == null || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(el, child);
    } else if (child && typeof child === 'object' && (child as Node).nodeType) {
      el.appendChild(child as Node);
    } else if (typeof child === 'function') {
      const anchor = document.createComment('');
      el.appendChild(anchor);
      let currentNode: Node | null = null;
      createEffect(() => {
        const result = (child as () => Child)();
        if (currentNode) {
          disposeNode(currentNode);
          if (currentNode.parentNode) currentNode.parentNode.removeChild(currentNode);
          currentNode = null;
        }
        if (result != null && result !== false) {
          if (typeof result === 'object' && (result as Node).nodeType) {
            currentNode = result as Node;
          } else {
            currentNode = document.createTextNode(String(result));
          }
          anchor.parentNode!.insertBefore(currentNode, anchor);
        }
      });
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }
}
