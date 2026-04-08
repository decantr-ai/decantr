import { describe, it, expect } from 'vitest';
import { generateTreatmentCSS, generatePersonalityCSS } from '../src/treatments.js';

const baseSpatialTokens: Record<string, string> = {
  '--d-content-gap': '1rem',
  '--d-section-py': '2.5rem',
  '--d-interactive-py': '0.5rem',
  '--d-interactive-px': '1rem',
  '--d-control-py': '0.5rem',
  '--d-surface-p': '1.5rem',
  '--d-data-py': '0.75rem',
  '--d-label-mb': '0.75rem',
  '--d-label-px': '0.75rem',
  '--d-section-gap': '1.5rem',
  '--d-annotation-mt': '0.5rem',
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

  it('includes section rhythm with density inheritance and adjacent separator', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-section');
    expect(css).toContain('.d-section + .d-section');
    // Gradient fade divider
    expect(css).toContain('border-top: 1px solid transparent');
    expect(css).toContain('border-image: linear-gradient(to right, transparent, var(--d-border), transparent) 1');
    // Density-aware gap (replaces old fixed --d-gap-2)
    expect(css).toContain('calc(var(--d-section-gap) * var(--d-density-scale, 1))');
    // Density variants
    expect(css).toContain('.d-section[data-density="compact"]');
    expect(css).toContain('.d-section[data-density="spacious"]');
  });

  // ── Density inheritance ──

  it('sets --d-density-scale on d-section base rule', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const sectionBlock = css.split('.d-section {')[1]?.split('}')[0] ?? '';
    expect(sectionBlock).toContain('--d-density-scale: 1');
  });

  it('sets --d-density-scale: 0.65 for compact density', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-section[data-density="compact"]');
    const compactBlock = css.split('.d-section[data-density="compact"] {')[1]?.split('}')[0] ?? '';
    expect(compactBlock).toContain('--d-density-scale: 0.65');
  });

  it('sets --d-density-scale: 1.4 for spacious density', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-section[data-density="spacious"]');
    const spaciousBlock = css.split('.d-section[data-density="spacious"] {')[1]?.split('}')[0] ?? '';
    expect(spaciousBlock).toContain('--d-density-scale: 1.4');
  });

  it('uses density-scale in section padding calc', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const sectionBlock = css.split('.d-section {')[1]?.split('}')[0] ?? '';
    expect(sectionBlock).toContain('calc(var(--d-section-py) * var(--d-density-scale))');
  });

  it('uses density-aware gap for adjacent sections', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const adjBlock = css.split('.d-section + .d-section {')[1]?.split('}')[0] ?? '';
    expect(adjBlock).toContain('calc(var(--d-section-gap) * var(--d-density-scale, 1))');
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

  // ── 11. Theme treatment overrides ──

  it('applies theme treatment overrides to base rules', () => {
    const overrides = {
      'd-surface': {
        'background': 'rgba(31, 31, 35, 0.8)',
        'backdrop-filter': 'blur(12px)',
      },
    };
    const css = generateTreatmentCSS(baseSpatialTokens, overrides, undefined, 'carbon-neon');
    expect(css).toContain('background: rgba(31, 31, 35, 0.8)');
    // backdrop-filter is theme-only — should appear in a theme-scoped block, not base
    expect(css).toContain('backdrop-filter: blur(12px)');
    expect(css).toContain('[data-theme="carbon-neon"] .d-surface');
    // The base .d-surface block should NOT contain backdrop-filter
    const surfaceBlock = css.split('.d-surface {')[1]?.split('}')[0] ?? '';
    expect(surfaceBlock).not.toContain('backdrop-filter');
    // The original var(--d-surface) background should NOT appear for .d-surface base rule
    expect(surfaceBlock).not.toContain('background: var(--d-surface)');
  });

  // ── 12. Decorator layer is an empty stub ──

  it('emits empty @layer decorators block after treatments', () => {
    const css = generateTreatmentCSS(baseSpatialTokens, undefined, undefined, 'carbon');
    expect(css).toContain('@layer decorators {');
    expect(css).toContain('Decorator CSS is AI-generated from structured definitions');
    // No generated decorator class rules
    expect(css).not.toContain('.carbon-glass');
    // Decorator block appears after treatments
    const treatmentIdx = css.indexOf('end @layer treatments');
    const decoratorIdx = css.indexOf('@layer decorators');
    expect(decoratorIdx).toBeGreaterThan(treatmentIdx);
  });

  // ── 13. Works with no theme decorator data ──

  it('produces valid CSS with no theme decorator data', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).not.toContain('undefined');
    expect(css).not.toContain('NaN');
    expect(css).toContain('Layer 1: Base Treatments');
    expect(css).toContain('@keyframes decantr-pulse');
    expect(css).toContain('@layer decorators');
  });

  // ── Additional edge cases ──

  it('includes the generated header comment', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('Generated by @decantr/cli');
    expect(css).toContain('Visual Treatment System');
  });

  it('includes keyframes', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('@keyframes decantr-pulse');
  });

  it('always includes empty @layer decorators block', () => {
    const css = generateTreatmentCSS(baseSpatialTokens, undefined, undefined, 'carbon');
    expect(css).toContain('@layer decorators');
    expect(css).toContain('AI-generated from structured definitions');
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

  // ── Surface interactive cursor ──

  it('includes cursor pointer on d-surface[data-interactive]', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-surface[data-interactive]');
    const baseBlock = css.split('.d-surface[data-interactive] {')[1]?.split('}')[0] ?? '';
    expect(baseBlock).toContain('cursor: pointer');
  });

  // ── d-label utility ──

  it('includes d-label utility class with spatial contract', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-label');
    // Visual contract
    expect(css).toContain('font-size: 0.7rem');
    expect(css).toContain('font-weight: 600');
    expect(css).toContain('text-transform: uppercase');
    expect(css).toContain('letter-spacing: 0.08em');
    expect(css).toContain('color: var(--d-text-muted)');
    expect(css).toContain('font-family: var(--d-font-mono, ui-monospace, monospace)');
    // Spatial contract
    expect(css).toContain('display: block');
    expect(css).toContain('var(--d-label-mb)');
  });

  // ── d-label spatial contract ──

  it('includes display: block on d-label', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const labelBlock = css.split('.d-label {')[1]?.split('}')[0] ?? '';
    expect(labelBlock).toContain('display: block');
  });

  it('includes density-aware margin-bottom on d-label', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const labelBlock = css.split('.d-label {')[1]?.split('}')[0] ?? '';
    expect(labelBlock).toContain('calc(var(--d-label-mb) * var(--d-density-scale, 1))');
  });

  it('includes d-label[data-anchor] variant with accent border', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('.d-label[data-anchor]');
    const anchorBlock = css.split('.d-label[data-anchor] {')[1]?.split('}')[0] ?? '';
    expect(anchorBlock).toContain('padding-left: var(--d-label-px)');
    expect(anchorBlock).toContain('border-left: 2px solid var(--d-accent)');
  });

  // ── Override stacking with pseudo-selectors ──

  it('does not apply overrides to pseudo-selector rules', () => {
    const overrides = {
      'd-control': { 'border-color': 'red' },
    };
    const css = generateTreatmentCSS(baseSpatialTokens, overrides);
    // Base rule should have the override
    const baseBlock = css.split('.d-control {')[1]?.split('}')[0] ?? '';
    expect(baseBlock).toContain('border-color: red');
    // Focus rule should NOT have the override — it retains original properties
    const focusBlock = css.split('.d-control:focus {')[1]?.split('}')[0] ?? '';
    expect(focusBlock).not.toContain('border-color: red');
    expect(focusBlock).toContain('border-color: var(--d-primary)');
  });
});

