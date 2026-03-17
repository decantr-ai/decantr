# 06 — Routing

Decantr's router supports hash and history modes, lazy loading, nested routes, guards, and route metadata — all built from scratch with zero dependencies.

## Basic Setup

In `src/app.js`, create a router and mount it:

```js
import { mount } from 'decantr/core';
import { createRouter } from 'decantr/router';
import { setStyle, setMode } from 'decantr/css';

setStyle('auradecantism');
setMode('dark');

const router = createRouter({
  mode: 'hash',  // or 'history' for clean URLs
  routes: [
    { path: '/', component: () => import('./pages/home.js') },
    { path: '/about', component: () => import('./pages/about.js') },
    { path: '/users', component: () => import('./pages/users.js') },
    { path: '/user/:id', component: () => import('./pages/user-detail.js') },
    { path: '/:404', component: () => import('./pages/not-found.js') },
  ]
});

mount(document.getElementById('app'), () => router.outlet());
```

### Routing Modes

| Mode | URL Format | Server Config |
|------|-----------|---------------|
| `hash` | `http://app.com/#/about` | None needed |
| `history` | `http://app.com/about` | Requires SPA fallback (redirect all to `index.html`) |

Hash mode is simpler for development and static hosting. History mode gives cleaner URLs but requires server configuration.

## Navigation

### `link()` — Declarative Links

```js
import { link } from 'decantr/router';
import { css } from 'decantr/css';

// Basic link
link({ href: '/about' }, 'About Us')

// With styling
link({ href: '/about', class: css('_fgprimary _nounder _trans') }, 'About Us')

// Active link styling is handled automatically — active links receive the `data-active` attribute
```

### `navigate()` — Programmatic Navigation

```js
import { navigate } from 'decantr/router';

// Navigate to a path
navigate('/users');

// Navigate with query params
navigate('/users?sort=name&page=2');

// In an event handler
Button({ onclick: () => navigate('/dashboard') }, 'Go to Dashboard')
```

### `back()` and `forward()` — History Navigation

```js
import { back, forward } from 'decantr/router';

Button({ onclick: () => back() }, 'Back')
Button({ onclick: () => forward() }, 'Forward')
```

## Route Parameters

Dynamic segments in the path are prefixed with `:`:

```js
{ path: '/user/:id', component: () => import('./pages/user-detail.js') }
```

Access parameters with `useRoute()`:

```js
import { useRoute } from 'decantr/router';
import { tags } from 'decantr/tags';
import { text } from 'decantr/core';
import { css } from 'decantr/css';

const { div, h1 } = tags;

export default function UserDetailPage() {
  const route = useRoute();

  return div({ class: css('_flex _col _gap4 _p6') },
    h1({ class: css('_heading3') }, text(() => `User #${route.params.id}`))
  );
}
```

### Query Parameters

```js
// URL: #/users?sort=name&page=2
const route = useRoute();
route.query.sort;  // 'name'
route.query.page;  // '2'
```

## Route Metadata

Attach arbitrary data to routes with the `meta` field:

```js
const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: HomePage, meta: { title: 'Home' } },
    { path: '/admin', component: AdminPage, meta: { title: 'Admin', requiresAuth: true } },
  ]
});
```

Access metadata in components:

```js
const route = useRoute();
route.meta.title;         // 'Admin'
route.meta.requiresAuth;  // true
```

## Route Guards

Guards run before navigation completes. Use them for auth checks, analytics, or redirects.

### `beforeEach` — Global Guard

```js
const router = createRouter({
  mode: 'hash',
  routes: [/* ... */],
  beforeEach: (to, from) => {
    // Redirect to login if route requires auth and user is not logged in
    if (to.meta.requiresAuth && !isLoggedIn()) {
      return '/login';
    }
    // Return nothing (undefined) to allow navigation
  }
});
```

### `afterEach` — Post-Navigation Hook

```js
const router = createRouter({
  mode: 'hash',
  routes: [/* ... */],
  afterEach: (to, from) => {
    // Update page title
    document.title = to.meta.title || 'My App';
    // Track page view
    analytics.track('page_view', { path: to.path });
  }
});
```

## Nested Routes

Define child routes for layout-level routing:

```js
const router = createRouter({
  mode: 'hash',
  routes: [
    {
      path: '/settings',
      component: () => import('./pages/settings-layout.js'),
      children: [
        { path: '/profile', component: () => import('./pages/settings-profile.js') },
        { path: '/account', component: () => import('./pages/settings-account.js') },
        { path: '/notifications', component: () => import('./pages/settings-notifications.js') },
      ]
    }
  ]
});
```

The parent component (`settings-layout.js`) renders its own layout and calls `router.outlet()` for the child:

```js
import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { css } from 'decantr/css';

const { div, nav, main } = tags;

export default function SettingsLayout(ctx) {
  return div({ class: css('_flex _gap6 _p6') },
    nav({ class: css('_flex _col _gap2 _w[200px]') },
      link({ href: '/settings/profile', class: css('_p2 _r2 _nounder _fgfg _trans') }, 'Profile'),
      link({ href: '/settings/account', class: css('_p2 _r2 _nounder _fgfg _trans') }, 'Account'),
      link({ href: '/settings/notifications', class: css('_p2 _r2 _nounder _fgfg _trans') }, 'Notifications')
    ),
    main({ class: css('_flex1') },
      ctx.outlet()
    )
  );
}
```

## Navigation Loading Indicator

The `isNavigating()` signal is `true` while lazy-loaded route components are being resolved:

```js
import { isNavigating } from 'decantr/router';
import { cond } from 'decantr/core';

div({},
  cond(() => isNavigating(), () => Progress({ value: undefined })),
  router.outlet()
)
```

## `onNavigate` — Navigation Listener

Subscribe to navigation events:

```js
const unsub = router.onNavigate((to, from) => {
  console.log(`Navigated from ${from.path} to ${to.path}`);
});

// Unsubscribe later
unsub();
```

## Complete Example

A full multi-page app with guarded routes:

```js
import { mount } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { createRouter, navigate } from 'decantr/router';
import { setStyle, setMode } from 'decantr/css';

setStyle('clean');
setMode('light');

const [isLoggedIn, setLoggedIn] = createSignal(false);

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/home.js') },
    { path: '/login', component: () => import('./pages/login.js'), meta: { title: 'Login' } },
    { path: '/dashboard', component: () => import('./pages/dashboard.js'), meta: { title: 'Dashboard', requiresAuth: true } },
    { path: '/:404', component: () => import('./pages/not-found.js') },
  ],
  beforeEach: (to) => {
    if (to.meta.requiresAuth && !isLoggedIn()) return '/login';
  },
  afterEach: (to) => {
    document.title = to.meta.title || 'My App';
  }
});

// Export login state for use in pages
export { isLoggedIn, setLoggedIn };

mount(document.getElementById('app'), () => router.outlet());
```

## What's Next

The next section covers data fetching — loading data from APIs and managing server state with queries and mutations.

---

Previous: [05 — State](./05-state.md) | Next: [07 — Data Fetching](./07-data.md)
