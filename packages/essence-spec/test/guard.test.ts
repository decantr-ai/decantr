import { describe, it, expect } from 'vitest';
import { evaluateGuard } from '../src/guard.js';
import type { Essence } from '../src/types.js';

function makeEssence(overrides: Partial<Essence> = {}): Essence {
  return {
    version: '2.0.0',
    archetype: 'saas-dashboard',
    theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
    personality: ['professional'],
    platform: { type: 'spa', routing: 'hash' },
    structure: [
      { id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid'] },
      { id: 'users', shell: 'sidebar-main', layout: ['data-table'] },
    ],
    features: ['auth'],
    density: { level: 'comfortable', content_gap: '4' },
    guard: { enforce_style: true, mode: 'strict' },
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

  it('flags density mismatch in strict mode', () => {
    const essence = makeEssence();
    const violations = evaluateGuard(essence, { density_gap: '8' });
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'density' }),
    ]);
  });
});

describe('evaluateGuard - theme mode compatibility', () => {
  it('rejects incompatible theme/mode combination', () => {
    const essence = makeEssence({
      theme: { id: 'luminarum', mode: 'light' },
    });
    const context = {
      themeRegistry: new Map([
        ['luminarum', { modes: ['dark'] }]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations).toContainEqual(expect.objectContaining({
      rule: 'theme-mode',
      severity: 'error',
      message: expect.stringContaining('does not support "light" mode')
    }));
  });

  it('accepts auto mode for any theme', () => {
    const essence = makeEssence({
      theme: { id: 'luminarum', mode: 'auto' },
    });
    const context = {
      themeRegistry: new Map([
        ['luminarum', { modes: ['dark'] }]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations.filter(v => v.rule === 'theme-mode')).toHaveLength(0);
  });

  it('accepts compatible theme/mode combination', () => {
    const essence = makeEssence({
      theme: { id: 'luminarum', mode: 'dark' },
    });
    const context = {
      themeRegistry: new Map([
        ['luminarum', { modes: ['dark'] }]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations.filter(v => v.rule === 'theme-mode')).toHaveLength(0);
  });

  it('provides suggestion for incompatible mode', () => {
    const essence = makeEssence({
      theme: { id: 'luminarum', mode: 'light' },
    });
    const context = {
      themeRegistry: new Map([
        ['luminarum', { modes: ['dark'] }]
      ])
    };

    const violations = evaluateGuard(essence, context);
    const themeModeViolation = violations.find(v => v.rule === 'theme-mode');

    expect(themeModeViolation?.suggestion).toContain('dark');
  });

  it('skips check when themeRegistry not provided', () => {
    const essence = makeEssence({
      theme: { id: 'luminarum', mode: 'light' },
    });

    const violations = evaluateGuard(essence, {});

    expect(violations.filter(v => v.rule === 'theme-mode')).toHaveLength(0);
  });
});

describe('evaluateGuard - pattern existence', () => {
  it('reports missing patterns', () => {
    const essence = makeEssence({
      structure: [
        { id: 'main', shell: 'sidebar-main', layout: ['nonexistent-pattern'] }
      ],
    });
    const context = {
      patternRegistry: new Map([
        ['kpi-grid', {}],
        ['activity-feed', {}]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations).toContainEqual(expect.objectContaining({
      rule: 'pattern-exists',
      severity: 'error',
      message: expect.stringContaining('nonexistent-pattern')
    }));
  });

  it('reports missing patterns with suggestions for similar patterns', () => {
    const essence = makeEssence({
      structure: [
        { id: 'main', shell: 'sidebar-main', layout: ['kpi'] }  // partial match
      ],
    });
    const context = {
      patternRegistry: new Map([
        ['kpi-grid', {}],
        ['activity-feed', {}]
      ])
    };

    const violations = evaluateGuard(essence, context);
    const patternViolation = violations.find(v => v.rule === 'pattern-exists');

    expect(patternViolation?.message).toContain('kpi');
    expect(patternViolation?.suggestion).toContain('kpi-grid');
  });

  it('extracts patterns from nested layouts with cols', () => {
    const essence = makeEssence({
      structure: [{
        id: 'main',
        shell: 'sidebar-main',
        layout: [
          { cols: ['missing-a', 'missing-b'], at: 'lg' }
        ]
      }],
    });
    const context = { patternRegistry: new Map() };

    const violations = evaluateGuard(essence, context);

    const patternViolations = violations.filter(v => v.rule === 'pattern-exists');
    expect(patternViolations).toHaveLength(2);
    expect(patternViolations.map(v => v.message)).toContainEqual(expect.stringContaining('missing-a'));
    expect(patternViolations.map(v => v.message)).toContainEqual(expect.stringContaining('missing-b'));
  });

  it('extracts patterns from PatternRef objects', () => {
    const essence = makeEssence({
      structure: [{
        id: 'main',
        shell: 'sidebar-main',
        layout: [
          { pattern: 'unknown-pattern', preset: 'standard' }
        ]
      }],
    });
    const context = { patternRegistry: new Map() };

    const violations = evaluateGuard(essence, context);

    expect(violations).toContainEqual(expect.objectContaining({
      rule: 'pattern-exists',
      message: expect.stringContaining('unknown-pattern')
    }));
  });

  it('accepts patterns that exist in registry', () => {
    const essence = makeEssence({
      structure: [
        { id: 'main', shell: 'sidebar-main', layout: ['kpi-grid', 'activity-feed'] }
      ],
    });
    const context = {
      patternRegistry: new Map([
        ['kpi-grid', {}],
        ['activity-feed', {}]
      ])
    };

    const violations = evaluateGuard(essence, context);

    expect(violations.filter(v => v.rule === 'pattern-exists')).toHaveLength(0);
  });

  it('skips check when patternRegistry not provided', () => {
    const essence = makeEssence({
      structure: [
        { id: 'main', shell: 'sidebar-main', layout: ['nonexistent-pattern'] }
      ],
    });

    const violations = evaluateGuard(essence, {});

    expect(violations.filter(v => v.rule === 'pattern-exists')).toHaveLength(0);
  });

  it('provides fallback suggestion when no similar patterns found', () => {
    const essence = makeEssence({
      structure: [
        { id: 'main', shell: 'sidebar-main', layout: ['xyz-completely-unknown'] }
      ],
    });
    const context = {
      patternRegistry: new Map([
        ['kpi-grid', {}]
      ])
    };

    const violations = evaluateGuard(essence, context);
    const patternViolation = violations.find(v => v.rule === 'pattern-exists');

    expect(patternViolation?.suggestion).toContain('decantr search');
  });
});

describe('accessibility guard', () => {
  it('should return no violations when wcag_level is none', () => {
    const essence: Essence = {
      ...makeEssence(),
      accessibility: { wcag_level: 'none' },
    };
    const violations = evaluateGuard(essence, {});
    const a11yViolations = violations.filter(v => v.rule === 'accessibility');
    expect(a11yViolations).toHaveLength(0);
  });

  it('should return no violations when accessibility is not set', () => {
    const essence: Essence = { ...makeEssence() };
    const violations = evaluateGuard(essence, {});
    const a11yViolations = violations.filter(v => v.rule === 'accessibility');
    expect(a11yViolations).toHaveLength(0);
  });

  it('should return violation when wcag_level is set and context has a11y_issues', () => {
    const essence: Essence = {
      ...makeEssence(),
      accessibility: { wcag_level: 'AA' },
    };
    const violations = evaluateGuard(essence, {
      a11y_issues: ['missing-alt-text', 'skipped-heading-level'],
    });
    const a11yViolations = violations.filter(v => v.rule === 'accessibility');
    expect(a11yViolations).toHaveLength(1);
    expect(a11yViolations[0].message).toContain('WCAG AA');
  });
});
