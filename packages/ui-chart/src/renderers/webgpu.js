/**
 * WebGPU Renderer — GPU-accelerated rendering for 50K+ data point charts.
 * Instanced circles (scatter/bubble), batched rects (bar/heatmap),
 * tessellated lines (line charts). Text + complex paths fall back to Canvas 2D overlay.
 * @module renderers/webgpu
 */

import { arcToPath } from '../_scene.js';
import { renderCanvas } from './canvas.js';

// --- WGSL Shaders ---

const CIRCLE_SHADER = /* wgsl */`
struct Uniforms { resolution: vec2f, dpr: f32 }
@group(0) @binding(0) var<uniform> u: Uniforms;

struct Instance {
  @location(0) pos: vec2f,
  @location(1) radius: f32,
  @location(2) fillColor: vec4f,
  @location(3) strokeColor: vec4f,
  @location(4) strokeWidth: f32,
  @location(5) opacity: f32,
}

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) fillColor: vec4f,
  @location(2) strokeColor: vec4f,
  @location(3) strokeWidth: f32,
  @location(4) radius: f32,
  @location(5) opacity: f32,
}

@vertex fn vs(@builtin(vertex_index) vi: u32, inst: Instance) -> VSOut {
  let corners = array<vec2f, 6>(
    vec2f(-1,-1), vec2f(1,-1), vec2f(-1,1),
    vec2f(-1,1), vec2f(1,-1), vec2f(1,1)
  );
  let uv = corners[vi];
  let extent = inst.radius + inst.strokeWidth + 1.0;
  let pixel = inst.pos + uv * extent;
  let ndc = vec2f(
    pixel.x / u.resolution.x * 2.0 - 1.0,
    1.0 - pixel.y / u.resolution.y * 2.0
  );
  var o: VSOut;
  o.pos = vec4f(ndc, 0.0, 1.0);
  o.uv = uv * extent;
  o.fillColor = inst.fillColor;
  o.strokeColor = inst.strokeColor;
  o.strokeWidth = inst.strokeWidth;
  o.radius = inst.radius;
  o.opacity = inst.opacity;
  return o;
}

@fragment fn fs(v: VSOut) -> @location(0) vec4f {
  let dist = length(v.uv);
  let aa = 1.0 / v.radius;
  if dist > v.radius + v.strokeWidth + 1.0 { discard; }
  let fillEdge = smoothstep(v.radius, v.radius - aa, dist);
  let strokeOuter = smoothstep(v.radius + v.strokeWidth, v.radius + v.strokeWidth - aa, dist);
  let strokeInner = 1.0 - fillEdge;
  let strokeAlpha = strokeOuter * strokeInner;
  let color = v.fillColor * fillEdge + v.strokeColor * strokeAlpha;
  return vec4f(color.rgb, color.a * v.opacity);
}`;

const RECT_SHADER = /* wgsl */`
struct Uniforms { resolution: vec2f, dpr: f32 }
@group(0) @binding(0) var<uniform> u: Uniforms;

struct Instance {
  @location(0) posSize: vec4f,
  @location(1) fillColor: vec4f,
  @location(2) strokeColor: vec4f,
  @location(3) strokeWidth: f32,
  @location(4) cornerRadius: f32,
  @location(5) opacity: f32,
}

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) localPos: vec2f,
  @location(1) size: vec2f,
  @location(2) fillColor: vec4f,
  @location(3) strokeColor: vec4f,
  @location(4) strokeWidth: f32,
  @location(5) cornerRadius: f32,
  @location(6) opacity: f32,
}

@vertex fn vs(@builtin(vertex_index) vi: u32, inst: Instance) -> VSOut {
  let corners = array<vec2f, 6>(
    vec2f(0,0), vec2f(1,0), vec2f(0,1),
    vec2f(0,1), vec2f(1,0), vec2f(1,1)
  );
  let c = corners[vi];
  let pixel = inst.posSize.xy + c * inst.posSize.zw;
  let ndc = vec2f(
    pixel.x / u.resolution.x * 2.0 - 1.0,
    1.0 - pixel.y / u.resolution.y * 2.0
  );
  var o: VSOut;
  o.pos = vec4f(ndc, 0.0, 1.0);
  o.localPos = c * inst.posSize.zw;
  o.size = inst.posSize.zw;
  o.fillColor = inst.fillColor;
  o.strokeColor = inst.strokeColor;
  o.strokeWidth = inst.strokeWidth;
  o.cornerRadius = inst.cornerRadius;
  o.opacity = inst.opacity;
  return o;
}

fn roundedRectSDF(p: vec2f, size: vec2f, r: f32) -> f32 {
  let half = size * 0.5;
  let q = abs(p - half) - half + vec2f(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, vec2f(0.0))) - r;
}

@fragment fn fs(v: VSOut) -> @location(0) vec4f {
  let r = min(v.cornerRadius, min(v.size.x, v.size.y) * 0.5);
  let dist = roundedRectSDF(v.localPos, v.size, r);
  let aa = 0.7;
  let fillAlpha = smoothstep(aa, -aa, dist);
  let strokeAlpha = smoothstep(aa, -aa, dist) - smoothstep(-v.strokeWidth + aa, -v.strokeWidth - aa, dist);
  let hasFill = step(0.001, v.fillColor.a);
  let hasStroke = step(0.001, v.strokeColor.a) * step(0.001, v.strokeWidth);
  let color = v.fillColor * fillAlpha * hasFill + v.strokeColor * strokeAlpha * hasStroke;
  if color.a < 0.001 { discard; }
  return vec4f(color.rgb, color.a * v.opacity);
}`;

