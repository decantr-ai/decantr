import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { tokenize, filterComments } from '../tools/compiler/tokenizer.js';
import { parse, getStaticImports, getDynamicImports } from '../tools/compiler/parser.js';
import { ModuleGraph } from '../tools/compiler/graph.js';
import { validate } from '../tools/compiler/validator.js';
import { SourceMapGenerator, encodeVLQ, decodeVLQ } from '../tools/compiler/utils/source-map.js';
import { contentHash } from '../tools/compiler/utils/hash.js';

// ============================================================================
// Tokenizer Tests
// ============================================================================

describe('Tokenizer', () => {
  it('tokenizes keywords', () => {
    const tokens = tokenize('import export const let var function class', 'test.js');
    const keywords = tokens.filter(t => t.type === 'keyword');
    assert.strictEqual(keywords.length, 7);
    assert.deepStrictEqual(keywords.map(k => k.value), [
      'import', 'export', 'const', 'let', 'var', 'function', 'class'
    ]);
  });

  it('tokenizes identifiers', () => {
    const tokens = tokenize('foo _bar $baz camelCase', 'test.js');
    const ids = tokens.filter(t => t.type === 'identifier');
    assert.strictEqual(ids.length, 4);
    assert.deepStrictEqual(ids.map(i => i.value), ['foo', '_bar', '$baz', 'camelCase']);
  });

  it('tokenizes strings', () => {
    const tokens = tokenize(`'single' "double"`, 'test.js');
    const strings = tokens.filter(t => t.type === 'string');
    assert.strictEqual(strings.length, 2);
    assert.strictEqual(strings[0].value, "'single'");
    assert.strictEqual(strings[1].value, '"double"');
  });

  it('handles escape sequences in strings', () => {
    const tokens = tokenize(`'hello\\nworld' "tab\\there"`, 'test.js');
    const strings = tokens.filter(t => t.type === 'string');
    assert.strictEqual(strings[0].value, "'hello\\nworld'");
    assert.strictEqual(strings[1].value, '"tab\\there"');
  });

  it('tokenizes template literals', () => {
    const tokens = tokenize('`hello world`', 'test.js');
    const templates = tokens.filter(t => t.type === 'template_string');
    assert.strictEqual(templates.length, 1);
    assert.strictEqual(templates[0].value, '`hello world`');
  });

  it('tokenizes template literals with expressions', () => {
    const tokens = tokenize('`hello ${name}!`', 'test.js');
    const types = tokens.map(t => t.type);
    assert.ok(types.includes('template_head'));
    assert.ok(types.includes('identifier'));
    assert.ok(types.includes('template_tail'));
  });

  it('tokenizes numbers', () => {
    const tokens = tokenize('42 3.14 0xFF 1e10 0b1010 0o777', 'test.js');
    const nums = tokens.filter(t => t.type === 'number');
    assert.strictEqual(nums.length, 6);
    assert.deepStrictEqual(nums.map(n => n.value), ['42', '3.14', '0xFF', '1e10', '0b1010', '0o777']);
  });

  it('tokenizes regex', () => {
    const tokens = tokenize('const re = /pattern/gi;', 'test.js');
    const regex = tokens.find(t => t.type === 'regex');
    assert.ok(regex);
    assert.strictEqual(regex.value, '/pattern/gi');
  });

  it('distinguishes regex from division', () => {
    const tokens = tokenize('a / b', 'test.js');
    assert.ok(tokens.some(t => t.type === 'punctuator' && t.value === '/'));
    assert.ok(!tokens.some(t => t.type === 'regex'));
  });

  it('handles regex after keywords', () => {
    const tokens = tokenize('return /test/;', 'test.js');
    assert.ok(tokens.some(t => t.type === 'regex'));
  });

  it('tokenizes comments', () => {
    const tokens = tokenize('// line comment\n/* block */\ncode', 'test.js');
    const comments = tokens.filter(t => t.type === 'comment');
    assert.strictEqual(comments.length, 2);
  });

  it('filters comments', () => {
    const tokens = tokenize('a // comment\nb', 'test.js');
    const filtered = filterComments(tokens);
    assert.ok(!filtered.some(t => t.type === 'comment'));
  });

  it('tracks line numbers correctly', () => {
    const tokens = tokenize('line1\nline2\nline3', 'test.js');
    const ids = tokens.filter(t => t.type === 'identifier');
    assert.strictEqual(ids[0].loc.line, 1);
    assert.strictEqual(ids[1].loc.line, 2);
    assert.strictEqual(ids[2].loc.line, 3);
  });

  it('handles arrow functions', () => {
    const tokens = tokenize('const fn = (x) => x * 2', 'test.js');
    assert.ok(tokens.some(t => t.type === 'punctuator' && t.value === '=>'));
  });

  it('handles spread operator', () => {
    const tokens = tokenize('[...arr]', 'test.js');
    assert.ok(tokens.some(t => t.type === 'punctuator' && t.value === '...'));
  });
});

