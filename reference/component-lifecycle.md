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

Components with document-level listeners that should migrate to `_behaviors.js` or add explicit cleanup:

- `select.js` — click-outside, escape (should use `createOverlay`)
- `dropdown.js` — click-outside, escape (should use `createOverlay`)
- `combobox.js` — click-outside, escape (should use `createOverlay`)
- `context-menu.js` — click-outside, escape (should use `createOverlay`)
- `slider.js` — document pointermove/pointerup (should use `createDrag`)
- `image.js` — document keydown for lightbox
- `tour.js` — document keydown, window resize
- `data-table.js` — document pointermove/pointerup for column resize (should use `createDrag`)
- `tooltip.js` — pending setTimeout on detached DOM
- `modal.js` — should use `createFocusTrap` (exists in `_behaviors.js` but unused)
