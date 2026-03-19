import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, Chip, DataTable, Statistic, icon } from 'decantr/components';
import { customers, orders } from '../data/mock.js';

const { div, span, h2, h3 } = tags;

// ─── Mock customer detail ───────────────────────────────────────
const customer = customers[4]; // Aria Patel — VIP
const customerOrders = orders.filter(o => o.customer === customer.name).slice(0, 6);
const totalOrders = customer.orders;
const lifetimeValue = customer.lifetime;
const avgOrderValue = +(lifetimeValue / totalOrders).toFixed(2);
const lastOrderDate = customerOrders.length ? customerOrders[0].date : 'N/A';

const activityFeed = [
  { action: 'Placed order ORD-1005', time: 'Mar 14, 2026', ic: 'shopping-cart', variant: 'primary' },
  { action: 'Left 5-star review on Headphones', time: 'Mar 12, 2026', ic: 'star', variant: 'warning' },
  { action: 'Opened support ticket TKT-005', time: 'Mar 16, 2026', ic: 'headphones', variant: 'info' },
  { action: 'Redeemed VIP30 promo code', time: 'Mar 10, 2026', ic: 'tag', variant: 'success' },
  { action: 'Updated shipping address', time: 'Mar 8, 2026', ic: 'map-pin', variant: 'default' },
  { action: 'Returned item from ORD-1003', time: 'Mar 5, 2026', ic: 'rotate-ccw', variant: 'error' },
  { action: 'Placed order ORD-1003', time: 'Mar 2, 2026', ic: 'shopping-cart', variant: 'primary' },
];

const statusVariant = s =>
  s === 'delivered' ? 'success' : s === 'shipped' ? 'info' :
  s === 'processing' ? 'warning' : s === 'cancelled' ? 'error' : 'default';

// ─── Profile Header ────────────────────────────────────────────
function ProfileHeader() {
  return Card({ class: css('d-glass d-mesh') },
    Card.Body({ class: css('_flex _gap6 _aic _p6 _flexWrap') },
      Avatar({ name: customer.name, size: 'xl', class: css('aura-glow') }),
      div({ class: css('_flex _col _gap2 _flex1') },
        div({ class: css('_flex _aic _gap3') },
          h2({ class: css('d-gradient-text _heading4 _bold') }, customer.name),
          Badge({ variant: 'primary', size: 'sm' }, customer.status.toUpperCase()),
          customer.status === 'vip'
            ? Chip({ label: 'VIP Member', variant: 'warning', size: 'sm' })
            : null
        ),
        div({ class: css('_flex _gap4 _flexWrap') },
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('mail', { size: '1em' }), ` ${customer.email}`),
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('map-pin', { size: '1em' }), ` ${customer.city}`),
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('calendar', { size: '1em' }), ` Joined ${customer.joined}`)
        )
      ),
      div({ class: css('_flex _gap2') },
        Button({ variant: 'primary', size: 'sm' }, icon('mail', { size: '1em' }), ' Email'),
        Button({ variant: 'ghost', size: 'sm' }, icon('more-horizontal', { size: '1em' }))
      )
    )
  );
}

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger-scale') },
    Statistic({ label: 'Total Orders', value: totalOrders, animate: true, class: css('d-glass') }),
    Statistic({ label: 'Lifetime Value', value: lifetimeValue, prefix: '$', animate: true, class: css('d-glass') }),
    Statistic({ label: 'Avg Order Value', value: avgOrderValue, prefix: '$', animate: true, class: css('d-glass') }),
    Statistic({ label: 'Last Order', value: lastOrderDate, animate: false, class: css('d-glass') }),
  );
}

// ─── Order History ──────────────────────────────────────────────
function OrderHistory() {
  const columns = [
    { key: 'id', label: 'Order ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'status', label: 'Status' },
  ];
  const data = customerOrders.map(o => ({
    ...o,
    total: `$${o.total.toFixed(2)}`,
    status: Badge({ variant: statusVariant(o.status), size: 'sm' }, o.status),
  }));

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Order History'),
      span({ class: css('_textxs _fgmuted') }, `${customerOrders.length} orders`)
    ),
    Card.Body({},
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 5 })
    )
  );
}

// ─── Activity Feed ──────────────────────────────────────────────
function ActivityFeed() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Recent Activity')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...activityFeed.map(item =>
          div({ class: css('_flex _gap3 _aic _py2 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon(item.ic, { size: '1em', class: css('_fgprimary') })
            ),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm') }, item.action),
              span({ class: css('_textxs _fgmuted') }, item.time)
            )
          )
        )
      )
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, `${activityFeed.length} events`),
      Button({ variant: 'ghost', size: 'sm' }, 'View All')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function CustomerDetailPage() {
  onMount(() => { document.title = `${customer.name} — eCommerce Admin`; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    ProfileHeader(),
    KpiGrid(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, OrderHistory()),
      ActivityFeed()
    )
  );
}
