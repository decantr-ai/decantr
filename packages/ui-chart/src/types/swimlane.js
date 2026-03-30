/**
 * Swimlane / Kanban chart layout.
 * Supports: lanes, cards, drag-reorder callbacks.
 * @module types/swimlane
 */

import { scene, group, rect, text, line } from '../_scene.js';
import { chartColor, MARGINS } from '../layouts/_layout-base.js';
import { resolve, groupBy, unique } from '../_shared.js';

export function layoutSwimlane(spec, width, height) {
  const rawData = resolve(spec.data);
  // Support structured {lanes, items} or flat array
  const data = Array.isArray(rawData) ? rawData : (rawData && rawData.items) || [];
  const laneField = spec.lane || spec.x || 'lane';
  const labelField = spec.label || spec.y || 'label';
  const idField = spec.id || 'id';

  const margins = { top: 40, right: 8, bottom: 8, left: 8 };
  const innerW = width - margins.left - margins.right;
  const innerH = height - margins.top - margins.bottom;

  // Use explicit lanes array or derive from data
  const lanesDef = rawData && rawData.lanes;
  const lanes = lanesDef ? lanesDef.map(l => typeof l === 'string' ? l : l.label || l.id) : unique(data, laneField);
  const laneIds = lanesDef ? lanesDef.map(l => typeof l === 'string' ? l : l.id) : lanes;
  const laneW = innerW / (lanes.length || 1);
  const cardPad = 8;
  const cardH = 36;
  const headerH = 28;

  const children = [];

  for (let li = 0; li < lanes.length; li++) {
    const laneName = lanes[li];
    const lx = li * laneW;
    const color = chartColor(li);

    // Lane background
    children.push(rect({
      x: lx + 2, y: 0, w: laneW - 4, h: innerH,
      rx: 4, fill: color, opacity: 0.05,
      key: `lane-bg-${li}`
    }));

    // Lane separator
    if (li > 0) {
      children.push(line({ x1: lx, y1: 0, x2: lx, y2: innerH, stroke: 'var(--d-border)', strokeWidth: 1 }));
    }

    // Lane header
    children.push(text({
      x: lx + laneW / 2, y: headerH / 2 + 4,
      content: String(laneName), anchor: 'middle',
      fill: 'var(--d-fg)', fontSize: 'var(--d-text-sm)',
      fontWeight: 'var(--d-fw-title)'
    }));

    // Cards — match by lane ID or lane label
    const laneId = laneIds[li];
    const laneData = data.filter(d => d[laneField] === laneId || d[laneField] === laneName);
    for (let ci = 0; ci < laneData.length; ci++) {
      const d = laneData[ci];
      const cy = headerH + cardPad + ci * (cardH + cardPad);

      children.push(rect({
        x: lx + cardPad, y: cy, w: laneW - cardPad * 2, h: cardH,
        rx: 4, fill: 'var(--d-surface-1)', stroke: 'var(--d-border)', strokeWidth: 1,
        class: 'd-chart-bar',
        data: { label: d[labelField] || d[idField], value: laneName, series: 'swimlane' },
        key: `card-${d[idField] || `${li}-${ci}`}`
      }));

      children.push(text({
        x: lx + cardPad + 8, y: cy + cardH / 2 + 4,
        content: String(d[labelField] || d[idField] || '').slice(0, 25),
        anchor: 'start', fill: 'var(--d-fg)',
        fontSize: 'var(--d-text-xs)'
      }));
    }
  }

  const series = lanes.map((l, i) => ({ key: l, color: chartColor(i) }));

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'swimlane', series, lanes, margins, innerW, innerH, dataLength: data.length });
}
