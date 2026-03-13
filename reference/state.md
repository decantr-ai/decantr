# State Module Reference

`import { createSignal, createEffect, createMemo, createStore, batch, createResource, createContext, createSelector, createDeferred, createHistory, useLocalStorage, untrack, peek } from 'decantr/state';`

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
| Cleanup | If `fn` returns a function, it runs before next execution and on dispose |
| Dispose | `const dispose = createEffect(fn); dispose();` stops all future runs |
| Batching | During `batch()`, effects are deferred to microtask flush |

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
| Tracking granularity | Per top-level property (not deep) |
| Identity check | Skips notification on `Object.is` equality |
| Return value | The proxy itself (mutate in place) |

## batch(fn)

Defers all effect runs until `fn` completes. Supports nesting — flush happens when outermost `batch` exits. Flush is synchronous (not microtask-deferred).

```js
batch(() => {
  setA(1);
  setB(2); // effects run once after both updates
});
```

## createResource(fetcher, options?)

Async data fetching primitive. Integrates with `Suspense`.

**Options**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `initialValue` | `T` | `undefined` | Value before fetch completes |
| `lazy` | `boolean` | `false` | If `true`, does not fetch on creation — call `refetch()` |

**Return value**

| Key | Type | Description |
|-----|------|-------------|
| `data` | `() => T \| undefined` | Signal getter — resolved value |
| `loading` | `() => boolean` | Signal getter — fetch in progress |
| `error` | `() => Error \| null` | Signal getter — fetch error |
| `refetch` | `() => Promise<void>` | Re-execute fetcher |
| `mutate` | `(v: T) => void` | Overwrite data without fetching |

```js
const users = createResource(() => fetch('/api/users').then(r => r.json()));
// users.data(), users.loading(), users.error()
// users.refetch() to reload, users.mutate([]) to set directly
```

Pending fetches are tracked in `_pendingResources` for `Suspense` integration.

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

Nesting: each `Provider` call captures and restores the previous value via the returned cleanup function. Call restore in reverse order for proper nesting.

## createSelector(source)

Per-key memoization for efficient list highlighting. Returns `isSelected(key)` — a reactive check that only notifies when a specific key's match status changes.

| Detail | Behavior |
|--------|----------|
| `source` | Signal getter returning the currently selected key |
| Return | `(key: U) => boolean` — reactive per-key check |
| Efficiency | Only the previous and next matching key's subscribers fire on change |

```js
const [selected, setSelected] = createSignal('a');
const isSelected = createSelector(selected);
// In a list item: isSelected('a') returns true, re-runs only when 'a' gains/loses selection
```

## createDeferred(fn)

Like `createMemo` but lazy-initialized — does not compute until the returned getter is first called. Subsequent reads use cached value until dependencies change, then recomputes on next read.

## createHistory(signal, options?)

Undo/redo history tracking for a signal.

**Arguments**

| Param | Type | Description |
|-------|------|-------------|
| `signal` | `[getter, setter]` | Signal tuple from `createSignal` |
| `options.maxLength` | `number` | Max undo depth (default: `100`) |

**Return value**

| Key | Type | Description |
|-----|------|-------------|
| `canUndo` | `() => boolean` | Signal getter |
| `canRedo` | `() => boolean` | Signal getter |
| `undo` | `() => void` | Restore previous value |
| `redo` | `() => void` | Re-apply undone value |
| `clear` | `() => void` | Reset history to current value |

```js
const [count, setCount] = createSignal(0);
const history = createHistory([count, setCount], { maxLength: 50 });
setCount(1); setCount(2);
history.undo(); // count() === 1
history.redo(); // count() === 2
history.clear(); // history reset, current value preserved
```

## useLocalStorage(key, initial)

Signal backed by `localStorage` with JSON serialization. Returns `[getter, setter]` — same API as `createSignal`.

| Detail | Behavior |
|--------|----------|
| Initialization | Reads `localStorage.getItem(key)`, parses JSON. Falls back to `initial` if absent |
| Persistence | Every `setter` call writes `JSON.stringify(value)` to `localStorage` |
| SSR safe | Guards `localStorage` access with `typeof` check |
| Setter | Accepts value or updater function `(prev) => next` |

## untrack(fn) / peek(getter)

Read signals without subscribing the current effect.

| Function | Use case |
|----------|----------|
| `untrack(fn)` | Run `fn` with tracking disabled — reads inside do not create subscriptions |
| `peek(getter)` | Alias for `untrack(getter)` — read a single signal without tracking |

Use when an effect needs to read a signal for a one-time check without re-running when that signal changes.

---

**See also:** `reference/component-lifecycle.md`, `reference/router.md`
