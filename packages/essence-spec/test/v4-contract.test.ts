import { describe, expect, it } from 'vitest';
import {
  evaluateGuard,
  isLegacyV3,
  isSectioned,
  isSimple,
  isV4,
  migrateToV4,
  normalizeEssence,
  validateEssence,
  validateLegacyEssenceForMigration,
} from '../src/index.js';
import { VALID_V2_SECTIONED, VALID_V2_SIMPLE, VALID_V3, VALID_V4, VALID_V31 } from './fixtures.js';

describe('Essence v4 active contract', () => {
  it('accepts canonical v4 documents', () => {
    const result = validateEssence(VALID_V4);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(isV4(VALID_V4)).toBe(true);
  });

  it('rejects legacy documents outside migration', () => {
    for (const legacy of [VALID_V2_SIMPLE, VALID_V2_SECTIONED, VALID_V3, VALID_V31]) {
      const result = validateEssence(legacy);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('decantr migrate --to v4');
    }
  });

  it('keeps legacy detection available for migration only', () => {
    expect(isSimple(VALID_V2_SIMPLE)).toBe(true);
    expect(isSectioned(VALID_V2_SECTIONED)).toBe(true);
    expect(isLegacyV3(VALID_V3)).toBe(true);
    expect(isLegacyV3(VALID_V31)).toBe(true);
  });

  it('normalizes only active v4 documents', () => {
    expect(normalizeEssence(VALID_V4 as unknown as Record<string, unknown>)).toBe(VALID_V4);
    expect(() => normalizeEssence(VALID_V3 as unknown as Record<string, unknown>)).toThrow(
      /migrate --to v4/,
    );
  });

  it('allows legacy validation through the migrator entrypoint', () => {
    for (const legacy of [VALID_V2_SIMPLE, VALID_V2_SECTIONED, VALID_V3, VALID_V31]) {
      expect(validateLegacyEssenceForMigration(legacy).valid).toBe(true);
    }
  });
});

describe('migrateToV4', () => {
  it('converts simple v2 to sectioned v4', () => {
    const migrated = migrateToV4(VALID_V2_SIMPLE);
    expect(migrated.version).toBe('4.0.0');
    expect(migrated.blueprint.sections).toHaveLength(1);
    expect(migrated.blueprint.sections[0].pages[0].id).toBe('overview');
    expect(migrated.blueprint.routes?.['/']).toEqual({
      section: 'saas-dashboard',
      page: 'overview',
    });
    expect(validateEssence(migrated).valid).toBe(true);
  });

  it('converts sectioned v2 to sectioned v4', () => {
    const migrated = migrateToV4(VALID_V2_SECTIONED);
    expect(migrated.version).toBe('4.0.0');
    expect(migrated.blueprint.sections[0].id).toBe('brand');
    expect(migrated.blueprint.features).toEqual(['analytics', 'lead-capture']);
    expect(validateEssence(migrated).valid).toBe(true);
  });

  it('wraps flat v3 pages into a v4 section', () => {
    const migrated = migrateToV4(VALID_V3);
    expect(migrated.version).toBe('4.0.0');
    expect(migrated.blueprint.sections).toHaveLength(1);
    expect(migrated.blueprint.sections[0].pages.map((page) => page.id)).toEqual(['main', 'news']);
    expect(migrated.blueprint.pages).toBeUndefined();
    expect(validateEssence(migrated).valid).toBe(true);
  });

  it('normalizes v3.1 sectioned documents to v4', () => {
    const migrated = migrateToV4(VALID_V31);
    expect(migrated.version).toBe('4.0.0');
    expect(migrated.blueprint.sections[0].id).toBe('dashboard');
    expect(validateEssence(migrated).valid).toBe(true);
  });
});

describe('evaluateGuard', () => {
  it('reports DNA and blueprint layer metadata for v4', () => {
    const violations = evaluateGuard(VALID_V4, {
      theme: 'other-theme',
      pageId: 'missing-page',
    });
    expect(violations.some((violation) => violation.layer === 'dna')).toBe(true);
    expect(violations.some((violation) => violation.layer === 'blueprint')).toBe(true);
  });

  it('checks pattern existence against sectioned layouts', () => {
    const violations = evaluateGuard(VALID_V4, {
      patternRegistry: new Map([
        ['kpi-grid', {}],
        ['settings-form', {}],
      ]),
    });
    expect(violations.map((violation) => violation.rule)).toContain('pattern-exists');
  });
});
