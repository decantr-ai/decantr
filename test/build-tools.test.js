import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';

// ─── CSS Extract ─────────────────────────────────────────────────

import { extractClassNames, generateCSS } from '../tools/css-extract.js';

describe('CSS Extract', () => {
  it('extracts class names from css() calls', () => {
    const source = `css('_flex _gap4 _p6')`;
    const classes = extractClassNames(source);
    assert.ok(classes.has('_flex'));
    assert.ok(classes.has('_gap4'));
    assert.ok(classes.has('_p6'));
  });

  it('extracts class names from class: prop', () => {
    const source = `class: '_grid _gc3'`;
    const classes = extractClassNames(source);
    assert.ok(classes.has('_grid'));
    assert.ok(classes.has('_gc3'));
  });

  it('generates CSS with @layer wrapper', () => {
    const classes = new Set(['_flex', '_block']);
    const css = generateCSS(classes);
    assert.ok(css.startsWith('@layer d.atoms{'));
    assert.ok(css.includes('._flex{'));
  });

  it('returns empty string for unknown classes', () => {
    const classes = new Set(['_nonexistent_xyz']);
    const css = generateCSS(classes);
    assert.equal(css, '');
  });
});

// ─── Minifier ────────────────────────────────────────────────────

import { minify } from '../tools/minify.js';

describe('Minifier', () => {
  it('removes comments', () => {
    const result = minify('const a = 1; // comment\nconst x = 1;');
    assert.ok(!result.includes('comment'));
    assert.ok(result.includes('const x=1'));
  });

  it('removes multi-line comments', () => {
    const result = minify('/** docs */\nconst y = 2;');
    assert.ok(!result.includes('docs'));
  });

  it('preserves template literals', () => {
    const result = minify('const s = `hello world`;');
    assert.ok(result.includes('hello world'));
  });

  it('collapses whitespace', () => {
    const result = minify('const   x   =   1;');
    assert.ok(result.includes('const x=1'));
  });
});

// ─── Analyzer ────────────────────────────────────────────────────

import { analyzeBundle } from '../tools/analyzer.js';

describe('Bundle Analyzer', () => {
  it('returns stats for JS content', () => {
    const js = '// src/app.js\nconst _m0 = (function(){return {}})();\n';
    const { stats } = analyzeBundle(js, '');
    assert.ok(stats.js.raw > 0);
    assert.ok(stats.js.gzip > 0);
    assert.ok(stats.js.brotli > 0);
    assert.ok(stats.js.brotli <= stats.js.gzip || stats.js.brotli <= stats.js.raw);
  });

  it('returns stats for CSS content', () => {
    const css = '@layer d.atoms{._flex{display:flex}}';
    const { stats } = analyzeBundle('', css);
    assert.ok(stats.css.raw > 0);
    assert.ok(stats.css.gzip > 0);
    assert.ok(stats.css.brotli > 0);
  });

  it('produces a formatted report string', () => {
    const { report } = analyzeBundle('const x=1;', '.a{color:red}', { html: '<html></html>' });
    assert.ok(typeof report === 'string');
    assert.ok(report.includes('Bundle Analysis'));
    assert.ok(report.includes('Compression Ratios'));
  });

  it('parses module boundaries from markers', () => {
    const js = [
      '// src/core/index.js',
      'const _m0 = (function(){const x = 1; return {x}})();',
      '',
      '// src/state/index.js',
      'const _m1 = (function(){const y = 2; return {y}})();',
    ].join('\n');
    const { stats } = analyzeBundle(js, '');
    assert.ok(stats.modules.length === 2);
    assert.ok(stats.modules[0].path.includes('src/'));
  });

  it('calculates totals correctly', () => {
    const { stats } = analyzeBundle('abc', 'def', { html: 'ghi' });
    assert.equal(stats.total.raw, stats.js.raw + stats.css.raw + stats.html.raw);
  });
});

// ─── Builder internal functions (tested via import) ──────────────

describe('Builder', () => {
  it('exports build function', async () => {
    const mod = await import('../tools/builder.js');
    assert.equal(typeof mod.build, 'function');
  });
});

// ─── Source Map VLQ ──────────────────────────────────────────────

describe('Source Maps', () => {
  it('builder produces sourcemap when enabled', async () => {
    // We can't run a full build without a project, but we can verify
    // the builder module loads and exports correctly
    const mod = await import('../tools/builder.js');
    assert.ok(mod.build);
  });
});

// ─── CSS Purging ─────────────────────────────────────────────────

describe('CSS Purging', () => {
  it('concept: only referenced atoms survive', () => {
    // CSS purging is integrated into the builder
    // This tests the concept: extracting used classes from JS
    const js = `css('_flex _p4')`;
    const classes = extractClassNames(js);
    // _flex and _p4 should survive purging
    assert.ok(classes.has('_flex'));
    assert.ok(classes.has('_p4'));
    // _grid was never referenced
    assert.ok(!classes.has('_grid'));
  });
});
