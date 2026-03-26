---
type: enrich
name: e2e-react-saas
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

## Task: End-to-End Test — React SaaS Dashboard Generation

Load the saas-dashboard example essence, run the React generator pipeline, and verify the output is correct. Fix any issues found.

### Step 1: Read the example essence

Read `examples/saas-dashboard/` to find the essence file (likely `decantr.essence.json` or similar). Understand what pages, patterns, and features it declares.

### Step 2: Understand the pipeline

Read `packages/generator-core/src/pipeline.ts` (or similar entry point) to understand how to invoke the generation pipeline programmatically. Read `packages/generator-react/src/` to understand the React emitter entry point.

### Step 3: Create an e2e test

Create a test file (e.g., `packages/generator-react/test/e2e-saas-dashboard.test.ts` or in a top-level `test/` directory — follow existing conventions) that:

1. **Loads** the saas-dashboard essence JSON
2. **Validates** it against the essence spec
3. **Runs** the React generator pipeline (resolve patterns → build IR → emit React code)
4. **Captures** the generated output (as strings or virtual file system)
5. **Verifies**:
   - Output contains `App.tsx` with router setup
   - Output contains page files in `pages/` directory matching essence structure
   - Each page file has correct imports (React, shadcn components)
   - Sidebar-main shell is present (if essence uses that carafe)
   - Navigation items match essence structure pages
   - No placeholder/unresolved pattern references (no `TODO: resolve pattern`)
   - TypeScript imports are syntactically valid
   - Wired patterns on the same page share state (if applicable)

### Step 4: Run the test and fix issues

Run the test. It will likely fail because some patterns referenced in the essence don't exist in content/ yet. For each failure:
- If the issue is a missing pattern: create a minimal stub pattern JSON in content/patterns/ so the pipeline can resolve it
- If the issue is a generator bug: fix it in the generator code
- If the issue is a pipeline config problem: fix the config

Do NOT disable tests or skip assertions — fix the root cause.

### Step 5: Verify all tests pass

Run the full test suite to ensure no regressions.

### Acceptance Criteria
- [ ] E2e test file created for React saas-dashboard generation
- [ ] Test loads essence, runs pipeline, checks output
- [ ] Generated App.tsx has router and shell layout
- [ ] Generated pages match essence structure
- [ ] No unresolved pattern references in output
- [ ] Imports are syntactically valid
- [ ] Any missing patterns have stub JSON files
- [ ] Any generator bugs are fixed
- [ ] All tests pass (e2e + existing)
