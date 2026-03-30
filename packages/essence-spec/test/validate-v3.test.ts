import { describe, it, expect } from 'vitest';
import { validateEssence } from '../src/validate.js';
import { VALID_V3, VALID_V2_SIMPLE, VALID_V2_SECTIONED } from './fixtures.js';

describe('validateEssence - v3', () => {
  it('accepts a valid v3 document', () => {
    const result = validateEssence(VALID_V3);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects v3 with missing dna', () => {
    const { dna, ...noData } = VALID_V3;
    const result = validateEssence(noData);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('dna'))).toBe(true);
  });

  it('rejects v3 with missing blueprint', () => {
    const { blueprint, ...noBlueprint } = VALID_V3;
    const result = validateEssence(noBlueprint);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('blueprint'))).toBe(true);
  });

  it('rejects v3 with missing meta', () => {
    const { meta, ...noMeta } = VALID_V3;
    const result = validateEssence(noMeta);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('meta'))).toBe(true);
  });

  it('rejects v3 with invalid dna.theme.mode', () => {
    const bad = {
      ...VALID_V3,
      dna: {
        ...VALID_V3.dna,
        theme: { ...VALID_V3.dna.theme, mode: 'neon' },
      },
    };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('rejects v3 with invalid guard mode', () => {
    const bad = {
      ...VALID_V3,
      meta: {
        ...VALID_V3.meta,
        guard: { ...VALID_V3.meta.guard, mode: 'ultra' },
      },
    };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('rejects disallowed fields in dna_overrides', () => {
    const bad = {
      ...VALID_V3,
      blueprint: {
        ...VALID_V3.blueprint,
        pages: [{
          ...VALID_V3.blueprint.pages[0],
          dna_overrides: { wcag_level: 'A' },
        }],
      },
    };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('accepts valid dna_overrides with density and mode', () => {
    const good = {
      ...VALID_V3,
      blueprint: {
        ...VALID_V3.blueprint,
        pages: [
          {
            ...VALID_V3.blueprint.pages[0],
            dna_overrides: { density: 'spacious', mode: 'light' },
          },
          VALID_V3.blueprint.pages[1],
        ],
      },
    };
    const result = validateEssence(good);
    expect(result.valid).toBe(true);
  });

  it('rejects v3 with empty pages array', () => {
    const bad = {
      ...VALID_V3,
      blueprint: { ...VALID_V3.blueprint, pages: [] },
    };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('rejects v3 with invalid page id format', () => {
    const bad = {
      ...VALID_V3,
      blueprint: {
        ...VALID_V3.blueprint,
        pages: [{ id: 'My Page', layout: ['hero'] }],
      },
    };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });
});

describe('validateEssence - v2 still works', () => {
  it('accepts valid v2 simple documents', () => {
    const result = validateEssence(VALID_V2_SIMPLE);
    expect(result.valid).toBe(true);
  });

  it('accepts valid v2 sectioned documents', () => {
    const result = validateEssence(VALID_V2_SECTIONED);
    expect(result.valid).toBe(true);
  });

  it('rejects invalid v2 documents', () => {
    const result = validateEssence({ version: '2.0.0' });
    expect(result.valid).toBe(false);
  });
});
