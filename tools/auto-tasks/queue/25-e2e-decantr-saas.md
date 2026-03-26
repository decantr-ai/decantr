---
type: enrich
name: e2e-decantr-saas
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

## Task: End-to-End Test — Decantr-Native SaaS Dashboard Generation

Load the saas-dashboard example essence, run the Decantr-native generator pipeline, and verify the output.

### Step 1: Read the example essence

Read `examples/saas-dashboard/` to find the essence file. Understand what pages, patterns, and features it declares.

### Step 2: Understand the pipeline

Read `packages/generator-core/src/pipeline.ts` and `packages/generator-decantr/src/` to understand the Decantr emitter entry point.

### Step 3: Create an e2e test

Create a test file (follow existing conventions for test location) that:

1. **Loads** the saas-dashboard essence JSON
2. **Validates** it against the essence spec
3. **Runs** the Decantr-native generator pipeline
4. **Captures** the generated output
5. **Verifies**:
   - Output contains `app.js` (Decantr entry point) with router and Shell setup
   - Output contains page files in `pages/` matching essence structure
   - Each page uses correct Decantr imports: `{ h, text, cond, list }` from `decantr/core`, `{ createSignal, createEffect }` from `decantr/state`
   - Decantr atom classes are valid (no Tailwind classes leaked in)
   - Shell component is used with correct carafe type
   - Patterns use correct Decantr component imports (Card, Button, etc. from `decantr/components`)
   - Signal wiring between patterns on same page (filter-bar + data-table share signals)
   - Page containers have `d-page-enter` class

### Step 4: Run the test and fix issues

For each failure:
- Missing patterns: create minimal stub JSON
- Generator bugs: fix in generator-decantr
- Pipeline issues: fix config

Fix root causes, don't disable assertions.

### Step 5: Verify all tests pass

### Acceptance Criteria
- [ ] E2e test file created for Decantr-native saas-dashboard generation
- [ ] Test loads essence, runs pipeline, checks output
- [ ] Generated app.js has router and Shell
- [ ] Generated pages match essence structure
- [ ] Decantr imports are correct (not React imports)
- [ ] Atom classes are valid Decantr atoms (not Tailwind)
- [ ] Signal wiring present for related patterns
- [ ] d-page-enter class on page containers
- [ ] Any bugs fixed
- [ ] All tests pass
