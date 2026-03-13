import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Chart, Sparkline, colorScale, createStream } from 'decantr/chart';
import { Separator, Tabs } from 'decantr/components';
import { SpecTable } from '../shared/spec-table.js';

const { div, h2, h3, p, span, section } = tags;

// ─── Chart Groups ──────────────────────────────────────────────
const CHART_GROUPS = [
  { id: 'cartesian', label: 'Cartesian', desc: 'X/Y axis charts for trends, comparisons, and distributions', types: ['line', 'bar', 'area', 'combination', 'histogram', 'waterfall'] },
  { id: 'circular', label: 'Circular', desc: 'Radial charts for proportions and multi-dimensional data', types: ['pie', 'radar', 'radial', 'gauge', 'funnel'] },
  { id: 'statistical', label: 'Statistical', desc: 'Data analysis and financial charts', types: ['scatter', 'bubble', 'box-plot', 'candlestick', 'range-bar', 'range-area'] },
  { id: 'hierarchical', label: 'Hierarchical', desc: 'Relationships, flows, and organizational structures', types: ['treemap', 'sunburst', 'sankey', 'chord', 'org-chart', 'swimlane'] },
  { id: 'micro', label: 'Micro', desc: 'Compact inline and dense visualization charts', types: ['sparkline', 'heatmap'] },
];

const GROUP_MAP = {};
for (const g of CHART_GROUPS) for (const t of g.types) GROUP_MAP[t] = g.id;

// ─── Sample Data ───────────────────────────────────────────────
const MONTHLY = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
];

const MONTHLY_NEG = [
  { month: 'Jan', value: 186 },
  { month: 'Feb', value: -120 },
  { month: 'Mar', value: 237 },
  { month: 'Apr', value: -73 },
  { month: 'May', value: 209 },
  { month: 'Jun', value: -50 },
];

const PIE_DATA = [
  { label: 'Chrome', value: 275 },
  { label: 'Safari', value: 200 },
  { label: 'Firefox', value: 187 },
  { label: 'Edge', value: 173 },
  { label: 'Other', value: 90 },
];

const RADAR_DATA = [
  { axis: 'Speed', a: 80, b: 65 },
  { axis: 'Reliability', a: 90, b: 70 },
  { axis: 'Comfort', a: 60, b: 85 },
  { axis: 'Safety', a: 75, b: 90 },
  { axis: 'Efficiency', a: 85, b: 60 },
  { axis: 'Design', a: 70, b: 75 },
];

const RADIAL_DATA = [
  { label: 'Progress', value: 72 },
  { label: 'Goals', value: 85 },
  { label: 'Tasks', value: 60 },
  { label: 'Reviews', value: 45 },
  { label: 'Bugs', value: 30 },
];

const FUNNEL_DATA = [
  { stage: 'Visitors', value: 1000 },
  { stage: 'Leads', value: 750 },
  { stage: 'Prospects', value: 500 },
  { stage: 'Customers', value: 200 },
  { stage: 'Retained', value: 150 },
];

const SCATTER_DATA = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 7 + 3) % 100),
  y: ((i * 13 + 7) % 100),
  size: (i % 5 + 1) * 6,
  group: i % 2 === 0 ? 'A' : 'B',
}));

const HIST_DATA = Array.from({ length: 100 }, (_, i) => ({
  value: Math.round(20 + Math.sin(i * 0.3) * 30 + (i % 7) * 5),
}));

const WATERFALL_DATA = [
  { category: 'Revenue', value: 420 },
  { category: 'Services', value: 120 },
  { category: 'Costs', value: -180 },
  { category: 'Tax', value: -60 },
  { category: 'Total', value: 0, total: true },
];

const HEATMAP_DATA = (() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'];
  const out = [];
  for (let di = 0; di < days.length; di++)
    for (let hi = 0; hi < hours.length; hi++)
      out.push({ hour: hours[hi], day: days[di], value: Math.abs(Math.round(Math.sin((di + 1) * (hi + 1) * 0.7) * 80 + 20)) });
  return out;
})();

