/**
 * SVG Renderer — default renderer for datasets < 3K elements.
 * Produces real SVG DOM via document.createElementNS.
 * All colors reference CSS custom properties for theme integration.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {string} tag
 * @param {Object} attrs
 * @param {...(SVGElement|string)} children
 * @returns {SVGElement}
 */
function svg(tag, attrs, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v !== undefined && v !== null && v !== false) el.setAttribute(k, String(v));
    }
  }
  for (const c of children) {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  }
  return el;
}

/**
 * Render a layout object to an SVG element.
 * @param {Object} layout — from type layout functions
 * @param {Object} spec — original chart spec
 * @returns {SVGElement}
 */
export function renderSVG(layout, spec) {
  switch (layout.type) {
    case 'line': return renderLine(layout, spec);
    case 'bar': return renderBar(layout, spec);
    case 'area': return renderArea(layout, spec);
    case 'pie': return renderPie(layout, spec);
    case 'sparkline': return renderSparkline(layout, spec);
    default: return svg('svg', { width: layout.width, height: layout.height });
  }
}

// --- Line ---

function renderLine(layout, spec) {
  const { width, height, margins, innerW, innerH, xScale, yScale, xType, series } = layout;
  const root = svg('svg', { class: 'd-chart-svg', viewBox: `0 0 ${width} ${height}`, width, height });
  const g = svg('g', { transform: `translate(${margins.left},${margins.top})` });

  // Grid
  if (spec.grid !== false) g.appendChild(renderGrid(yScale, innerW, innerH));

  // X axis
  g.appendChild(renderXAxis(xScale, xType, innerH, innerW, layout, spec));

  // Y axis
  g.appendChild(renderYAxis(yScale, innerH, spec));

  // Lines
  for (const s of series) {
    if (s.points.length < 2) continue;
    const d = pointsToPath(s.points);
    g.appendChild(svg('path', { class: 'd-chart-line', d, stroke: s.color, 'data-series': s.key }));
  }

  root.appendChild(g);
  return root;
}

// --- Bar ---

function renderBar(layout, spec) {
  const { width, height, margins, innerW, innerH, xScale, yScale, bars, categories } = layout;
  const root = svg('svg', { class: 'd-chart-svg', viewBox: `0 0 ${width} ${height}`, width, height });
  const g = svg('g', { transform: `translate(${margins.left},${margins.top})` });

  if (spec.grid !== false) g.appendChild(renderGrid(yScale, innerW, innerH));

  // X axis labels (band)
  const xAxis = svg('g', { class: 'd-chart-axis', transform: `translate(0,${innerH})` });
  xAxis.appendChild(svg('line', { x1: 0, y1: 0, x2: innerW, y2: 0 }));
  const bandW = xScale.bandwidth();
  for (const cat of categories) {
    const x = xScale(cat) + bandW / 2;
    xAxis.appendChild(svg('text', { x, y: 20, 'text-anchor': 'middle' }, String(cat)));
  }
  g.appendChild(xAxis);

  // Y axis
  g.appendChild(renderYAxis(yScale, innerH, spec));

  // Bars
  for (const bar of bars) {
    for (const seg of bar.segments) {
      const rect = svg('rect', {
        class: 'd-chart-bar',
        x: seg.x,
        y: seg.y,
        width: Math.max(0, seg.width),
        height: Math.max(0, seg.height),
        fill: seg.color,
        rx: Math.min(2, seg.width / 4),
        'data-series': seg.field,
        'data-value': seg.value
      });
      g.appendChild(rect);
    }
  }

  root.appendChild(g);
  return root;
}

// --- Area ---

function renderArea(layout, spec) {
  const { width, height, margins, innerW, innerH, xScale, yScale, xType, series, baseline } = layout;
  const root = svg('svg', { class: 'd-chart-svg', viewBox: `0 0 ${width} ${height}`, width, height });
  const g = svg('g', { transform: `translate(${margins.left},${margins.top})` });

  if (spec.grid !== false) g.appendChild(renderGrid(yScale, innerW, innerH));
  g.appendChild(renderXAxis(xScale, xType, innerH, innerW, layout, spec));
  g.appendChild(renderYAxis(yScale, innerH, spec));

  for (const s of series) {
    if (s.points.length < 2) continue;
    // Fill area polygon
    const areaPath = areaToPath(s.points);
    g.appendChild(svg('path', { class: 'd-chart-area', d: areaPath, fill: s.color, 'data-series': s.key }));
    // Stroke line on top
    const linePts = s.points.map(p => ({ x: p.x, y: p.y0 }));
    g.appendChild(svg('path', { class: 'd-chart-line', d: pointsToPath(linePts), stroke: s.color, 'data-series': s.key }));
  }

  root.appendChild(g);
  return root;
}

