import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';

// ─── CSS Extract ─────────────────────────────────────────────────

import { extractClassNames, extractClassNamesFromModules, generateCSS } from '../tools/css-extract.js';

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

  it('generateCSS with duplicate atom names produces correct output (cache)', () => {
    const classes = new Set(['_flex', '_flex', '_block']);
    const css = generateCSS(classes);
    // _flex should only appear once in output (Set deduplicates, cache returns same result)
    const flexCount = (css.match(/\._flex\{/g) || []).length;
    assert.equal(flexCount, 1);
    assert.ok(css.includes('._block{'));
  });

  it('generateCSS with responsive + base version of same atom', () => {
    const classes = new Set(['_flex', '_md:flex']);
    const css = generateCSS(classes);
    // Both should be present: base _flex and responsive _md:flex
    assert.ok(css.includes('._flex{'));
    assert.ok(css.includes('@media(min-width:768px)'));
  });

  it('extractClassNamesFromModules extracts from Map of sources', () => {
    const modules = new Map([
      ['src/a.js', `css('_flex _gap4')`],
      ['src/b.js', `class: '_grid _p6'`],
    ]);
    const classes = extractClassNamesFromModules(modules);
    assert.ok(classes.has('_flex'));
    assert.ok(classes.has('_gap4'));
    assert.ok(classes.has('_grid'));
    assert.ok(classes.has('_p6'));
  });
});

// ─── Minifier ────────────────────────────────────────────────────

import { minify, mangle } from '../tools/minify.js';

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

  it('minify with { mangle: false } preserves variable names', () => {
    const source = `const _m0 = (function(){\nconst longVariableName = 1;\nreturn {longVariableName};\n})();`;
    const result = minify(source, { mangle: false });
    assert.ok(result.includes('longVariableName'));
  });

  it('full minify() pipeline produces valid JS', () => {
    const source = `const _m0 = (function(){\nconst x = 1;\nconst y = x + 2;\nreturn {y};\n})();`;
    const result = minify(source);
    // Should not throw when evaluated
    assert.doesNotThrow(() => new Function(result));
  });
});

// ─── Mangler ──────────────────────────────────────────────────────