const LINE_SHADER = /* wgsl */`
struct Uniforms { resolution: vec2f, dpr: f32 }
@group(0) @binding(0) var<uniform> u: Uniforms;

struct Vert {
  @location(0) position: vec2f,
  @location(1) color: vec4f,
  @location(2) opacity: f32,
}

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec4f,
  @location(1) opacity: f32,
}

@vertex fn vs(v: Vert) -> VSOut {
  let ndc = vec2f(
    v.position.x / u.resolution.x * 2.0 - 1.0,
    1.0 - v.position.y / u.resolution.y * 2.0
  );
  var o: VSOut;
  o.pos = vec4f(ndc, 0.0, 1.0);
  o.color = v.color;
  o.opacity = v.opacity;
  return o;
}

@fragment fn fs(v: VSOut) -> @location(0) vec4f {
  return vec4f(v.color.rgb, v.color.a * v.opacity);
}`;

// --- Color utilities ---

function resolveColor(color) {
  if (!color || color === 'none') return null;
  if (color.startsWith('var(')) {
    const prop = color.match(/var\((--[^,)]+)/)?.[1];
    if (prop && typeof getComputedStyle === 'function') {
      const resolved = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
      if (resolved) return resolved;
    }
    const fallback = color.match(/,\s*([^)]+)\)/)?.[1];
    return fallback || '#666';
  }
  return color;
}

