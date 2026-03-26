---
type: enrich
name: pattern-form-sections
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

## Task: Create Form Sections Pattern

Create the `form-sections` pattern with 3 presets and add mappings to both generators.

### Step 1: Study existing patterns

Read `content/core/patterns/hero.json` for schema reference.

### Step 2: Create `content/patterns/form-sections.json`

The form-sections pattern renders grouped form fields in card sections. Create with:

- **id**: `form-sections`
- **name**: `Form Sections`
- **description**: Grouped form fields organized in labeled sections with validation
- **layout**: `contained`
- **presets** (3 required):
  - `settings` (default) — Vertical stack of sections, each with a title/description on the left and form fields on the right (2-column layout per section). Save button at bottom.
  - `creation` — Single-column wizard-like form with sections as steps. Progress indicator at top, prev/next buttons.
  - `structured` — Dense form with fieldsets, collapsible sections, and inline validation. Good for complex data entry.
- **default_preset**: `settings`
- **components**: Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup
- **atoms**: `_flex _col _gap6` for section stack, `_grid _gc1 _lg:gc2 _gap4` for settings 2-col layout
- **code**: Template code for each preset
- **io**: `{ "consumes": ["data"], "produces": ["form-data"], "actions": ["save", "cancel", "reset"] }`

### Step 3: Add shadcn mapping in generator-react

Map to shadcn form components:
- `Input`, `Label`, `Textarea` for text fields
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` for dropdowns
- `Switch` for toggles
- `Checkbox` for checkboxes
- `RadioGroup`, `RadioGroupItem` for radio buttons
- `Button` for actions
- `Card`, `CardHeader`, `CardContent` for section wrappers
- `Separator` between sections

### Step 4: Add Decantr mapping

Emit Decantr components with appropriate form layout atoms. Settings preset uses 2-column grid within each Card section.

### Step 5: Write tests

- All 3 presets defined
- Each preset has appropriate form components
- io actions include save, cancel, reset
- Both generators produce form layouts

### Acceptance Criteria
- [ ] `content/patterns/form-sections.json` exists with valid schema
- [ ] `settings`, `creation`, and `structured` presets defined
- [ ] Components include Input, Select, Switch, Button, Label
- [ ] io.actions includes save, cancel, reset
- [ ] shadcn mapping covers all form components
- [ ] Decantr emitter handles form section layout
- [ ] All tests pass
