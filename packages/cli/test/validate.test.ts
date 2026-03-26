import { describe, it, expect } from 'vitest';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';
import type { Essence } from '@decantr/essence-spec';

function makeValidEssence(overrides: Partial<Essence> = {}): Essence {
  return {
    version: '2.0.0',
    archetype: 'saas-dashboard',
    theme: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism' },
    character: ['professional'],
    platform: { type: 'spa', routing: 'hash' },
    structure: [{ id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid'] }],
    features: [],
    density: { level: 'comfortable', content_gap: '_gap4' },
    guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' },
    target: 'react',
    ...overrides,
  };
}

describe('validate command', () => {
  it('should validate a minimal valid essence file', () => {
    const essence = makeValidEssence();
    const result = validateEssence(essence);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject essence with invalid mode', () => {
    const essence = makeValidEssence({
      theme: { style: 'auradecantism', mode: 'invalid' as any, recipe: 'auradecantism' },
    });
    const result = validateEssence(essence);
    expect(result.valid).toBe(false);
  });

  it('should reject essence missing required fields', () => {
    const result = validateEssence({ version: '2.0.0' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should evaluate guard rules without violations for empty context', () => {
    const essence = makeValidEssence();
    const violations = evaluateGuard(essence, {});
    expect(violations).toEqual([]);
  });

  it('should detect style guard violation', () => {
    const essence = makeValidEssence();
    const violations = evaluateGuard(essence, { style: 'glassmorphism' });
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].rule).toBe('style');
  });

  it('should detect structure guard violation for unknown page', () => {
    const essence = makeValidEssence();
    const violations = evaluateGuard(essence, { pageId: 'nonexistent-page' });
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].rule).toBe('structure');
  });
});
