import { describe, expect, it } from 'vitest';
import { isSectioned, isSimple, isV3 } from '../src/types.js';
import { VALID_V2_SECTIONED, VALID_V2_SIMPLE, VALID_V3 } from './fixtures.js';

describe('isV3', () => {
  it('returns true for v3 documents', () => {
    expect(isV3(VALID_V3)).toBe(true);
  });

  it('returns false for v2 simple documents', () => {
    expect(isV3(VALID_V2_SIMPLE)).toBe(false);
  });

  it('returns false for v2 sectioned documents', () => {
    expect(isV3(VALID_V2_SECTIONED)).toBe(false);
  });
});

describe('isSimple', () => {
  it('returns true for v2 simple documents', () => {
    expect(isSimple(VALID_V2_SIMPLE)).toBe(true);
  });

  it('returns false for v2 sectioned documents', () => {
    expect(isSimple(VALID_V2_SECTIONED)).toBe(false);
  });

  it('returns false for v3 documents', () => {
    expect(isSimple(VALID_V3)).toBe(false);
  });
});

describe('isSectioned', () => {
  it('returns true for v2 sectioned documents', () => {
    expect(isSectioned(VALID_V2_SECTIONED)).toBe(true);
  });

  it('returns false for v2 simple documents', () => {
    expect(isSectioned(VALID_V2_SIMPLE)).toBe(false);
  });

  it('returns false for v3 documents', () => {
    expect(isSectioned(VALID_V3)).toBe(false);
  });
});
