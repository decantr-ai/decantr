import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Input, Select, Statistic, icon } from 'decantr/components';
import { promotions } from '../data/mock.js';

const { div, span, h2 } = tags;

const activePromos = promotions.filter(p => p.status === 'active').length;
const totalUses = promotions.reduce((s, p) => s + p.usageCount, 0);
const revenueImpact = 24500;

const typeVariant = t =>
  t === 'percentage' ? 'primary' : t === 'fixed' ? 'info' : 'success';

const statusVariant = s => s === 'active' ? 'success' : 'muted';

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Promotions Overview'),
    div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger-scale') },
      Statistic({ label: 'Active Promos', value: activePromos, animate: true, class: css('d-glass') }),
      Statistic({ label: 'Total Uses', value: totalUses, animate: true, class: css('d-glass') }),
      Statistic({ label: 'Revenue Impact', value: revenueImpact, prefix: '$', trend: 'up', trendValue: '+12%', animate: true, class: css('d-glass') }),
    )
  );
}

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [search, setSearch] = createSignal('');
  const [type, setType] = createSignal('all');
  const [status, setStatus] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search promotions...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: type, onchange: v => setType(v), options: [
      { label: 'All Types', value: 'all' },
      { label: 'Percentage', value: 'percentage' },
      { label: 'Fixed', value: 'fixed' },
      { label: 'Free Shipping', value: 'free-shipping' },
    ] }),
    Select({ value: status, onchange: v => setStatus(v), options: [
      { label: 'All Status', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Expired', value: 'expired' },
    ] }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' }, icon('plus', { size: '1em' }), ' New Promo')
  );
}

// ─── Promotions Table ───────────────────────────────────────────
function PromotionsTable() {
  const columns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'discount', label: 'Discount', sortable: true },
    { key: 'usage', label: 'Usage', sortable: true },
    { key: 'minOrder', label: 'Min Order', sortable: true },
    { key: 'expiry', label: 'Expiry', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  const formatDiscount = p =>
    p.type === 'percentage' ? `${p.discount}%` :
    p.type === 'fixed' ? `$${p.discount}` : 'Free';

  const data = promotions.map(p => ({
    code: p.code,
    type: Badge({ variant: typeVariant(p.type), size: 'sm' }, p.type),
    discount: formatDiscount(p),
    usage: `${p.usageCount.toLocaleString()}${p.maxUses ? ' / ' + p.maxUses.toLocaleString() : ''}`,
    minOrder: p.minOrder > 0 ? `$${p.minOrder}` : '--',
    expiry: p.expiry || 'Never',
    status: Badge({ variant: statusVariant(p.status), size: 'sm' }, p.status),
  }));

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Promotion Codes'),
      span({ class: css('_textxs _fgmuted') }, `${promotions.length} codes`)
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
export default function PromotionsPage() {
  onMount(() => { document.title = 'Promotions — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    KpiGrid(),
    FilterBar(),
    PromotionsTable()
  );
}
