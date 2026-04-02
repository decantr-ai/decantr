# Visual Treatment System Design

**Date:** 2026-04-02
**Status:** Proposed
**Scope:** @decantr/essence-spec, decantr CLI, @decantr/registry, decantr-content, MCP server, documentation, harness

## Problem

Decantr's LLM scaffolding pipeline generates CSS that is recipe-specific (`carbon-card`, `terminal-panel`, `estate-surface`) rather than universal. This causes three problems:

1. **No universal vocabulary.** The LLM learns different class names for every recipe. A button is `carbon-btn` in one project and nothing in another — there is no treatment for buttons in any recipe today.
2. **Spatial hints are fetched but never emitted.** Every recipe defines `spatial_hints.section_padding`, `density_bias`, etc. The CLI passes this data through the pipeline and drops it — zero CSS tokens are generated from it. This causes the "sections running together" problem visible in scaffolded output.
3. **Recipe decorators cover surfaces, not interactions.** All 12 recipes define card/glass/code/bubble decorators (container surfaces). None define buttons, badges, tables, nav items, or section spacing — the interactive and structural primitives every page needs.

The harness measured the impact: 28 hand-rolled CSS classes (433 lines), 35 inline styles, 3.6/5 visual quality, 54% token efficiency.

## Solution: Visual Treatment Categories

Replace the current single-layer decorator system with a two-tier model: **base treatments** (universal, always generated) + **recipe decorators** (visual identity, recipe-specific).

### The 6 Treatment Categories

Treatments are CSS-level visual consistency classes — not components, not a UI library. They prevent the LLM from producing inconsistent styling across pages.

**The inclusion test:** "If the LLM builds this on 5 different pages without a treatment class, will it be visually inconsistent?" If yes → treatment. If no → tokens + personality are sufficient.

| # | Category | Class | What It Covers | CSS Properties |
|---|----------|-------|----------------|----------------|
| 1 | Interactive Surface | `d-interactive` | Buttons, links, nav items, chips, tabs, toggles, menu items | padding, radius, cursor, transition, hover, focus-visible, active, disabled |
| 2 | Container Surface | `d-surface` | Cards, panels, modals, alerts, code blocks, popovers | background, border, radius, shadow, elevation variants, optional hover lift |
| 3 | Data Display | `d-data` | Tables, stat grids, log entries, KV pairs, definition lists | `d-data-header`, `d-data-row`, `d-data-cell` with padding, borders, hover |
| 4 | Form Control | `d-control` | Text inputs, textareas, selects, search bars | background, border, radius, focus ring, placeholder, disabled, error (`aria-invalid`) |
| 5 | Section Rhythm | `d-section` | Page-level vertical spacing between patterns | padding (density-driven), adjacent section separator |
| 6 | Inline Annotation | `d-annotation` | Badges, tags, status dots, counts, labels | font-size, padding, pill radius, status color variants (success/error/warning/info) |

### Variants

Treatments use `data-*` attributes for variants rather than modifier classes. This keeps the class namespace clean and makes the variant semantic explicit to the LLM.

```html
<button class="d-interactive" data-variant="primary">Deploy</button>
<button class="d-interactive" data-variant="ghost">Cancel</button>
<div class="d-surface" data-elevation="overlay">Modal content</div>
<span class="d-annotation" data-status="success">Active</span>
```

### What Treatments Are NOT

- Not a component library (that's shadcn's job)
- Not @decantr/ui (completely separate system — no alignment, no shared code)
- Not a replacement for atoms (atoms handle layout; treatments handle visual consistency)
- Not a replacement for recipe decorators (recipes still define visual identity)

## Architecture

### Three-Layer CSS Model

Generated `treatments.css` (renamed from `decorators.css`) contains three layers:

```
Layer 1: Base Treatments (always generated from tokens + density)
  .d-interactive, .d-surface, .d-data, .d-control, .d-section, .d-annotation
  + all variants and states

Layer 2: Recipe Treatment Overrides (optional — recipe customizes base)
  e.g., carbon overrides .d-surface with glassmorphic background

Layer 3: Recipe Decorators (unchanged — recipe visual identity)
  e.g., carbon-glass, carbon-code, carbon-bubble-ai, carbon-fade-slide
```

Each layer can override the previous. The LLM sees the final merged result — it doesn't need to understand the layering.

### Density-Driven Spatial Tokens

The existing `computeDensity()` in essence-spec maps personality → density level → content gap. We extend this to compute spatial tokens for each treatment category.

All values are rem-based (scale with root font size). Three density levels:

