# 07 — Data Fetching

Decantr's data layer provides caching, deduplication, background refetching, and optimistic updates — all reactive and integrated with the signal system.

## createQuery — Read Data

`createQuery` fetches data, caches it, and returns reactive signals for loading state, errors, and data:

```js
import { createQuery } from 'decantr/data';

const users = createQuery('users', ({ signal }) =>
  fetch('/api/users', { signal }).then(r => r.json())
);

// Reactive getters
users.data();       // Array of users (or undefined while loading)
users.isLoading();  // true during initial load
users.error();      // Error object or null
users.isFetching(); // true during any fetch (including background refetch)
users.isStale();    // true when cached data is stale
```

### Using in a Component

```js
import { tags } from 'decantr/tags';
import { text, cond, list } from 'decantr/core';
import { createQuery } from 'decantr/data';
import { css } from 'decantr/css';
import { Skeleton, Alert } from 'decantr/components';

const { div, h2, ul, li } = tags;

export default function UsersPage() {
  const users = createQuery('users', ({ signal }) =>
    fetch('/api/users', { signal }).then(r => r.json())
  );

  return div({ class: css('_flex _col _gap4 _p6') },
    h2({ class: css('_heading3') }, 'Users'),

    // Loading state
    cond(() => users.isLoading(), () =>
      div({ class: css('_flex _col _gap2') },
        Skeleton({ width: '100%', height: '40px' }),
        Skeleton({ width: '100%', height: '40px' }),
        Skeleton({ width: '100%', height: '40px' })
      )
    ),

    // Error state
    cond(() => users.error(), () =>
      Alert({ variant: 'error' }, text(() => users.error()?.message || 'Failed to load'))
    ),

    // Data
    cond(() => users.data(), () =>
      ul({ class: css('_flex _col _gap2') },
        list(() => users.data() || [], (user) =>
          li({ class: css('_p3 _bgmuted _r2') }, user.name)
        )
      )
    )
  );
}
```

### Dynamic Query Keys

When the key is a function, the query re-fetches whenever the key changes:

```js
import { createSignal } from 'decantr/state';

const [userId, setUserId] = createSignal(1);

const user = createQuery(
  () => `user-${userId()}`,
  ({ signal }) => fetch(`/api/users/${userId()}`, { signal }).then(r => r.json())
);
```

Changing `userId` automatically cancels the previous request (via AbortController) and starts a new one.

### Query Options

```js
const users = createQuery('users', fetcher, {
  staleTime: 30000,           // Data is fresh for 30 seconds
  cacheTime: 300000,          // Keep inactive cache for 5 minutes (default)
  retry: 3,                   // Retry failed requests 3 times (default)
  refetchInterval: 60000,     // Background refetch every 60 seconds
  refetchOnWindowFocus: true, // Refetch when tab regains focus (default)
  initialData: [],            // Provide initial data before first fetch
  select: (data) => data.results, // Transform the response
});
```

### Manual Refetch

```js
users.refetch();  // Trigger a manual refetch
```

## createMutation — Write Data

Mutations handle POST, PUT, DELETE operations with optional optimistic updates:

```js
import { createMutation, queryClient } from 'decantr/data';

const addUser = createMutation(
  (newUser) => fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  }).then(r => r.json()),
  {
    onSuccess: () => {
      // Invalidate the users query so it refetches
      queryClient.invalidate('users');
    }
  }
);

// Trigger the mutation
addUser.mutate({ name: 'Alice', email: 'alice@example.com' });

// Reactive state
addUser.isLoading();  // true while mutating
addUser.error();      // Error or null
addUser.data();       // Response data
```

### Optimistic Updates

Update the UI immediately, then roll back if the server request fails:

```js
const updateUser = createMutation(
  (user) => fetch(`/api/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  }).then(r => r.json()),
  {
    onMutate: (user) => {
      // Save current cache for rollback
      const previous = queryClient.getCache('users');
      // Optimistically update cache
      queryClient.setCache('users', previous.map(u => u.id === user.id ? user : u));
      return { previous };  // Rollback context
    },
    onError: (err, user, context) => {
      // Rollback on failure
      queryClient.setCache('users', context.previous);
    },
    onSuccess: () => {
      queryClient.invalidate('users');
    }
  }
);
```

## Cache Management with queryClient

The `queryClient` singleton manages all query caches:

```js
import { queryClient } from 'decantr/data';

// Invalidate queries by key prefix (triggers refetch for active queries)
queryClient.invalidate('users');       // Invalidates 'users', 'users-1', etc.

