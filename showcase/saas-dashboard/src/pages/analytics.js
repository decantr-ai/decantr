import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, Chip, DataTable, DatePicker, Input, Select, Statistic, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';

const { div, span, h2 } = tags;

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

function FilterBar() {
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search signals...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: category, onchange: v => setCategory(v),
      options: [
        { label: 'All Sectors', value: 'all' },
        { label: 'Revenue', value: 'revenue' },
        { label: 'Users', value: 'users' },
        { label: 'Operations', value: 'ops' },
      ] }),
    DatePicker({ placeholder: 'Date range' }),
  );
}

function SummaryBar() {
  return div({ class: css('_grid _gc1 _sm:gc3 _gap3 d-stagger-scale') },
    Statistic({ label: 'AVG ORDER', value: 287, prefix: '$', trend: 'up', trendValue: '+3.2%', animate: 800, class: css('cc-glow') }),
    Statistic({ label: 'BOUNCE RATE', value: 34.2, suffix: '%', trend: 'down', trendValue: '-1.8%', animate: 800, class: css('cc-glow') }),
    Statistic({ label: 'SESSION TIME', value: 4.7, suffix: ' min', trend: 'up', trendValue: '+0.4', animate: 800, class: css('cc-glow') }),
  );
}

function ChartGrid() {
  const [range, setRange] = createSignal('30d');

  return div({ class: css('_flex _col _gap3') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('cc-label _fgmutedfg') }, 'TREND ANALYSIS'),
      Select({ value: range, onchange: v => setRange(v), options: [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
      ] })
    ),
    div({ class: css('_grid _gc1 _md:gc2 _gap3 d-stagger-up') },
      Card({ hover: true, class: css('cc-scanline') },
        Card.Header({ class: css('cc-bar') }, span({ class: css('cc-label') }, 'REVENUE'), span({ class: css('cc-indicator cc-indicator-ok cc-blink') })),
        Card.Body({}, Chart({ type: 'area', data: revenueData, x: 'date', y: 'value', height: 260 }))
      ),
      Card({ hover: true, class: css('cc-scanline') },
        Card.Header({ class: css('cc-bar') }, span({ class: css('cc-label') }, 'ORDERS')),
        Card.Body({}, Chart({ type: 'bar', data: ordersData, x: 'month', y: 'count', height: 260 }))
      ),
      Card({ hover: true, class: css('cc-scanline') },
        Card.Header({ class: css('cc-bar') }, span({ class: css('cc-label') }, 'CATEGORIES')),
        Card.Body({}, Chart({ type: 'pie', data: categoryData, x: 'name', y: 'value', height: 260 }))
      ),
      Card({ hover: true, class: css('cc-scanline') },
        Card.Header({ class: css('cc-bar') }, span({ class: css('cc-label') }, 'TRAFFIC')),
        Card.Body({}, Chart({ type: 'line', data: trafficData, x: 'date', y: 'visits', height: 260 }))
      ),
    )
  );
}

function AnalyticsTable() {
  const columns = [
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'sessions', label: 'Sessions', sortable: true },
    { key: 'conversion', label: 'Conv %', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true },
  ];
  const data = [
    { channel: 'Organic Search', sessions: 24500, conversion: '3.8%', revenue: '$142,300' },
    { channel: 'Direct', sessions: 18200, conversion: '4.2%', revenue: '$98,400' },
    { channel: 'Social Media', sessions: 12800, conversion: '2.1%', revenue: '$34,200' },
    { channel: 'Email', sessions: 8400, conversion: '5.6%', revenue: '$67,100' },
    { channel: 'Referral', sessions: 6200, conversion: '3.4%', revenue: '$28,900' },
    { channel: 'Paid Search', sessions: 15300, conversion: '2.9%', revenue: '$89,200' },
  ];

  return Card({ class: css('cc-scanline') },
    Card.Header({ class: css('cc-bar') },
      span({ class: css('cc-label') }, 'CHANNEL PERFORMANCE'),
      Button({ variant: 'ghost', size: 'sm', class: css('cc-label _textxs') }, icon('download', { size: '1em' }), ' EXPORT')
    ),
    Card.Body({},
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
    )
  );
}

export default function AnalyticsPage() {
  onMount(() => {
    document.title = 'Analytics — Command Center';
  });

  return div({ class: css('d-page-enter _flex _col _gap3') },
    FilterBar(),
    SummaryBar(),
    ChartGrid(),
    AnalyticsTable()
  );
}
