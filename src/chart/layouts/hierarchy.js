/**
 * Hierarchical layout algorithms.
 * Treemap squarification, sunburst rings, sankey relaxation, chord matrix, Walker tree.
 * @module layouts/hierarchy
 */

// --- Flat → Tree conversion ---

/**
 * Convert flat array with id/parent/value fields into a tree.
 * @param {Object[]} data
 * @param {string} idField
 * @param {string} parentField
 * @param {string} valueField
 * @returns {Object} root node { id, value, children, data, depth }
 */
export function buildHierarchy(data, idField, parentField, valueField) {
  const map = new Map();
  const roots = [];

  // Create nodes
  for (const d of data) {
    map.set(d[idField], { id: d[idField], value: +d[valueField] || 0, children: [], data: d, depth: 0 });
  }

  // Link parent → child
  for (const d of data) {
    const node = map.get(d[idField]);
    const parentId = d[parentField];
    if (parentId != null && map.has(parentId)) {
      map.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Compute depths and roll up values
  function walk(node, depth) {
    node.depth = depth;
    if (node.children.length > 0) {
      let sum = 0;
      for (const child of node.children) {
        walk(child, depth + 1);
        sum += child.value;
      }
      if (node.value === 0) node.value = sum;
    }
  }

  // Wrap in virtual root if multiple roots
  const root = roots.length === 1 ? roots[0] : { id: '__root', value: 0, children: roots, data: null, depth: 0 };
  walk(root, 0);
  return root;
}

// --- Treemap: squarification ---

/**
 * Squarified treemap layout (Bruls-Huizing-van-Wijk algorithm).
 * @param {Object} root — tree from buildHierarchy
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} [algorithm='squarify'] — 'squarify'|'binary'|'slice'
 * @returns {{ id, x, y, w, h, value, depth, data, children }[]}
 */
export function treemapLayout(root, x, y, w, h, algorithm = 'squarify') {
  const result = [];

  function squarify(node, bx, by, bw, bh) {
    result.push({ id: node.id, x: bx, y: by, w: bw, h: bh, value: node.value, depth: node.depth, data: node.data });

    if (!node.children.length) return;

    const children = [...node.children].sort((a, b) => b.value - a.value);
    const total = children.reduce((s, c) => s + c.value, 0) || 1;

    if (algorithm === 'slice') {
      layoutSlice(children, total, bx, by, bw, bh);
    } else if (algorithm === 'binary') {
      layoutBinary(children, total, bx, by, bw, bh);
    } else {
      layoutSquarify(children, total, bx, by, bw, bh);
    }
  }

  function layoutSquarify(children, total, bx, by, bw, bh) {
    let cx = bx, cy = by, cw = bw, ch = bh, remaining = total;

    let row = [], rowValue = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const prev = worstAspect(row, rowValue, cw, ch, remaining);
      row.push(child);
      rowValue += child.value;
      const curr = worstAspect(row, rowValue, cw, ch, remaining);

      if (row.length > 1 && curr > prev) {
        // Roll back — lay out previous row
        row.pop();
        rowValue -= child.value;
        const laid = layRow(row, rowValue, cx, cy, cw, ch, remaining);
        cx = laid.cx; cy = laid.cy; cw = laid.cw; ch = laid.ch;
        remaining -= rowValue;
        row = [child];
        rowValue = child.value;
      }
    }

    if (row.length) layRow(row, rowValue, cx, cy, cw, ch, remaining);
  }

  function worstAspect(row, rowValue, cw, ch, remaining) {
    if (!row.length) return Infinity;
    const area = (rowValue / (remaining || 1)) * cw * ch;
    const side = cw >= ch ? area / ch : area / cw;
    let worst = 0;
    for (const c of row) {
      const cellArea = (c.value / (rowValue || 1)) * area;
      const dim = cellArea / side;
      const aspect = Math.max(side / dim, dim / side);
      if (aspect > worst) worst = aspect;
    }
    return worst;
  }

  function layRow(row, rowValue, cx, cy, cw, ch, remaining) {
    const area = (rowValue / (remaining || 1)) * cw * ch;
    const isHorizontal = cw >= ch;
    const side = isHorizontal ? area / ch : area / cw;

    let offset = 0;
    for (const child of row) {
      const frac = child.value / (rowValue || 1);
      if (isHorizontal) {
        const cellH = ch * frac;
        squarify(child, cx, cy + offset, side, cellH);
        offset += cellH;
      } else {
        const cellW = cw * frac;
        squarify(child, cx + offset, cy, cellW, side);
        offset += cellW;
      }
    }

    if (isHorizontal) return { cx: cx + side, cy, cw: cw - side, ch };
    return { cx, cy: cy + side, cw, ch: ch - side };
  }

  function layoutSlice(children, total, bx, by, bw, bh) {
    let offset = 0;
    for (const child of children) {
      const frac = child.value / total;
      const cellH = bh * frac;
      squarify(child, bx, by + offset, bw, cellH);
      offset += cellH;
    }
  }

  function layoutBinary(children, total, bx, by, bw, bh) {
    if (children.length <= 1) {
      if (children[0]) squarify(children[0], bx, by, bw, bh);
      return;
    }
    // Split into two groups of roughly equal value
    let halfValue = total / 2, sum = 0, splitIdx = 0;
    for (let i = 0; i < children.length; i++) {
      sum += children[i].value;
      if (sum >= halfValue) { splitIdx = i + 1; break; }
    }
    splitIdx = Math.max(1, Math.min(children.length - 1, splitIdx));
    const left = children.slice(0, splitIdx);
    const right = children.slice(splitIdx);
    const leftTotal = left.reduce((s, c) => s + c.value, 0);
    const rightTotal = right.reduce((s, c) => s + c.value, 0);

    if (bw >= bh) {
      const leftW = bw * (leftTotal / total);
      layoutBinary(left, leftTotal, bx, by, leftW, bh);
      layoutBinary(right, rightTotal, bx + leftW, by, bw - leftW, bh);
    } else {
      const leftH = bh * (leftTotal / total);
      layoutBinary(left, leftTotal, bx, by, bw, leftH);
      layoutBinary(right, rightTotal, bx, by + leftH, bw, bh - leftH);
    }
  }

  squarify(root, x, y, w, h);
  return result;
}

// --- Sunburst: concentric ring layout ---

/**
 * Sunburst ring layout from tree.
 * @param {Object} root — tree from buildHierarchy
 * @param {number} cx — center x
 * @param {number} cy — center y
 * @param {number} outerRadius
 * @param {number} innerRadius — center hole radius
 * @param {number} maxDepth — max visible depth
 * @returns {{ id, startAngle, endAngle, innerR, outerR, value, depth, data }[]}
 */
export function sunburstLayout(root, cx, cy, outerRadius, innerRadius, maxDepth = 4) {
  const result = [];
  const ringWidth = (outerRadius - innerRadius) / maxDepth;

  function walk(node, sa, ea, depth) {
    if (depth > maxDepth) return;
    const innerR = innerRadius + (depth - 1) * ringWidth;
    const outerR = innerRadius + depth * ringWidth;

    if (depth > 0) {
      result.push({
        id: node.id, startAngle: sa, endAngle: ea,
        innerR, outerR, value: node.value, depth,
        data: node.data, cx, cy
      });
    }

    if (!node.children.length) return;
    const total = node.children.reduce((s, c) => s + c.value, 0) || 1;
    let angle = sa;
    for (const child of node.children) {
      const sweep = (child.value / total) * (ea - sa);
      walk(child, angle, angle + sweep, depth + 1);
      angle += sweep;
    }
  }

  walk(root, -Math.PI / 2, Math.PI * 3 / 2, 0);
  return result;
}

// --- Sankey: iterative relaxation ---

/**
 * Sankey diagram layout.
 * @param {Object[]} nodes — [{ id, label }]
 * @param {Object[]} links — [{ source, target, value }]
 * @param {number} width
 * @param {number} height
 * @param {Object} [opts]
 * @param {number} [opts.nodeWidth=20]
 * @param {number} [opts.nodePadding=12]
 * @param {number} [opts.iterations=32]
 * @returns {{ nodes: Object[], links: Object[] }}
 */
export function sankeyLayout(nodes, links, width, height, opts = {}) {
  const nodeWidth = opts.nodeWidth || 20;
  const nodePadding = opts.nodePadding || 12;
  const iterations = opts.iterations || 32;

  // Build adjacency — normalize string nodes to {id} objects
  const nodeMap = new Map();
  for (const n of nodes) {
    const node = typeof n === 'string' ? { id: n, label: n } : n;
    nodeMap.set(node.id, { ...node, sourceLinks: [], targetLinks: [], value: 0, x: 0, y: 0, dy: 0 });
  }
  const processedLinks = links.map(l => ({
    source: nodeMap.get(l.source), target: nodeMap.get(l.target),
    value: l.value, sy: 0, ty: 0, dy: 0
  }));
  for (const l of processedLinks) {
    if (l.source) l.source.sourceLinks.push(l);
    if (l.target) l.target.targetLinks.push(l);
  }

  // Compute node values
  for (const [, n] of nodeMap) {
    const srcVal = n.sourceLinks.reduce((s, l) => s + l.value, 0);
    const tgtVal = n.targetLinks.reduce((s, l) => s + l.value, 0);
    n.value = Math.max(srcVal, tgtVal);
  }

  // Assign columns via BFS
  const allNodes = [...nodeMap.values()];
  const roots = allNodes.filter(n => n.targetLinks.length === 0);
  const visited = new Set();
  const queue = roots.map(n => ({ node: n, col: 0 }));
  let maxCol = 0;
  while (queue.length) {
    const { node, col } = queue.shift();
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    node.col = col;
    if (col > maxCol) maxCol = col;
    for (const l of node.sourceLinks) {
      if (l.target && !visited.has(l.target.id)) {
        queue.push({ node: l.target, col: col + 1 });
      }
    }
  }

  // X positions
  const colWidth = maxCol > 0 ? (width - nodeWidth) / maxCol : 0;
  for (const n of allNodes) n.x = n.col * colWidth;

  // Y positions — spread evenly in columns, then relax
  const cols = new Map();
  for (const n of allNodes) {
    if (!cols.has(n.col)) cols.set(n.col, []);
    cols.get(n.col).push(n);
  }

  const totalValue = Math.max(...allNodes.map(n => n.value), 1);
  for (const [, col] of cols) {
    const colTotal = col.reduce((s, n) => s + n.value, 0);
    const scale = (height - (col.length - 1) * nodePadding) / (colTotal || 1);
    let y = 0;
    for (const n of col) {
      n.y = y;
      n.dy = Math.max(1, n.value * scale);
      y += n.dy + nodePadding;
    }
  }

  // Gauss-Seidel relaxation
  for (let iter = 0; iter < iterations; iter++) {
    for (const n of allNodes) {
      if (n.targetLinks.length) {
        let sum = 0, weight = 0;
        for (const l of n.targetLinks) {
          sum += (l.source.y + l.sy + l.dy / 2) * l.value;
          weight += l.value;
        }
        if (weight) n.y = sum / weight - n.dy / 2;
      }
    }
    // Resolve overlaps within columns
    for (const [, col] of cols) {
      col.sort((a, b) => a.y - b.y);
      let y = 0;
      for (const n of col) {
        if (n.y < y) n.y = y;
        y = n.y + n.dy + nodePadding;
      }
      // Push back if overflow
      const overflow = y - nodePadding - height;
      if (overflow > 0) {
        for (let i = col.length - 1; i >= 0; i--) {
          col[i].y = Math.max(0, col[i].y - overflow * ((i + 1) / col.length));
        }
      }
    }
  }

  // Compute link vertical positions
  for (const n of allNodes) {
    n.sourceLinks.sort((a, b) => a.target.y - b.target.y);
    n.targetLinks.sort((a, b) => a.source.y - b.source.y);
    let sy = 0, ty = 0;
    for (const l of n.sourceLinks) {
      const scale = n.dy / (n.value || 1);
      l.sy = sy;
      l.dy = l.value * scale;
      sy += l.dy;
    }
    for (const l of n.targetLinks) {
      const scale = n.dy / (n.value || 1);
      l.ty = ty;
      l.dy = l.dy || l.value * scale;
      ty += l.value * scale;
    }
  }

  return {
    nodes: allNodes.map(n => ({ id: n.id, label: n.label || n.id, x: n.x, y: n.y, w: nodeWidth, h: n.dy, value: n.value, data: n })),
    links: processedLinks.map(l => ({
      source: l.source, target: l.target, value: l.value,
      x0: l.source.x + nodeWidth, y0: l.source.y + l.sy + l.dy / 2,
      x1: l.target.x, y1: l.target.y + l.ty + l.dy / 2,
      width: Math.max(1, l.dy)
    }))
  };
}

// --- Chord: relationship matrix ---

/**
 * Chord diagram layout from matrix.
 * @param {number[][]} matrix — NxN flow matrix
 * @param {string[]} labels — N labels
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerR
 * @param {number} innerR
 * @returns {{ arcs: Object[], ribbons: Object[] }}
 */
export function chordLayout(matrix, labels, cx, cy, outerR, innerR) {
  const n = matrix.length;
  const totals = matrix.map(row => row.reduce((s, v) => s + v, 0));
  const grandTotal = totals.reduce((s, v) => s + v, 0) || 1;
  const padAngle = 0.04;
  const totalAngle = Math.PI * 2 - padAngle * n;

  // Compute arcs
  const arcs = [];
  let angle = 0;
  for (let i = 0; i < n; i++) {
    const sweep = (totals[i] / grandTotal) * totalAngle;
    arcs.push({
      index: i, label: labels[i] || `${i}`,
      startAngle: angle, endAngle: angle + sweep,
      value: totals[i], cx, cy, innerR, outerR
    });
    angle += sweep + padAngle;
  }

  // Compute ribbons
  const ribbons = [];
  const sourceOffsets = new Array(n).fill(0);
  const targetOffsets = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] <= 0) continue;
      const value = matrix[i][j];
      const srcStart = arcs[i].startAngle + (sourceOffsets[i] / (totals[i] || 1)) * (arcs[i].endAngle - arcs[i].startAngle);
      const srcEnd = srcStart + (value / (totals[i] || 1)) * (arcs[i].endAngle - arcs[i].startAngle);
      const tgtStart = arcs[j].startAngle + (targetOffsets[j] / (totals[j] || 1)) * (arcs[j].endAngle - arcs[j].startAngle);
      const tgtEnd = tgtStart + (value / (totals[j] || 1)) * (arcs[j].endAngle - arcs[j].startAngle);

      ribbons.push({
        source: { index: i, startAngle: srcStart, endAngle: srcEnd },
        target: { index: j, startAngle: tgtStart, endAngle: tgtEnd },
        value, cx, cy, r: innerR
      });

      sourceOffsets[i] += value;
      targetOffsets[j] += value;
    }
  }

  return { arcs, ribbons };
}

