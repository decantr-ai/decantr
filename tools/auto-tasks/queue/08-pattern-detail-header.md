---
type: enrich
name: pattern-detail-header
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

## Task: Create Detail Header Pattern

Create the `detail-header` pattern with 2 presets and add mappings to both generators.

### Step 1: Study existing patterns

Read `content/core/patterns/hero.json` for schema reference.

### Step 2: Create `content/patterns/detail-header.json`

The detail-header sits at the top of detail/profile pages. Create with:

- **id**: `detail-header`
- **name**: `Detail Header`
- **description**: Page header for detail views with title, metadata, status, and action buttons
- **layout**: `row` (standalone, no card wrapping)
- **contained**: `false`
- **presets**:
  - `standard` (default) — Title, subtitle/description, status badge, breadcrumb, and action buttons (edit, delete, share). Horizontal layout.
  - `profile` — Large avatar on the left, name/title/bio on the right, stats row (followers, posts, etc.), action buttons (follow, message).
- **default_preset**: `standard`
- **components**: Avatar, Badge, Button, Breadcrumb
- **atoms**: `_flex _col _gap4 _pb4 _bbsolid _bcborder` for standard (with bottom border), `_flex _row _gap6 _items[start]` for profile
- **code**: Template code for both presets
- **io**: `{ "consumes": ["data"], "produces": ["actions"], "actions": ["edit", "delete", "share"] }`

### Step 3: Add shadcn mapping in generator-react

Map to:
- `Avatar`, `AvatarImage`, `AvatarFallback` for profile preset
- `Badge` for status indicators
- `Button` for action buttons
- `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink` for navigation
- `Separator` for visual divider
- `DropdownMenu` for overflow actions

### Step 4: Add Decantr mapping

Emit Decantr components with flex row/col layout atoms, avatar references, badge/button components.

### Step 5: Write tests

- Both presets defined
- contained is false (no card wrapping)
- React generator emits Avatar for profile preset
- Decantr generator emits correct layout atoms

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
- [ ] `content/patterns/detail-header.json` exists with valid schema
- [ ] `standard` and `profile` presets defined
- [ ] `contained: false` set
- [ ] shadcn mapping includes Avatar, Badge, Button, Breadcrumb
- [ ] Decantr emitter handles detail-header layout
- [ ] All tests pass
