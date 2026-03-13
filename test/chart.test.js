import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';

// --- Shared utilities ---
import {
  resolve, scaleLinear, scaleBand, scaleTime,
  extent, unique, groupBy, downsampleLTTB,
  padExtent, isDateLike, toDate
} from '../src/chart/_shared.js';

// --- Base CSS ---
import { injectChartBase, resetChartBase } from '../src/chart/_base.js';

// --- Type layouts ---
import { layoutLine } from '../src/chart/types/line.js';
import { layoutBar } from '../src/chart/types/bar.js';
import { layoutArea } from '../src/chart/types/area.js';
import { layoutPie } from '../src/chart/types/pie.js';
import { layoutSparkline } from '../src/chart/types/sparkline.js';

// --- Type base ---
import { chartColor, PALETTE_SIZE, MARGINS, innerDimensions } from '../src/chart/types/_type-base.js';

// --- Annotations ---
import { buildAnnotations } from '../src/chart/layouts/_layout-base.js';
import { scaleLinear as _scaleLinear, scaleBand as _scaleBand } from '../src/chart/_shared.js';

// --- Public API ---
import { chartSpec, createStream, colorScale, resolvePalette } from '../src/chart/index.js';

// --- Scene graph ---
import { scene, group, path, rect, circle, text, line, arc, pointsToPathD, smoothPathD, areaPathD, arcToPath } from '../src/chart/_scene.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

// ============================
// _shared.js — Scales & Utils
// ============================

describe('chart/_shared.js', () => {
  describe('resolve()', () => {
    it('returns static values as-is', () => {
      assert.equal(resolve(42), 42);
      assert.equal(resolve('hello'), 'hello');
    });
    it('calls functions and returns result', () => {
      assert.equal(resolve(() => 99), 99);
    });
  });

  describe('scaleLinear()', () => {
    it('maps domain to range', () => {
      const s = scaleLinear([0, 100], [0, 500]);
      assert.equal(s(0), 0);
      assert.equal(s(50), 250);
      assert.equal(s(100), 500);
    });
    it('inverts range to domain', () => {
      const s = scaleLinear([0, 100], [0, 500]);
      assert.equal(s.invert(250), 50);
    });
    it('generates ticks', () => {
      const s = scaleLinear([0, 100], [0, 500]);
      const ticks = s.ticks(5);
      assert.ok(ticks.length > 0);
      assert.ok(ticks.every(t => t >= 0 && t <= 100));
    });
  });

  describe('scaleBand()', () => {
    it('maps discrete values to positions', () => {
      const s = scaleBand(['A', 'B', 'C'], [0, 300]);
      assert.ok(typeof s('A') === 'number');
      assert.ok(s('A') < s('B'));
      assert.ok(s('B') < s('C'));
    });
    it('has bandwidth', () => {
      const s = scaleBand(['A', 'B', 'C'], [0, 300]);
      assert.ok(s.bandwidth() > 0);
    });
  });

  describe('scaleTime()', () => {
    it('maps dates to positions', () => {
      const d0 = new Date('2026-01-01');
      const d1 = new Date('2026-12-31');
      const s = scaleTime([d0, d1], [0, 500]);
      assert.equal(s(d0), 0);
      assert.ok(s(d1) > 490);
    });
    it('inverts to Date', () => {
      const d0 = new Date('2026-01-01');
      const d1 = new Date('2026-12-31');
      const s = scaleTime([d0, d1], [0, 500]);
      const inv = s.invert(250);
      assert.ok(inv instanceof Date);
    });
  });

  describe('extent()', () => {
    it('computes min/max of field', () => {
      const data = [{ v: 3 }, { v: 1 }, { v: 7 }, { v: 2 }];
      const [min, max] = extent(data, 'v');
      assert.equal(min, 1);
      assert.equal(max, 7);
    });
  });

  describe('unique()', () => {
    it('returns unique values preserving order', () => {
      const data = [{ c: 'A' }, { c: 'B' }, { c: 'A' }, { c: 'C' }];
      const u = unique(data, 'c');
      assert.deepEqual(u, ['A', 'B', 'C']);
    });
  });

  describe('groupBy()', () => {
    it('groups data by field', () => {
      const data = [{ g: 'x', v: 1 }, { g: 'y', v: 2 }, { g: 'x', v: 3 }];
      const groups = groupBy(data, 'g');
      assert.equal(groups.size, 2);
      assert.equal(groups.get('x').length, 2);
      assert.equal(groups.get('y').length, 1);
    });
  });

  describe('downsampleLTTB()', () => {
    it('returns data unchanged if below target count', () => {
      const data = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }];
      assert.equal(downsampleLTTB(data, 'x', 'y', 10), data);
    });
    it('downsamples large datasets', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: Math.sin(i) }));
      const result = downsampleLTTB(data, 'x', 'y', 20);
      assert.equal(result.length, 20);
      assert.equal(result[0], data[0]);
      assert.equal(result[result.length - 1], data[data.length - 1]);
    });
  });

  describe('padExtent()', () => {
    it('pads extent by fraction', () => {
      const [min, max] = padExtent([0, 100], 0.1);
      assert.equal(min, -10);
      assert.equal(max, 110);
    });
  });

  describe('isDateLike()', () => {
    it('detects Date objects', () => {
      assert.ok(isDateLike([new Date()]));
    });
    it('detects date strings', () => {
      assert.ok(isDateLike(['2026-01-01']));
    });
    it('returns false for numbers', () => {
      assert.ok(!isDateLike([42]));
    });
    it('returns false for empty', () => {
      assert.ok(!isDateLike([]));
    });
  });

  describe('toDate()', () => {
    it('passes Date through', () => {
      const d = new Date();
      assert.equal(toDate(d), d);
    });
    it('converts string to Date', () => {
      assert.ok(toDate('2026-01-01') instanceof Date);
    });
  });
});

