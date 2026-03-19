import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateId,
  validateVersion,
  compareSemver,
  validateArtifact,
  validateForPublish,
  safetyScan,
} from '../../src/services/validator.js';

describe('validateId', () => {
  it('accepts valid kebab-case IDs', () => {
    assert.ok(validateId('my-style', 'style').valid);
    assert.ok(validateId('ab', 'plugin').valid);
    assert.ok(validateId('a-b-c-d-e', 'pattern').valid);
  });

  it('rejects invalid IDs', () => {
    assert.ok(!validateId('', 'style').valid);
    assert.ok(!validateId('A', 'style').valid);
    assert.ok(!validateId('1abc', 'style').valid);
    assert.ok(!validateId('a', 'style').valid); // too short (1 char)
    assert.ok(!validateId('has_underscore', 'style').valid);
  });

  it('rejects built-in IDs', () => {
    assert.ok(!validateId('auradecantism', 'style').valid);
    assert.ok(!validateId('hero', 'pattern').valid);
    assert.ok(!validateId('ecommerce', 'archetype').valid);
  });
});

describe('validateVersion', () => {
  it('accepts valid semver', () => {
    assert.ok(validateVersion('1.0.0').valid);
    assert.ok(validateVersion('0.0.1').valid);
    assert.ok(validateVersion('12.34.56').valid);
  });

  it('rejects invalid versions', () => {
    assert.ok(!validateVersion('').valid);
    assert.ok(!validateVersion('1.0').valid);
    assert.ok(!validateVersion('v1.0.0').valid);
    assert.ok(!validateVersion('1.0.0-beta').valid);
  });
});

describe('compareSemver', () => {
  it('compares correctly', () => {
    assert.equal(compareSemver('1.0.0', '0.9.9'), 1);
    assert.equal(compareSemver('0.9.9', '1.0.0'), -1);
    assert.equal(compareSemver('1.2.3', '1.2.3'), 0);
    assert.equal(compareSemver('1.2.4', '1.2.3'), 1);
    assert.equal(compareSemver('2.0.0', '1.99.99'), 1);
  });
});

describe('validateArtifact', () => {
  it('validates style artifacts', () => {
    const valid = `export const myStyle = { id: 'my-style', name: 'My Style', seed: { hue: 200 } };`;
    assert.ok(validateArtifact('style', valid).valid);

    const invalid = `const x = 1;`;
    assert.ok(!validateArtifact('style', invalid).valid);
  });

  it('validates recipe artifacts', () => {
    const valid = JSON.stringify({ id: 'r', name: 'R', style: 's', decorators: {} });
    assert.ok(validateArtifact('recipe', valid).valid);

    assert.ok(!validateArtifact('recipe', 'not json').valid);
    assert.ok(!validateArtifact('recipe', '{}').valid);
  });

  it('validates pattern artifacts', () => {
    const valid = JSON.stringify({ id: 'p', name: 'P', default_blend: {}, components: [] });
    assert.ok(validateArtifact('pattern', valid).valid);
  });

  it('validates archetype artifacts', () => {
    const valid = JSON.stringify({ id: 'a', name: 'A', pages: [{ id: 'home' }] });
    assert.ok(validateArtifact('archetype', valid).valid);

    const noPages = JSON.stringify({ id: 'a', name: 'A' });
    assert.ok(!validateArtifact('archetype', noPages).valid);
  });

  it('validates plugin artifacts', () => {
    assert.ok(validateArtifact('plugin', 'export function init() {}').valid);
    assert.ok(!validateArtifact('plugin', 'function init() {}').valid);
  });

  it('rejects oversized artifacts', () => {
    const big = 'x'.repeat(11 * 1024);
    assert.ok(!validateArtifact('style', big).valid);
  });

  it('rejects empty content', () => {
    assert.ok(!validateArtifact('style', '').valid);
    assert.ok(!validateArtifact('style', null).valid);
  });
});

describe('safetyScan', () => {
  it('rejects dangerous patterns', () => {
    assert.ok(!safetyScan('eval("code")').safe);
    assert.ok(!safetyScan('new Function("x")').safe);
    assert.ok(!safetyScan('document.cookie').safe);
  });

  it('allows safe code', () => {
    assert.ok(safetyScan('export const x = 1;').safe);
  });
});

describe('validateForPublish', () => {
  it('performs full validation', () => {
    const content = `export const test = { id: 'test', name: 'Test', seed: { hue: 0 } };`;
    const result = validateForPublish('style', 'test-style', '1.0.0', content);
    assert.ok(result.valid);
  });

  it('rejects when version not greater than latest', () => {
    const content = `export const test = { id: 'test', name: 'Test', seed: { hue: 0 } };`;
    const result = validateForPublish('style', 'test-style', '1.0.0', content, '1.0.0');
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('must be greater')));
  });

  it('rejects invalid type', () => {
    const result = validateForPublish('widget', 'x', '1.0.0', 'content');
    assert.ok(!result.valid);
  });
});
