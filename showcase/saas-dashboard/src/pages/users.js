import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, DataTable, Input, Select, Statistic, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const usersData = [
  { name: 'Alice Chen', email: 'alice@acme.io', role: 'Admin', status: 'Active', lastSeen: '2 min ago' },
  { name: 'Bob Patel', email: 'bob@acme.io', role: 'Engineer', status: 'Active', lastSeen: '15 min ago' },
  { name: 'Carol Liu', email: 'carol@acme.io', role: 'Designer', status: 'Active', lastSeen: '1 hour ago' },
  { name: 'Dan Kim', email: 'dan@acme.io', role: 'Engineer', status: 'Inactive', lastSeen: '3 days ago' },
  { name: 'Eve Torres', email: 'eve@acme.io', role: 'SRE', status: 'Active', lastSeen: '30 min ago' },
  { name: 'Frank Wu', email: 'frank@acme.io', role: 'Product', status: 'Active', lastSeen: '2 hours ago' },
  { name: 'Grace Park', email: 'grace@acme.io', role: 'Engineer', status: 'Inactive', lastSeen: '1 week ago' },
  { name: 'Hiro Tanaka', email: 'hiro@acme.io', role: 'Admin', status: 'Active', lastSeen: '5 min ago' },
];

const totalUsers = usersData.length;
const activeUsers = usersData.filter(u => u.status === 'Active').length;
const newThisMonth = 3;

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'User Overview'),
    div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger-scale') },
      Statistic({ label: 'Total Users', value: totalUsers, animate: true, class: css('d-glass') }),
      Statistic({ label: 'Active Users', value: activeUsers, trend: 'up', trendValue: `${Math.round(activeUsers / totalUsers * 100)}%`, animate: true, class: css('d-glass') }),
      Statistic({ label: 'New This Month', value: newThisMonth, trend: 'up', trendValue: '+2', animate: true, class: css('d-glass') }),
    )
  );
}

// ─── Toolbar ────────────────────────────────────────────────────
function Toolbar() {
  const [search, setSearch] = createSignal('');
  const [status, setStatus] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search users...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: status, onchange: v => setStatus(v), options: [
      { label: 'All Status', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ] }),
    div({ class: css('_h6 _w[1px] _bcborder _mx1') }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' }, icon('user-plus', { size: '1em' }), ' Add User')
  );
}

// ─── Users Table ────────────────────────────────────────────────
function UsersTable() {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastSeen', label: 'Last Seen', sortable: true },
  ];

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'User Directory'),
      span({ class: css('_textxs _fgmuted') }, `${usersData.length} records`)
    ),
    Card.Body({},
      DataTable({ columns, data: usersData, sortable: true, paginate: true, pageSize: 10 })
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, 'Last sync: ' + new Date().toLocaleTimeString()),
      Button({ variant: 'ghost', size: 'sm' }, icon('refresh-cw', { size: '1em' }), ' Refresh')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function UsersPage() {
  onMount(() => {
    document.title = 'Users — SaaS Dashboard';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    KpiGrid(),
    Toolbar(),
    UsersTable()
  );
}
