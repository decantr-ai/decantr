# Recipe → Theme Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the recipe content type by merging all recipe data into themes. One concept, one fetch, one identity. Then re-run the harness to validate.

**Architecture:** Recipe fields (decorators, spatial, motion, treatments, effects, shell, compositions, radius) are absorbed into theme JSON files. The essence schema drops `dna.theme.recipe`, renames `style` to `id`. The CLI fetches one unified theme object. All recipe references are removed across 7 packages, 2 repos, and all documentation.

**Tech Stack:** TypeScript, Vitest, JSON content migration, pnpm workspace

**Spec:** `docs/specs/2026-04-02-recipe-theme-merge-design.md`

**Depends on:** Visual Treatment System (already implemented on `feat/visual-treatment-system` branch)

---

## Phase 1: Content Migration (decantr-content)

### Task 1: Script the recipe-into-theme merge for decantr-content

**Files:**
- Create: `/Users/davidaimi/projects/decantr-content/scripts/merge-recipes-into-themes.js`
- Modify: All 11 paired theme JSON files in `/Users/davidaimi/projects/decantr-content/themes/`

This script reads each recipe, finds its paired theme, and merges recipe fields into the theme using the new field names.

- [ ] **Step 1: Write the merge script**

Create `/Users/davidaimi/projects/decantr-content/scripts/merge-recipes-into-themes.js`:

```javascript
#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RECIPES_DIR = join(import.meta.dirname, '..', 'recipes');
const THEMES_DIR = join(import.meta.dirname, '..', 'themes');

// Field mapping: recipe field name → theme field name
const FIELD_MAP = {
  decorators: 'decorators',
  spatial_hints: 'spatial',
  animation: 'motion',
  visual_effects: 'effects',
  treatment_overrides: 'treatments',
  compositions: 'compositions',
  radius_hints: 'radius',
  pattern_preferences: 'pattern_preferences',
  shell: 'shell',
  card_styles: 'card_styles',
};

// Fields to skip (recipe metadata, not visual data)
const SKIP_FIELDS = new Set([
  'id', 'name', 'type', 'slug', 'namespace', 'version', 'visibility', 'status',
  '$schema', 'schema_version', 'decantr_compat', 'description', 'style', 'mode',
  'dependencies', 'source', 'tags',
  'created_at', 'updated_at', 'published_at', 'owner_name', 'owner_username',
]);

const recipes = readdirSync(RECIPES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');

let merged = 0;
let skipped = 0;

for (const file of recipes) {
  const recipeName = file.replace('.json', '');
  const themePath = join(THEMES_DIR, file);
  const recipePath = join(RECIPES_DIR, file);

  if (!existsSync(themePath)) {
    console.log(`SKIP: ${recipeName} — no paired theme`);
    skipped++;
    continue;
  }

  const recipe = JSON.parse(readFileSync(recipePath, 'utf-8'));
  const theme = JSON.parse(readFileSync(themePath, 'utf-8'));

  // Merge recipe fields into theme using field map
  for (const [recipeKey, themeKey] of Object.entries(FIELD_MAP)) {
    if (recipe[recipeKey] !== undefined) {
      theme[themeKey] = recipe[recipeKey];
    }
  }

  // Merge animation.durations/timing into motion if animation was mapped
  if (recipe.animation && theme.motion) {
    // motion already has the animation object, but merge motion_hints if theme had them
    if (theme.motion_hints) {
      theme.motion.preference = theme.motion_hints.preference ?? theme.motion.preference;
      theme.motion.reduce_motion = theme.motion_hints.reduce_motion_default ?? false;
    }
  }

  // Merge typography_hints with mono font if applicable
  if (theme.typography_hints) {
    theme.typography = {
      ...theme.typography_hints,
      ...(theme.typography || {}),
    };
    delete theme.typography_hints;
  }

  // Clean up old field names
  delete theme.motion_hints;

  writeFileSync(themePath, JSON.stringify(theme, null, 2) + '\n');
  console.log(`MERGED: ${recipeName} → themes/${file} (${Object.keys(FIELD_MAP).filter(k => recipe[k]).length} fields)`);
  merged++;
}

console.log(`\nDone: ${merged} merged, ${skipped} skipped`);
```

