---
type: enrich
name: pattern-cta-section
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

## Task: Create CTA Section Pattern

Create the `cta-section` pattern and add mappings to both generators.

### Step 1: Study existing patterns

Read `content/core/patterns/hero.json` for schema reference.

### Step 2: Create `content/patterns/cta-section.json`

The CTA (Call to Action) section is a standalone full-width section that prompts user action. Create with:

- **id**: `cta-section`
- **name**: `CTA Section`
- **description**: Full-width call-to-action section with headline, description, and action buttons
- **layout**: `hero` (standalone, no card wrapping)
- **contained**: `false`
- **presets**:
  - `standard` (default) — Centered headline + subtext + primary/secondary buttons. Background can have gradient or subtle pattern.
  - `split` — Two-column: text on left, image/illustration on right
  - `banner` — Compact horizontal bar with text on left, single button on right. Good for inline CTAs between content sections.
- **default_preset**: `standard`
- **components**: Button
- **atoms**: `_flex _col _items[center] _text[center] _py12 _px4 _gap4` for standard, `_grid _gc1 _lg:gc2 _gap6 _items[center] _py8` for split, `_flex _row _justify[between] _items[center] _py4 _px6 _rounded _bgprimary/10` for banner
- **code**: Template code for each preset
- **io**: `{ "consumes": [], "produces": [], "actions": ["cta-click"] }`

### Step 3: Add shadcn mapping in generator-react

Map to:
- `Button` (primary variant for main CTA, outline/ghost for secondary)
- Heading elements (h2/h3)
- Paragraph elements for description text

### Step 4: Add Decantr mapping

Emit Decantr components with centered flex layout atoms, button components, and proper spacing.

### Step 5: Write tests

- All 3 presets defined
- contained is false
- React generator emits Button components
- Decantr generator emits centered layout atoms

### Acceptance Criteria
- [ ] `content/patterns/cta-section.json` exists with valid schema
- [ ] `standard`, `split`, and `banner` presets defined
- [ ] `contained: false` set
- [ ] shadcn mapping uses Button variants
- [ ] Decantr emitter handles CTA layout atoms
- [ ] All tests pass
