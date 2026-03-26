---
type: enrich
name: react-auth-integration
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

## Task: Add Auth Integration to React Generator

When the essence includes `"auth"` in tannins (or features), generate authentication scaffolding.

### Step 1: Read current state

Read `packages/generator-react/src/emit-app.ts` and any existing tannin/feature handling. Read `packages/essence-spec/` to understand how tannins are defined in the essence schema.

### Step 2: Implement auth generation

When `tannins` includes `"auth"`, the React generator should produce these additional files:

1. **`src/contexts/AuthContext.tsx`** — React context with:
   - `AuthProvider` component wrapping children
   - `useAuth()` hook returning `{ user, isAuthenticated, login, logout, isLoading }`
   - State management with useState/useReducer
   - Mock auth functions (with TODO comments to replace with real auth)
   - Persist auth state to localStorage

2. **`src/pages/LoginPage.tsx`** — Login page with:
   - Email + password form using shadcn Input, Label, Button, Card
   - Form validation
   - Error display
   - "Remember me" checkbox
   - Call `login()` from AuthContext on submit
   - Redirect to home after successful login

3. **`src/components/ProtectedRoute.tsx`** — Route wrapper that:
   - Checks `isAuthenticated` from useAuth
   - If not authenticated, redirects to `/login`
   - If loading, shows spinner
   - If authenticated, renders children

4. **Update App.tsx generation** — When auth is present:
   - Wrap app in `AuthProvider`
   - Add `/login` route pointing to LoginPage
   - Wrap all other routes in `ProtectedRoute`
   - Login page is NOT wrapped in ProtectedRoute
   - Login page does NOT have the shell layout (no sidebar/nav)

### Step 3: Write tests

- When tannins includes "auth", AuthContext.tsx is generated
- LoginPage.tsx is generated with form
- ProtectedRoute.tsx is generated
- App.tsx wraps in AuthProvider
- Login route exists and is not protected
- Other routes are wrapped in ProtectedRoute
- When tannins does NOT include "auth", none of these files are generated

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
- [ ] AuthContext.tsx generated with AuthProvider and useAuth hook
- [ ] LoginPage.tsx generated with shadcn form components
- [ ] ProtectedRoute.tsx generated with redirect logic
- [ ] App.tsx includes AuthProvider wrapper when auth enabled
- [ ] Login page excluded from shell layout and ProtectedRoute
- [ ] Auth files NOT generated when auth not in tannins
- [ ] All tests pass
