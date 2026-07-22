import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalJson, sha256Canonical } from './canonical.mjs';

test('canonical JSON sorts object keys without reordering arrays', () => {
  const value = { z: [{ b: 2, a: 1 }], a: -0 };
  assert.equal(canonicalJson(value), '{"a":0,"z":[{"a":1,"b":2}]}');
  assert.equal(sha256Canonical(value), sha256Canonical({ a: 0, z: [{ a: 1, b: 2 }] }));
});

test('canonical JSON rejects values JSON cannot bind faithfully', () => {
  assert.throws(() => canonicalJson({ value: undefined }), /Undefined value/u);
  assert.throws(() => canonicalJson({ value: Number.NaN }), /Non-finite number/u);
  assert.throws(() => canonicalJson({ value: 1n }), /Unsupported canonical JSON value/u);
});