function parseColorToVec4(colorStr) {
  const c = resolveColor(colorStr);
  if (!c) return [0, 0, 0, 0];
  if (c.startsWith('#')) {
    const hex = c.length === 4
      ? c[1]+c[1]+c[2]+c[2]+c[3]+c[3]
      : c.length === 9 ? c.slice(1, 7) : c.slice(1);
    const n = parseInt(hex.slice(0, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1;
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, a];
  }
  const m = c.match(/rgba?\((\d+),?\s*(\d+),?\s*(\d+)(?:[,/]\s*([\d.]+))?\)/);
  if (m) return [+m[1]/255, +m[2]/255, +m[3]/255, m[4] != null ? +m[4] : 1];
  const named = { red:[1,0,0,1], blue:[0,0,1,1], green:[0,.5,0,1], white:[1,1,1,1],
    black:[0,0,0,1], gray:[.5,.5,.5,1], grey:[.5,.5,.5,1], orange:[1,.65,0,1],
    yellow:[1,1,0,1], purple:[.5,0,.5,1], cyan:[0,1,1,1], magenta:[1,0,1,1],
    transparent:[0,0,0,0] };
  return named[c.toLowerCase()] || [.4,.4,.4,1];
}

// --- Scene graph traversal & batching ---

function flattenScene(node, batches, tx, ty, opacity) {
  if (!node) return;
  const op = (node.opacity != null ? node.opacity : 1) * opacity;

  switch (node.type) {
    case 'group': {
      let gx = tx, gy = ty;
      if (node.transform) {
        const m = node.transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (m) { gx += +m[1]; gy += +m[2]; }
      }
      if (node.children) {
        for (const child of node.children) flattenScene(child, batches, gx, gy, op);
      }
      break;
    }
    case 'circle':
      batches.circles.push({ cx: node.cx + tx, cy: node.cy + ty, r: node.r,
        fill: node.fill, stroke: node.stroke, strokeWidth: node.strokeWidth || 0, opacity: op });
      break;
    case 'rect':
      batches.rects.push({ x: node.x + tx, y: node.y + ty, w: node.w, h: node.h,
        rx: node.rx || 0, fill: node.fill, stroke: node.stroke,
        strokeWidth: node.strokeWidth || 0, opacity: op });
      break;
    case 'line':
      batches.lines.push({ x1: node.x1 + tx, y1: node.y1 + ty,
        x2: node.x2 + tx, y2: node.y2 + ty, stroke: node.stroke,
        strokeWidth: node.strokeWidth || 1, strokeDash: node.strokeDash, opacity: op });
      break;
    case 'text':
      batches.overlay.push({ ...node, x: node.x + tx, y: node.y + ty, opacity: op });
      break;
    case 'path':
      batches.overlay.push({ ...node, _tx: tx, _ty: ty, opacity: op });
      break;
    case 'arc':
      batches.overlay.push({ ...node, cx: node.cx + tx, cy: node.cy + ty, opacity: op });
      break;
    case 'polygon':
      batches.overlay.push({ ...node,
        points: node.points?.map(p => ({ x: p.x + tx, y: p.y + ty })), opacity: op });
      break;
  }
}

// --- Tessellate lines into triangle strips ---

function tessellateLines(lines, dpr) {
  const verts = [];
  for (const ln of lines) {
    const dx = ln.x2 - ln.x1, dy = ln.y2 - ln.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) continue;
    const hw = (ln.strokeWidth || 1) * 0.5 * dpr;
    const nx = -dy / len * hw, ny = dx / len * hw;
    const col = parseColorToVec4(ln.stroke || 'var(--d-border)');
    const op = ln.opacity;
    const x1 = ln.x1 * dpr, y1 = ln.y1 * dpr, x2 = ln.x2 * dpr, y2 = ln.y2 * dpr;
    // Two triangles forming the line quad
    verts.push(
      x1 + nx, y1 + ny, ...col, op,
      x1 - nx, y1 - ny, ...col, op,
      x2 + nx, y2 + ny, ...col, op,
      x2 + nx, y2 + ny, ...col, op,
      x1 - nx, y1 - ny, ...col, op,
      x2 - nx, y2 - ny, ...col, op
    );
  }
  return new Float32Array(verts);
}

// --- Canvas 2D overlay for text, arcs, paths, polygons, dashed lines ---

function renderOverlay(ctx, nodes, dashedLines) {
  for (const node of dashedLines) {
    ctx.save();
    if (node.opacity != null) ctx.globalAlpha = node.opacity;
    const stroke = resolveColor(node.stroke) || resolveColor('var(--d-border)') || '#ccc';
    ctx.beginPath();
    ctx.moveTo(node.x1, node.y1);
    ctx.lineTo(node.x2, node.y2);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = node.strokeWidth || 1;
    if (node.strokeDash) ctx.setLineDash(node.strokeDash.split(',').map(Number));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  for (const node of nodes) {
    ctx.save();
    if (node.opacity != null) ctx.globalAlpha = node.opacity;

    switch (node.type) {
      case 'text': {
        const fill = resolveColor(node.fill) || resolveColor('var(--d-muted)') || '#666';
        ctx.fillStyle = fill;
        const fontFamily = typeof getComputedStyle === 'function'
          ? getComputedStyle(document.documentElement).getPropertyValue('--d-font').trim() || 'sans-serif'
          : 'sans-serif';
        ctx.font = `${node.fontWeight || ''} ${node.fontSize || '10px'} ${fontFamily}`.trim();
        ctx.textAlign = node.anchor === 'middle' ? 'center' : (node.anchor === 'end' ? 'right' : 'left');
        ctx.textBaseline = node.baseline === 'middle' ? 'middle' : 'alphabetic';
        if (node.rotate) {
          ctx.translate(node.x, node.y);
          ctx.rotate(node.rotate * Math.PI / 180);
          ctx.fillText(node.content || '', 0, 0);
        } else {
          ctx.fillText(node.content || '', node.x, node.y);
        }
        break;
      }
      case 'path': {
        if (!node.d) break;
        ctx.save();
        if (node._tx || node._ty) ctx.translate(node._tx || 0, node._ty || 0);
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
        ctx.restore();
        break;
      }
      case 'arc': {
        const d = arcToPath(node.cx, node.cy, node.outerR, node.innerR || 0, node.startAngle, node.endAngle);
        const p = new Path2D(d);
        const fill = resolveColor(node.fill);
        if (fill) { ctx.fillStyle = fill; ctx.fill(p); }
        if (node.stroke) {
          ctx.strokeStyle = resolveColor(node.stroke);
          ctx.lineWidth = node.strokeWidth || 1;
          ctx.stroke(p);
        }
        break;
      }
      case 'polygon': {
        if (!node.points?.length) break;
        ctx.beginPath();
        ctx.moveTo(node.points[0].x, node.points[0].y);
        for (let i = 1; i < node.points.length; i++) ctx.lineTo(node.points[i].x, node.points[i].y);
        ctx.closePath();
        const fill = resolveColor(node.fill);
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (node.stroke) {
          ctx.strokeStyle = resolveColor(node.stroke);
          ctx.lineWidth = node.strokeWidth || 1;
          ctx.stroke();
        }
        break;
      }
    }
    ctx.restore();
  }
}

// --- GPU initialization ---

async function initGPU(canvas, width, height, dpr) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const ctx = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: 'premultiplied' });

  const uniformBuf = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(uniformBuf, 0, new Float32Array([width * dpr, height * dpr, dpr, 0]));

  const uniformLayout = device.createBindGroupLayout({
    entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: { type: 'uniform' } }]
  });
  const uniformGroup = device.createBindGroup({
    layout: uniformLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuf } }]
  });
  const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts: [uniformLayout] });

  const blendState = {
    color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }
  };

  return { device, ctx, format, uniformGroup, pipelineLayout, blendState };
}

