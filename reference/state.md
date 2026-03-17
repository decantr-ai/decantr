# State Module Reference

`import { createSignal, createEffect, createMemo, createStore, batch, createContext, createSelector, createDeferred, createHistory, useLocalStorage, untrack, peek, createRoot, getOwner, runWithOwner, onError, on } from 'decantr/state';`

## What's New (v0.5.0)

| Feature | Description | Cross-ref |
|---------|-------------|-----------|
| `createRoot` | Independent reactive scope with disposal | §createRoot |
| `getOwner` / `runWithOwner` | Ownership tree introspection and transfer | §Ownership |
| `onError` | Error boundaries in the reactive graph | §Error Boundaries |
| `on()` | Explicit dependency tracking | §on |
| Dependency cleanup | Effects auto-remove from old signal subscriber sets on re-run | Automatic |
| Topological flush | Diamond-problem fix — effects sorted by level before flush | Automatic |
| `createResource` **removed** | Replaced by `createQuery` in `decantr/data` | `reference/state-data.md` |

## createSignal(initial)

Returns `[getter, setter]` tuple. Getter auto-tracks in effects/memos. Setter accepts value or updater function.

| Call | Behavior |
|------|----------|
| `setter(5)` | Set value to `5` |
| `setter(prev => prev + 1)` | Update from previous value |

Skips notification if new value is identical (`Object.is`).

## createEffect(fn)

Runs `fn` immediately, auto-tracks all signal reads inside. Re-runs when any tracked signal changes. Returns `dispose()` function.

| Detail | Behavior |
|--------|----------|
| Auto-tracking | Reads during `fn` execution subscribe the effect |
| Dependency cleanup | On re-run, effect removes itself from old signal subscriber sets before re-tracking |
| Cleanup | If `fn` returns a function, it runs before next execution and on dispose |
| Dispose | `const dispose = createEffect(fn); dispose();` stops all future runs |
| Batching | During `batch()`, effects are deferred to topological flush |
| Error handling | Errors propagate up the ownership tree to nearest `onError` handler |

## createMemo(fn)

Cached derived computation. Returns a getter. Recomputes lazily when dependencies change. Tracks reads like a signal — effects depending on the memo re-run only when the memo's value changes.

```js
const [a, setA] = createSignal(1);
const double = createMemo(() => a() * 2);
double(); // 2
```

## createStore(initialValue)

Proxy-wrapped object with per-property reactive tracking. Reading a property inside an effect subscribes to that property. Writing a property notifies only subscribers of that specific key.

| Detail | Behavior |
|--------|----------|
| Tracking granularity | Per top-level property (not deep — see `decantr/state/store` for deep stores) |
| Identity check | Skips notification on `Object.is` equality |
| Return value | The proxy itself (mutate in place) |

## batch(fn)

Defers all effect runs until `fn` completes. Supports nesting — flush happens when outermost `batch` exits. Flush uses topological ordering.

```js
batch(() => {
  setA(1);
  setB(2); // effects run once after both updates
});
```

## createRoot(fn)

Create an independent reactive scope. `fn` receives a `dispose` function. All effects/memos created inside are owned by this root and disposed when `dispose()` is called.

```js
const result = createRoot(dispose => {
  const [count, setCount] = createSignal(0);
  createEffect(() => console.log(count()));
  // dispose() cleans up effect and all children
  return { count, setCount, dispose };
});
```

## getOwner() / runWithOwner(owner, fn)

Introspect and transfer ownership context. Useful for effects created outside the normal component tree (e.g., in setTimeout, event handlers).

```js
const owner = getOwner(); // capture in sync context
setTimeout(() => {
  runWithOwner(owner, () => {
    createEffect(() => { /* properly owned */ });
  });
}, 1000);
```

## onError(handler)

Register an error handler on the current owner. When an effect throws, the error walks up the ownership tree to find the nearest handler.

```js
createRoot(() => {
  onError(err => console.error('Caught:', err));
  createEffect(() => { throw new Error('boom'); }); // caught by handler
});
```

## on(deps, fn, options?)

Explicit dependency tracking. Reads `deps` inside tracking context, calls `fn` inside `untrack()`. Useful when you need to read a signal inside an effect without subscribing to it.

| Option | Description |
|--------|-------------|
| `defer` | If `true`, skip initial run (default: `false`) |

```js
const [count, setCount] = createSignal(0);
const [name] = createSignal('World');

// Only re-runs when count changes, not when name changes
on(count, (value, prev) => {
  console.log(`count: ${prev} → ${value}, name: ${name()}`);
});
```

Supports array of dependencies:
```js
on([a, b], ([aVal, bVal], [prevA, prevB]) => { ... });
```

## createContext(defaultValue?)

Dependency injection via Provider/consume pattern. Returns `{ Provider, consume }`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `Provider` | `(value: T) => () => void` | Sets context value, returns restore function |
| `consume` | `() => T` | Reads current value (or `defaultValue`) |

```js
const ThemeCtx = createContext('light');
const restore = ThemeCtx.Provider('dark');
ThemeCtx.consume(); // 'dark'
restore(); // restores previous value
```

## createSelector(source)

Per-key memoization for efficient list highlighting. Returns `isSelected(key)` — a reactive check that only notifies when a specific key's match status changes.

```js
const [selected, setSelected] = createSignal('a');
const isSelected = createSelector(selected);
// In a list item: isSelected('a') returns true, re-runs only when 'a' gains/loses selection
```

## createDeferred(fn)

Like `createMemo` but lazy-initialized — does not compute until the returned getter is first called. Subsequent reads use cached value until dependencies change, then recomputes on next read.

## createHistory(signal, options?)

Undo/redo history tracking for a signal.

| Param | Type | Description |
|-------|------|-------------|
| `signal` | `[getter, setter]` | Signal tuple from `createSignal` |
| `options.maxLength` | `number` | Max undo depth (default: `100`) |

| Key | Type | Description |
|-----|------|-------------|
| `canUndo` | `() => boolean` | Signal getter |
| `canRedo` | `() => boolean` | Signal getter |
| `undo` | `() => void` | Restore previous value |
| `redo` | `() => void` | Re-apply undone value |
| `clear` | `() => void` | Reset history to current value |

## useLocalStorage(key, initial)

Signal backed by `localStorage` with JSON serialization. Returns `[getter, setter]` — same API as `createSignal`.

## untrack(fn) / peek(getter)

Read signals without subscribing the current effect.

| Function | Use case |
|----------|----------|
| `untrack(fn)` | Run `fn` with tracking disabled |
| `peek(getter)` | Alias for `untrack(getter)` |

---

**See also:** `reference/state-data.md`, `reference/component-lifecycle.md`, `reference/router.md`
