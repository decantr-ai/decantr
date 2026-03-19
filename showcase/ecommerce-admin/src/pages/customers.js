import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Input, Select, Statistic, icon } from 'decantr/components';
import { customers } from '../data/mock.js';

const { div, span, h2 } = tags;

const totalCustomers = customers.length;
const activeCustomers = customers.filter(c => c.status === 'active').length;
const vipCustomers = customers.filter(c => c.status === 'vip').length;

const statusVariant = s =>
  s === 'active' ? 'default' : s === 'vip' ? 'primary' :
  s === 'new' ? 'info' : 'muted';

const cities = [...new Set(customers.map(c => c.city))].sort();

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Customer Overview'),
    div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger-scale') },
      Statistic({ label: 'Total Customers', value: totalCustomers, animate: true, class: css('d-glass') }),
      Statistic({ label: 'Active', value: activeCustomers, trend: 'up', trendValue: `${Math.round(activeCustomers / totalCustomers * 100)}%`, animate: true, class: css('d-glass') }),
      Statistic({ label: 'VIP', value: vipCustomers, trend: 'up', trendValue: '+1', animate: true, class: css('d-glass') }),
    )
  );
}

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [search, setSearch] = createSignal('');
  const [status, setStatus] = createSignal('all');
  const [city, setCity] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search customers...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: status, onchange: v => setStatus(v), options: [
      { label: 'All Status', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'VIP', value: 'vip' },
      { label: 'New', value: 'new' },
      { label: 'Inactive', value: 'inactive' },
    ] }),
    Select({ value: city, onchange: v => setCity(v), options: [
      { label: 'All Cities', value: 'all' },
      ...cities.map(c => ({ label: c, value: c }))
    ] }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' }, icon('user-plus', { size: '1em' }), ' Add Customer')
  );
}

// ─── Customer Table ─────────────────────────────────────────────
function CustomerTable() {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'orders', label: 'Orders', sortable: true },
    { key: 'lifetime', label: 'Lifetime Value', sortable: true },
    { key: 'joined', label: 'Joined', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'city', label: 'City', sortable: true },
  ];

  const data = customers.map(c => ({
    ...c,
    lifetime: `$${c.lifetime.toLocaleString()}`,
    status: Badge({ variant: statusVariant(c.status), size: 'sm' }, c.status),
  }));

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Customer Directory'),
      span({ class: css('_textxs _fgmuted') }, `${customers.length} records`)
    ),
    Card.Body({},
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, 'Last sync: ' + new Date().toLocaleTimeString()),
      Button({ variant: 'ghost', size: 'sm' }, icon('download', { size: '1em' }), ' Export')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function CustomersPage() {
  onMount(() => { document.title = 'Customers — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    KpiGrid(),
    FilterBar(),
    CustomerTable()
  );
}
