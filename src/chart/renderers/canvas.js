/**
 * Canvas 2D Renderer — renders scene graph to canvas.
 * Used for datasets 3K-50K elements. DPI-aware.
 * @module renderers/canvas
 */

import { arcToPath } from '../_scene.js';

/**
 * Render scene graph to Canvas 2D.
 * @param {Object} sceneNode
 * @returns {HTMLCanvasElement}
 */
export function renderCanvas(sceneNode) {
  if (!sceneNode || sceneNode.type !== 'scene') {
    const c = document.createElement('canvas');
    c.width = 100; c.height = 100;
    return c;
  }

  const { width, height, children } = sceneNode;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  canvas.className = 'd-chart-svg'; // reuse class for sizing

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Resolve CSS variables for colors
  const colorCache = new Map();
  const resolveColor = (color) => {
    if (!color || color === 'none') return null;
    if (color.startsWith('var(')) {
      if (colorCache.has(color)) return colorCache.get(color);
      const prop = color.match(/var\((--[^,)]+)/)?.[1];
      if (prop && typeof getComputedStyle === 'function') {
        const resolved = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
        if (resolved) { colorCache.set(color, resolved); return resolved; }
      }
      const fallback = color.match(/,\s*([^)]+)\)/)?.[1];
      return fallback || '#666';
    }
    return color;
  };

  for (const child of children) {
    renderNode(ctx, child, resolveColor);
  }

  return canvas;
}

function renderNode(ctx, node, resolveColor) {
  if (!node) return;

  ctx.save();

  if (node.opacity != null) ctx.globalAlpha = node.opacity;

  switch (node.type) {
    case 'group': renderGroup(ctx, node, resolveColor); break;
    case 'path': renderPath(ctx, node, resolveColor); break;
    case 'rect': renderRect(ctx, node, resolveColor); break;
    case 'circle': renderCircle(ctx, node, resolveColor); break;
    case 'text': renderText(ctx, node, resolveColor); break;
    case 'line': renderLine(ctx, node, resolveColor); break;
    case 'arc': renderArc(ctx, node, resolveColor); break;
    case 'polygon': renderPolygon(ctx, node, resolveColor); break;
  }

  ctx.restore();
}

function renderGroup(ctx, node, resolveColor) {
  if (node.transform) {
    const match = node.transform.match(/translate\(([^,]+),([^)]+)\)/);
    if (match) ctx.translate(+match[1], +match[2]);
  }
  if (node.children) {
    for (const child of node.children) renderNode(ctx, child, resolveColor);
  }
}

function renderPath(ctx, node, resolveColor) {
  if (!node.d) return;
  const p = new Path2D(node.d);
  const fill = resolveColor(node.fill);
  const stroke = resolveColor(node.stroke);

  if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = node.strokeWidth || 1;
    if (node.strokeLinecap) ctx.lineCap = node.strokeLinecap;
    if (node.strokeLinejoin) ctx.lineJoin = node.strokeLinejoin;
    if (node.strokeDash) ctx.setLineDash(node.strokeDash.split(',').map(Number));
    ctx.stroke(p);
    ctx.setLineDash([]);
  }
}

function renderRect(ctx, node, resolveColor) {
  const { x, y, w, h, rx } = node;
  const fill = resolveColor(node.fill);
  const stroke = resolveColor(node.stroke);

  if (rx && rx > 0) {
    const r = Math.min(rx, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = node.strokeWidth || 1; ctx.stroke(); }
  } else {
    if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, Math.max(0, w), Math.max(0, h)); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = node.strokeWidth || 1; ctx.strokeRect(x, y, Math.max(0, w), Math.max(0, h)); }
  }
}

function renderCircle(ctx, node, resolveColor) {
  ctx.beginPath();
  ctx.arc(node.cx, node.cy, node.r, 0, Math.PI * 2);
  const fill = resolveColor(node.fill);
  const stroke = resolveColor(node.stroke);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = node.strokeWidth || 1; ctx.stroke(); }
}

function renderText(ctx, node, resolveColor) {
  const fill = resolveColor(node.fill) || resolveColor('var(--d-muted)') || '#666';
  ctx.fillStyle = fill;
  ctx.font = `${node.fontWeight || ''} ${node.fontSize || '10px'} ${getComputedStyle(document.documentElement).getPropertyValue('--d-font').trim() || 'sans-serif'}`.trim();
  ctx.textAlign = node.anchor === 'middle' ? 'center' : (node.anchor === 'end' ? 'right' : 'left');
  ctx.textBaseline = node.baseline === 'middle' ? 'middle' : 'alphabetic';
  ctx.fillText(node.content || '', node.x, node.y);
}

function renderLine(ctx, node, resolveColor) {
  const stroke = resolveColor(node.stroke) || resolveColor('var(--d-border)') || '#ccc';
  ctx.beginPath();
  ctx.moveTo(node.x1, node.y1);
  ctx.lineTo(node.x2, node.y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = node.strokeWidth || 1;
  if (node.strokeDash) ctx.setLineDash(node.strokeDash.split(',').map(Number));
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderArc(ctx, node, resolveColor) {
  const d = arcToPath(node.cx, node.cy, node.outerR, node.innerR || 0, node.startAngle, node.endAngle);
  const p = new Path2D(d);
  const fill = resolveColor(node.fill);
  if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
  if (node.stroke) { ctx.strokeStyle = resolveColor(node.stroke); ctx.lineWidth = node.strokeWidth || 1; ctx.stroke(p); }
}

function renderPolygon(ctx, node, resolveColor) {
  if (!node.points || !node.points.length) return;
  ctx.beginPath();
  ctx.moveTo(node.points[0].x, node.points[0].y);
  for (let i = 1; i < node.points.length; i++) ctx.lineTo(node.points[i].x, node.points[i].y);
  ctx.closePath();
  const fill = resolveColor(node.fill);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (node.stroke) { ctx.strokeStyle = resolveColor(node.stroke); ctx.lineWidth = node.strokeWidth || 1; ctx.stroke(); }
}
