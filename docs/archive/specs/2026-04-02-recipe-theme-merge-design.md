# Recipe → Theme Merge Design

**Date:** 2026-04-02
**Status:** Proposed
**Depends on:** Visual Treatment System (implemented)
**Scope:** All packages, decantr-content, API, documentation, registry

## Problem

Decantr splits visual identity across three concepts (theme, recipe, personality) that create confusion for both users and LLMs:

1. **Theme/recipe redundancy.** 18 of 19 blueprints use `style === recipe` (same name). The mix-and-match design never materialized in practice.
2. **Identity conflicts.** When personality demands "neon" but the theme provides muted blues, nobody resolves the conflict. The LLM gets contradictory signals.
3. **LLM complexity.** The AI must understand: theme provides colors, recipe provides visual treatment, personality provides intent — and these might disagree. This learning path is too deep for "read and build."
4. **Two fetches, two objects.** The CLI fetches theme and recipe separately, passes them as separate objects, and hopes they're compatible.

## Solution: Merge Recipe INTO Theme

A "theme" becomes the complete visual identity — colors, spatial rhythm, animation, decorators, treatments. The recipe content type is eliminated.

### Merged Theme Schema

```typescript
interface Theme {
  // Identity
  id: string;
  name: string;
  description: string;
  tags: string[];

  // Color System (flat in content JSON, structured in TypeScript)
  seed: { primary: string; secondary: string; accent: string; background: string };
  palette: Record<string, { dark: string; light?: string }>;  // mode-aware tokens
  tokens?: { base: Record<string, string>; cvd?: Record<string, Record<string, string>> };
  modes: string[];          // ["dark", "light", "auto"]
  shapes: string[];         // ["rounded", "sharp", "pill"]

  // Visual Treatment
  decorators: Record<string, string>;     // theme-specific CSS class descriptions
  treatments?: Record<string, Record<string, string>>;  // base treatment overrides
  effects?: {
    enabled: boolean;
    intensity: string;
    type_mapping?: Record<string, string[]>;
  };

  // Spatial System
  spatial: {
    section_padding: string | null;
    density_bias: number;
    content_gap_shift: number;
    card_wrapping: 'always' | 'minimal' | 'none';
  };
  radius: { philosophy: string; base: number };

  // Motion
  motion: {
    preference: string;         // "subtle", "energetic", "none"
    reduce_motion: boolean;
    entrance?: string;          // keyframe name for entrance animation
    timing?: string;            // CSS easing function
    durations?: Record<string, string>;  // hover, entrance, page, modal
  };

  // Typography
  typography: {
    scale: string;              // "modular", "linear"
    heading_weight: number;
    body_weight: number;
    mono?: string;              // monospace font stack
  };

  // Layout Hints (optional)
  shell?: {
    preferred: string[];
    nav_style: string;
    nav?: string;               // decorator for nav
    root?: string;              // decorator for root
  };
  compositions?: Record<string, { shell: string; description: string; effects?: string[] }>;
}
```

### What's New vs Current Theme

Fields absorbed from recipe:
- `decorators` — CSS class descriptions for theme-specific visual elements
- `treatments` — base treatment class overrides (was `treatment_overrides`)
- `effects` — visual effects configuration (was `visual_effects`)
- `spatial` — section padding, density bias, content gap shift (was `spatial_hints`)
- `radius` — border radius philosophy and base (was `radius_hints`)
- `motion` — merged from recipe `animation` + theme `motion_hints`
- `typography` — merged from recipe typography data + theme `typography_hints`, gains `mono` field
- `shell` — preferred shells and nav style
- `compositions` — auth/chat/marketing layout hints

Fields reorganized:
- `seed` + `palette` + `tokens` → nested under `palette` with sub-sections `seed`, `tokens`, `status`, `cvd`
- `typography_hints` → `typography` (gains `mono` from personality derivation)
- `motion_hints` → merged into `motion`

### Essence DNA Change

Before:
```json
{
  "theme": { "style": "carbon", "mode": "dark", "recipe": "carbon", "shape": "rounded" }
}
```

After:
```json
{
  "theme": { "id": "carbon", "mode": "dark", "shape": "rounded" }
}
```