// Prefetch data (warm cache without subscribing)
queryClient.prefetch('user-42', () => fetch('/api/users/42').then(r => r.json()));

// Read/write cache directly
const cached = queryClient.getCache('users');
queryClient.setCache('users', [...cached, newUser]);

// Clear all caches
queryClient.clear();
```

## createPersisted — Local Storage

A signal backed by `localStorage` that persists across page reloads and syncs across tabs:

```js
import { createPersisted } from 'decantr/data';

const [theme, setTheme] = createPersisted('app-theme', 'dark');

// Works like createSignal, but value survives page refreshes
theme();       // 'dark' (or whatever was last saved)
setTheme('light');  // Saved to localStorage automatically
```

## createWebSocket — Real-Time Data

WebSocket connection with auto-reconnect and exponential backoff:

```js
import { createWebSocket } from 'decantr/data';

const ws = createWebSocket('wss://api.example.com/ws', {
  parse: JSON.parse  // Auto-parse incoming messages as JSON
});

// Listen for messages
ws.on((message) => {
  console.log('Received:', message);
});

// Send data
ws.send({ type: 'subscribe', channel: 'updates' });

// Reactive state
ws.status();       // 'connecting' | 'open' | 'closed'
ws.lastMessage();  // Most recent message

// Cleanup
ws.close();
```

### Real-Time Pattern: WebSocket + Entity Store

Combine WebSocket with an entity store for real-time collections:

```js
import { createWebSocket, createEntityStore } from 'decantr/data';

const notifications = createEntityStore({ getId: n => n.id });

const ws = createWebSocket('wss://api.example.com/ws', { parse: JSON.parse });
ws.on((msg) => {
  if (msg.type === 'notification') notifications.upsert(msg.payload);
  if (msg.type === 'dismiss') notifications.remove(msg.payload.id);
});

// In your component
list(() => notifications.all(), (notif) =>
  div({ class: css('_p3 _bgmuted _r2') }, notif.message)
)
```

## createURLSignal — URL-Driven State

Sync state with URL query parameters:

```js
import { createURLSignal, parsers } from 'decantr/data';

const [page, setPage] = createURLSignal('page', parsers.integer, { defaultValue: 1 });
const [sort, setSort] = createURLSignal('sort', parsers.string, { defaultValue: 'name' });

// URL: #/users?page=2&sort=email
page();  // 2
sort();  // 'email'

setPage(3);  // URL updates to ?page=3&sort=email
```

## Putting It Together

A complete data-fetching page with search, pagination, and mutations:

```js
import { tags } from 'decantr/tags';
import { text, cond, list } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { createQuery, createMutation, queryClient } from 'decantr/data';
import { css } from 'decantr/css';
import { Button, Input, Card, Badge, Skeleton } from 'decantr/components';

const { div, h2, span } = tags;

export default function UsersPage() {
  const [search, setSearch] = createSignal('');

  const users = createQuery(
    () => `users-${search()}`,
    ({ signal }) => fetch(`/api/users?q=${search()}`, { signal }).then(r => r.json()),
    { staleTime: 30000 }
  );

  const deleteUser = createMutation(
    (id) => fetch(`/api/users/${id}`, { method: 'DELETE' }),
    { onSuccess: () => queryClient.invalidate('users') }
  );

  return div({ class: css('_flex _col _gap4 _p6') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('_heading3') }, 'Users'),
      Input({ placeholder: 'Search...', oninput: (e) => setSearch(e.target.value) })
    ),

    cond(() => users.isLoading(), () =>
      div({ class: css('_flex _col _gap2') },
        Skeleton({ width: '100%', height: '60px' }),
        Skeleton({ width: '100%', height: '60px' })
      )
    ),

    cond(() => users.data(), () =>
      div({ class: css('_flex _col _gap2') },
        list(() => users.data() || [], (user) =>
          Card({ class: css('_flex _aic _jcsb _p4') },
            div({ class: css('_flex _col') },
              span({ class: css('_bold') }, user.name),
              span({ class: css('_textsm _fgmuted') }, user.email)
            ),
            div({ class: css('_flex _gap2') },
              Badge({ variant: user.active ? 'success' : 'default' }, user.active ? 'Active' : 'Inactive'),
              Button({ variant: 'destructive', size: 'sm', onclick: () => deleteUser.mutate(user.id) }, 'Delete')
            )
          )
        )
      )
    )
  );
}
```

## What's Next

Your app is feature-complete. The last section covers building for production and deploying.

---

Previous: [06 — Routing](./06-routing.md) | Next: [08 — Deploy](./08-deploy.md)