// ============================================================================
// Parser Tests
// ============================================================================

describe('Parser', () => {
  function parseSource(source) {
    const tokens = tokenize(source, 'test.js');
    return parse(tokens, 'test.js');
  }

  it('parses named imports', () => {
    const ast = parseSource(`import { a, b as c } from './mod';`);
    assert.strictEqual(ast.imports.length, 1);
    assert.strictEqual(ast.imports[0].type, 'named');
    assert.strictEqual(ast.imports[0].source, './mod');
    assert.deepStrictEqual(ast.imports[0].names, [
      { imported: 'a', local: 'a' },
      { imported: 'b', local: 'c' }
    ]);
  });

  it('parses default imports', () => {
    const ast = parseSource(`import Foo from './foo';`);
    assert.strictEqual(ast.imports.length, 1);
    assert.strictEqual(ast.imports[0].type, 'default');
    assert.strictEqual(ast.imports[0].name, 'Foo');
  });

  it('parses namespace imports', () => {
    const ast = parseSource(`import * as mod from './mod';`);
    assert.strictEqual(ast.imports.length, 1);
    assert.strictEqual(ast.imports[0].type, 'namespace');
    assert.strictEqual(ast.imports[0].name, 'mod');
  });

  it('parses side-effect imports', () => {
    const ast = parseSource(`import './side-effect';`);
    assert.strictEqual(ast.imports.length, 1);
    assert.strictEqual(ast.imports[0].type, 'side-effect');
  });

  it('parses mixed imports', () => {
    const ast = parseSource(`import Foo, { bar } from './mod';`);
    assert.strictEqual(ast.imports.length, 2);
    assert.ok(ast.imports.some(i => i.type === 'default'));
    assert.ok(ast.imports.some(i => i.type === 'named'));
  });

  it('parses dynamic imports', () => {
    const ast = parseSource(`const mod = import('./dynamic');`);
    assert.strictEqual(ast.imports.length, 1);
    assert.strictEqual(ast.imports[0].type, 'dynamic');
    assert.strictEqual(ast.imports[0].source, './dynamic');
  });

  it('parses named exports', () => {
    const ast = parseSource(`export { a, b as c };`);
    assert.strictEqual(ast.exports.length, 1);
    assert.strictEqual(ast.exports[0].type, 'named');
  });

  it('parses default exports', () => {
    const ast = parseSource(`export default function foo() {}`);
    assert.strictEqual(ast.exports.length, 1);
    assert.strictEqual(ast.exports[0].type, 'default');
  });

  it('parses re-exports', () => {
    const ast = parseSource(`export { x } from './other';`);
    assert.strictEqual(ast.exports.length, 1);
    assert.strictEqual(ast.exports[0].source, './other');
  });

  it('parses export all', () => {
    const ast = parseSource(`export * from './other';`);
    assert.strictEqual(ast.exports.length, 1);
    assert.strictEqual(ast.exports[0].type, 'all');
  });

  it('parses declaration exports', () => {
    const ast = parseSource(`export const x = 1;`);
    assert.strictEqual(ast.exports.length, 1);
    assert.strictEqual(ast.exports[0].type, 'declaration');
    assert.strictEqual(ast.exports[0].name, 'x');
  });

  it('parses top-level declarations', () => {
    const ast = parseSource(`
      const a = 1;
      let b = 2;
      function foo() {}
      class Bar {}
    `);
    assert.strictEqual(ast.topLevel.length, 4);
  });

  it('detects top-level await', () => {
    const ast = parseSource(`const data = await fetch('/api');`);
    assert.strictEqual(ast.hasTopLevelAwait, true);
  });

  it('extracts static imports', () => {
    const ast = parseSource(`
      import { a } from './a';
      import b from './b';
      const c = import('./c');
    `);
    const statics = getStaticImports(ast);
    assert.deepStrictEqual(statics, ['./a', './b']);
  });

  it('extracts dynamic imports', () => {
    const ast = parseSource(`
      import { a } from './a';
      const b = import('./b');
      const c = import('./c');
    `);
    const dynamics = getDynamicImports(ast);
    assert.deepStrictEqual(dynamics, ['./b', './c']);
  });
});

