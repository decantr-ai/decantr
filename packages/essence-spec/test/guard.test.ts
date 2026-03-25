import { describe, it, expect } from 'vitest';
import { evaluateGuard } from '../src/guard.js';
import type { Essence } from '../src/types.js';

function makeEssence(overrides: Partial<Essence> = {}): Essence {
  return {
    version: '2.0.0',
    archetype: 'saas-dashboard',
    theme: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism', shape: 'rounded' },
    character: ['professional'],
    platform: { type: 'spa', routing: 'hash' },
    structure: [
      { id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid'] },
      { id: 'users', shell: 'sidebar-main', layout: ['data-table'] },
    ],
    features: ['auth'],
    density: { level: 'comfortable', content_gap: '4' },
    guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' },
    target: 'react',
    ...overrides,
  };
}

describe('evaluateGuard', () => {
  it('returns no violations for valid changes in creative mode', () => {
    const essence = makeEssence({ guard: { mode: 'creative' } });
    const violations = evaluateGuard(essence, { pageId: 'new-page', style: 'glassmorphism' });
    expect(violations).toEqual([]);
  });

  it('flags style mismatch in strict mode', () => {
    const essence = makeEssence();
    const violations = evaluateGuard(essence, { style: 'glassmorphism' });
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'style', message: expect.stringContaining('glassmorphism') }),
    ]);
  });

  it('flags unknown page in strict mode', () => {
    const essence = makeEssence();
    const violations = evaluateGuard(essence, { pageId: 'settings' });
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'structure', message: expect.stringContaining('settings') }),
    ]);
  });

  it('allows known page in strict mode', () => {
    const essence = makeEssence();
    const violations = evaluateGuard(essence, { pageId: 'overview' });
    expect(violations).toEqual([]);
  });

  it('flags layout deviation in strict mode', () => {
    const essence = makeEssence();
    const violations = evaluateGuard(essence, { pageId: 'overview', layout: ['hero', 'card-grid'] });
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'layout', message: expect.stringContaining('overview') }),
    ]);
  });

  it('allows layout deviation in guided mode', () => {
    const essence = makeEssence({ guard: { mode: 'guided' } });
    const violations = evaluateGuard(essence, { pageId: 'overview', layout: ['hero', 'card-grid'] });
    expect(violations).toEqual([]);
  });

  it('flags recipe mismatch when enforce_recipe is true', () => {
    const essence = makeEssence();
    const violations = evaluateGuard(essence, { recipe: 'dopamine' });
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'recipe' }),
    ]);
  });

  it('flags density mismatch in strict mode', () => {
    const essence = makeEssence();
    const violations = evaluateGuard(essence, { density_gap: '8' });
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'density' }),
    ]);
  });
});
