---
type: enrich
name: react-wiring-rich
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

## Task: Enhance React Wiring with Custom Hooks and TypeScript Interfaces

### Step 1: Read current state

Read `packages/registry/src/wiring.ts` to understand WIRING_RULES. Read `packages/generator-react/src/emit-page.ts` to see how cross-pattern wiring currently works in React output. Read `packages/generator-core/` for IR wiring types.

### Step 2: Implement rich wiring

When the generator detects wired patterns on the same page (e.g., filter-bar + data-table), instead of generating raw `useState` calls, generate:

1. **TypeScript interfaces for page state** — Per page, generate an interface:
   ```tsx
   interface OverviewPageState {
     search: string;
     filters: Record<string, string>;
     status: 'idle' | 'loading' | 'error';
     selection: string[];
   }
   ```

2. **Custom hooks per signal type** — Generate hooks in `src/hooks/`:
   - `usePageSearch.ts` — `{ search, setSearch, debouncedSearch, clearSearch }` with 300ms debounce
   - `usePageFilters.ts` — `{ filters, setFilter, removeFilter, clearFilters, activeFilterCount }`
   - `usePageSelection.ts` — `{ selected, select, deselect, toggleSelect, selectAll, clearSelection, isSelected }`
   - `usePageSort.ts` — `{ sortColumn, sortDirection, setSort, toggleSort }`

3. **Page-level composition** — The page component composes these hooks:
   ```tsx
   function OverviewPage() {
     const search = usePageSearch();
     const filters = usePageFilters();
     return (
       <>
         <FilterBar search={search} filters={filters} />
         <DataTable search={search} filters={filters} />
       </>
     );
   }
   ```

4. **Pattern prop types** — Each pattern component gets typed props:
   ```tsx
   interface FilterBarProps {
     search?: ReturnType<typeof usePageSearch>;
     filters?: ReturnType<typeof usePageFilters>;
   }
   ```

### Step 3: Only generate hooks that are needed

Analyze the wiring rules for each page. Only generate the hooks that are actually used by the patterns on that page. Don't generate usePageSelection if no pattern on the page produces/consumes selection.

### Step 4: Write tests

- When filter-bar + data-table are on same page, custom hooks generated
- usePageSearch has debounce logic
- usePageFilters has add/remove/clear
- Page component uses hooks and passes to patterns
- Standalone patterns (no wiring) still use internal state
- TypeScript interfaces generated for page state

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
- [ ] Custom hooks generated in src/hooks/ for wired signals
- [ ] usePageSearch includes debounce
- [ ] usePageFilters includes add/remove/clear operations
- [ ] Page components compose hooks and pass to patterns
- [ ] Pattern components have typed props
- [ ] Only needed hooks are generated per page
- [ ] Standalone patterns work without hooks
- [ ] All tests pass
