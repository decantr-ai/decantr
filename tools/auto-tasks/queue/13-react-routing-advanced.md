---
type: enrich
name: react-routing-advanced
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

## Task: Enhance React Routing with Lazy Loading and Error Handling

### Step 1: Read current state

Read `packages/generator-react/src/emit-app.ts` to see how routing is currently generated. Check if react-router-dom is used and how page imports are structured.

### Step 2: Implement lazy loading

Modify the React emitter to generate:

1. **Lazy page imports** — Instead of static imports, use `React.lazy()`:
   ```tsx
   const OverviewPage = React.lazy(() => import('./pages/OverviewPage'));
   const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
   ```

2. **Suspense wrapper** — Wrap the Routes in a Suspense component with a loading fallback:
   ```tsx
   <Suspense fallback={<LoadingSpinner />}>
     <Routes>...</Routes>
   </Suspense>
   ```

3. **LoadingSpinner component** — Generate a simple loading spinner component (or use shadcn Skeleton):
   - Centered in the content area
   - Uses Tailwind `animate-spin` or shadcn Skeleton

4. **404 catch-all route** — Add a catch-all route at the end:
   ```tsx
   <Route path="*" element={<NotFoundPage />} />
   ```

5. **NotFoundPage** — Generate a simple 404 page with:
   - "Page not found" heading
   - "Go back home" link
   - Centered layout

6. **Default redirect** — First page in essence structure is the default route. Add a redirect from `/` to the first page's path.

### Step 3: Update emit-page.ts if needed

Ensure each page file uses `export default` so React.lazy can import it.

### Step 4: Write tests

- Generated App.tsx uses React.lazy for page imports
- Suspense wrapper is present with fallback
- 404 catch-all route exists
- NotFoundPage component is generated
- Default redirect to first page
- All page files export default

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
- [ ] Page imports use React.lazy()
- [ ] Routes wrapped in Suspense with loading fallback
- [ ] LoadingSpinner or Skeleton fallback generated
- [ ] 404 catch-all Route with NotFoundPage
- [ ] Default redirect from / to first page
- [ ] All page files use export default
- [ ] All tests pass