- [ ] **Step 2: Run the merge script**

```bash
cd /Users/davidaimi/projects/decantr-content
node scripts/merge-recipes-into-themes.js
```

Expected: 11 merged, 1 skipped (neon-cyber has no paired theme).

- [ ] **Step 3: Verify a merged theme**

Read `themes/carbon.json` and verify it now contains: `decorators`, `spatial`, `motion`, `treatments`, `effects`, `shell`, `compositions`, `radius`, `typography` (merged from typography_hints + recipe data). Original fields (seed, palette, tokens, modes, shapes, cvd_support) should be preserved.

- [ ] **Step 4: Commit**

```bash
git add themes/ scripts/merge-recipes-into-themes.js
git commit -m "feat: merge 11 recipes into paired themes"
```

---

### Task 2: Create neon-cyber theme and carbon-neon variant

**Files:**
- Create: `/Users/davidaimi/projects/decantr-content/themes/neon-cyber.json`
- Create: `/Users/davidaimi/projects/decantr-content/themes/carbon-neon.json`

- [ ] **Step 1: Create neon-cyber theme**

Use `neon-dark` theme as the palette base. Absorb `neon-cyber` recipe decorators and spatial hints. Create `/Users/davidaimi/projects/decantr-content/themes/neon-cyber.json`:

Read `themes/neon-dark.json` for the seed/palette, then read `recipes/neon-cyber.json` for decorators/spatial_hints. Combine into a new theme file with:
- `id: "neon-cyber"`, `name: "Neon Cyber"`
- `seed` from neon-dark
- `palette` from neon-dark
- `decorators` from neon-cyber recipe
- `spatial` from neon-cyber recipe spatial_hints
- `modes: ["dark"]`, `shapes: ["rounded", "sharp"]`
- `typography: { scale: "1.25", heading_weight: 700, body_weight: 400, mono: "ui-monospace, 'Cascadia Code', monospace" }`
- `motion: { preference: "full", reduce_motion: false, entrance: "neon-fade", timing: "cubic-bezier(0.4, 0, 0.2, 1)", durations: { hover: "0.15s", entrance: "0.3s" } }`

- [ ] **Step 2: Create carbon-neon theme variant**

