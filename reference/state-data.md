# Data Layer Reference

`import { createQuery, createInfiniteQuery, createMutation, queryClient, createEntityStore, createURLSignal, createURLStore, parsers, createWebSocket, createEventSource, createPersisted, createIndexedDB, createCrossTab, createOfflineQueue, createWorkerSignal, createWorkerQuery } from 'decantr/data';`

## createQuery(key, fetcher, options?)

Server state management with caching, deduplication, and stale-while-revalidate. Replaces `createResource`.

```js
const users = createQuery('users', ({ signal }) =>
  fetch('/api/users', { signal }).then(r => r.json())
);
// users.data(), users.isLoading(), users.error()
// users.refetch(), users.setData([])
```

**Dynamic key** — re-fetches when key changes (previous request cancelled via AbortController):
```js
const user = createQuery(() => `user-${id()}`, ({ key, signal }) =>
  fetch(`/api/users/${id()}`, { signal }).then(r => r.json())
);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `staleTime` | `number` | `0` | ms before cached data is stale |
| `cacheTime` | `number` | `300000` | ms to keep inactive cache (5 min) |
| `retry` | `number` | `3` | Retry count with exponential backoff |
| `refetchInterval` | `number` | — | Auto background refetch ms |
| `refetchOnWindowFocus` | `boolean` | `true` | Refetch on tab focus |
| `enabled` | `() => boolean` | — | Signal getter; false = idle |
| `select` | `(data) => T` | — | Transform raw data |
| `initialData` | `T` | — | Initial data value |
| `placeholderData` | `T` | — | Placeholder while loading |

| Return | Type | Description |
|--------|------|-------------|
| `data` | `() => T \| undefined` | Signal getter |
| `status` | `() => string` | 'idle' \| 'loading' \| 'success' \| 'error' |
| `error` | `() => Error \| null` | Signal getter |
| `isLoading` | `() => boolean` | True during initial load |
| `isStale` | `() => boolean` | True when cached data is stale |
| `isFetching` | `() => boolean` | True during any fetch (including background) |
| `refetch` | `() => Promise` | Manually trigger refetch |
| `setData` | `(value: T) => void` | Manually set data |

## createInfiniteQuery(key, fetcher, options?)

Cursor-based or offset pagination.

```js
const posts = createInfiniteQuery('posts',
  ({ pageParam = 0, signal }) => fetch(`/api/posts?offset=${pageParam}`, { signal }).then(r => r.json()),
  { getNextPageParam: (lastPage) => lastPage.nextCursor }
);
// posts.pages(), posts.allItems(), posts.hasNextPage(), posts.fetchNextPage()
```

## createMutation(mutationFn, options?)

Mutations with optimistic updates and rollback.

```js
const addUser = createMutation(
  (user) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }).then(r => r.json()),
  {
    onMutate: (user) => {
      const prev = queryClient.getCache('users');
      queryClient.setCache('users', [...(prev || []), user]);
      return { prev }; // rollback context
    },
    onError: (err, user, ctx) => queryClient.setCache('users', ctx.prev),
    onSuccess: () => queryClient.invalidate('users')
  }
);
addUser.mutate({ name: 'Alice' });
```

## queryClient

Singleton cache manager.

| Method | Description |
|--------|-------------|
| `invalidate(keyPrefix)` | Mark matching queries stale, refetch active ones |
| `prefetch(key, fetcher)` | Warm cache without subscribing |
| `setCache(key, data)` | Manual cache write |
| `getCache(key)` | Read cache |
| `clear()` | Reset everything |

## createEntityStore(options)

Normalized collections with per-entity reactivity.

```js
const users = createEntityStore({ getId: u => u.id });
users.addMany([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
users.get(1)(); // { id: 1, name: 'Alice' } — per-entity signal
users.all(); // full array — collection signal
users.filter(u => u.name.startsWith('A'))(); // derived view
```

| Method | Description |
|--------|-------------|
| `addMany(entities)` | Batch add |
| `upsert(entity)` | Add or update |
| `update(id, partial)` | Partial merge |
| `remove(id)` | Remove |
| `clear()` | Remove all |
| `get(id)` | Per-entity signal getter (lazy, only fires for that entity) |
| `all()` | Signal: all entities as array |
| `count()` | Signal: count |
| `filter(pred)` | Derived filtered memo |
| `sorted(cmp)` | Derived sorted memo |
| `paginated({page, size})` | Derived paginated memo |

## createURLSignal(key, parser, options?)

Signal backed by URL search params. Routing-mode aware (hash/history).

```js
const [filter, setFilter] = createURLSignal('filter', parsers.string, { defaultValue: '' });
const [page, setPage] = createURLSignal('page', parsers.integer, { defaultValue: 1 });
```

## createURLStore(schema)

Multiple URL params as reactive store.

```js
const url = createURLStore({
  page: { parser: parsers.integer, defaultValue: 1 },
  sort: { parser: parsers.string, defaultValue: 'name' }
});
url.page(); // 1
url.setPage(2); // updates URL
url.values(); // { page: 2, sort: 'name' }
url.reset(); // reset all to defaults
```

## Built-in parsers

`parsers.string`, `parsers.integer`, `parsers.float`, `parsers.boolean`, `parsers.json`, `parsers.date`, `parsers.enum(['a','b','c'])`

## createWebSocket(url, options?)

WebSocket with auto-reconnect, exponential backoff, and send buffering.

```js
const ws = createWebSocket('wss://api.example.com/ws', { parse: JSON.parse });
ws.on(msg => users.upsert(msg.payload));
ws.send({ type: 'subscribe', channel: 'updates' });
// ws.status(), ws.lastMessage(), ws.close()
```

## createEventSource(url, options?)

Server-Sent Events with typed event listeners.

```js
const sse = createEventSource('/api/events', { events: ['update', 'delete'] });
sse.on('update', data => { ... });
```

## createPersisted(key, init, options?)

Signal backed by localStorage/sessionStorage with cross-tab sync via `storage` event.

```js
const [theme, setTheme] = createPersisted('app-theme', 'light');
```

## createIndexedDB(dbName, storeName)

Reactive IndexedDB binding. All methods return Promises.

```js
const db = createIndexedDB('myapp', 'items');
await db.set('key1', { name: 'Alice' });
const item = await db.get('key1');
```

## createCrossTab(channel, signal)

BroadcastChannel sync for a signal across browser tabs.

```js
const cleanup = createCrossTab('counter', [count, setCount]);
```

## createOfflineQueue(options)

Queue operations while offline, auto-flush on reconnect.

```js
const queue = createOfflineQueue({
  process: async (item) => await fetch(item.url, item.options),
  persist: true
});
queue.add({ url: '/api/sync', options: { method: 'POST', body: '...' } });
```

## createWorkerSignal(worker) / createWorkerQuery(worker, input)

Web Worker integration.

```js
const ws = createWorkerSignal(new Worker('./compute.js'));
ws.send({ type: 'process', data: largeArray });
// ws.result(), ws.busy(), ws.error()
```

---

**See also:** `reference/state.md`, `reference/state-patterns.md`
