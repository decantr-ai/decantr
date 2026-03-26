---
type: enrich
name: decantr-responsive-grid
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

## Task: Enhance Decantr Responsive Grid Emission

Improve the Decantr generator's handling of responsive grid layouts and breakpoint atoms.

### Step 1: Read current state

Read `packages/generator-decantr/src/atoms.ts` for current atom handling. Read `packages/generator-decantr/src/emit-page.ts` for grid emission. Read `packages/generator-core/src/` for IR grid types.

### Step 2: Enhance responsive grid emission

Improve the Decantr emitter's grid handling:

1. **Proper breakpoint cascading** — When a blend specifies `{ "cols": ["a", "b"], "at": "lg" }`:
   - Mobile (default): `_gc1` (single column, stacked)
   - At breakpoint: `_{at}:gc{N}` (e.g., `_lg:gc2`)
   - Emit: `_grid _gc1 _lg:gc2 _gap4`

2. **Weighted columns** — When blend has `{ "cols": ["a", "b"], "span": { "a": 3 }, "at": "md" }`:
   - Total columns = sum of spans (3 + 1 = 4)
   - Emit: `_grid _gc1 _md:gc4` on wrapper
   - Pattern "a" gets: `_md:span3`
   - Pattern "b" gets: `_md:span1`

3. **Multi-breakpoint grids** — Support patterns that change column count at multiple breakpoints:
   - `_grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4`
   - This is common for card-grid presets

4. **Container queries** — For patterns that need component-level responsive behavior, emit container query atoms:
   - Wrapper: `_container` (sets container-type: inline-size)
   - Children: `_@sm:gc2 _@lg:gc3` (container query breakpoints)
   - Only use when pattern JSON specifies `responsive: "container"`

5. **Gap scaling with density** — Read the essence's clarity.content_gap and apply:
   - `compact` density → `_gap2`
   - `comfortable` density → `_gap4`
   - `spacious` density → `_gap6`
   - Recipe `spatial_hints.content_gap_shift` can modify this (+1/-1)

### Step 3: Update atoms.ts

Ensure the atom mapping functions handle:
- All breakpoint prefixes: `_sm:`, `_md:`, `_lg:`, `_xl:`, `_2xl:`
- All grid column values: `gc1` through `gc12`
- Span values: `span1` through `span12`
- Container query prefixes: `_@sm:`, `_@md:`, `_@lg:`

### Step 4: Write tests

- Single breakpoint grid emits correct atoms
- Weighted columns emit correct span atoms
- Multi-breakpoint grid emits cascading atoms
- Container query atoms emitted when responsive: "container"
- Gap scaling matches density
- Content gap shift adjusts gap correctly

### Acceptance Criteria
- [ ] Breakpoint cascading works correctly (_gc1 → _lg:gc2)
- [ ] Weighted columns emit correct _span atoms
- [ ] Multi-breakpoint grids supported
- [ ] Container query atoms supported
- [ ] Gap scales with clarity density
- [ ] atoms.ts handles all breakpoint prefixes and grid values
- [ ] All tests pass
