---
type: enrich
name: shadcn-component-audit
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

## Task: Audit and Complete shadcn/ui Component Map

Audit the COMPONENT_MAP in the React generator and add all missing shadcn/ui component mappings.

### Step 1: Read current state

Read `packages/generator-react/src/shadcn.ts` thoroughly. Document every component currently in COMPONENT_MAP and its mapping structure (import path, component name, sub-components, prop translations).

### Step 2: Add all missing shadcn/ui components

The full list of shadcn/ui components that should be mapped (add any that are missing):

- **Accordion** — Accordion, AccordionItem, AccordionTrigger, AccordionContent. Import from `@/components/ui/accordion`.
- **Alert** — Alert, AlertTitle, AlertDescription. Import from `@/components/ui/alert`.
- **AlertDialog** — AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel. Import from `@/components/ui/alert-dialog`.
- **Avatar** — Avatar, AvatarImage, AvatarFallback. Import from `@/components/ui/avatar`.
- **Badge** — Badge. Import from `@/components/ui/badge`. Variants: default, secondary, destructive, outline.
- **Breadcrumb** — Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage. Import from `@/components/ui/breadcrumb`.
- **Calendar** — Calendar. Import from `@/components/ui/calendar`.
- **Card** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter. Import from `@/components/ui/card`.
- **Checkbox** — Checkbox. Import from `@/components/ui/checkbox`.
- **Collapsible** — Collapsible, CollapsibleTrigger, CollapsibleContent. Import from `@/components/ui/collapsible`.
- **Command** — Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator. Import from `@/components/ui/command`.
- **ContextMenu** — ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, etc. Import from `@/components/ui/context-menu`.
- **Dialog** — Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription. Import from `@/components/ui/dialog`.
- **Drawer** — Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription. Import from `@/components/ui/drawer`.
- **DropdownMenu** — DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup. Import from `@/components/ui/dropdown-menu`.
- **HoverCard** — HoverCard, HoverCardTrigger, HoverCardContent. Import from `@/components/ui/hover-card`.
- **Input** — Input. Import from `@/components/ui/input`.
- **Label** — Label. Import from `@/components/ui/label`.
- **Menubar** — Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator. Import from `@/components/ui/menubar`.
- **NavigationMenu** — NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent. Import from `@/components/ui/navigation-menu`.
- **Popover** — Popover, PopoverTrigger, PopoverContent. Import from `@/components/ui/popover`.
- **Progress** — Progress. Import from `@/components/ui/progress`.
- **RadioGroup** — RadioGroup, RadioGroupItem. Import from `@/components/ui/radio-group`.
- **ScrollArea** — ScrollArea, ScrollBar. Import from `@/components/ui/scroll-area`.
- **Select** — Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup. Import from `@/components/ui/select`.
- **Separator** — Separator. Import from `@/components/ui/separator`.
- **Sheet** — Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription. Import from `@/components/ui/sheet`.
- **Skeleton** — Skeleton. Import from `@/components/ui/skeleton`.
- **Slider** — Slider. Import from `@/components/ui/slider`.
- **Switch** — Switch. Import from `@/components/ui/switch`.
- **Table** — Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption. Import from `@/components/ui/table`.
- **Tabs** — Tabs, TabsList, TabsTrigger, TabsContent. Import from `@/components/ui/tabs`.
- **Textarea** — Textarea. Import from `@/components/ui/textarea`.
- **Toast** — Toast, ToastAction (plus Toaster, useToast). Import from `@/components/ui/toast` and `@/components/ui/toaster`.
- **Toggle** — Toggle. Import from `@/components/ui/toggle`.
- **Tooltip** — Tooltip, TooltipTrigger, TooltipContent, TooltipProvider. Import from `@/components/ui/tooltip`.

For each component, the mapping entry should include:
- `importPath` — The shadcn import path
- `components` — Array of exported component names
- `propMap` — Any prop name translations from abstract IR props to shadcn props (if applicable)

### Step 3: Organize and deduplicate

Ensure no duplicate entries. Sort alphabetically. Add comments grouping by category (layout, form, overlay, data display, navigation, feedback).

### Step 4: Write tests

Create a test that:
- Verifies every component in the list above is present in COMPONENT_MAP
- Each entry has a valid importPath starting with `@/components/ui/`
- Each entry has at least one component name
- No duplicate component names across entries
- Import paths follow shadcn conventions

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
- [ ] All 30+ shadcn/ui components mapped in COMPONENT_MAP
- [ ] Each mapping has importPath, components list
- [ ] No duplicates
- [ ] Organized with category comments
- [ ] Test verifying completeness
- [ ] All existing tests still pass
