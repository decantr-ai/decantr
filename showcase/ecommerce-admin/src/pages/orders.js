import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Card, Statistic, icon } from 'decantr/components';
import { orders } from '../data/mock.js';

const { div, span, h2 } = tags;

// ─── Group orders by status ──────────────────────────────────────
const columns = ['pending', 'processing', 'shipped', 'delivered'];
const grouped = {};
columns.forEach(s => { grouped[s] = []; });
orders.forEach(o => { if (grouped[o.status]) grouped[o.status].push(o); });

// ─── KPI computations ────────────────────────────────────────────
const kpis = [
  { label: 'Total Orders', value: orders.length, ic: 'shopping-cart', trend: 'up', trendValue: '+12%' },
  { label: 'Pending', value: grouped.pending.length, ic: 'clock', trend: 'down', trendValue: 'Needs review' },
  { label: 'Processing', value: grouped.processing.length, ic: 'loader', trend: 'up', trendValue: 'On track' },
  { label: 'Shipped', value: grouped.shipped.length, ic: 'truck', trend: 'up', trendValue: 'In transit' },
];

// ─── Payment badge ───────────────────────────────────────────────
function paymentBadge(payment) {
  const map = {
    'credit-card': { label: 'Card', variant: 'default', ic: 'credit-card' },
    'paypal': { label: 'PayPal', variant: 'info', ic: 'wallet' },
    'apple-pay': { label: 'Apple Pay', variant: 'success', ic: 'smartphone' },
  };
  const cfg = map[payment] || { label: payment, variant: 'default', ic: 'wallet' };
  return Badge({ variant: cfg.variant }, cfg.label);
}

// ─── Column color mapping ────────────────────────────────────────
const colConfig = {
  pending: { color: '_fgwarning', bg: '_bgwarning/10', ic: 'clock' },
  processing: { color: '_fginfo', bg: '_bginfo/10', ic: 'loader' },
  shipped: { color: '_fgprimary', bg: '_bgprimary/10', ic: 'truck' },
  delivered: { color: '_fgsuccess', bg: '_bgsuccess/10', ic: 'check-circle' },
};

// ─── KPI Grid ────────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger-scale') },
    ...kpis.map(kpi =>
      Statistic({
        label: kpi.label,
        value: kpi.value,
        trend: kpi.trend,
        trendValue: kpi.trendValue,
        animate: 1200,
        class: css('d-glass'),
      })
    )
  );
}

// ─── Order Card ──────────────────────────────────────────────────
function OrderCard(order) {
  return Card({ hover: true, class: css('d-glass _mb3') },
    Card.Body({ class: css('_flex _col _gap2') },
      div({ class: css('_flex _aic _jcsb') },
        span({ class: css('_textsm _bold _fgprimary') }, order.id),
        span({ class: css('_textxs _fgmuted') }, order.date)
      ),
      div({ class: css('_flex _aic _gap2') },
        icon('user', { size: '1em', class: css('_fgmuted') }),
        span({ class: css('_textsm _medium') }, order.customer)
      ),
      div({ class: css('_flex _aic _jcsb') },
        span({ class: css('_textsm _bold') }, `$${order.total.toFixed(2)}`),
        span({ class: css('_textxs _fgmuted') }, `${order.items} item${order.items > 1 ? 's' : ''}`)
      ),
      div({ class: css('_flex _aic _jcsb _mt1') },
        paymentBadge(order.payment)
      )
    )
  );
}

// ─── Kanban Column ───────────────────────────────────────────────
function KanbanColumn(status) {
  const cfg = colConfig[status];
  const items = grouped[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return div({ class: css('_flex _col _gap3 _flex1 _minw[260px]') },
    div({ class: css(`_flex _aic _gap2 _p3 _r3 ${cfg.bg}`) },
      icon(cfg.ic, { size: '1em', class: css(cfg.color) }),
      span({ class: css(`_textsm _bold ${cfg.color}`) }, label),
      div({ class: css('_mla') },
        span({ class: css(`_textxs _bold ${cfg.color} _bgbg _px2 _py1 _rfull`) }, String(items.length))
      )
    ),
    div({ class: css('_flex _col d-stagger-up') },
      ...items.map(order => OrderCard(order))
    )
  );
}

// ─── Kanban Board ────────────────────────────────────────────────
function KanbanBoard() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Order Pipeline'),
    div({ class: css('_flex _gap4 _oxauto _pb2') },
      ...columns.map(status => KanbanColumn(status))
    )
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function OrdersPage() {
  onMount(() => { document.title = 'Orders — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading4 _bold') }, 'Orders'),
      span({ class: css('_textxs _fgmuted') }, `${orders.length} total`)
    ),
    KpiGrid(),
    KanbanBoard()
  );
}
