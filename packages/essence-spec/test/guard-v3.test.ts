import { describe, it, expect } from 'vitest';
import { evaluateGuard } from '../src/guard.js';
import type { EssenceV3 } from '../src/types.js';
import { VALID_V3 } from './fixtures.js';

function makeV3(overrides: Record<string, unknown> = {}): EssenceV3 {
  return {
    ...VALID_V3,
    ...overrides,
    dna: { ...VALID_V3.dna, ...(overrides.dna as object ?? {}) },
    blueprint: { ...VALID_V3.blueprint, ...(overrides.blueprint as object ?? {}) },
    meta: { ...VALID_V3.meta, ...(overrides.meta as object ?? {}) },
  } as EssenceV3;
}

describe('evaluateGuard - v3 layer metadata', () => {
  it('style violation has layer=dna and autoFixable=false', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { style: 'glassmorphism' });
    const styleV = violations.find(v => v.rule === 'style');
    expect(styleV).toBeDefined();
    expect(styleV!.layer).toBe('dna');
    expect(styleV!.autoFixable).toBe(false);
  });

  it('structure violation has layer=blueprint and autoFixable=true', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { pageId: 'nonexistent' });
    const structV = violations.find(v => v.rule === 'structure');
    expect(structV).toBeDefined();
    expect(structV!.layer).toBe('blueprint');
    expect(structV!.autoFixable).toBe(true);
    expect(structV!.autoFix?.type).toBe('add_page');
  });

  it('structure violation is warning (not error) for v3', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { pageId: 'nonexistent' });
    const structV = violations.find(v => v.rule === 'structure');
    expect(structV!.severity).toBe('warning');
  });

  it('layout violation has layer=blueprint for v3', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { pageId: 'main', layout: ['wrong-order'] });
    const layoutV = violations.find(v => v.rule === 'layout');
    expect(layoutV).toBeDefined();
    expect(layoutV!.layer).toBe('blueprint');
    expect(layoutV!.autoFixable).toBe(true);
    expect(layoutV!.severity).toBe('warning');
  });

  it('recipe violation has layer=dna', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { recipe: 'dopamine' });
    const recipeV = violations.find(v => v.rule === 'recipe');
    expect(recipeV!.layer).toBe('dna');
  });

  it('density violation has layer=dna', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { density_gap: '99' });
    const densityV = violations.find(v => v.rule === 'density');
    expect(densityV!.layer).toBe('dna');
  });

  it('accessibility violation has layer=dna', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { a11y_issues: ['missing-alt'] });
    const a11yV = violations.find(v => v.rule === 'accessibility');
    expect(a11yV!.layer).toBe('dna');
  });

  it('pattern-exists violation has layer=blueprint for v3', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, {
      patternRegistry: new Map([['kpi-grid', {}]]),
    });
    // hero and top-players and post-list and filter-bar are not in the registry
    const patternVs = violations.filter(v => v.rule === 'pattern-exists');
    expect(patternVs.length).toBeGreaterThan(0);
    expect(patternVs.every(v => v.layer === 'blueprint')).toBe(true);
    expect(patternVs.every(v => v.severity === 'warning')).toBe(true);
  });
});

describe('evaluateGuard - v3 reads from correct paths', () => {
  it('reads style from dna.theme.style', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { style: 'luminarum' });
    expect(violations.filter(v => v.rule === 'style')).toHaveLength(0);
  });

  it('reads recipe from dna.theme.recipe', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { recipe: 'luminarum' });
    expect(violations.filter(v => v.rule === 'recipe')).toHaveLength(0);
  });

  it('reads pages from blueprint.pages', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { pageId: 'main' });
    expect(violations.filter(v => v.rule === 'structure')).toHaveLength(0);
  });

  it('reads density from dna.spacing.content_gap', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { density_gap: '_gap4' });
    expect(violations.filter(v => v.rule === 'density')).toHaveLength(0);
  });

  it('reads guard mode from meta.guard', () => {
    const creative = makeV3({
      meta: { ...VALID_V3.meta, guard: { mode: 'creative', dna_enforcement: 'off', blueprint_enforcement: 'off' } },
    });
    const violations = evaluateGuard(creative, { style: 'wrong', pageId: 'nonexistent' });
    expect(violations).toHaveLength(0);
  });

  it('reads wcag_level from dna.accessibility', () => {
    const v3 = makeV3();
    const violations = evaluateGuard(v3, { a11y_issues: ['missing-alt'] });
    expect(violations.some(v => v.rule === 'accessibility')).toBe(true);
  });
});

describe('evaluateGuard - v3 dna_overrides', () => {
  it('respects per-page density override', () => {
    const v3: EssenceV3 = {
      ...VALID_V3,
      blueprint: {
        ...VALID_V3.blueprint,
        pages: [
          {
            id: 'main',
            layout: ['hero'],
            dna_overrides: { density: 'spacious' },
          },
        ],
      },
    };
    // spacious maps to content_gap '6'
    const violations = evaluateGuard(v3, { pageId: 'main', density_gap: '6' });
    expect(violations.filter(v => v.rule === 'density')).toHaveLength(0);
  });

  it('falls back to dna.spacing when no page override', () => {
    const v3 = makeV3();
    // dna.spacing.content_gap is '_gap4', not '6'
    const violations = evaluateGuard(v3, { pageId: 'news', density_gap: '6' });
    expect(violations.some(v => v.rule === 'density')).toBe(true);
  });
});

describe('evaluateGuard - v2 backward compatibility', () => {
  it('v2 violations do not have layer metadata', () => {
    const v2 = {
      version: '2.0.0',
      archetype: 'test',
      theme: { style: 'clean', mode: 'dark' as const, recipe: 'clean' },
      personality: ['minimal'],
      platform: { type: 'spa' as const, routing: 'hash' as const },
      structure: [{ id: 'home', shell: 'full-bleed', layout: ['hero'] }],
      features: [],
      density: { level: 'comfortable' as const, content_gap: '4' },
      guard: { mode: 'strict' as const },
      target: 'react',
    };
    const violations = evaluateGuard(v2, { style: 'wrong' });
    const styleV = violations.find(v => v.rule === 'style');
    expect(styleV).toBeDefined();
    expect(styleV!.layer).toBeUndefined();
    expect(styleV!.autoFixable).toBeUndefined();
  });
});
