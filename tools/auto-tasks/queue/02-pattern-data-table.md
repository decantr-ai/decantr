---
type: enrich
name: pattern-data-table
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

## Task: Create Data Table Pattern

Create the `data-table` pattern JSON and add mappings to both generators.

### Step 1: Study existing patterns

Read `content/core/patterns/hero.json` for the pattern schema. Read `packages/registry/src/wiring.ts` for WIRING_RULES — data-table is a key wiring target (consumes search/filters from filter-bar).

### Step 2: Create `content/patterns/data-table.json`

The data-table pattern renders a sortable, paginated table. Create with:

- **id**: `data-table`
- **name**: `Data Table`
- **description**: Sortable, filterable, paginated data table with row selection
- **layout**: `contained` (wraps in Card)
- **presets**:
  - `standard` (default) — Full-featured table with column headers, sortable columns, row selection checkboxes, pagination footer
  - `compact` — Denser rows, no selection, simpler pagination (prev/next only)
- **default_preset**: `standard`
- **components**: Table, TableHeader, TableBody, TableRow, TableCell, Checkbox, Button, Input, Pagination, Badge
- **atoms**: `_w[100%] _overflow[auto]` for table container
- **code**: Template code for both presets
- **io**: `{ "consumes": ["search", "filters", "data"], "produces": ["selection", "sort"], "actions": ["export", "delete", "edit"] }`

### Step 3: Add shadcn mapping in generator-react

Read `packages/generator-react/src/shadcn.ts`. Add data-table mapping using:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from shadcn
- `Checkbox` for row selection
- `Button` for pagination and actions
- `Input` for inline search (when not wired to filter-bar)
- `DropdownMenu` for column visibility and row actions

### Step 4: Add Decantr mapping

Ensure the Decantr emitter handles data-table with proper atoms for table layout, overflow scrolling, and responsive behavior.

### Step 5: Verify wiring compatibility

Read `packages/registry/src/wiring.ts`. Confirm that WIRING_RULES already reference `data-table` as a consumer of `filter-bar` signals. If the wiring rule references a pattern name that doesn't match the JSON id, fix it.

### Step 6: Write tests

- Pattern JSON validity
- Both presets defined with correct components
- io declarations match wiring expectations
- React generator emits Table components
- Decantr generator emits correct atoms
- Wiring: when paired with filter-bar, shared signals are created

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
- [ ] `content/patterns/data-table.json` exists with valid schema
- [ ] `standard` and `compact` presets defined
- [ ] io.consumes includes `search` and `filters`
- [ ] shadcn mapping uses Table family components
- [ ] Decantr emitter handles data-table atoms
- [ ] Wiring rules are compatible with pattern id
- [ ] All tests pass
