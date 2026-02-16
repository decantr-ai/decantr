import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { css, define, extractCSS, reset } from '../src/css/index.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

beforeEach(() => {
  reset();
});

describe('css()', () => {
  it('returns class names', () => {
    const result = css('p4', 'flex');
    assert.equal(result, 'p4 flex');
  });

  it('injects CSS rules into style element', () => {
    css('p4');
    const output = extractCSS();
    assert.ok(output.includes('.p4{padding:1rem}'));
  });

  it('deduplicates injections', () => {
    css('p4');
    css('p4');
    const output = extractCSS();
    const count = output.split('.p4{').length - 1;
    assert.equal(count, 1);
  });

  it('handles space-separated classes in single string', () => {
    const result = css('p4 m0 flex');
    assert.equal(result, 'p4 m0 flex');
    const output = extractCSS();
    assert.ok(output.includes('.p4{'));
    assert.ok(output.includes('.m0{'));
    assert.ok(output.includes('.flex{'));
  });

  it('passes through unknown classes', () => {
    const result = css('p4', 'my-custom-class');
    assert.equal(result, 'p4 my-custom-class');
  });

  it('handles empty/falsy inputs', () => {
    const result = css('', null, undefined, 'p4');
    assert.equal(result, 'p4');
  });
});

describe('define()', () => {
  it('registers custom atomic classes', () => {
    define('brand', 'background:#ff6600');
    const result = css('brand');
    assert.equal(result, 'brand');
    const output = extractCSS();
    assert.ok(output.includes('.brand{background:#ff6600}'));
  });
});

describe('atom coverage', () => {
  it('generates spacing atoms', () => {
    css('p0', 'p4', 'px2', 'py3', 'mt1', 'mb4', 'gap2');
    const output = extractCSS();
    assert.ok(output.includes('.p0{padding:0}'));
    assert.ok(output.includes('.p4{padding:1rem}'));
    assert.ok(output.includes('.px2{padding-inline:0.5rem}'));
    assert.ok(output.includes('.mt1{margin-top:0.25rem}'));
    assert.ok(output.includes('.gap2{gap:0.5rem}'));
  });

  it('generates display atoms', () => {
    css('flex', 'grid', 'block', 'none');
    const output = extractCSS();
    assert.ok(output.includes('.flex{display:flex}'));
    assert.ok(output.includes('.grid{display:grid}'));
    assert.ok(output.includes('.block{display:block}'));
    assert.ok(output.includes('.none{display:none}'));
  });

  it('generates flexbox atoms', () => {
    css('col', 'row', 'wrap', 'center', 'aic', 'jcsb');
    const output = extractCSS();
    assert.ok(output.includes('.col{flex-direction:column}'));
    assert.ok(output.includes('.row{flex-direction:row}'));
    assert.ok(output.includes('.center{'));
  });

  it('generates color atoms', () => {
    css('bg0', 'bg1', 'fg0', 'fg2');
    const output = extractCSS();
    assert.ok(output.includes('.bg0{background:var(--c0)}'));
    assert.ok(output.includes('.fg2{color:var(--c2)}'));
  });

  it('generates typography atoms', () => {
    css('t14', 't24', 'bold', 'tc');
    const output = extractCSS();
    assert.ok(output.includes('.t14{font-size:0.875rem}'));
    assert.ok(output.includes('.t24{font-size:1.5rem}'));
    assert.ok(output.includes('.bold{font-weight:700}'));
    assert.ok(output.includes('.tc{text-align:center}'));
  });

  it('generates border atoms', () => {
    css('r2', 'rfull', 'b1');
    const output = extractCSS();
    assert.ok(output.includes('.r2{border-radius:0.5rem}'));
    assert.ok(output.includes('.rfull{border-radius:9999px}'));
    assert.ok(output.includes('.b1{border:1px solid}'));
  });
});
