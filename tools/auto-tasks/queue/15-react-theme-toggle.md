---
type: enrich
name: react-theme-toggle
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

## Task: Add Dark/Light Mode Toggle to React Generator

Generate a ThemeProvider and toggle component for dark/light mode switching.

### Step 1: Read current state

Read `packages/generator-react/src/emit-app.ts` and check how the essence `vintage.mode` field is handled. Read the essence-spec for vintage schema.

### Step 2: Implement theme generation

Generate these files:

1. **`src/components/ThemeProvider.tsx`** — Context provider that:
   - Manages theme state: `"light"`, `"dark"`, or `"system"`
   - Reads initial theme from: essence vintage.mode → localStorage → system preference (in that priority)
   - Applies theme by setting `class="dark"` on `<html>` element (Tailwind dark mode convention)
   - Persists choice to localStorage under key `"decantr-theme"`
   - Listens to `prefers-color-scheme` media query when mode is `"system"`
   - Exposes `useTheme()` hook: `{ theme, setTheme, resolvedTheme }`

2. **`src/components/ThemeToggle.tsx`** — Toggle button that:
   - Uses shadcn `Button` (variant: `ghost`, size: `icon`)
   - Uses shadcn `DropdownMenu` with three options: Light, Dark, System
   - Shows Sun icon for light, Moon icon for dark, Monitor icon for system (lucide-react)
   - Calls `setTheme()` from useTheme hook

3. **Update App.tsx** — Wrap app in `ThemeProvider`

4. **Update shell generation** — Add ThemeToggle to the shell header (both sidebar-main and top-nav-main shells)

5. **When vintage.mode is fixed** (not "auto") — Still generate ThemeProvider but don't include the toggle button in the shell. The theme is locked.

### Step 3: Write tests

- ThemeProvider.tsx generated with useTheme hook
- ThemeToggle.tsx generated with Button + DropdownMenu
- App.tsx wraps in ThemeProvider
- Shell header includes ThemeToggle
- When mode is fixed, ThemeToggle not added to shell
- Theme persistence uses localStorage

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
- [ ] ThemeProvider.tsx with light/dark/system support
- [ ] ThemeToggle.tsx with shadcn Button + DropdownMenu
- [ ] App.tsx wrapped in ThemeProvider
- [ ] Toggle added to shell header
- [ ] Fixed mode skips toggle inclusion
- [ ] localStorage persistence
- [ ] prefers-color-scheme listener for system mode
- [ ] All tests pass