| Token | Compact (×0.65) | Comfortable (×1.0) | Spacious (×1.4) |
|-------|:---:|:---:|:---:|
| `--d-section-py` | 3.25rem | 5rem | 7rem |
| `--d-interactive-py` | 0.325rem | 0.5rem | 0.7rem |
| `--d-interactive-px` | 0.65rem | 1rem | 1.4rem |
| `--d-surface-p` | 0.75rem | 1.25rem | 1.75rem |
| `--d-data-py` | 0.4rem | 0.625rem | 0.875rem |
| `--d-control-py` | 0.325rem | 0.5rem | 0.7rem |
| `--d-content-gap` | 0.65rem | 1rem | 1.4rem |

**Algorithm:** `value = base_rem × density_scale × (1 + recipe.density_bias / 10)`

Recipe `section_padding` override (e.g., "80px") converts to rem and replaces `--d-section-py`. The `content_gap_shift` from the recipe adjusts the content gap.

### Recipe Override Mechanism

Recipes get a new optional field: `treatment_overrides`. It maps treatment selectors to CSS property overrides.

```json
{
  "treatment_overrides": {
    "d-surface": {
      "background": "rgba(31, 31, 35, 0.8)",
      "backdrop-filter": "blur(8px)"
    },
    "d-interactive:hover": {
      "box-shadow": "0 0 20px var(--d-accent-glow)"
    }
  }
}
```

Recipes that don't define `treatment_overrides` get the base treatments unchanged. This means **all 12 existing recipes immediately produce working buttons, badges, tables, and section spacing with zero content changes required**. Override enrichment happens iteratively.

### Carbon Migration

Carbon's existing 10 decorators are split:

| Current Decorator | Becomes |
|---|---|
| carbon-card | Absorbed into `d-surface` (base treatment does the same thing) |
| carbon-input | Absorbed into `d-control` (base treatment does the same thing) |
| carbon-divider | Absorbed into `d-section` adjacent separator |
| carbon-canvas | Removed (just `background: var(--d-bg)` — already in body) |
| carbon-glass | **Stays** as recipe decorator (visual identity) |
| carbon-code | **Stays** as recipe decorator (visual identity) |
| carbon-skeleton | **Stays** as recipe decorator (visual identity) |
| carbon-bubble-ai | **Stays** as recipe decorator (visual identity) |
| carbon-bubble-user | **Stays** as recipe decorator (visual identity) |
| carbon-fade-slide | **Stays** as recipe decorator (visual identity) |

Carbon also gets a `treatment_overrides` entry for `d-surface` to apply glassmorphic background (its signature look).

## DECANTR.md Template Changes

### Treatment Reference (replaces atom table + decorator section)

The 164-line atom reference table (26% of context, mostly ignored per harness) is replaced with:
- **10-line condensed atom quick reference** — categories with one example each (layout, spacing, sizing, text, responsive)
- **~25-line treatment reference** — 6 categories, each with: class name, variants, states, "use for" list

### Section Context Changes

Current: lists every recipe decorator name and references decorators.md.
Proposed: "All 6 treatments available (see DECANTR.md). Recipe decorators: carbon-glass, carbon-code, carbon-skeleton, carbon-fade-slide"

### decorators.md → treatments.md

The context file becomes a compact reference:
- Base treatments one-liner (points to DECANTR.md)
- Recipe decorator table with "use for" column
- Composition example: `css('_flex _col _gap4') + ' d-surface carbon-glass'`

### Net Effect

DECANTR.md: ~348 lines (34% useful) → ~220 lines (~65% useful).

## Harness Evaluation Updates

### New Section: Treatment Coverage Scorecard

| Treatment | Classes Generated | Used by LLM | Improvised Instead | Inline Styles | Coverage % |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Interactive Surface | count | Y/N per page | count | count | % |
| Container Surface | count | Y/N per page | count | count | % |
| Data Display | count | Y/N per page | count | count | % |
| Form Control | count | Y/N per page | count | count | % |
| Section Rhythm | count | Y/N per page | count | count | % |
| Inline Annotation | count | Y/N per page | count | count | % |

Target: 80%+ coverage across all 6 categories.

### Replaced Sections

- Section F (Visual Quality Scorecard) → Treatment Coverage Scorecard
- Section P (Decorator CSS Completeness) → Treatment Completeness Audit

### Updated Sections

- Section C (Token Efficiency) — measure new DECANTR.md size
- Section E (Improvisation Log) — track treatment-class vs improvised
- Section K (Comparison) — update metrics vs shadcn baseline
- Section N (Action Plan) — based on treatment gaps
- Section O (Root Cause) — trace to treatment categories

## Implementation Sequence

### Phase 1: Core Implementation

**1a. @decantr/essence-spec** — Extend `density.ts`:
- New export: `computeSpatialTokens(density: DensityLevel, recipeSpatial?: RecipeSpatialHints): Record<string, string>`
- Returns all spatial tokens for the density level, adjusted by recipe hints
- Patch version bump → publish

**1b. @decantr/registry** — Update `types.ts`:
- Add `treatment_overrides?: Record<string, Record<string, string>>` to `Recipe` interface
- Patch version bump → publish

