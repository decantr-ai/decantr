# Visual Treatment System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-layer recipe decorator system with a two-tier visual treatment system (6 universal treatment categories + recipe decorators) that produces consistent CSS for any blueprint, with density-driven spatial tokens.

**Architecture:** The CLI generates `treatments.css` with three layers: base treatments (always, from tokens + density), recipe treatment overrides (optional, from recipe `treatment_overrides` field), and recipe decorators (unchanged). A new `computeSpatialTokens()` function in essence-spec computes density-aware spacing for each treatment category. The DECANTR.md template replaces the 164-line atom table with a 35-line treatment reference.

**Tech Stack:** TypeScript, Vitest, CSS custom properties, pnpm workspace

**Spec:** `docs/specs/2026-04-02-visual-treatment-system-design.md`

---

## Phase 1: Core Implementation

### Task 1: Extend essence-spec density to compute spatial tokens

**Files:**
- Modify: `packages/essence-spec/src/density.ts`
- Modify: `packages/essence-spec/src/types.ts:84-87`
- Modify: `packages/essence-spec/src/index.ts:44`
- Test: `packages/essence-spec/test/density.test.ts` (create if not exists, or add to existing)

- [ ] **Step 1: Write the failing test for computeSpatialTokens**

```typescript
// packages/essence-spec/test/density.test.ts
import { describe, it, expect } from 'vitest';
import { computeSpatialTokens } from '../src/density.js';

describe('computeSpatialTokens', () => {
  it('returns comfortable defaults with no recipe hints', () => {
    const tokens = computeSpatialTokens('comfortable');
    expect(tokens['--d-section-py']).toBe('5rem');
    expect(tokens['--d-interactive-py']).toBe('0.5rem');
    expect(tokens['--d-interactive-px']).toBe('1rem');
    expect(tokens['--d-surface-p']).toBe('1.25rem');
    expect(tokens['--d-data-py']).toBe('0.625rem');
    expect(tokens['--d-control-py']).toBe('0.5rem');
    expect(tokens['--d-content-gap']).toBe('1rem');
  });

  it('scales down for compact density', () => {
    const tokens = computeSpatialTokens('compact');
    expect(tokens['--d-section-py']).toBe('3.25rem');
    expect(tokens['--d-interactive-py']).toBe('0.325rem');
    expect(tokens['--d-interactive-px']).toBe('0.65rem');
  });

  it('scales up for spacious density', () => {
    const tokens = computeSpatialTokens('spacious');
    expect(tokens['--d-section-py']).toBe('7rem');
    expect(tokens['--d-interactive-py']).toBe('0.7rem');
    expect(tokens['--d-interactive-px']).toBe('1.4rem');
  });

  it('respects recipe section_padding override', () => {
    const tokens = computeSpatialTokens('comfortable', { section_padding: '80px' });
    expect(tokens['--d-section-py']).toBe('5rem'); // 80px / 16 = 5rem
  });

  it('applies density_bias shift', () => {
    const tokens = computeSpatialTokens('comfortable', { density_bias: 2 });
    // base * (1 + 2/10) = base * 1.2
    expect(parseFloat(tokens['--d-section-py'])).toBeCloseTo(6, 0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/essence-spec && pnpm test -- --run density`
Expected: FAIL with "computeSpatialTokens is not a function" or "not exported"

- [ ] **Step 3: Add SpatialTokens type and update Density type**

In `packages/essence-spec/src/types.ts`, after the `Density` interface (line 87), add:

```typescript
/** Spatial token values computed from density level + recipe hints. */
export interface SpatialTokens {
  '--d-section-py': string;
  '--d-interactive-py': string;
  '--d-interactive-px': string;
  '--d-surface-p': string;
  '--d-data-py': string;
  '--d-control-py': string;
  '--d-content-gap': string;
}
```

- [ ] **Step 4: Implement computeSpatialTokens in density.ts**

In `packages/essence-spec/src/density.ts`, add after the existing `computeDensity` function:

```typescript
import type { DensityLevel, SpatialTokens } from './types.js';

interface SpatialRecipeHints {
  section_padding?: string | null;
  density_bias?: number;
  content_gap_shift?: number;
}

const DENSITY_SCALE: Record<DensityLevel, number> = {
  compact: 0.65,
  comfortable: 1.0,
  spacious: 1.4,
};

const BASE_TOKENS = {
  '--d-section-py': 5,
  '--d-interactive-py': 0.5,
  '--d-interactive-px': 1,
  '--d-surface-p': 1.25,
  '--d-data-py': 0.625,
  '--d-control-py': 0.5,
  '--d-content-gap': 1,
};

function roundRem(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return `${rounded}rem`;
}

function pxToRem(px: string): number {
  const num = parseFloat(px);
  return num / 16;
}

export function computeSpatialTokens(
  density: DensityLevel,
  recipeHints?: SpatialRecipeHints,
): SpatialTokens {
  const scale = DENSITY_SCALE[density] ?? 1.0;
  const biasMultiplier = recipeHints?.density_bias
    ? 1 + recipeHints.density_bias / 10
    : 1.0;

  const result: Record<string, string> = {};
  for (const [token, base] of Object.entries(BASE_TOKENS)) {
    result[token] = roundRem(base * scale * biasMultiplier);
  }

  // Recipe section_padding override (converts px to rem)
  if (recipeHints?.section_padding) {
    const rem = pxToRem(recipeHints.section_padding);
    result['--d-section-py'] = roundRem(rem * biasMultiplier);
  }

  // content_gap_shift adjusts content gap
  if (recipeHints?.content_gap_shift) {
    const base = BASE_TOKENS['--d-content-gap'];
    const shifted = base * scale * biasMultiplier + recipeHints.content_gap_shift * 0.25;
    result['--d-content-gap'] = roundRem(Math.max(0.25, shifted));
  }

  return result as SpatialTokens;
}
```

- [ ] **Step 5: Export from index.ts**

In `packages/essence-spec/src/index.ts`, after line 44 (`export { computeDensity } from './density.js';`), add:

```typescript
export { computeSpatialTokens } from './density.js';
```

Also add to the type exports:

```typescript
export type { SpatialTokens } from './types.js';
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/essence-spec && pnpm test -- --run`
Expected: All tests PASS including new density tests

- [ ] **Step 7: Build and verify**

Run: `cd packages/essence-spec && pnpm build`
Expected: Clean build, `dist/density.js` exports `computeSpatialTokens`, `dist/types.d.ts` exports `SpatialTokens`

- [ ] **Step 8: Bump version**

