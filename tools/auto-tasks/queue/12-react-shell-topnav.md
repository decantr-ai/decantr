---
type: enrich
name: react-shell-topnav
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

## Task: Add Top-Nav-Main Shell to React Emitter

Add the `top-nav-main` carafe layout to the React generator.

### Step 1: Read current state

Read `packages/generator-react/src/emit-app.ts` to see how the sidebar-main carafe is handled. Read `packages/generator-react/src/shadcn.ts` for component mappings. Check carafe definitions in `content/` or `packages/registry/`.

### Step 2: Implement top-nav-main layout

When essence uses `carafe: "top-nav-main"`, generate App.tsx with:

1. **Header/Navbar** — Fixed top bar containing:
   - Logo/app name on the left
   - Horizontal navigation links (from essence structure pages) using shadcn `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuLink`
   - Right side: search trigger, notification bell (Popover), user menu (DropdownMenu with Avatar)

2. **Mobile responsive** — Below `md` breakpoint:
   - Navigation links collapse into a hamburger menu
   - Use shadcn `Sheet` for mobile nav drawer (slides in from left)
   - Sheet contains vertical navigation links + user info

3. **Main content area** — Below the fixed header, with appropriate top padding to account for fixed header height

4. **Styling** — Header uses `border-b` bottom border, `bg-background` background, `sticky top-0 z-50`

### Step 3: Update COMPONENT_MAP

Ensure these are mapped:
- `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuLink`
- `Sheet`, `SheetTrigger`, `SheetContent`
- Menu icon (from lucide-react)

### Step 4: Write tests

- When carafe is "top-nav-main", generated App.tsx contains NavigationMenu
- Header is sticky with correct classes
- Mobile Sheet menu is generated
- Navigation items derived from essence structure
- No sidebar components present

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
- [ ] `emit-app.ts` handles `top-nav-main` carafe
- [ ] Horizontal nav bar with NavigationMenu components
- [ ] Mobile hamburger menu using Sheet
- [ ] Header is sticky/fixed
- [ ] Navigation items from essence structure
- [ ] COMPONENT_MAP updated with NavigationMenu and Sheet
- [ ] All tests pass
