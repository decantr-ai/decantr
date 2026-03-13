# Router Reference

Client-side router with hash and history strategies, nested routes, guards, lazy loading, named routes, scroll restoration, and URL validation.

Import: `import { createRouter, navigate, link, useRoute, useSearchParams } from 'decantr/router';`

## `createRouter(config)` — Config Shape

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `mode` | `'hash'\|'history'` | `'hash'` | Routing strategy. Hash uses `#/path`, history uses History API |
| `routes` | `Route[]` | *required* | Route definitions (see Route Config below) |
| `transitions` | `boolean` | `false` | Enable View Transitions API for route swaps |
| `scrollBehavior` | `'top'\|'restore'\|false` | `'top'` | Scroll handling on navigation |
| `beforeEach` | `(to, from) => ...` | `null` | Navigation guard (see Guards) |
| `afterEach` | `(to, from) => void` | `null` | Post-navigation hook |

**Returns:** `{ navigate, outlet, current, path, destroy, nameMap }`

| Return Key | Type | Description |
|------------|------|-------------|
| `navigate(to, opts)` | `Function` | Programmatic navigation |
| `outlet(depth?)` | `() => HTMLElement` | Renders matched component chain. `depth` for nested layouts (default `0`) |
| `current` | `() => RouteState` | Signal returning current route state |
| `path` | `() => string` | Shorthand for `current().path` |
| `destroy` | `() => void` | Tear down router, remove listeners |
| `nameMap` | `Map<string, string>` | Name-to-path lookup |

## Route Config Schema

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `path` | `string` | Yes | Path segment. Supports `:param` and `*` wildcard |
| `component` | `Function` | No | Component function `(params) => HTMLElement` |
| `name` | `string` | No | Named route identifier for `navigate({ name })` |
| `children` | `Route[]` | No | Nested child routes |

**Path patterns:**
- Static: `/about`
- Params: `/users/:id` — captured in `params.id`
- Wildcard: `*` — matches remainder, captured as param
- Nested: parent `/dashboard` + child `settings` resolves to `/dashboard/settings`

**Lazy loading:** Set `component` to a zero-arg function returning a Promise. The router auto-detects and caches resolved modules.

```javascript
{ path: '/admin', component: () => import('./pages/admin.js') }
```

Resolved module uses `.default` export or the module itself if it's a function.

## `link(props, ...children)` — Router-Aware Anchor

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | *required* | Navigation target path (validated) |
| `activeClass` | `string` | `'d-link-active'` | CSS class applied when route matches |
| `exact` | `boolean` | `false` | Match `href` exactly (no prefix matching) |
| `class` | `string` | — | Additional CSS classes |

Active matching logic:
- `href='/'` always requires exact match regardless of `exact` prop
- Other paths: prefix match by default (`/users` matches `/users/123`), exact match when `exact: true`
- Passes through all other props to the underlying `<a>` element

## `navigate(to, opts)` — Programmatic Navigation

Delegates to the active router. Throws if no router exists.

| Param | Type | Description |
|-------|------|-------------|
| `to` | `string \| { name, params? }` | Target path or named route |
| `opts.replace` | `boolean` | Replace current history entry instead of pushing |

Named route resolution substitutes `:param` segments with `params` values:

```javascript
navigate({ name: 'user-detail', params: { id: '42' } });
// Resolves to /users/42 if named route pattern is /users/:id
```

## `useRoute()` — Current Route Signal

Returns the `current` signal from the active router. Call the returned function to read route state.

**RouteState shape:**

| Key | Type | Description |
|-----|------|-------------|
| `path` | `string` | Matched pathname (without query) |
| `params` | `Object<string, string>` | Extracted route params |
| `query` | `Object<string, string>` | Parsed query string params |
| `component` | `Function\|null` | Leaf component of matched route |
| `components` | `Function[]` | Full component chain (root layout to leaf) |
| `matched` | `boolean` | `true` if a route was matched |
| `name` | `string\|undefined` | Named route identifier if defined |

