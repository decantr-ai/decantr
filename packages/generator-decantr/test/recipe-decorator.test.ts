import { describe, it, expect } from 'vitest';
import {
  resolvePatternDecorations,
  resolveShellDecorations,
  toIRVisualEffect,
  emitRecipeDecorationHelper,
} from '../src/recipe-decorator.js';
import type { VisualEffectsConfig } from '../src/recipe-decorator.js';

// AUTO: Mirrors auradecantism recipe visual_effects for testing
const auradecantismEffects: VisualEffectsConfig = {
  enabled: true,
  intensity: 'medium',
  type_mapping: {
    code_preview: ['d-terminal-chrome'],
    stat_display: ['d-glow-primary', 'd-stat-glow'],
    feature_card: ['d-glass', 'd-gradient-hint-primary'],
    icon_container: ['d-icon-glow'],
  },
  component_fallback: {
    pre: 'code_preview',
    code: 'code_preview',
    Statistic: 'stat_display',
    Card: 'feature_card',
  },
  intensity_values: {
    subtle: {
      '--d-glow-radius': '15px',
      '--d-glow-intensity': '0.15',
      '--d-gradient-hint-opacity': '0.04',
    },
    medium: {
      '--d-glow-radius': '30px',
      '--d-glow-intensity': '0.3',
      '--d-gradient-hint-opacity': '0.08',
    },
    strong: {
      '--d-glow-radius': '50px',
      '--d-glow-intensity': '0.5',
      '--d-gradient-hint-opacity': '0.12',
    },
  },
};

const patternOverrides: Record<string, { background?: string[] }> = {
  'kpi-grid': { background: ['_bg[surface2]', 'd-glass'] },
  'chart-grid': { background: ['_bg[surface1]'] },
};

describe('resolvePatternDecorations', () => {
  it('resolves d-glass and d-gradient-hint-primary for Card component', () => {
    const result = resolvePatternDecorations(
      'some-pattern',
      ['Card'],
      auradecantismEffects,
      null,
    );

    expect(result.cardClasses).toContain('d-glass');
    expect(result.cardClasses).toContain('d-gradient-hint-primary');
  });

  it('resolves d-glow-primary for Statistic component', () => {
    const result = resolvePatternDecorations(
      'kpi-grid',
      ['Statistic'],
      auradecantismEffects,
      null,
    );

    expect(result.cardClasses).toContain('d-glow-primary');
    expect(result.cardClasses).toContain('d-stat-glow');
  });

  it('applies pattern_overrides background classes', () => {
    const result = resolvePatternDecorations(
      'kpi-grid',
      [],
      auradecantismEffects,
      patternOverrides,
    );

    expect(result.backgroundClasses).toContain('_bg[surface2]');
    expect(result.backgroundClasses).toContain('d-glass');
  });

  it('resolves intensity CSS variables for medium level', () => {
    const result = resolvePatternDecorations(
      'some-pattern',
      ['Card'],
      auradecantismEffects,
      null,
    );

    expect(result.intensityVars['--d-glow-radius']).toBe('30px');
    expect(result.intensityVars['--d-glow-intensity']).toBe('0.3');
    expect(result.intensityVars['--d-gradient-hint-opacity']).toBe('0.08');
  });

  it('returns empty when visual_effects is disabled', () => {
    const disabled = { ...auradecantismEffects, enabled: false };
    const result = resolvePatternDecorations('kpi-grid', ['Card'], disabled, patternOverrides);

    expect(result.cardClasses).toHaveLength(0);
    expect(result.backgroundClasses).toHaveLength(0);
    expect(result.intensityVars).toEqual({});
  });

  it('returns empty when visual_effects is null (missing recipe)', () => {
    const result = resolvePatternDecorations('kpi-grid', ['Card'], null, null);

    expect(result.cardClasses).toHaveLength(0);
    expect(result.backgroundClasses).toHaveLength(0);
  });

  it('deduplicates type lookups for multiple components mapping to same type', () => {
    const result = resolvePatternDecorations(
      'code-block',
      ['pre', 'code'],
      auradecantismEffects,
      null,
    );

    // Both pre and code map to code_preview → d-terminal-chrome
    // Should only appear once
    expect(result.cardClasses).toEqual(['d-terminal-chrome']);
  });

  it('handles unknown components gracefully', () => {
    const result = resolvePatternDecorations(
      'some-pattern',
      ['UnknownComponent'],
      auradecantismEffects,
      null,
    );

    expect(result.cardClasses).toHaveLength(0);
  });

  it('combines component decorators and pattern override background', () => {
    const result = resolvePatternDecorations(
      'kpi-grid',
      ['Statistic'],
      auradecantismEffects,
      patternOverrides,
    );

    expect(result.cardClasses).toContain('d-glow-primary');
    expect(result.backgroundClasses).toContain('_bg[surface2]');
  });
});