// --- Pipeline creators ---

function createCirclePipeline(gpu) {
  const { device, format, pipelineLayout, blendState } = gpu;
  const module = device.createShaderModule({ code: CIRCLE_SHADER });
  return device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module, entryPoint: 'vs',
      buffers: [{
        arrayStride: 52, // 13 floats: pos(2) + r(1) + fill(4) + stroke(4) + sw(1) + op(1)
        stepMode: 'instance',
        attributes: [
          { shaderLocation: 0, offset: 0,  format: 'float32x2' },  // pos
          { shaderLocation: 1, offset: 8,  format: 'float32' },    // radius
          { shaderLocation: 2, offset: 12, format: 'float32x4' },  // fillColor
          { shaderLocation: 3, offset: 28, format: 'float32x4' },  // strokeColor
          { shaderLocation: 4, offset: 44, format: 'float32' },    // strokeWidth
          { shaderLocation: 5, offset: 48, format: 'float32' },    // opacity
        ]
      }]
    },
    fragment: { module, entryPoint: 'fs', targets: [{ format, blend: blendState }] },
    primitive: { topology: 'triangle-list' }
  });
}

function createRectPipeline(gpu) {
  const { device, format, pipelineLayout, blendState } = gpu;
  const module = device.createShaderModule({ code: RECT_SHADER });
  return device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module, entryPoint: 'vs',
      buffers: [{
        arrayStride: 60, // 15 floats: xywh(4) + fill(4) + stroke(4) + sw(1) + cr(1) + op(1)
        stepMode: 'instance',
        attributes: [
          { shaderLocation: 0, offset: 0,  format: 'float32x4' },  // posSize
          { shaderLocation: 1, offset: 16, format: 'float32x4' },  // fillColor
          { shaderLocation: 2, offset: 32, format: 'float32x4' },  // strokeColor
          { shaderLocation: 3, offset: 48, format: 'float32' },    // strokeWidth
          { shaderLocation: 4, offset: 52, format: 'float32' },    // cornerRadius
          { shaderLocation: 5, offset: 56, format: 'float32' },    // opacity
        ]
      }]
    },
    fragment: { module, entryPoint: 'fs', targets: [{ format, blend: blendState }] },
    primitive: { topology: 'triangle-list' }
  });
}

function createLinePipeline(gpu) {
  const { device, format, pipelineLayout, blendState } = gpu;
  const module = device.createShaderModule({ code: LINE_SHADER });
  return device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module, entryPoint: 'vs',
      buffers: [{
        arrayStride: 28, // 7 floats: pos(2) + color(4) + opacity(1)
        stepMode: 'vertex',
        attributes: [
          { shaderLocation: 0, offset: 0,  format: 'float32x2' },  // position
          { shaderLocation: 1, offset: 8,  format: 'float32x4' },  // color
          { shaderLocation: 2, offset: 24, format: 'float32' },    // opacity
        ]
      }]
    },
    fragment: { module, entryPoint: 'fs', targets: [{ format, blend: blendState }] },
    primitive: { topology: 'triangle-list' }
  });
}

