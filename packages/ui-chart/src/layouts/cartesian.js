/**
 * Shared cartesian coordinate layout.
 * Used by 13 chart types. Handles: margin calculation, x/y scale construction,
 * axis tick generation, grid lines, horizontal mode, secondary y-axis, zoom viewport.
 * @module layouts/cartesian
 */

import { scene, group } from '../_scene.js';
import {
  MARGINS, innerDimensions, buildXScale, buildYScale,
  buildXAxisNodes, buildYAxisNodes, buildGridNodes, chartColor
} from './_layout-base.js';
import { scaleBand, scaleLinear, unique, extent, padExtent } from '../_shared.js';

/**
 * Build a complete cartesian coordinate system.
 * Returns dimensions, scales, and a scene group with axes + grid.
 *
 * @param {Object} spec — chart spec
 * @param {number} width
 * @param {number} height
 * @param {Object} [opts]
 * @param {boolean} [opts.bandX=false] — force band X scale
 * @param {boolean} [opts.skipAxes=false] — skip axis/grid generation
 * @param {Object} [opts.margins] — override margins
 * @param {Object} [opts.yOpts] — pass to buildYScale
 * @returns {{ innerW, innerH, margins, xScale, yScale, xType, y2Scale, categories, axisNodes, gridNodes, spec }}
 */
export function cartesian(spec, width, height, opts = {}) {
  const data = Array.isArray(spec.data) ? spec.data : [];
  const horizontal = !!spec.horizontal;
  const margins = opts.margins || { ...MARGINS };

  // Increase left margin for horizontal charts (labels on Y axis)
  if (horizontal) margins.left = Math.max(margins.left, 72);

  // Increase right margin for secondary Y axis
  if (spec.y2) margins.right = Math.max(margins.right, 48);

  const { innerW, innerH } = innerDimensions(width, height, margins);

  // Resolve field names
  const xField = spec.x;
  const yFields = Array.isArray(spec.y) ? spec.y : [spec.y];

  let xScale, xType, yScale, y2Scale, categories;

  if (horizontal) {
    // Horizontal mode: Y becomes categorical, X becomes value
    categories = unique(data, xField);
    xScale = scaleBand(categories, [0, innerH], 0.2);
    xType = 'band';
    yScale = buildYScale(data, yFields, innerW, { ...opts.yOpts, padBottom: opts.yOpts?.padBottom });
    // Swap: yScale maps to horizontal (innerW) but we need it to go left→right
    const yMin = 0, yMax = extent(data, yFields[0])[1];
    yScale = scaleLinear(padExtent([yMin, yMax], 0.05), [0, innerW]);
    if (yScale.ticks) { /* keep ticks */ }
  } else {
    // Normal: X is categorical or continuous, Y is value
    if (opts.bandX) {
      categories = unique(data, xField);
      xScale = scaleBand(categories, [0, innerW], 0.2);
      xType = 'band';
    } else {
      const built = buildXScale(data, xField, innerW);
      xScale = built.scale;
      xType = built.type;
      if (xType === 'band') categories = unique(data, xField);
    }

    yScale = buildYScale(data, yFields, innerH, opts.yOpts || { stacked: !!spec.stacked });

    // Secondary Y axis
    if (spec.y2) {
      const y2Fields = Array.isArray(spec.y2) ? spec.y2 : [spec.y2];
      y2Scale = buildYScale(data, y2Fields, innerH, { padBottom: true });
    }
  }

  // Build axis + grid scene nodes
  let axisNodes = [];
  let gridNodes = [];

  if (!opts.skipAxes) {
    if (horizontal) {
      // Horizontal: value axis on bottom, category axis on left
      // Value axis (bottom)
      axisNodes.push(...buildHorizontalValueAxis(yScale, innerW, innerH, spec));
      // Category axis (left)
      axisNodes.push(...buildHorizontalCategoryAxis(xScale, categories, innerH));
      // Grid (vertical lines)
      gridNodes = buildHorizontalGrid(yScale, innerH);
    } else {
      axisNodes.push(...buildXAxisNodes(xScale, xType, innerH, innerW, spec, { categories }));
      axisNodes.push(...buildYAxisNodes(yScale, innerH, spec));
      gridNodes = buildGridNodes(yScale, innerW);
    }
  }

  return {
    width, height, innerW, innerH, margins,
    xScale, yScale, xType, y2Scale,
    categories, axisNodes, gridNodes,
    horizontal, data, spec
  };
}

// --- Horizontal chart axis helpers ---

import { line, text } from '../_scene.js';

function buildHorizontalValueAxis(valueScale, innerW, innerH, spec) {
  const nodes = [
    line({ x1: 0, y1: innerH, x2: innerW, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' })
  ];
  const ticks = valueScale.ticks(5);
  const fmt = spec.yFormat || (v => {
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  });
  for (const t of ticks) {
    const x = valueScale(t);
    nodes.push(text({ x, y: innerH + 20, content: fmt(t), anchor: 'middle', class: 'd-chart-axis' }));
  }
  return nodes;
}

function buildHorizontalCategoryAxis(bandScale, categories, innerH) {
  const nodes = [
    line({ x1: 0, y1: 0, x2: 0, y2: innerH, stroke: 'var(--d-border)', class: 'd-chart-axis' })
  ];
  const bandW = bandScale.bandwidth();
  for (const cat of categories) {
    const y = bandScale(cat) + bandW / 2;
    nodes.push(text({ x: -8, y: y + 4, content: String(cat), anchor: 'end', class: 'd-chart-axis' }));
  }
  return nodes;
}

function buildHorizontalGrid(valueScale, innerH) {
  const ticks = valueScale.ticks(5);
  return ticks.map(t => line({
    x1: valueScale(t), y1: 0, x2: valueScale(t), y2: innerH,
    class: 'd-chart-grid'
  }));
}
