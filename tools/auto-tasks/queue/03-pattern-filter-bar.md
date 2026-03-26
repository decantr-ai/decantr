---
type: enrich
name: pattern-filter-bar
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

## Task: Create Filter Bar Pattern

Create the `filter-bar` pattern JSON and add mappings to both generators.

### Step 1: Study existing patterns and wiring

Read `content/core/patterns/hero.json` for schema. Read `packages/registry/src/wiring.ts` — filter-bar is a key signal producer that wires to data-table, card-grid, and activity-feed.

### Step 2: Create `content/patterns/filter-bar.json`

The filter-bar pattern provides search and filter controls. Create with:

- **id**: `filter-bar`
- **name**: `Filter Bar`
- **description**: Search input and filter controls for filtering page content
- **layout**: `row` (no card wrapping — sits above other patterns)
- **contained**: `false`
- **presets**:
  - `standard` (default) — Search input + dropdown filters + action buttons in a horizontal bar
  - `compact` — Search input only, filters in a collapsible popover
  - `advanced` — Multi-row with filter chips, saved filters, and clear-all
- **default_preset**: `standard`
- **components**: Input, Select, Button, Badge (for filter chips)
- **atoms**: `_flex _row _gap3 _items[center] _w[100%]` for horizontal layout
- **code**: Template code for each preset
- **io**: `{ "produces": ["search", "filters", "status"], "consumes": [] }`

### Step 3: Add shadcn mapping in generator-react

Read `packages/generator-react/src/shadcn.ts`. Add filter-bar mapping using:
- `Input` for search field
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` for filter dropdowns
- `Button` for action buttons (clear, apply)
- `Badge` for active filter chips
- `Popover` for compact preset's collapsed filters

### Step 4: Add Decantr mapping

Ensure the Decantr emitter handles filter-bar with flex row atoms, proper input/select component references, and responsive stacking below breakpoints.

### Step 5: Write tests

- Pattern JSON validity
- All three presets defined
- io.produces includes search and filters
- React generator emits Input + Select components
- Decantr generator emits correct flex row atoms
- Wiring: filter-bar produces signals consumed by data-table

## React Quality Compliance

All generated React code MUST follow these Vercel React best practices (enforced by quality-rules.ts if it exists, otherwise enforce manually):

**CRITICAL — zero tolerance:**
- NO barrel imports (import from specific paths: `@/components/ui/button` not `@/components/ui`)
- NO inline component definitions (never define a component inside another component)
- React.lazy() for page imports in router files
- Suspense boundaries around lazy-loaded routes

**HIGH — zero tolerance:**
- Functional setState when new state depends on previous (`setCount(prev => prev + 1)` not `setCount(count + 1)`)
- No useEffect for derived state (use useMemo instead of useEffect + setState)
- Hoist non-primitive default props to module level (`const DEFAULT_ITEMS: Item[] = []` outside component)

**MEDIUM — fix if encountered:**
- Hoist static JSX to module level
- Use React.memo for components receiving complex props
- Use primitive values in useEffect dependency arrays

**After completing your implementation**, if `packages/generator-react/src/quality-rules.ts` exists, run:
```ts
import { validateReactOutput } from './quality-rules.js';
// Pass your generated files through validation
```
If it doesn't exist yet, manually verify the CRITICAL rules by reading your generated output.

Add to acceptance criteria: "Generated React code has zero CRITICAL or HIGH quality violations"

### Acceptance Criteria
- [ ] `content/patterns/filter-bar.json` exists with valid schema
- [ ] `standard`, `compact`, and `advanced` presets defined
- [ ] `contained: false` set (no card wrapping)
- [ ] io.produces includes `search`, `filters`, `status`
- [ ] shadcn mapping uses Input, Select components
- [ ] Decantr emitter handles filter-bar atoms
- [ ] Wiring compatibility verified
- [ ] All tests pass
