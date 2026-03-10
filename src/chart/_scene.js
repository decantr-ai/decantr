/**
 * Scene Graph — renderer-agnostic intermediate representation.
 * Plain objects with `type` discriminant. Serializable, diffable, minimal.
 * All layout functions produce scene nodes; renderers consume them.
 * @module _scene
 */

/**
 * Root scene node — container for all chart elements.
 * @param {number} width
 * @param {number} height
 * @param {Object[]} children
 * @param {Object} [meta] — chart-level metadata (type, margins, scales)
 * @returns {Object}
 */
export function scene(width, height, children, meta) {
  return { type: 'scene', width, height, children: children || [], meta: meta || {} };
}

/**
 * Group node — logical grouping with optional transform.
 * @param {Object} attrs — { transform, class, clip, opacity }
 * @param {Object[]} children
 * @returns {Object}
 */
export function group(attrs, children) {
  return { type: 'group', ...attrs, children: children || [] };
}

/**
 * Path node — arbitrary SVG path data.
 * @param {Object} attrs — { d, fill, stroke, strokeWidth, strokeDash, strokeLinecap, strokeLinejoin, class, data, key, opacity }
 * @returns {Object}
 */
export function path(attrs) {
  return { type: 'path', ...attrs };
}

/**
 * Rectangle node.
 * @param {Object} attrs — { x, y, w, h, rx, ry, fill, stroke, strokeWidth, class, data, key, opacity }
 * @returns {Object}
 */
export function rect(attrs) {
  return { type: 'rect', ...attrs };
}

/**
 * Circle node.
 * @param {Object} attrs — { cx, cy, r, fill, stroke, strokeWidth, class, data, key, opacity }
 * @returns {Object}
 */
export function circle(attrs) {
  return { type: 'circle', ...attrs };
}

/**
 * Text node.
 * @param {Object} attrs — { x, y, content, anchor, baseline, fill, class, fontSize, fontWeight, rotate }
 * @returns {Object}
 */
export function text(attrs) {
  return { type: 'text', ...attrs };
}

/**
 * Line node.
 * @param {Object} attrs — { x1, y1, x2, y2, stroke, strokeWidth, strokeDash, class }
 * @returns {Object}
 */
export function line(attrs) {
  return { type: 'line', ...attrs };
}

/**
 * Arc node — for pie/donut/gauge/radial charts.
 * @param {Object} attrs — { cx, cy, innerR, outerR, startAngle, endAngle, fill, stroke, class, data, key, opacity }
 * @returns {Object}
 */
export function arc(attrs) {
  return { type: 'arc', ...attrs };
}

/**
 * Polygon node — closed shape from point array.
 * @param {Object} attrs — { points: [{x,y}], fill, stroke, strokeWidth, class, data, key, opacity }
 * @returns {Object}
 */
export function polygon(attrs) {
  return { type: 'polygon', ...attrs };
}

/**
 * Image node — for embedding icons/images in charts.
 * @param {Object} attrs — { x, y, w, h, href, class, data, key }
 * @returns {Object}
 */
export function image(attrs) {
  return { type: 'image', ...attrs };
}

// --- Utility builders ---

/**
 * Build axis tick scene nodes.
 * @param {Array} ticks — [{ value, position, label }]
 * @param {'x'|'y'} axis
 * @param {number} innerW
 * @param {number} innerH
 * @returns {Object[]} scene nodes
 */
export function axisTicks(ticks, axis, innerW, innerH) {
  const nodes = [];
  if (axis === 'x') {
    for (const t of ticks) {
      nodes.push(line({ x1: t.position, y1: innerH, x2: t.position, y2: innerH + 4, stroke: 'var(--d-border)', class: 'd-chart-tick' }));
      nodes.push(text({ x: t.position, y: innerH + 18, content: t.label, anchor: 'middle', class: 'd-chart-axis' }));
    }
  } else {
    for (const t of ticks) {
      nodes.push(line({ x1: -4, y1: t.position, x2: 0, y2: t.position, stroke: 'var(--d-border)', class: 'd-chart-tick' }));
      nodes.push(text({ x: -8, y: t.position + 4, content: t.label, anchor: 'end', class: 'd-chart-axis' }));
    }
  }
  return nodes;
}

/**
 * Build grid line scene nodes from Y ticks.
 * @param {Array} ticks — [{ position }]
 * @param {number} innerW
 * @returns {Object[]}
 */
export function gridLines(ticks, innerW) {
  return ticks.map(t => line({ x1: 0, y1: t.position, x2: innerW, y2: t.position, class: 'd-chart-grid' }));
}

/**
 * Convert arc params to SVG path data string.
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerR
 * @param {number} innerR
 * @param {number} startAngle
 * @param {number} endAngle
 * @returns {string}
 */
export function arcToPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const x1 = cx + outerR * Math.cos(startAngle);
  const y1 = cy + outerR * Math.sin(startAngle);
  const x2 = cx + outerR * Math.cos(endAngle);
  const y2 = cy + outerR * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  let d = `M${x1},${y1}A${outerR},${outerR},0,${largeArc},1,${x2},${y2}`;

  if (innerR > 0) {
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    d += `L${x3},${y3}A${innerR},${innerR},0,${largeArc},0,${x4},${y4}Z`;
  } else {
    d += `L${cx},${cy}Z`;
  }

  return d;
}

/**
 * Convert points array to SVG path data string (M/L commands).
 * @param {{x:number, y:number}[]} points
 * @returns {string}
 */
export function pointsToPathD(points) {
  if (!points.length) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += `L${points[i].x},${points[i].y}`;
  return d;
}

/**
 * Convert points to smooth Catmull-Rom spline path.
 * @param {{x:number, y:number}[]} points
 * @param {number} [tension=0.5]
 * @returns {string}
 */
export function smoothPathD(points, tension = 0.5) {
  if (points.length < 2) return pointsToPathD(points);
  if (points.length === 2) return pointsToPathD(points);

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

    d += `C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
  }
  return d;
}

/**
 * Convert area points (with y0/y1) to closed polygon path data.
 * @param {{x:number, y0:number, y1:number}[]} points — y0=top, y1=bottom
 * @returns {string}
 */
export function areaPathD(points) {
  if (!points.length) return '';
  let d = `M${points[0].x},${points[0].y0}`;
  for (let i = 1; i < points.length; i++) d += `L${points[i].x},${points[i].y0}`;
  for (let i = points.length - 1; i >= 0; i--) d += `L${points[i].x},${points[i].y1}`;
  d += 'Z';
  return d;
}

/**
 * Step path (horizontal-first, for step line charts).
 * @param {{x:number, y:number}[]} points
 * @returns {string}
 */
export function stepPathD(points) {
  if (points.length < 2) return pointsToPathD(points);
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += `H${points[i].x}V${points[i].y}`;
  }
  return d;
}
