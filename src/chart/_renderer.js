/**
 * Renderer interface and auto-selection dispatch.
 * Selects SVG, Canvas, or WebGPU based on data size or explicit override.
 * Fallback chain: WebGPU → Canvas → SVG.
 * @module _renderer
 */

import { renderSVG } from './renderers/svg.js';
import { renderCanvas } from './renderers/canvas.js';

/** @type {number} Threshold below which SVG is used */
const SVG_THRESHOLD = 3000;

/**
 * Auto-select and invoke the appropriate renderer.
 * Dispatch: SVG (<3K) → WebGPU (3K+, if available) → Canvas (fallback).
 * @param {Object} sceneGraph — scene graph from layout function
 * @param {Object} spec — original chart spec (for renderer override)
 * @returns {SVGElement|HTMLCanvasElement}
 */
export function render(sceneGraph, spec) {
  const renderer = spec.renderer || 'auto';
  const dataLen = sceneGraph.meta?.dataLength || 0;

  if (renderer === 'svg' || (renderer === 'auto' && dataLen < SVG_THRESHOLD)) {
    return renderSVG(sceneGraph);
  }

  if (renderer === 'canvas') {
    return renderCanvas(sceneGraph);
  }

  if (renderer === 'webgpu' || renderer === 'auto') {
    // WebGPU-first for large datasets, Canvas as fallback
    if (renderWebGPU) return renderWebGPU(sceneGraph);
    return renderCanvas(sceneGraph);
  }

  return renderSVG(sceneGraph);
}

// WebGPU renderer reference (set when loaded)
let renderWebGPU = null;

/**
 * Register a renderer implementation.
 * @param {'webgpu'} type
 * @param {Function} renderFn
 */
export function registerRenderer(type, renderFn) {
  if (type === 'webgpu') renderWebGPU = renderFn;
}
