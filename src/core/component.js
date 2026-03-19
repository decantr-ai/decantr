import { createRoot, getOwner, disposeOwner, setCurrentEffect, currentEffect } from '../state/scheduler.js';

/**
 * Wrap a component function in a reactive ownership root.
 * All signals/effects created inside are owned by that root and
 * disposed when disposeNode() is called on the returned DOM node.
 *
 * Bare (unwrapped) functions still work — this is opt-in.
 *
 * @param {Function} fn - Component function returning a DOM node
 * @returns {Function} Wrapped component function with __d_isComponent flag
 */
export function component(fn) {
  function wrapped(...args) {
    let node;
    createRoot(() => {
      const owner = getOwner();
      // Untrack the component body — signal reads during initialization
      // must not subscribe the calling effect. Only reads inside
      // createEffect/createMemo create subscriptions. This is the
      // runtime equivalent of what SolidJS's compiler does automatically.
      const prev = currentEffect;
      setCurrentEffect(null);
      try {
        node = fn(...args);
      } finally {
        setCurrentEffect(prev);
      }
      if (node && typeof node === 'object' && node.nodeType) {
        node.__d_owner = owner;
      }
    });
    return node;
  }
  wrapped.__d_isComponent = true;
  wrapped.displayName = fn.name || 'Component';
  return wrapped;
}

/**
 * Dispose the reactive ownership root attached to a DOM node.
 * Runs all cleanups for signals/effects created inside that component.
 * No-op if the node has no owner.
 *
 * @param {Node} el - DOM node with a __d_owner reference
 */
export function disposeNode(el) {
  if (el && el.__d_owner) {
    disposeOwner(el.__d_owner);
    el.__d_owner = null;
  }
}
