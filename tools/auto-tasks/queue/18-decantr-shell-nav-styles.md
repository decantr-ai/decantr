---
type: enrich
name: decantr-shell-nav-styles
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

## Task: Add Nav Style Variant Support to Decantr Emitter

The Decantr emitter should emit the correct nav style CSS classes based on the recipe's carafe.nav_style field.

### Step 1: Read current state

Read `packages/generator-decantr/src/emit-app.ts` or wherever the Shell component is emitted. Read recipe JSON files to see the `carafe.nav_style` field. Read `packages/generator-decantr/src/` to find all emitter source files.

### Step 2: Implement nav style variants

The Decantr framework supports these nav style variants (CSS classes applied to Shell.Nav items):
- `pill` → `d-shell-nav-style-pill` — Rounded pill background on active item
- `underline` → `d-shell-nav-style-underline` — Bottom border underline on active item
- `filled` → `d-shell-nav-style-filled` — Filled background on active item
- `minimal` → `d-shell-nav-style-minimal` — Subtle text color change only
- `icon-glow` → `d-shell-nav-style-icon-glow` — Glow effect on nav item icons

When emitting the Shell component:
1. Read `recipe.carafe.nav_style` from the resolved recipe
2. Apply the corresponding CSS class to the Shell.Nav container
3. For each nav item, use `d-shell-nav-item` base class + `d-shell-nav-item-active` for the active route
4. Default to `pill` if no nav_style is specified

### Step 3: Handle Shell dimensions

Also read `recipe.carafe.dimensions` for:
- `nav_width` — Sidebar width (e.g., `"240px"`, `"280px"`)
- `header_height` — Header bar height (e.g., `"48px"`, `"56px"`)

Pass these as the `dimensions` prop to the Shell component.

### Step 4: Write tests

- Each nav style variant emits the correct CSS class
- Default nav style is pill when not specified
- Nav items have d-shell-nav-item base class
- Active nav item has d-shell-nav-item-active class
- Shell dimensions prop is passed when present in recipe
- Missing nav_style defaults gracefully

### Acceptance Criteria
- [ ] All 5 nav style variants mapped to correct CSS classes
- [ ] Nav style read from recipe.carafe.nav_style
- [ ] Default to pill when not specified
- [ ] Shell.Nav items use d-shell-nav-item / d-shell-nav-item-active
- [ ] Shell dimensions prop passed from recipe
- [ ] All tests pass
