# Cookbook: SaaS Dashboard

Build a complete SaaS dashboard with sidebar navigation, KPI cards, charts, and a data table.

## Essence

Start by defining the project DNA in `decantr.essence.json`:

```json
{
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": { "style": "command-center", "mode": "dark", "recipe": "command-center", "shape": "sharp" },
  "character": ["tactical", "data-dense"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [
    { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "chart-grid", "data-table"] },
    { "id": "analytics", "skeleton": "sidebar-main", "blend": ["chart-grid"] },
    { "id": "users", "skeleton": "sidebar-main", "blend": ["data-table"] }
  ],
  "tannins": ["auth", "realtime-data"],
  "cork": { "enforce_style": true, "enforce_recipe": true }
}
```

## Entry Point

`src/app.js`:

```js
import { mount } from 'decantr/core';
import { createRouter } from 'decantr/router';
import { setStyle, setMode } from 'decantr/css';

setStyle('command-center');
setMode('dark');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/overview.js') },
    { path: '/analytics', component: () => import('./pages/analytics.js') },
    { path: '/users', component: () => import('./pages/users.js') },
  ]
});

mount(document.getElementById('app'), () => router.outlet());
```

## Shell Layout

Create a sidebar-main skeleton in `src/components/shell.js`:

```js
import { tags } from 'decantr/tags';
import { text, cond } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { link } from 'decantr/router';
import { css } from 'decantr/css';
import { Button } from 'decantr/components';
import { icon } from 'decantr/components';

const { div, aside, main, header, span, nav } = tags;

const navItems = [
  { href: '/', label: 'Overview', icon: 'layout-dashboard' },
  { href: '/analytics', label: 'Analytics', icon: 'bar-chart-2' },
  { href: '/users', label: 'Users', icon: 'users' },
];

export function DashboardShell(...children) {
  const [collapsed, setCollapsed] = createSignal(false);

  return div({ class: css('_grid _h[100vh]'),
               style: () => `grid-template-columns:${collapsed() ? '64px' : '240px'} 1fr;grid-template-rows:auto 1fr` },

    // Sidebar
    aside({ class: css('_flex _col _gap1 _p3 _bgmuted _overflow[auto] _borderR'), style: 'grid-row:1/3' },
      div({ class: css('_flex _aic _jcsb _mb4') },
        cond(() => !collapsed(), () => span({ class: css('_heading5 _fgfg') }, 'Dashboard')),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCollapsed(c => !c) }, icon('panel-left'))
      ),
      nav({ class: css('_flex _col _gap1') },
        ...navItems.map(item =>
          link({ href: item.href, class: css('_flex _aic _gap2 _p2 _px3 _r2 _trans _fgfg _nounder') },
            icon(item.icon),
            cond(() => !collapsed(), () => text(() => item.label))
          )
        )
      )
    ),

    // Top header
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB') },
      span({ class: css('_heading4') }, 'Overview'),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm' }, icon('search')),
        Button({ variant: 'ghost', size: 'sm' }, icon('bell'))
      )
    ),

    // Main content
    main({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') }, ...children)
  );
}
```

## Overview Page

`src/pages/overview.js`:

```js
import { tags } from 'decantr/tags';
import { text, cond, list } from 'decantr/core';
import { createQuery } from 'decantr/data';
import { css } from 'decantr/css';
import { Statistic, DataTable, Skeleton } from 'decantr/components';
import { Chart } from 'decantr/chart';
import { DashboardShell } from '../components/shell.js';

const { div, h2 } = tags;

export default function OverviewPage() {
  const kpis = createQuery('kpis', ({ signal }) =>
    fetch('/api/kpis', { signal }).then(r => r.json()),
    { staleTime: 60000 }
  );

  const revenue = createQuery('revenue-chart', ({ signal }) =>
    fetch('/api/analytics/revenue', { signal }).then(r => r.json())
  );

  const recentOrders = createQuery('recent-orders', ({ signal }) =>
    fetch('/api/orders?limit=10', { signal }).then(r => r.json())
  );

  return DashboardShell(
    // KPI Grid
    div({ class: css('_flex _col _gap4') },
      h2({ class: css('_heading4') }, 'Key Metrics'),
      cond(() => kpis.data(), () =>
        div({ class: css('_grid _gc4 _gap4') },
          Statistic({ label: 'Revenue', value: kpis.data().revenue, prefix: '$', trend: 'up', trendValue: '+12.5%' }),
          Statistic({ label: 'Users', value: kpis.data().users, trend: 'up', trendValue: '+8.1%' }),
          Statistic({ label: 'Orders', value: kpis.data().orders, trend: 'down', trendValue: '-2.3%' }),
          Statistic({ label: 'Conversion', value: kpis.data().conversion, suffix: '%', trend: 'up', trendValue: '+0.5%' })
        ),
        () => div({ class: css('_grid _gc4 _gap4') },
          Skeleton({ height: '100px' }), Skeleton({ height: '100px' }),
          Skeleton({ height: '100px' }), Skeleton({ height: '100px' })
        )
      )
    ),

    // Charts
    div({ class: css('_grid _gc2 _gap4') },
      cond(() => revenue.data(), () =>
        Chart({ type: 'area', data: revenue.data(), x: 'date', y: 'value', title: 'Revenue Trend', height: 280 })
      ),
      cond(() => revenue.data(), () =>
        Chart({ type: 'bar', data: revenue.data(), x: 'date', y: 'orders', title: 'Orders', height: 280 })
      )
    ),

    // Recent Orders Table
    div({ class: css('_flex _col _gap4') },
      h2({ class: css('_heading4') }, 'Recent Orders'),
      cond(() => recentOrders.data(), () =>
        DataTable({
          columns: [
            { key: 'id', label: 'Order ID', sortable: true },
            { key: 'customer', label: 'Customer', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
            { key: 'status', label: 'Status' },
            { key: 'date', label: 'Date', sortable: true },
          ],
          data: recentOrders.data(),
          sortable: true,
          paginate: true,
          pageSize: 10
        })
      )
    )
  );
}
```

