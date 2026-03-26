---
type: enrich
name: decantr-recipe-decoration
---

You are running in fully autonomous mode on the Decantr monorepo at /Users/davidaimi/projects/decantr-new.
Do NOT use EnterPlanMode or AskUserQuestion tools. Do NOT add Co-Authored-By lines to commits.
Make reasonable decisions and document them in code comments prefixed with // AUTO:

## Monorepo Structure
- packages/essence-spec/ — Essence v2 types, validator, density, guard
- packages/registry/ — Content resolver, pattern presets, wiring rules
- packages/generator-core/ — IR types, tree builder, resolution, pipeline
- packages/generator-decantr/ — Decantr-native code emitter
- packages/generator-react/ — React + Tailwind + shadcn/ui emitter
- packages/cli/ — CLI commands (validate, generate, init, registry)
- packages/mcp-server/ — MCP server for AI tools
- content/ — Registry content (patterns/, archetypes/, recipes/, core/)
- examples/ — Example essence files

## Workflow
1. Read relevant source files to understand current state
2. Implement the task
3. Write or update tests
4. Run tests: cd /Users/davidaimi/projects/decantr-new && pnpm test
5. Fix any failures
6. Commit with descriptive message

## Task: Enhance Decantr Emitter with Recipe Visual Decorations

The Decantr-native emitter should read recipe JSON and apply visual decoration classes to Shell and Card components.

### Step 1: Read current state

Read `packages/generator-decantr/src/emit-page.ts` and `packages/generator-decantr/src/emit-app.ts` (if it exists, otherwise the main app emitter). Read `content/core/recipes/` or `content/recipes/` to find the recipe JSON files (especially `auradecantism`). Read the recipe schema to understand the `carafe`, `pattern_overrides`, and `spatial_hints` fields.

### Step 2: Implement recipe decoration resolution

Create or update a module in `packages/generator-decantr/src/` (e.g., `recipe-decorator.ts`) that:

1. **Reads the recipe JSON** matching the essence's `vintage.recipe`
2. **Extracts decoration data** from the recipe's `carafe` field:
   - `glass_effect` → emit `d-glass` class on Shell and Card components
   - `gradient_hint` → emit `d-gradient-hint-primary` or `d-gradient-hint-{color}` on backgrounds
   - `glow_effect` → emit `d-glow` or `d-glow-{variant}` on interactive elements
   - `shadow_style` → emit appropriate shadow atoms (`_shadow`, `_shadow[lg]`, etc.)
3. **Applies pattern_overrides** — Recipe may specify per-pattern overrides:
   - Background effects on specific pattern cards
   - Border style variants
   - Custom opacity/blur values

### Step 3: Integrate into emit-page

When emitting page code:
- Resolve the active recipe
- For each pattern wrapped in a Card, apply recipe decoration classes
- For the Shell component, apply shell-level decorations from recipe carafe
- Generate a `getRecipeDecoration()` helper function that reads recipe data at runtime (data-driven, not hardcoded per recipe)

### Step 4: Write tests

- Recipe decorator resolves correct classes for auradecantism recipe
- Glass effect adds d-glass class
- Gradient hint adds d-gradient-hint-* class
- Pattern overrides apply to specific patterns
- Shell gets carafe-level decorations
- Missing recipe gracefully defaults (no decorations)

### Acceptance Criteria
- [ ] Recipe decorator module created/updated
- [ ] Reads recipe JSON and extracts decoration data
- [ ] Emits d-glass, d-gradient-hint-*, d-glow-* classes as appropriate
- [ ] Applies pattern_overrides per-pattern
- [ ] Shell receives carafe decorations
- [ ] Graceful fallback when recipe not found
- [ ] All tests pass
