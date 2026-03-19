import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeChecksum, verifyChecksum } from '../../src/services/checksum.js';

describe('computeChecksum', () => {
  it('returns sha256-prefixed hash', () => {
    const result = computeChecksum('hello');
    assert.ok(result.startsWith('sha256:'));
    assert.equal(result.length, 7 + 64); // "sha256:" + 64 hex chars
  });

  it('produces consistent output', () => {
    assert.equal(computeChecksum('test'), computeChecksum('test'));
  });

  it('produces different output for different inputs', () => {
    assert.notEqual(computeChecksum('a'), computeChecksum('b'));
  });
});

describe('verifyChecksum', () => {
  it('returns true for matching content', () => {
    const checksum = computeChecksum('hello world');
    assert.ok(verifyChecksum('hello world', checksum));
  });

  it('returns false for mismatched content', () => {
    const checksum = computeChecksum('hello world');
    assert.ok(!verifyChecksum('goodbye world', checksum));
  });
});