Copy `themes/carbon.json` (after merge in Task 1). Modify:
- `id: "carbon-neon"`, `name: "Carbon Neon"`
- `seed.accent: "#00D4FF"` (neon cyan, replacing muted #6B8AAE)
- Add to palette: `"accent-glow": { "dark": "rgba(0, 212, 255, 0.3)" }`
- Add to `treatments`: `"d-interactive[data-variant=\"primary\"]:hover": { "box-shadow": "0 0 20px var(--d-accent-glow, rgba(0, 212, 255, 0.3))" }`
- `typography.mono: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace"`
- Update `description` and `tags` to reflect neon variant

- [ ] **Step 3: Commit**

```bash
git add themes/neon-cyber.json themes/carbon-neon.json
git commit -m "feat: create neon-cyber theme and carbon-neon variant"
```

---

### Task 3: Update blueprints and clean up content

**Files:**
- Modify: All 19 blueprint JSON files in `/Users/davidaimi/projects/decantr-content/blueprints/`
- Modify: `/Users/davidaimi/projects/decantr-content/validate.js`
- Modify: `/Users/davidaimi/projects/decantr-content/scripts/sync-to-registry.js`
- Delete: `/Users/davidaimi/projects/decantr-content/recipes/` (entire directory)

- [ ] **Step 1: Write blueprint migration script**

Create `/Users/davidaimi/projects/decantr-content/scripts/migrate-blueprints.js`:

```javascript
#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BP_DIR = join(import.meta.dirname, '..', 'blueprints');
const files = readdirSync(BP_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');

for (const file of files) {
  const path = join(BP_DIR, file);
  const bp = JSON.parse(readFileSync(path, 'utf-8'));

  if (bp.theme) {
    // Rename style → id
    if (bp.theme.style) {
      bp.theme.id = bp.theme.style;
      delete bp.theme.style;
    }
    // Remove recipe field
    delete bp.theme.recipe;
  }

  // Remove dependencies.recipes
  if (bp.dependencies?.recipes) {
    delete bp.dependencies.recipes;
  }
  // Remove dependencies.styles (redundant — theme id is the reference)
  if (bp.dependencies?.styles) {
    delete bp.dependencies.styles;
  }

  writeFileSync(path, JSON.stringify(bp, null, 2) + '\n');
  console.log(`Updated: ${file} → theme.id="${bp.theme?.id}"`);
}
```

- [ ] **Step 2: Fix cloud-platform before migration**

In `/Users/davidaimi/projects/decantr-content/blueprints/cloud-platform.json`, change `theme.recipe` from `"auradecantism"` to `"launchpad"` (matching `theme.style`). Then the migration script will rename style→id and remove recipe cleanly.

Actually, just let the migration script handle it — it renames `style` to `id` and removes `recipe` regardless. After migration, cloud-platform will have `theme.id: "launchpad"`.

- [ ] **Step 3: Run blueprint migration**

```bash
node scripts/migrate-blueprints.js
```

- [ ] **Step 4: Update agent-marketplace to use carbon-neon**

In `/Users/davidaimi/projects/decantr-content/blueprints/agent-marketplace.json`, change `theme.id` from `"carbon"` to `"carbon-neon"` (the neon variant we created in Task 2).

- [ ] **Step 5: Remove dependencies.recipes from archetypes**

Write a quick script or manually remove `dependencies.recipes` from the 6 archetypes that have it (metrics-monitor, config-editor, marketing-devtool, terminal-home, log-viewer, marketing-landing). Also remove `dependencies.recipes: {}` placeholder from all patterns.

```bash
# Quick sed to remove empty recipes deps from all JSON files
find archetypes patterns -name "*.json" -exec python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
changed = False
if 'dependencies' in data and 'recipes' in data['dependencies']:
    del data['dependencies']['recipes']
    changed = True
if changed:
    with open(sys.argv[1], 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')
    print(f'Updated: {sys.argv[1]}')
" {} \;
```

- [ ] **Step 6: Delete recipes/ directory**

```bash
rm -rf recipes/
```

- [ ] **Step 7: Update validate.js**

Remove `'recipes'` from the content types array. Update from:
```javascript
const types = ['patterns', 'recipes', 'themes', 'blueprints', 'archetypes', 'shells'];
```
to:
```javascript
const types = ['patterns', 'themes', 'blueprints', 'archetypes', 'shells'];
```

- [ ] **Step 8: Update sync-to-registry.js**

Find the type mapping that includes `recipes` and remove it. This is in the `PLURAL_TO_SINGULAR` or content types list.

- [ ] **Step 9: Run validation**

```bash
node validate.js
```

Expected: All files pass, zero errors.

- [ ] **Step 10: Commit and push**

```bash
git add -A
git commit -m "feat: complete recipe→theme merge — remove recipes content type"
git push origin main
```

---

## Phase 2: Core Packages (monorepo)

### Task 4: Update essence-spec — remove recipe from types, guard, migrate

**Files:**
- Modify: `packages/essence-spec/src/types.ts`
- Modify: `packages/essence-spec/src/guard.ts`
- Modify: `packages/essence-spec/src/migrate.ts`
- Modify: `packages/essence-spec/src/normalize.ts`
- Modify: `packages/essence-spec/src/density.ts`
- Modify: `packages/essence-spec/schema/essence.v2.json`
- Modify: `packages/essence-spec/schema/essence.v3.json`
- Modify: Multiple test files

- [ ] **Step 1: Update Theme interface in types.ts**

In `packages/essence-spec/src/types.ts`, find the `Theme` interface (line ~28-33):

```typescript
export interface Theme {
  style: ThemeStyle | string;
  mode: ThemeMode;
  recipe: string;
  shape?: ThemeShape;
}
```

Replace with:

```typescript
export interface Theme {
  id: string;
  mode: ThemeMode;
  shape?: ThemeShape;
}
```

Also update the `EssenceDNA` v3.1 if it references `theme: Theme` (it inherits).

- [ ] **Step 2: Remove recipe from GuardViolation and GuardContext**

In `packages/essence-spec/src/guard.ts`:
- Remove `'recipe'` from the `GuardViolation['rule']` union type
- Remove `recipe?: string` from `GuardContext`
- Remove the entire recipe guard rule block (lines ~260-279)
- Remove `enforce_recipe` from any Guard interface

- [ ] **Step 3: Update migrate.ts**

Find where `theme.recipe` is preserved during v2→v3 migration. Remove the recipe field mapping. Update to rename `style` → `id` where applicable.

- [ ] **Step 4: Update normalize.ts**

Find where v1 `vintage.recipe` maps to v2 `theme.recipe`. Remove the recipe mapping. Update `style` → `id` if this function creates Theme objects.

- [ ] **Step 5: Update JSON schemas**

In `packages/essence-spec/schema/essence.v2.json` and `essence.v3.json`:
- Remove `recipe` from the theme object's `required` array
- Remove `recipe` from the theme object's `properties`
- Rename `style` property to `id`

- [ ] **Step 6: Rename RecipeSpatialHints in density.ts**

The local `RecipeSpatialHints` interface in density.ts is fine to keep as-is (it's an internal interface not tied to the recipe concept). But rename it to `SpatialHints` for clarity since it's now theme data.

Also rename in the exported `computeDensity` function parameter.

- [ ] **Step 7: Update all test files**

Update test fixtures that reference `theme.recipe` or `theme.style`:
- `guard.test.ts`, `guard-v3.test.ts` — remove recipe guard test cases, update fixtures
- `normalize.test.ts`, `normalize-v3.test.ts` — update theme fixtures
- `migrate.test.ts` — update migration test expectations
- `density.test.ts` — update if parameter names changed
- `integration-v3.test.ts` — update fixtures
- `validate.test.ts` — update fixtures

For each: change `{ style: 'X', mode: 'dark', recipe: 'X', shape: 'rounded' }` to `{ id: 'X', mode: 'dark', shape: 'rounded' }`.

- [ ] **Step 8: Build and run tests**

```bash
cd packages/essence-spec && pnpm build && pnpm test -- --run
```

Fix any failures.

- [ ] **Step 9: Bump version to 1.0.0-beta.10**

- [ ] **Step 10: Commit**

```bash
git add packages/essence-spec/
git commit -m "feat(essence-spec): remove recipe from schema, rename style→id, V3.2"
```

---

### Task 5: Update registry — merge Recipe into Theme type, remove recipe methods

**Files:**
- Modify: `packages/registry/src/types.ts`
- Modify: `packages/registry/src/api-client.ts`
- Modify: `packages/registry/src/resolver.ts`
- Modify: `packages/registry/src/index.ts`
- Modify: `packages/registry/src/pattern.ts`
- Modify: Test files

- [ ] **Step 1: Merge Recipe fields into Theme type in types.ts**

Remove the `Recipe`, `RecipeSpatialHints`, `RecipeVisualEffects`, `RecipeShell` interfaces. Add their fields to a new expanded `Theme` interface:

```typescript
export interface ThemeSpatial {
  section_padding: string | null;
  density_bias: number;
  content_gap_shift: number;
  card_wrapping: 'always' | 'minimal' | 'none';
  surface_override: string | null;
}

export interface ThemeShell {
  preferred: string[];
  nav_style: string;
  root?: string;
  nav?: string;
  header?: string;
  dimensions?: { navWidth?: string; headerHeight?: string } | null;
}

export interface Theme {
  id: string;
  name?: string;
  description?: string;
  seed: Record<string, string>;
  palette: Record<string, Record<string, string>>;
  tokens?: { base?: Record<string, string>; cvd?: Record<string, Record<string, string>> };
  modes?: string[];
  shapes?: string[];
  // Absorbed from recipe
  decorators?: Record<string, string>;
  treatments?: Record<string, Record<string, string>>;
  spatial?: ThemeSpatial;
  shell?: ThemeShell;
  effects?: { enabled: boolean; intensity: string; type_mapping?: Record<string, string[]> };
  motion?: { preference?: string; reduce_motion?: boolean; entrance?: string; timing?: string; durations?: Record<string, string> };
  typography?: { scale?: string; heading_weight?: number; body_weight?: number; mono?: string };
  radius?: { philosophy: string; base: number };
  compositions?: Record<string, { shell: string; description: string; effects?: string[] }>;
  pattern_preferences?: { prefer: string[]; avoid: string[]; default_presets?: Record<string, string> };
}
```

Remove `'recipe'` from `ContentType` and `ApiContentType` unions. Remove `recipe` from `Blueprint.theme`.

- [ ] **Step 2: Remove recipe methods from api-client.ts**

Remove `getRecipe()` and `getRecipes()` methods. Keep `getTheme()` and `getThemes()`.

- [ ] **Step 3: Update resolver.ts**

Remove `recipe` from `ContentMap` and `TYPE_DIRS`.

- [ ] **Step 4: Update pattern.ts**

Rename `recipeDefaultPresets` parameter to `themeDefaultPresets` or similar.

- [ ] **Step 5: Update index.ts exports**

Remove `Recipe`, `RecipeSpatialHints`, `RecipeVisualEffects`, `RecipeShell` exports. Add `ThemeSpatial`, `ThemeShell` exports. Keep `Theme` export (now expanded).

- [ ] **Step 6: Update tests, build, bump version**

Fix registry test fixtures. Build. Bump to `1.0.0-beta.10`.

- [ ] **Step 7: Commit**

```bash
git add packages/registry/
git commit -m "feat(registry): merge Recipe into Theme type, remove recipe content type"
```

---

### Task 6: Update core — remove recipe resolution, merge into theme

**Files:**
- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/resolve.ts`
- Modify: `packages/core/src/ir.ts`
- Modify: `packages/core/src/pipeline.ts`
- Modify: Test files

- [ ] **Step 1: Update types.ts**

- Rename `IRRecipeDecoration` to `IRThemeDecoration`
- Remove `recipe: string` from `IRTheme`
- Update `IRShellConfig` if it references recipe

- [ ] **Step 2: Update resolve.ts**

- Rename `buildRecipeDecoration(recipe)` → `buildThemeDecoration(theme)` — source shell data from theme instead of recipe
- Remove separate recipe resolution (lines ~296-362) — theme resolution now provides everything
- Update `buildTheme()` and `buildThemeFromV3()` — remove `recipe` field, read `theme.id` instead of `theme.style`
- Update `resolveVisualEffects(recipe, pattern)` → `resolveVisualEffects(theme, pattern)`
- Update `resolvePages()` — source recipe data from theme

- [ ] **Step 3: Update ir.ts and pipeline.ts**

Update references from `resolved.recipe` to `resolved.theme` (the theme now contains decoration data).

- [ ] **Step 4: Update all core tests**

~40 recipe references across resolve.test.ts, resolve-v3.test.ts, pipeline.test.ts, pipeline-v3.test.ts, ir.test.ts.

- [ ] **Step 5: Build, bump version to 1.0.0-beta.9**

- [ ] **Step 6: Commit**

```bash
git add packages/core/
git commit -m "feat(core): remove recipe resolution, source visual data from theme"
```

---

### Task 7: Update CLI — single ThemeData, remove fetchRecipe, update all commands

**Files:**
- Modify: `packages/cli/src/scaffold.ts` (ThemeData interface, scaffoldProject, all recipe data paths)
- Modify: `packages/cli/src/registry.ts` (remove fetchRecipe/fetchRecipes)
- Modify: `packages/cli/src/index.ts` (init command — remove recipe fetch)
- Modify: `packages/cli/src/commands/magic.ts` (remove recipe fetch)
- Modify: `packages/cli/src/commands/theme-switch.ts` (remove recipe flag)
- Modify: `packages/cli/src/commands/create.ts` (remove recipe content type)
- Modify: `packages/cli/src/commands/publish.ts` (remove recipe type mapping)
- Modify: `packages/cli/src/commands/registry-mirror.ts` (remove recipes from mirror list)
- Modify: `packages/cli/src/telemetry.ts` (remove recipe from DNA_RULES)
- Modify: `packages/cli/src/treatments.ts` (update if it imports RecipeData)

This is the largest task. The key change: merge RecipeData fields INTO ThemeData so there's one interface and one data flow.

- [ ] **Step 1: Merge RecipeData into ThemeData in scaffold.ts**

Replace the two interfaces with one:

```typescript
export interface ThemeData {
  // Color
  seed?: Record<string, string>;
  palette?: Record<string, Record<string, string>>;
  tokens?: { base?: Record<string, string>; cvd?: Record<string, Record<string, string>> };
  cvd_support?: string[];
  // Typography
  typography?: { scale?: string; heading_weight?: number; body_weight?: number; mono?: string };
  // Motion
  motion?: { preference?: string; reduce_motion?: boolean; entrance?: string; timing?: string; durations?: Record<string, string> };
  // Visual treatment (was RecipeData)
  decorators?: Record<string, string>;
  treatments?: Record<string, Record<string, string>>;
  spatial?: { density_bias?: number; content_gap_shift?: number; section_padding?: string | null; card_wrapping?: string; surface_override?: string };
  radius?: { philosophy: string; base: number };
  // Layout hints
  shell?: { preferred?: string[]; nav_style?: string; root?: string; nav?: string };
  effects?: { enabled?: boolean; intensity?: string; type_mapping?: Record<string, string[]> };
  compositions?: Record<string, unknown>;
}
```

- [ ] **Step 2: Update scaffoldProject and all callers**

Remove the `recipeData` parameter from `scaffoldProject()`. All recipe data now comes from `themeData`. Update every place that reads `recipeData.decorators` to read `themeData.decorators`, etc.

- [ ] **Step 3: Remove fetchRecipe from registry.ts**

Remove `fetchRecipe()`, `fetchRecipes()` methods and `'recipes'` from `ALL_CONTENT_TYPES`.

- [ ] **Step 4: Update init command (index.ts)**

Remove the separate `registryClient.fetchRecipe(recipeName)` call. The theme fetch already provides everything. Update `buildEssenceV3` to use `theme.id` instead of `theme.style`, remove `recipe` from the essence theme object.

- [ ] **Step 5: Update magic.ts**

Remove recipe fetch block. Theme fetch returns everything needed.

- [ ] **Step 6: Update theme-switch.ts**

Remove `--recipe` flag if it exists. Theme switch only needs to fetch the new theme (which now includes all decoration data).

- [ ] **Step 7: Update create.ts, publish.ts, registry-mirror.ts**

Remove `'recipe'`/`'recipes'` from content type arrays and type mappings.

- [ ] **Step 8: Update treatments.ts if needed**

If `generateTreatmentCSS` imports `RecipeData`, update to use `ThemeData` fields instead.

- [ ] **Step 9: Update generateTokensCSS to emit motion and font-mono tokens**

Since the theme now has `motion.durations` and `typography.mono`, emit:
- `--d-font-mono: <typography.mono value>`
- `--d-duration-hover: <motion.durations.hover>`
- `--d-duration-entrance: <motion.durations.entrance>`
- `--d-easing: <motion.timing>`
- `--d-accent-glow: <palette.accent-glow.dark>` (if present)

- [ ] **Step 10: Update DECANTR.md template**

The `CSS_APPROACH_CONTENT` constant should reference `theme` not `recipe` in any remaining mentions. The treatment reference section is already correct from the treatment system work.

Add motion tokens to the design tokens table:
```
| `--d-font-mono` | Monospace font stack | Code, metrics, data |
| `--d-duration-hover` | Hover transition | Interactive elements |
| `--d-easing` | Animation easing | All transitions |
| `--d-accent-glow` | Glow color (if theme provides) | Hover effects, focus rings |
```

- [ ] **Step 11: Update all CLI tests**

~20 recipe references across scaffold.test.ts, scaffold-v3.test.ts, treatments.test.ts, context-gen.test.ts, etc. Update fixtures from `RecipeData` to `ThemeData` fields.

- [ ] **Step 12: Build and run full test suite**

```bash
cd packages/cli && pnpm build && pnpm test -- --run
```

Fix all failures.

- [ ] **Step 13: Bump version to 1.5.4**

- [ ] **Step 14: Commit**

```bash
git add packages/cli/
git commit -m "feat(cli): single ThemeData flow — recipe concept removed"
```

---

### Task 8: Update MCP server — remove resolve_recipe tool, update descriptions

**Files:**
- Modify: `packages/mcp-server/src/tools.ts`
- Modify: Test files

- [ ] **Step 1: Remove decantr_resolve_recipe tool**

Delete the entire tool definition (~lines 223-237) and its handler in the switch/case block.

- [ ] **Step 2: Update remaining tool descriptions**

- `decantr_search_registry`: Remove `'recipe'` from accepted type values
- `decantr_resolve_recipe`: DELETED
- `decantr_check_drift`: Remove recipe rule from description
- `decantr_accept_drift`: Remove `case 'recipe'` handler
- `decantr_create_essence`: Remove `recipe` from skeleton theme object, use `id` instead of `style`
- `decantr_update_essence`: Remove recipe from updatable fields, rename `style` → `id`
- `decantr_get_section_context`: Already updated in treatment system work

- [ ] **Step 3: Update tests, build, bump to 1.0.0-beta.11**

- [ ] **Step 4: Commit**

```bash
git add packages/mcp-server/
git commit -m "feat(mcp): remove resolve_recipe tool, update for theme merge"
```

---

### Task 9: Update API and Web app

**Files:**
- Modify: `apps/api/src/routes/content.ts` (route regexes)
- Modify: `apps/api/src/app.ts` (skip-auth and rate-limit regexes)
- Modify: `apps/api/src/routes/search.ts` (type mapping)
- Modify: `apps/api/src/types.ts` (ContentType, VALID_CONTENT_TYPES)
- Modify: `apps/web/src/components/registry/search-filter-bar.tsx`
- Modify: `apps/web/src/app/dashboard/content/page.tsx`
- Modify: `apps/web/src/app/dashboard/content/new/page.tsx`
- Modify: `apps/web/src/app/page.tsx` (marketing copy)

- [ ] **Step 1: Remove recipe from API types and routes**

In `apps/api/src/types.ts`: Remove `'recipe'` from `ContentType` union, `VALID_CONTENT_TYPES` array, and `PLURAL_TO_SINGULAR` map.

In `apps/api/src/routes/content.ts`: Remove `recipes` from the route regex patterns.

In `apps/api/src/app.ts`: Remove `recipes` from skip-auth and rate-limit regex patterns.

In `apps/api/src/routes/search.ts`: Remove `recipes: 'recipe'` mapping.

- [ ] **Step 2: Remove recipe from web app**

In `apps/web/src/components/registry/search-filter-bar.tsx`: Remove `'recipes'` from filter type options.

In `apps/web/src/app/dashboard/content/page.tsx`: Remove `case 'recipe'`.

In `apps/web/src/app/dashboard/content/new/page.tsx`: Remove `'recipe'` from CONTENT_TYPES.

In `apps/web/src/app/page.tsx`: Change marketing copy from "recipes" to "themes" (3 occurrences).

- [ ] **Step 3: Commit**

```bash
git add apps/api/ apps/web/
git commit -m "feat(api,web): remove recipe content type"
```

---

### Task 10: Update all documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/css-scaffolding-guide.md`
- Modify: `docs/architecture/scaffolding-flow.md`
- Modify: `packages/css/README.md`
- Modify: `.claude/skills/harness.md`

- [ ] **Step 1: Update CLAUDE.md**

Major updates:
- Remove recipe from Content Architecture table
- Remove recipe from terminology table (no more "Recipe" → "Recipe" mapping)
- Update MCP tools table (remove decantr_resolve_recipe, update descriptions)
- Update CLI commands if any reference recipe
- Change `dna.theme.recipe` references to show new schema without recipe
- Update Guard Rules section (remove recipe guard)
- Remove recipe from Content Types table (was: `recipes/ | 11 | Visual decoration rules`)
- Update Anti-Pattern Red Flags if any mention recipes

- [ ] **Step 2: Update docs/css-scaffolding-guide.md**

Remove any recipe references. Theme is now the sole source for decorators/spatial/animation.

- [ ] **Step 3: Update docs/architecture/scaffolding-flow.md**

Remove recipe fetch from flow diagram. Simplify to single theme fetch. Remove recipe fields from the data model boxes.

- [ ] **Step 4: Update harness skill**

In `.claude/skills/harness.md`, remove any remaining recipe references. The harness agent prompt template should reference themes, not recipes. Update the scaffold command examples if they mention recipe.

- [ ] **Step 5: Update the decantr-engineering skill**

The session start hook at `.claude/skills/decantr-engineering` references recipes extensively. Update terminology throughout.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md docs/ .claude/skills/ packages/css/README.md
git commit -m "docs: complete recipe→theme terminology migration across all documentation"
```

---

## Phase 3: Validate

### Task 11: Build, test, publish

- [ ] **Step 1: Full monorepo build**

```bash
pnpm build
```

- [ ] **Step 2: Full monorepo test suite**

```bash
pnpm test
```

Fix any remaining failures. There may be cross-package test fixtures that still reference recipes.

- [ ] **Step 3: Notify user to publish packages**

Provide commands:
```bash
cd packages/essence-spec && npm publish --tag beta
cd ../registry && npm publish --tag beta
cd ../core && npm publish --tag beta
cd ../cli && npm publish
cd ../mcp-server && npm publish --tag beta

# Promote to latest
npm dist-tag add @decantr/essence-spec@1.0.0-beta.10 latest
npm dist-tag add @decantr/registry@1.0.0-beta.10 latest
npm dist-tag add @decantr/core@1.0.0-beta.9 latest
npm dist-tag add @decantr/mcp-server@1.0.0-beta.11 latest
```

---

### Task 12: Re-scaffold and run harness

- [ ] **Step 1: Wait for decantr-content GitHub Actions sync**

Verify the content sync completed:
```bash
curl -s "https://api.decantr.ai/v1/themes/@official/carbon-neon" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id','MISSING'))"
```
Expected: `carbon-neon`

- [ ] **Step 2: Clean and re-scaffold agent-marketplace**

```bash
cd apps/showcase/agent-marketplace
rm -rf decantr.essence.json DECANTR.md .decantr/ src/styles/ src/pages/ src/components/ src/layouts/ src/App.tsx src/main.tsx dist/
mkdir -p src
node ../../../packages/cli/dist/bin.js sync
node ../../../packages/cli/dist/bin.js init --blueprint=agent-marketplace --existing --yes
```

Verify:
- `decantr.essence.json` has `dna.theme.id: "carbon-neon"` (NOT `style` or `recipe`)
- `tokens.css` has `--d-accent: #00D4FF` (neon, not muted)
- `tokens.css` has `--d-font-mono`, `--d-accent-glow`, `--d-duration-hover`, `--d-easing`
- `treatments.css` has all 6 treatment categories + carbon decorators
- No `decorators.css` file (old name gone)

- [ ] **Step 3: Run full harness**

Dispatch harness agent (same as Run 3 format). Compare results to Run 3 baseline. Key metrics to beat:
- Token efficiency: >86%
- Treatment coverage: >88%
- Hand-rolled CSS: 0
- Visual quality: >4.4/5 (neon accent should improve this)
- Personality compliance: >95% (neon accent matches personality now)

If critical scaffold issues are found (missing treatment classes, broken tokens, wrong accent color), break from harness, fix at framework level, re-scaffold, and re-run.

- [ ] **Step 4: Commit**

```bash
git add apps/showcase/agent-marketplace/
git commit -m "chore: re-scaffold agent-marketplace with recipe→theme merge"
```
