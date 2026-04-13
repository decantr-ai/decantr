# Treatment Spatial Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Decantr treatment a density-responsive spatial contract so the AI scaffolder never needs inline styles for spacing.

**Architecture:** CSS custom property `--d-density-scale` is set by `d-section[data-density]` and inherited by all descendant treatments. Each treatment multiplies its spatial properties by this scale. New tokens (`--d-label-mb`, `--d-section-gap`, `--d-annotation-mt`, `--d-label-px`) are computed by the existing density pipeline. Shell guidance becomes structured fields instead of prose.

**Tech Stack:** TypeScript, CSS custom properties, vitest, JSON content files

**Spec:** `docs/specs/2026-04-08-treatment-spatial-contracts-design.md`

---

### Task 1: Extend SpatialTokens type and export SpatialTokenHints

**Files:**
- Modify: `packages/essence-spec/src/types.ts:88-96`
- Modify: `packages/essence-spec/src/density.ts:1,64-68`
- Modify: `packages/essence-spec/src/index.ts:44-45`
- Test: `packages/essence-spec/test/density.test.ts`

- [ ] **Step 1: Write failing test — new tokens exist in SpatialTokens output**

Add to the bottom of the `computeSpatialTokens` describe block in `packages/essence-spec/test/density.test.ts`:

```typescript
  it('includes new spatial contract tokens for comfortable density', () => {
    const tokens = computeSpatialTokens('comfortable');
    expect(tokens['--d-label-mb']).toBe('0.75rem');
    expect(tokens['--d-label-px']).toBe('0.75rem');
    expect(tokens['--d-section-gap']).toBe('1.5rem');
    expect(tokens['--d-annotation-mt']).toBe('0.5rem');
  });

  it('scales new spatial contract tokens for compact density (except label-px)', () => {
    const tokens = computeSpatialTokens('compact');
    expect(tokens['--d-label-mb']).toBe('0.488rem');
    expect(tokens['--d-label-px']).toBe('0.75rem'); // NOT scaled
    expect(tokens['--d-section-gap']).toBe('0.975rem');
    expect(tokens['--d-annotation-mt']).toBe('0.325rem');
  });

  it('scales new spatial contract tokens for spacious density (except label-px)', () => {
    const tokens = computeSpatialTokens('spacious');
    expect(tokens['--d-label-mb']).toBe('1.05rem');
    expect(tokens['--d-label-px']).toBe('0.75rem'); // NOT scaled
    expect(tokens['--d-section-gap']).toBe('2.1rem');
    expect(tokens['--d-annotation-mt']).toBe('0.7rem');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/essence-spec test`
Expected: FAIL — properties `--d-label-mb`, `--d-label-px`, `--d-section-gap`, `--d-annotation-mt` do not exist on type `SpatialTokens`

- [ ] **Step 3: Extend SpatialTokens interface**

In `packages/essence-spec/src/types.ts`, replace lines 88-96:

```typescript
export interface SpatialTokens {
  '--d-section-py': string;
  '--d-interactive-py': string;
  '--d-interactive-px': string;
  '--d-surface-p': string;
  '--d-data-py': string;
  '--d-control-py': string;
  '--d-content-gap': string;
  '--d-label-mb': string;
  '--d-label-px': string;
  '--d-section-gap': string;
  '--d-annotation-mt': string;
}
```

- [ ] **Step 4: Move SpatialTokenHints to types.ts and export it**

In `packages/essence-spec/src/types.ts`, add after the `SpatialTokens` interface:

```typescript
export interface SpatialTokenHints {
  section_padding?: string | null;
  density_bias?: number;
  content_gap_shift?: number;
  label_content_gap?: string | null;
}
```

Add `ShellGuidance` type after that:

```typescript
export interface ShellGuidance {
  section_label_treatment?: string;
  section_density?: DensityLevel;
  [key: string]: string | DensityLevel | undefined;
}
```

- [ ] **Step 5: Update density.ts imports and remove local SpatialTokenHints**

In `packages/essence-spec/src/density.ts`, change line 1:

```typescript
import type { Density, DensityLevel, SpatialTokens, SpatialTokenHints } from './types.js';
```

Remove lines 64-68 (the local `SpatialTokenHints` interface).

- [ ] **Step 6: Add new tokens to BASE_TOKENS in density.ts**

In `packages/essence-spec/src/density.ts`, replace lines 76-84:

```typescript
const BASE_TOKENS = {
  '--d-section-py': 5,
  '--d-interactive-py': 0.5,
  '--d-interactive-px': 1,
  '--d-surface-p': 1.25,
  '--d-data-py': 0.625,
  '--d-control-py': 0.5,
  '--d-content-gap': 1,
  '--d-label-mb': 0.75,
  '--d-label-px': 0.75,
  '--d-section-gap': 1.5,
  '--d-annotation-mt': 0.5,
} as const;
```

- [ ] **Step 7: Add non-scaling logic for `--d-label-px` and `label_content_gap` override in computeSpatialTokens**

In `packages/essence-spec/src/density.ts`, inside the `computeSpatialTokens` function, add handling for the new special cases. Replace the loop body (lines 104-123) with:

```typescript
  for (const [key, base] of Object.entries(BASE_TOKENS)) {
    const tokenKey = key as keyof SpatialTokens;

    // --d-label-px is a visual anchor — never density-scaled
    if (tokenKey === '--d-label-px') {
      result[tokenKey] = toRemString(base);
      continue;
    }

    if (tokenKey === '--d-section-py' && spatialHints?.section_padding) {
      const pxMatch = spatialHints.section_padding.match(/^(\d+(?:\.\d+)?)px$/);
      if (pxMatch) {
        const remValue = parseFloat(pxMatch[1]) / 16;
        result[tokenKey] = toRemString(remValue * scale * biasMultiplier);
        continue;
      }
      const remMatch = spatialHints.section_padding.match(/^(\d+(?:\.\d+)?)rem$/);
      if (remMatch) {
        const remValue = parseFloat(remMatch[1]);
        result[tokenKey] = toRemString(remValue * scale * biasMultiplier);
        continue;
      }
    }

    // --d-label-mb can be overridden by theme's label_content_gap
    if (tokenKey === '--d-label-mb' && spatialHints?.label_content_gap) {
      const remMatch = spatialHints.label_content_gap.match(/^(\d+(?:\.\d+)?)rem$/);
      if (remMatch) {
        const remValue = parseFloat(remMatch[1]);
        result[tokenKey] = toRemString(remValue * scale * biasMultiplier);
        continue;
      }
    }

    let computed = base * scale * biasMultiplier;

    if (tokenKey === '--d-content-gap' && spatialHints?.content_gap_shift) {
      computed += spatialHints.content_gap_shift * 0.25;
    }

    result[tokenKey] = toRemString(computed);
  }
```

- [ ] **Step 8: Update exports in index.ts**

In `packages/essence-spec/src/index.ts`, update the density/spatial exports (lines 44-45):

```typescript
export { computeDensity, computeSpatialTokens } from './density.js';
export type { SpatialTokens, SpatialTokenHints, ShellGuidance } from './types.js';
```

- [ ] **Step 9: Update existing density tests to include new token fields**

The existing tests at lines 58-142 use `toEqual` which does strict equality — they will fail because the result now has 11 properties instead of 7. Update each existing `computeSpatialTokens` test to include the 4 new tokens.

In `packages/essence-spec/test/density.test.ts`, update the test at lines 58-69 (`returns base values for comfortable density with no spatial hints`):

```typescript
  it('returns base values for comfortable density with no spatial hints', () => {
    const tokens = computeSpatialTokens('comfortable');
    expect(tokens).toEqual({
      '--d-section-py': '5rem',
      '--d-interactive-py': '0.5rem',
      '--d-interactive-px': '1rem',
      '--d-surface-p': '1.25rem',
      '--d-data-py': '0.625rem',
      '--d-control-py': '0.5rem',
      '--d-content-gap': '1rem',
      '--d-label-mb': '0.75rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '1.5rem',
      '--d-annotation-mt': '0.5rem',
    });
  });
```

Update the test at lines 71-82 (`scales values by 0.65 for compact density`):

```typescript
  it('scales values by 0.65 for compact density', () => {
    const tokens = computeSpatialTokens('compact');
    expect(tokens).toEqual({
      '--d-section-py': '3.25rem',
      '--d-interactive-py': '0.325rem',
      '--d-interactive-px': '0.65rem',
      '--d-surface-p': '0.813rem',
      '--d-data-py': '0.406rem',
      '--d-control-py': '0.325rem',
      '--d-content-gap': '0.65rem',
      '--d-label-mb': '0.488rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '0.975rem',
      '--d-annotation-mt': '0.325rem',
    });
  });
```

Update the test at lines 84-95 (`scales values by 1.4 for spacious density`):

