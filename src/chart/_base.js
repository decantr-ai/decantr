/**
 * Base structural CSS for chart components.
 * Injected once on first chart render.
 * Visual styling comes from the active theme (chart key in themes/*.js).
 */

let injected = false;

const BASE_CSS = [
  // Chart container
  '.d-chart{position:relative;width:100%;overflow:visible}',
  '.d-chart-inner{position:relative}',

  // SVG container
  '.d-chart-svg{display:block;width:100%;overflow:visible}',

  // Title
  '.d-chart-title{font-size:var(--d-text-lg);font-weight:var(--d-fw-title);line-height:var(--d-lh-snug);color:var(--c3);margin:0 0 var(--d-sp-3) 0}',

  // Axes
  '.d-chart-axis text{font-size:var(--d-text-xs);fill:var(--c4);font-family:var(--d-font)}',
  '.d-chart-axis line,.d-chart-axis path{stroke:var(--c5);fill:none;shape-rendering:crispEdges}',
  '.d-chart-axis-label{font-size:var(--d-text-sm);fill:var(--c4);font-family:var(--d-font)}',

  // Grid
  '.d-chart-grid line{stroke:var(--c5);stroke-opacity:0.5;shape-rendering:crispEdges}',

  // Data elements
  '.d-chart-line{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
  '.d-chart-area{opacity:0.15}',
  '.d-chart-bar{shape-rendering:crispEdges}',
  '.d-chart-point{cursor:pointer}',
  '.d-chart-point:focus{outline:2px solid var(--c1);outline-offset:2px}',
  '.d-chart-slice{cursor:pointer;transition:opacity 0.15s}',
  '.d-chart-slice:hover{opacity:0.85}',

  // Legend
  '.d-chart-legend{display:flex;flex-wrap:wrap;gap:var(--d-sp-3);padding:var(--d-sp-3) 0 0;font-size:var(--d-text-sm);color:var(--c3)}',
  '.d-chart-legend-item{display:inline-flex;align-items:center;gap:var(--d-sp-1-5);cursor:pointer;user-select:none}',
  '.d-chart-legend-swatch{width:12px;height:12px;border-radius:2px;flex-shrink:0}',
  '.d-chart-legend-disabled{opacity:0.35}',

  // Tooltip
  '.d-chart-tooltip{position:absolute;z-index:1002;pointer-events:none;padding:var(--d-sp-2) var(--d-sp-3);font-size:var(--d-text-sm);line-height:var(--d-lh-normal);white-space:nowrap;border-radius:var(--d-radius);background:var(--d-chart-tooltip-bg,var(--c2));color:var(--c3);border:1px solid var(--c5);box-shadow:0 2px 8px rgba(0,0,0,0.12);opacity:0;transition:opacity 0.12s}',
  '.d-chart-tooltip-visible{opacity:1}',
  '.d-chart-tooltip-label{font-weight:var(--d-fw-title);margin-bottom:var(--d-sp-1)}',
  '.d-chart-tooltip-row{display:flex;align-items:center;gap:var(--d-sp-2)}',
  '.d-chart-tooltip-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}',

  // Data table fallback (accessibility)
  '.d-chart-table{width:100%;border-collapse:collapse;font-size:var(--d-text-sm);margin-top:var(--d-sp-2)}',
  '.d-chart-table th{text-align:left;font-weight:600;padding:var(--d-sp-2);border-bottom:2px solid var(--c5)}',
  '.d-chart-table td{padding:var(--d-sp-2);border-bottom:1px solid var(--c5)}',

  // Screen reader only
  '.d-chart-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',

  // Sparkline
  '.d-chart-spark{display:inline-block;vertical-align:middle}',
  '.d-chart-spark svg{display:block}',

  // Annotations
  '.d-chart-annotation-line{stroke-dasharray:4,3}',
  '.d-chart-annotation-label{font-size:var(--d-text-xs);fill:var(--c4);font-family:var(--d-font)}',
  '.d-chart-annotation-band{opacity:0.08}',

  // Reduced motion
  '@media(prefers-reduced-motion:reduce){.d-chart-line,.d-chart-area,.d-chart-bar,.d-chart-slice,.d-chart-point,.d-chart-tooltip{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}}'
].join('');

export function injectChartBase() {
  if (injected) return;
  if (typeof document === 'undefined') return;
  injected = true;
  let el = document.querySelector('[data-decantr-chart]');
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-decantr-chart', '');
    document.head.appendChild(el);
  }
  el.textContent = `@layer d.base{${BASE_CSS}}`;
}

export function resetChartBase() {
  injected = false;
}
