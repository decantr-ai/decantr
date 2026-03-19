import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Statistic, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';
import { navigate } from 'decantr/router';
import { orders, salesByMonth, salesByCategory } from '../data/mock.js';

const { div, span, h2 } = tags;

// ─── KPI data ────────────────────────────────────────────────────
const kpis = [
  { label: 'Total Revenue', value: 126900, prefix: '$', trend: 'up', trendValue: '+14.2%', ic: 'dollar-sign' },
  { label: 'Orders Today', value: 47, trend: 'up', trendValue: '+6', ic: 'shopping-cart' },
  { label: 'Active Customers', value: 1234, trend: 'up', trendValue: '+3.1%', ic: 'users' },
  { label: 'Conversion Rate', value: 3.8, suffix: '%', trend: 'up', trendValue: '+0.4%', ic: 'target' },
];

// ─── Quick Actions ───────────────────────────────────────────────
const quickActions = [
  { icon: 'plus', label: 'Add Product', href: '/products' },
  { icon: 'shopping-cart', label: 'New Order', href: '/orders' },
  { icon: 'warehouse', label: 'Manage Inventory', href: '/inventory' },
  { icon: 'bar-chart', label: 'View Analytics', href: '/analytics' },
  { icon: 'tag', label: 'Create Promo', href: '/promotions' },
  { icon: 'image', label: 'Upload Media', href: '/media-library' },
  { icon: 'headphones', label: 'Customer Support', href: '/support' },
  { icon: 'settings', label: 'Store Settings', href: '/store-settings' },
];

// ─── Activity feed ───────────────────────────────────────────────
const recentActivity = [
  { user: 'Emma Wilson', action: 'placed order #ORD-1001', time: '5 min ago', variant: 'success', ic: 'shopping-bag' },
  { user: 'James Chen', action: 'shipped order #ORD-1002', time: '22 min ago', variant: 'info', ic: 'truck' },
  { user: 'Sofia Rodriguez', action: 'signed up as a new customer', time: '1 hour ago', variant: 'default', ic: 'user-plus' },
  { user: 'Liam O\'Brien', action: 'left a 5-star review', time: '2 hours ago', variant: 'warning', ic: 'star' },
  { user: 'Aria Patel', action: 'requested a refund for #ORD-1005', time: '3 hours ago', variant: 'error', ic: 'undo' },
];

// ─── KPI Grid ────────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5 _bold') }, 'Key Metrics'),
      span({ class: css('_textxs _fgmuted') }, new Date().toLocaleDateString())
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger-scale') },
      ...kpis.map(kpi =>
        Statistic({
          label: kpi.label,
          value: kpi.value,
          prefix: kpi.prefix,
          suffix: kpi.suffix,
          trend: kpi.trend,
          trendValue: kpi.trendValue,
          animate: 1200,
          class: css('d-glass'),
        })
      )
    )
  );
}

// ─── Quick Actions ───────────────────────────────────────────────
function QuickActionsGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Quick Actions'),
    div({ class: css('_grid _gc2 _sm:gc4 _lg:gc8 _gap3 d-stagger') },
      ...quickActions.map(action =>
        Card({ hover: true, class: css('d-glass _pointer'), onclick: () => navigate(action.href) },
          Card.Body({ class: css('_flex _col _aic _gap2 _p3 _tc') },
            div({ class: css('_w8 _h8 _flex _center _r2 _bgprimary/10') },
              icon(action.icon, { size: '1em', class: css('_fgprimary') })
            ),
            span({ class: css('_textxs _medium') }, action.label)
          )
        )
      )
    )
  );
}

// ─── Charts ──────────────────────────────────────────────────────
function ChartGrid() {
  return div({ class: css('_grid _gc1 _lg:gc2 _gap4 d-stagger-up') },
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _textsm _bold') }, 'Monthly Revenue'),
      Chart({ type: 'area', data: salesByMonth, x: 'month', y: 'revenue', height: 240 })
    ),
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _textsm _bold') }, 'Orders by Category'),
      Chart({ type: 'pie', data: salesByCategory, x: 'category', y: 'revenue', height: 240 })
    )
  );
}

// ─── Activity Feed ───────────────────────────────────────────────
function ActivityFeed() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Recent Activity')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...recentActivity.map(item =>
          div({ class: css('_flex _gap3 _aic _py2 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon(item.ic, { size: '1em', class: css('_fgprimary') })
            ),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm') },
                span({ class: css('_medium') }, item.user),
                span({ class: css('_fgmuted') }, ` ${item.action}`)
              ),
              span({ class: css('_textxs _fgmuted') }, item.time)
            ),
            Chip({
              label: item.variant === 'success' ? 'OK' : item.variant === 'error' ? 'ALERT' : item.variant === 'warning' ? 'NEW' : 'INFO',
              variant: item.variant === 'success' ? 'success' : item.variant === 'error' ? 'error' : item.variant === 'warning' ? 'warning' : 'info',
              size: 'xs'
            })
          )
        )
      )
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, `${recentActivity.length} events today`),
      Button({ variant: 'ghost', size: 'sm' }, 'View All')
    )
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function OverviewPage() {
  onMount(() => { document.title = 'Overview — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    KpiGrid(),
    QuickActionsGrid(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, ChartGrid()),
      ActivityFeed()
    )
  );
}
