import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { Card, Select, Statistic, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';
import { salesByMonth, salesByCategory, trafficSources } from '../data/mock.js';

const { div, span, h2 } = tags;

// ─── KPIs ────────────────────────────────────────────────────────
const kpis = [
  { label: 'Avg Order Value', value: 68.42, prefix: '$', trend: 'up', trendValue: '+5.3%', ic: 'receipt' },
  { label: 'Bounce Rate', value: 32.1, suffix: '%', trend: 'down', trendValue: '-1.8%', ic: 'log-out' },
  { label: 'Sessions', value: 124600, trend: 'up', trendValue: '+11.2%', ic: 'activity' },
];

// ─── Comparison data ─────────────────────────────────────────────
const comparison = [
  { metric: 'Revenue', current: '$74,600', previous: '$61,300', change: '+21.7%', up: true },
  { metric: 'Orders', current: '521', previous: '445', change: '+17.1%', up: true },
  { metric: 'Avg Order', current: '$68.42', previous: '$65.10', change: '+5.1%', up: true },
  { metric: 'New Customers', current: '189', previous: '204', change: '-7.4%', up: false },
  { metric: 'Return Rate', current: '4.2%', previous: '5.1%', change: '-17.6%', up: true },
];

// ─── Traffic line data ───────────────────────────────────────────
const trafficTrend = [
  { month: 'Oct', visits: 98400 }, { month: 'Nov', visits: 112300 },
  { month: 'Dec', visits: 134800 }, { month: 'Jan', visits: 105200 },
  { month: 'Feb', visits: 118700 }, { month: 'Mar', visits: 124600 },
];

// ─── Filter Bar ──────────────────────────────────────────────────
function FilterBar() {
  return div({ class: css('_flex _wrap _aic _gap4') },
    div({ class: css('_flex _aic _gap2') },
      icon('calendar', { size: '1em', class: css('_fgmuted') }),
      Select({ value: '30d', options: [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'This year', value: 'ytd' },
      ] })
    ),
    div({ class: css('_flex _aic _gap2') },
      icon('filter', { size: '1em', class: css('_fgmuted') }),
      Select({ value: 'all', options: [
        { label: 'All Categories', value: 'all' },
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing', value: 'clothing' },
        { label: 'Home & Kitchen', value: 'home' },
        { label: 'Sports', value: 'sports' },
      ] })
    )
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger-scale') },
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
  );
}

// ─── Chart Grid ──────────────────────────────────────────────────
function ChartGrid() {
  return div({ class: css('_grid _gc1 _md:gc2 _gap4 d-stagger-up') },
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _textsm _bold') }, 'Revenue Trend'),
      Chart({ type: 'area', data: salesByMonth, x: 'month', y: 'revenue', height: 240 })
    ),
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _textsm _bold') }, 'Order Volume'),
      Chart({ type: 'bar', data: salesByMonth, x: 'month', y: 'orders', height: 240 })
    ),
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _textsm _bold') }, 'Category Split'),
      Chart({ type: 'pie', data: salesByCategory, x: 'category', y: 'revenue', height: 240 })
    ),
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _textsm _bold') }, 'Traffic Sources'),
      Chart({ type: 'line', data: trafficTrend, x: 'month', y: 'visits', height: 240 })
    )
  );
}

// ─── Comparison Panel ────────────────────────────────────────────
function ComparisonPanel() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'This Month vs Last Month')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...comparison.map(row =>
          div({ class: css('_flex _aic _jcsb _py3 _borderB') },
            span({ class: css('_textsm _fgmutedfg _medium') }, row.metric),
            div({ class: css('_flex _aic _gap4') },
              span({ class: css('_textsm _medium') }, row.current),
              span({ class: css('_textxs _fgmuted') }, row.previous),
              span({ class: css(`_textxs _bold ${row.up ? '_fgsuccess' : '_fgerror'}`) },
                row.change
              )
            )
          )
        )
      )
    )
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  onMount(() => { document.title = 'Analytics — eCommerce Admin'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading4 _bold') }, 'Analytics'),
      span({ class: css('_textxs _fgmuted') }, 'Updated just now')
    ),
    FilterBar(),
    KpiGrid(),
    ChartGrid(),
    ComparisonPanel()
  );
}