describe('generatePersonalityCSS', () => {
  it('generates neon utilities for neon keyword', () => {
    const css = generatePersonalityCSS(['neon accent glows'], {});
    expect(css).toContain('.neon-glow');
    expect(css).toContain('.neon-glow-hover');
    expect(css).toContain('.neon-text-glow');
    expect(css).toContain('.neon-border-glow');
  });

  it('generates mono-data for monospace keyword', () => {
    const css = generatePersonalityCSS(['monospace data typography'], {});
    expect(css).toContain('.mono-data');
    expect(css).toContain('font-variant-numeric: tabular-nums');
  });

  it('generates status-ring for pulse keyword', () => {
    const css = generatePersonalityCSS(['pulse animations', 'status rings'], {});
    expect(css).toContain('.status-ring');
    expect(css).toContain('pulse-ring');
    expect(css).toContain('[data-status="active"]');
    expect(css).toContain('[data-status="error"]');
  });

  it('generates entrance-fade when theme has motion.entrance', () => {
    const css = generatePersonalityCSS(['smooth'], { motion: { entrance: 'fade-slide' } });
    expect(css).toContain('.entrance-fade');
    expect(css).toContain('decantr-entrance');
  });

  it('returns empty string for personality with no keywords', () => {
    const css = generatePersonalityCSS(['professional'], {});
    expect(css).toBe('');
  });
});
