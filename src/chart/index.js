/**
 * decantr/chart — Declarative charting module.
 * Public API: Chart(), Sparkline(), chartSpec(), createStream(), colorScale(), resolvePalette()
 * @module chart
 */

import { createEffect, createSignal } from '../state/index.js';
import { getAnimations } from '../css/theme-registry.js';
import { injectChartBase } from './_base.js';
import { resolve } from './_shared.js';
import { render } from './_renderer.js';

// --- Layout imports ---
import { layoutLine } from './types/line.js';
import { layoutBar } from './types/bar.js';
import { layoutArea } from './types/area.js';
import { layoutPie } from './types/pie.js';
import { layoutSparkline } from './types/sparkline.js';
import { layoutScatter } from './types/scatter.js';
import { layoutBubble } from './types/bubble.js';
import { layoutHistogram } from './types/histogram.js';
import { layoutBoxPlot } from './types/box-plot.js';
import { layoutCandlestick } from './types/candlestick.js';
import { layoutWaterfall } from './types/waterfall.js';
import { layoutRangeBar } from './types/range-bar.js';
import { layoutRangeArea } from './types/range-area.js';
import { layoutHeatmap } from './types/heatmap.js';
import { layoutCombination } from './types/combination.js';
import { layoutRadar } from './types/radar.js';
import { layoutRadial } from './types/radial.js';
import { layoutGauge } from './types/gauge.js';
import { layoutFunnel } from './types/funnel.js';
import { layoutTreemap } from './types/treemap.js';
import { layoutSunburst } from './types/sunburst.js';
import { layoutSankey } from './types/sankey.js';
import { layoutChord } from './types/chord.js';
import { layoutSwimlane } from './types/swimlane.js';
import { layoutOrgChart } from './types/org-chart.js';

// All 25 chart type layouts
const LAYOUT_MAP = {
  line: layoutLine,
  bar: layoutBar,
  area: layoutArea,
  pie: layoutPie,
  scatter: layoutScatter,
  bubble: layoutBubble,
  histogram: layoutHistogram,
  'box-plot': layoutBoxPlot,
  candlestick: layoutCandlestick,
  waterfall: layoutWaterfall,
  'range-bar': layoutRangeBar,
  'range-area': layoutRangeArea,
  heatmap: layoutHeatmap,
  combination: layoutCombination,
  radar: layoutRadar,
  radial: layoutRadial,
  gauge: layoutGauge,
  funnel: layoutFunnel,
  treemap: layoutTreemap,
  sunburst: layoutSunburst,
  sankey: layoutSankey,
  chord: layoutChord,
  swimlane: layoutSwimlane,
  'org-chart': layoutOrgChart
};

/**
 * Register a chart type layout function.
 * @param {string} type
 * @param {Function} layoutFn
 */
export function registerChartType(type, layoutFn) {
  LAYOUT_MAP[type] = layoutFn;
}

const DEFAULTS = {
  type: 'line',
  tooltip: true,
  legend: true,
  grid: true,
  stacked: false,
  animate: true,
  renderer: 'auto',
  height: '300px',
  donut: true,
  tableAlt: true
};

/**
 * Validate and fill defaults for a chart spec.
 * @param {Object} overrides
 * @returns {Object}
 */
export function chartSpec(overrides = {}) {
  const spec = { ...DEFAULTS, ...overrides };
  if (!spec.data) spec.data = [];
  if (!spec.x && spec.type !== 'sparkline') spec.x = 'x';
  if (!spec.y && spec.type !== 'sparkline') spec.y = 'y';
  return spec;
}

/**
 * Create a chart DOM element from a declarative spec.
 * @param {Object} specInput
 * @returns {HTMLElement}
 */