// ============================================================================
// Module Graph Tests
// ============================================================================

describe('ModuleGraph', async () => {
  let testDir;

  beforeEach(async () => {
    testDir = join(tmpdir(), `decantr-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('builds a simple graph', async () => {
    await writeFile(join(testDir, 'app.js'), `
      import { foo } from './foo.js';
      export const app = foo;
    `);
    await writeFile(join(testDir, 'foo.js'), `
      export const foo = 'foo';
    `);

    const graph = new ModuleGraph(join(testDir, 'app.js'));
    await graph.build();

    assert.strictEqual(graph.modules.size, 2);
    assert.strictEqual(graph.errors.length, 0);
  });

  it('detects circular dependencies', async () => {
    await writeFile(join(testDir, 'a.js'), `
      import { b } from './b.js';
      export const a = b;
    `);
    await writeFile(join(testDir, 'b.js'), `
      import { a } from './a.js';
      export const b = a;
    `);

    const graph = new ModuleGraph(join(testDir, 'a.js'));
    await graph.build();

    const circular = graph.detectCircularDependencies();
    assert.ok(circular.length > 0);
  });

  it('handles dynamic imports', async () => {
    await writeFile(join(testDir, 'app.js'), `
      const page = import('./page.js');
    `);
    await writeFile(join(testDir, 'page.js'), `
      export default function Page() {}
    `);

    const graph = new ModuleGraph(join(testDir, 'app.js'));
    await graph.build();

    const app = graph.modules.get(graph.entryId);
    const dynamicDep = app.dependencies.find(d => d.type === 'dynamic');
    assert.ok(dynamicDep);
  });

  it('computes topological order', async () => {
    await writeFile(join(testDir, 'a.js'), `
      import { b } from './b.js';
      import { c } from './c.js';
    `);
    await writeFile(join(testDir, 'b.js'), `
      import { c } from './c.js';
      export const b = 1;
    `);
    await writeFile(join(testDir, 'c.js'), `
      export const c = 2;
    `);

    const graph = new ModuleGraph(join(testDir, 'a.js'));
    await graph.build();

    // c should come before b, which should come before a
    const order = graph.order.map(id => graph.modules.get(id).relPath);
    const cIndex = order.findIndex(p => p.includes('c.js'));
    const bIndex = order.findIndex(p => p.includes('b.js'));
    const aIndex = order.findIndex(p => p.includes('a.js'));

    assert.ok(cIndex < bIndex);
    assert.ok(bIndex < aIndex);
  });
});

// ============================================================================
// Validator Tests
// ============================================================================

describe('Validator', () => {
  it('validates correct JavaScript', () => {
    const result = validate('const x = 1;', 'test.js');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('catches syntax errors', () => {
    const result = validate('const x = {', 'test.js');
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it('catches unbalanced braces via syntax check', () => {
    // Syntax check catches unbalanced braces
    const result = validate('function foo() { if (true) { }', 'test.js');
    assert.strictEqual(result.valid, false);
  });
});

// ============================================================================
// Source Map Tests
// ============================================================================

describe('SourceMap', () => {
  it('encodes and decodes VLQ', () => {
    const values = [0, 1, -1, 15, -15, 100, -100, 1000];
    for (const val of values) {
      const encoded = encodeVLQ(val);
      const { value } = decodeVLQ(encoded);
      assert.strictEqual(value, val, `Failed for ${val}`);
    }
  });

  it('generates valid source map', () => {
    const gen = new SourceMapGenerator({ file: 'out.js' });
    gen.addSource('input.js', 'const x = 1;');
    gen.addMapping({
      genLine: 0,
      genCol: 0,
      srcIndex: 0,
      srcLine: 0,
      srcCol: 0
    });

    const map = gen.generate();
    assert.strictEqual(map.version, 3);
    assert.ok(Array.isArray(map.sources));
    assert.ok(typeof map.mappings === 'string');
  });
});

// ============================================================================
// Hash Utils Tests
// ============================================================================

describe('Hash Utils', () => {
  it('generates consistent hashes', () => {
    const hash1 = contentHash('hello world');
    const hash2 = contentHash('hello world');
    assert.strictEqual(hash1, hash2);
  });

  it('generates different hashes for different content', () => {
    const hash1 = contentHash('hello');
    const hash2 = contentHash('world');
    assert.notStrictEqual(hash1, hash2);
  });

  it('respects length parameter', () => {
    const hash8 = contentHash('test', 8);
    const hash16 = contentHash('test', 16);
    assert.strictEqual(hash8.length, 8);
    assert.strictEqual(hash16.length, 16);
  });
});
