/**
 * Combination chart — mixed types on shared axes (layers API).
 * @module types/combination
 */

import { scene, group, path, rect, gradient } from '../_scene.js';
import { pointsToPathD, smoothPathD, areaPathD, smoothAreaPathD } from '../_scene.js';
import { cartesian } from '../layouts/cartesian.js';
import { chartColor, buildAnnotations } from '../layouts/_layout-base.js';
import { resolve, scaleBand } from '../_shared.js';

export function layoutCombination(spec, width, height) {
  const data = resolve(spec.data);
  const layers = spec.layers || [];
  if (!layers.length) {
    return scene(width, height, [], { type: 'combination', dataLength: 0 });
  }

  // Gather all Y fields for scale
  const allYFields = layers.map(l => l.y).filter(Boolean);
  const coords = cartesian({ ...spec, y: allYFields }, width, height, {
    bandX: layers.some(l => l.type === 'bar')
  });
  const { innerW, innerH, margins, xScale, yScale, xType, axisNodes, gridNodes, categories } = coords;

  const children = [];
  if (spec.grid !== false) children.push(...gridNodes);
  children.push(...axisNodes);

  const series = [];
  const bandW = xType === 'band' && xScale.bandwidth ? xScale.bandwidth() : 0;
  let barLayerIdx = 0;
  const barLayers = layers.filter(l => l.type === 'bar');

  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const yField = layer.y;
    const color = layer.color || chartColor(li);
    series.push({ key: yField, color });

    if (layer.type === 'bar') {
      const subBandW = barLayers.length > 1 ? bandW / barLayers.length : bandW;
      const offset = barLayers.length > 1 ? barLayerIdx * subBandW : 0;
      barLayerIdx++;

      for (const d of data) {
        const val = +d[yField] || 0;
        const x = xScale(d[spec.x]) + offset;
        children.push(rect({
          x, y: yScale(val), w: subBandW * 0.85, h: yScale(0) - yScale(val),
          fill: color, rx: Math.min(4, subBandW * 0.85 / 4), class: 'd-chart-bar',
          data: { series: yField, value: val, label: String(d[spec.x]) },
          key: `combo-bar-${li}-${d[spec.x]}`
        }));
      }
    } else if (layer.type === 'area') {
      const baseline = yScale(0);
      const points = data.map(d => {
        const xVal = xType === 'band' ? d[spec.x] : +d[spec.x];
        const x = xScale(xVal) + (xType === 'band' ? bandW / 2 : 0);
        return { x, y0: yScale(+d[yField] || 0), y1: baseline };
      });
      // Gradient fill
      const gradId = `combo-area-grad-${li}`;
      const yMin = Math.min(...points.map(p => p.y0));
      const yMax = Math.max(...points.map(p => p.y1));
      children.push(gradient({
        id: gradId, x1: '0', y1: yMin, x2: '0', y2: yMax,
        stops: [
          { offset: '0%', color, opacity: 0.3 },
          { offset: '100%', color, opacity: 0.02 }
        ]
      }));
      const useSmooth = layer.smooth !== undefined ? layer.smooth : spec.smooth;
      const areaD = useSmooth ? smoothAreaPathD(points) : areaPathD(points);
      children.push(path({ d: areaD, fill: `url(#${gradId})`, key: `combo-area-${li}` }));
      const linePts = points.map(p => ({ x: p.x, y: p.y0 }));
      const lineD = useSmooth ? smoothPathD(linePts) : pointsToPathD(linePts);
      children.push(path({
        d: lineD, stroke: color, strokeWidth: 2, class: 'd-chart-line', key: `combo-area-line-${li}`
      }));
    } else {
      // Line (default)
      const points = data.map(d => {
        const xVal = xType === 'band' ? d[spec.x] : +d[spec.x];
        const x = xScale(xVal) + (xType === 'band' ? bandW / 2 : 0);
        return { x, y: yScale(+d[yField] || 0) };
      });
      const useSmooth = layer.smooth !== undefined ? layer.smooth : spec.smooth;
      const pathD = useSmooth ? smoothPathD(points) : pointsToPathD(points);
      children.push(path({
        d: pathD, stroke: color, strokeWidth: 2,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        class: 'd-chart-line',
        data: { series: yField }, key: `combo-line-${li}`
      }));
    }
  }

  // Annotations
  if (spec.annotations) {
    children.push(...buildAnnotations(spec.annotations, xScale, yScale, xType, innerW, innerH));
  }

  return scene(width, height, [
    group({ transform: `translate(${margins.left},${margins.top})` }, children)
  ], { type: 'combination', series, margins, innerW, innerH, dataLength: data.length });
}
