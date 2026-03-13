/**
 * Line chart layout — produces scene graph.
 * Supports: multi-series, step, smooth interpolation, labels, gaps.
 * @module types/line
 */

import { scene, group, path, circle, text } from '../_scene.js';
import { pointsToPathD, smoothPathD, stepPathD } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor, buildAnnotations } from '../layouts/_layout-base.js';
import { resolve, groupBy, downsampleLTTB } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} scene graph
 */
export function layoutLine(spec, width, height) {
  const data = resolve(spec.data);
  const coords = cartesian(spec, width, height);
  const { innerW, innerH, margins, xScale, yScale, xType, axisNodes, gridNodes } = coords;
  const fields = Array.isArray(spec.y) ? spec.y : [spec.y];

  // Build series
  let series;
  if (spec.series) {
    const groups = groupBy(data, spec.series);
    series = [...groups.entries()].map(([key, rows], i) => {
      const sampled = rows.length > innerW * 2 ? downsampleLTTB(rows, spec.x, fields[0], Math.round(innerW * 2)) : rows;
      return {
        key, color: chartColor(i),
        points: mapPoints(sampled, spec, xScale, yScale, xType, fields[0])
      };
    });
  } else {
    series = fields.map((f, i) => {
      const sampled = data.length > innerW * 2 ? downsampleLTTB(data, spec.x, f, Math.round(innerW * 2)) : data;
      return {
        key: f, color: chartColor(i),
        points: mapPoints(sampled, spec, xScale, yScale, xType, f)
      };
    });
  }

  // Build scene
  const children = [];

  // Grid
  if (spec.grid !== false) children.push(...gridNodes);

  // Axes
  children.push(...axisNodes);

  // Lines
  for (const s of series) {
    if (s.points.length < 2) continue;
    let d;
    if (spec.step) d = stepPathD(s.points);
    else if (spec.smooth) d = smoothPathD(s.points);
    else d = pointsToPathD(s.points);

    children.push(path({
      d, stroke: s.color, strokeWidth: 2,
      strokeLinecap: 'round', strokeLinejoin: 'round',
      class: 'd-chart-line',
      data: { series: s.key }, key: `line-${s.key}`
    }));

    // Data point dots (suppress when points > 50 for LTTB-downsampled datasets)
    if (spec.dots !== false && s.points.length <= 50) {
      for (const p of s.points) {
        children.push(circle({
          cx: p.x, cy: p.y, r: 3,
          fill: s.color, stroke: 'var(--d-bg)', strokeWidth: 2,
          class: 'd-chart-point',
          data: { series: s.key, value: p.raw[Array.isArray(spec.y) ? s.key : spec.y], label: String(p.raw[spec.x]) },
          key: `dot-${s.key}-${p.x}`
        }));
      }
    }

    // Data point labels
    if (spec.labels) {
      for (const p of s.points) {
        children.push(text({
          x: p.x, y: p.y - 8,
          content: String(p.raw[Array.isArray(spec.y) ? s.key : spec.y]),
          anchor: 'middle', class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
        }));
      }
    }
  }

  // Annotations
  if (spec.annotations) {
    children.push(...buildAnnotations(spec.annotations, xScale, yScale, xType, innerW, innerH));
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'line', series, xScale, yScale, xType, margins, innerW, innerH, dataLength: data.length });
}

function mapPoints(data, spec, xScale, yScale, xType, field) {
  return data.map(d => {
    const xVal = xType === 'band' ? d[spec.x] : (xType === 'time' ? new Date(d[spec.x]) : +d[spec.x]);
    const x = xScale(xVal) + (xType === 'band' ? xScale.bandwidth() / 2 : 0);
    return { x, y: yScale(+d[field]), raw: d };
  });
}
