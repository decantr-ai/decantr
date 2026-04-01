import type { Owner, Component, Child } from '../types.js';
import { createRoot, getOwner, disposeOwner, setCurrentEffect, getCurrentEffect } from '../state/scheduler.js';

/**
 * Wrap a component function in a reactive ownership root.
 * All signals/effects created inside are owned by that root and
 * disposed when disposeNode() is called on the returned DOM node.
 *
 * Bare (unwrapped) functions still work — this is opt-in.
 */
export function component<P extends Record<string, unknown> = Record<string, unknown>>(
  fn: (props: P, ...children: Child[]) => HTMLElement
): Component<P> {
  function wrapped(props: P, ...children: Child[]): HTMLElement {
    let node!: HTMLElement;
    createRoot(() => {
      const owner = getOwner();
      // Untrack the component body — signal reads during initialization
      // must not subscribe the calling effect. Only reads inside
      // createEffect/createMemo create subscriptions.
      const prev = getCurrentEffect();
      setCurrentEffect(null);
      try {
        node = fn(props, ...children);
      } finally {
        setCurrentEffect(prev);
      }
      if (node && typeof node === 'object' && (node as any).nodeType) {
        (node as any).__d_owner = owner;
      }
    });
    return node;
  }
  wrapped.__d_isComponent = true as const;
  wrapped.displayName = fn.name || 'Component';
  return wrapped;
}

/**
 * Dispose the reactive ownership root attached to a DOM node.
 * Runs all cleanups for signals/effects created inside that component.
 * No-op if the node has no owner.
 */
export function disposeNode(el: Node | null): void {
  if (el && (el as any).__d_owner) {
    disposeOwner((el as any).__d_owner);
    (el as any).__d_owner = null;
  }
}