// --- Instance data packing ---

function packCircles(circles, dpr) {
  const data = new Float32Array(circles.length * 13);
  for (let i = 0; i < circles.length; i++) {
    const c = circles[i], o = i * 13;
    const fill = parseColorToVec4(c.fill);
    const stroke = parseColorToVec4(c.stroke);
    data[o]     = c.cx * dpr;
    data[o + 1] = c.cy * dpr;
    data[o + 2] = c.r * dpr;
    data[o + 3] = fill[0]; data[o + 4] = fill[1]; data[o + 5] = fill[2]; data[o + 6] = fill[3];
    data[o + 7] = stroke[0]; data[o + 8] = stroke[1]; data[o + 9] = stroke[2]; data[o + 10] = stroke[3];
    data[o + 11] = (c.strokeWidth || 0) * dpr;
    data[o + 12] = c.opacity;
  }
  return data;
}

function packRects(rects, dpr) {
  const data = new Float32Array(rects.length * 15);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i], o = i * 15;
    const fill = parseColorToVec4(r.fill);
    const stroke = parseColorToVec4(r.stroke);
    data[o]     = r.x * dpr;
    data[o + 1] = r.y * dpr;
    data[o + 2] = Math.max(0, r.w) * dpr;
    data[o + 3] = Math.max(0, r.h) * dpr;
    data[o + 4] = fill[0]; data[o + 5] = fill[1]; data[o + 6] = fill[2]; data[o + 7] = fill[3];
    data[o + 8] = stroke[0]; data[o + 9] = stroke[1]; data[o + 10] = stroke[2]; data[o + 11] = stroke[3];
    data[o + 12] = (r.strokeWidth || 0) * dpr;
    data[o + 13] = (r.rx || 0) * dpr;
    data[o + 14] = r.opacity;
  }
  return data;
}

// --- GPU render pass ---

async function renderGPU(canvas, width, height, dpr, circles, rects, lines) {
  const gpu = await initGPU(canvas, width, height, dpr);
  if (!gpu) throw new Error('WebGPU init failed');

  const { device, ctx, uniformGroup } = gpu;
  const encoder = device.createCommandEncoder();
  const textureView = ctx.getCurrentTexture().createView();

  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: textureView,
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      loadOp: 'clear',
      storeOp: 'store'
    }]
  });

  // Lines — tessellated into triangle strips
  if (lines.length > 0) {
    const lineData = tessellateLines(lines, dpr);
    if (lineData.length > 0) {
      const pipeline = createLinePipeline(gpu);
      const buf = device.createBuffer({
        size: lineData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
      });
      device.queue.writeBuffer(buf, 0, lineData);
      renderPass.setPipeline(pipeline);
      renderPass.setBindGroup(0, uniformGroup);
      renderPass.setVertexBuffer(0, buf);
      renderPass.draw(lineData.length / 7);
    }
  }

  // Rects — GPU instanced
  if (rects.length > 0) {
    const rectData = packRects(rects, dpr);
    const pipeline = createRectPipeline(gpu);
    const buf = device.createBuffer({
      size: rectData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(buf, 0, rectData);
    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, uniformGroup);
    renderPass.setVertexBuffer(0, buf);
    renderPass.draw(6, rects.length);
  }

  // Circles — GPU instanced
  if (circles.length > 0) {
    const circleData = packCircles(circles, dpr);
    const pipeline = createCirclePipeline(gpu);
    const buf = device.createBuffer({
      size: circleData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(buf, 0, circleData);
    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, uniformGroup);
    renderPass.setVertexBuffer(0, buf);
    renderPass.draw(6, circles.length);
  }

  renderPass.end();
  device.queue.submit([encoder.finish()]);
}

// --- Canvas 2D fallback for GPU failure mid-render ---

function renderFallbackShapes(ctx, circles, rects, lines) {
  for (const ln of lines) {
    ctx.save();
    ctx.globalAlpha = ln.opacity;
    ctx.beginPath();
    ctx.moveTo(ln.x1, ln.y1);
    ctx.lineTo(ln.x2, ln.y2);
    ctx.strokeStyle = resolveColor(ln.stroke) || '#ccc';
    ctx.lineWidth = ln.strokeWidth || 1;
    ctx.stroke();
    ctx.restore();
  }
  for (const r of rects) {
    ctx.save();
    ctx.globalAlpha = r.opacity;
    const fill = resolveColor(r.fill);
    const stroke = resolveColor(r.stroke);
    if (r.rx > 0) {
      const rad = Math.min(r.rx, r.w / 2, r.h / 2);
      ctx.beginPath();
      ctx.moveTo(r.x + rad, r.y);
      ctx.lineTo(r.x + r.w - rad, r.y);
      ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + rad, rad);
      ctx.lineTo(r.x + r.w, r.y + r.h - rad);
      ctx.arcTo(r.x + r.w, r.y + r.h, r.x + r.w - rad, r.y + r.h, rad);
      ctx.lineTo(r.x + rad, r.y + r.h);
      ctx.arcTo(r.x, r.y + r.h, r.x, r.y + r.h - rad, rad);
      ctx.lineTo(r.x, r.y + rad);
      ctx.arcTo(r.x, r.y, r.x + rad, r.y, rad);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = r.strokeWidth || 1; ctx.stroke(); }
    } else {
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(r.x, r.y, Math.max(0, r.w), Math.max(0, r.h)); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = r.strokeWidth || 1; ctx.strokeRect(r.x, r.y, Math.max(0, r.w), Math.max(0, r.h)); }
    }
    ctx.restore();
  }
  for (const c of circles) {
    ctx.save();
    ctx.globalAlpha = c.opacity;
    ctx.beginPath();
    ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
    const fill = resolveColor(c.fill);
    const stroke = resolveColor(c.stroke);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = c.strokeWidth || 1; ctx.stroke(); }
    ctx.restore();
  }
}