## `useSearchParams()` — Reactive Query Params

Returns `[getter, setter]` tuple.

| Item | Type | Description |
|------|------|-------------|
| `getter` | `() => URLSearchParams` | Reactive signal of current query params |
| `setter` | `(params: Object\|URLSearchParams) => void` | Update query params via `replaceState` (no history entry) |

Setter accepts plain object `{ key: 'value' }` or `URLSearchParams` instance.

## Guards

### `beforeEach(to, from)`

Called before every navigation (including initial load and back/forward).

| Return Value | Behavior |
|-------------|----------|
| `undefined` | Allow navigation |
| `false` | Cancel navigation |
| `string` | Redirect to returned path (validated, respects `replace` option) |

`to` and `from` are RouteState objects (see `useRoute()` shape above).

### `afterEach(to, from)`

Called after navigation completes and route signal is updated. Return value ignored.

## URL Validation

All paths passed to `navigate()`, `link()`, and guard redirects are validated:

| Rule | Rejected Input |
|------|---------------|
| Must be string | Non-string values |
| Must start with `/` | Relative paths (`foo/bar`) |
| No `javascript:` | `javascript:alert(1)` |
| No `data:` | `data:text/html,...` |
| No absolute URLs | `https://evil.com/path` |

Regex: `/^(javascript|data):|^https?:\/\//i`

Violations throw `Error('Invalid route path: ...')` or `Error('Route path must start with /: ...')`.

## Scroll Restoration

| `scrollBehavior` | Behavior |
|-----------------|----------|
| `'top'` (default) | `scrollTo(0, 0)` after every navigation |
| `'restore'` | Saves `scrollY` per path before leaving, restores on return |
| `false` | No scroll manipulation |

Scroll positions are stored in an in-memory `Map<string, number>` — not persisted across page reloads.

## Outlet & Nested Routes

`outlet(depth)` creates a `<d-route>` element that reactively renders the matched component at the given depth in the component chain.

For nested routes, layout components receive an `outlet` prop — a function returning the child outlet:

```javascript
function DashboardLayout({ outlet }) {
  const { div, nav } = tags;
  return div(
    nav(link({ href: '/dashboard' }, 'Home'), link({ href: '/dashboard/settings' }, 'Settings')),
    outlet()  // renders child route component
  );
}
```

When `transitions: true` and `document.startViewTransition` is available (and animations are enabled via `getAnimations()`), route swaps are wrapped in a view transition.

## Example — Nested Routes with Guards

```javascript
import { createRouter, link, useRoute, navigate } from 'decantr/router';
import { tags } from 'decantr/tags';

const isLoggedIn = () => /* auth check */;

const router = createRouter({
  mode: 'hash',
  scrollBehavior: 'restore',
  transitions: true,
  beforeEach(to, from) {
    if (to.path.startsWith('/dashboard') && !isLoggedIn()) return '/login';
  },
  afterEach(to, from) {
    document.title = to.name || 'App';
  },
  routes: [
    { path: '/', component: HomePage, name: 'home' },
    { path: '/login', component: LoginPage, name: 'login' },
    {
      path: '/dashboard',
      component: DashboardLayout,
      children: [
        { path: '', component: DashboardHome, name: 'dashboard' },
        { path: 'settings', component: SettingsPage, name: 'settings' },
        { path: 'users/:id', component: UserDetail, name: 'user-detail' },
      ]
    },
    { path: '/docs', component: () => import('./pages/docs.js'), name: 'docs' },
    { path: '*', component: NotFoundPage }
  ]
});

// Mount outlet
mount(() => router.outlet(), document.getElementById('app'));

// Programmatic navigation
navigate('/dashboard');
navigate({ name: 'user-detail', params: { id: '7' } });
navigate('/settings', { replace: true });
```

---

**See also:** `reference/state.md`, `reference/decantation-process.md`