const OHLC_DATA = Array.from({ length: 20 }, (_, i) => {
  const base = 100 + Math.sin(i * 0.5) * 20;
  const open = Math.round(base + (i % 3 - 1) * 3);
  const close = Math.round(base + (i % 4 - 2) * 4);
  return {
    date: `Mar ${i + 1}`, open, close,
    high: Math.round(Math.max(open, close) + (i % 5) * 2),
    low: Math.round(Math.min(open, close) - (i % 4) * 2),
    volume: 1000 + i * 100,
  };
});

const BOXPLOT_DATA = [
  ...Array.from({ length: 20 }, (_, i) => ({ group: 'A', value: 15 + (i * 7 + 3) % 30 })),
  ...Array.from({ length: 20 }, (_, i) => ({ group: 'B', value: 10 + (i * 11 + 5) % 40 })),
  ...Array.from({ length: 20 }, (_, i) => ({ group: 'C', value: 20 + (i * 5 + 2) % 25 })),
];

const RANGE_DATA = [
  { month: 'Jan', min: 2, max: 12 },
  { month: 'Feb', min: 4, max: 14 },
  { month: 'Mar', min: 6, max: 18 },
  { month: 'Apr', min: 10, max: 22 },
  { month: 'May', min: 14, max: 26 },
  { month: 'Jun', min: 16, max: 28 },
];

const TREE_DATA = [
  { id: 'root', parent: null, value: 100, label: 'All' },
  { id: 'a', parent: 'root', value: 60, label: 'Group A' },
  { id: 'b', parent: 'root', value: 40, label: 'Group B' },
  { id: 'a1', parent: 'a', value: 35, label: 'Item A1' },
  { id: 'a2', parent: 'a', value: 25, label: 'Item A2' },
  { id: 'b1', parent: 'b', value: 22, label: 'Item B1' },
  { id: 'b2', parent: 'b', value: 18, label: 'Item B2' },
];

const SANKEY_DATA = {
  nodes: [
    { id: 'Budget' }, { id: 'Engineering' }, { id: 'Marketing' }, { id: 'Sales' },
    { id: 'Frontend' }, { id: 'Backend' }, { id: 'Social' }, { id: 'Content' },
  ],
  links: [
    { source: 'Budget', target: 'Engineering', value: 40 },
    { source: 'Budget', target: 'Marketing', value: 30 },
    { source: 'Budget', target: 'Sales', value: 30 },
    { source: 'Engineering', target: 'Frontend', value: 20 },
    { source: 'Engineering', target: 'Backend', value: 20 },
    { source: 'Marketing', target: 'Social', value: 15 },
    { source: 'Marketing', target: 'Content', value: 15 },
  ],
};

const CHORD_DATA = {
  nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
  links: [
    { source: 'A', target: 'B', value: 5 },
    { source: 'A', target: 'C', value: 6 },
    { source: 'B', target: 'C', value: 3 },
    { source: 'B', target: 'D', value: 4 },
    { source: 'C', target: 'D', value: 7 },
    { source: 'D', target: 'A', value: 2 },
  ],
};

const ORG_DATA = [
  { id: 'ceo', parent: null, label: 'CEO' },
  { id: 'cto', parent: 'ceo', label: 'CTO' },
  { id: 'cfo', parent: 'ceo', label: 'CFO' },
  { id: 'cmo', parent: 'ceo', label: 'CMO' },
  { id: 'eng1', parent: 'cto', label: 'Lead Eng' },
  { id: 'eng2', parent: 'cto', label: 'Sr Eng' },
  { id: 'fin1', parent: 'cfo', label: 'Controller' },
];

const SWIMLANE_DATA = {
  lanes: ['Backlog', 'In Progress', 'Review', 'Done'],
  items: [
    { id: '1', lane: 'Backlog', label: 'Design system' },
    { id: '2', lane: 'Backlog', label: 'Auth flow' },
    { id: '3', lane: 'In Progress', label: 'Dashboard' },
    { id: '4', lane: 'In Progress', label: 'API layer' },
    { id: '5', lane: 'Review', label: 'Charts' },
    { id: '6', lane: 'Done', label: 'Router' },
    { id: '7', lane: 'Done', label: 'State mgmt' },
  ],
};

const SPARK_VALUES = [4, 7, 5, 9, 3, 8, 6, 10, 7, 5, 8, 12, 9, 6, 11, 8, 5, 7, 10, 13];