**1c. decantr CLI** — Major scaffold.ts changes:
- New `generateTreatmentCSS(tokens, density, recipeOverrides?, recipeDecorators?)` function
- Updated `generateTokensCSS()` — accepts recipe spatial hints, emits spatial tokens
- Updated DECANTR.md template — treatment reference replaces atom table + decorator section
- Updated `generateSectionContext()` — treatment categories replace decorator lists
- `generateDecoratorsContext()` → `generateTreatmentsContext()`
- Updated `magic.ts` recipe data extraction
- Full test rewrite for affected functions
- Patch version bump → publish

### Phase 2: Content + Documentation

**2a. decantr-content:**
- Add `treatment_overrides` to carbon recipe (glass surface override)
- Update `validate.js` to accept new field
- Push to main → GitHub Actions auto-syncs to API via `sync-to-registry.js`

**2b. Documentation (monorepo):**
- `CLAUDE.md` — update architecture section, terminology, CSS discipline
- `docs/css-scaffolding-guide.md` — treatment layer, @layer references, examples
- `docs/architecture/scaffolding-flow.md` — treatment flow diagram, recipe fields
- `packages/css/README.md` — update treatments reference

**2c. MCP Server:**
- Update tool descriptions: `decantr_resolve_recipe`, `decantr_get_section_context`, `decantr_check_drift`
- Patch version bump → publish if tool descriptions change

### Phase 3: Validate

**3a.** Update harness skill (`.claude/skills/harness.md`) with treatment coverage scorecard

**3b.** Clean + re-scaffold all 3 showcase projects:
- `apps/showcase/agent-marketplace` — `decantr init --blueprint=agent-marketplace`
- `apps/showcase/carbon-ai-portal` — `decantr init --blueprint=carbon-ai-portal`
- `apps/showcase/terminal-dashboard` — `decantr init --blueprint=terminal-dashboard`

**3c.** Run full harness against agent-marketplace. Compare to Run 2 baseline. Remaining gaps become data-driven P0-P4 for Phase 4.

### Phase 4: Iterate (post-harness, data-driven)

- Address whatever the harness reveals (accent color, personality CSS, recipe enrichment)
- Expand `treatment_overrides` to other recipes (neon-cyber, glassmorphism, terminal, etc.)
- Each recipe defines only what's unique to its visual identity

## Success Criteria

| Metric | Run 2 (baseline) | Run 3 (target) |
|--------|:-:|:-:|
| Token efficiency | 54% | 65%+ |
| Treatment coverage | N/A | 80%+ all categories |
| Hand-rolled CSS | 28 classes / 433 lines | <10 classes / <100 lines |
| Inline styles | 35 | <15 |
| Visual quality avg | 3.6/5 | 4.0+/5 |
| Personality compliance | 83% | 85%+ |

## Impact Assessment

### MUST_CHANGE (42 locations)

| Area | Count | Key Files |
|------|:-----:|-----------|
| packages/cli/src/scaffold.ts | 13 | Treatment CSS gen, token gen, DECANTR.md template, section contexts, recipe data fetch, tests |
| packages/cli/src/commands/magic.ts | 2 | Recipe data extraction |
| packages/cli/test/ | 4 | scaffold.test.ts, context-gen.test.ts — full assertion rewrites |
| packages/essence-spec/src/density.ts | 2 | computeSpatialTokens, RecipeSpatialHints interface |
| packages/registry/src/types.ts | 2 | Recipe interface, RecipeSpatialHints |
| decantr-content/recipes/carbon.json | 1 | Add treatment_overrides for glass surface override |
| decantr-content/validate.js | 1 | Accept treatment_overrides field on recipes |
| docs/ | 4 | css-scaffolding-guide.md, scaffolding-flow.md, CLAUDE.md, css README |
| Harness skill | 1 | Treatment coverage scorecard |
| Showcase projects | 3 | Re-scaffold (not hand-edit) |

### SHOULD_UPDATE (14 locations)

essence-spec types/guard/migrate/index, MCP tool descriptions (3), theme-switch.ts, new-project.ts, scaffold-v3 test, integration test, apps/web recipe form

### NICE_TO_HAVE (10 locations)

Historical docs/specs (6), API publish validation, workbench, web landing page, export.ts

## Versioning

All package bumps are patches per project convention. Publish order: essence-spec → registry → CLI → MCP server.

## Out of Scope

- @decantr/ui alignment (completely separate system)
- @decantr/core changes (Design Pipeline IR — unaffected)
- @decantr/css changes (atoms are unchanged)
- @decantr/vite-plugin changes (drift detection — unaffected)
- New recipe content creation (happens in Phase 4, data-driven)
- Personality-to-CSS derivation (deferred to post-harness iteration)
- Theme accent color changes (deferred to post-harness iteration)
