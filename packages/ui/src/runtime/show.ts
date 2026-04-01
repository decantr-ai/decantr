import { createRoot } from '../state/scheduler.js';
import { createEffect } from '../state/index.js';

/**
 * Conditional rendering with proper reactive disposal.
 * Each branch gets its own createRoot scope — when the condition flips,
 * the old branch's effects/signals are disposed before the new branch mounts.
 */
export function Show(
  when: () => boolean,
  renderFn: () => Node,
  fallbackFn?: () => Node
): HTMLElement {
  const container = document.createElement('d-show');

  createEffect(() => {
    const result = when();
    const fn = result ? renderFn : fallbackFn;
    if (!fn) return;

    let branchNode: Node | undefined;
    let branchDispose: (() => void) | undefined;
    createRoot((dispose) => {
      branchDispose = dispose;
      branchNode = fn();
      if (branchNode && branchNode.nodeType) {
        container.appendChild(branchNode);
      }
    });

    // Returned cleanup runs when condition changes OR parent is disposed
    return () => {
      if (branchDispose) branchDispose();
      if (branchNode && branchNode.parentNode === container) {
        container.removeChild(branchNode);
      }
    };
  });

  return container;
}