// --- Pie ---

function renderPie(layout, spec) {
  const { width, height, cx, cy, radius, innerRadius, slices } = layout;
  const root = svg('svg', { class: 'd-chart-svg', viewBox: `0 0 ${width} ${height}`, width, height });

  for (const slice of slices) {
    const path = arcPath(cx, cy, radius, innerRadius, slice.startAngle, slice.endAngle);
    const el = svg('path', {
      class: 'd-chart-slice',
      d: path,
      fill: slice.color,
      'data-label': slice.label,
      'data-value': slice.value,
      tabindex: '0',
      role: 'listitem',
      'aria-label': `${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`
    });
    root.appendChild(el);
  }

  return root;
}

// --- Sparkline ---

function renderSparkline(layout) {
  const { width, height, points } = layout;
  const root = svg('svg', { class: 'd-chart-svg', viewBox: `0 0 ${width} ${height}`, width, height });
  if (points.length < 2) return root;

  const d = pointsToPath(points);
  root.appendChild(svg('path', {
    class: 'd-chart-line',
    d,
    stroke: 'var(--d-chart-0,var(--c1))',
    'stroke-width': '1.5'
  }));

  return root;
}

// --- Shared SVG helpers ---

function renderGrid(yScale, innerW, innerH) {
  const g = svg('g', { class: 'd-chart-grid' });
  const ticks = yScale.ticks(5);
  for (const t of ticks) {
    const y = yScale(t);
    g.appendChild(svg('line', { x1: 0, y1: y, x2: innerW, y2: y }));
  }
  return g;
}

function renderXAxis(xScale, xType, innerH, innerW, layout, spec) {
  const g = svg('g', { class: 'd-chart-axis', transform: `translate(0,${innerH})` });
  g.appendChild(svg('line', { x1: 0, y1: 0, x2: innerW, y2: 0 }));

  if (xType === 'band') {
    const bandW = xScale.bandwidth();
    const data = layout.data || [];
    // For band, we derive ticks from series data or categories
    return g;
  }

  const ticks = xScale.ticks(6);
  const fmt = spec.xFormat || (xType === 'time' ? defaultDateFormat : defaultNumFormat);
  for (const t of ticks) {
    const x = xScale(t);
    g.appendChild(svg('text', { x, y: 20, 'text-anchor': 'middle' }, fmt(t)));
  }
  return g;
}

function renderYAxis(yScale, innerH, spec) {
  const g = svg('g', { class: 'd-chart-axis' });
  g.appendChild(svg('line', { x1: 0, y1: 0, x2: 0, y2: innerH }));

  const ticks = yScale.ticks(5);
  const fmt = spec.yFormat || defaultNumFormat;
  for (const t of ticks) {
    const y = yScale(t);
    g.appendChild(svg('text', { x: -8, y: y + 4, 'text-anchor': 'end' }, fmt(t)));
  }
  return g;
}

function pointsToPath(points) {
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += `L${points[i].x},${points[i].y}`;
  }
  return d;
}

function areaToPath(points) {
  // Forward top line, reverse bottom line
  let d = `M${points[0].x},${points[0].y0}`;
  for (let i = 1; i < points.length; i++) {
    d += `L${points[i].x},${points[i].y0}`;
  }
  // Close back along baseline
  for (let i = points.length - 1; i >= 0; i--) {
    d += `L${points[i].x},${points[i].y1}`;
  }
  d += 'Z';
  return d;
}

function arcPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const x1 = cx + outerR * Math.cos(startAngle);
  const y1 = cy + outerR * Math.sin(startAngle);
  const x2 = cx + outerR * Math.cos(endAngle);
  const y2 = cy + outerR * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  let d = `M${x1},${y1}A${outerR},${outerR},0,${largeArc},1,${x2},${y2}`;

  if (innerR > 0) {
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    d += `L${x3},${y3}A${innerR},${innerR},0,${largeArc},0,${x4},${y4}Z`;
  } else {
    d += `L${cx},${cy}Z`;
  }

  return d;
}

function defaultDateFormat(d) {
  if (!(d instanceof Date)) d = new Date(d);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function defaultNumFormat(v) {
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}
