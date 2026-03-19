import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Select, Statistic, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const revenueOverTime = [
  { month: 'Oct', value: 68000 }, { month: 'Nov', value: 74000 },
  { month: 'Dec', value: 82000 }, { month: 'Jan', value: 91000 },
  { month: 'Feb', value: 87000 }, { month: 'Mar', value: 105000 },
];
const costByDept = [
  { dept: 'Engineering', cost: 142000 }, { dept: 'Marketing', cost: 68000 },
  { dept: 'Sales', cost: 54000 }, { dept: 'Support', cost: 32000 },
  { dept: 'Operations', cost: 28000 }, { dept: 'HR', cost: 18000 },
];

const reportEntries = [
  { name: 'Q1 Revenue Summary', type: 'Financial', date: 'Mar 15, 2026', status: 'complete', actions: 'download' },
  { name: 'User Growth Analysis', type: 'Product', date: 'Mar 12, 2026', status: 'complete', actions: 'download' },
  { name: 'Marketing ROI Report', type: 'Marketing', date: 'Mar 10, 2026', status: 'complete', actions: 'download' },
  { name: 'Infrastructure Costs', type: 'Operations', date: 'Mar 8, 2026', status: 'complete', actions: 'download' },
  { name: 'Q2 Forecast Model', type: 'Financial', date: 'Mar 14, 2026', status: 'draft', actions: 'edit' },
  { name: 'Churn Risk Assessment', type: 'Product', date: 'Mar 11, 2026', status: 'in-progress', actions: 'view' },
  { name: 'Sales Pipeline Review', type: 'Sales', date: 'Mar 9, 2026', status: 'complete', actions: 'download' },
  { name: 'Support Ticket Trends', type: 'Support', date: 'Mar 7, 2026', status: 'in-progress', actions: 'view' },
];

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [type, setType] = createSignal('all');
  const [dept, setDept] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _wrap') },
    Select({ value: type, onchange: v => setType(v), options: [
      { label: 'All Types', value: 'all' },
      { label: 'Financial', value: 'Financial' },
      { label: 'Product', value: 'Product' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Operations', value: 'Operations' },
      { label: 'Sales', value: 'Sales' },
    ] }),
    Select({ value: dept, onchange: v => setDept(v), options: [
      { label: 'All Departments', value: 'all' },
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Sales', value: 'Sales' },
      { label: 'Support', value: 'Support' },
      { label: 'Operations', value: 'Operations' },
    ] }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' }, icon('plus', { size: '1em' }), ' New Report')
  );
}

// ─── Chart Grid ─────────────────────────────────────────────────
function ChartGrid() {
  return div({ class: css('_grid _gc1 _md:gc2 _gap4 d-stagger-up') },
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _bold _textsm') }, 'Revenue Trend'),
      Chart({ type: 'area', data: revenueOverTime, x: 'month', y: 'value', height: 240 })
    ),
    div({ class: css('d-glass _p4 _flex _col _gap3') },
      span({ class: css('d-gradient-text _bold _textsm') }, 'Cost by Department'),
      Chart({ type: 'bar', data: costByDept, x: 'dept', y: 'cost', height: 240 })
    )
  );
}

// ─── Scorecard ──────────────────────────────────────────────────
function Scorecard() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger-scale') },
    Statistic({ label: 'REVENUE', value: 507000, prefix: '$', trend: 'up', trendValue: '+14.2%', animate: 1000, class: css('d-glass') }),
    Statistic({ label: 'COSTS', value: 342000, prefix: '$', trend: 'down', trendValue: '-3.1%', animate: 1000, class: css('d-glass') }),
    Statistic({ label: 'PROFIT', value: 165000, prefix: '$', trend: 'up', trendValue: '+28.6%', animate: 1000, class: css('d-glass') }),
    Statistic({ label: 'ROI', value: 48.2, suffix: '%', trend: 'up', trendValue: '+5.3%', animate: 1000, class: css('d-glass') }),
  );
}

// ─── Report Table ───────────────────────────────────────────────
function ReportTable() {
  const statusVariant = s => s === 'complete' ? 'success' : s === 'in-progress' ? 'warning' : 'default';

  const columns = [
    { key: 'name', label: 'Report Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '' },
  ];

  const data = reportEntries.map(r => ({
    ...r,
    status: Badge({ variant: statusVariant(r.status), size: 'sm' }, r.status),
    actions: Button({ variant: 'ghost', size: 'sm' },
      icon(r.actions === 'download' ? 'download' : r.actions === 'edit' ? 'edit' : 'eye', { size: '1em' })
    ),
  }));

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5') }, 'Report Library'),
      Button({ variant: 'ghost', size: 'sm' }, icon('download', { size: '1em' }), ' Export All')
    ),
    Card({ class: css('d-glass') },
      Card.Body({},
        DataTable({ columns, data, sortable: true, paginate: true, pageSize: 5 })
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function ReportsPage() {
  onMount(() => { document.title = 'Reports — SaaS Dashboard'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5') }, 'Reports'),
      span({ class: css('_textxs _fgmuted') }, 'Last updated: ' + new Date().toLocaleDateString())
    ),
    FilterBar(),
    ChartGrid(),
    Scorecard(),
    ReportTable()
  );
}
