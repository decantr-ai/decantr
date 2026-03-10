import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Chart, Sparkline } from 'decantr/chart';
import { Separator } from 'decantr/components';

const { div, section, h2, h3, p, span } = tags;

function DemoGroup(label, description, ...children) {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h3({ class: css('_textlg _fwheading _lhsnug') }, label),
      description ? p({ class: css('_textsm _fg4 _lhnormal') }, description) : null
    ),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

// --- Demo data ---

const SALES_DATA = [
  { month: 'Jan', sales: 12000, profit: 3600, returns: 800 },
  { month: 'Feb', sales: 18000, profit: 5400, returns: 1200 },
  { month: 'Mar', sales: 15000, profit: 4500, returns: 950 },
  { month: 'Apr', sales: 22000, profit: 6600, returns: 1100 },
  { month: 'May', sales: 28000, profit: 8400, returns: 1400 },
  { month: 'Jun', sales: 35000, profit: 10500, returns: 1800 }
];

const PIE_DATA = [
  { category: 'Direct', value: 45 },
  { category: 'Organic', value: 28 },
  { category: 'Referral', value: 15 },
  { category: 'Social', value: 12 }
];

const SCATTER_DATA = [
  { x: 10, y: 25, size: 5 }, { x: 20, y: 40, size: 8 }, { x: 35, y: 30, size: 12 },
  { x: 45, y: 55, size: 6 }, { x: 55, y: 35, size: 15 }, { x: 65, y: 60, size: 9 },
  { x: 75, y: 50, size: 20 }, { x: 85, y: 70, size: 7 }, { x: 30, y: 45, size: 10 },
  { x: 50, y: 65, size: 14 }, { x: 70, y: 40, size: 11 }, { x: 90, y: 80, size: 18 }
];

const HISTOGRAM_DATA = Array.from({ length: 80 }, (_, i) => ({
  value: 20 + Math.floor(Math.random() * 60 + Math.random() * 20)
}));

const BOX_DATA = [
  { group: 'A', value: 12 }, { group: 'A', value: 18 }, { group: 'A', value: 22 },
  { group: 'A', value: 15 }, { group: 'A', value: 28 }, { group: 'A', value: 35 },
  { group: 'A', value: 20 }, { group: 'A', value: 25 },
  { group: 'B', value: 30 }, { group: 'B', value: 38 }, { group: 'B', value: 42 },
  { group: 'B', value: 35 }, { group: 'B', value: 48 }, { group: 'B', value: 55 },
  { group: 'B', value: 40 }, { group: 'B', value: 45 },
  { group: 'C', value: 8 }, { group: 'C', value: 14 }, { group: 'C', value: 18 },
  { group: 'C', value: 10 }, { group: 'C', value: 24 }, { group: 'C', value: 30 },
  { group: 'C', value: 16 }, { group: 'C', value: 20 }
];

const CANDLESTICK_DATA = [
  { date: 'Mon', open: 100, high: 115, low: 95, close: 110 },
  { date: 'Tue', open: 110, high: 120, low: 105, close: 108 },
  { date: 'Wed', open: 108, high: 125, low: 102, close: 122 },
  { date: 'Thu', open: 122, high: 130, low: 118, close: 126 },
  { date: 'Fri', open: 126, high: 135, low: 120, close: 118 }
];

const WATERFALL_DATA = [
  { label: 'Revenue', value: 50000 },
  { label: 'COGS', value: -18000 },
  { label: 'Gross Profit', value: 32000, subtotal: true },
  { label: 'Marketing', value: -8000 },
  { label: 'R&D', value: -12000 },
  { label: 'Net Income', value: 12000, subtotal: true }
];

const HEATMAP_DATA = (() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];
  const result = [];
  for (const day of days) {
    for (const hour of hours) {
      result.push({ x: hour, y: day, value: Math.floor(Math.random() * 100) });
    }
  }
  return result;
})();

const RADAR_DATA = [
  { axis: 'Speed', teamA: 85, teamB: 70 },
  { axis: 'Power', teamA: 72, teamB: 88 },
  { axis: 'Defense', teamA: 90, teamB: 65 },
  { axis: 'Agility', teamA: 78, teamB: 82 },
  { axis: 'Stamina', teamA: 68, teamB: 75 },
  { axis: 'Skill', teamA: 95, teamB: 80 }
];

const GAUGE_VALUE = 73;

