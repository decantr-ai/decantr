# Treatment Spatial Contracts with Density Inheritance

**Date:** 2026-04-08
**Status:** Proposed
**Scope:** `packages/essence-spec`, `packages/cli`, `decantr-content/shells`, `decantr-content/themes`
**Impact:** All blueprints, all themes, all shells. Zero changes to blueprints, archetypes, or patterns.

---

## Problem

Decantr's treatment system defines only **visual properties** (colors, fonts, borders, backgrounds). It has no **spatial contract** — no treatment declares how it relates to its siblings, container, or children.

This forces the AI scaffolder to improvise spacing with inline styles. The result:
- 15+ inline `style={{ paddingLeft, marginBottom, borderLeft }}` declarations for `d-label` alone in the registry-platform scaffold
- Inconsistent values (0.5rem, 0.75rem, 1rem) for the same visual pattern across pages
- Section headers that collide with content below them (no breathing room)
- Compact density (`data-density="compact"`) only halves section padding — interior elements are oblivious
- Shell guidance is prose with embedded CSS snippets that the AI copies literally as inline styles

### Root Cause Chain

```
RC1: d-label has no spatial properties (purely typographic)
  → RC2: Shell guidance is prose → AI uses inline styles
  → RC3: Compact density doesn't scale interior spacing
  → RC4: Section-py token is inflated for dashboard context
  → RC5: No body gap → sections stack without controlled spacing
```

Fixing at the treatment infrastructure level eliminates all five root causes.

---

## Design

### Principle: Density as Inherited Context

Instead of each element declaring its own density response, the containing `d-section` **broadcasts** a density scale via CSS custom property inheritance. All interior treatments multiply their spatial values by this inherited scale.

```
d-section[data-density="compact"]
  └─ sets: --d-density-scale: 0.65
       └─ d-label reads it → margin-bottom shrinks
       └─ d-surface reads it → internal padding shrinks
       └─ d-interactive reads it → padding shrinks
       └─ d-control reads it → padding shrinks
       └─ d-annotation reads it → margin shrinks
```

CSS custom property inheritance makes this automatic — no JavaScript, no extra data attributes, no class permutations.

---

### 1. New Spatial Tokens

Added to `BASE_TOKENS` in `packages/essence-spec/src/density.ts` and computed with the same formula as existing tokens: `BASE × DENSITY_SCALE × biasMultiplier`.

| Token | Base (rem) | Compact (×0.65) | Comfortable (×1.0) | Spacious (×1.4) | Density-Scaled? | Purpose |
|-------|-----------|-----------------|--------------------|-----------------|----|---------|
| `--d-label-mb` | 0.75 | 0.488 | 0.75 | 1.05 | Yes | Label → content gap |
| `--d-label-px` | 0.75 | 0.75 | 0.75 | 0.75 | **No** | Label anchor indent (visual anchor, not rhythm) |
| `--d-section-gap` | 1.5 | 0.975 | 1.5 | 2.1 | Yes | Gap between adjacent d-sections |
| `--d-annotation-mt` | 0.5 | 0.325 | 0.5 | 0.7 | Yes | Annotation top margin |

All values are `rem` — no hardcoded pixels for spacing. Border widths remain `px` (consistent with existing treatment system and CSS best practice for crisp physical-pixel rendering).

**Theme override:** Themes can optionally set `label_content_gap` in their `spatial` block. When present, it replaces the base value of `--d-label-mb` before density scaling. Same mechanism as the existing `section_padding` override.

**`--d-label-px` is intentionally NOT density-scaled.** The accent border indent is a visual anchor — it marks the left edge of a section header. Unlike rhythm spacing (margins, gaps), the indent should stay consistent regardless of density so the accent line maintains visual weight.

### 2. Density Inheritance on d-section

In `packages/cli/src/treatments.ts`, the d-section rules change from:

```css
/* BEFORE */
.d-section { padding: var(--d-section-py) 0; }
.d-section[data-density="compact"] { padding: calc(var(--d-section-py) * 0.5) 0; }
```

To:

```css
/* AFTER — density broadcasts a scale, section consumes it */
.d-section {
  --d-density-scale: 1;
  padding: calc(var(--d-section-py) * var(--d-density-scale)) 0;
}
.d-section[data-density="compact"]     { --d-density-scale: 0.65; }
.d-section[data-density="spacious"]    { --d-density-scale: 1.4; }

/* Adjacent section gap — now density-aware */
.d-section + .d-section {
  border-top: 1px solid transparent;
  border-image: linear-gradient(to right, transparent, var(--d-border), transparent) 1;
  margin-top: calc(var(--d-section-gap) * var(--d-density-scale, 1));
}
```

