import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Drawer, Input, Select, Statistic, icon } from 'decantr/components';

const { div, span, p } = tags;

const usersData = [
  { name: 'Alice Chen', email: 'alice@acme.io', role: 'Admin', status: 'active', lastSeen: '2 min ago' },
  { name: 'Bob Patel', email: 'bob@acme.io', role: 'Engineer', status: 'active', lastSeen: '15 min ago' },
  { name: 'Carol Liu', email: 'carol@acme.io', role: 'Designer', status: 'active', lastSeen: '1 hour ago' },
  { name: 'Dan Kim', email: 'dan@acme.io', role: 'Engineer', status: 'inactive', lastSeen: '3 days ago' },
  { name: 'Eve Torres', email: 'eve@acme.io', role: 'SRE', status: 'active', lastSeen: '30 min ago' },
  { name: 'Frank Wu', email: 'frank@acme.io', role: 'Product', status: 'active', lastSeen: '2 hours ago' },
  { name: 'Grace Park', email: 'grace@acme.io', role: 'Engineer', status: 'inactive', lastSeen: '1 week ago' },
  { name: 'Hiro Tanaka', email: 'hiro@acme.io', role: 'Admin', status: 'active', lastSeen: '5 min ago' },
];

function UserStats() {
  const total = usersData.length;
  const active = usersData.filter(u => u.status === 'active').length;
  const inactive = total - active;

  return div({ class: css('_grid _gc1 _sm:gc3 _gap3 d-stagger-scale') },
    Statistic({ label: 'TOTAL PERSONNEL', value: total, animate: true, class: css('cc-glow') }),
    Statistic({ label: 'ACTIVE', value: active, trend: 'up', trendValue: `${Math.round(active / total * 100)}%`, animate: true }),
    Statistic({ label: 'INACTIVE', value: inactive, trend: 'down', trendValue: `${Math.round(inactive / total * 100)}%`, animate: true }),
  );
}

function UsersTable() {
  const [search, setSearch] = createSignal('');
  const [status, setStatus] = createSignal('all');
  const [drawerVis, setDrawerVis] = createSignal(false);

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'lastSeen', label: 'Last Seen', sortable: true },
  ];

  return div({ class: css('_flex _col _gap3') },
    div({ class: css('_flex _gap3 _aic _flexWrap') },
      Input({ placeholder: 'Search personnel...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
      Select({ value: status, onchange: v => setStatus(v), options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ] }),
      div({ class: css('_flex1') }),
      Button({ variant: 'primary', size: 'sm', class: css('cc-label _textxs') }, icon('user-plus', { size: '1em' }), ' ADD USER')
    ),
    Card({ class: css('cc-scanline') },
      Card.Header({ class: css('cc-bar') },
        span({ class: css('cc-label') }, 'PERSONNEL REGISTRY'),
        div({ class: css('_flex _gap2 _aic') },
          span({ class: css('cc-indicator cc-indicator-ok cc-blink') }),
          span({ class: css('cc-data _textxs') }, `${usersData.length} RECORDS`)
        )
      ),
      Card.Body({},
        DataTable({ columns, data: usersData, sortable: true, paginate: true, pageSize: 10 })
      ),
      Card.Footer({ class: css('cc-bar-bottom') },
        span({ class: css('cc-label _textxs _fgmuted') }, 'LAST SYNC: ' + new Date().toLocaleTimeString()),
        Button({ variant: 'ghost', size: 'sm', class: css('cc-label _textxs') }, icon('refresh-cw', { size: '1em' }), ' REFRESH')
      )
    ),
    Drawer({
      visible: drawerVis,
      onClose: () => setDrawerVis(false),
      title: 'User Details',
      side: 'right',
      size: '400px'
    },
      p({ class: css('_fgmuted _body') }, 'Select a user row to view details.')
    )
  );
}

export default function UsersPage() {
  onMount(() => {
    document.title = 'Users — Command Center';
  });

  return div({ class: css('d-page-enter _flex _col _gap3') },
    UserStats(),
    UsersTable()
  );
}
