# Cookbook: Data Fetching Patterns

Advanced patterns for REST APIs, caching strategies, optimistic updates, real-time data, and offline support.

## Basic CRUD with createQuery and createMutation

### Fetching a List

```js
import { createQuery } from 'decantr/data';

const products = createQuery('products', ({ signal }) =>
  fetch('/api/products', { signal }).then(r => r.json())
);

// products.data()       — array of products or undefined
// products.isLoading()  — true during initial fetch
// products.isFetching() — true during any fetch (including background)
// products.error()      — Error or null
// products.refetch()    — manual refetch
```

### Fetching a Single Item

Use a dynamic key that depends on a route parameter:

```js
import { useRoute } from 'decantr/router';
import { createQuery } from 'decantr/data';

const route = useRoute();

const product = createQuery(
  () => `product-${route.params.id}`,
  ({ signal }) => fetch(`/api/products/${route.params.id}`, { signal }).then(r => r.json())
);
```

### Creating an Item

```js
import { createMutation, queryClient } from 'decantr/data';

const createProduct = createMutation(
  (product) => fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).then(r => r.json()),
  {
    onSuccess: () => queryClient.invalidate('products')
  }
);

// Usage
createProduct.mutate({ name: 'Widget', price: 29.99 });
```

### Updating an Item

```js
const updateProduct = createMutation(
  (product) => fetch(`/api/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  }).then(r => r.json()),
  {
    onSuccess: (data) => {
      queryClient.invalidate('products');
      queryClient.setCache(`product-${data.id}`, data);
    }
  }
);
```

### Deleting an Item

```js
const deleteProduct = createMutation(
  (id) => fetch(`/api/products/${id}`, { method: 'DELETE' }),
  {
    onSuccess: () => queryClient.invalidate('products')
  }
);
```

## Caching Strategies

### Stale-While-Revalidate

Show cached data immediately, refetch in the background:

```js
const products = createQuery('products', fetcher, {
  staleTime: 60000,     // Data is "fresh" for 1 minute
  cacheTime: 300000,    // Keep inactive cache for 5 minutes
});
```

Within `staleTime`, reading from this query returns cached data without hitting the network. After `staleTime`, the next read serves cached data but triggers a background refetch.

### Prefetching

Warm the cache before the user navigates:

```js
import { queryClient } from 'decantr/data';

// Prefetch on hover
link({
  href: '/product/42',
  onmouseenter: () => {
    queryClient.prefetch('product-42', () =>
      fetch('/api/products/42').then(r => r.json())
    );
  }
}, 'Product 42')
```

### Auto-Refresh

Poll for fresh data at a fixed interval:

```js
const notifications = createQuery('notifications', fetcher, {
  refetchInterval: 30000,          // Refetch every 30 seconds
  refetchOnWindowFocus: true,      // Also refetch when tab regains focus
});
```

### Conditional Fetching

Only fetch when a condition is met:

```js
import { createSignal } from 'decantr/state';

const [selectedId, setSelectedId] = createSignal(null);

const details = createQuery(
  () => `product-${selectedId()}`,
  ({ signal }) => fetch(`/api/products/${selectedId()}`, { signal }).then(r => r.json()),
  { enabled: () => selectedId() !== null }
);
```

When `enabled` returns `false`, the query stays in `idle` status and makes no requests.

## Optimistic Updates

Update the UI immediately, roll back on failure:

```js
const toggleFavorite = createMutation(
  (productId) => fetch(`/api/products/${productId}/favorite`, { method: 'POST' }),
  {
    onMutate: (productId) => {
      // Snapshot current data
      const prev = queryClient.getCache('products');
      // Optimistically update
      queryClient.setCache('products', prev.map(p =>
        p.id === productId ? { ...p, favorited: !p.favorited } : p
      ));
      return { prev };
    },
    onError: (err, productId, ctx) => {
      // Roll back to snapshot
      queryClient.setCache('products', ctx.prev);
    },
    onSuccess: () => {
      // Optionally refetch to ensure consistency
      queryClient.invalidate('products');
    }
  }
);
```

## Infinite Scroll / Pagination

### Cursor-Based Pagination

```js
import { createInfiniteQuery } from 'decantr/data';

const feed = createInfiniteQuery(
  'feed',
  ({ pageParam = null, signal }) =>
    fetch(`/api/feed?cursor=${pageParam || ''}`, { signal }).then(r => r.json()),
  { getNextPageParam: (lastPage) => lastPage.nextCursor }
);

// feed.pages()        — array of page results
// feed.allItems()     — flattened array of all items
// feed.hasNextPage()  — boolean
// feed.fetchNextPage() — load next page
// feed.isFetchingNextPage() — boolean
```

### Usage in a Component

```js
import { tags } from 'decantr/tags';
import { list, cond } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card } from 'decantr/components';

const { div } = tags;

