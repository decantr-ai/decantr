import { describe, expect, it } from 'vitest';
import { validateEssence } from '../src/validate.js';
import { VALID_V2_SECTIONED, VALID_V2_SIMPLE, VALID_V3, VALID_V31 } from './fixtures.js';

describe('validateEssence - v3', () => {
  it('accepts a valid v3 document', () => {
    const result = validateEssence(VALID_V3);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts a valid v3.1.0 document', () => {
    const result = validateEssence(VALID_V31);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts optional v3.1 seo and navigation metadata', () => {
    const result = validateEssence({
      ...VALID_V31,
      meta: {
        ...VALID_V31.meta,
        seo: {
          schema_org: ['WebApplication', 'SoftwareApplication'],
          meta_priorities: ['description', 'twitter:card'],
        },
        navigation: {
          command_palette: true,
          hotkeys: [
            { key: 'g d', label: 'Dashboard', route: '/dashboard' },
            { key: 'g ?', label: 'Help', action: 'open-help' },
          ],
        },
      },
    });
    expect(result.valid).toBe(true);
  });

  it('accepts optional dna.constraints metadata', () => {
    const result = validateEssence({
      ...VALID_V31,
      dna: {
        ...VALID_V31.dna,
        constraints: {
          mode: 'dark_only',
          typography: 'monospace_only',
          borders: 'ascii_box_drawing',
          corners: 'sharp_only',
          shadows: 'none',
          effects: {
            glow: 'optional',
            scanlines: 'optional',
          },
        },
      },
    });
    expect(result.valid).toBe(true);
  });

  it('rejects v3 with missing dna', () => {
    const { dna, ...noData } = VALID_V3;
    const result = validateEssence(noData);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('dna'))).toBe(true);
  });

  it('rejects v3 with missing blueprint', () => {
    const { blueprint, ...noBlueprint } = VALID_V3;
    const result = validateEssence(noBlueprint);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('blueprint'))).toBe(true);
  });

  it('rejects v3 with missing meta', () => {
    const { meta, ...noMeta } = VALID_V3;
    const result = validateEssence(noMeta);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('meta'))).toBe(true);
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
        pages: [
          {
            ...VALID_V3.blueprint.pages[0],
            dna_overrides: { wcag_level: 'A' },
          },
        ],
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

  it('rejects v3.1 with empty sections array', () => {
    const bad = {
      ...VALID_V31,
      blueprint: { ...VALID_V31.blueprint, sections: [] },
    };
    const result = validateEssence(bad);
    expect(result.valid).toBe(false);
  });

  it('rejects v3.1 navigation hotkeys without key and label', () => {
    const bad = {
      ...VALID_V31,
      meta: {
        ...VALID_V31.meta,
        navigation: {
          command_palette: true,
          hotkeys: [{ route: '/dashboard' }],
        },
      },
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

  it('rejects v3.1 with invalid section role', () => {
    const bad = {
      ...VALID_V31,
      blueprint: {
        ...VALID_V31.blueprint,
        sections: [
          {
            ...VALID_V31.blueprint.sections![0],
            role: 'secondary',
          },
        ],
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
