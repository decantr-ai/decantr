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

### Acceptance Criteria
- [ ] `emit-app.ts` handles `top-nav-main` carafe
- [ ] Horizontal nav bar with NavigationMenu components
- [ ] Mobile hamburger menu using Sheet
- [ ] Header is sticky/fixed
- [ ] Navigation items from essence structure
- [ ] COMPONENT_MAP updated with NavigationMenu and Sheet
- [ ] All tests pass
