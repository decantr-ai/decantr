---
type: enrich
name: pattern-card-grid
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

## Task: Create Card Grid Pattern

Create the `card-grid` pattern with all 4 presets and add mappings to both generators.

### Step 1: Study existing patterns

Read `content/core/patterns/hero.json` for schema reference.

### Step 2: Create `content/patterns/card-grid.json`

The card-grid renders a responsive grid of cards. This is one of the most commonly used patterns. Create with:

- **id**: `card-grid`
- **name**: `Card Grid`
- **description**: Responsive grid of cards with preset-specific content layouts
- **layout**: `grid`
- **presets** (4 required):
  - `product` — Product cards with image, title, price, rating, add-to-cart button. Grid: 1/2/3/4 cols at sm/md/lg/xl.
  - `content` — Content/blog cards with thumbnail, title, excerpt, author, date. Grid: 1/2/3 cols.
  - `collection` — Collection/category cards with background image, overlay title, item count. Grid: 2/3 cols.
  - `icon` — Small icon cards with icon, title, short description. Grid: 2/3/4 cols. Compact.
- **default_preset**: `product`
- **components**: Card, CardHeader, CardBody, CardFooter, Image (abstract), Button, Badge
- **atoms**: Responsive grid atoms per preset
- **code**: Template code for each preset
- **io**: `{ "consumes": ["search", "filters", "data"], "produces": ["selection"], "actions": ["load-more"] }`

### Step 3: Add shadcn mapping in generator-react

Map each preset to appropriate shadcn components:
- `product`: Card + CardHeader + CardContent + CardFooter, Button, Badge
- `content`: Card + CardHeader + CardContent, Avatar (author)
- `collection`: Card with aspect-ratio image overlay
- `icon`: Card (compact) with icon slot

### Step 4: Add Decantr mapping

Emit responsive grid with breakpoint atoms: `_grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4` (varying by preset).

### Step 5: Write tests

- All 4 presets defined and valid
- Each preset has distinct component lists
- io declarations correct
- Both generators produce appropriate output

### Acceptance Criteria
- [ ] `content/patterns/card-grid.json` exists with valid schema
- [ ] All 4 presets: product, content, collection, icon
- [ ] Each preset has appropriate components and grid layout
- [ ] io.consumes includes search and filters
- [ ] shadcn mappings for all 4 presets
- [ ] Decantr emitter handles responsive grid atoms per preset
- [ ] All tests pass
