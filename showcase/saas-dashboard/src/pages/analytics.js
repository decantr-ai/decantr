import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, DataTable, DatePicker, Input, Select, Statistic, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
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
const categoryData = [
  { name: 'Electronics', value: 42 }, { name: 'Clothing', value: 28 },
  { name: 'Books', value: 18 }, { name: 'Home', value: 12 },
];
const trafficData = [
  { date: 'Jan', visits: 8400 }, { date: 'Feb', visits: 9200 },
  { date: 'Mar', visits: 8800 }, { date: 'Apr', visits: 11500 },
  { date: 'May', visits: 10200 }, { date: 'Jun', visits: 13100 },
];
const channelData = [
  { channel: 'Organic Search', sessions: 24500, conversion: '3.8%', revenue: '$142,300', trend: '+5.2%' },
  { channel: 'Direct', sessions: 18200, conversion: '4.2%', revenue: '$98,400', trend: '+2.1%' },
  { channel: 'Social Media', sessions: 12800, conversion: '2.1%', revenue: '$34,200', trend: '+12.8%' },
  { channel: 'Email', sessions: 8400, conversion: '5.6%', revenue: '$67,100', trend: '+3.4%' },
  { channel: 'Referral', sessions: 6200, conversion: '3.4%', revenue: '$28,900', trend: '-1.2%' },
  { channel: 'Paid Search', sessions: 15300, conversion: '2.9%', revenue: '$89,200', trend: '+7.6%' },
];

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search analytics...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: category, onchange: v => setCategory(v), options: [
      { label: 'All Channels', value: 'all' },
      { label: 'Revenue', value: 'revenue' },
      { label: 'Users', value: 'users' },
      { label: 'Operations', value: 'ops' },
    ] }),
    DatePicker({ placeholder: 'Date range' }),
    div({ class: css('_flex1') }),
    Button({ variant: 'ghost', size: 'sm' }, icon('refresh-cw', { size: '1em' }), ' Refresh')
  );
}

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Performance Summary'),
    div({ class: css('_grid _gc1 _sm:gc3 _gap4 d-stagger-scale') },
      Statistic({ label: 'Avg Order Value', value: 287, prefix: '$', trend: 'up', trendValue: '+3.2%', animate: 800, class: css('d-glass') }),
      Statistic({ label: 'Bounce Rate', value: 34.2, suffix: '%', trend: 'down', trendValue: '-1.8%', animate: 800, class: css('d-glass') }),
      Statistic({ label: 'Session Duration', value: 4.7, suffix: ' min', trend: 'up', trendValue: '+0.4', animate: 800, class: css('d-glass') }),
    )
  );
}

// ─── Chart Grid ─────────────────────────────────────────────────
function ChartGrid() {
  const [range, setRange] = createSignal('30d');

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5 _bold') }, 'Trend Analysis'),
      Select({ value: range, onchange: v => setRange(v), options: [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
      ] })
    ),
    div({ class: css('_grid _gc1 _md:gc2 _gap4 d-stagger-up') },
      div({ class: css('d-glass _p4 _flex _col _gap3') },
        span({ class: css('d-gradient-text _textsm _bold') }, 'Revenue'),
        Chart({ type: 'area', data: revenueData, x: 'date', y: 'value', height: 260 })
      ),
      div({ class: css('d-glass _p4 _flex _col _gap3') },
        span({ class: css('d-gradient-text _textsm _bold') }, 'Orders'),
        Chart({ type: 'bar', data: ordersData, x: 'month', y: 'count', height: 260 })
      ),
      div({ class: css('d-glass _p4 _flex _col _gap3') },
        span({ class: css('d-gradient-text _textsm _bold') }, 'Categories'),
        Chart({ type: 'pie', data: categoryData, x: 'name', y: 'value', height: 260 })
      ),
      div({ class: css('d-glass _p4 _flex _col _gap3') },
        span({ class: css('d-gradient-text _textsm _bold') }, 'Traffic'),
        Chart({ type: 'line', data: trafficData, x: 'date', y: 'visits', height: 260 })
      ),
    )
  );
}

// ─── Comparison Panel ───────────────────────────────────────────
function ComparisonPanel() {
  const metrics = [
    { label: 'Revenue', current: '$371K', previous: '$328K', change: '+13.1%', up: true },
    { label: 'Users', current: '84,230', previous: '77,920', change: '+8.1%', up: true },
    { label: 'Conversion', current: '3.24%', previous: '3.41%', change: '-0.17%', up: false },
    { label: 'Avg Session', current: '4.7m', previous: '4.3m', change: '+9.3%', up: true },
  ];

  return Card({ class: css('d-glass') },
    Card.Header({}, span({ class: css('d-gradient-text _textsm _bold') }, 'Period Comparison')),
    Card.Body({},
      div({ class: css('_flex _col _gap3 d-stagger') },
        div({ class: css('_grid _gc4 _gap2 _pb2 _borderB') },
          span({ class: css('_textxs _fgmuted _bold') }, 'Metric'),
          span({ class: css('_textxs _fgmuted _bold _tr') }, 'Current'),
          span({ class: css('_textxs _fgmuted _bold _tr') }, 'Previous'),
          span({ class: css('_textxs _fgmuted _bold _tr') }, 'Change'),
        ),
        ...metrics.map(m =>
          div({ class: css('_grid _gc4 _gap2 _py2 _borderB') },
            span({ class: css('_textsm _medium') }, m.label),
            span({ class: css('_textsm _tr _fgfg') }, m.current),
            span({ class: css('_textsm _tr _fgmuted') }, m.previous),
            span({ class: css(`_textsm _tr _bold ${m.up ? '_fgsuccess' : '_fgerror'}`) }, m.change),
          )
        )
      )
    )
  );
}

// ─── Analytics Table ────────────────────────────────────────────
function AnalyticsTable() {
  const columns = [
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'sessions', label: 'Sessions', sortable: true },
    { key: 'conversion', label: 'Conv %', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true },
    { key: 'trend', label: 'Trend', sortable: true },
  ];

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Channel Performance'),
      Button({ variant: 'ghost', size: 'sm' }, icon('download', { size: '1em' }), ' Export')
    ),
    Card.Body({},
      DataTable({ columns, data: channelData, sortable: true, paginate: true, pageSize: 10 })
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function AnalyticsPage() {
  onMount(() => {
    document.title = 'Analytics — SaaS Dashboard';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    FilterBar(),
    KpiGrid(),
    ChartGrid(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      ComparisonPanel(),
      div({ class: css('_span1 _lg:span2') }, AnalyticsTable())
    )
  );
}