- `style` renamed to `id` (clearer registry mapping)
- `recipe` field removed (absorbed into theme)
- `shape` stays in DNA (project-level selection from theme's supported shapes, like `mode`)

### Blueprint Change

Before:
```json
{
  "theme": { "style": "carbon", "recipe": "carbon", "mode": "dark", "shape": "rounded" }
}
```

After:
```json
{
  "theme": { "id": "carbon", "mode": "dark", "shape": "rounded" }
}
```

### CLI Data Flow

Before: 2 fetches, 2 objects
```
fetchTheme("carbon") → ThemeData (colors)
fetchRecipe("carbon") → RecipeData (decorators, spatial, animation)
scaffoldProject(ThemeData, RecipeData)
```

After: 1 fetch, 1 object
```
fetchTheme("carbon") → ThemeData (everything)
scaffoldProject(ThemeData)
```

## Content Migration

### 11 Paired Recipes → Merge Into Themes

For each recipe that has a paired theme (same name): merge all recipe fields into the theme JSON file, using the new field names.

| Recipe | Theme | Decorators | Action |
|--------|-------|:----------:|--------|
| auradecantism | auradecantism | 17 | Merge |
| carbon | carbon | 10 | Merge |
| terminal | terminal | 15 | Merge |
| luminarum | luminarum | 11 | Merge |
| estate | estate | 13 | Merge |
| paper | paper | 11 | Merge |
| studio | studio | 12 | Merge |
| glassmorphism | glassmorphism | 6 | Merge |
| gaming-guild | gaming-guild | 8 | Merge |
| launchpad | launchpad | 7 | Merge |
| clean | clean | 3 | Merge |

### 1 Orphaned Recipe → Create Theme + Merge

`neon-cyber` has a recipe (7 decorators) but no theme. Create a `neon-cyber` theme with an appropriate neon palette, then merge the recipe into it.

### 1 Mismatched Blueprint → Fix

`cloud-platform` uses `style: "launchpad"` but `recipe: "auradecantism"`. Fix to use launchpad for both before the merge, so it becomes `theme: "launchpad"` cleanly.

### 7 Recipe-less Themes → Keep As-Is

`bioluminescent`, `dopamine`, `editorial`, `liquid-glass`, `neon-dark`, `prismatic`, `retro` — these themes have no recipe data. They work with base treatments only (the 6 treatment categories provide buttons, cards, tables, etc. without any theme-specific decorators). No changes needed.

### 19 Blueprints → Update Schema

Remove `recipe` field from `theme` object. Rename `style` to `id`.

### recipes/ Directory → Delete

After migration, delete the entire `recipes/` directory from decantr-content. Remove `'recipes'` from validate.js, sync-to-registry.js, and all type definitions.

### Existing Caches → Purge

The CLI stores cached content in `.decantr/cache/@official/recipes/`. The sync command and init command need to stop fetching/caching recipes. Existing caches are stale after migration.

## Remaining Visual Gaps (from harness)

The merge also addresses the visual issues identified in the screenshots:

### 1. Neon Accent for Agent-Marketplace

The `agent-marketplace` blueprint uses `carbon` theme, but the personality demands "neon accent glows." With the merge, we can create a `carbon` theme that supports this through:

Option A: Create a `carbon-neon` theme variant with `palette.seed.accent: "#00D4FF"` and neon glow tokens.
Option B: The `agent-marketplace` blueprint's personality is rich enough — the merged carbon theme gets `palette.seed.accent-glow: { dark: "rgba(0, 212, 255, 0.3)" }` and the personality derivation in the CLI picks it up.

Recommendation: Option A — create `carbon-neon` as a distinct theme. Keep `carbon` muted for projects that want professional minimalism. Update `agent-marketplace` blueprint to reference `theme: "carbon-neon"`.

### 2. Motion/Animation Emission

The theme's `motion` field (merged from recipe `animation`) has `entrance`, `durations`, and `timing` — but the CLI never emits these as CSS. Fix:

- Generate animation keyframes from `motion.entrance` name
- Emit `--d-duration-hover`, `--d-duration-entrance` tokens from `motion.durations`
- Emit `--d-easing` token from `motion.timing`
- Add `motion.entrance` class reference in DECANTR.md treatment section
- Add entrance animation guidance: "Apply `{theme}-fade-slide` to page sections on load"

### 3. Font-Mono Token

The merged theme gains a `typography.mono` field. The CLI emits `--d-font-mono` token in tokens.css. The treatment system gains a `.d-mono` utility class. DECANTR.md documents it.

### 4. Personality-Derived Adjustments

After the merge, personality keywords can adjust the theme output:
- `"neon"` or `"glow"` → if theme has `accent-glow` in palette, emit it; otherwise derive from accent
- `"monospace"` or `"mono"` → ensure `--d-font-mono` is emitted from `typography.mono`
- `"pulse"` → add pulse keyframe to treatments.css

This is additive — the theme provides the base, personality adds utilities. No conflicts because it's one source.

## Schema Version

This is essence V3.2 — a minor bump. The change is:
- `dna.theme.style` → `dna.theme.id` (rename)
- `dna.theme.recipe` → removed
- Migration: drop `recipe`, rename `style` to `id`, preserve all other fields

The CLI's `migrate` command handles V3.1 → V3.2 upgrade.

## Impact Assessment

### Packages to Change

| Package | Changes | Severity |
|---------|---------|----------|
| `@decantr/essence-spec` | Remove recipe from Theme type, add V3.2 types, update guard (remove recipe rule), update migrate, update density (rename RecipeSpatialHints), update schemas | Major |
| `@decantr/registry` | Remove Recipe type, merge fields into Theme type, remove fetchRecipe, remove recipe from content types | Major |
| `@decantr/core` | Remove recipe resolution, merge into theme resolution, rename IRRecipeDecoration | Major |
| `decantr` (CLI) | Remove fetchRecipe calls, update scaffold.ts (single ThemeData param), update magic.ts, update all commands referencing recipe, update prompts.ts, update DECANTR.md template | Major |
| `@decantr/mcp-server` | Remove decantr_resolve_recipe tool, update 5 other tools | Moderate |
| `decantr-api` | Remove recipe from route regexes and type unions | Minor |
| `decantr-web` | Remove recipe from content type filters and forms | Minor |

### Content to Change (decantr-content)

| Area | Count | Action |
|------|:-----:|--------|
| themes/ | 11 | Merge recipe data into each |
| themes/ | 1 | Create neon-cyber theme |
| themes/ | 1 | Create carbon-neon variant |
| recipes/ | 12 | Delete entire directory |
| blueprints/ | 19 | Remove `recipe` from theme, rename `style` to `id` |
| archetypes/ | 6 | Remove `dependencies.recipes` field |
| patterns/ | 93 | Remove `dependencies.recipes: {}` placeholder |
| validate.js | 1 | Remove recipes validation |
| sync-to-registry.js | 1 | Remove recipes sync |

### Tests to Update

~30 test files, ~133 recipe references. Major test rewrites in: guard tests, scaffold tests, core resolve tests, context-gen tests.

### Documentation to Update

- CLAUDE.md (root)
- docs/css-scaffolding-guide.md
- docs/architecture/scaffolding-flow.md
- docs/specs/ (historical — nice-to-have)
- packages/css/README.md
- .claude/skills/harness.md
- .claude/skills/decantr-engineering (session start hook)

## Versioning

All package bumps are patches per project convention:
- `@decantr/essence-spec` → 1.0.0-beta.10
- `@decantr/registry` → 1.0.0-beta.10
- `@decantr/core` → 1.0.0-beta.9
- `decantr` (CLI) → 1.5.4
- `@decantr/mcp-server` → 1.0.0-beta.11

## Implementation Sequence

### Phase 1: Content Migration (decantr-content)
1. Fix cloud-platform blueprint (recipe → launchpad)
2. Create neon-cyber theme from neon-dark palette + neon-cyber recipe decorators
3. Create carbon-neon theme variant (carbon palette with neon accent)
4. Merge 11 paired recipes into their themes (scripted)
5. Update 19 blueprints (remove recipe, rename style → id)
6. Remove `dependencies.recipes` from archetypes and patterns
7. Delete recipes/ directory
8. Update validate.js and sync-to-registry.js
9. Push to main → auto-sync

### Phase 2: Core Packages (monorepo)
10. essence-spec: V3.2 types, remove recipe from Theme, update guard, migrate, density, schemas
11. registry: Merge Recipe into Theme type, remove recipe methods/types
12. core: Remove recipe resolution, merge into theme flow
13. CLI: Single ThemeData flow, remove all fetchRecipe, update scaffold/magic/commands
14. MCP: Remove decantr_resolve_recipe, update tool descriptions
15. API: Remove recipe from routes/types
16. Web: Remove recipe from UI

### Phase 3: Validate
17. Update all tests (~30 files)
18. Build all packages
19. Run full monorepo test suite
20. Update documentation (CLAUDE.md, guides, skills)
21. Publish packages
22. Re-scaffold showcases
23. Run harness — compare to Run 3 baseline

## Out of Scope

- @decantr/ui changes (separate system)
- @decantr/css changes (atoms unchanged)
- @decantr/vite-plugin changes (drift detection unchanged)
- New theme creation beyond carbon-neon and neon-cyber
- Pattern content enrichment (deferred)
