import { describe, it, expect } from 'vitest';
import { generateTreatmentCSS } from '../src/treatments.js';

const baseSpatialTokens: Record<string, string> = {
  '--d-content-gap': '1rem',
  '--d-section-py': '2.5rem',
  '--d-interactive-py': '0.5rem',
  '--d-interactive-px': '1rem',
  '--d-control-py': '0.5rem',
  '--d-surface-p': '1.5rem',
  '--d-data-py': '0.75rem',
};

describe('generateTreatmentCSS', () => {
  // ── 1. All 6 treatment categories present ──

  it('includes all 6 treatment categories in output', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-interactive');
    expect(css).toContain('.d-surface');
    expect(css).toContain('.d-data');
    expect(css).toContain('.d-control');
    expect(css).toContain('.d-section');
    expect(css).toContain('.d-annotation');
  });

  // ── 2. Interactive states ──

  it('includes interactive hover, focus-visible, and disabled states', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-interactive:hover');
    expect(css).toContain('.d-interactive:focus-visible');
    expect(css).toContain('.d-interactive:disabled');
    expect(css).toContain('pointer-events: none');
    expect(css).toContain('outline: 2px solid var(--d-primary)');
  });

  // ── 3. Interactive variants ──

  it('includes interactive primary, ghost, and danger variants', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-interactive[data-variant="primary"]');
    expect(css).toContain('.d-interactive[data-variant="primary"]:hover');
    expect(css).toContain('.d-interactive[data-variant="ghost"]');
    expect(css).toContain('.d-interactive[data-variant="ghost"]:hover');
    expect(css).toContain('.d-interactive[data-variant="danger"]');
  });

  // ── 4. Surface elevation variants ──

  it('includes surface raised and overlay elevation variants', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-surface[data-elevation="raised"]');
    expect(css).toContain('.d-surface[data-elevation="overlay"]');
    expect(css).toContain('var(--d-shadow-md)');
    expect(css).toContain('var(--d-shadow-lg)');
    expect(css).toContain('z-index: 50');
  });

  // ── 5. Surface interactive hover ──

  it('includes surface interactive hover rule', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-surface[data-interactive]:hover');
    expect(css).toContain('border-color: var(--d-primary-hover, var(--d-border))');
  });

  // ── 6. Form control states ──

  it('includes form control focus, placeholder, disabled, and error states', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-control:focus');
    expect(css).toContain('.d-control::placeholder');
    expect(css).toContain('.d-control:disabled');
    expect(css).toContain('.d-control[aria-invalid]');
    expect(css).toContain('var(--d-error)');
    expect(css).toContain('color-mix(in srgb, var(--d-error) 15%, transparent)');
  });

  // ── 7. Data display sub-classes ──

  it('includes data display header, row, row:hover, and cell', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-data-header');
    expect(css).toContain('.d-data-row');
    expect(css).toContain('.d-data-row:hover');
    expect(css).toContain('.d-data-cell');
    expect(css).toContain('text-transform: uppercase');
    expect(css).toContain('letter-spacing: 0.05em');
  });

  // ── 8. Section rhythm with adjacent separator ──

  it('includes section rhythm with adjacent sibling separator', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-section');
    expect(css).toContain('.d-section + .d-section');
    expect(css).toContain('border-top: 1px solid var(--d-border)');
  });

  // ── 9. Annotation status variants ──

  it('includes annotation success, error, warning, and info status variants', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-annotation[data-status="success"]');
    expect(css).toContain('.d-annotation[data-status="error"]');
    expect(css).toContain('.d-annotation[data-status="warning"]');
    expect(css).toContain('.d-annotation[data-status="info"]');
    expect(css).toContain('var(--d-success)');
    expect(css).toContain('var(--d-warning)');
    expect(css).toContain('var(--d-info)');
  });

  // ── 10. Spatial tokens referenced in CSS values ──

  it('references spatial tokens in CSS values', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('var(--d-interactive-py)');
    expect(css).toContain('var(--d-interactive-px)');
    expect(css).toContain('var(--d-control-py)');
    expect(css).toContain('var(--d-surface-p)');
    expect(css).toContain('var(--d-section-py)');
    expect(css).toContain('var(--d-data-py)');
    expect(css).toContain('var(--d-content-gap)');
  });

  // ── 11. Recipe treatment overrides ──

  it('applies recipe treatment overrides to base rules', () => {
    const overrides = {
      'd-surface': {
        'background': 'rgba(31, 31, 35, 0.8)',
        'backdrop-filter': 'blur(12px)',
      },
    };
    const css = generateTreatmentCSS(baseSpatialTokens, overrides);
    expect(css).toContain('background: rgba(31, 31, 35, 0.8)');
    expect(css).toContain('backdrop-filter: blur(12px)');
    // The original var(--d-surface) background should NOT appear for .d-surface base rule
    const surfaceBlock = css.split('.d-surface {')[1]?.split('}')[0] ?? '';
    expect(surfaceBlock).not.toContain('background: var(--d-surface)');
  });

  // ── 12. Recipe decorators appended after treatments ──

  it('appends recipe decorators after treatment rules', () => {
    const decorators = {
      'carbon-glass': 'Glassmorphic panel with blur and semi-transparent background',
      'carbon-code': 'Monospace code block with surface background',
    };
    const css = generateTreatmentCSS(baseSpatialTokens, undefined, decorators, 'carbon');

    // Layer 3 header with recipe name
    expect(css).toContain('Layer 3: Recipe Decorators (carbon)');
    // Decorator class names present
    expect(css).toContain('.carbon-glass');
    expect(css).toContain('.carbon-code');
    // Decorators appear after treatments
    const treatmentIdx = css.indexOf('.d-annotation');
    const decoratorIdx = css.indexOf('.carbon-glass');
    expect(decoratorIdx).toBeGreaterThan(treatmentIdx);
  });

  // ── 13. Works with no recipe data ──

  it('produces valid CSS with no recipe data', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).not.toContain('undefined');
    expect(css).not.toContain('NaN');
    expect(css).not.toContain('Layer 3');
    expect(css).toContain('Layer 1: Base Treatments');
    expect(css).toContain('@keyframes decantr-fade-in');
    expect(css).toContain('@keyframes decantr-pulse');
  });

  // ── Additional edge cases ──

  it('includes the generated header comment', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('Generated by @decantr/cli');
    expect(css).toContain('Visual Treatment System');
  });

  it('includes keyframes', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('@keyframes decantr-fade-in');
    expect(css).toContain('@keyframes decantr-pulse');
  });

  it('does not include Layer 3 header when no decorators provided', () => {
    const css = generateTreatmentCSS(baseSpatialTokens, undefined, undefined, 'carbon');
    expect(css).not.toContain('Layer 3');
  });

  it('does not include Layer 3 header when decorators object is empty', () => {
    const css = generateTreatmentCSS(baseSpatialTokens, undefined, {}, 'carbon');
    expect(css).not.toContain('Layer 3');
  });

  it('overrides only affect matching base rules, not variant rules', () => {
    const overrides = {
      'd-interactive': { 'background': 'var(--custom-bg)' },
    };
    const css = generateTreatmentCSS(baseSpatialTokens, overrides);
    // Base rule should have the override
    const baseBlock = css.split('.d-interactive {')[1]?.split('}')[0] ?? '';
    expect(baseBlock).toContain('background: var(--custom-bg)');
    // Primary variant should still have its own background
    expect(css).toContain('.d-interactive[data-variant="primary"]');
    const primaryBlock = css.split('.d-interactive[data-variant="primary"] {')[1]?.split('}')[0] ?? '';
    expect(primaryBlock).toContain('background: var(--d-primary)');
  });
});
