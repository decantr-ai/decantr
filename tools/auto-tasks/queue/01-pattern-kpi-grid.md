---
type: enrich
name: pattern-kpi-grid
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

## Task: Create KPI Grid Pattern

Create the `kpi-grid` pattern JSON and add mappings to both generators.

### Step 1: Study the existing pattern format

Read `content/core/patterns/hero.json` to understand the pattern JSON schema. Also read any existing patterns in `content/patterns/` for reference. Study how `packages/generator-react/src/emit-page.ts` and `packages/generator-decantr/src/emit-page.ts` consume pattern data.

### Step 2: Create `content/patterns/kpi-grid.json`

The KPI grid pattern displays key performance indicator cards in a responsive grid. Create the file with:

- **id**: `kpi-grid`
- **name**: `KPI Grid`
- **description**: A grid of key performance indicator cards showing metrics with labels, values, and trend indicators
- **layout**: `grid` (should be wrapped in Card when used in blends)
- **presets**:
  - `dashboard` (default) — 4-column grid of stat cards with icon, label, value, and change percentage
  - `compact` — Denser 2-row layout with smaller cards, no icons, just label + value + sparkline placeholder
- **default_preset**: `dashboard`
- **components**: Card, Icon (abstract), Badge
- **atoms**: Appropriate spatial atoms for each preset (grid columns, gaps, padding)
- **code**: Template code strings for both presets showing the component structure
- **io**: `{ "produces": ["kpi-data"], "consumes": ["date-range"] }` — KPIs can be filtered by date range

### Step 3: Add shadcn mapping in generator-react

Read `packages/generator-react/src/shadcn.ts` to understand the COMPONENT_MAP structure. Add a mapping entry for the kpi-grid pattern that maps to shadcn Card components with stat display layout. The KPI card should use:
- `Card`, `CardHeader`, `CardTitle`, `CardContent` from shadcn
- An icon placeholder (lucide-react icon)
- Trend indicator using Badge or colored text

### Step 4: Add Decantr atom mapping in generator-decantr

Read `packages/generator-decantr/src/atoms.ts` and `packages/generator-decantr/src/emit-page.ts`. Ensure kpi-grid spatial atoms are properly mapped. The pattern should emit Decantr Card components with `_grid _gc2 _lg:gc4 _gap4` layout atoms.

### Step 5: Write tests

Create test files that verify:
- The pattern JSON is valid and parseable
- The pattern has both presets defined
- The React generator can resolve and emit a page containing kpi-grid
- The Decantr generator can resolve and emit a page containing kpi-grid
- The io declarations are correct

Place tests alongside existing test files in each package's test directory.

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
- [ ] `content/patterns/kpi-grid.json` exists and is valid JSON
- [ ] Pattern has `dashboard` and `compact` presets
- [ ] Pattern has io declarations for produces/consumes
- [ ] `generator-react` shadcn.ts has kpi-grid component mapping
- [ ] `generator-decantr` properly emits kpi-grid atoms
- [ ] Tests pass for pattern validation and both generators
- [ ] All existing tests still pass
