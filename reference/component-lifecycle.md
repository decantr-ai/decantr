# Component Lifecycle & Cleanup

## The Problem

Decantr components return raw `HTMLElement` nodes — not wrapper objects with lifecycle methods. This means cleanup (removing document listeners, clearing timers, disconnecting observers) requires explicit wiring. Without it, components leak resources when removed from the DOM.

## Cleanup Contract

**Every component that adds document-level listeners, timers, or observers MUST clean them up.** This applies to:

- `document.addEventListener(...)` — click-outside, escape-to-close, resize, scroll
- `setTimeout` / `setInterval` — debounced actions, animation timers, polling
- `IntersectionObserver` / `ResizeObserver` / `MutationObserver`
- `window.addEventListener(...)` — resize, scroll, popstate

## How Cleanup Works

### Pattern 1: Use `_behaviors.js` primitives (preferred)

All behavioral primitives in `_behaviors.js` return `{ destroy() }`. Components MUST call `.destroy()` when removed.

```javascript
import { createOverlay, createListbox, createFocusTrap } from './_behaviors.js';

export function Select(props) {
  const trigger = /* ... */;
  const panel = /* ... */;

  const overlay = createOverlay(trigger, panel, { trigger: 'click' });
  const listbox = createListbox(panel, { onSelect: /* ... */ });

  // Wire cleanup to element removal
  const el = h('div', { class: 'd-select' }, trigger, panel);
  onDestroy(() => {
    overlay.destroy();
    listbox.destroy();
  });
  return el;
}
```

### Pattern 2: Manual cleanup collection

For components that add their own listeners (not via behaviors):

```javascript
export function MyComponent(props) {
  const cleanups = [];

  const onResize = () => { /* ... */ };
  window.addEventListener('resize', onResize);
  cleanups.push(() => window.removeEventListener('resize', onResize));

  const timer = setInterval(poll, 5000);
  cleanups.push(() => clearInterval(timer));

  const el = h('div', { /* ... */ });
  onDestroy(() => cleanups.forEach(fn => fn()));
  return el;
}
```

### Pattern 3: MutationObserver self-cleanup (last resort)

When `onDestroy` context is unavailable (e.g., dynamically created elements):

```javascript
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.removedNodes) {
      if (node === el || node.contains(el)) {
        cleanup();
        observer.disconnect();
      }
    }
  }
});
observer.observe(el.parentNode, { childList: true });
```

## Available `_behaviors.js` Primitives

| Primitive | Returns `destroy()`? | Use For |
|-----------|---------------------|---------|
| `createOverlay()` | Yes | Click-outside, escape, show/hide, ARIA expanded |
| `createListbox()` | Yes | Arrow-key navigation, selection, type-ahead |
| `createDisclosure()` | No (uses element listeners only) | Expand/collapse with animation |
| `createRovingTabindex()` | Yes | Tab navigation within groups |
| `createFocusTrap()` | Yes (via `deactivate()`) | Modal/drawer focus containment |
| `createDrag()` | Yes | Pointer-based drag interactions |
| `createVirtualScroll()` | Yes | Large list rendering |
| `createInfiniteScroll()` | Yes | Load-more sentinel |
| `createMasonry()` | Yes | Pinterest-style layout |
| `createScrollSpy()` | Yes (via `disconnect()`) | Section tracking |
| `createHotkey()` | Yes | Keyboard shortcuts |

## Checklist Before Shipping a Component

1. Does this component add `document.addEventListener`? -> Use `createOverlay` or collect cleanup
2. Does this component use `setTimeout`/`setInterval`? -> Clear on destroy
3. Does this component create an `Observer`? -> Disconnect on destroy
4. Does this component use `createOverlay`/`createListbox`/etc.? -> Call `.destroy()` via `onDestroy`
5. Does this component add `window.addEventListener`? -> Remove on destroy

## Known Components Needing Cleanup Audit

**Completed** (have `onDestroy` wired — verified March 2026):
- `modal.js` — uses `createFocusTrap`, cleanup via `onDestroy`
- `select.js` — `onDestroy` added
- `combobox.js` — `onDestroy` added
- `context-menu.js` — `onDestroy` added
- `tooltip.js` — `onDestroy` added
- `slider.js` — `onDestroy` added
- `image.js` — `onDestroy` added
- `data-table.js` — `onDestroy` added
- `dropdown.js` — `onDestroy` added

**Remaining** — components that may still benefit from migrating to `_behaviors.js` primitives:
- `slider.js` — document pointermove/pointerup (candidate for `createDrag`)
- `data-table.js` — document pointermove/pointerup for column resize (candidate for `createDrag`)
- `tour.js` — document keydown, window resize (has manual cleanup, could use `createHotkey`)

## Workbench & Tooling Lifecycle

The cleanup contract applies to **ALL code**, not just `src/components/`. Workbench explorer modules, docs site scripts, CLI preview tools — any code that adds event listeners, timers, or observers MUST wire `onDestroy` cleanup.

**Common violations in tooling code:**

- **Motion/animation demos** that add `mouseenter`/`mouseleave` listeners directly via `addEventListener` instead of element props (props are cleaned up with the element)
- **Search modals** that add `keydown` document listeners without cleanup
- **Live previews** that create `ResizeObserver` or `MutationObserver` without disconnecting

**Rule:** If a workbench explorer section adds listeners, it follows the same contract as a framework component. Use element event props (e.g. `onmouseenter`) for element-scoped events, and `onDestroy` + `_behaviors.js` for document-level listeners.

---

**See also:** `reference/behaviors.md`, `reference/compound-spacing.md`