The `--d-density-scale` custom property is inherited by all descendants. Treatments outside any `d-section` use the fallback `var(--d-density-scale, 1)` — identical to current behavior.

The density scale values (0.65, 1.0, 1.4) match the existing `DENSITY_SCALES` in `density.ts` for consistency across the static token computation and runtime CSS scaling.

### 3. Treatment Spatial Contracts

Each treatment gains a spatial contract block alongside its existing visual properties. Spatial values multiply by the inherited `--d-density-scale`.

#### d-label (lines 278-287 in treatments.ts)

```css
.d-label {
  /* visual contract (unchanged) */
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--d-text-muted);
  font-family: var(--d-font-mono, ui-monospace, monospace);
  /* spatial contract (NEW) */
  display: block;
  margin-bottom: calc(var(--d-label-mb) * var(--d-density-scale, 1));
}

/* Anchored section header variant */
.d-label[data-anchor] {
  padding-left: var(--d-label-px);
  border-left: 2px solid var(--d-accent);
}
```

#### d-surface (lines 128-157)

```css
.d-surface {
  /* visual: unchanged */
  background: var(--d-surface);
  border: 1px solid var(--d-border);
  border-radius: var(--d-radius);
  box-shadow: var(--d-shadow);
  /* spatial: density-aware padding */
  padding: calc(var(--d-surface-p) * var(--d-density-scale, 1));
}
```

#### d-interactive (lines 69-127)

```css
.d-interactive {
  /* visual: unchanged */
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  border: 1px solid var(--d-border);
  border-radius: var(--d-radius);
  background: transparent;
  color: var(--d-text);
  font: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 150ms, border-color 150ms, color 150ms, box-shadow 150ms, opacity 150ms;
  /* spatial: density-aware vertical padding, fixed horizontal */
  padding: calc(var(--d-interactive-py) * var(--d-density-scale, 1)) var(--d-interactive-px);
}
```

#### d-control (lines 192-223)

```css
.d-control {
  /* visual: unchanged */
  background: var(--d-surface);
  color: var(--d-text);
  border-radius: var(--d-radius);
  border: 1px solid var(--d-border);
  width: 100%;
  outline: none;
  font: inherit;
  transition: border-color 150ms, box-shadow 150ms;
  /* spatial: density-aware vertical padding */
  padding: calc(var(--d-control-py) * var(--d-density-scale, 1)) 0.75rem;
}
```

#### d-data (lines 159-190)

```css
.d-data-header {
  padding: calc(var(--d-data-py) * var(--d-density-scale, 1)) var(--d-content-gap);
  /* ...rest unchanged */
}
.d-data-cell {
  padding: calc(var(--d-data-py) * var(--d-density-scale, 1)) var(--d-content-gap);
  vertical-align: middle;
}
```

#### d-annotation (lines 243-276)

```css
.d-annotation {
  /* visual: unchanged */
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: var(--d-radius-full);
  background: var(--d-surface);
  color: var(--d-text-muted);
  white-space: nowrap;
  /* spatial contract (NEW) */
  margin-top: calc(var(--d-annotation-mt) * var(--d-density-scale, 1));
}
```

### 4. Shell Guidance Restructuring

Shell `guidance` blocks gain two structured fields alongside existing prose:

| Field | Type | Purpose |
|-------|------|---------|
| `section_label_treatment` | `string` | Exact CSS selector for section headers (e.g., `"d-label[data-anchor]"`) |
| `section_density` | `DensityLevel` | Default density for sections in this shell |

Prose strings remain for human reading and backward compatibility. The structured fields take precedence in context generation.

**Shell assignments (all 15 shells):**

| Shell | `section_label_treatment` | `section_density` | Rationale |
|-------|--------------------------|-------------------|-----------|
| `sidebar-main` | `d-label[data-anchor]` | `compact` | Dashboard — tight rhythm, accent anchors |
| `sidebar-main-footer` | `d-label[data-anchor]` | `compact` | Dashboard with footer — same as sidebar-main |
| `sidebar-aside` | `d-label[data-anchor]` | `compact` | Sidebar + aside panel — dashboard density |
| `sidebar-right` | `d-label[data-anchor]` | `compact` | Right sidebar variant — dashboard density |
| `top-nav-main` | `d-label` | `comfortable` | Marketing — standard labels, no anchor |
| `top-nav-footer` | `d-label` | `comfortable` | Public pages — same as top-nav-main |
| `top-nav-sidebar` | `d-label[data-anchor]` | `compact` | Hybrid — sidebar side gets anchors |
| `three-column-browser` | `d-label[data-anchor]` | `compact` | Browser layout — compact columns |
| `workspace-aside` | `d-label[data-anchor]` | `compact` | Workspace — dashboard density |
| `chat-portal` | `d-label` | `compact` | Chat app — compact, no anchor needed |
| `terminal-split` | `d-label` | `compact` | Terminal — compact, plain labels |
| `copilot-overlay` | `d-label` | `compact` | AI overlay — compact |
| `full-bleed` | `d-label` | `spacious` | Full-width showcase — spacious rhythm |
| `minimal-header` | `d-label` | `comfortable` | Minimal — standard rhythm |
| `centered` | *(none)* | *(none)* | Auth forms — no section labels |

