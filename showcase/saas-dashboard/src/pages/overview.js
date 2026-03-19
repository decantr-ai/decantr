import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Select, Statistic, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const kpis = [
  { label: 'Total Revenue', value: 1248500, prefix: '$', trend: 'up', trendValue: '+12.5%', ic: 'dollar-sign' },
  { label: 'Active Users', value: 84230, trend: 'up', trendValue: '+8.1%', ic: 'users' },
  { label: 'Orders', value: 6420, trend: 'down', trendValue: '-2.3%', ic: 'shopping-cart' },
  { label: 'Conversion', value: 3.24, suffix: '%', trend: 'up', trendValue: '+0.5%', ic: 'target' },
];

const quickActions = [
  { icon: 'user-plus', label: 'Add User', handler: () => {} },
  { icon: 'file-plus', label: 'New Report', handler: () => {} },
  { icon: 'settings', label: 'Settings', handler: () => {} },
  { icon: 'download', label: 'Export Data', handler: () => {} },
  { icon: 'bell', label: 'Notifications', handler: () => {} },
  { icon: 'bar-chart', label: 'Analytics', handler: () => {} },
  { icon: 'shield', label: 'Security', handler: () => {} },
  { icon: 'help-circle', label: 'Support', handler: () => {} },
];

const revenueData = [
  { date: 'Jan', value: 42000 }, { date: 'Feb', value: 51000 },
  { date: 'Mar', value: 48000 }, { date: 'Apr', value: 62000 },
  { date: 'May', value: 58000 }, { date: 'Jun', value: 71000 },
];
const ordersData = [
  { month: 'Jan', count: 120 }, { month: 'Feb', count: 145 },
  { month: 'Mar', count: 132 }, { month: 'Apr', count: 168 },
  { month: 'May', count: 155 }, { month: 'Jun', count: 192 },
];
const activities = [
  { user: 'Alice Chen', action: 'deployed v2.4.1 to production', time: '2 min ago', variant: 'success', ic: 'rocket' },
  { user: 'Bob Patel', action: 'opened pull request #142', time: '15 min ago', variant: 'default', ic: 'git-pull-request' },
  { user: 'Carol Liu', action: 'resolved incident INC-089', time: '1 hour ago', variant: 'success', ic: 'check-circle' },
  { user: 'Dan Kim', action: 'merged branch feature/auth', time: '3 hours ago', variant: 'default', ic: 'git-merge' },
  { user: 'Eve Torres', action: 'triggered alert: CPU > 90%', time: '4 hours ago', variant: 'error', ic: 'alert-triangle' },
];

// ─── KPI Grid ───────────────────────────────────────────────────
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

// ─── Quick Actions ──────────────────────────────────────────────
function QuickActions() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Quick Actions'),
    div({ class: css('_grid _gc2 _sm:gc4 _lg:gc8 _gap3 d-stagger') },
      ...quickActions.map(action =>
        Card({ hover: true, class: css('d-glass _cursor[pointer]'), onclick: action.handler },
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

// ─── Chart Grid ─────────────────────────────────────────────────
function ChartGrid() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5 _bold') }, 'Analytics'),
      Select({ value: '30d', options: [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
      ] })
    ),
    div({ class: css('_grid _gc1 _md:gc2 _gap4 d-stagger-up') },
      div({ class: css('d-glass _p4 _flex _col _gap3') },
        span({ class: css('d-gradient-text _textsm _bold') }, 'Revenue Trend'),
        Chart({ type: 'area', data: revenueData, x: 'date', y: 'value', height: 240 })
      ),
      div({ class: css('d-glass _p4 _flex _col _gap3') },
        span({ class: css('d-gradient-text _textsm _bold') }, 'Order Volume'),
        Chart({ type: 'bar', data: ordersData, x: 'month', y: 'count', height: 240 })
      ),
    )
  );
}

// ─── Activity Feed ──────────────────────────────────────────────
function ActivityFeed() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Recent Activity'),
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...activities.map(item =>
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
              label: item.variant === 'success' ? 'OK' : item.variant === 'error' ? 'ALERT' : 'INFO',
              variant: item.variant === 'success' ? 'success' : item.variant === 'error' ? 'error' : 'info',
              size: 'xs'
            })
          )
        )
      )
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, `${activities.length} events`),
      Button({ variant: 'ghost', size: 'sm' }, 'View All')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function OverviewPage() {
  onMount(() => {
    document.title = 'Overview — SaaS Dashboard';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    KpiGrid(),
    QuickActions(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, ChartGrid()),
      ActivityFeed()
    )
  );
}
