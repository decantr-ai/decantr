---
type: enrich
name: decantr-animations
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

## Task: Add Entrance Animations to Decantr Output

The Decantr emitter should add animation classes to generated code based on recipe configuration.

### Step 1: Read current state

Read `packages/generator-decantr/src/emit-page.ts` and `packages/generator-decantr/src/emit-app.ts`. Read recipe JSON files to see if there is an `animation` config field.

### Step 2: Implement animation emission

Add animation classes to generated Decantr code:

1. **Page entrance** — Add `d-page-enter` class to the page container div. This triggers a CSS fade-in/slide-up animation when the page mounts.

2. **Stagger effect on lists** — When emitting card-grid or activity-feed patterns (or any pattern with repeated items), add `d-stagger` class to the list container. Each child gets `d-stagger-item` and a `style="--stagger-index: N"` for sequential animation delays.

3. **Card entrance** — Pattern cards get `d-card-enter` class for a subtle scale+fade entrance.

4. **Recipe animation config** — If the recipe JSON has an `animation` field:
   - `animation.page_enter` — Override the page entrance animation type: `"fade"`, `"slide-up"`, `"slide-left"`, `"none"`
   - `animation.stagger` — Enable/disable stagger: `true`/`false`
   - `animation.stagger_delay` — Custom delay per item in ms (default: 50)
   - `animation.card_enter` — Enable/disable card entrance: `true`/`false`

5. **No animation mode** — When `animation.page_enter` is `"none"`, skip all animation classes.

### Step 3: Update Shell.Body

The Shell.Body content area should also have `d-page-enter` applied when route changes.

### Step 4: Write tests

- Page container has d-page-enter class
- Card-grid items have d-stagger + d-stagger-item classes
- Card wrappers have d-card-enter class
- Recipe animation config overrides defaults
- animation.page_enter = "none" skips all animation classes
- Stagger index increments correctly

### Acceptance Criteria
- [ ] d-page-enter applied to page containers
- [ ] d-stagger + d-stagger-item applied to list/grid patterns
- [ ] d-card-enter applied to Card wrappers
- [ ] Recipe animation config respected
- [ ] "none" mode disables all animations
- [ ] Stagger index CSS variables set correctly
- [ ] All tests pass
