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
  it('fills defaults', () => {
    const spec = chartSpec({ type: 'bar', data: SAMPLE_DATA, x: 'month', y: 'sales' });
    assert.equal(spec.type, 'bar');
    assert.equal(spec.tooltip, true);
    assert.equal(spec.legend, true);
    assert.equal(spec.grid, true);
    assert.equal(spec.renderer, 'auto');
    assert.equal(spec.height, '300px');
    assert.equal(spec.tableAlt, true);
  });

  it('overrides defaults with provided values', () => {
    const spec = chartSpec({ type: 'pie', height: '500px', grid: false });
    assert.equal(spec.type, 'pie');
    assert.equal(spec.height, '500px');
    assert.equal(spec.grid, false);
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
});
