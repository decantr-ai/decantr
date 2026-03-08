/**
 * Renderer interface and auto-selection dispatch.
 * Selects SVG, Canvas, or WebGPU based on data size or explicit override.
 */

import { renderSVG } from './renderers/svg.js';

/** @type {number} Threshold below which SVG is used */
const SVG_THRESHOLD = 3000;

/** @type {number} Threshold below which Canvas 2D is used (above → WebGPU) */
// const CANVAS_THRESHOLD = 10000;  // Phase 3+

/**
 * Auto-select and invoke the appropriate renderer.
 * @param {Object} layout — computed layout from type module
 * @param {Object} spec — original chart spec (for renderer override, dimensions)
 * @returns {SVGElement|HTMLCanvasElement}
 */
export function render(layout, spec) {
  const renderer = spec.renderer || 'auto';
  const dataLen = layout.dataLength || 0;

  if (renderer === 'svg' || (renderer === 'auto' && dataLen < SVG_THRESHOLD)) {
    return renderSVG(layout, spec);
  }

  // Phase 3: Canvas 2D
  // if (renderer === 'canvas' || (renderer === 'auto' && dataLen < CANVAS_THRESHOLD)) {
  //   return renderCanvas(layout, spec);
  // }

  // Phase 4: WebGPU
  // return renderWebGPU(layout, spec);

  // Fallback to SVG until Canvas/WebGPU are implemented
  return renderSVG(layout, spec);
}