// ─── Type Metadata ─────────────────────────────────────────────
const TYPE_META = {
  line:         { label: 'Line', desc: 'Track trends over categories or time', base: { data: MONTHLY, x: 'month', y: 'desktop' } },
  bar:          { label: 'Bar', desc: 'Compare values across categories', base: { data: MONTHLY, x: 'month', y: 'desktop' } },
  area:         { label: 'Area', desc: 'Show volume and trends with filled regions', base: { data: MONTHLY, x: 'month', y: 'desktop' } },
  combination:  { label: 'Combination', desc: 'Mix chart types on shared axes', base: { data: MONTHLY, x: 'month' } },
  histogram:    { label: 'Histogram', desc: 'Visualize frequency distribution of values', base: { data: HIST_DATA, x: 'value' } },
  waterfall:    { label: 'Waterfall', desc: 'Show cumulative effect of sequential values', base: { data: WATERFALL_DATA, x: 'category', y: 'value' } },
  pie:          { label: 'Pie', desc: 'Show proportions of a whole', base: { data: PIE_DATA, x: 'label', y: 'value' } },
  radar:        { label: 'Radar', desc: 'Compare multi-dimensional data on radial axes', base: { data: RADAR_DATA, x: 'axis', y: 'a' } },
  radial:       { label: 'Radial', desc: 'Display values as radial bars', base: { data: RADIAL_DATA, x: 'label', y: 'value' } },
  gauge:        { label: 'Gauge', desc: 'Show a single metric against a range', base: { data: [{ value: 72 }], value: 72, min: 0, max: 100 } },
  funnel:       { label: 'Funnel', desc: 'Show progressive reduction through stages', base: { data: FUNNEL_DATA, x: 'stage', y: 'value' } },
  scatter:      { label: 'Scatter', desc: 'Reveal correlations between two variables', base: { data: SCATTER_DATA, x: 'x', y: 'y' } },
  bubble:       { label: 'Bubble', desc: 'Scatter plot with size dimension', base: { data: SCATTER_DATA, x: 'x', y: 'y' } },
  'box-plot':   { label: 'Box Plot', desc: 'Show statistical distribution with quartiles', base: { data: BOXPLOT_DATA, x: 'group', y: 'value' } },
  candlestick:  { label: 'Candlestick', desc: 'Visualize OHLC financial data', base: { data: OHLC_DATA, x: 'date', y: 'close' } },
  'range-bar':  { label: 'Range Bar', desc: 'Display value ranges as bars', base: { data: RANGE_DATA, x: 'month', y: ['min', 'max'] } },
  'range-area': { label: 'Range Area', desc: 'Show value ranges with filled bands', base: { data: RANGE_DATA, x: 'month', y: ['min', 'max'] } },
  heatmap:      { label: 'Heatmap', desc: 'Represent values in a color-coded matrix', base: { data: HEATMAP_DATA, x: 'hour', y: 'day', value: 'value' } },
  treemap:      { label: 'Treemap', desc: 'Show hierarchical data as nested rectangles', base: { data: TREE_DATA, id: 'id', parent: 'parent', x: 'label', y: 'value' } },
  sunburst:     { label: 'Sunburst', desc: 'Show hierarchical data as concentric rings', base: { data: TREE_DATA, id: 'id', parent: 'parent', x: 'label', y: 'value' } },
  sankey:       { label: 'Sankey', desc: 'Visualize flow between nodes', base: { data: SANKEY_DATA } },
  chord:        { label: 'Chord', desc: 'Show inter-relationships between groups', base: { data: CHORD_DATA } },
  'org-chart':  { label: 'Org Chart', desc: 'Display organizational hierarchy', base: { data: ORG_DATA, id: 'id', parent: 'parent', label: 'label' } },
  swimlane:     { label: 'Swimlane', desc: 'Kanban-style lane layout', base: { data: SWIMLANE_DATA, lane: 'lane', label: 'label' } },
  sparkline:    { label: 'Sparkline', desc: 'Compact inline chart for trends', base: {} },
};

// ─── Card Defaults ─────────────────────────────────────────────
const CARD = { height: '250px', legend: false, title: null, tooltip: true, tableAlt: false };