// --- Walker's tree layout (for org charts) ---

/**
 * Walker's algorithm for aesthetically pleasing tree drawing.
 * @param {Object} root — tree from buildHierarchy
 * @param {number} width
 * @param {number} height
 * @param {string} [orientation='top-down'] — 'top-down'|'left-right'|'radial'
 * @param {Object} [opts]
 * @param {number} [opts.nodeWidth=120]
 * @param {number} [opts.nodeHeight=60]
 * @param {number} [opts.siblingGap=24]
 * @param {number} [opts.levelGap=80]
 * @returns {{ nodes: Object[], edges: Object[] }}
 */
export function walkerLayout(root, width, height, orientation = 'top-down', opts = {}) {
  const nodeWidth = opts.nodeWidth || 120;
  const nodeHeight = opts.nodeHeight || 60;
  const siblingGap = opts.siblingGap || 24;
  const levelGap = opts.levelGap || 80;

  // First pass: assign preliminary x
  function firstWalk(node) {
    if (!node.children.length) {
      node._x = 0;
      return;
    }
    for (const child of node.children) firstWalk(child);

    // Position node centered above children
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    node._x = (firstChild._x + lastChild._x) / 2;
  }

  // Second pass: spread siblings
  function spreadSiblings(nodes) {
    for (let i = 1; i < nodes.length; i++) {
      const gap = nodes[i]._x - nodes[i - 1]._x;
      if (gap < nodeWidth + siblingGap) {
        const shift = nodeWidth + siblingGap - gap;
        for (let j = i; j < nodes.length; j++) {
          nodes[j]._x += shift;
        }
      }
    }
  }

  // Collect nodes by level
  const levels = [];
  function collectLevels(node, depth) {
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    for (const child of node.children) collectLevels(child, depth + 1);
  }

  firstWalk(root);
  collectLevels(root, 0);

  // Spread siblings at each level
  for (const level of levels) spreadSiblings(level);

  // Re-center parents after spreading
  for (let d = levels.length - 2; d >= 0; d--) {
    for (const node of levels[d]) {
      if (node.children.length) {
        const first = node.children[0];
        const last = node.children[node.children.length - 1];
        node._x = (first._x + last._x) / 2;
      }
    }
  }

  // Find bounds and normalize
  let minX = Infinity, maxX = -Infinity;
  for (const level of levels) {
    for (const n of level) {
      if (n._x < minX) minX = n._x;
      if (n._x > maxX) maxX = n._x;
    }
  }
  const treeWidth = maxX - minX + nodeWidth;
  const treeHeight = levels.length * (nodeHeight + levelGap) - levelGap;
  const scaleX = Math.min(1, (width - 40) / (treeWidth || 1));
  const scaleY = Math.min(1, (height - 40) / (treeHeight || 1));
  const offsetX = (width - treeWidth * scaleX) / 2 - minX * scaleX;
  const offsetY = 20;

  // Build output
  const resultNodes = [];
  const edges = [];

  function buildOutput(node, depth) {
    let nx, ny;
    if (orientation === 'left-right') {
      nx = offsetY + depth * (nodeHeight + levelGap) * scaleY;
      ny = offsetX + node._x * scaleX;
    } else {
      nx = offsetX + node._x * scaleX;
      ny = offsetY + depth * (nodeHeight + levelGap) * scaleY;
    }

    resultNodes.push({
      id: node.id, x: nx, y: ny, w: nodeWidth * scaleX, h: nodeHeight * scaleY,
      value: node.value, depth, data: node.data, children: node.children
    });

    for (const child of node.children) {
      const cn = buildOutput(child, depth + 1);
      edges.push({
        x0: orientation === 'left-right' ? nx + nodeHeight * scaleY : nx + nodeWidth * scaleX / 2,
        y0: orientation === 'left-right' ? ny + nodeWidth * scaleX / 2 : ny + nodeHeight * scaleY,
        x1: orientation === 'left-right' ? cn.x : cn.x + nodeWidth * scaleX / 2,
        y1: orientation === 'left-right' ? cn.y + nodeWidth * scaleX / 2 : cn.y,
        source: node.id, target: child.id
      });
    }

    return { x: nx, y: ny };
  }

  buildOutput(root, 0);
  return { nodes: resultNodes, edges };
}