In `packages/essence-spec/package.json`, bump version from `1.0.0-beta.8` to `1.0.0-beta.9`.

- [ ] **Step 9: Commit**

```bash
git add packages/essence-spec/
git commit -m "feat(essence-spec): add computeSpatialTokens for visual treatment system"
```

---

### Task 2: Add treatment_overrides to registry Recipe type

**Files:**
- Modify: `packages/registry/src/types.ts:78-89`

- [ ] **Step 1: Add treatment_overrides to Recipe interface**

In `packages/registry/src/types.ts`, in the `Recipe` interface (line 78-89), add after the last field:

```typescript
  /** Optional recipe overrides for base treatment classes. Maps CSS selector → property overrides. */
  treatment_overrides?: Record<string, Record<string, string>>;
```

- [ ] **Step 2: Build and verify**

Run: `cd packages/registry && pnpm build`
Expected: Clean build, type exports include updated `Recipe`

- [ ] **Step 3: Bump version**

In `packages/registry/package.json`, bump version from `1.0.0-beta.8` to `1.0.0-beta.9`.

- [ ] **Step 4: Commit**

```bash
git add packages/registry/
git commit -m "feat(registry): add treatment_overrides to Recipe type"
```

---

### Task 3: Implement generateTreatmentCSS in CLI

**Files:**
- Create: `packages/cli/src/treatments.ts`
- Test: `packages/cli/test/treatments.test.ts`

- [ ] **Step 1: Write the failing test for base treatment generation**

```typescript
// packages/cli/test/treatments.test.ts
import { describe, it, expect } from 'vitest';
import { generateTreatmentCSS } from '../src/treatments.js';

describe('generateTreatmentCSS', () => {
  const spatialTokens = {
    '--d-section-py': '5rem',
    '--d-interactive-py': '0.5rem',
    '--d-interactive-px': '1rem',
    '--d-surface-p': '1.25rem',
    '--d-data-py': '0.625rem',
    '--d-control-py': '0.5rem',
    '--d-content-gap': '1rem',
  };

  it('generates all 6 treatment categories', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-interactive');
    expect(css).toContain('.d-surface');
    expect(css).toContain('.d-data');
    expect(css).toContain('.d-control');
    expect(css).toContain('.d-section');
    expect(css).toContain('.d-annotation');
  });

  it('includes interactive states', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-interactive:hover');
    expect(css).toContain('.d-interactive:focus-visible');
    expect(css).toContain('.d-interactive:disabled');
    expect(css).toContain('.d-interactive[data-variant="primary"]');
    expect(css).toContain('.d-interactive[data-variant="ghost"]');
    expect(css).toContain('.d-interactive[data-variant="danger"]');
  });

  it('includes surface elevation variants', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-surface[data-elevation="raised"]');
    expect(css).toContain('.d-surface[data-elevation="overlay"]');
    expect(css).toContain('.d-surface[data-interactive]:hover');
  });

  it('includes form control states', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-control:focus');
    expect(css).toContain('.d-control::placeholder');
    expect(css).toContain('.d-control:disabled');
    expect(css).toContain('.d-control[aria-invalid]');
  });

  it('includes data display sub-classes', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-data-header');
    expect(css).toContain('.d-data-row');
    expect(css).toContain('.d-data-row:hover');
    expect(css).toContain('.d-data-cell');
  });

  it('includes section rhythm with adjacent separator', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-section');
    expect(css).toContain('.d-section + .d-section');
  });

  it('includes annotation status variants', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('.d-annotation[data-status="success"]');
    expect(css).toContain('.d-annotation[data-status="error"]');
    expect(css).toContain('.d-annotation[data-status="warning"]');
    expect(css).toContain('.d-annotation[data-status="info"]');
  });

  it('uses spatial tokens in CSS values', () => {
    const css = generateTreatmentCSS(spatialTokens);
    expect(css).toContain('var(--d-interactive-py)');
    expect(css).toContain('var(--d-interactive-px)');
    expect(css).toContain('var(--d-surface-p)');
    expect(css).toContain('var(--d-section-py)');
    expect(css).toContain('var(--d-data-py)');
    expect(css).toContain('var(--d-control-py)');
  });

  it('applies recipe treatment overrides', () => {
    const overrides = {
      'd-surface': {
        'background': 'rgba(31,31,35,0.8)',
        'backdrop-filter': 'blur(8px)',
      },
    };
    const css = generateTreatmentCSS(spatialTokens, overrides);
    expect(css).toContain('rgba(31,31,35,0.8)');
    expect(css).toContain('blur(8px)');
  });

  it('appends recipe decorators after treatments', () => {
    const decorators = {
      'carbon-glass': 'Glassmorphic panel with backdrop-filter blur(12px), semi-transparent surface background, 1px border.',
    };
    const css = generateTreatmentCSS(spatialTokens, undefined, decorators);
    expect(css).toContain('.carbon-glass');
    // Treatments should come before recipe decorators
    const treatmentPos = css.indexOf('.d-interactive');
    const decoratorPos = css.indexOf('.carbon-glass');
    expect(treatmentPos).toBeLessThan(decoratorPos);
  });

  it('returns valid CSS with no recipe data', () => {
    const css = generateTreatmentCSS(spatialTokens);
    // Should not throw, should contain all 6 categories
    expect(css).toContain('.d-interactive');
    expect(css).toContain('.d-section');
    expect(css).not.toContain('undefined');
    expect(css).not.toContain('NaN');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && pnpm test -- --run treatments`
Expected: FAIL with "Cannot find module '../src/treatments.js'"

- [ ] **Step 3: Implement generateTreatmentCSS**

Create `packages/cli/src/treatments.ts`:

```typescript
import type { SpatialTokens } from '@decantr/essence-spec';
import { generateDecoratorRule } from './scaffold.js';

/**
 * Generate treatments.css with three layers:
 * 1. Base treatments (universal, from tokens + density)
 * 2. Recipe treatment overrides (optional)
 * 3. Recipe decorators (visual identity)
 */
export function generateTreatmentCSS(
  spatialTokens: SpatialTokens,
  treatmentOverrides?: Record<string, Record<string, string>>,
  recipeDecorators?: Record<string, string>,
  recipeName?: string,
): string {
  const sections: string[] = [
    `/* Generated by @decantr/cli — Visual Treatment System */`,
    '',
    '/* ── Layer 1: Base Treatments ── */',
    '',
    generateInteractiveSurface(treatmentOverrides),
    generateContainerSurface(treatmentOverrides),
    generateDataDisplay(treatmentOverrides),
    generateFormControl(treatmentOverrides),
    generateSectionRhythm(treatmentOverrides),
    generateInlineAnnotation(treatmentOverrides),
  ];

  // Layer 3: Recipe decorators (existing system, unchanged)
  if (recipeDecorators && Object.keys(recipeDecorators).length > 0) {
    sections.push('');
    sections.push(`/* ── Layer 3: Recipe Decorators${recipeName ? ` (${recipeName})` : ''} ── */`);
    sections.push('');
    for (const [name, description] of Object.entries(recipeDecorators)) {
      sections.push(generateDecoratorRule(name, description));
      sections.push('');
    }
  }

  // Animation keyframes
  sections.push('/* ── Keyframes ── */');
  sections.push('');
  sections.push(`@keyframes decantr-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}`);
  sections.push('');
  sections.push(`@keyframes decantr-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}`);

  return sections.join('\n');
}

function applyOverrides(
  selector: string,
  baseProps: Record<string, string>,
  overrides?: Record<string, Record<string, string>>,
): Record<string, string> {
  const overrideProps = overrides?.[selector];
  if (!overrideProps) return baseProps;
  return { ...baseProps, ...overrideProps };
}

function renderRule(selector: string, props: Record<string, string>): string {
  const lines = Object.entries(props)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `.${selector} {\n${lines}\n}`;
}

function generateInteractiveSurface(overrides?: Record<string, Record<string, string>>): string {
  const base = applyOverrides('d-interactive', {
    'display': 'inline-flex',
    'align-items': 'center',
    'justify-content': 'center',
    'gap': '0.5em',
    'padding': 'var(--d-interactive-py) var(--d-interactive-px)',
    'border': '1px solid var(--d-border)',
    'border-radius': 'var(--d-radius)',
    'background': 'transparent',
    'color': 'var(--d-text)',
    'font': 'inherit',
    'font-size': 'inherit',
    'line-height': '1.5',
    'cursor': 'pointer',
    'text-decoration': 'none',
    'transition': 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
  }, overrides);

  const hoverProps = applyOverrides('d-interactive:hover', {
    'border-color': 'var(--d-primary-hover, var(--d-primary))',
    'background': 'var(--d-surface)',
  }, overrides);

  const focusProps = applyOverrides('d-interactive:focus-visible', {
    'outline': '2px solid var(--d-primary)',
    'outline-offset': '2px',
  }, overrides);

  const disabledProps = applyOverrides('d-interactive:disabled', {
    'opacity': '0.5',
    'cursor': 'not-allowed',
    'pointer-events': 'none',
  }, overrides);

  const primaryProps = applyOverrides('d-interactive[data-variant="primary"]', {
    'background': 'var(--d-primary)',
    'color': '#fff',
    'border-color': 'var(--d-primary)',
  }, overrides);

  const primaryHoverProps = applyOverrides('d-interactive[data-variant="primary"]:hover', {
    'background': 'var(--d-primary-hover, var(--d-primary))',
    'border-color': 'var(--d-primary-hover, var(--d-primary))',
  }, overrides);

  const ghostProps = applyOverrides('d-interactive[data-variant="ghost"]', {
    'border-color': 'transparent',
    'background': 'transparent',
  }, overrides);

  const ghostHoverProps = applyOverrides('d-interactive[data-variant="ghost"]:hover', {
    'background': 'var(--d-surface)',
  }, overrides);

  const dangerProps = applyOverrides('d-interactive[data-variant="danger"]', {
    'background': 'var(--d-error)',
    'color': '#fff',
    'border-color': 'var(--d-error)',
  }, overrides);

  return [
    renderRule('d-interactive', base),
    renderRule('d-interactive:hover', hoverProps),
    renderRule('d-interactive:focus-visible', focusProps),
    renderRule('d-interactive:disabled', disabledProps),
    renderRule('d-interactive[data-variant="primary"]', primaryProps),
    renderRule('d-interactive[data-variant="primary"]:hover', primaryHoverProps),
    renderRule('d-interactive[data-variant="ghost"]', ghostProps),
    renderRule('d-interactive[data-variant="ghost"]:hover', ghostHoverProps),
    renderRule('d-interactive[data-variant="danger"]', dangerProps),
  ].join('\n\n');
}

function generateContainerSurface(overrides?: Record<string, Record<string, string>>): string {
  const base = applyOverrides('d-surface', {
    'background': 'var(--d-surface)',
    'border': '1px solid var(--d-border)',
    'border-radius': 'var(--d-radius)',
    'box-shadow': 'var(--d-shadow)',
    'padding': 'var(--d-surface-p)',
  }, overrides);

  const raised = applyOverrides('d-surface[data-elevation="raised"]', {
    'background': 'var(--d-surface-raised)',
    'box-shadow': 'var(--d-shadow-md)',
  }, overrides);

  const overlay = applyOverrides('d-surface[data-elevation="overlay"]', {
    'background': 'var(--d-surface-raised)',
    'box-shadow': 'var(--d-shadow-lg)',
    'z-index': '50',
  }, overrides);

  const interactive = applyOverrides('d-surface[data-interactive]:hover', {
    'border-color': 'var(--d-primary-hover, var(--d-border))',
    'box-shadow': 'var(--d-shadow-md)',
    'transition': 'border-color 0.15s ease, box-shadow 0.15s ease',
  }, overrides);

  return [
    renderRule('d-surface', base),
    renderRule('d-surface[data-elevation="raised"]', raised),
    renderRule('d-surface[data-elevation="overlay"]', overlay),
    renderRule('d-surface[data-interactive]:hover', interactive),
  ].join('\n\n');
}

function generateDataDisplay(overrides?: Record<string, Record<string, string>>): string {
  const table = applyOverrides('d-data', {
    'width': '100%',
    'border-collapse': 'collapse',
    'text-align': 'left',
    'font-size': '0.875rem',
  }, overrides);

  const header = applyOverrides('d-data-header', {
    'padding': 'var(--d-data-py) var(--d-content-gap)',
    'font-weight': '500',
    'color': 'var(--d-text-muted)',
    'border-bottom': '1px solid var(--d-border)',
    'font-size': '0.75rem',
    'text-transform': 'uppercase',
    'letter-spacing': '0.05em',
  }, overrides);

  const row = applyOverrides('d-data-row', {
    'border-bottom': '1px solid var(--d-border)',
    'transition': 'background 0.1s ease',
  }, overrides);

  const rowHover = applyOverrides('d-data-row:hover', {
    'background': 'var(--d-surface)',
  }, overrides);

  const cell = applyOverrides('d-data-cell', {
    'padding': 'var(--d-data-py) var(--d-content-gap)',
    'vertical-align': 'middle',
  }, overrides);

  return [
    renderRule('d-data', table),
    renderRule('d-data-header', header),
    renderRule('d-data-row', row),
    renderRule('d-data-row:hover', rowHover),
    renderRule('d-data-cell', cell),
  ].join('\n\n');
}

function generateFormControl(overrides?: Record<string, Record<string, string>>): string {
  const base = applyOverrides('d-control', {
    'background': 'var(--d-surface)',
    'color': 'var(--d-text)',
    'padding': 'var(--d-control-py) 0.75rem',
    'border-radius': 'var(--d-radius)',
    'border': '1px solid var(--d-border)',
    'width': '100%',
    'outline': 'none',
    'font': 'inherit',
    'transition': 'border-color 0.15s ease, box-shadow 0.15s ease',
  }, overrides);

  const focus = applyOverrides('d-control:focus', {
    'border-color': 'var(--d-primary)',
    'box-shadow': '0 0 0 3px color-mix(in srgb, var(--d-primary) 25%, transparent)',
  }, overrides);

  const placeholder = applyOverrides('d-control::placeholder', {
    'color': 'var(--d-text-muted)',
  }, overrides);

  const disabled = applyOverrides('d-control:disabled', {
    'opacity': '0.5',
    'cursor': 'not-allowed',
  }, overrides);

  const invalid = applyOverrides('d-control[aria-invalid]', {
    'border-color': 'var(--d-error)',
    'box-shadow': '0 0 0 3px color-mix(in srgb, var(--d-error) 15%, transparent)',
  }, overrides);

  return [
    renderRule('d-control', base),
    renderRule('d-control:focus', focus),
    renderRule('d-control::placeholder', placeholder),
    renderRule('d-control:disabled', disabled),
    renderRule('d-control[aria-invalid]', invalid),
  ].join('\n\n');
}

function generateSectionRhythm(overrides?: Record<string, Record<string, string>>): string {
  const base = applyOverrides('d-section', {
    'padding': 'var(--d-section-py) 0',
  }, overrides);

  const adjacent = applyOverrides('d-section + .d-section', {
    'border-top': '1px solid var(--d-border)',
  }, overrides);

  return [
    renderRule('d-section', base),
    '.d-section + .d-section {\n' +
    `  ${Object.entries(applyOverrides('d-section + .d-section', adjacent.constructor === Object ? { 'border-top': '1px solid var(--d-border)' } : adjacent, overrides)).map(([k, v]) => `${k}: ${v};`).join('\n  ')}\n}`,
  ].join('\n\n');
}

function generateInlineAnnotation(overrides?: Record<string, Record<string, string>>): string {
  const base = applyOverrides('d-annotation', {
    'display': 'inline-flex',
    'align-items': 'center',
    'gap': '0.25em',
    'font-size': '0.75rem',
    'font-weight': '500',
    'padding': '0.125rem 0.5rem',
    'border-radius': 'var(--d-radius-full)',
    'background': 'var(--d-surface)',
    'color': 'var(--d-text-muted)',
    'white-space': 'nowrap',
  }, overrides);

  const success = applyOverrides('d-annotation[data-status="success"]', {
    'background': 'color-mix(in srgb, var(--d-success) 15%, transparent)',
    'color': 'var(--d-success)',
  }, overrides);

  const error = applyOverrides('d-annotation[data-status="error"]', {
    'background': 'color-mix(in srgb, var(--d-error) 15%, transparent)',
    'color': 'var(--d-error)',
  }, overrides);

  const warning = applyOverrides('d-annotation[data-status="warning"]', {
    'background': 'color-mix(in srgb, var(--d-warning) 15%, transparent)',
    'color': 'var(--d-warning)',
  }, overrides);

  const info = applyOverrides('d-annotation[data-status="info"]', {
    'background': 'color-mix(in srgb, var(--d-info) 15%, transparent)',
    'color': 'var(--d-info)',
  }, overrides);

  return [
    renderRule('d-annotation', base),
    renderRule('d-annotation[data-status="success"]', success),
    renderRule('d-annotation[data-status="error"]', error),
    renderRule('d-annotation[data-status="warning"]', warning),
    renderRule('d-annotation[data-status="info"]', info),
  ].join('\n\n');
}
```