// ─── Variations Per Type ───────────────────────────────────────
const VARIATIONS = {
  line: [
    { name: 'Default', desc: 'Smooth curve with dots and grid', props: {} },
    { name: 'Linear', desc: 'Straight line interpolation', props: { smooth: false } },
    { name: 'Multiple Series', desc: 'Compare desktop vs mobile', props: { y: ['desktop', 'mobile'], legend: true } },
    { name: 'With Labels', desc: 'Data point values displayed on chart', props: { labels: true, dots: false } },
    { name: 'No Dots', desc: 'Clean line without data point markers', props: { dots: false } },
    { name: 'Interactive', desc: 'Crosshair guides on hover', props: { crosshair: true } },
    {
      name: 'Live Stream',
      desc: 'Real-time data feed with createStream() rolling buffer',
      render: () => {
        const stream = createStream({ maxPoints: 30 });
        let tick = 0;
        for (let i = 0; i < 20; i++) {
          stream.append({ time: `${i}s`, value: Math.round(40 + Math.sin(i * 0.5) * 25 + (i % 3) * 5) });
          tick = i + 1;
        }
        const chart = Chart({
          ...CARD, type: 'line', data: stream.data, x: 'time', y: 'value',
          live: true, smooth: true, dots: false,
          'aria-label': 'Live streaming line chart',
        });
        const interval = setInterval(() => {
          if (!chart.isConnected) { clearInterval(interval); stream.destroy(); return; }
          stream.append({ time: `${tick}s`, value: Math.round(40 + Math.sin(tick * 0.5) * 25 + Math.random() * 15) });
          tick++;
        }, 1000);
        return chart;
      },
    },
  ],
  bar: [
    { name: 'Default', desc: 'Vertical bars for category comparison', props: {} },
    { name: 'Horizontal', desc: 'Bars oriented horizontally', props: { horizontal: true } },
    { name: 'Stacked', desc: 'Series stacked to show total', props: { y: ['desktop', 'mobile'], stacked: true, legend: true } },
    { name: 'Multiple Series', desc: 'Grouped bars side by side', props: { y: ['desktop', 'mobile'], legend: true } },
    { name: 'With Labels', desc: 'Value labels on each bar', props: { labels: true } },
    { name: 'Negative Values', desc: 'Bars extending in both directions', props: { data: MONTHLY_NEG, y: 'value' } },
  ],
  area: [
    { name: 'Default', desc: 'Smooth filled area under curve', props: {} },
    { name: 'Linear', desc: 'Straight-line area fill', props: { smooth: false } },
    { name: 'Stacked', desc: 'Multiple series stacked', props: { y: ['desktop', 'mobile'], stacked: true, legend: true } },
    { name: 'Multiple Series', desc: 'Overlapping transparent areas', props: { y: ['desktop', 'mobile'], legend: true } },
    { name: 'With Labels', desc: 'Data labels on area peaks', props: { labels: true } },
  ],
  combination: [
    { name: 'Bar + Line', desc: 'Bar for volume, line for trend', props: { layers: [{ type: 'bar', y: 'desktop' }, { type: 'line', y: 'mobile' }], legend: true } },
    { name: 'Area + Line', desc: 'Filled area with overlaid line', props: { layers: [{ type: 'area', y: 'desktop' }, { type: 'line', y: 'mobile' }], legend: true } },
    { name: 'Multi-layer', desc: 'Three series with mixed types', props: { layers: [{ type: 'bar', y: 'desktop' }, { type: 'area', y: 'mobile' }, { type: 'line', y: 'desktop' }], legend: true } },
  ],
  histogram: [
    { name: 'Default', desc: 'Auto-binned frequency distribution', props: {} },
    { name: 'Custom Bins', desc: 'Increased bin count for finer resolution', props: { bins: 20 } },
    { name: 'With Labels', desc: 'Count labels on each bin', props: { labels: true } },
  ],
  waterfall: [
    { name: 'Default', desc: 'Running total with positive and negative deltas', props: {} },
    { name: 'Horizontal', desc: 'Horizontal waterfall layout', props: { horizontal: true } },
    { name: 'With Labels', desc: 'Value labels displayed on bars', props: { labels: true } },
  ],
  pie: [
    { name: 'Donut', desc: 'Ring chart with center space', props: { donut: true } },
    { name: 'Full Pie', desc: 'Classic full circle pie chart', props: { donut: false } },
    { name: 'With Labels', desc: 'Slice labels showing values', props: { labels: true } },
    { name: 'With Legend', desc: 'External legend for slice identification', props: { legend: true } },
  ],
  radar: [
    { name: 'Default', desc: 'Filled radar with area shading', props: {} },
    { name: 'Multiple Series', desc: 'Overlay two data profiles', props: { y: ['a', 'b'], legend: true } },
    { name: 'With Dots', desc: 'Data point markers on vertices', props: { dots: true } },
    { name: 'No Fill', desc: 'Line-only radar without area fill', props: { smooth: false } },
  ],
  radial: [
    { name: 'Default', desc: 'Radial bars showing relative values', props: {} },
    { name: 'With Labels', desc: 'Value labels on each bar', props: { labels: true } },
    { name: 'Three Items', desc: 'Compact radial with fewer slices', props: { data: RADIAL_DATA.slice(0, 3) } },
  ],
  gauge: [
    { name: 'Radial', desc: 'Arc gauge showing progress to target', props: { variant: 'radial' } },
    { name: 'Bullet', desc: 'Compact horizontal bullet gauge', props: { variant: 'bullet', target: 80 } },
    { name: 'With Segments', desc: 'Color-coded performance zones', props: { variant: 'radial', target: 80, segments: [{ from: 0, to: 40, color: 'var(--d-error)' }, { from: 40, to: 70, color: 'var(--d-warning)' }, { from: 70, to: 100, color: 'var(--d-success)' }] } },
  ],
  funnel: [
    { name: 'Default', desc: 'Progressive funnel narrowing down', props: {} },
    { name: 'Pyramid', desc: 'Inverted triangle shape', props: { pyramid: true } },
  ],
  scatter: [
    { name: 'Default', desc: 'Point cloud showing correlation', props: {} },
    { name: 'With Labels', desc: 'Labels on data points', props: { labels: true } },
    { name: 'Multiple Series', desc: 'Color-coded groups', props: { series: 'group', legend: true } },
  ],
  bubble: [
    { name: 'Default', desc: 'Scatter with variable point sizes', props: {} },
    { name: 'Multiple Series', desc: 'Grouped bubbles by category', props: { series: 'group', legend: true } },
  ],
  'box-plot': [
    { name: 'Default', desc: 'Quartile distribution with 1.5 IQR whiskers', props: {} },
    { name: 'Min-Max Whiskers', desc: 'Whiskers extend to data extremes', props: { whiskerType: 'min-max' } },
  ],
  candlestick: [
    { name: 'Default', desc: 'OHLC price movement bars', props: {} },
    { name: 'With Grid', desc: 'Grid lines for price reference', props: { grid: true } },
  ],
  'range-bar': [
    { name: 'Default', desc: 'Bars showing min-max range', props: {} },
    { name: 'Horizontal', desc: 'Horizontal range bars', props: { horizontal: true } },
  ],
  'range-area': [
    { name: 'Default', desc: 'Filled band between min and max', props: {} },
    { name: 'Linear', desc: 'Straight-line range band', props: { smooth: false } },
  ],
  heatmap: [
    { name: 'Default', desc: 'Color-coded matrix of values', props: {} },
    { name: 'Custom Colors', desc: 'Orange-to-purple color scale', props: { colorScale: ['#f97316', '#7c3aed'] } },
    { name: 'With Labels', desc: 'Cell values displayed in grid', props: { labels: true } },
  ],
  treemap: [
    { name: 'Default', desc: 'Nested rectangles proportional to value', props: {} },
    { name: 'With Labels', desc: 'Labels inside each rectangle', props: { labels: true } },
  ],
  sunburst: [
    { name: 'Default', desc: 'Hierarchical data as concentric rings', props: {} },
    { name: 'With Labels', desc: 'Segment labels on each ring', props: { labels: true } },
  ],
  sankey: [
    { name: 'Default', desc: 'Flow diagram from source to destination', props: {} },
  ],
  chord: [
    { name: 'Default', desc: 'Circular relationship diagram', props: {} },
  ],
  'org-chart': [
    { name: 'Top-Down', desc: 'Standard top-down hierarchy', props: { orientation: 'top-down' } },
    { name: 'Left-Right', desc: 'Horizontal hierarchy layout', props: { orientation: 'left-right' } },
  ],
  swimlane: [
    { name: 'Default', desc: 'Kanban board with lane columns', props: {} },
  ],
  sparkline: [
    { name: 'Default', desc: 'Compact inline trend line', props: {} },
    { name: 'Dense', desc: 'More data points for detailed view', props: { data: [...SPARK_VALUES, ...SPARK_VALUES] } },
  ],
};