const FUNNEL_DATA = [
  { stage: 'Visitors', value: 10000 },
  { stage: 'Leads', value: 6200 },
  { stage: 'Qualified', value: 3800 },
  { stage: 'Proposals', value: 1800 },
  { stage: 'Closed', value: 900 }
];

const TREEMAP_DATA = [
  { id: 'Tech', parent: null, value: null },
  { id: 'Apple', parent: 'Tech', value: 2800 },
  { id: 'Google', parent: 'Tech', value: 1900 },
  { id: 'Meta', parent: 'Tech', value: 900 },
  { id: 'Finance', parent: null, value: null },
  { id: 'JPM', parent: 'Finance', value: 1500 },
  { id: 'GS', parent: 'Finance', value: 1100 },
  { id: 'Energy', parent: null, value: null },
  { id: 'Exxon', parent: 'Energy', value: 1200 },
  { id: 'Chevron', parent: 'Energy', value: 800 }
];

const SANKEY_DATA = {
  nodes: ['Budget', 'Marketing', 'Engineering', 'Sales', 'Ads', 'Content', 'Backend', 'Frontend'],
  links: [
    { source: 'Budget', target: 'Marketing', value: 30 },
    { source: 'Budget', target: 'Engineering', value: 45 },
    { source: 'Budget', target: 'Sales', value: 25 },
    { source: 'Marketing', target: 'Ads', value: 18 },
    { source: 'Marketing', target: 'Content', value: 12 },
    { source: 'Engineering', target: 'Backend', value: 28 },
    { source: 'Engineering', target: 'Frontend', value: 17 }
  ]
};

const RANGE_DATA = [
  { month: 'Jan', low: 2, high: 12 },
  { month: 'Feb', low: 3, high: 14 },
  { month: 'Mar', low: 6, high: 18 },
  { month: 'Apr', low: 10, high: 22 },
  { month: 'May', low: 14, high: 28 },
  { month: 'Jun', low: 18, high: 32 }
];