Note: The `generateSectionRhythm` function has a bug in the adjacent rule rendering. Fix it to use `renderRule` properly:

Replace the `generateSectionRhythm` function body with:

```typescript
function generateSectionRhythm(overrides?: Record<string, Record<string, string>>): string {
  const base = applyOverrides('d-section', {
    'padding': 'var(--d-section-py) 0',
  }, overrides);

  const adjacent = applyOverrides('d-section + .d-section', {
    'border-top': '1px solid var(--d-border)',
  }, overrides);

  const baseRule = renderRule('d-section', base);
  const adjacentLines = Object.entries(adjacent)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  const adjacentRule = `.d-section + .d-section {\n${adjacentLines}\n}`;

  return [baseRule, adjacentRule].join('\n\n');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/cli && pnpm test -- --run treatments`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/treatments.ts packages/cli/test/treatments.test.ts
git commit -m "feat(cli): add generateTreatmentCSS with 6 treatment categories"
```

---

### Task 4: Update generateTokensCSS to emit spatial tokens

**Files:**
- Modify: `packages/cli/src/scaffold.ts:505-617`
- Modify: `packages/cli/test/scaffold.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/test/scaffold.test.ts`:

```typescript
describe('generateTokensCSS with spatial tokens', () => {
  it('includes spatial tokens in output', () => {
    const themeData = {
      seed: { primary: '#7C93B0', secondary: '#A1A1AA', accent: '#6B8AAE', background: '#18181B' },
      palette: {},
    };
    const spatialTokens = {
      '--d-section-py': '5rem',
      '--d-interactive-py': '0.5rem',
      '--d-interactive-px': '1rem',
      '--d-surface-p': '1.25rem',
      '--d-data-py': '0.625rem',
      '--d-control-py': '0.5rem',
      '--d-content-gap': '1rem',
    };
    const css = generateTokensCSS(themeData, 'dark', spatialTokens);
    expect(css).toContain('--d-section-py: 5rem');
    expect(css).toContain('--d-interactive-py: 0.5rem');
    expect(css).toContain('--d-surface-p: 1.25rem');
    expect(css).toContain('--d-content-gap: 1rem');
  });

  it('works without spatial tokens (backward compat)', () => {
    const themeData = {
      seed: { primary: '#7C93B0' },
      palette: {},
    };
    const css = generateTokensCSS(themeData, 'dark');
    expect(css).toContain('--d-primary');
    expect(css).not.toContain('--d-section-py');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && pnpm test -- --run scaffold`
Expected: FAIL — `generateTokensCSS` doesn't accept 3rd parameter

- [ ] **Step 3: Update generateTokensCSS signature and implementation**

In `packages/cli/src/scaffold.ts`, change the `generateTokensCSS` function signature (line 505) from:

```typescript
export function generateTokensCSS(themeData: ThemeData | undefined, mode: string): string {
```

to:

```typescript
export function generateTokensCSS(themeData: ThemeData | undefined, mode: string, spatialTokens?: Record<string, string>): string {
```

Then, after the `:root {` block is built (around line 589, before the closing `}\n`), insert the spatial tokens if provided:

```typescript
  // Append spatial tokens if provided
  if (spatialTokens) {
    const spatialLines = Object.entries(spatialTokens)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    css = css.replace('}\n', `${spatialLines}\n}\n`);
  }
```

- [ ] **Step 4: Run tests**

Run: `cd packages/cli && pnpm test -- --run scaffold`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/scaffold.ts packages/cli/test/scaffold.test.ts
git commit -m "feat(cli): add spatial tokens parameter to generateTokensCSS"
```

---

### Task 5: Wire treatments into scaffoldProject

**Files:**
- Modify: `packages/cli/src/scaffold.ts:493-500` (RecipeData interface)
- Modify: `packages/cli/src/scaffold.ts:2400-2430` (CSS file generation block)
- Modify: `packages/cli/src/commands/magic.ts:530-543` (recipe data extraction)

- [ ] **Step 1: Update RecipeData interface**

In `packages/cli/src/scaffold.ts`, update the `RecipeData` interface (lines 493-500) to:

```typescript
export interface RecipeData {
  decorators?: Record<string, string>;
  spatial_hints?: { density_bias?: number; content_gap_shift?: number; section_padding?: string | null; card_wrapping?: string; surface_override?: string };
  radius_hints?: { philosophy: string; base: number };
  treatment_overrides?: Record<string, Record<string, string>>;
}
```

Note: changed `density_bias` type from `string` to `number` to match the registry type. Check callsites for compatibility.

- [ ] **Step 2: Update CSS generation block to use treatments**

In `packages/cli/src/scaffold.ts`, find the CSS file generation block (~lines 2400-2430). Update to:

1. Import at top of file:
```typescript
import { computeSpatialTokens } from '@decantr/essence-spec';
import { generateTreatmentCSS } from './treatments.js';
```

2. Replace the decorators.css write block. Find:
```typescript
    writeFileSync(decoratorsPath, generateDecoratorsCSS(recipeData, themeName));
```

Replace with:
```typescript
    // Compute spatial tokens from density + recipe hints
    const densityLevel = (options.density || 'comfortable') as 'compact' | 'comfortable' | 'spacious';
    const spatialTokens = computeSpatialTokens(densityLevel, recipeData?.spatial_hints ? {
      section_padding: recipeData.spatial_hints.section_padding ?? undefined,
      density_bias: typeof recipeData.spatial_hints.density_bias === 'number' ? recipeData.spatial_hints.density_bias : undefined,
      content_gap_shift: recipeData.spatial_hints.content_gap_shift,
    } : undefined);

    // Write treatments.css (replaces decorators.css)
    const treatmentsPath = join(stylesDir, 'treatments.css');
    writeFileSync(treatmentsPath, generateTreatmentCSS(
      spatialTokens,
      recipeData?.treatment_overrides,
      recipeData?.decorators,
      themeName,
    ));
```

3. Update the tokens.css write to include spatial tokens:
```typescript
    writeFileSync(tokensPath, generateTokensCSS(themeData, mode, spatialTokens));
```

4. Update the `result.cssFiles` to reference `treatments.css` instead of `decorators.css`.

- [ ] **Step 3: Update magic.ts recipe data extraction**

In `packages/cli/src/commands/magic.ts`, find where `recipeData` is built (~lines 530-543). Add extraction of `treatment_overrides`:

```typescript
      recipeData = {
        decorators: recipe.decorators || recipeData?.decorators,
        spatial_hints: recipe.spatial_hints,
        treatment_overrides: recipe.treatment_overrides,
      };
```

- [ ] **Step 4: Update new-project.ts template import**

In `packages/cli/src/commands/new-project.ts`, find the template string with `import './styles/decorators.css'` (~line 170-171) and change to:

```typescript
import './styles/treatments.css';
```

- [ ] **Step 5: Build and run full test suite**

Run: `cd packages/cli && pnpm build && pnpm test -- --run`
Expected: Build succeeds. Tests that reference `generateDecoratorsCSS` directly may need updating — fix any remaining import/reference issues.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/scaffold.ts packages/cli/src/commands/magic.ts packages/cli/src/commands/new-project.ts
git commit -m "feat(cli): wire treatment system into scaffold pipeline"
```

---

### Task 6: Update DECANTR.md template with treatment reference

**Files:**
- Modify: `packages/cli/src/scaffold.ts:1453-1696` (CSS_APPROACH_CONTENT constant)

- [ ] **Step 1: Replace CSS_APPROACH_CONTENT**

In `packages/cli/src/scaffold.ts`, replace the `CSS_APPROACH_CONTENT` constant (lines 1453-1696) with the treatment-aware version. The constant starts with `` const CSS_APPROACH_CONTENT = `## CSS Implementation `` and ends ~244 lines later.

Replace the entire constant with:

```typescript
const CSS_APPROACH_CONTENT = `## CSS Implementation

### Three File Setup

1. **tokens.css** — Design tokens (colors, spacing, shadows, radii, spatial tokens)
2. **treatments.css** — Visual treatment classes (base treatments + recipe decorators)
3. **global.css** — Reset, body styles, utilities

Import order in your entry file:
\`\`\`tsx
import './styles/tokens.css';
import './styles/treatments.css';
import './styles/global.css';
import { css } from '@decantr/css';
\`\`\`

### Visual Treatments

Six treatment classes for visual consistency. Use on any element that matches the category.

#### Interactive Surface
Class: \`d-interactive\` | Variants: \`data-variant="primary|ghost|danger"\`
States: hover, focus-visible, active, disabled
Use for: buttons, links, nav items, chips, tabs, any clickable element

#### Container Surface
Class: \`d-surface\` | Variants: \`data-elevation="raised|overlay"\`
Optional: \`data-interactive\` (adds hover lift)
Use for: cards, panels, modals, alerts, callouts, code blocks

#### Data Display
Classes: \`d-data\`, \`d-data-header\`, \`d-data-row\`, \`d-data-cell\`
States: d-data-row has hover highlight
Use for: tables, stat grids, log entries, key-value pairs

#### Form Control
Class: \`d-control\`
States: focus (ring), placeholder, disabled, error (\`aria-invalid\`)
Use for: text inputs, textareas, selects, search bars

#### Section Rhythm
Class: \`d-section\`
Auto-spacing between adjacent sections. Density-aware.
Use for: wrap each page section for consistent vertical rhythm

#### Inline Annotation
Class: \`d-annotation\` | Variants: \`data-status="success|error|warning|info"\`
Use for: badges, tags, status dots, counts, labels

### Composition

Combine atoms (layout) + treatments (visual) + recipe decorators (identity):
\`\`\`tsx
<button className={css('_px4 _py2') + ' d-interactive'} data-variant="primary">Deploy</button>
<div className={css('_flex _col _gap4') + ' d-surface carbon-glass'}>Card with glass effect</div>
<span className="d-annotation" data-status="success">Active</span>
\`\`\`

### Atoms Quick Reference

| Category | Examples | Purpose |
|----------|---------|---------|
| Layout | \`_flex\`, \`_col\`, \`_row\`, \`_wrap\`, \`_grid\` | Flex/grid containers |
| Spacing | \`_gap4\`, \`_p4\`, \`_px4\`, \`_py2\`, \`_m0\` | Gaps, padding, margin |
| Sizing | \`_w100\`, \`_h100\`, \`_minw0\`, \`_maxwfull\` | Width, height |
| Text | \`_textlg\`, \`_text2xl\`, \`_fontbold\`, \`_textcenter\` | Typography |
| Responsive | \`_md:gc2\`, \`_lg:gc4\`, \`_sm:flex\` | Breakpoint prefixes |

Use \`css()\` function for atoms: \`css('_flex _col _gap4')\`. See @decantr/css for full reference.

### Design Tokens

All tokens use \`var(--d-*)\` prefix. Key tokens:
| Token | Purpose | Example |
|-------|---------|---------|
| \`--d-primary\` | Primary brand color | Buttons, links, accents |
| \`--d-surface\` | Card/panel background | Containers, panels |
| \`--d-border\` | Border color | Dividers, card borders |
| \`--d-text\` | Primary text | Body text |
| \`--d-text-muted\` | Secondary text | Labels, captions |
| \`--d-success\`, \`--d-error\`, \`--d-warning\`, \`--d-info\` | Status colors | Badges, alerts |
| \`--d-shadow\`, \`--d-shadow-md\`, \`--d-shadow-lg\` | Elevation | Cards, modals |
| \`--d-radius\`, \`--d-radius-sm\`, \`--d-radius-lg\` | Border radius | Containers, buttons |`;
```

- [ ] **Step 2: Build and verify**

Run: `cd packages/cli && pnpm build`
Expected: Clean build. The template should produce valid markdown.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/scaffold.ts
git commit -m "feat(cli): replace atom table with treatment reference in DECANTR.md template"
```

---

### Task 7: Update section context generation and treatments.md

**Files:**
- Modify: `packages/cli/src/scaffold.ts` — `generateDecoratorsContext()` (~line 720), `generateSectionContext()` (~line 2960), `SectionContextInput` interface (~line 2930)
- Modify: `packages/cli/test/context-gen.test.ts`

- [ ] **Step 1: Rename and update generateDecoratorsContext → generateTreatmentsContext**

In `packages/cli/src/scaffold.ts`, find `generateDecoratorsContext` (~line 722). Replace the entire function:

```typescript
function generateTreatmentsContext(recipeData: RecipeData | undefined, recipeName: string): string {
  const lines: string[] = [];
  lines.push(`# Visual Treatments: ${recipeName}`);
  lines.push('');
  lines.push('## Base Treatments');
  lines.push('');
  lines.push('d-interactive, d-surface, d-data, d-control, d-section, d-annotation — see DECANTR.md for usage.');
  lines.push('');

  if (recipeData?.decorators && Object.keys(recipeData.decorators).length > 0) {
    lines.push(`## Recipe Decorators (${recipeName}-specific)`);
    lines.push('');
    lines.push('| Class | Use for |');
    lines.push('|-------|---------|');
    for (const [name, description] of Object.entries(recipeData.decorators)) {
      // Extract first sentence as "use for"
      const useFor = description.split('.')[0].trim();
      lines.push(`| ${name} | ${useFor} |`);
    }
    lines.push('');
  }

  lines.push('## Composition');
  lines.push('');
  lines.push('Atoms + treatment + recipe decorator:');
  lines.push("```tsx");
  lines.push(`css('_flex _col _gap4') + ' d-surface${recipeData?.decorators ? ' ' + recipeName + '-glass' : ''}'`);
  lines.push("```");
  lines.push('');
  lines.push('Atoms use `css()` function. Treatments and recipe decorators are plain class strings.');

  return lines.join('\n');
}
```

- [ ] **Step 2: Update all callsites of generateDecoratorsContext**

Find all calls to `generateDecoratorsContext` in scaffold.ts and replace with `generateTreatmentsContext`. Also update the filename from `decorators.md` to `treatments.md` at the write site (~line 2429):

```typescript
    writeFileSync(join(contextDir, 'treatments.md'), generateTreatmentsContext(recipeData, themeName));
```

- [ ] **Step 3: Update SectionContextInput and generateSectionContext**

In the `SectionContextInput` interface (~line 2930), update the decorators field:

```typescript
  treatments: string[];  // was: decorators: Array<{ name: string; description: string }>
  recipeDecorators: string[];  // recipe-specific decorator names only
```

In `generateSectionContext()`, update the section that emits decorator info to:

```typescript
  // Visual treatments reference
  lines.push('## Visual Treatments');
  lines.push('');
  lines.push('All 6 base treatments available (see DECANTR.md for usage).');
  if (input.recipeDecorators.length > 0) {
    lines.push(`Recipe decorators: ${input.recipeDecorators.join(', ')}`);
  }
  lines.push('');
```

- [ ] **Step 4: Update the decorator list builders (~lines 2560-2590 and 2750-2790)**

Find where the decorator list is built from `recipeData.decorators` and passed to `SectionContextInput`. Update to:

```typescript
    const recipeDecoratorNames = recipeData?.decorators
      ? Object.keys(recipeData.decorators)
      : [];
```

Pass `treatments: ['d-interactive', 'd-surface', 'd-data', 'd-control', 'd-section', 'd-annotation']` and `recipeDecorators: recipeDecoratorNames` to `SectionContextInput`.

- [ ] **Step 5: Update context-gen.test.ts**

In `packages/cli/test/context-gen.test.ts`, update `makeSectionInput()` factory (lines 21-37) to use the new field names:

```typescript
function makeSectionInput(overrides: Partial<SectionContextInput> = {}): SectionContextInput {
  return {
    // ... existing fields ...
    treatments: ['d-interactive', 'd-surface', 'd-data', 'd-control', 'd-section', 'd-annotation'],
    recipeDecorators: ['carbon-glass', 'carbon-code'],
    ...overrides,
  };
}
```

Update assertions that check for `decorators.css` → `treatments.css`, and decorator compact references → treatment references.

- [ ] **Step 6: Run full test suite**

Run: `cd packages/cli && pnpm test -- --run`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/scaffold.ts packages/cli/test/context-gen.test.ts
git commit -m "feat(cli): update context generation for treatment system"
```

---

### Task 8: Update and fix all remaining CLI tests

**Files:**
- Modify: `packages/cli/test/scaffold.test.ts`

- [ ] **Step 1: Update generateDecoratorRule tests**

The `generateDecoratorRule` function is still used by `generateTreatmentCSS` for Layer 3 (recipe decorators). The existing tests for it (lines 5-163) should still pass. Run them:

Run: `cd packages/cli && pnpm test -- --run scaffold`

If tests fail due to import changes or removed exports, update imports. The `generateDecoratorsCSS` test (line 165-170) should be removed or replaced with a `generateTreatmentCSS` integration test.

- [ ] **Step 2: Remove generateDecoratorsCSS test**

The old `generateDecoratorsCSS` function is no longer the primary entry point. Remove the test that checks for "No recipe decorators available" fallback (lines 165-170) and replace with:

```typescript
describe('generateTreatmentCSS integration', () => {
  it('produces complete CSS with recipe data', () => {
    const { generateTreatmentCSS } = await import('../src/treatments.js');
    const spatialTokens = {
      '--d-section-py': '5rem',
      '--d-interactive-py': '0.5rem',
      '--d-interactive-px': '1rem',
      '--d-surface-p': '1.25rem',
      '--d-data-py': '0.625rem',
      '--d-control-py': '0.5rem',
      '--d-content-gap': '1rem',
    };
    const decorators = {
      'carbon-glass': 'Glassmorphic panel with backdrop-filter blur(12px), semi-transparent surface background, 1px border.',
    };
    const css = generateTreatmentCSS(spatialTokens, undefined, decorators, 'carbon');
    expect(css).toContain('.d-interactive');
    expect(css).toContain('.carbon-glass');
    expect(css).toContain('backdrop-filter');
  });
});
```

- [ ] **Step 3: Run full test suite**

Run: `cd packages/cli && pnpm build && pnpm test -- --run`
Expected: All tests PASS

- [ ] **Step 4: Bump CLI version**

In `packages/cli/package.json`, bump version from `1.5.2` to `1.5.3`.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/
git commit -m "feat(cli): visual treatment system — tests passing, version bump"
```

---

## Phase 2: Content + Documentation

### Task 9: Update carbon recipe in decantr-content

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-content/recipes/carbon.json`

- [ ] **Step 1: Add treatment_overrides to carbon recipe**

In `/Users/davidaimi/projects/decantr-content/recipes/carbon.json`, add after the `decorators` field:

```json
"treatment_overrides": {
  "d-surface": {
    "background": "rgba(31, 31, 35, 0.8)",
    "backdrop-filter": "blur(8px)",
    "-webkit-backdrop-filter": "blur(8px)"
  }
}
```

This applies carbon's signature glassmorphic effect to all container surfaces.

- [ ] **Step 2: Validate**

Run: `cd /Users/davidaimi/projects/decantr-content && node validate.js`
Expected: All validations pass

- [ ] **Step 3: Commit and push**

```bash
cd /Users/davidaimi/projects/decantr-content
git add recipes/carbon.json
git commit -m "feat(carbon): add treatment_overrides for glass surface"
git push origin main
```

This triggers GitHub Actions → sync-to-registry.js → API update.

- [ ] **Step 4: Verify API sync**

Run: `curl -s "https://api.decantr.ai/v1/recipes/@official/carbon" | python3 -c "import sys,json; d=json.load(sys.stdin); print('treatment_overrides' in d.get('data',{}).get('data',{}))"`
Expected: `True` (may take 1-2 minutes for GH Actions to complete)

---

### Task 10: Update monorepo documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/css-scaffolding-guide.md`
- Modify: `docs/architecture/scaffolding-flow.md`
- Modify: `packages/css/README.md`

- [ ] **Step 1: Update CLAUDE.md**

In the root `CLAUDE.md`, update the following sections:

**Guard Rules section** — update Rule 2 description:
- Change "Visual recipe used in code must match the Essence recipe" to "Visual recipe and treatments used in code must match the Essence recipe"

**CSS Discipline** in the engineering skill references — add:
- "Use treatment classes (`d-interactive`, `d-surface`, `d-data`, `d-control`, `d-section`, `d-annotation`) for visual consistency. Recipe decorators for visual identity only."

**Content Architecture section** — update the `treatments.css` reference:
- Change any `decorators.css` references to `treatments.css`

- [ ] **Step 2: Update docs/css-scaffolding-guide.md**

Update:
- Quick Start: change `decorators.css` → `treatments.css`
- Import order: update file name
- `@layer` references: add `decantr.treatments` layer
- Replace decorator examples with treatment examples

- [ ] **Step 3: Update docs/architecture/scaffolding-flow.md**

Update:
- Flow diagram: `decorators` → `treatment_overrides` + `decorators`
- `decorators.css` → `treatments.css` in the output file diagram
- Guard rule 2 description

- [ ] **Step 4: Update packages/css/README.md**

Update any references to `decorators.css` → `treatments.css`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/css-scaffolding-guide.md docs/architecture/scaffolding-flow.md packages/css/README.md
git commit -m "docs: update all documentation for visual treatment system"
```

---

### Task 11: Update MCP server tool descriptions

**Files:**
- Modify: `packages/mcp-server/src/tools.ts:224-237` (decantr_resolve_recipe)
- Modify: `packages/mcp-server/src/tools.ts:359-372` (decantr_get_section_context)

- [ ] **Step 1: Update decantr_resolve_recipe description**

Change (line ~225):
```typescript
'Get recipe decoration rules including shell styles, spatial hints, visual effects, and pattern preferences.'
```
to:
```typescript
'Get recipe visual treatment overrides, decoration rules, shell styles, spatial hints, visual effects, and pattern preferences.'
```

- [ ] **Step 2: Update decantr_get_section_context description**

Change (line ~360):
```typescript
'Get the self-contained context for a specific section of the project. Returns guard rules, theme tokens, decorators, pattern specs, zone context, and pages — everything an AI needs to work on that section.'
```
to:
```typescript
'Get the self-contained context for a specific section of the project. Returns guard rules, theme tokens, visual treatments, recipe decorators, pattern specs, zone context, and pages — everything an AI needs to work on that section.'
```

- [ ] **Step 3: Build and bump version**

Run: `cd packages/mcp-server && pnpm build`
Bump version in `packages/mcp-server/package.json` from `1.0.0-beta.9` to `1.0.0-beta.10`.

- [ ] **Step 4: Commit**

```bash
git add packages/mcp-server/
git commit -m "docs(mcp): update tool descriptions for treatment system"
```

---

## Phase 3: Validate

### Task 12: Update harness skill with treatment coverage scorecard

**Files:**
- Modify: `/Users/davidaimi/projects/decantr-monorepo/.claude/skills/harness.md`

- [ ] **Step 1: Add Treatment Coverage Scorecard section**

In the harness skill, find **Section F: Visual Quality Scorecard** (~line 182). Replace it with:

```markdown
### F: Treatment Coverage Scorecard

For each of the 6 visual treatment categories, evaluate whether the LLM used the generated classes:

| Treatment | Classes in CSS | Used by LLM (pages) | Improvised Instead | Inline Styles | Coverage % |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Interactive Surface (d-interactive) | count | N/M | count | count | % |
| Container Surface (d-surface) | count | N/M | count | count | % |
| Data Display (d-data) | count | N/M | count | count | % |
| Form Control (d-control) | count | N/M | count | count | % |
| Section Rhythm (d-section) | count | N/M | count | count | % |
| Inline Annotation (d-annotation) | count | N/M | count | count | % |
| **TOTAL** | | | | | **avg%** |

"Coverage" = (pages where LLM used treatment class) / (pages where that category applies).
Target: 80%+ across all categories. Inline styles for treatment-covered elements should be near zero.
```

- [ ] **Step 2: Update Section P (Decorator Completeness) to Treatment Completeness**

Find **Section P: Decorator CSS Completeness Audit** (~line 366). Replace decorator table with:

```markdown
### P: Treatment Completeness Audit

For EACH base treatment in treatments.css, evaluate completeness:

| Treatment | Has base? | Has hover? | Has focus? | Has active? | Has disabled? | Has variants? | Has transitions? | Grade |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| d-interactive | Y/N | Y/N | Y/N | Y/N | Y/N | primary/ghost/danger | Y/N | A-F |
| d-surface | Y/N | Y/N | N/A | N/A | N/A | raised/overlay | Y/N | A-F |
| d-data | Y/N | Y/N (row) | N/A | N/A | N/A | header/row/cell | N/A | A-F |
| d-control | Y/N | N/A | Y/N | N/A | Y/N | error | Y/N | A-F |
| d-section | Y/N | N/A | N/A | N/A | N/A | adjacent | N/A | A-F |
| d-annotation | Y/N | N/A | N/A | N/A | N/A | success/error/warning/info | N/A | A-F |

Then evaluate recipe decorators separately (same format as before).
```

- [ ] **Step 3: Update references throughout harness**

Update any references to `decorators.css` → `treatments.css`, `decorators.md` → `treatments.md`, and "decorator" terminology where it refers to the base treatment system.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/harness.md
git commit -m "feat(harness): add treatment coverage scorecard and completeness audit"
```

---

### Task 13: Publish packages

**Files:**
- `packages/essence-spec/package.json`
- `packages/registry/package.json`
- `packages/cli/package.json`
- `packages/mcp-server/package.json`

- [ ] **Step 1: Build all packages**

Run: `pnpm build`
Expected: All packages build successfully

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 3: Publish in dependency order**

```bash
cd packages/essence-spec && npm publish
cd ../registry && npm publish
cd ../cli && npm publish
cd ../mcp-server && npm publish
```

- [ ] **Step 4: Verify published versions**

```bash
npm view @decantr/essence-spec version  # 1.0.0-beta.9
npm view @decantr/registry version      # 1.0.0-beta.9
npm view @decantr/cli version           # 1.5.3
npm view @decantr/mcp-server version    # 1.0.0-beta.10
```

- [ ] **Step 5: Commit any lockfile changes**

```bash
git add pnpm-lock.yaml
git commit -m "chore: publish treatment system packages"
```

---

### Task 14: Re-scaffold showcases and run harness

**Files:**
- `apps/showcase/agent-marketplace/` (clean + re-init)

- [ ] **Step 1: Clean agent-marketplace**

```bash
cd apps/showcase/agent-marketplace
rm -rf decantr.essence.json DECANTR.md .decantr/ src/styles/ dist/
```

- [ ] **Step 2: Re-scaffold**

```bash
node ../../../packages/cli/dist/bin.js sync
node ../../../packages/cli/dist/bin.js init --blueprint=agent-marketplace --existing --yes
```

- [ ] **Step 3: Verify treatment files generated**

```bash
ls src/styles/treatments.css  # should exist
grep 'd-interactive' src/styles/treatments.css  # should find treatment classes
grep 'd-section' src/styles/treatments.css      # should find section rhythm
grep '--d-section-py' src/styles/tokens.css     # should find spatial tokens
cat .decantr/context/treatments.md              # should show treatment + recipe reference
```

- [ ] **Step 4: Run harness**

Run the full harness against the re-scaffolded agent-marketplace using the updated harness skill. Compare Treatment Coverage Scorecard to Run 2 baseline. Record Run 3 metrics.

- [ ] **Step 5: Commit scaffold output**

```bash
git add apps/showcase/agent-marketplace/
git commit -m "chore: re-scaffold agent-marketplace with treatment system"
```

---

## Summary

| Phase | Tasks | Key Deliverables |
|-------|:-----:|-----------------|
| **Phase 1: Core** | 1-8 | essence-spec spatial tokens, registry types, CLI treatment generation, DECANTR.md template, tests |
| **Phase 2: Content + Docs** | 9-11 | Carbon recipe override, all documentation, MCP descriptions |
| **Phase 3: Validate** | 12-14 | Harness update, package publish, re-scaffold + harness run |
| **Phase 4: Iterate** | (post-harness) | Data-driven P0-P4 based on Run 3 results |
