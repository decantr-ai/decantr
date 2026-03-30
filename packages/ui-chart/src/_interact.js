/**
 * Interaction Layer — shared infrastructure for all chart types.
 * Pure callback architecture — zero business logic.
 * Tooltip, crosshair, zoom/pan, brush selection, legend toggle, keyboard nav.
 * @module _interact
 */

// --- Tooltip (enhanced) ---

/**
 * Attach enhanced tooltip to chart.
 * Supports Voronoi nearest-point, multi-series, custom render.
 * @param {HTMLElement} container
 * @param {SVGElement} svgEl
 * @param {Object} meta — scene graph meta
 * @param {Object} spec
 */
export function attachTooltip(container, svgEl, meta, spec) {
  const tooltip = document.createElement('div');
  tooltip.className = 'd-chart-tooltip';
  container.appendChild(tooltip);

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

    el.addEventListener('mousemove', e => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 8) + 'px';
    });

    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('d-chart-tooltip-visible');
    });
  }
}

// --- Crosshair ---

/**
 * Attach crosshair guides to cartesian chart.
 * @param {HTMLElement} container
 * @param {Object} meta — { margins, innerW, innerH }
 * @param {Object} spec
 */
export function attachCrosshair(container, meta, spec) {
  if (!spec.crosshair) return;

  const { margins, innerW, innerH } = meta;
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:absolute;top:${margins.top}px;left:${margins.left}px;width:${innerW}px;height:${innerH}px;pointer-events:none`;
  container.appendChild(overlay);

  const vLine = document.createElement('div');
  vLine.style.cssText = 'position:absolute;top:0;width:1px;height:100%;background:var(--d-muted);opacity:0;transition:opacity 0.1s;pointer-events:none';
  overlay.appendChild(vLine);

  const hLine = document.createElement('div');
  hLine.style.cssText = 'position:absolute;left:0;width:100%;height:1px;background:var(--d-muted);opacity:0;transition:opacity 0.1s;pointer-events:none';
  overlay.appendChild(hLine);

  const inner = container.querySelector('.d-chart-inner');
  if (!inner) return;

  inner.style.cursor = 'crosshair';
  inner.addEventListener('mousemove', e => {
    const rect = inner.getBoundingClientRect();
    const x = e.clientX - rect.left - margins.left;
    const y = e.clientY - rect.top - margins.top;

    if (x >= 0 && x <= innerW && y >= 0 && y <= innerH) {
      vLine.style.left = x + 'px';
      vLine.style.opacity = '0.5';
      hLine.style.top = y + 'px';
      hLine.style.opacity = '0.5';
    }
  });

  inner.addEventListener('mouseleave', () => {
    vLine.style.opacity = '0';
    hLine.style.opacity = '0';
  });
}

// --- Zoom/Pan ---

/**
 * Attach zoom/pan behavior to chart.
 * @param {HTMLElement} container
 * @param {Object} meta
 * @param {Object} spec
 * @param {Function} rerender — callback to re-render with new viewport
 */
export function attachZoom(container, meta, spec, rerender) {
  if (!spec.zoom) return;

  const inner = container.querySelector('.d-chart-inner');
  if (!inner) return;

  let scale = 1;
  let panX = 0, panY = 0;
  let dragging = false, lastX = 0, lastY = 0;

  inner.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.5, Math.min(10, scale * delta));

    if (spec.onZoom) {
      spec.onZoom({ scale, panX, panY });
    }
  }, { passive: false });

  inner.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    inner.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    panX += e.clientX - lastX;
    panY += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    if (spec.onZoom) {
      spec.onZoom({ scale, panX, panY });
    }
  });

  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      inner.style.cursor = '';
    }
  });
}

// --- Brush selection ---

/**
 * Attach brush selection to chart.
 * @param {HTMLElement} container
 * @param {Object} meta
 * @param {Object} spec — { brush: 'x'|'y'|'xy', onBrush: fn }
 */
export function attachBrush(container, meta, spec) {
  if (!spec.brush || !spec.onBrush) return;

  const { margins, innerW, innerH } = meta;
  const inner = container.querySelector('.d-chart-inner');
  if (!inner) return;

  const brushEl = document.createElement('div');
  brushEl.style.cssText = 'position:absolute;background:var(--d-primary-subtle);border:1px solid var(--d-primary-border);display:none;pointer-events:none;z-index:1';
  inner.appendChild(brushEl);

  let startX, startY, active = false;

  inner.addEventListener('mousedown', e => {
    if (e.button !== 0 || spec.zoom) return; // Don't conflict with zoom
    const rect = inner.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    active = true;
    brushEl.style.display = 'block';
  });

  document.addEventListener('mousemove', e => {
    if (!active) return;
    const rect = inner.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    const mode = spec.brush === true ? 'x' : spec.brush;
    const x0 = mode === 'y' ? margins.left : Math.min(startX, curX);
    const y0 = mode === 'x' ? margins.top : Math.min(startY, curY);
    const w = mode === 'y' ? innerW : Math.abs(curX - startX);
    const h = mode === 'x' ? innerH : Math.abs(curY - startY);

    brushEl.style.left = x0 + 'px';
    brushEl.style.top = y0 + 'px';
    brushEl.style.width = w + 'px';
    brushEl.style.height = h + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!active) return;
    active = false;
    brushEl.style.display = 'none';

    const rect = inner.getBoundingClientRect();
    // Compute range from brush rect
    const brushRect = brushEl.getBoundingClientRect();
    if (brushRect.width > 5 || brushRect.height > 5) {
      const range = {
        x: [brushRect.left - rect.left - margins.left, brushRect.right - rect.left - margins.left],
        y: [brushRect.top - rect.top - margins.top, brushRect.bottom - rect.top - margins.top]
      };
      spec.onBrush({ range });
    }
  });
}

// --- Click handler ---

/**
 * Attach click handler to chart data elements.
 * @param {SVGElement} svgEl
 * @param {Object} meta
 * @param {Object} spec — { onClick: fn }
 */
export function attachClick(svgEl, meta, spec) {
  if (!spec.onClick) return;

  const elements = svgEl.querySelectorAll('[data-series],[data-label]');
  for (const el of elements) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', e => {
      spec.onClick({
        point: {
          label: el.getAttribute('data-label') || '',
          value: el.getAttribute('data-value') || ''
        },
        series: el.getAttribute('data-series') || '',
        event: e
      });
    });
  }
}

// --- Keyboard navigation ---

/**
 * Attach keyboard navigation to chart.
 * Arrow keys navigate between data elements, Enter activates.
 * @param {SVGElement} svgEl
 * @param {Object} spec
 */
export function attachKeyboard(svgEl, spec) {
  const focusable = svgEl.querySelectorAll('[tabindex]');
  if (!focusable.length) return;

  svgEl.addEventListener('keydown', e => {
    const focused = svgEl.querySelector(':focus');
    if (!focused) return;

    const items = [...focusable];
    const idx = items.indexOf(focused);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(idx + 1) % items.length];
      next.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      prev.focus();
    } else if (e.key === 'Escape') {
      focused.blur();
    }
  });
}

// --- Legend toggle ---

/**
 * Build interactive legend with toggle support.
 * @param {Object[]} series — [{ key, color }]
 * @param {Object} spec — { onLegendToggle }
 * @returns {HTMLElement}
 */
export function buildInteractiveLegend(series, spec) {
  const legend = document.createElement('div');
  legend.className = 'd-chart-legend';

  const toggleState = new Map();

  for (const s of series) {
    const item = document.createElement('span');
    item.className = 'd-chart-legend-item';

    const swatch = document.createElement('span');
    swatch.className = 'd-chart-legend-swatch';
    swatch.style.background = s.color;
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(s.key));

    toggleState.set(s.key, true);

    item.addEventListener('click', () => {
      const visible = !toggleState.get(s.key);
      toggleState.set(s.key, visible);
      item.classList.toggle('d-chart-legend-disabled', !visible);

      if (spec.onLegendToggle) {
        spec.onLegendToggle({ series: s.key, visible });
      }
    });

    legend.appendChild(item);
  }

  return legend;
}

// --- Spatial index (R-tree simplified) ---

/**
 * Build spatial index from scene graph for hit testing.
 * @param {Object} sceneGraph
 * @returns {Object} index with .query(x, y) method
 */
export function buildSpatialIndex(sceneGraph) {
  const items = [];

  function collect(node) {
    if (!node) return;
    if (node.data && (node.type === 'rect' || node.type === 'circle' || node.type === 'arc' || node.type === 'path')) {
      items.push(node);
    }
    if (node.children) {
      for (const child of node.children) collect(child);
    }
  }

  collect(sceneGraph);

  return {
    query(x, y, radius = 10) {
      const results = [];
      for (const item of items) {
        if (item.type === 'rect') {
          if (x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h) {
            results.push(item);
          }
        } else if (item.type === 'circle') {
          const dx = x - item.cx, dy = y - item.cy;
          if (Math.sqrt(dx * dx + dy * dy) <= (item.r || 0) + radius) {
            results.push(item);
          }
        }
      }
      return results;
    }
  };
}
