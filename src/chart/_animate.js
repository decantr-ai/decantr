/**
 * Animation Engine — enter/exit/update morphing, spring physics, stagger.
 * Interpolates between two scene graphs for smooth transitions.
 * @module _animate
 */

import { getAnimations } from '../css/theme-registry.js';

// --- Easing functions ---

export const easings = {
  linear: t => t,
  standard: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  decelerate: t => 1 - Math.pow(1 - t, 3),
  accelerate: t => t * t * t,
  bounce: t => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  overshoot: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
};

// --- Spring physics ---

/**
 * Critically damped spring model.
 * @param {number} current
 * @param {number} target
 * @param {Object} state — { velocity }
 * @param {number} dt — time delta in seconds
 * @param {Object} [opts] — { stiffness, damping, mass }
 * @returns {number}
 */
export function springStep(current, target, state, dt, opts = {}) {
  const stiffness = opts.stiffness || 170;
  const damping = opts.damping || 26;
  const mass = opts.mass || 1;

  const displacement = current - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * state.velocity;
  const acceleration = (springForce + dampingForce) / mass;

  state.velocity += acceleration * dt;
  return current + state.velocity * dt;
}

// --- Scene interpolation ---

/**
 * Interpolate between two scene graphs.
 * Matches nodes by key, interpolates numeric attrs.
 * @param {Object} from — source scene
 * @param {Object} to — target scene
 * @param {number} t — progress 0..1
 * @returns {Object} interpolated scene
 */
export function interpolateScene(from, to, t) {
  if (!from) return to;
  if (!to) return from;

  return {
    ...to,
    children: interpolateChildren(from.children || [], to.children || [], t),
    meta: to.meta
  };
}

function interpolateChildren(fromChildren, toChildren, t) {
  // Build key → node maps
  const fromMap = buildKeyMap(fromChildren);
  const toMap = buildKeyMap(toChildren);
  const result = [];

  // Process to-children (enter + update)
  for (const toNode of toChildren) {
    const key = nodeKey(toNode);
    const fromNode = key ? fromMap.get(key) : null;

    if (fromNode) {
      // Update — interpolate
      result.push(interpolateNode(fromNode, toNode, t));
    } else {
      // Enter — fade/scale in
      result.push(applyEnter(toNode, t));
    }
  }

  // Exit nodes (in from but not in to)
  for (const fromNode of fromChildren) {
    const key = nodeKey(fromNode);
    if (key && !toMap.has(key)) {
      result.push(applyExit(fromNode, t));
    }
  }

  return result;
}

function interpolateNode(from, to, t) {
  if (from.type !== to.type) return t < 0.5 ? from : to;

  const result = { ...to };

  // Interpolate numeric properties
  const numericKeys = ['x', 'y', 'w', 'h', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2',
    'innerR', 'outerR', 'startAngle', 'endAngle', 'opacity', 'rx', 'ry', 'strokeWidth'];

  for (const k of numericKeys) {
    if (typeof from[k] === 'number' && typeof to[k] === 'number') {
      result[k] = from[k] + (to[k] - from[k]) * t;
    }
  }

  // Interpolate path data (if both are simple M/L paths)
  if (from.d && to.d && from.type === 'path') {
    result.d = interpolatePath(from.d, to.d, t);
  }

  // Recurse into children
  if (from.children && to.children) {
    result.children = interpolateChildren(from.children, to.children, t);
  }

  return result;
}

function applyEnter(node, t) {
  const result = { ...node };
  if (result.opacity == null) result.opacity = t;
  else result.opacity = result.opacity * t;

  // Scale from center for rects
  if (node.type === 'rect' && node.h != null) {
    const fullH = node.h;
    result.h = fullH * t;
    result.y = (node.y || 0) + fullH * (1 - t);
  }

  if (node.children) {
    result.children = node.children.map(c => applyEnter(c, t));
  }

  return result;
}

function applyExit(node, t) {
  const result = { ...node };
  result.opacity = 1 - t;
  return result;
}

// --- Path interpolation ---

function interpolatePath(fromD, toD, t) {
  const fromCmds = parsePath(fromD);
  const toCmds = parsePath(toD);

  if (fromCmds.length !== toCmds.length) return t < 0.5 ? fromD : toD;

  let result = '';
  for (let i = 0; i < toCmds.length; i++) {
    const fc = fromCmds[i], tc = toCmds[i];
    if (fc.cmd !== tc.cmd || fc.values.length !== tc.values.length) {
      return t < 0.5 ? fromD : toD;
    }
    result += tc.cmd;
    for (let j = 0; j < tc.values.length; j++) {
      if (j > 0) result += ',';
      result += (fc.values[j] + (tc.values[j] - fc.values[j]) * t).toFixed(2);
    }
  }
  return result;
}

function parsePath(d) {
  const cmds = [];
  const re = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi;
  let match;
  while ((match = re.exec(d))) {
    const cmd = match[1];
    const values = match[2].trim() ? match[2].trim().split(/[\s,]+/).map(Number) : [];
    cmds.push({ cmd, values });
  }
  return cmds;
}

// --- Orchestrator ---

/**
 * Animate between two scenes.
 * @param {HTMLElement} container — DOM container
 * @param {Object} fromScene — previous scene graph
 * @param {Object} toScene — new scene graph
 * @param {Function} renderFn — renderer function (scene → DOM element)
 * @param {Object} [opts]
 * @param {number} [opts.duration=300] — ms
 * @param {string} [opts.easing='decelerate']
 * @param {boolean} [opts.spring=false]
 * @param {number} [opts.stagger=0] — ms delay between elements
 * @returns {Promise<void>}
 */
export function animate(container, fromScene, toScene, renderFn, opts = {}) {
  // Check if animations are disabled
  if (typeof getAnimations === 'function' && !getAnimations()) {
    const el = renderFn(toScene);
    container.textContent = '';
    container.appendChild(el);
    return Promise.resolve();
  }

  // Check prefers-reduced-motion
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      const el = renderFn(toScene);
      container.textContent = '';
      container.appendChild(el);
      return Promise.resolve();
    }
  }

  const duration = opts.duration || 300;
  const easingFn = easings[opts.easing] || easings.decelerate;

  return new Promise(resolve => {
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const rawT = Math.min(1, elapsed / duration);
      const t = easingFn(rawT);

      const interpolated = interpolateScene(fromScene, toScene, t);
      const el = renderFn(interpolated);
      container.textContent = '';
      container.appendChild(el);

      if (rawT < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

// --- Helpers ---

function nodeKey(node) {
  return node?.key || null;
}

function buildKeyMap(children) {
  const map = new Map();
  for (const child of children) {
    const key = nodeKey(child);
    if (key) map.set(key, child);
  }
  return map;
}