describe('resolveShellDecorations', () => {
  it('resolves carafe shell classes', () => {
    const result = resolveShellDecorations({
      root: 'd-mesh',
      nav: 'd-glass',
      header: '',
      brand: 'd-gradient-text',
    });

    expect(result.root).toBe('d-mesh');
    expect(result.nav).toBe('d-glass');
    expect(result.header).toBe('');
    expect(result.brand).toBe('d-gradient-text');
  });

  it('returns empty strings when carafe is null', () => {
    const result = resolveShellDecorations(null);

    expect(result.root).toBe('');
    expect(result.nav).toBe('');
    expect(result.header).toBe('');
    expect(result.brand).toBe('');
  });

  it('handles partial carafe with missing fields', () => {
    const result = resolveShellDecorations({ root: 'd-mesh' });

    expect(result.root).toBe('d-mesh');
    expect(result.nav).toBe('');
  });
});

describe('toIRVisualEffect', () => {
  it('merges card and background classes into decorators', () => {
    const effect = toIRVisualEffect({
      cardClasses: ['d-glass', 'd-gradient-hint-primary'],
      backgroundClasses: ['_bg[surface2]'],
      intensityVars: { '--d-glow-radius': '30px' },
    });

    expect(effect).not.toBeNull();
    expect(effect!.decorators).toEqual(['d-glass', 'd-gradient-hint-primary', '_bg[surface2]']);
    expect(effect!.intensity['--d-glow-radius']).toBe('30px');
  });

  it('returns null when no decorators and no intensity vars', () => {
    const effect = toIRVisualEffect({
      cardClasses: [],
      backgroundClasses: [],
      intensityVars: {},
    });

    expect(effect).toBeNull();
  });
});

describe('emitRecipeDecorationHelper', () => {
  it('emits a getRecipeDecoration function', () => {
    const code = emitRecipeDecorationHelper(auradecantismEffects, patternOverrides);

    expect(code).toContain('function getRecipeDecoration(');
    expect(code).toContain('typeMapping');
    expect(code).toContain('fallback');
    expect(code).toContain('d-glass');
    expect(code).toContain('d-glow-primary');
  });

  it('includes pattern overrides data', () => {
    const code = emitRecipeDecorationHelper(auradecantismEffects, patternOverrides);

    expect(code).toContain('kpi-grid');
    expect(code).toContain('_bg[surface2]');
  });

  it('includes intensity variables for active level', () => {
    const code = emitRecipeDecorationHelper(auradecantismEffects, null);

    expect(code).toContain('--d-glow-radius');
    expect(code).toContain('30px');
  });

  it('returns empty string when effects are disabled', () => {
    const disabled = { ...auradecantismEffects, enabled: false };
    const code = emitRecipeDecorationHelper(disabled, null);

    expect(code).toBe('');
  });

  it('returns empty string when effects are null', () => {
    const code = emitRecipeDecorationHelper(null, null);

    expect(code).toBe('');
  });
});