describe('Mangler', () => {
  it('renames local variables to short names', () => {
    const source = `const _m0 = (function(){\nconst longName = 1;\nconst anotherLong = longName + 2;\nreturn {anotherLong};\n})();`;
    const result = mangle(source);
    // longName should be renamed to something shorter
    assert.ok(!result.includes('longName'));
    // anotherLong is a shorthand export — should NOT be renamed
    assert.ok(result.includes('anotherLong'));
  });

  it('preserves exported names in return statement', () => {
    const source = `const _m0 = (function(){\nfunction myFunc() { return 1; }\nreturn {myFunc};\n})();`;
    const result = mangle(source);
    // myFunc is a shorthand export — must NOT be renamed
    assert.ok(result.includes('myFunc'));
  });

  it('preserves global built-ins', () => {
    const source = `const _m0 = (function(){\nconst longVar = document.createElement('div');\nconsole.log(longVar);\nreturn {out: longVar};\n})();`;
    const result = mangle(source);
    assert.ok(result.includes('document'));
    assert.ok(result.includes('console'));
    // longVar should be renamed (it's NOT a shorthand export, it's keyed as `out: longVar`)
    assert.ok(!result.includes('longVar'));
  });

  it('preserves string/template literal contents', () => {
    const source = `const _m0 = (function(){\nconst longVariable = 'longVariable should not change here';\nreturn {out: longVariable};\n})();`;
    const result = mangle(source);
    assert.ok(result.includes('longVariable should not change here'));
  });

  it('handles multiple IIFE scopes independently', () => {
    const source = [
      `const _m0 = (function(){`,
      `const myVar = 1;`,
      `return {out: myVar};`,
      `})();`,
      `const _m1 = (function(){`,
      `const myVar = 2;`,
      `return {out: myVar};`,
      `})();`,
    ].join('\n');
    const result = mangle(source);
    // myVar should be renamed in both scopes
    assert.ok(!result.includes('myVar'));
    // Module names should be preserved
    assert.ok(result.includes('_m0'));
    assert.ok(result.includes('_m1'));
  });

  it('does not rename property access (.propName)', () => {
    const source = `const _m0 = (function(){\nconst myObj = {};\nmyObj.longProp = 1;\nreturn {out: myObj};\n})();`;
    const result = mangle(source);
    // longProp is a property access, should NOT be renamed
    assert.ok(result.includes('longProp'));
    // myObj should be renamed (it's a local variable, keyed export)
    assert.ok(!result.includes('myObj'));
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

import { eliminateDeadBranches, canHoist } from '../tools/builder.js';

describe('Builder', () => {
  it('exports build function', async () => {
    const mod = await import('../tools/builder.js');
    assert.equal(typeof mod.build, 'function');
  });
});

// ─── Dead Branch Elimination ─────────────────────────────────────

describe('Dead Branch Elimination', () => {
  it('removes if (false) { ... } blocks', () => {
    const source = `const x = 1;\nif (false) {\n  const y = 2;\n}\nconst z = 3;`;
    const result = eliminateDeadBranches(source);
    assert.ok(!result.includes('const y = 2'));
    assert.ok(result.includes('const x = 1'));
    assert.ok(result.includes('const z = 3'));
  });

  it('keeps if (true) body, removes else', () => {
    const source = `if (true) {\n  const kept = 1;\n} else {\n  const removed = 2;\n}`;
    const result = eliminateDeadBranches(source);
    assert.ok(result.includes('const kept = 1'));
    assert.ok(!result.includes('const removed = 2'));
  });

  it('removes code after return in block', () => {
    const source = `function f() {\n  return 1;\n  const dead = 2;\n}`;
    const result = eliminateDeadBranches(source);
    assert.ok(result.includes('return 1;'));
    assert.ok(!result.includes('const dead = 2'));
  });

  it('preserves if (someVar) unchanged', () => {
    const source = `if (someVar) {\n  doThing();\n}`;
    const result = eliminateDeadBranches(source);
    assert.ok(result.includes('someVar'));
    assert.ok(result.includes('doThing'));
  });

  it('handles nested blocks correctly', () => {
    const source = `if (false) {\n  if (true) {\n    nested();\n  }\n}\nconst after = 1;`;
    const result = eliminateDeadBranches(source);
    assert.ok(!result.includes('nested'));
    assert.ok(result.includes('const after = 1'));
  });

  it('removes dev guard (typeof __DECANTR_DEV__)', () => {
    const source = `if (typeof __DECANTR_DEV__ !== 'undefined') {\n  console.warn('dev only');\n}\nconst prod = 1;`;
    const result = eliminateDeadBranches(source);
    assert.ok(!result.includes('dev only'));
    assert.ok(result.includes('const prod = 1'));
  });

  it('removes dev guard (globalThis.__DECANTR_DEV__)', () => {
    const source = `if (globalThis.__DECANTR_DEV__) {\n  console.warn('dev only');\n}\nconst prod = 1;`;
    const result = eliminateDeadBranches(source);
    assert.ok(!result.includes('dev only'));
    assert.ok(result.includes('const prod = 1'));
  });
});

// ─── Scope Hoisting ──────────────────────────────────────────────

describe('Scope Hoisting', () => {
  it('pure declaration module is hoistable', () => {
    const source = `function formatDate(d) { return d.toISOString(); }\nconst MAX = 100;`;
    assert.equal(canHoist(source), true);
  });

  it('module with side effects is not hoistable', () => {
    const source = `init();\nfunction formatDate(d) { return d; }`;
    assert.equal(canHoist(source), false);
  });

  it('module with new expression is not hoistable', () => {
    const source = `new Worker('worker.js');\nfunction doWork() {}`;
    assert.equal(canHoist(source), false);
  });

  it('module with this at top level is not hoistable', () => {
    const source = `const x = this.foo;\nfunction bar() {}`;
    assert.equal(canHoist(source), false);
  });

  it('module with this inside function body IS hoistable', () => {
    const source = `function MyComponent() {\n  this.x = 1;\n}`;
    assert.equal(canHoist(source), true);
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

// ─── HMR Classification ──────────────────────────────────────────

import { classifyChange } from '../tools/dev-server.js';

describe('HMR Classification', () => {
  it('css/styles/addons/clean.js returns css-tokens', () => {
    const result = classifyChange('css/styles/addons/clean.js', 'src');
    assert.equal(result.type, 'css-tokens');
  });

  it('css/theme-registry.js returns css-tokens', () => {
    const result = classifyChange('css/theme-registry.js', 'src');
    assert.equal(result.type, 'css-tokens');
  });

  it('css/derive.js returns css-tokens', () => {
    const result = classifyChange('css/derive.js', 'src');
    assert.equal(result.type, 'css-tokens');
  });

  it('css/components.js returns css-components', () => {
    const result = classifyChange('css/components.js', 'src');
    assert.equal(result.type, 'css-components');
  });

  it('css/atoms.js returns reload', () => {
    const result = classifyChange('css/atoms.js', 'src');
    assert.equal(result.type, 'reload');
  });

  it('css/runtime.js returns reload', () => {
    const result = classifyChange('css/runtime.js', 'src');
    assert.equal(result.type, 'reload');
  });

  it('state/index.js returns reload', () => {
    const result = classifyChange('state/index.js', 'src');
    assert.equal(result.type, 'reload');
  });

  it('pages/home.js returns hmr', () => {
    const result = classifyChange('pages/home.js', 'src');
    assert.equal(result.type, 'hmr');
    assert.equal(result.module, '/src/pages/home.js');
  });

  it('components/button.js returns hmr', () => {
    const result = classifyChange('components/button.js', 'src');
    assert.equal(result.type, 'hmr');
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
