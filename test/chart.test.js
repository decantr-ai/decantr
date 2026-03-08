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
import { chartSpec } from '../src/chart/index.js';

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
      assert.equal(result[0], data[0]); // First preserved
      assert.equal(result[result.length - 1], data[data.length - 1]); // Last preserved
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
// Layout functions
// ============================

const SAMPLE_DATA = [
  { month: 'Jan', sales: 100, profit: 30 },
  { month: 'Feb', sales: 200, profit: 60 },
  { month: 'Mar', sales: 150, profit: 45 },
  { month: 'Apr', sales: 300, profit: 90 },
  { month: 'May', sales: 250, profit: 75 }
];

describe('layoutLine()', () => {
  it('returns line layout with series', () => {
    const layout = layoutLine({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    assert.equal(layout.type, 'line');
    assert.ok(layout.series.length > 0);
    assert.equal(layout.series[0].key, 'sales');
    assert.ok(layout.series[0].points.length === 5);
  });

  it('handles multi-field y', () => {
    const layout = layoutLine({ data: SAMPLE_DATA, x: 'month', y: ['sales', 'profit'] }, 600, 400);
    assert.equal(layout.series.length, 2);
    assert.equal(layout.series[0].key, 'sales');
    assert.equal(layout.series[1].key, 'profit');
  });
});

describe('layoutBar()', () => {
  it('returns bar layout with bars array', () => {
    const layout = layoutBar({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    assert.equal(layout.type, 'bar');
    assert.equal(layout.bars.length, 5);
    assert.ok(layout.bars[0].segments.length > 0);
  });

  it('each bar has dimensions', () => {
    const layout = layoutBar({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    for (const bar of layout.bars) {
      for (const seg of bar.segments) {
        assert.ok(typeof seg.x === 'number');
        assert.ok(typeof seg.y === 'number');
        assert.ok(seg.width > 0);
        assert.ok(seg.height >= 0);
      }
    }
  });
});

describe('layoutArea()', () => {
  it('returns area layout with series', () => {
    const layout = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    assert.equal(layout.type, 'area');
    assert.ok(layout.series.length > 0);
    assert.ok(layout.series[0].points.length === 5);
  });

  it('area points have y0 and y1', () => {
    const layout = layoutArea({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 600, 400);
    const pt = layout.series[0].points[0];
    assert.ok(typeof pt.y0 === 'number');
    assert.ok(typeof pt.y1 === 'number');
  });
});

describe('layoutPie()', () => {
  it('returns pie layout with slices', () => {
    const layout = layoutPie({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 400, 400);
    assert.equal(layout.type, 'pie');
    assert.equal(layout.slices.length, 5);
  });

  it('slices sum to 100%', () => {
    const layout = layoutPie({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 400, 400);
    const total = layout.slices.reduce((sum, s) => sum + s.percentage, 0);
    assert.ok(Math.abs(total - 100) < 0.01);
  });

  it('has center and radius', () => {
    const layout = layoutPie({ data: SAMPLE_DATA, x: 'month', y: 'sales' }, 400, 400);
    assert.equal(layout.cx, 200);
    assert.equal(layout.cy, 200);
    assert.ok(layout.radius > 0);
    assert.ok(layout.innerRadius > 0); // donut by default
  });
});

describe('layoutSparkline()', () => {
  it('handles flat number array', () => {
    const layout = layoutSparkline({ data: [4, 7, 2, 9, 5] }, 120, 32);
    assert.equal(layout.type, 'sparkline');
    assert.equal(layout.points.length, 5);
  });

  it('handles empty data', () => {
    const layout = layoutSparkline({ data: [] }, 120, 32);
    assert.equal(layout.points.length, 0);
  });

  it('scales points within dimensions', () => {
    const layout = layoutSparkline({ data: [1, 2, 3, 4, 5] }, 120, 32);
    for (const p of layout.points) {
      assert.ok(p.x >= 0 && p.x <= 120);
      assert.ok(p.y >= 0 && p.y <= 32);
    }
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
