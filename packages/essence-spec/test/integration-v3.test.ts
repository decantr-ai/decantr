/**
 * Integration test: v3 essence through the full essence-spec lifecycle
 * normalize → validate → guard → migrate (round-trip)
 */
import { describe, it, expect } from 'vitest';
import { normalizeEssence } from '../src/normalize.js';
import { validateEssence } from '../src/validate.js';
import { evaluateGuard } from '../src/guard.js';
import { migrateV2ToV3 } from '../src/migrate.js';
import { isV3, isSimple } from '../src/types.js';
import { VALID_V3, VALID_V31, VALID_V2_SIMPLE, VALID_V2_SECTIONED } from './fixtures.js';

describe('v3 integration: full lifecycle', () => {
  it('v3 document passes through normalize → validate → guard without corruption', () => {
    // Step 1: Normalize (should pass through unchanged)
    const normalized = normalizeEssence(VALID_V3 as unknown as Record<string, unknown>);
    expect(isV3(normalized)).toBe(true);
    expect(normalized).toEqual(VALID_V3);

    // Step 2: Validate against v3 schema
    const validation = validateEssence(normalized);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);

    // Step 3: Guard evaluation reads from correct paths
    if (!isV3(normalized)) throw new Error('Expected v3');
    const violations = evaluateGuard(normalized, {
      theme: 'luminarum',  // matches dna.theme.id
      pageId: 'main',      // exists in blueprint.pages
    });
    expect(violations.filter(v => v.rule === 'theme')).toHaveLength(0);
    expect(violations.filter(v => v.rule === 'structure')).toHaveLength(0);
  });

  it('v2 simple → migrate → validate → guard produces consistent results', () => {
    // Step 1: Migrate v2 to v3
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(isV3(v3)).toBe(true);
    expect(v3.version).toBe('3.0.0');

    // Step 2: Validate the migrated document
    const validation = validateEssence(v3);
    expect(validation.valid).toBe(true);

    // Step 3: Guard should work the same as with v2
    const v2Violations = evaluateGuard(VALID_V2_SIMPLE, {
      theme: 'glassmorphism', // wrong theme
      pageId: 'overview',     // exists
    });
    const v3Violations = evaluateGuard(v3, {
      theme: 'glassmorphism', // wrong theme
      pageId: 'overview',     // exists in blueprint.pages
    });

    // Both should flag theme mismatch
    expect(v2Violations.some(v => v.rule === 'theme')).toBe(true);
    expect(v3Violations.some(v => v.rule === 'theme')).toBe(true);

    // v3 violation should have layer metadata
    const v3Theme = v3Violations.find(v => v.rule === 'theme');
    expect(v3Theme!.layer).toBe('dna');
  });

  it('v2 sectioned → migrate → validate succeeds', () => {
    const v3 = migrateV2ToV3(VALID_V2_SECTIONED);
    expect(isV3(v3)).toBe(true);

    const validation = validateEssence(v3);
    expect(validation.valid).toBe(true);

    // Sectioned pages should be flattened into blueprint
    expect(v3.blueprint.pages.length).toBeGreaterThan(0);
  });

  it('v3 guard correctly classifies DNA vs Blueprint violations', () => {
    const violations = evaluateGuard(VALID_V3, {
      theme: 'wrong-theme',       // DNA violation
      pageId: 'nonexistent-page', // Blueprint violation
    });

    const dnaViolations = violations.filter(v => v.layer === 'dna');
    const blueprintViolations = violations.filter(v => v.layer === 'blueprint');

    expect(dnaViolations.length).toBeGreaterThan(0);
    expect(blueprintViolations.length).toBeGreaterThan(0);

    // DNA violations are errors
    expect(dnaViolations.every(v => v.severity === 'error')).toBe(true);
    // Blueprint violations are warnings for v3
    expect(blueprintViolations.every(v => v.severity === 'warning')).toBe(true);
  });

  it('v3.1 sectioned documents validate and flatten correctly for guard evaluation', () => {
    const validation = validateEssence(VALID_V31);
    expect(validation.valid).toBe(true);

    const violations = evaluateGuard(VALID_V31, {
      theme: 'luminarum',
      pageId: 'settings',
    });

    expect(violations.filter(v => v.rule === 'theme')).toHaveLength(0);
    expect(violations.filter(v => v.rule === 'structure')).toHaveLength(0);
  });

  it('normalize does NOT use structural fallback for v3 detection', () => {
    // A doc with dna+blueprint keys but version 2.0.0 should NOT be treated as v3
    const trickDoc = {
      version: '2.0.0',
      archetype: 'test',
      theme: { id: 'clean', mode: 'dark' },
      personality: ['minimal'],
      platform: { type: 'spa', routing: 'hash' },
      structure: [{ id: 'home', shell: 'full-bleed', layout: ['hero'] }],
      features: [],
      density: { level: 'comfortable', content_gap: '4' },
      guard: { mode: 'creative' },
      target: 'react',
      dna: { some: 'value' },
      blueprint: { some: 'value' },
    };
    const result = normalizeEssence(trickDoc as unknown as Record<string, unknown>);
    expect(isV3(result)).toBe(false);
    // Should be detected as v2 (has theme + platform)
    expect(isSimple(result)).toBe(true);
  });

  it('migrateV2ToV3 is idempotent on v3 input', () => {
    const result = migrateV2ToV3(VALID_V3);
    expect(result).toEqual(VALID_V3);
  });

  it('v3 dna_overrides only allow density and mode (schema enforced)', () => {
    const withBadOverride = {
      ...VALID_V3,
      blueprint: {
        ...VALID_V3.blueprint,
        pages: [{
          id: 'main',
          layout: ['hero'],
          dna_overrides: { wcag_level: 'A', density: 'spacious' },
        }],
      },
    };
    const validation = validateEssence(withBadOverride);
    expect(validation.valid).toBe(false);

    // But valid overrides should work
    const withGoodOverride = {
      ...VALID_V3,
      blueprint: {
        ...VALID_V3.blueprint,
        pages: [{
          id: 'main',
          layout: ['hero'],
          dna_overrides: { density: 'spacious', mode: 'light' },
        }],
      },
    };
    const validation2 = validateEssence(withGoodOverride);
    expect(validation2.valid).toBe(true);
  });
});