// ─── Registry Loading ──────────────────────────────────────────
let chartRegistry = null;
async function loadChartRegistry() {
  if (chartRegistry) return chartRegistry;
  try {
    const resp = await fetch('/__decantr/registry/chart.json');
    chartRegistry = await resp.json();
  } catch {
    chartRegistry = { exports: {} };
  }
  return chartRegistry;
}

// ─── Chart Card ────────────────────────────────────────────────
function chartCard(name, desc, chartEl) {
  return div({ class: 'de-chart-card' },
    div({ class: 'de-chart-demo' }, chartEl),
    div({ class: 'de-chart-meta' },
      span({ class: css('_label _fgfg') }, name),
      p({ class: css('_caption _fgmutedfg') }, desc)
    )
  );
}

// ─── Chart Detail View ─────────────────────────────────────────
export function ChartDetail(chartType, navigateTo) {
  const meta = TYPE_META[chartType];
  if (!meta) return div({}, p({ class: css('_fgmutedfg') }, `Unknown chart type: ${chartType}`));

  const variations = VARIATIONS[chartType] || [];

  const tabs = Tabs({
    tabs: [
      {
        id: 'variations',
        label: `Variations (${variations.length})`,
        content: () => {
          const cards = variations.map(v => {
            let chartEl;
            if (v.render) {
              chartEl = v.render();
            } else if (chartType === 'sparkline') {
              chartEl = Sparkline({
                data: v.props.data || SPARK_VALUES,
                height: '64', width: '100%',
                'aria-label': v.name,
              });
            } else {
              chartEl = Chart({
                ...CARD, type: chartType, ...meta.base, ...v.props,
                'aria-label': `${meta.label} chart — ${v.name}`,
              });
            }
            return chartCard(v.name, v.desc, chartEl);
          });
          return div({ class: 'de-chart-grid' }, ...cards);
        },
      },
      {
        id: 'api',
        label: 'API',
        content: () => {
          const apiContainer = div({}, p({ class: css('_fgmutedfg') }, 'Loading API...'));
          loadChartRegistry().then(reg => {
            const chartExport = reg?.exports?.Chart;
            const props = chartExport?.params?.[0]?.properties || {};
            apiContainer.replaceChildren(SpecTable({ props }));
          });
          return apiContainer;
        },
      },
    ],
  });

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1 _mb4') },
      h2({ class: css('_heading4') }, meta.label),
      p({ class: css('_body _fgmutedfg') }, meta.desc)
    ),
    tabs
  );
}

// ─── Chart Group View ──────────────────────────────────────────
export function ChartGroupView(groupId, navigateTo) {
  const group = CHART_GROUPS.find(g => g.id === groupId);
  if (!group) return div({}, p({}, 'Group not found.'));

  return section({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, `Charts — ${group.label}`),
    p({ class: css('_body _fgmutedfg') }, `${group.types.length} chart types in this group.`),
    div({ class: 'de-card-grid' },
      ...group.types.map(type => {
        const meta = TYPE_META[type] || {};
        const varCount = (VARIATIONS[type] || []).length;
        return div({
          class: 'de-card-item',
          onclick: () => navigateTo(`/charts/${groupId}/${type}`)
        },
          h3({ class: css('_heading6') }, meta.label || type),
          p({ class: css('_caption _fgmutedfg') }, `${varCount} variation${varCount !== 1 ? 's' : ''}`)
        );
      })
    )
  );
}

// ─── Sidebar Data Loader ───────────────────────────────────────
export async function loadChartItems() {
  return CHART_GROUPS.map(g => ({
    id: g.id,
    label: g.label,
    children: g.types,
  }));
}