export function Chart(specInput) {
  injectChartBase();
  const spec = chartSpec(specInput);

  const container = document.createElement('div');
  container.className = 'd-chart' + (spec.class ? ' ' + spec.class : '');
  container.setAttribute('role', 'img');
  if (spec['aria-label']) container.setAttribute('aria-label', spec['aria-label']);
  else if (spec.title) container.setAttribute('aria-label', spec.title);

  const heightStr = spec.height || '300px';
  const heightPx = parseInt(heightStr, 10) || 300;

  // Title
  if (spec.title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'd-chart-title';
    titleEl.textContent = resolve(spec.title);
    container.appendChild(titleEl);
  }

  // Chart inner container
  const inner = document.createElement('div');
  inner.className = 'd-chart-inner';
  inner.style.height = heightStr;
  container.appendChild(inner);

  const layoutFn = LAYOUT_MAP[spec.type];
  if (!layoutFn) {
    inner.textContent = `Unknown chart type: ${spec.type}`;
    return container;
  }

  let currentLegend = null;

  const isReactive = typeof specInput.data === 'function';

  function renderChart() {
    const width = inner.offsetWidth || 600;
    const height = heightPx;
    const resolvedSpec = { ...spec, data: resolve(spec.data) };

    const sceneGraph = layoutFn(resolvedSpec, width, height);
    const svgEl = render(sceneGraph, spec);

    inner.textContent = '';
    inner.appendChild(svgEl);

    // Legend
    if (currentLegend) {
      currentLegend.remove();
      currentLegend = null;
    }
    const meta = sceneGraph.meta || {};
    if (spec.legend !== false && meta.series) {
      currentLegend = buildLegend(meta.series, spec);
      container.appendChild(currentLegend);
    }

    // Tooltip
    if (spec.tooltip) {
      attachTooltip(inner, svgEl, meta, spec);
    }

    // Click handler
    if (spec.onClick) {
      attachClickHandler(svgEl, meta, spec);
    }
  }

  if (isReactive) {
    createEffect(() => {
      resolve(specInput.data);
      renderChart();
    });
  } else {
    requestAnimationFrame(renderChart);
  }

  // Accessible data table fallback
  if (spec.tableAlt) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.className = 'd-chart-sr';
    summary.textContent = 'View data table';
    details.appendChild(summary);
    details.addEventListener('toggle', () => {
      if (details.open && !details.querySelector('table')) {
        details.appendChild(buildDataTable(spec));
      }
    });
    container.appendChild(details);
  }

  return container;
}

/**
 * Create an inline sparkline element.
 * @param {Object} specInput
 * @returns {HTMLElement}
 */
export function Sparkline(specInput) {
  injectChartBase();
  const spec = { ...specInput };
  const heightPx = parseInt(spec.height || '32', 10) || 32;
  const widthPx = parseInt(spec.width || '120', 10) || 120;

  const container = document.createElement('span');
  container.className = 'd-chart-spark' + (spec.class ? ' ' + spec.class : '');
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', spec['aria-label'] || 'Sparkline');

  const isReactive = typeof specInput.data === 'function';

  function renderSpark() {
    const data = resolve(spec.data);
    const sceneGraph = layoutSparkline({ ...spec, data }, widthPx, heightPx);
    const svgEl = render(sceneGraph, { renderer: 'svg' });
    container.textContent = '';
    container.appendChild(svgEl);
  }

  if (isReactive) {
    createEffect(() => {
      resolve(specInput.data);
      renderSpark();
    });
  } else {
    renderSpark();
  }

  return container;
}

// --- Streaming API ---

/**
 * Create a streaming data source for live charts.
 * @param {Object} [opts]
 * @param {number} [opts.maxPoints=500] — rolling buffer size
 * @returns {{ append: Function, data: Function, window: Function, destroy: Function }}
 */
export function createStream(opts = {}) {
  const maxPoints = opts.maxPoints || 500;
  const buffer = [];
  const [data, setData] = createSignal([]);

  function append(point) {
    if (Array.isArray(point)) {
      buffer.push(...point);
    } else {
      buffer.push(point);
    }
    // Trim to maxPoints
    while (buffer.length > maxPoints) buffer.shift();
    setData([...buffer]);
  }

  function window(start, end) {
    return buffer.slice(start, end);
  }

  function destroy() {
    buffer.length = 0;
    setData([]);
  }

  return { append, data, window, destroy };
}

// --- Extended Palette ---

/**
 * Continuous color scale for heatmaps/treemaps.
 * @param {number[]} domain — [min, max] or [min, mid, max]
 * @param {string[]} stops — hex color stops
 * @returns {(value: number) => string}
 */