The prose `section_labels` key is updated to reference the treatment class rather than embedding CSS snippets:

```json
// BEFORE
"section_labels": "Dashboard section labels should use the d-label class. Anchor with a left accent border: border-left: 2px solid var(--d-accent); padding-left: 0.5rem."

// AFTER
"section_labels": "Dashboard section labels use d-label[data-anchor] for accent-bordered headers with density-responsive spacing.",
"section_label_treatment": "d-label[data-anchor]",
"section_density": "compact"
```

### 5. Context Generation Updates

Three changes to `packages/cli/src/scaffold.ts`:

#### 5a. Fix spacing guide / tokens.css mismatch

`generateSpacingGuide()` (line 3190) currently calls `computeSpatialTokens(level)` **without** theme `spatial_hints`. This produces different values than `tokens.css` when the theme has `density_bias` or `content_gap_shift`.

**Fix:** Pass the same `SpatialTokenHints` object that `scaffoldProject` uses. The function signature changes to:

```typescript
function generateSpacingGuide(
  density: string,
  spatialHints?: SpatialTokenHints,
): string[]
```

#### 5b. Add new tokens to spacing guide table

The spacing guide gains 3 new rows (4 tokens, but `--d-label-px` is not density-scaled so it doesn't need a separate row):

```markdown
| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Label gap | `--d-label-mb` | {computed} | Gap below d-label section headers |
| Label indent | `--d-label-px` | 0.75rem | Anchor indent for d-label[data-anchor] |
| Section gap | `--d-section-gap` | {computed} | Gap between adjacent d-sections |
| Annotation gap | `--d-annotation-mt` | {computed} | Top margin on d-annotation |
```

#### 5c. Structured section label treatment in context output

When `shellInfo.guidance.section_label_treatment` is present, the Shell Notes block emits a structured instruction instead of raw prose:

```markdown
## Section Label Treatment

Apply `d-label[data-anchor]` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Left accent border anchor (data-anchor variant)
- Density-responsive bottom gap: {--d-label-mb} × {--d-density-scale} = {computed}rem

Section density: compact (--d-density-scale: 0.65)
```

This gives the AI a concrete class to apply and the exact computed spacing value — no prose interpretation needed.

### 6. Type System Updates

#### 6a. Extend `SpatialTokens` (packages/essence-spec/src/types.ts:88)

```typescript
export interface SpatialTokens {
  // Existing
  '--d-section-py': string;
  '--d-interactive-py': string;
  '--d-interactive-px': string;
  '--d-surface-p': string;
  '--d-data-py': string;
  '--d-control-py': string;
  '--d-content-gap': string;
  // New spatial contract tokens
  '--d-label-mb': string;
  '--d-label-px': string;
  '--d-section-gap': string;
  '--d-annotation-mt': string;
}
```

#### 6b. Export `SpatialTokenHints` (move from density.ts:64 to types.ts)

```typescript
export interface SpatialTokenHints {
  section_padding?: string | null;
  density_bias?: number;
  content_gap_shift?: number;
  label_content_gap?: string | null;
}
```

#### 6c. Add `ShellGuidance` type

```typescript
export interface ShellGuidance {
  section_label_treatment?: string;
  section_density?: DensityLevel;
  [key: string]: string | DensityLevel | undefined;
}
```

#### 6d. Normalize theme spatial string values

Newer themes use semantic strings (`"generous"`, `"comfortable"`) where the code expects numbers/px-strings. Add normalization maps in `computeSpatialTokens`:

```typescript
const SECTION_PADDING_NAMES: Record<string, string> = {
  'tight': '1rem',
  'compact': '2rem',
  'standard': '4rem',
  'generous': '6rem',
  'expansive': '7.5rem',
};

const DENSITY_BIAS_NAMES: Record<string, number> = {
  'compact': 2,
  'comfortable': 0,
  'spacious': -1,
};
```

All `section_padding` values in themes are converted from `"Npx"` to `"Nrem"` (divide by 16). Existing px-string parsing remains as a fallback for any unconverted values.

### 7. Registry Content Updates

#### 7a. Shells (decantr-content/shells/*.json) — all 15

Each shell gets:
- `section_label_treatment` field (structured)
- `section_density` field (structured)
- Updated prose `section_labels` referencing the treatment class instead of embedding CSS

No other changes to shell `internal_layout` or code examples.

#### 7b. Themes (decantr-content/themes/*.json) — all 20

- Convert all `section_padding` values from `"Npx"` to `"Nrem"` (e.g., `"120px"` → `"7.5rem"`)
- Optionally add `label_content_gap` to themes where the default computed value isn't appropriate
- Normalize semantic string values (`"generous"` → `"6rem"`, `"comfortable"` → `0`, etc.)

#### 7c. No changes to

- Blueprints (0 files)
- Archetypes (0 files)
- Patterns (0 files)

---

## Backward Compatibility

1. **`var(--d-density-scale, 1)` fallback** — treatments outside any `d-section` use the default scale of 1. Behavior identical to today. No regressions for elements rendered outside section containers (sidebar nav items, standalone cards, etc.).

2. **Tokens and treatments are co-generated** — the CLI writes `tokens.css` and `treatments.css` in the same scaffold operation. There is no scenario where new treatment CSS references tokens that don't exist. Both files update together.

3. **Shell guidance prose preserved** — the structured `section_label_treatment` and `section_density` fields are additive alongside existing prose keys. Context generation prefers structured fields when present but still emits prose for any guidance key without a structured equivalent.

4. **Theme spatial field is optional** — `label_content_gap` only affects computation when present. Existing themes without it use the base value from `BASE_TOKENS`.

5. **d-label display: block** — this is a behavioral change. `d-label` currently has no `display` property, so `<span class="d-label">` renders inline. Adding `display: block` makes it block-level by default. This matches actual usage (every instance in the codebase adds `block` via utility class or is on a block element). Any edge case requiring inline label behavior can use `display: inline` override in app CSS (via `@layer app`).

---

## Testing Strategy

### Primary: Harness against registry-platform

1. Clean `apps/showcase/registry-platform/` (rm essence, DECANTR.md, .decantr/, src/, dist/)
2. Cold `decantr init --blueprint=registry-platform`
3. Dispatch harness agent (fresh, zero Decantr knowledge)

### Success Criteria

| Criterion | Target | How to verify |
|-----------|--------|---------------|
| Inline spacing styles | 0 instances | `grep -r "paddingLeft\|marginBottom.*rem\|borderLeft.*accent" src/` |
| d-label[data-anchor] usage | Every section header | `grep -r "data-anchor" src/` |
| Spacing guide matches tokens.css | All values match | Compare spacing guide table values with tokens.css `--d-*` values |
| Compact density interior scaling | Visual label gap tighter in compact vs comfortable sections | Harness visual regression check (Section L) |
| Zero regressions in marketing pages | Marketing sections (top-nav-main shell) look identical | Spot-check 1-2 other blueprints |

### Secondary: Cross-blueprint spot check

After registry-platform passes, clean-init 1-2 additional blueprints:
- One marketing-heavy blueprint (to verify comfortable density looks right)
- One data-dense blueprint (to verify compact density tightens everything)

---

## Files Changed

| File | Change | Effort |
|------|--------|--------|
| `packages/essence-spec/src/types.ts` | Extend `SpatialTokens`, export `SpatialTokenHints`, add `ShellGuidance` | Small |
| `packages/essence-spec/src/density.ts` | Add 4 tokens to `BASE_TOKENS`, add `label_content_gap` override, normalize semantic strings, export `SpatialTokenHints` from types | Small |
| `packages/cli/src/treatments.ts` | Add density inheritance to d-section, spatial contracts to 6 treatments, d-label[data-anchor] variant | Medium |
| `packages/cli/src/scaffold.ts` | Fix `generateSpacingGuide` to pass spatial hints, add new token rows, structured shell guidance output | Medium |
| `decantr-content/shells/*.json` (15 files) | Add structured guidance fields, update prose | Small |
| `decantr-content/themes/*.json` (20 files) | Convert section_padding px→rem, normalize semantic strings, optional label_content_gap | Small |
| `packages/essence-spec/src/index.ts` | Export new types | Trivial |

**Zero changes to:** blueprints, archetypes, patterns, API, MCP server, @decantr/css, web app.

---

## Non-Goals

- **Changing the density computation formula** — the existing `BASE × SCALE × biasMultiplier` is sound. We extend it with new tokens, not a new formula.
- **Adding density to archetypes or patterns** — density is set by the shell (via guidance) and the essence (via DNA). Archetypes and patterns don't own density.
- **Reworking the entire treatment system** — we add spatial contracts alongside existing visual properties. The `emitRule` helper and `treatmentOverrides` mechanism stay as-is.
- **Adding new treatments** — the 7 existing base treatments (d-interactive, d-surface, d-data, d-control, d-section, d-annotation, d-label) are sufficient. We enrich them, not multiply them.