## Users Page with CRUD

`src/pages/users.js`:

```js
import { tags } from 'decantr/tags';
import { text, cond, list } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { createQuery, createMutation, queryClient } from 'decantr/data';
import { css } from 'decantr/css';
import { Button, Input, DataTable, Modal, Badge } from 'decantr/components';
import { DashboardShell } from '../components/shell.js';

const { div, h2, span } = tags;

export default function UsersPage() {
  const [search, setSearch] = createSignal('');
  const [showModal, setShowModal] = createSignal(false);

  const users = createQuery(
    () => `users-${search()}`,
    ({ signal }) => fetch(`/api/users?q=${search()}`, { signal }).then(r => r.json())
  );

  const deleteUser = createMutation(
    (id) => fetch(`/api/users/${id}`, { method: 'DELETE' }),
    { onSuccess: () => queryClient.invalidate('users') }
  );

  return DashboardShell(
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('_heading3') }, 'Users'),
      div({ class: css('_flex _gap3') },
        Input({ placeholder: 'Search users...', oninput: (e) => setSearch(e.target.value) }),
        Button({ variant: 'primary', onclick: () => setShowModal(true) }, 'Add User')
      )
    ),

    cond(() => users.data(), () =>
      DataTable({
        columns: [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status', render: (val) => Badge({ variant: val === 'active' ? 'success' : 'default' }, val) },
          { key: 'actions', label: '', render: (_, row) =>
            Button({ variant: 'destructive', size: 'sm', onclick: () => deleteUser.mutate(row.id) }, 'Delete')
          },
        ],
        data: users.data(),
        sortable: true,
        paginate: true,
        pageSize: 20
      })
    ),

    // Add User Modal
    Modal({ visible: showModal, onClose: () => setShowModal(false) },
      div({ class: css('_flex _col _gap4 _p4') },
        h2({ class: css('_heading4') }, 'Add New User'),
        Input({ label: 'Name', placeholder: 'Full name' }),
        Input({ label: 'Email', type: 'email', placeholder: 'user@example.com' }),
        div({ class: css('_flex _jce _gap2 _mt4') },
          Button({ variant: 'outline', onclick: () => setShowModal(false) }, 'Cancel'),
          Button({ variant: 'primary' }, 'Create User')
        )
      )
    )
  );
}
```

## Adding Real-Time Updates

Wire in a WebSocket for live KPI updates:

```js
import { createWebSocket, createEntityStore } from 'decantr/data';
import { createSignal } from 'decantr/state';

const [liveKpis, setLiveKpis] = createSignal(null);

const ws = createWebSocket('wss://api.example.com/ws', { parse: JSON.parse });
ws.on((msg) => {
  if (msg.type === 'kpi-update') setLiveKpis(msg.payload);
});

// Use liveKpis() in your Statistic components to show live values
```

## Key Takeaways

- Use `decantr.essence.json` to lock down the dashboard style and structure
- The sidebar-main skeleton provides the layout; pages fill the content
- `createQuery` handles all data fetching with caching and background refetch
- `createMutation` + `queryClient.invalidate()` for write operations
- `createWebSocket` for real-time updates
- The `command-center` style gives the HUD/tactical aesthetic
