import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { satisfies, maxSatisfying, compareSemver, parseRange } from '../../src/services/semver.js';

describe('semver', () => {
  describe('satisfies', () => {
    it('caret range ^1.0.0 matches 1.x.x', () => {
      assert.ok(satisfies('1.2.3', '^1.0.0'));
      assert.ok(satisfies('1.99.99', '^1.0.0'));
      assert.ok(!satisfies('2.0.0', '^1.0.0'));
      assert.ok(!satisfies('0.9.9', '^1.0.0'));
    });
    it('tilde range ~1.2.0 matches 1.2.x', () => {
      assert.ok(satisfies('1.2.5', '~1.2.0'));
      assert.ok(!satisfies('1.3.0', '~1.2.0'));
    });
    it('gte range >=2.0.0', () => {
      assert.ok(satisfies('2.0.0', '>=2.0.0'));
      assert.ok(satisfies('3.0.0', '>=2.0.0'));
      assert.ok(!satisfies('1.9.9', '>=2.0.0'));
    });
    it('exact version match', () => {
      assert.ok(satisfies('1.2.3', '1.2.3'));
      assert.ok(!satisfies('1.2.4', '1.2.3'));
    });
    it('wildcard * matches everything', () => {
      assert.ok(satisfies('1.0.0', '*'));
      assert.ok(satisfies('99.99.99', '*'));
    });
  });
  describe('maxSatisfying', () => {
    it('returns highest version satisfying range', () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0'];
      assert.equal(maxSatisfying(versions, '^1.0.0'), '1.2.0');
    });
    it('returns null when no version satisfies', () => {
      assert.equal(maxSatisfying(['1.0.0'], '^2.0.0'), null);
    });
  });
});