function InfiniteFeed() {
  const feed = createInfiniteQuery('feed', fetcher, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  return div({ class: css('_flex _col _gap4') },
    list(() => feed.allItems() || [], (item) =>
      Card({ class: css('_p4') }, item.title)
    ),
    cond(() => feed.hasNextPage(), () =>
      Button({
        variant: 'outline',
        loading: feed.isFetchingNextPage(),
        onclick: () => feed.fetchNextPage()
      }, 'Load More')
    )
  );
}
```

## URL-Driven Filtering

Sync filters with URL search params so users can share and bookmark filtered views:

```js
import { createURLStore, parsers, createQuery } from 'decantr/data';

const filters = createURLStore({
  page: { parser: parsers.integer, defaultValue: 1 },
  sort: { parser: parsers.string, defaultValue: 'name' },
  q: { parser: parsers.string, defaultValue: '' },
  category: { parser: parsers.string, defaultValue: 'all' },
});

const products = createQuery(
  () => `products-${filters.page()}-${filters.sort()}-${filters.q()}-${filters.category()}`,
  ({ signal }) => {
    const params = new URLSearchParams({
      page: filters.page(),
      sort: filters.sort(),
      q: filters.q(),
      category: filters.category(),
    });
    return fetch(`/api/products?${params}`, { signal }).then(r => r.json());
  }
);

// Update filters — URL updates automatically, query re-fetches
filters.setPage(2);
filters.setSort('price');
filters.setQ('widget');
filters.reset();  // Reset all to defaults
```

## Real-Time Data with WebSocket

### Live Notifications

```js
import { createWebSocket, createEntityStore } from 'decantr/data';

const notifications = createEntityStore({ getId: n => n.id });

const ws = createWebSocket('wss://api.example.com/ws', {
  parse: JSON.parse
});

ws.on((msg) => {
  switch (msg.type) {
    case 'notification':
      notifications.upsert(msg.payload);
      break;
    case 'dismiss':
      notifications.remove(msg.payload.id);
      break;
    case 'clear-all':
      notifications.clear();
      break;
  }
});
```

### Live Dashboard Data

Combine WebSocket with `queryClient.setCache` to push live updates into existing queries:

```js
ws.on((msg) => {
  if (msg.type === 'kpi-update') {
    queryClient.setCache('kpis', msg.payload);
  }
  if (msg.type === 'order-created') {
    const orders = queryClient.getCache('recent-orders') || [];
    queryClient.setCache('recent-orders', [msg.payload, ...orders].slice(0, 10));
  }
});
```

### Server-Sent Events

For one-way server-to-client streaming:

```js
import { createEventSource } from 'decantr/data';

const sse = createEventSource('/api/events', {
  events: ['price-update', 'stock-change']
});

sse.on('price-update', (data) => {
  queryClient.setCache(`product-${data.id}`, prev => ({ ...prev, price: data.price }));
});
```

## Offline Support

Queue operations while offline, auto-flush when reconnected:

```js
import { createOfflineQueue, createPersisted } from 'decantr/data';

const queue = createOfflineQueue({
  process: async (item) => {
    const res = await fetch(item.url, item.options);
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  },
  persist: true,  // Queue survives page refresh
  onFlush: () => {
    // Invalidate all queries after offline queue flushes
    queryClient.invalidate('');
  }
});

// Queue a mutation that works offline
function saveNote(note) {
  queue.add({
    url: '/api/notes',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    }
  });
}

// queue.pending()  — number of queued items
// queue.isOnline() — reactive boolean
```

## Entity Store for Normalized State

When multiple views share the same entities, use `createEntityStore` to avoid duplicated data:

```js
import { createEntityStore, createQuery } from 'decantr/data';

const users = createEntityStore({ getId: u => u.id });

// Populate from API
const usersList = createQuery('users', async ({ signal }) => {
  const data = await fetch('/api/users', { signal }).then(r => r.json());
  users.addMany(data);  // Normalize into entity store
  return data;
});

// Read a single user — per-entity reactive signal
const alice = users.get(1);  // () => { id: 1, name: 'Alice' }

// Derived views
const admins = users.filter(u => u.role === 'admin');  // reactive memo
const sorted = users.sorted((a, b) => a.name.localeCompare(b.name));  // reactive memo
const page = users.paginated({ page: 1, size: 20 });  // reactive memo
```

## Key Takeaways

- `createQuery` handles GET requests with automatic caching, dedup, and background refetch
- `createMutation` handles POST/PUT/DELETE with callbacks for optimistic updates and cache invalidation
- `queryClient.invalidate(prefix)` triggers refetch for all matching active queries
- `createInfiniteQuery` for cursor-based or offset pagination
- `createURLStore` syncs filters with URL params for shareable views
- `createWebSocket` for real-time push updates with auto-reconnect
- `createOfflineQueue` for offline-first applications
- `createEntityStore` for normalized, per-entity reactive state
