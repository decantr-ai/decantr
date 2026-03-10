/**
 * SVG Renderer — renders scene graph nodes to SVG DOM.
 * Default renderer for datasets < 3K elements.
 * All colors reference CSS custom properties for theme integration.
 * @module renderers/svg
 */

import { arcToPath } from '../_scene.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create an SVG element with attributes and children.
 * @param {string} tag
 * @param {Object} attrs
 * @param {...(SVGElement|string)} children
 * @returns {SVGElement}
 */
function svgEl(tag, attrs, ...children) {
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
 * Render a scene graph to an SVG element.
 * @param {Object} sceneNode — root scene node
 * @returns {SVGElement}
 */
export function renderSVG(sceneNode) {
  if (!sceneNode || sceneNode.type !== 'scene') {
    return svgEl('svg', { width: 100, height: 100 });
  }

  const { width, height, children } = sceneNode;
  const root = svgEl('svg', {
    class: 'd-chart-svg',
    viewBox: `0 0 ${width} ${height}`,
    width, height
  });

  for (const child of children) {
    const el = renderNode(child);
    if (el) root.appendChild(el);
  }

  return root;
}

/**
 * Render a single scene node to SVG element.
 * @param {Object} node
 * @returns {SVGElement|null}
 */
function renderNode(node) {
  if (!node) return null;

  switch (node.type) {
    case 'group': return renderGroup(node);
    case 'path': return renderPath(node);
    case 'rect': return renderRect(node);
    case 'circle': return renderCircle(node);
    case 'text': return renderText(node);
    case 'line': return renderLine(node);
    case 'arc': return renderArc(node);
    case 'polygon': return renderPolygon(node);
    case 'image': return renderImage(node);
    default: return null;
  }
}

function renderGroup(node) {
  const attrs = {};
  if (node.transform) attrs.transform = node.transform;
  if (node.class) attrs.class = node.class;
  if (node.clip) attrs['clip-path'] = node.clip;
  if (node.opacity != null) attrs.opacity = node.opacity;

  const g = svgEl('g', attrs);
  if (node.children) {
    for (const child of node.children) {
      const el = renderNode(child);
      if (el) g.appendChild(el);
    }
  }
  return g;
}

function renderPath(node) {
  const attrs = { d: node.d };
  if (node.fill) attrs.fill = node.fill; else attrs.fill = 'none';
  if (node.stroke) attrs.stroke = node.stroke;
  if (node.strokeWidth) attrs['stroke-width'] = node.strokeWidth;
  if (node.strokeDash) attrs['stroke-dasharray'] = node.strokeDash;
  if (node.strokeLinecap) attrs['stroke-linecap'] = node.strokeLinecap;
  if (node.strokeLinejoin) attrs['stroke-linejoin'] = node.strokeLinejoin;
  if (node.class) attrs.class = node.class;
  if (node.opacity != null) attrs.opacity = node.opacity;
  applyData(attrs, node);
  return svgEl('path', attrs);
}

function renderRect(node) {
  if (isNaN(node.x) || isNaN(node.y)) return null;
  const attrs = {
    x: node.x, y: node.y,
    width: Math.max(0, node.w || 0),
    height: Math.max(0, node.h || 0)
  };
  if (node.rx) attrs.rx = node.rx;
  if (node.ry) attrs.ry = node.ry;
  if (node.fill) attrs.fill = node.fill;
  if (node.stroke) attrs.stroke = node.stroke;
  if (node.strokeWidth) attrs['stroke-width'] = node.strokeWidth;
  if (node.class) attrs.class = node.class;
  if (node.opacity != null) attrs.opacity = node.opacity;
  applyData(attrs, node);
  return svgEl('rect', attrs);
}

function renderCircle(node) {
  const attrs = { cx: node.cx, cy: node.cy, r: node.r };
  if (node.fill) attrs.fill = node.fill;
  if (node.stroke) attrs.stroke = node.stroke;
  if (node.strokeWidth) attrs['stroke-width'] = node.strokeWidth;
  if (node.class) attrs.class = node.class;
  if (node.opacity != null) attrs.opacity = node.opacity;
  applyData(attrs, node);
  return svgEl('circle', attrs);
}

function renderText(node) {
  if (isNaN(node.x) || isNaN(node.y)) return null;
  const attrs = { x: node.x, y: node.y };
  if (node.anchor) attrs['text-anchor'] = node.anchor;
  if (node.baseline) attrs['dominant-baseline'] = node.baseline;
  if (node.fill) attrs.fill = node.fill;
  if (node.class) attrs.class = node.class;
  if (node.fontSize) attrs['font-size'] = node.fontSize;
  if (node.fontWeight) attrs['font-weight'] = node.fontWeight;
  if (node.rotate) attrs.transform = `rotate(${node.rotate},${node.x},${node.y})`;
  return svgEl('text', attrs, node.content || '');
}

function renderLine(node) {
  const attrs = {
    x1: node.x1, y1: node.y1,
    x2: node.x2, y2: node.y2
  };
  if (node.stroke) attrs.stroke = node.stroke;
  if (node.strokeWidth) attrs['stroke-width'] = node.strokeWidth;
  if (node.strokeDash) attrs['stroke-dasharray'] = node.strokeDash;
  if (node.class) attrs.class = node.class;
  return svgEl('line', attrs);
}

function renderArc(node) {
  const d = arcToPath(node.cx, node.cy, node.outerR, node.innerR || 0, node.startAngle, node.endAngle);
  const attrs = { d };
  if (node.fill) attrs.fill = node.fill;
  if (node.stroke) attrs.stroke = node.stroke;
  if (node.class) attrs.class = node.class;
  if (node.opacity != null) attrs.opacity = node.opacity;
  applyData(attrs, node);

  // Pie slices get accessibility attrs
  if (node.data) {
    if (node.data.label) attrs['aria-label'] = node.data.ariaLabel || `${node.data.label}: ${node.data.value}`;
    attrs.tabindex = '0';
    attrs.role = 'listitem';
  }

  return svgEl('path', attrs);
}

function renderPolygon(node) {
  if (!node.points || !node.points.length) return null;
  const pointsStr = node.points.map(p => `${p.x},${p.y}`).join(' ');
  const attrs = { points: pointsStr };
  if (node.fill) attrs.fill = node.fill;
  if (node.stroke) attrs.stroke = node.stroke;
  if (node.strokeWidth) attrs['stroke-width'] = node.strokeWidth;
  if (node.class) attrs.class = node.class;
  if (node.opacity != null) attrs.opacity = node.opacity;
  applyData(attrs, node);
  return svgEl('polygon', attrs);
}

function renderImage(node) {
  const attrs = {
    x: node.x, y: node.y,
    width: node.w, height: node.h,
    href: node.href
  };
  if (node.class) attrs.class = node.class;
  return svgEl('image', attrs);
}

// --- Helpers ---

function applyData(attrs, node) {
  if (node.data) {
    if (node.data.series) attrs['data-series'] = node.data.series;
    if (node.data.label) attrs['data-label'] = node.data.label;
    if (node.data.value != null) attrs['data-value'] = node.data.value;
  }
  if (node.key) attrs['data-key'] = node.key;
}