```typescript
  it('scales values by 1.4 for spacious density', () => {
    const tokens = computeSpatialTokens('spacious');
    expect(tokens).toEqual({
      '--d-section-py': '7rem',
      '--d-interactive-py': '0.7rem',
      '--d-interactive-px': '1.4rem',
      '--d-surface-p': '1.75rem',
      '--d-data-py': '0.875rem',
      '--d-control-py': '0.7rem',
      '--d-content-gap': '1.4rem',
      '--d-label-mb': '1.05rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '2.1rem',
      '--d-annotation-mt': '0.7rem',
    });
  });
```

Update the test at lines 103-115 (`applies density_bias multiplier`):

```typescript
  it('applies density_bias multiplier', () => {
    const tokens = computeSpatialTokens('comfortable', { density_bias: 2 });
    expect(tokens).toEqual({
      '--d-section-py': '6rem',
      '--d-interactive-py': '0.6rem',
      '--d-interactive-px': '1.2rem',
      '--d-surface-p': '1.5rem',
      '--d-data-py': '0.75rem',
      '--d-control-py': '0.6rem',
      '--d-content-gap': '1.2rem',
      '--d-label-mb': '0.9rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '1.8rem',
      '--d-annotation-mt': '0.6rem',
    });
  });
```

- [ ] **Step 10: Add test for label_content_gap theme override**

Add to `packages/essence-spec/test/density.test.ts`:

```typescript
  it('uses label_content_gap override for --d-label-mb', () => {
    const tokens = computeSpatialTokens('comfortable', { label_content_gap: '1rem' });
    // 1rem × 1.0 density × (1 + 0/10) bias = 1rem
    expect(tokens['--d-label-mb']).toBe('1rem');
    // Other tokens unaffected
    expect(tokens['--d-section-py']).toBe('5rem');
  });

  it('uses section_padding as rem string', () => {
    const tokens = computeSpatialTokens('comfortable', { section_padding: '5rem' });
    // 5rem × 1.0 density × (1 + 0/10) bias = 5rem
    expect(tokens['--d-section-py']).toBe('5rem');
  });
```

- [ ] **Step 11: Run all density tests to verify they pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/essence-spec test`
Expected: ALL PASS

- [ ] **Step 12: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/essence-spec/src/types.ts packages/essence-spec/src/density.ts packages/essence-spec/src/index.ts packages/essence-spec/test/density.test.ts
git commit -m "feat(essence-spec): add spatial contract tokens and density inheritance types"
```

---

### Task 2: Treatment CSS — density inheritance on d-section

**Files:**
- Modify: `packages/cli/src/treatments.ts:227-241`
- Test: `packages/cli/test/treatments.test.ts`

- [ ] **Step 1: Write failing tests for density inheritance**

Add to the `generateTreatmentCSS` describe block in `packages/cli/test/treatments.test.ts`. First update `baseSpatialTokens` at lines 4-12 to include the new tokens:

```typescript
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
```

Then add new test cases:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter decantr test`
Expected: FAIL — old d-section CSS doesn't contain `--d-density-scale`

- [ ] **Step 3: Implement density inheritance on d-section**

In `packages/cli/src/treatments.ts`, replace lines 227-241 (all d-section rules) with:

```typescript
  // ── Section Rhythm ──
  emitRule('.d-section', [
    ['--d-density-scale', '1'],
    ['padding', 'calc(var(--d-section-py) * var(--d-density-scale)) 0'],
  ]);

  // Density variants — broadcast scale to descendants
  lines.push('.d-section[data-density="compact"] {');
  lines.push('  --d-density-scale: 0.65;');
  lines.push('}');
  lines.push('');

  lines.push('.d-section[data-density="spacious"] {');
  lines.push('  --d-density-scale: 1.4;');
  lines.push('}');
  lines.push('');

  // Adjacent section separator — density-aware gap
  lines.push('.d-section + .d-section {');
  lines.push('  border-top: 1px solid transparent;');
  lines.push('  border-image: linear-gradient(to right, transparent, var(--d-border), transparent) 1;');
  lines.push('  margin-top: calc(var(--d-section-gap) * var(--d-density-scale, 1));');
  lines.push('}');
  lines.push('');
```

- [ ] **Step 4: Update existing section test (line 94) to match new CSS**

In `packages/cli/test/treatments.test.ts`, replace the existing section test (lines 94-105):

```typescript
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter decantr test`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/cli/src/treatments.ts packages/cli/test/treatments.test.ts
git commit -m "feat(cli): add density inheritance via --d-density-scale on d-section"
```

---

### Task 3: Treatment CSS — d-label spatial contract and [data-anchor] variant

**Files:**
- Modify: `packages/cli/src/treatments.ts:280-287`
- Test: `packages/cli/test/treatments.test.ts`

- [ ] **Step 1: Write failing tests for d-label spatial contract**