// --- Main export ---

/**
 * Render scene graph via WebGPU with Canvas 2D overlay for text/complex shapes.
 * Returns HTMLElement synchronously; GPU rendering starts asynchronously.
 * Falls back to Canvas renderer if WebGPU is unavailable.
 * @param {Object} sceneNode — scene graph root
 * @returns {HTMLElement} container div with canvas layers
 */
export function renderWebGPU(sceneNode) {
  // Feature detection — synchronous fallback to Canvas renderer
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return renderCanvas(sceneNode);
  }

  if (!sceneNode || sceneNode.type !== 'scene') {
    const c = document.createElement('div');
    c.style.width = '100px';
    c.style.height = '100px';
    return c;
  }

  const { width, height, children } = sceneNode;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Container
  const container = document.createElement('div');
  container.className = 'd-chart-svg';
  container.style.position = 'relative';
  container.style.width = width + 'px';
  container.style.height = height + 'px';

  // GPU canvas (bottom layer)
  const gpuCanvas = document.createElement('canvas');
  gpuCanvas.width = width * dpr;
  gpuCanvas.height = height * dpr;
  gpuCanvas.style.width = width + 'px';
  gpuCanvas.style.height = height + 'px';
  gpuCanvas.style.position = 'absolute';
  gpuCanvas.style.top = '0';
  gpuCanvas.style.left = '0';
  container.appendChild(gpuCanvas);

  // Overlay canvas (top layer — text, arcs, paths, polygons, dashed lines)
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = width * dpr;
  overlayCanvas.height = height * dpr;
  overlayCanvas.style.width = width + 'px';
  overlayCanvas.style.height = height + 'px';
  overlayCanvas.style.position = 'absolute';
  overlayCanvas.style.top = '0';
  overlayCanvas.style.left = '0';
  overlayCanvas.style.pointerEvents = 'none';
  container.appendChild(overlayCanvas);

  // Batch scene nodes by type
  const batches = { circles: [], rects: [], lines: [], overlay: [] };
  for (const child of children) flattenScene(child, batches, 0, 0, 1);

  // Dashed lines cannot be GPU-rendered — route to overlay
  const solidLines = batches.lines.filter(l => !l.strokeDash);
  const dashedLines = batches.lines.filter(l => l.strokeDash);

  // Render overlay synchronously (Canvas 2D)
  const octx = overlayCanvas.getContext('2d');
  octx.scale(dpr, dpr);
  renderOverlay(octx, batches.overlay, dashedLines);

  // Kick off async GPU rendering; fall back to Canvas 2D on failure
  renderGPU(gpuCanvas, width, height, dpr, batches.circles, batches.rects, solidLines).catch(() => {
    renderFallbackShapes(octx, batches.circles, batches.rects, solidLines);
  });

  return container;
}
