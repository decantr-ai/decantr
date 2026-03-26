---
type: enrich
name: pattern-activity-feed
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

## Task: Create Activity Feed Pattern

Create the `activity-feed` pattern and add mappings to both generators.

### Step 1: Study existing patterns and wiring

Read `content/core/patterns/hero.json` for schema. Read `packages/registry/src/wiring.ts` — activity-feed consumes search from filter-bar.

### Step 2: Create `content/patterns/activity-feed.json`

The activity-feed shows a chronological list of events/activities. Create with:

- **id**: `activity-feed`
- **name**: `Activity Feed`
- **description**: Chronological list of activity events with avatars, timestamps, and action descriptions
- **layout**: `contained`
- **presets**:
  - `standard` (default) — Vertical timeline with avatar, user name, action text, timestamp. Grouped by date.
  - `compact` — Dense list without avatars, just icon + text + relative time
  - `detailed` — Each activity is a mini-card with full context, attachments, and reply option
- **default_preset**: `standard`
- **components**: Avatar, Badge, Button (load more)
- **atoms**: `_flex _col _gap2` for feed items, `_flex _row _gap3 _items[start]` for each item
- **code**: Template code for each preset
- **io**: `{ "consumes": ["search", "view", "filters"], "produces": [], "actions": ["load-more", "mark-read"] }`

### Step 3: Add shadcn mapping in generator-react

Map to:
- `Avatar`, `AvatarImage`, `AvatarFallback` for user avatars
- `Badge` for activity type labels
- `Button` for load-more and actions
- `Separator` between date groups
- `ScrollArea` for scrollable feed container

### Step 4: Add Decantr mapping

Emit Decantr components with flex column layout, avatar references, and proper spacing atoms.

### Step 5: Verify wiring

Check that `packages/registry/src/wiring.ts` has a rule for filter-bar + activity-feed producing shared search signal. If missing, add it.

### Step 6: Write tests

- Pattern JSON validity with all 3 presets
- io.consumes includes search and view
- React generator emits Avatar + Badge
- Decantr generator emits feed items
- Wiring rule exists for filter-bar + activity-feed

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
- [ ] `content/patterns/activity-feed.json` exists with valid schema
- [ ] `standard`, `compact`, and `detailed` presets defined
- [ ] io.consumes includes search and view
- [ ] shadcn mapping uses Avatar, Badge, ScrollArea
- [ ] Decantr emitter handles feed layout atoms
- [ ] Wiring rule for filter-bar + activity-feed exists
- [ ] All tests pass
