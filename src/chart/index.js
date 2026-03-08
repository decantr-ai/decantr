/**
 * decantr/chart — Declarative charting module.
 * Public API: Chart(), Sparkline(), chartSpec()
 */

import { createEffect } from '../state/index.js';
import { getAnimations } from '../css/theme-registry.js';
import { injectChartBase } from './_base.js';
import { resolve } from './_shared.js';
import { render } from './_renderer.js';
import { layoutLine } from './types/line.js';
import { layoutBar } from './types/bar.js';
import { layoutArea } from './types/area.js';
import { layoutPie } from './types/pie.js';
import { layoutSparkline } from './types/sparkline.js';

const LAYOUT_MAP = {
  line: layoutLine,
  bar: layoutBar,
  area: layoutArea,
  pie: layoutPie
};

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

  // Parse height
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

  // Reactive rendering
  const isReactive = typeof specInput.data === 'function';

  function renderChart() {
    const width = inner.offsetWidth || 600;
    const height = heightPx;

    const layout = layoutFn(spec, width, height);
    const svgEl = render(layout, spec);

    // Clear and append
    inner.textContent = '';
    inner.appendChild(svgEl);

    // Legend
    if (spec.legend !== false && layout.series) {
      const legend = buildLegend(layout.series);
      container.appendChild(legend);
    }

    // Tooltip
    if (spec.tooltip) {
      attachTooltip(inner, svgEl, layout, spec);
    }
  }

  if (isReactive) {
    // Use effect for reactive data — re-renders when signal changes
    createEffect(() => {
      // Touch the reactive getter to subscribe
      resolve(specInput.data);
      renderChart();
    });
  } else {
    // Static: render once after mount (need offsetWidth)
    requestAnimationFrame(renderChart);
  }

  // Accessible data table fallback
  if (spec.tableAlt) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.className = 'd-chart-sr';
    summary.textContent = 'View data table';
    details.appendChild(summary);
    // Lazy-build table on open
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
    const layout = layoutSparkline({ ...spec, data }, widthPx, heightPx);
    const svgEl = render(layout, { renderer: 'svg' });
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

// --- Internal helpers ---

function buildLegend(series) {
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
    legend.appendChild(item);
  }
  return legend;
}

function attachTooltip(inner, svgEl, layout, spec) {
  const tooltip = document.createElement('div');
  tooltip.className = 'd-chart-tooltip';
  inner.appendChild(tooltip);

  const elements = svgEl.querySelectorAll('[data-series],[data-label]');
  for (const el of elements) {
    el.addEventListener('mouseenter', (e) => {
      const value = el.getAttribute('data-value') || '';
      const label = el.getAttribute('data-label') || el.getAttribute('data-series') || '';
      if (typeof spec.tooltip === 'function') {
        tooltip.textContent = '';
        tooltip.appendChild(spec.tooltip({ label, value, element: el }));
      } else {
        tooltip.textContent = label + (value ? ': ' + value : '');
      }
      tooltip.classList.add('d-chart-tooltip-visible');
    });
    el.addEventListener('mousemove', (e) => {
      const rect = inner.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 8) + 'px';
    });
    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('d-chart-tooltip-visible');
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

// Re-export utilities for advanced usage
export { chartColor, PALETTE_SIZE } from './types/_type-base.js';
