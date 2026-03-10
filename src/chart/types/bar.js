/**
 * Bar chart layout — produces scene graph.
 * Supports: grouped, stacked, horizontal, 100% stacked.
 * @module types/bar
 */

import { scene, group, rect, text } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor, buildYScale, MARGINS, innerDimensions } from '../layouts/_layout-base.js';
import { resolve, unique, scaleBand } from '../_shared.js';

/**
 * @param {Object} spec — resolved chart spec
 * @param {number} width
 * @param {number} height
 * @returns {Object} scene graph
 */
export function layoutBar(spec, width, height) {
  const data = resolve(spec.data);
  const yFields = Array.isArray(spec.y) ? spec.y : [spec.y];
  const horizontal = !!spec.horizontal;

  if (horizontal) return layoutHorizontalBar(spec, data, yFields, width, height);

  const categories = unique(data, spec.x);
  const margins = { ...MARGINS };
  const { innerW, innerH } = innerDimensions(width, height, margins);

  const xScale = scaleBand(categories, [0, innerW], 0.2);
  const yScale = buildYScale(data, yFields, innerH, { stacked: !!spec.stacked });
  const bandW = xScale.bandwidth();

  // Build bars
  const bars = buildBars(data, spec, categories, yFields, xScale, yScale, bandW);

  // Build scene children
  const coords = cartesian(spec, width, height, { bandX: true, yOpts: { stacked: !!spec.stacked } });
  const children = [];

  if (spec.grid !== false) children.push(...coords.gridNodes);
  children.push(...coords.axisNodes);

  // Render bars as rects
  for (const bar of bars) {
    for (const seg of bar.segments) {
      children.push(rect({
        x: seg.x, y: seg.y, w: Math.max(0, seg.width), h: Math.max(0, seg.height),
        rx: Math.min(2, seg.width / 4), fill: seg.color,
        class: 'd-chart-bar',
        data: { series: seg.field, value: seg.value, label: bar.category },
        key: `bar-${bar.category}-${seg.field}`
      }));

      // Labels
      if (spec.labels) {
        children.push(text({
          x: seg.x + seg.width / 2, y: seg.y - 4,
          content: String(seg.value), anchor: 'middle',
          class: 'd-chart-axis', fontSize: 'var(--d-text-xs)'
        }));
      }
    }
  }

  const series = yFields.map((f, i) => ({ key: f, color: chartColor(i) }));

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'bar', series, xScale, yScale, xType: 'band', categories, bars, margins, innerW, innerH, dataLength: data.length });
}

function layoutHorizontalBar(spec, data, yFields, width, height) {
  const coords = cartesian({ ...spec, horizontal: true }, width, height, {
    bandX: true, yOpts: { stacked: !!spec.stacked }
  });
  const { innerW, innerH, margins, xScale, yScale, categories, axisNodes, gridNodes } = coords;
  const bandW = xScale.bandwidth();

  const children = [];
  if (spec.grid !== false) children.push(...gridNodes);
  children.push(...axisNodes);

  const bars = [];
  for (const cat of categories) {
    const row = data.find(d => d[spec.x] === cat);
    if (!row) continue;
    const segments = yFields.map((f, i) => {
      const val = +row[f] || 0;
      return {
        field: f, color: chartColor(i),
        x: 0, y: xScale(cat), width: yScale(val), height: bandW,
        value: val, raw: row
      };
    });
    bars.push({ category: cat, segments });
    for (const seg of segments) {
      children.push(rect({
        x: seg.x, y: seg.y, w: Math.max(0, seg.width), h: Math.max(0, seg.height),
        rx: Math.min(2, seg.height / 4), fill: seg.color,
        class: 'd-chart-bar',
        data: { series: seg.field, value: seg.value, label: cat },
        key: `bar-h-${cat}-${seg.field}`
      }));
    }
  }

  const series = yFields.map((f, i) => ({ key: f, color: chartColor(i) }));

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'bar', series, bars, categories, margins, innerW, innerH, dataLength: data.length, horizontal: true });
}

function buildBars(data, spec, categories, yFields, xScale, yScale, bandW) {
  if (spec.stacked && yFields.length > 1) {
    return categories.map(cat => {
      const row = data.find(d => d[spec.x] === cat);
      if (!row) return null;
      let cumY = 0;
      const segments = yFields.map((f, i) => {
        const val = +row[f] || 0;
        const y0 = cumY;
        cumY += val;
        return {
          field: f, color: chartColor(i),
          x: xScale(cat), y: yScale(cumY), width: bandW,
          height: yScale(y0) - yScale(cumY), value: val, raw: row
        };
      });
      return { category: cat, segments };
    }).filter(Boolean);
  }

  if (yFields.length > 1) {
    const groupBandW = bandW / yFields.length;
    return categories.map(cat => {
      const row = data.find(d => d[spec.x] === cat);
      if (!row) return null;
      const segments = yFields.map((f, i) => {
        const val = +row[f] || 0;
        return {
          field: f, color: chartColor(i),
          x: xScale(cat) + i * groupBandW, y: yScale(val),
          width: groupBandW * 0.85, height: yScale(0) - yScale(val),
          value: val, raw: row
        };
      });
      return { category: cat, segments };
    }).filter(Boolean);
  }

  return data.map(d => {
    const val = +d[yFields[0]] || 0;
    return {
      category: d[spec.x],
      segments: [{
        field: yFields[0], color: chartColor(0),
        x: xScale(d[spec.x]), y: yScale(val), width: bandW,
        height: yScale(0) - yScale(val), value: val, raw: d
      }]
    };
  });
}
