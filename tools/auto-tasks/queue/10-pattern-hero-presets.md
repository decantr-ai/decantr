---
type: enrich
name: pattern-hero-presets
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

## Task: Add Missing Hero Pattern Presets

The hero pattern already exists at `content/core/patterns/hero.json` with the `landing` preset. Add the missing presets and update both generators.

### Step 1: Read current state

Read `content/core/patterns/hero.json` to understand the current schema and the `landing` preset structure. Read both generators' emit-page files to see how hero is currently handled.

### Step 2: Add missing presets to hero.json

Add these presets while preserving the existing `landing` preset:

- **image-overlay** — Full-width background image with dark overlay, centered white text (headline + subtext + CTA buttons). Atoms: `_relative _flex _col _items[center] _justify[center] _text[center] _py20 _px4 _minH[60vh]`
- **image-overlay-compact** — Same as image-overlay but shorter (minH 40vh), smaller text, single button
- **split** — Two-column layout: text content on left, image/illustration on right. Atoms: `_grid _gc1 _lg:gc2 _gap8 _items[center] _py12`
- **empty-state** — Centered illustration placeholder + heading + description + action button. Used for zero-data states. Atoms: `_flex _col _items[center] _text[center] _py16 _gap4`

Each preset should include:
- `atoms` — spatial layout atoms
- `components` — component list (Button is common to all; image-overlay adds Image)
- `code` — template code string showing the structure

### Step 3: Update generator-react

Read `packages/generator-react/src/emit-page.ts`. Ensure the hero pattern handler can select the correct preset and emit appropriate shadcn components. The image-overlay presets need a `div` with `relative` + `overflow-hidden` classes and an `img` inside. The split preset needs a 2-column grid.

### Step 4: Update generator-decantr

Read `packages/generator-decantr/src/emit-page.ts`. Ensure the Decantr emitter selects the correct preset atoms. Image-overlay needs `_relative` and overlay div with `_absolute _inset0 _bg[rgba(0,0,0,0.5)]`.

### Step 5: Write tests

- hero.json has all 5 presets: landing, image-overlay, image-overlay-compact, split, empty-state
- Each preset has atoms, components, and code
- React generator handles all presets
- Decantr generator handles all presets
- Existing landing preset tests still pass

### Acceptance Criteria
- [ ] `content/core/patterns/hero.json` has all 5 presets
- [ ] Existing `landing` preset is unchanged
- [ ] `image-overlay`, `image-overlay-compact`, `split`, `empty-state` presets added
- [ ] React generator handles all hero presets
- [ ] Decantr generator handles all hero presets
- [ ] All existing tests still pass
- [ ] New tests cover the added presets