// ============================
// _base.js — Structural CSS
// ============================

describe('chart/_base.js', () => {
  it('injects chart base CSS with @layer', () => {
    resetChartBase();
    injectChartBase();
    const el = document.querySelector('[data-decantr-chart]');
    assert.ok(el);
    assert.ok(el.textContent.includes('@layer d.base{'));
    assert.ok(el.textContent.includes('.d-chart{'));
    assert.ok(el.textContent.includes('.d-chart-svg{'));
    assert.ok(el.textContent.includes('.d-chart-tooltip{'));
    assert.ok(el.textContent.includes('.d-chart-legend{'));
    assert.ok(el.textContent.includes('.d-chart-sr{'));
  });

  it('only injects once', () => {
    resetChartBase();
    injectChartBase();
    injectChartBase();
    const els = document.querySelectorAll('[data-decantr-chart]');
    assert.equal(els.length, 1);
  });

  it('includes reduced motion rule', () => {
    resetChartBase();
    injectChartBase();
    const el = document.querySelector('[data-decantr-chart]');
    assert.ok(el.textContent.includes('prefers-reduced-motion'));
  });
});

// ============================
// Type base
// ============================

describe('chart/types/_type-base.js', () => {
  it('chartColor returns CSS variable reference', () => {
    assert.equal(chartColor(0), 'var(--d-chart-0)');
    assert.equal(chartColor(3), 'var(--d-chart-3)');
    assert.equal(chartColor(8), 'var(--d-chart-0)'); // Wraps around
  });

  it('PALETTE_SIZE is 8', () => {
    assert.equal(PALETTE_SIZE, 8);
  });

  it('innerDimensions computes inner area', () => {
    const { innerW, innerH } = innerDimensions(600, 400, MARGINS);
    assert.equal(innerW, 600 - MARGINS.left - MARGINS.right);
    assert.equal(innerH, 400 - MARGINS.top - MARGINS.bottom);
  });
});

// ============================
// Scene Graph
// ============================

describe('_scene.js', () => {
  it('scene() creates root node', () => {
    const s = scene(800, 600, [], { type: 'line' });
    assert.equal(s.type, 'scene');
    assert.equal(s.width, 800);
    assert.equal(s.height, 600);
    assert.deepEqual(s.children, []);
  });

  it('group() creates group node', () => {
    const g = group({ transform: 'translate(10,20)' }, [rect({ x: 0, y: 0, w: 10, h: 10 })]);
    assert.equal(g.type, 'group');
    assert.equal(g.transform, 'translate(10,20)');
    assert.equal(g.children.length, 1);
  });

  it('path, rect, circle, text, line, arc create proper nodes', () => {
    assert.equal(path({ d: 'M0,0L10,10' }).type, 'path');
    assert.equal(rect({ x: 0, y: 0, w: 10, h: 10 }).type, 'rect');
    assert.equal(circle({ cx: 5, cy: 5, r: 3 }).type, 'circle');
    assert.equal(text({ x: 0, y: 0, content: 'hello' }).type, 'text');
    assert.equal(line({ x1: 0, y1: 0, x2: 10, y2: 10 }).type, 'line');
    assert.equal(arc({ cx: 50, cy: 50, outerR: 40, innerR: 20, startAngle: 0, endAngle: 1 }).type, 'arc');
  });

  it('pointsToPathD converts points to M/L path', () => {
    const d = pointsToPathD([{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 30, y: 5 }]);
    assert.equal(d, 'M0,0L10,20L30,5');
  });

  it('areaPathD creates closed polygon', () => {
    const d = areaPathD([{ x: 0, y0: 0, y1: 100 }, { x: 50, y0: 30, y1: 100 }]);
    assert.ok(d.startsWith('M'));
    assert.ok(d.endsWith('Z'));
  });

  it('smoothPathD produces cubic bezier path', () => {
    const d = smoothPathD([{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 20, y: 5 }]);
    assert.ok(d.includes('C'));
  });

  it('arcToPath produces valid SVG arc path', () => {
    const d = arcToPath(100, 100, 50, 30, 0, Math.PI);
    assert.ok(d.includes('A'));
    assert.ok(d.includes('Z'));
  });
});

