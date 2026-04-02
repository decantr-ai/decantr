import { describe, it, expect } from 'vitest';
import { normalizeEssence } from '../src/normalize.js';
import { isV3, isSimple, isSectioned } from '../src/types.js';
import { VALID_V3, VALID_V2_SIMPLE } from './fixtures.js';

describe('normalizeEssence - v3 handling', () => {
  it('passes through v3 documents unchanged', () => {
    const result = normalizeEssence(VALID_V3 as unknown as Record<string, unknown>);
    expect(result).toEqual(VALID_V3);
    expect(isV3(result)).toBe(true);
  });

  it('preserves all v3 DNA fields', () => {
    const result = normalizeEssence(VALID_V3 as unknown as Record<string, unknown>);
    expect(isV3(result) && result.dna.theme.id).toBe('luminarum');
    expect(isV3(result) && result.dna.accessibility.wcag_level).toBe('AA');
    expect(isV3(result) && result.dna.spacing.density).toBe('comfortable');
  });

  it('preserves all v3 blueprint fields', () => {
    const result = normalizeEssence(VALID_V3 as unknown as Record<string, unknown>);
    expect(isV3(result) && result.blueprint.pages).toHaveLength(2);
    expect(isV3(result) && result.blueprint.shell).toBe('sidebar-main');
  });

  it('preserves v3 meta fields', () => {
    const result = normalizeEssence(VALID_V3 as unknown as Record<string, unknown>);
    expect(isV3(result) && result.meta.archetype).toBe('gaming-community');
    expect(isV3(result) && result.meta.guard.mode).toBe('strict');
  });

  it('does not corrupt v3 by treating it as v1', () => {
    // v3 has no top-level theme/platform, so without the version check
    // it would fall through to the v1 normalizer and be corrupted
    const result = normalizeEssence(VALID_V3 as unknown as Record<string, unknown>);
    expect(result.version).toBe('3.0.0');
    expect('dna' in result).toBe(true);
    expect('blueprint' in result).toBe(true);
  });

  it('still normalizes v2 documents correctly', () => {
    const result = normalizeEssence(VALID_V2_SIMPLE as unknown as Record<string, unknown>);
    expect(result).toEqual(VALID_V2_SIMPLE);
    expect(isSimple(result)).toBe(true);
  });

  it('still normalizes v1 documents correctly', () => {
    const v1 = {
      version: '1.0.0',
      terroir: 'portfolio',
      vintage: { style: 'clean', mode: 'light' },
      character: ['minimal'],
      vessel: { type: 'spa', routing: 'hash' },
      structure: [{ id: 'home', carafe: 'full-bleed', blend: ['hero'] }],
      tannins: ['auth'],
      clarity: { density: 'compact', content_gap: '_gap3' },
      cork: { mode: 'guided' },
    };
    const result = normalizeEssence(v1);
    expect(result.version).toBe('2.0.0');
    expect(isSimple(result)).toBe(true);
    expect(isV3(result)).toBe(false);
  });

  it('does not use structural fallback for v3 detection', () => {
    // A v2 document that happens to have dna and blueprint keys should NOT be treated as v3
    const trickDoc = {
      ...VALID_V2_SIMPLE,
      dna: { some: 'value' },
      blueprint: { some: 'value' },
    } as unknown as Record<string, unknown>;
    const result = normalizeEssence(trickDoc);
    // Should be treated as v2 (has theme + platform), not v3
    expect(isV3(result)).toBe(false);
  });
});