const SWIMLANE_DATA = {
  lanes: [
    { id: 'todo', label: 'To Do' },
    { id: 'progress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
  ],
  items: [
    { id: 1, lane: 'todo', label: 'Design review', color: 'var(--d-primary)' },
    { id: 2, lane: 'todo', label: 'API spec', color: 'var(--d-accent)' },
    { id: 3, lane: 'progress', label: 'Auth flow', color: 'var(--d-primary)' },
    { id: 4, lane: 'progress', label: 'Dashboard UI', color: 'var(--d-tertiary)' },
    { id: 5, lane: 'done', label: 'Database schema', color: 'var(--d-success)' },
    { id: 6, lane: 'done', label: 'CI/CD pipeline', color: 'var(--d-success)' }
  ]
};

const ORG_DATA = [
  { id: 'ceo', label: 'CEO', parent: null },
  { id: 'cto', label: 'CTO', parent: 'ceo' },
  { id: 'cmo', label: 'CMO', parent: 'ceo' },
  { id: 'eng1', label: 'Engineering Lead', parent: 'cto' },
  { id: 'eng2', label: 'Platform Lead', parent: 'cto' },
  { id: 'mkt1', label: 'Growth', parent: 'cmo' },
  { id: 'mkt2', label: 'Brand', parent: 'cmo' }
];

const CHORD_DATA = {
  labels: ['Email', 'Social', 'Search', 'Direct'],
  matrix: [
    [0, 25, 15, 10],
    [20, 0, 30, 5],
    [10, 20, 0, 25],
    [15, 10, 20, 0]
  ]
};

const SUNBURST_DATA = [
  { id: 'root', parent: null, value: null, label: 'All' },
  { id: 'a', parent: 'root', value: null, label: 'Division A' },
  { id: 'b', parent: 'root', value: null, label: 'Division B' },
  { id: 'a1', parent: 'a', value: 30, label: 'Team A1' },
  { id: 'a2', parent: 'a', value: 20, label: 'Team A2' },
  { id: 'a3', parent: 'a', value: 15, label: 'Team A3' },
  { id: 'b1', parent: 'b', value: 25, label: 'Team B1' },
  { id: 'b2', parent: 'b', value: 35, label: 'Team B2' }
];

const COMBINATION_DATA = SALES_DATA;

const RADIAL_DATA = [
  { category: 'Q1', value: 65 },
  { category: 'Q2', value: 82 },
  { category: 'Q3', value: 48 },
  { category: 'Q4', value: 91 }
];

export function ChartSection() {
  return section({ id: 'chart', class: css('_flex _col _gap10') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Charts'),
      p({ class: css('_textsm _fg4') }, '25 chart types — cartesian, polar, hierarchical, and specialty.')
    ),

    Separator({}),

    // ---- CARTESIAN ----

    DemoGroup('Line Chart', 'Single and multi-series line charts with smooth interpolation.',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'Single series'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: 'sales', title: 'Monthly Sales' })
        ),
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'Multi-series (smooth)'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: ['sales', 'profit'], title: 'Sales vs Profit', smooth: true })
        )
      )
    ),

    DemoGroup('Bar Chart', 'Simple, grouped, stacked, and horizontal bar charts.',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'Grouped bars'),
          Chart({ type: 'bar', data: SALES_DATA, x: 'month', y: ['sales', 'profit'], title: 'Sales & Profit' })
        ),
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'Stacked'),
          Chart({ type: 'bar', data: SALES_DATA, x: 'month', y: ['profit', 'returns'], title: 'Profit & Returns', stacked: true })
        )
      )
    ),

    DemoGroup('Area Chart', 'Filled area for trend visualization.',
      Chart({ type: 'area', data: SALES_DATA, x: 'month', y: 'sales', title: 'Sales Trend', height: '280px' })
    ),

    DemoGroup('Scatter Plot', 'Multi-dimensional point visualization.',
      Chart({ type: 'scatter', data: SCATTER_DATA, x: 'x', y: 'y', title: 'Data Distribution', height: '280px' })
    ),

    DemoGroup('Bubble Chart', 'Scatter with size encoding.',
      Chart({ type: 'bubble', data: SCATTER_DATA, x: 'x', y: 'y', size: 'size', title: 'Weighted Distribution', height: '280px' })
    ),

    DemoGroup('Histogram', 'Frequency distribution of continuous values.',
      Chart({ type: 'histogram', data: HISTOGRAM_DATA, x: 'value', title: 'Score Distribution', bins: 10, height: '280px' })
    ),

    DemoGroup('Box Plot', 'Statistical distribution across groups.',
      Chart({ type: 'box-plot', data: BOX_DATA, x: 'group', y: 'value', title: 'Group Distributions', height: '280px' })
    ),

    DemoGroup('Candlestick', 'Financial OHLC data.',
      Chart({
        type: 'candlestick', data: CANDLESTICK_DATA, x: 'date',
        open: 'open', high: 'high', low: 'low', close: 'close',
        title: 'Weekly Stock Price', height: '280px'
      })
    ),

    DemoGroup('Waterfall', 'Running total with increases and decreases.',
      Chart({ type: 'waterfall', data: WATERFALL_DATA, x: 'label', y: 'value', title: 'P&L Breakdown', height: '280px' })
    ),

    DemoGroup('Range Bar', 'Bars showing value ranges.',
      Chart({ type: 'range-bar', data: RANGE_DATA, x: 'month', low: 'low', high: 'high', title: 'Temperature Range', height: '280px' })
    ),

    DemoGroup('Range Area', 'Filled area between two bounds.',
      Chart({ type: 'range-area', data: RANGE_DATA, x: 'month', low: 'low', high: 'high', title: 'Forecast Band', height: '280px' })
    ),

    DemoGroup('Heatmap', 'Matrix of values with continuous color scale.',
      Chart({ type: 'heatmap', data: HEATMAP_DATA, x: 'x', y: 'y', value: 'value', title: 'Activity Heatmap', height: '300px' })
    ),

    DemoGroup('Combination', 'Mixed chart types on shared axes.',
      Chart({
        type: 'combination', data: COMBINATION_DATA, x: 'month',
        layers: [
          { type: 'bar', y: 'sales' },
          { type: 'line', y: 'profit' }
        ],
        title: 'Revenue (Bars) + Profit (Line)', height: '300px'
      })
    ),

    Separator({}),

    // ---- POLAR ----

    DemoGroup('Pie / Donut', 'Donut (default) and full pie variants.',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'Donut (default)'),
          Chart({ type: 'pie', data: PIE_DATA, x: 'category', y: 'value', title: 'Traffic Sources', height: '280px' })
        ),
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'Full pie'),
          Chart({ type: 'pie', data: PIE_DATA, x: 'category', y: 'value', title: 'Traffic Sources', height: '280px', donut: false })
        )
      )
    ),

    DemoGroup('Radar', 'Multi-axis comparison chart.',
      Chart({ type: 'radar', data: RADAR_DATA, x: 'axis', y: ['teamA', 'teamB'], title: 'Team Comparison', height: '320px' })
    ),

    DemoGroup('Radial Bar', 'Circular bar chart (Nightingale).',
      Chart({ type: 'radial', data: RADIAL_DATA, x: 'category', y: 'value', title: 'Quarterly Performance', height: '320px' })
    ),

    DemoGroup('Gauge', 'Radial gauge with target indicator.',
      Chart({ type: 'gauge', data: GAUGE_VALUE, min: 0, max: 100, title: 'System Health', height: '280px' })
    ),

    DemoGroup('Funnel', 'Conversion funnel visualization.',
      Chart({ type: 'funnel', data: FUNNEL_DATA, x: 'stage', y: 'value', title: 'Sales Funnel', height: '300px' })
    ),

    Separator({}),

    // ---- HIERARCHICAL ----

    DemoGroup('Treemap', 'Hierarchical data as nested rectangles.',
      Chart({
        type: 'treemap', data: TREEMAP_DATA,
        id: 'id', parent: 'parent', value: 'value',
        title: 'Market Sectors', height: '320px'
      })
    ),

    DemoGroup('Sunburst', 'Concentric ring hierarchy.',
      Chart({
        type: 'sunburst', data: SUNBURST_DATA,
        id: 'id', parent: 'parent', value: 'value', label: 'label',
        title: 'Org Breakdown', height: '320px'
      })
    ),

    DemoGroup('Sankey', 'Flow diagram showing resource allocation.',
      Chart({ type: 'sankey', data: SANKEY_DATA, title: 'Budget Flow', height: '320px' })
    ),

    DemoGroup('Chord', 'Relationship matrix with ribbons.',
      Chart({ type: 'chord', data: CHORD_DATA, title: 'Channel Interactions', height: '320px' })
    ),

    Separator({}),

    // ---- SPECIALTY ----

    DemoGroup('Sparklines', 'Compact inline charts for KPI indicators.',
      DemoRow(
        div({ class: css('_flex _aic _gap2') },
          span({ class: css('_fg4 _textbase') }, 'Revenue'),
          Sparkline({ data: [4, 7, 2, 9, 5, 3, 8, 6, 10, 4] }),
          span({ class: css('_fwheading _fg7') }, '+12%')
        ),
        div({ class: css('_flex _aic _gap2') },
          span({ class: css('_fg4 _textbase') }, 'Users'),
          Sparkline({ data: [2, 3, 5, 4, 7, 8, 6, 9, 11, 13] }),
          span({ class: css('_fwheading _fg7') }, '+24%')
        ),
        div({ class: css('_flex _aic _gap2') },
          span({ class: css('_fg4 _textbase') }, 'Errors'),
          Sparkline({ data: [8, 6, 9, 5, 3, 4, 2, 3, 1, 2] }),
          span({ class: css('_fwheading _fg9') }, '-75%')
        )
      )
    ),

    DemoGroup('Swimlane / Kanban', 'Lane-based card layout with drag callbacks.',
      Chart({ type: 'swimlane', data: SWIMLANE_DATA, title: 'Sprint Board', height: '300px' })
    ),

    DemoGroup('Org Chart', 'Hierarchical tree with expand/collapse.',
      Chart({
        type: 'org-chart', data: ORG_DATA,
        id: 'id', parent: 'parent', label: 'label',
        title: 'Company Structure', height: '320px'
      })
    ),

    Separator({}),

    // ---- OPTIONS ----

    DemoGroup('Custom Formatting', 'Custom y-axis value formatter.',
      Chart({
        type: 'bar', data: SALES_DATA, x: 'month', y: 'sales',
        title: 'Revenue (Formatted)',
        yFormat: v => '$' + (v / 1000).toFixed(0) + 'K',
        height: '280px'
      })
    ),

    DemoGroup('Options — No Grid / No Legend', 'Toggle grid lines and legend visibility.',
      div({ class: css('_grid _gc2 _gap4') },
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'grid: false'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: 'sales', grid: false, height: '240px' })
        ),
        div({},
          p({ class: css('_textsm _fg4 _lhnormal _mb2') }, 'legend: false'),
          Chart({ type: 'line', data: SALES_DATA, x: 'month', y: ['sales', 'profit'], legend: false, height: '240px' })
        )
      )
    )
  );
}