Add to `packages/cli/test/treatments.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter decantr test`
Expected: FAIL — d-label has no `display: block`, no `margin-bottom`, no `[data-anchor]` variant

- [ ] **Step 3: Implement d-label spatial contract**

In `packages/cli/src/treatments.ts`, replace lines 280-287 (the d-label emitRule call) with:

```typescript
  // ── Label ──
  emitRule('.d-label', [
    ['font-size', '0.7rem'],
    ['font-weight', '600'],
    ['text-transform', 'uppercase'],
    ['letter-spacing', '0.08em'],
    ['color', 'var(--d-text-muted)'],
    ['font-family', 'var(--d-font-mono, ui-monospace, monospace)'],
    ['display', 'block'],
    ['margin-bottom', 'calc(var(--d-label-mb) * var(--d-density-scale, 1))'],
  ]);

  // Anchored section header variant — accent border
  emitRule('.d-label[data-anchor]', [
    ['padding-left', 'var(--d-label-px)'],
    ['border-left', '2px solid var(--d-accent)'],
  ]);
```

- [ ] **Step 4: Update existing d-label test to also check new properties**

In `packages/cli/test/treatments.test.ts`, replace the existing d-label test (lines 223-232):

```typescript
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter decantr test`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/cli/src/treatments.ts packages/cli/test/treatments.test.ts
git commit -m "feat(cli): add d-label spatial contract and [data-anchor] variant"
```

---

### Task 4: Treatment CSS — density-aware spatial on remaining treatments

**Files:**
- Modify: `packages/cli/src/treatments.ts` (d-surface, d-interactive, d-control, d-data, d-annotation)
- Test: `packages/cli/test/treatments.test.ts`

- [ ] **Step 1: Write failing tests for density-aware spatial properties**

Add to `packages/cli/test/treatments.test.ts`:

```typescript
  // ── Density-aware spatial on all treatments ──

  it('uses density-scale in d-surface padding', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const surfaceBlock = css.split('.d-surface {')[1]?.split('}')[0] ?? '';
    expect(surfaceBlock).toContain('calc(var(--d-surface-p) * var(--d-density-scale, 1))');
  });

  it('uses density-scale in d-interactive vertical padding', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const interactiveBlock = css.split('.d-interactive {')[1]?.split('}')[0] ?? '';
    expect(interactiveBlock).toContain('calc(var(--d-interactive-py) * var(--d-density-scale, 1))');
  });

  it('uses density-scale in d-control vertical padding', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const controlBlock = css.split('.d-control {')[1]?.split('}')[0] ?? '';
    expect(controlBlock).toContain('calc(var(--d-control-py) * var(--d-density-scale, 1))');
  });

  it('uses density-scale in d-data-header vertical padding', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const headerBlock = css.split('.d-data-header {')[1]?.split('}')[0] ?? '';
    expect(headerBlock).toContain('calc(var(--d-data-py) * var(--d-density-scale, 1))');
  });

  it('uses density-scale in d-data-cell vertical padding', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const cellBlock = css.split('.d-data-cell {')[1]?.split('}')[0] ?? '';
    expect(cellBlock).toContain('calc(var(--d-data-py) * var(--d-density-scale, 1))');
  });

  it('includes density-aware margin-top on d-annotation', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    const annotationBlock = css.split('.d-annotation {')[1]?.split('}')[0] ?? '';
    expect(annotationBlock).toContain('calc(var(--d-annotation-mt) * var(--d-density-scale, 1))');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter decantr test`
Expected: FAIL — current treatments use plain `var()` without `calc()` density scaling

- [ ] **Step 3: Update d-surface base rule (line 130)**

In `packages/cli/src/treatments.ts`, replace the d-surface emitRule call (lines 130-136):

```typescript
  emitRule('.d-surface', [
    ['background', 'var(--d-surface)'],
    ['border', '1px solid var(--d-border)'],
    ['border-radius', 'var(--d-radius)'],
    ['box-shadow', 'var(--d-shadow)'],
    ['padding', 'calc(var(--d-surface-p) * var(--d-density-scale, 1))'],
  ]);
```

- [ ] **Step 4: Update d-interactive base rule (line 71)**

In `packages/cli/src/treatments.ts`, replace the d-interactive emitRule (lines 71-84):

```typescript
  emitRule('.d-interactive', [
    ['display', 'inline-flex'],
    ['align-items', 'center'],
    ['gap', '0.5em'],
    ['padding', 'calc(var(--d-interactive-py) * var(--d-density-scale, 1)) var(--d-interactive-px)'],
    ['border', '1px solid var(--d-border)'],
    ['border-radius', 'var(--d-radius)'],
    ['background', 'transparent'],
    ['color', 'var(--d-text)'],
    ['font', 'inherit'],
    ['cursor', 'pointer'],
    ['text-decoration', 'none'],
    ['transition', 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease'],
  ]);
```

- [ ] **Step 5: Update d-control base rule (line 194)**

In `packages/cli/src/treatments.ts`, replace the d-control emitRule (lines 194-204):

```typescript
  emitRule('.d-control', [
    ['background', 'var(--d-surface)'],
    ['color', 'var(--d-text)'],
    ['padding', 'calc(var(--d-control-py) * var(--d-density-scale, 1)) 0.75rem'],
    ['border-radius', 'var(--d-radius)'],
    ['border', '1px solid var(--d-border)'],
    ['width', '100%'],
    ['outline', 'none'],
    ['font', 'inherit'],
    ['transition', 'border-color 0.15s ease, box-shadow 0.15s ease'],
  ]);
```

- [ ] **Step 6: Update d-data-header and d-data-cell (lines 168-177, 187-190)**

Replace d-data-header emitRule (lines 168-177):

```typescript
  emitRule('.d-data-header', [
    ['padding', 'calc(var(--d-data-py) * var(--d-density-scale, 1)) var(--d-content-gap)'],
    ['font-weight', '500'],
    ['color', 'var(--d-text-muted)'],
    ['border-bottom', '1px solid var(--d-border)'],
    ['font-size', '0.75rem'],
    ['text-transform', 'uppercase'],
    ['letter-spacing', '0.05em'],
  ]);
```

Replace d-data-cell emitRule (lines 187-190):

```typescript
  emitRule('.d-data-cell', [
    ['padding', 'calc(var(--d-data-py) * var(--d-density-scale, 1)) var(--d-content-gap)'],
    ['vertical-align', 'middle'],
  ]);
```

- [ ] **Step 7: Update d-annotation base rule (lines 245-256)**

Replace d-annotation emitRule (lines 245-256):

```typescript
  emitRule('.d-annotation', [
    ['display', 'inline-flex'],
    ['align-items', 'center'],
    ['gap', '0.25em'],
    ['font-size', '0.75rem'],
    ['font-weight', '500'],
    ['padding', '0.125rem 0.5rem'],
    ['border-radius', 'var(--d-radius-full)'],
    ['background', 'var(--d-surface)'],
    ['color', 'var(--d-text-muted)'],
    ['white-space', 'nowrap'],
    ['margin-top', 'calc(var(--d-annotation-mt) * var(--d-density-scale, 1))'],
  ]);
```

- [ ] **Step 8: Update existing treatment test for spatial token references (line 122)**

Replace the test at lines 122-131:

```typescript
  it('references spatial tokens with density-scale calc in CSS values', () => {
    const css = generateTreatmentCSS(baseSpatialTokens);
    expect(css).toContain('var(--d-interactive-py)');
    expect(css).toContain('var(--d-interactive-px)');
    expect(css).toContain('var(--d-control-py)');
    expect(css).toContain('var(--d-surface-p)');
    expect(css).toContain('var(--d-section-py)');
    expect(css).toContain('var(--d-data-py)');
    expect(css).toContain('var(--d-content-gap)');
    expect(css).toContain('var(--d-label-mb)');
    expect(css).toContain('var(--d-section-gap)');
    expect(css).toContain('var(--d-annotation-mt)');
    expect(css).toContain('var(--d-density-scale');
  });
```

- [ ] **Step 9: Run all CLI tests to verify they pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter decantr test`
Expected: ALL PASS

- [ ] **Step 10: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/cli/src/treatments.ts packages/cli/test/treatments.test.ts
git commit -m "feat(cli): add density-aware spatial contracts to all treatments"
```

---

### Task 5: Context generation — fix spacing guide and add structured shell guidance

**Files:**
- Modify: `packages/cli/src/scaffold.ts:3190-3209,3244-3257,2476-2482`
- Test: `packages/cli/test/context-gen.test.ts` (or `scaffold-v3.test.ts` if context gen tests live there)

- [ ] **Step 1: Write failing test for spacing guide with spatial hints**

Check which test file has context generation tests, then add:

```typescript
import { computeSpatialTokens } from '@decantr/essence-spec';

describe('generateSpacingGuide', () => {
  it('includes new spatial contract tokens in spacing guide', () => {
    // This tests the output indirectly through generateSectionContext
    // or directly if generateSpacingGuide is exported
    const tokens = computeSpatialTokens('compact');
    expect(tokens['--d-label-mb']).toBeDefined();
    expect(tokens['--d-section-gap']).toBeDefined();
    expect(tokens['--d-annotation-mt']).toBeDefined();
  });
});
```

- [ ] **Step 2: Update generateSpacingGuide to accept spatial hints**

In `packages/cli/src/scaffold.ts`, replace the function at lines 3190-3209:

```typescript
  function generateSpacingGuide(density: string, spatialHints?: SpatialTokenHints): string[] {
    const lines: string[] = [];
    const level = (density === 'compact' || density === 'spacious') ? density : 'comfortable';
    const tokens = computeSpatialTokens(level as 'compact' | 'comfortable' | 'spacious', spatialHints);

    lines.push('## Spacing Guide');
    lines.push('');
    lines.push('| Context | Token | Value | Usage |');
    lines.push('|---------|-------|-------|-------|');
    lines.push(`| Content gap | \`--d-content-gap\` | \`${tokens['--d-content-gap']}\` | Gap between sibling elements |`);
    lines.push(`| Section padding | \`--d-section-py\` | \`${tokens['--d-section-py']}\` | Vertical padding on d-section |`);
    lines.push(`| Surface padding | \`--d-surface-p\` | \`${tokens['--d-surface-p']}\` | Inner padding for d-surface |`);
    lines.push(`| Interactive V | \`--d-interactive-py\` | \`${tokens['--d-interactive-py']}\` | Vertical padding on buttons |`);
    lines.push(`| Interactive H | \`--d-interactive-px\` | \`${tokens['--d-interactive-px']}\` | Horizontal padding on buttons |`);
    lines.push(`| Control | \`--d-control-py\` | \`${tokens['--d-control-py']}\` | Vertical padding on inputs |`);
    lines.push(`| Data row | \`--d-data-py\` | \`${tokens['--d-data-py']}\` | Vertical padding on table rows |`);
    lines.push(`| Label gap | \`--d-label-mb\` | \`${tokens['--d-label-mb']}\` | Gap below d-label section headers |`);
    lines.push(`| Label indent | \`--d-label-px\` | \`${tokens['--d-label-px']}\` | Anchor indent for d-label[data-anchor] |`);
    lines.push(`| Section gap | \`--d-section-gap\` | \`${tokens['--d-section-gap']}\` | Gap between adjacent d-sections |`);
    lines.push(`| Annotation gap | \`--d-annotation-mt\` | \`${tokens['--d-annotation-mt']}\` | Top margin on d-annotation |`);
    lines.push('');

    return lines;
  }
```

Ensure `SpatialTokenHints` is imported at the top of scaffold.ts (from `@decantr/essence-spec`).

- [ ] **Step 3: Pass spatial hints to generateSpacingGuide at the call site**

At the call site (line 3257), the function needs access to the theme's spatial hints. The `generateSectionContext` function needs to receive `spatialHints` as a parameter. Find where `generateSectionContext` is called and thread `spatialHints` through.

Update the call at line 3257 from:

```typescript
    lines.push(...generateSpacingGuide(density));
```

To:

```typescript
    lines.push(...generateSpacingGuide(density, spatialHints));
```

Add `spatialHints?: SpatialTokenHints` to the `generateSectionContext` function parameters, and pass it from the caller in `scaffoldProject` where `themeData.spatial` is available.

- [ ] **Step 4: Add structured section label treatment to shell guidance output**

In `packages/cli/src/scaffold.ts`, replace the shell guidance loop (lines 3244-3253) with:

```typescript
    // Shell Notes — guidance from the shell definition
    if (shellInfo?.guidance && Object.keys(shellInfo.guidance).length > 0) {
      // Structured section label treatment (takes precedence over prose)
      const labelTreatment = shellInfo.guidance.section_label_treatment;
      const sectionDensity = shellInfo.guidance.section_density;

      if (labelTreatment) {
        lines.push('## Section Label Treatment');
        lines.push('');
        lines.push(`Apply \`${labelTreatment}\` to section headers in this shell.`);
        lines.push(`- Uppercase monospace label typography (d-label base treatment)`);
        if (labelTreatment.includes('[data-anchor]')) {
          lines.push(`- Left accent border anchor (data-anchor variant)`);
        }
        lines.push(`- Density-responsive bottom gap via \`--d-label-mb\` x \`--d-density-scale\``);
        if (sectionDensity) {
          const scaleMap: Record<string, string> = { compact: '0.65', comfortable: '1', spacious: '1.4' };
          lines.push('');
          lines.push(`Section density: ${sectionDensity} (--d-density-scale: ${scaleMap[sectionDensity] || '1'})`);
        }
        lines.push('');
      }

      // Remaining prose guidance (skip structured fields already emitted)
      const structuredKeys = new Set(['section_label_treatment', 'section_density']);
      lines.push(`## Shell Notes (${section.shell})`);
      lines.push('');
      for (const [key, value] of Object.entries(shellInfo.guidance)) {
        if (structuredKeys.has(key)) continue;
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        lines.push(`- **${label}:** ${value}`);
      }
      lines.push('');
    }
```

- [ ] **Step 5: Run all CLI tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter decantr test`
Expected: ALL PASS (existing context-gen tests should still pass since we're additive)

- [ ] **Step 6: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/cli/src/scaffold.ts
git commit -m "feat(cli): fix spacing guide mismatch and add structured shell guidance output"
```

---

### Task 6: Update shell content — all 15 shells

**Files:**
- Modify: `../decantr-content/shells/sidebar-main.json`
- Modify: `../decantr-content/shells/sidebar-main-footer.json`
- Modify: `../decantr-content/shells/sidebar-aside.json`
- Modify: `../decantr-content/shells/sidebar-right.json`
- Modify: `../decantr-content/shells/top-nav-main.json`
- Modify: `../decantr-content/shells/top-nav-footer.json`
- Modify: `../decantr-content/shells/top-nav-sidebar.json`
- Modify: `../decantr-content/shells/three-column-browser.json`
- Modify: `../decantr-content/shells/workspace-aside.json`
- Modify: `../decantr-content/shells/chat-portal.json`
- Modify: `../decantr-content/shells/terminal-split.json`
- Modify: `../decantr-content/shells/copilot-overlay.json`
- Modify: `../decantr-content/shells/full-bleed.json`
- Modify: `../decantr-content/shells/minimal-header.json`
- Modify: `../decantr-content/shells/centered.json`

- [ ] **Step 1: Update sidebar-main.json**

In `/Users/davidaimi/projects/decantr-content/shells/sidebar-main.json`, update the `guidance` block:

Change `section_labels` prose and add structured fields:

```json
"section_labels": "Dashboard section labels use d-label[data-anchor] for accent-bordered headers with density-responsive spacing.",
"section_label_treatment": "d-label[data-anchor]",
"section_density": "compact"
```

- [ ] **Step 2: Update sidebar-main-footer.json, sidebar-aside.json, sidebar-right.json**

Same pattern as sidebar-main — add `section_label_treatment: "d-label[data-anchor]"` and `section_density: "compact"` to their guidance blocks. If a shell has no guidance block, create one with just these two fields plus the updated prose.

- [ ] **Step 3: Update top-nav-main.json, top-nav-footer.json**

Add guidance block if missing:

```json
"guidance": {
  "section_label_treatment": "d-label",
  "section_density": "comfortable"
}
```

- [ ] **Step 4: Update top-nav-sidebar.json**

```json
"section_label_treatment": "d-label[data-anchor]",
"section_density": "compact"
```

- [ ] **Step 5: Update three-column-browser.json, workspace-aside.json**

```json
"section_label_treatment": "d-label[data-anchor]",
"section_density": "compact"
```

- [ ] **Step 6: Update chat-portal.json, terminal-split.json, copilot-overlay.json**

```json
"section_label_treatment": "d-label",
"section_density": "compact"
```

- [ ] **Step 7: Update full-bleed.json**

```json
"section_label_treatment": "d-label",
"section_density": "spacious"
```

- [ ] **Step 8: Update minimal-header.json**

```json
"section_label_treatment": "d-label",
"section_density": "comfortable"
```

- [ ] **Step 9: Skip centered.json**

Centered shell is for auth forms — no section labels. No changes needed.

- [ ] **Step 10: Validate all shells**

```bash
cd /Users/davidaimi/projects/decantr-content
node validate.js
```

Expected: 0 errors, 0 warnings

- [ ] **Step 11: Commit**

```bash
cd /Users/davidaimi/projects/decantr-content
git add shells/
git commit -m "feat(shells): add structured section_label_treatment and section_density to all shells"
```

---

### Task 7: Update theme content — convert px to rem and normalize strings

**Files:**
- Modify: `../decantr-content/themes/*.json` (20 files)

- [ ] **Step 1: Audit all theme spatial blocks**

```bash
cd /Users/davidaimi/projects/decantr-content
for f in themes/*.json; do
  echo "=== $(basename $f) ==="
  python3 -c "import json; d=json.load(open('$f')); s=d.get('spatial',{}); print(json.dumps(s, indent=2))"
done
```

Record which themes use `"Npx"` strings for `section_padding` and which use semantic strings.

- [ ] **Step 2: Convert all section_padding px values to rem**

For each theme with a `"Npx"` `section_padding`, convert to rem by dividing by 16:

| Theme | Before | After |
|-------|--------|-------|
| luminarum | `"120px"` | `"7.5rem"` |
| carbon | `"80px"` | `"5rem"` |
| fintech | `"16px"` | `"1rem"` |
| terminal | `"16px"` | `"1rem"` |
| bespoke | `"96px"` | `"6rem"` |
| government | `"48px"` | `"3rem"` |
| glassmorphism | `"80px"` | `"5rem"` |
| (others) | audit and convert | |

- [ ] **Step 3: Normalize semantic string values**

For themes using string names like `"generous"`, `"comfortable"`, convert to concrete values:

| Semantic | `section_padding` rem | `density_bias` number |
|----------|----------------------|----------------------|
| `"tight"` | `"1rem"` | 2 |
| `"compact"` | `"2rem"` | 2 |
| `"standard"` | `"4rem"` | 0 |
| `"generous"` | `"6rem"` | -1 |
| `"expansive"` | `"7.5rem"` | -1 |
| `"comfortable"` (density_bias) | — | 0 |
| `"spacious"` (density_bias) | — | -1 |

- [ ] **Step 4: Validate all themes**

```bash
cd /Users/davidaimi/projects/decantr-content
node validate.js
```

Expected: 0 errors, 0 warnings

- [ ] **Step 5: Commit**

```bash
cd /Users/davidaimi/projects/decantr-content
git add themes/
git commit -m "feat(themes): convert section_padding to rem, normalize semantic spatial values"
```

---

### Task 8: Build packages and run full test suite

**Files:**
- No new files — verification only

- [ ] **Step 1: Build essence-spec**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm --filter @decantr/essence-spec build
```

Expected: Build succeeds

- [ ] **Step 2: Build CLI**

```bash
pnpm --filter decantr build
```

Expected: Build succeeds (CLI depends on essence-spec)

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: ALL PASS across all packages

- [ ] **Step 4: Type-check the entire workspace**

```bash
pnpm lint
```

Expected: No type errors

- [ ] **Step 5: Commit if any build artifacts changed**

Only commit if package build outputs changed unexpectedly. Otherwise, no commit needed.

---

### Task 9: Harness test — cold init against registry-platform

**Files:**
- Clean and rebuild: `apps/showcase/registry-platform/`

- [ ] **Step 1: Clean the showcase target**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/showcase/registry-platform
rm -rf decantr.essence.json DECANTR.md .decantr/ src/ dist/
mkdir src
```

- [ ] **Step 2: Sync registry and init**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/showcase/registry-platform
node ../../../packages/cli/dist/bin.js sync
node ../../../packages/cli/dist/bin.js init --blueprint=registry-platform --existing --yes
```

Expected: Init completes without errors, generates essence, DECANTR.md, .decantr/context/ files, and src/styles/

- [ ] **Step 3: Verify new tokens in tokens.css**

```bash
grep -E "d-label-mb|d-label-px|d-section-gap|d-annotation-mt" apps/showcase/registry-platform/src/styles/tokens.css
```

Expected: All 4 new tokens present with computed rem values

- [ ] **Step 4: Verify density inheritance in treatments.css**

```bash
grep -E "d-density-scale|data-anchor" apps/showcase/registry-platform/src/styles/treatments.css
```

Expected: `--d-density-scale` set on d-section, `d-label[data-anchor]` variant present

- [ ] **Step 5: Verify spacing guide matches tokens.css**

Read `.decantr/context/section-user-dashboard.md` and compare spacing guide values with `src/styles/tokens.css`. They must match.

- [ ] **Step 6: Verify structured section label treatment in context**

Read `.decantr/context/section-user-dashboard.md` and check for the "Section Label Treatment" heading with `d-label[data-anchor]` instruction.

- [ ] **Step 7: Dispatch harness agent for full scaffold and build**

Use the harness prompt template from `.claude/skills/harness.md` with `model: "opus"`, targeting `apps/showcase/registry-platform/`. The harness agent builds all pages and produces the full audit report.

Key success criteria from the harness:
- **Zero inline styles for spacing** (`paddingLeft`, `marginBottom`, `borderLeft.*accent` in scaffolded components)
- **d-label[data-anchor] used on every section header** in dashboard pages
- **Treatment coverage for d-label > 80%** across all pages
- **Spacing guide values match tokens.css** (no mismatch)

- [ ] **Step 8: Review harness results and document baseline**

Record the harness metrics for future comparison. If P0 issues are found, address them before proceeding.