export function colorScale(domain, stops) {
  if (!stops || stops.length < 2) return () => stops?.[0] || '#000';
  const segments = stops.length - 1;

  return function(value) {
    const t = Math.max(0, Math.min(1, (value - domain[0]) / ((domain[domain.length - 1] || 1) - domain[0])));
    const seg = Math.min(Math.floor(t * segments), segments - 1);
    const localT = (t * segments) - seg;
    return interpolateHex(stops[seg], stops[seg + 1], localT);
  };
}

function interpolateHex(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}

/**
 * Resolve palette to hex values for Canvas/WebGPU rendering.
 * @param {number} count — number of colors needed
 * @param {HTMLElement} [el] — element for getComputedStyle
 * @returns {string[]}
 */
export function resolvePalette(count, el) {
  const colors = [];
  const target = el || document.documentElement;
  const style = typeof getComputedStyle === 'function' ? getComputedStyle(target) : null;

  for (let i = 0; i < count; i++) {
    const prop = i < 8 ? `--d-chart-${i}` : `--d-chart-${i % 8}-ext-${Math.floor((i - 8) / 8) + 1}`;
    let color = style ? style.getPropertyValue(prop).trim() : '';
    if (!color) color = FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    colors.push(color);
  }

  return colors;
}

const FALLBACK_COLORS = ['#1366D9', '#7c3aed', '#0891b2', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#71717a'];

// --- Internal helpers ---

function buildLegend(series, spec) {
  const legend = document.createElement('div');
  legend.className = 'd-chart-legend';

  for (const s of series) {
    const item = document.createElement('span');
    item.className = 'd-chart-legend-item';

    const swatch = document.createElement('span');
    swatch.className = 'd-chart-legend-swatch';
    swatch.style.background = s.color;
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(s.key));

    // Legend toggle
    let disabled = false;
    item.addEventListener('click', () => {
      disabled = !disabled;
      item.classList.toggle('d-chart-legend-disabled', disabled);
      if (spec.onLegendToggle) {
        spec.onLegendToggle({ series: s.key, visible: !disabled });
      }
    });

    legend.appendChild(item);
  }

  return legend;
}

function attachTooltip(inner, svgEl, meta, spec) {
  const tooltip = document.createElement('div');
  tooltip.className = 'd-chart-tooltip';
  inner.appendChild(tooltip);

  const elements = svgEl.querySelectorAll('[data-series],[data-label]');
  for (const el of elements) {
    el.addEventListener('mouseenter', () => {
      const value = el.getAttribute('data-value') || '';
      const label = el.getAttribute('data-label') || el.getAttribute('data-series') || '';
      if (typeof spec.tooltip === 'function') {
        tooltip.textContent = '';
        const result = spec.tooltip({ label, value, element: el });
        if (typeof result === 'string') tooltip.textContent = result;
        else if (result) tooltip.appendChild(result);
      } else {
        tooltip.textContent = label + (value ? ': ' + value : '');
      }
      tooltip.classList.add('d-chart-tooltip-visible');
    });
    el.addEventListener('mousemove', (e) => {
      const r = inner.getBoundingClientRect();
      tooltip.style.left = (e.clientX - r.left + 12) + 'px';
      tooltip.style.top = (e.clientY - r.top - 8) + 'px';
    });
    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('d-chart-tooltip-visible');
    });
  }
}

function attachClickHandler(svgEl, meta, spec) {
  const elements = svgEl.querySelectorAll('[data-series],[data-label]');
  for (const el of elements) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      const series = el.getAttribute('data-series') || '';
      const value = el.getAttribute('data-value') || '';
      const label = el.getAttribute('data-label') || '';
      spec.onClick({ point: { label, value }, series, event: e });
    });
  }
}

function buildDataTable(spec) {
  const data = resolve(spec.data);
  if (!data || !data.length) return document.createTextNode('No data');

  const table = document.createElement('table');
  table.className = 'd-chart-table';

  const fields = [spec.x, ...(Array.isArray(spec.y) ? spec.y : [spec.y])].filter(Boolean);
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const f of fields) {
    const th = document.createElement('th');
    th.textContent = f;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const row of data) {
    const tr = document.createElement('tr');
    for (const f of fields) {
      const td = document.createElement('td');
      td.textContent = row[f] != null ? String(row[f]) : '';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

// Re-export utilities
export { chartColor, PALETTE_SIZE } from './layouts/_layout-base.js';
export { registerRenderer } from './_renderer.js';
