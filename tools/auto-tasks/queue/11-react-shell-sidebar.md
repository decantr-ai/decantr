---
type: enrich
name: react-shell-sidebar
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

## Task: Enhance React Sidebar-Main Shell

Enhance the React generator's `emit-app.ts` to produce a proper sidebar-main layout using shadcn Sidebar components.

### Step 1: Read current state

Read `packages/generator-react/src/emit-app.ts` to understand the current App.tsx generation. Read `packages/generator-react/src/shadcn.ts` for the component map. Read `content/core/carafes.json` or `packages/registry/` for carafe definitions.

### Step 2: Enhance sidebar-main shell generation

When the essence uses `carafe: "sidebar-main"`, the generated App.tsx should include:

1. **SidebarProvider** wrapping the entire app
2. **Sidebar** component with:
   - `SidebarHeader` — App logo/name
   - `SidebarContent` — Navigation items using `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`
   - `SidebarFooter` — User menu (avatar + name + dropdown)
3. **SidebarTrigger** in the main content header for mobile toggle
4. **Main content area** with:
   - Header bar with breadcrumb, command palette trigger (Cmd+K), notification bell, user dropdown
   - Page content area where routed pages render

5. **Keyboard shortcut**: `Ctrl+\` toggles the sidebar. Add a `useEffect` that listens for this keydown event.

6. **Collapsible behavior**: Sidebar should use `collapsible="icon"` variant so it can collapse to icon-only mode.

### Step 3: Update COMPONENT_MAP in shadcn.ts

Ensure these shadcn components are in the map:
- `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarHeader`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarProvider`, `SidebarTrigger`
- `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator`
- `Command` (for Cmd+K palette)
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`
- `Avatar`, `AvatarImage`, `AvatarFallback`

### Step 4: Write tests

- When carafe is "sidebar-main", generated App.tsx contains SidebarProvider
- Sidebar has SidebarHeader, SidebarContent, SidebarFooter
- SidebarTrigger is present in main content header
- Keyboard shortcut code for Ctrl+\ is present
- Navigation items are generated from essence structure pages
- All shadcn imports are correct

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
- [ ] `emit-app.ts` generates proper sidebar-main layout with shadcn Sidebar
- [ ] Sidebar has header, content (nav items), and footer sections
- [ ] SidebarTrigger present for mobile/collapse toggle
- [ ] Ctrl+\ keyboard shortcut handler generated
- [ ] Navigation items derived from essence structure
- [ ] All shadcn component imports are in COMPONENT_MAP
- [ ] All tests pass