// ============================
// Layout functions (scene graph output)
// ============================

const SAMPLE_DATA = [
  { month: 'Jan', sales: 100, profit: 30 },
  { month: 'Feb', sales: 200, profit: 60 },
  { month: 'Mar', sales: 150, profit: 45 },
  { month: 'Apr', sales: 300, profit: 90 },
  { month: 'May', sales: 250, profit: 75 }
];

describe('layoutLine()', () => {
  it('returns scene graph with line type', () => {
    const sg = layoutLine({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    assert.equal(sg.type, 'scene');
    assert.equal(sg.meta.type, 'line');
    assert.ok(sg.meta.series.length > 0);
    assert.equal(sg.meta.series[0].key, 'sales');
    assert.ok(sg.meta.series[0].points.length === 5);
  });

  it('handles multi-field y', () => {
    const sg = layoutLine({ data: SAMPLE_DATA, x: 'month', y: ['sales', 'profit'] }, 600, 400);
    assert.equal(sg.meta.series.length, 2);
    assert.equal(sg.meta.series[0].key, 'sales');
    assert.equal(sg.meta.series[1].key, 'profit');
  });

  it('produces scene children (group with axes, grid, paths)', () => {
    const sg = layoutLine({ data: SAMPLE_DATA, x: 'month', y: 'sales', grid: true }, 600, 400);
    assert.ok(sg.children.length > 0);
    assert.equal(sg.children[0].type, 'group');
  });
});

describe('layoutBar()', () => {
  it('returns scene graph with bar type', () => {
    const sg = layoutBar({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    assert.equal(sg.type, 'scene');
    assert.equal(sg.meta.type, 'bar');
    assert.equal(sg.meta.bars.length, 5);
    assert.ok(sg.meta.bars[0].segments.length > 0);
  });

  it('each bar has dimensions', () => {
    const sg = layoutBar({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    for (const bar of sg.meta.bars) {
      for (const seg of bar.segments) {
        assert.ok(typeof seg.x === 'number');
        assert.ok(typeof seg.y === 'number');
        assert.ok(seg.width > 0);
        assert.ok(seg.height >= 0);
      }
    }
  });

  it('supports stacked bars', () => {
    const sg = layoutBar({ data: SAMPLE_DATA, x: 'month', y: ['sales', 'profit'], stacked: true }, 600, 400);
    assert.equal(sg.meta.bars.length, 5);
    assert.equal(sg.meta.bars[0].segments.length, 2);
  });

  it('supports grouped bars', () => {
    const sg = layoutBar({ data: SAMPLE_DATA, x: 'month', y: ['sales', 'profit'] }, 600, 400);
    assert.equal(sg.meta.bars[0].segments.length, 2);
  });
});

describe('layoutArea()', () => {
  it('returns scene graph with area type', () => {
    const sg = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    assert.equal(sg.type, 'scene');
    assert.equal(sg.meta.type, 'area');
    assert.ok(sg.meta.series.length > 0);
    assert.ok(sg.meta.series[0].points.length === 5);
  });

  it('area points have y0 and y1', () => {
    const sg = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    const pt = sg.meta.series[0].points[0];
    assert.ok(typeof pt.y0 === 'number');
    assert.ok(typeof pt.y1 === 'number');
  });
});

describe('layoutPie()', () => {
  it('returns scene graph with pie type', () => {
    const sg = layoutPie({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 400, 400);
    assert.equal(sg.type, 'scene');
    assert.equal(sg.meta.type, 'pie');
    assert.equal(sg.meta.slices.length, 5);
  });

  it('slices sum to 100%', () => {
    const sg = layoutPie({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 400, 400);
    const total = sg.meta.slices.reduce((sum, s) => sum + s.percentage, 0);
    assert.ok(Math.abs(total - 100) < 0.01);
  });

  it('has center and radius', () => {
    const sg = layoutPie({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 400, 400);
    assert.ok(sg.meta.cx > 0);
    assert.ok(sg.meta.cy > 0);
    assert.ok(sg.meta.radius > 0);
    assert.ok(sg.meta.innerRadius > 0); // donut by default
  });
});

describe('layoutSparkline()', () => {
  it('handles flat number array', () => {
    const sg = layoutSparkline({ data: [4, 7, 2, 9, 5] }, 120, 32);
    assert.equal(sg.type, 'scene');
    assert.equal(sg.meta.type, 'sparkline');
    assert.equal(sg.meta.dataLength, 5);
  });

  it('handles empty data', () => {
    const sg = layoutSparkline({ data: [] }, 120, 32);
    assert.equal(sg.meta.dataLength, 0);
  });

  it('produces scene children for valid data', () => {
    const sg = layoutSparkline({ data: [1, 2, 3, 4, 5] }, 120, 32);
    assert.ok(sg.children.length > 0);
  });

  it('supports bar variant', () => {
    const sg = layoutSparkline({ data: [1, 2, 3], variant: 'bar' }, 120, 32);
    assert.ok(sg.children.length === 3);
    assert.equal(sg.children[0].type, 'rect');
  });

  it('supports area variant', () => {
    const sg = layoutSparkline({ data: [1, 2, 3, 4], variant: 'area' }, 120, 32);
    assert.ok(sg.children.length >= 2); // area fill + stroke line
  });
});

// ============================
// chartSpec()
// ============================

describe('chartSpec()', () => {
  it('fills defaults including smooth, dots, axisLine', () => {
    const spec = chartSpec({ type: 'bar', data: SAMPLE_DATA, x: 'month', y: 'sales' });
    assert.equal(spec.type, 'bar');
    assert.equal(spec.tooltip, true);
    assert.equal(spec.legend, true);
    assert.equal(spec.grid, true);
    assert.equal(spec.smooth, true);
    assert.equal(spec.dots, true);
    assert.equal(spec.axisLine, false);
    assert.equal(spec.renderer, 'auto');
    assert.equal(spec.height, '300px');
    assert.equal(spec.tableAlt, true);
  });

  it('overrides defaults with provided values', () => {
    const spec = chartSpec({ type: 'pie', height: '500px', grid: false, smooth: false, dots: false, axisLine: true });
    assert.equal(spec.type, 'pie');
    assert.equal(spec.height, '500px');
    assert.equal(spec.grid, false);
    assert.equal(spec.smooth, false);
    assert.equal(spec.dots, false);
    assert.equal(spec.axisLine, true);
  });

  it('provides empty data array if none given', () => {
    const spec = chartSpec({});
    assert.ok(Array.isArray(spec.data));
    assert.equal(spec.data.length, 0);
  });
});

// ============================
// New API: createStream, colorScale, resolvePalette
// ============================

describe('createStream()', () => {
  it('appends data and returns via signal', () => {
    const stream = createStream({ maxPoints: 10 });
    stream.append({ x: 1, y: 2 });
    stream.append({ x: 2, y: 4 });
    const data = stream.data();
    assert.equal(data.length, 2);
    assert.equal(data[0].x, 1);
  });

  it('trims to maxPoints', () => {
    const stream = createStream({ maxPoints: 3 });
    for (let i = 0; i < 10; i++) stream.append({ x: i });
    assert.equal(stream.data().length, 3);
    assert.equal(stream.data()[0].x, 7); // oldest trimmed
  });

  it('supports batch append', () => {
    const stream = createStream({ maxPoints: 100 });
    stream.append([{ x: 1 }, { x: 2 }, { x: 3 }]);
    assert.equal(stream.data().length, 3);
  });

  it('destroy clears buffer', () => {
    const stream = createStream();
    stream.append({ x: 1 });
    stream.destroy();
    assert.equal(stream.data().length, 0);
  });
});

describe('colorScale()', () => {
  it('interpolates between two colors', () => {
    const scale = colorScale([0, 100], ['#000000', '#ffffff']);
    assert.equal(scale(0), '#000000');
    assert.equal(scale(100), '#ffffff');
    // Midpoint should be gray
    const mid = scale(50);
    assert.ok(mid.startsWith('#'));
    assert.equal(mid.length, 7);
  });

  it('clamps out-of-range values', () => {
    const scale = colorScale([0, 1], ['#ff0000', '#0000ff']);
    assert.equal(scale(-1), '#ff0000');
    assert.equal(scale(2), '#0000ff');
  });

  it('handles multi-stop gradients', () => {
    const scale = colorScale([0, 100], ['#ff0000', '#00ff00', '#0000ff']);
    const color25 = scale(25);
    assert.ok(color25.startsWith('#'));
  });
});

// ============================
// Hierarchy layouts
// ============================

import { buildHierarchy, treemapLayout, sunburstLayout } from '../src/chart/layouts/hierarchy.js';

describe('buildHierarchy()', () => {
  it('converts flat array to tree', () => {
    const data = [
      { id: 'root', parent: null, val: 0 },
      { id: 'a', parent: 'root', val: 10 },
      { id: 'b', parent: 'root', val: 20 },
      { id: 'c', parent: 'a', val: 5 }
    ];
    const root = buildHierarchy(data, 'id', 'parent', 'val');
    assert.equal(root.id, 'root');
    assert.equal(root.children.length, 2);
    assert.ok(root.value > 0);
  });
});

describe('treemapLayout()', () => {
  it('produces rectangles for tree nodes', () => {
    const data = [
      { id: 'root', parent: null, val: 0 },
      { id: 'a', parent: 'root', val: 30 },
      { id: 'b', parent: 'root', val: 20 },
      { id: 'c', parent: 'root', val: 10 }
    ];
    const root = buildHierarchy(data, 'id', 'parent', 'val');
    const rects = treemapLayout(root, 0, 0, 600, 400);
    assert.ok(rects.length >= 4); // root + 3 children
    for (const r of rects) {
      assert.ok(typeof r.x === 'number');
      assert.ok(typeof r.y === 'number');
      assert.ok(r.w >= 0);
      assert.ok(r.h >= 0);
    }
  });
});

describe('sunburstLayout()', () => {
  it('produces ring segments', () => {
    const data = [
      { id: 'root', parent: null, val: 0 },
      { id: 'a', parent: 'root', val: 30 },
      { id: 'b', parent: 'root', val: 20 }
    ];
    const root = buildHierarchy(data, 'id', 'parent', 'val');
    const segments = sunburstLayout(root, 200, 200, 100, 30);
    assert.ok(segments.length >= 2);
    for (const seg of segments) {
      assert.ok(typeof seg.startAngle === 'number');
      assert.ok(typeof seg.endAngle === 'number');
      assert.ok(seg.outerR > seg.innerR);
    }
  });
});

// ============================
// Polar layout
// ============================

import { polar, sliceAngles, polarPoint } from '../src/chart/layouts/polar.js';

describe('polar()', () => {
  it('computes center and radius', () => {
    const p = polar(400, 400);
    assert.ok(p.cx > 0);
    assert.ok(p.cy > 0);
    assert.ok(p.radius > 0);
  });

  it('angularScale maps values to angles', () => {
    const p = polar(400, 400);
    const angle = p.angularScale(50, 100);
    assert.ok(typeof angle === 'number');
  });
});

describe('sliceAngles()', () => {
  it('divides full circle proportionally', () => {
    const angles = sliceAngles([25, 25, 50], -Math.PI / 2, Math.PI * 2);
    assert.equal(angles.length, 3);
    const total = angles.reduce((s, a) => s + a.percentage, 0);
    assert.ok(Math.abs(total - 100) < 0.01);
  });
});

// ============================
// Cartesian layout
// ============================

import { cartesian } from '../src/chart/layouts/cartesian.js';

describe('cartesian()', () => {
  it('builds scales and axis nodes', () => {
    const c = cartesian({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    assert.ok(c.innerW > 0);
    assert.ok(c.innerH > 0);
    assert.ok(typeof c.xScale === 'function');
    assert.ok(typeof c.yScale === 'function');
    assert.ok(c.axisNodes.length > 0);
  });

  it('supports band X scale', () => {
    const c = cartesian({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400, { bandX: true });
    assert.equal(c.xType, 'band');
    assert.ok(c.categories.length > 0);
  });

  it('omits axis lines when axisLine is false', () => {
    const c = cartesian({ data: SAMPLE_DATA, x: 'month', y: 'sales', axisLine: false }, 600, 400);
    // No line nodes with class d-chart-axis in axisNodes
    const axisLines = c.axisNodes.filter(n => n.type === 'line' && n.class === 'd-chart-axis');
    assert.equal(axisLines.length, 0);
  });

  it('includes axis lines when axisLine is true', () => {
    const c = cartesian({ data: SAMPLE_DATA, x: 'month', y: 'sales', axisLine: true }, 600, 400);
    const axisLines = c.axisNodes.filter(n => n.type === 'line' && n.class === 'd-chart-axis');
    assert.ok(axisLines.length > 0);
  });
});

// ============================
// smoothAreaPathD
// ============================

import { smoothAreaPathD, gradient as gradientNode } from '../src/chart/_scene.js';

describe('smoothAreaPathD()', () => {
  it('produces smooth top edge with straight bottom', () => {
    const points = [
      { x: 0, y0: 10, y1: 100 },
      { x: 50, y0: 30, y1: 100 },
      { x: 100, y0: 20, y1: 100 }
    ];
    const d = smoothAreaPathD(points);
    assert.ok(d.includes('C')); // Smooth top edge has cubic bezier
    assert.ok(d.endsWith('Z')); // Closed path
    assert.ok(d.includes('L')); // Straight bottom edge has L commands
  });

  it('returns empty string for no points', () => {
    assert.equal(smoothAreaPathD([]), '');
  });
});

// ============================
// Gradient scene node
// ============================

describe('gradient scene node', () => {
  it('creates gradient node with correct type', () => {
    const g = gradientNode({ id: 'test-grad', x1: '0', y1: '0', x2: '0', y2: '100', stops: [{ offset: '0%', color: '#ff0000', opacity: 0.3 }] });
    assert.equal(g.type, 'gradient');
    assert.equal(g.id, 'test-grad');
    assert.equal(g.stops.length, 1);
  });
});

// ============================
// SVG gradient rendering
// ============================

import { renderSVG } from '../src/chart/renderers/svg.js';

describe('SVG gradient rendering', () => {
  it('renders gradient nodes into <defs>', () => {
    const sg = scene(200, 200, [
      group({}, [
        gradientNode({
          id: 'test-grad', x1: '0', y1: '0', x2: '0', y2: '200',
          stops: [
            { offset: '0%', color: '#ff0000', opacity: 0.5 },
            { offset: '100%', color: '#0000ff', opacity: 0 }
          ]
        }),
        path({ d: 'M0,0L100,100', fill: 'url(#test-grad)', key: 'test-path' })
      ])
    ]);
    const svg = renderSVG(sg);
    const defs = svg.querySelector('defs');
    assert.ok(defs, 'SVG should contain <defs>');
    const grad = defs.querySelector('linearGradient');
    assert.ok(grad, 'defs should contain <linearGradient>');
    assert.equal(grad.getAttribute('id'), 'test-grad');
    const stops = grad.querySelectorAll('stop');
    assert.equal(stops.length, 2);
  });
});

// ============================
// Bar rx rounding
// ============================

describe('bar rx rounding', () => {
  it('uses rx: 4 max for bars', () => {
    const sg = layoutBar({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    const barGroup = sg.children[0];
    const barRects = barGroup.children.filter(c => c.type === 'rect' && c.class === 'd-chart-bar');
    assert.ok(barRects.length > 0);
    for (const r of barRects) {
      assert.ok(r.rx <= 4, `rx should be <= 4, got ${r.rx}`);
      assert.ok(r.rx >= 0, `rx should be >= 0, got ${r.rx}`);
    }
  });

  it('stacked bars: only topmost segment gets rx > 0', () => {
    const sg = layoutBar({ data: SAMPLE_DATA, x: 'month', y: ['sales', 'profit'], stacked: true }, 600, 400);
    const barGroup = sg.children[0];
    const barRects = barGroup.children.filter(c => c.type === 'rect' && c.class === 'd-chart-bar');
    // Each category has 2 segments — first (sales) should have rx:0, second (profit=topmost) should have rx>0
    for (let i = 0; i < barRects.length; i += 2) {
      assert.equal(barRects[i].rx, 0, 'bottom segment should have rx: 0');
    }
    for (let i = 1; i < barRects.length; i += 2) {
      assert.ok(barRects[i].rx > 0, 'topmost segment should have rx > 0');
    }
  });
});

// ============================
// Area chart gradient + smooth
// ============================

describe('area chart ShadCN visuals', () => {
  it('emits gradient nodes', () => {
    const sg = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    const areaGroup = sg.children[0];
    const grads = areaGroup.children.filter(c => c.type === 'gradient');
    assert.ok(grads.length > 0, 'area chart should produce gradient nodes');
    assert.ok(grads[0].stops.length === 2);
    assert.ok(grads[0].stops[0].opacity > grads[0].stops[1].opacity);
  });

  it('uses gradient fill instead of flat color', () => {
    const sg = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    const areaGroup = sg.children[0];
    const areaPaths = areaGroup.children.filter(c => c.type === 'path' && c.key && c.key.startsWith('area-') && !c.key.includes('line'));
    for (const p of areaPaths) {
      assert.ok(p.fill.startsWith('url(#'), `area fill should be gradient ref, got: ${p.fill}`);
    }
  });

  it('includes data point dots', () => {
    const sg = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales', dots: true }, 600, 400);
    const areaGroup = sg.children[0];
    const dots = areaGroup.children.filter(c => c.type === 'circle' && c.class === 'd-chart-point');
    assert.equal(dots.length, 5);
  });
});

// ============================
// Line chart dots
// ============================

describe('line chart dots', () => {
  it('includes data point dots by default', () => {
    const sg = layoutLine({ data: SAMPLE_DATA, x: 'month', y: 'sales', dots: true }, 600, 400);
    const lineGroup = sg.children[0];
    const dots = lineGroup.children.filter(c => c.type === 'circle' && c.class === 'd-chart-point');
    assert.equal(dots.length, 5);
  });

  it('suppresses dots when dots: false', () => {
    const sg = layoutLine({ data: SAMPLE_DATA, x: 'month', y: 'sales', dots: false }, 600, 400);
    const lineGroup = sg.children[0];
    const dots = lineGroup.children.filter(c => c.type === 'circle' && c.class === 'd-chart-point');
    assert.equal(dots.length, 0);
  });

  it('dots have stroke var(--d-bg) for ShadCN style', () => {
    const sg = layoutLine({ data: SAMPLE_DATA, x: 'month', y: 'sales', dots: true }, 600, 400);
    const lineGroup = sg.children[0];
    const dots = lineGroup.children.filter(c => c.type === 'circle' && c.class === 'd-chart-point');
    for (const d of dots) {
      assert.equal(d.stroke, 'var(--d-bg)');
      assert.equal(d.strokeWidth, 2);
      assert.equal(d.r, 3);
    }
  });
});

// ============================
// Animation engine integration
// ============================

import { animate, interpolateScene } from '../src/chart/_animate.js';

describe('animation engine', () => {
  it('interpolateScene interpolates numeric properties', () => {
    const from = scene(200, 200, [rect({ x: 0, y: 100, w: 50, h: 0, key: 'r1' })]);
    const to = scene(200, 200, [rect({ x: 0, y: 50, w: 50, h: 50, key: 'r1' })]);
    const mid = interpolateScene(from, to, 0.5);
    const r = mid.children[0];
    assert.equal(r.y, 75);
    assert.equal(r.h, 25);
  });

  it('returns target scene at t=1', () => {
    const from = scene(200, 200, [rect({ x: 0, y: 100, w: 50, h: 0, key: 'r1' })]);
    const to = scene(200, 200, [rect({ x: 0, y: 50, w: 50, h: 50, key: 'r1' })]);
    const result = interpolateScene(from, to, 1);
    const r = result.children[0];
    assert.equal(r.y, 50);
    assert.equal(r.h, 50);
  });
});

// ============================
// Annotations — buildAnnotations()
// ============================

describe('buildAnnotations()', () => {
  const yScale = _scaleLinear([0, 100], [200, 0]);
  const xScale = _scaleBand(['Jan', 'Feb', 'Mar', 'Apr', 'May'], [0, 500]);
  const innerW = 500;
  const innerH = 200;

  it('returns empty array for no annotations', () => {
    assert.deepEqual(buildAnnotations(null, xScale, yScale, 'band', innerW, innerH), []);
    assert.deepEqual(buildAnnotations([], xScale, yScale, 'band', innerW, innerH), []);
  });

  it('builds horizontal reference line (axis: y)', () => {
    const nodes = buildAnnotations(
      [{ type: 'line', axis: 'y', value: 50, label: 'Target', color: 'var(--d-warning)' }],
      xScale, yScale, 'band', innerW, innerH
    );
    const lines = nodes.filter(n => n.type === 'line');
    assert.equal(lines.length, 1);
    assert.equal(lines[0].x1, 0);
    assert.equal(lines[0].x2, innerW);
    assert.equal(lines[0].y1, yScale(50));
    assert.equal(lines[0].stroke, 'var(--d-warning)');
    assert.equal(lines[0].class, 'd-chart-annotation-line');
    const labels = nodes.filter(n => n.type === 'text');
    assert.equal(labels.length, 1);
    assert.equal(labels[0].content, 'Target');
  });

  it('builds vertical reference line (axis: x)', () => {
    const nodes = buildAnnotations(
      [{ type: 'line', axis: 'x', value: 'Mar', label: 'Launch' }],
      xScale, yScale, 'band', innerW, innerH
    );
    const lines = nodes.filter(n => n.type === 'line');
    assert.equal(lines.length, 1);
    assert.equal(lines[0].y1, 0);
    assert.equal(lines[0].y2, innerH);
    assert.equal(lines[0].class, 'd-chart-annotation-line');
  });

  it('builds band annotation (axis: y)', () => {
    const nodes = buildAnnotations(
      [{ type: 'band', axis: 'y', from: 30, to: 70, label: 'Range', color: 'var(--d-success)' }],
      xScale, yScale, 'band', innerW, innerH
    );
    const rects = nodes.filter(n => n.type === 'rect');
    assert.equal(rects.length, 1);
    assert.equal(rects[0].x, 0);
    assert.equal(rects[0].w, innerW);
    assert.equal(rects[0].class, 'd-chart-annotation-band');
    assert.equal(rects[0].fill, 'var(--d-success)');
    // Band y should span from yScale(70) to yScale(30)
    assert.equal(rects[0].y, yScale(70));
    assert.equal(rects[0].h, yScale(30) - yScale(70));
  });

  it('builds point annotation', () => {
    const nodes = buildAnnotations(
      [{ type: 'point', x: 'Mar', y: 80, label: 'Peak', color: 'var(--d-primary)' }],
      xScale, yScale, 'band', innerW, innerH
    );
    const circles = nodes.filter(n => n.type === 'circle');
    assert.equal(circles.length, 1);
    assert.equal(circles[0].r, 5);
    assert.equal(circles[0].stroke, 'var(--d-primary)');
    const labels = nodes.filter(n => n.type === 'text');
    assert.equal(labels.length, 1);
    assert.equal(labels[0].content, 'Peak');
  });

  it('handles multiple annotations', () => {
    const nodes = buildAnnotations([
      { type: 'line', axis: 'y', value: 50 },
      { type: 'band', axis: 'y', from: 20, to: 40 },
      { type: 'point', x: 'Jan', y: 60, label: 'Note' }
    ], xScale, yScale, 'band', innerW, innerH);
    assert.ok(nodes.length >= 3);
  });

  it('uses default color and dash when not specified', () => {
    const nodes = buildAnnotations(
      [{ type: 'line', axis: 'y', value: 25 }],
      xScale, yScale, 'band', innerW, innerH
    );
    const ln = nodes.find(n => n.type === 'line');
    assert.equal(ln.stroke, 'var(--d-muted)');
    assert.equal(ln.strokeDash, '4,3');
  });

  it('custom dash pattern is applied', () => {
    const nodes = buildAnnotations(
      [{ type: 'line', axis: 'y', value: 25, dash: '8,4' }],
      xScale, yScale, 'band', innerW, innerH
    );
    const ln = nodes.find(n => n.type === 'line');
    assert.equal(ln.strokeDash, '8,4');
  });
});

// ============================
// Annotation integration with chart types
// ============================

describe('chart type annotation integration', () => {
  const annotations = [
    { type: 'line', axis: 'y', value: 200, label: 'Budget', color: 'var(--d-warning)' }
  ];

  it('layoutLine includes annotation nodes', () => {
    const sg = layoutLine({ data: SAMPLE_DATA, x: 'month', y: 'sales', annotations }, 600, 400);
    const grp = sg.children[0];
    const annoLines = grp.children.filter(c => c.class === 'd-chart-annotation-line');
    assert.ok(annoLines.length > 0, 'line chart should render annotation line');
    const annoLabels = grp.children.filter(c => c.class === 'd-chart-annotation-label');
    assert.ok(annoLabels.length > 0, 'line chart should render annotation label');
  });

  it('layoutBar includes annotation nodes', () => {
    const sg = layoutBar({ data: SAMPLE_DATA, x: 'month', y: 'sales', annotations }, 600, 400);
    const grp = sg.children[0];
    const annoLines = grp.children.filter(c => c.class === 'd-chart-annotation-line');
    assert.ok(annoLines.length > 0, 'bar chart should render annotation line');
  });

  it('layoutArea includes annotation nodes', () => {
    const sg = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales', annotations }, 600, 400);
    const grp = sg.children[0];
    const annoLines = grp.children.filter(c => c.class === 'd-chart-annotation-line');
    assert.ok(annoLines.length > 0, 'area chart should render annotation line');
  });
});
