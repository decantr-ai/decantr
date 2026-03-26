---
type: enrich
name: pattern-chart-grid
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

## Task: Create Chart Grid Pattern

Create the `chart-grid` pattern for dashboard chart layouts.

### Step 1: Study existing patterns

Read `content/core/patterns/hero.json` for schema reference.

### Step 2: Create `content/patterns/chart-grid.json`

The chart-grid renders a grid of chart cards for dashboards. Create with:

- **id**: `chart-grid`
- **name**: `Chart Grid`
- **description**: Grid of chart cards for dashboard data visualization
- **layout**: `grid`
- **presets**:
  - `dashboard` (default) — 2x2 grid of chart cards, each with a title, chart placeholder area, and legend
  - `wide` — Single row of charts, side-scrollable on mobile
  - `mixed` — Asymmetric layout: one large chart spanning 2 cols + two smaller charts
- **default_preset**: `dashboard`
- **components**: Card, CardHeader, CardBody (charts are abstract — generator emits placeholder div with className)
- **atoms**: `_grid _gc1 _lg:gc2 _gap4` for dashboard, `_flex _row _gap4 _overflow[auto]` for wide
- **code**: Template code with chart placeholder areas (div with min-height and data attributes for chart type: line, bar, pie, area)
- **io**: `{ "consumes": ["date-range", "filters"], "produces": [] }`

### Step 3: Add shadcn mapping in generator-react

Since shadcn doesn't have chart components, map to:
- Card wrapper using shadcn Card family
- Chart area as a `<div>` placeholder with a comment `{/* AUTO: Replace with Recharts/Chart.js component */}`
- Include a suggested Recharts import as a comment

### Step 4: Add Decantr mapping

Emit Decantr Card components with chart placeholder divs. Use appropriate grid atoms.

### Step 5: Write tests

- Pattern JSON validity
- All 3 presets defined
- Chart placeholder code is present
- Both generators produce output with Card wrappers and chart placeholders

### Acceptance Criteria
- [ ] `content/patterns/chart-grid.json` exists with valid schema
- [ ] `dashboard`, `wide`, and `mixed` presets defined
- [ ] Chart areas use placeholder divs (not hardcoded chart library imports)
- [ ] io.consumes includes date-range and filters
- [ ] shadcn mapping wraps charts in Card components
- [ ] Decantr emitter handles chart-grid atoms
- [ ] All tests pass
