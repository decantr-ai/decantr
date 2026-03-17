# State Patterns — LLM-Optimized Recipes

Common patterns for combining Decantr state primitives. Each recipe is a complete, copy-pasteable solution.

## Server Data + UI State

```js
import { createQuery } from 'decantr/data';
import { createSignal } from 'decantr/state';

const [filter, setFilter] = createSignal('');
const users = createQuery(
  () => `users-${filter()}`,
  ({ signal }) => fetch(`/api/users?q=${filter()}`, { signal }).then(r => r.json())
);
// users.data(), users.isLoading(), users.error()
```

## Entity CRUD + Optimistic Updates

```js
import { createEntityStore, createMutation, queryClient } from 'decantr/data';

const users = createEntityStore({ getId: u => u.id });
const addUser = createMutation(
  (user) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }).then(r => r.json()),
  {
    onMutate: (user) => { users.upsert({ ...user, id: Date.now() }); },
    onSuccess: (data) => { users.upsert(data); },
    onError: () => { queryClient.invalidate('users'); }
  }
);
```

## Real-Time Feed

```js
import { createWebSocket, createEntityStore } from 'decantr/data';

const messages = createEntityStore({ getId: m => m.id });
const ws = createWebSocket('wss://api.example.com/ws', { parse: JSON.parse });
ws.on(msg => {
  if (msg.type === 'add') messages.upsert(msg.payload);
  if (msg.type === 'remove') messages.remove(msg.payload.id);
});
```

## Offline Form

```js
import { createOfflineQueue, createPersisted } from 'decantr/data';

const [draft, setDraft] = createPersisted('form-draft', { name: '', email: '' });
const queue = createOfflineQueue({
  process: async (item) => fetch('/api/submit', { method: 'POST', body: JSON.stringify(item) }),
  persist: true
});
// On submit: queue.add(draft()); setDraft({ name: '', email: '' });
```

## URL-Driven Filters + Query

```js
import { createURLStore, parsers, createQuery } from 'decantr/data';

const url = createURLStore({
  page: { parser: parsers.integer, defaultValue: 1 },
  sort: { parser: parsers.string, defaultValue: 'name' },
  filter: { parser: parsers.string, defaultValue: '' }
});

const results = createQuery(
  () => `items-${url.page()}-${url.sort()}-${url.filter()}`,
  ({ signal }) => fetch(`/api/items?page=${url.page()}&sort=${url.sort()}&q=${url.filter()}`, { signal }).then(r => r.json())
);
```

## Undo/Redo Editor

```js
import { createSignal, createHistory } from 'decantr/state';

const [content, setContent] = createSignal('');
const { undo, redo, canUndo, canRedo } = createHistory([content, setContent], { maxLength: 50 });
```

Or with middleware:
```js
import { withMiddleware } from 'decantr/state/middleware';
import { undoMiddleware } from 'decantr/state/middleware';

const mw = undoMiddleware({ maxLength: 50 });
const [content, setContent] = withMiddleware(createSignal(''), [mw.middleware]);
// mw.undo(), mw.redo(), mw.canUndo(), mw.canRedo()
```

## Cross-Tab Sync

```js
import { createPersisted, createCrossTab } from 'decantr/data';

const [theme, setTheme] = createPersisted('theme', 'light');
const cleanup = createCrossTab('theme-sync', [theme, setTheme]);
// Changes in one tab propagate to all others
```

## Large List Performance

```js
import { createSignal } from 'decantr/state';
import { mapArray, createProjection } from 'decantr/state/arrays';

const [items, setItems] = createSignal(largeArray);
const rendered = mapArray(items, (item) => renderRow(item));
// Only added/removed items trigger scope creation — stable per-item references
```

## Worker Computation

```js
import { createWorkerQuery } from 'decantr/data';
import { createSignal } from 'decantr/state';

const [data, setData] = createSignal([]);
const result = createWorkerQuery(new Worker('./analyze.js'), data);
// result.data() — computed result from worker
// result.loading() — true while worker is processing
```

## Deep Reactive Store

```js
import { createDeepStore, produce, reconcile } from 'decantr/state/store';

const store = createDeepStore({
  user: { name: 'Alice', settings: { theme: 'dark' } },
  items: []
});

// Nested writes are reactive
store.user.settings.theme = 'light';

// Immer-style mutations
produce(store, draft => {
  draft.items.push({ id: 1, name: 'New' });
  draft.user.name = 'Bob';
});

// Efficient bulk update
reconcile(store, await fetch('/api/state').then(r => r.json()));
```

## Explicit Dependency Control

```js
import { createSignal, on } from 'decantr/state';

const [search, setSearch] = createSignal('');
const [debounced, setDebounced] = createSignal('');

// Only re-runs when search changes, not when debounced changes
on(search, (value) => {
  clearTimeout(timer);
  timer = setTimeout(() => setDebounced(value), 300);
});
```
