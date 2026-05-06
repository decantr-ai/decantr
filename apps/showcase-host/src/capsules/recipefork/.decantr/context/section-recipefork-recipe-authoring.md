# Section: recipefork-recipe-authoring

**Role:** auxiliary | **Shell:** recipefork-top-nav | **Archetype:** recipefork-recipe-authoring
**Description:** Dual-mode recipe authoring workspace for Recipefork with Simple Mode and Chef Mode editing, drafts, hydrated editing, a shared structured ingredient editor, safe simple-to-chef conversion, hierarchical instruction groups, optional plating presentation, inline cookbook assignment, cooking tips, and rich recipe stories.

## Quick Start

**Shell:** Shared Recipefork application shell with sticky top nav, compact utility actions, and a wide scrollable content region below. Mirrors the current app's persistent nav model across public and authenticated product routes. (header: 64px)
**Pages:** 2 (create, edit)
**Key patterns:** recipefork-recipe-mode-switch [moderate], recipefork-recipe-metadata-form [complex], recipefork-cookbook-assignment [moderate], recipefork-simple-recipe-editor [moderate], recipefork-chef-ingredients-editor [moderate], recipefork-chef-instruction-editor [moderate], recipefork-presentation-editor [moderate], recipefork-cooking-tips-editor [moderate], recipefork-recipe-story-editor [moderate], detail-header [moderate]
**Density:** comfortable
**Voice:** Encouraging, practical, and food-aware without becoming gimmicky.

## Shell Implementation (recipefork-top-nav)

### root

- **display:** flex
- **direction:** column
- **min_height:** 100vh
- **atoms:** _flex _col _minh[100vh]

### header

- **height:** 64px
- **display:** flex
- **align:** center
- **justify:** space-between
- **padding:** 0 1rem
- **border:** bottom
- **sticky:** true
- **z_index:** 20
- **background:** recipefork-nav
- **left_content:** Brand icon + Recipefork wordmark
- **center_content:** Home, Chat, Generate, Feed, Cookbooks navigation links
- **right_content:** Create Recipe CTA + theme toggle + notification bell + profile button or sign-in button + mobile menu trigger
- **button_sizing:** Use compact controls. Create CTA should feel prominent but still fit inside the 64px row without oversized padding.

### body

- **flex:** 1
- **overflow_y:** auto
- **padding:** 0
- **atoms:** _flex1 _overflow[auto]
- **note:** Individual pages own their spacing. Preserve the wide, app-like content region used by feed, recipe detail, profile, and authoring pages.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: comfortable (--d-density-scale: 1)

## Shell Notes (recipefork-top-nav)

- **Nav Identity:** Brand mark on the left, route links in the center-left, create CTA plus utility actions on the right. Keep the overall feel product-like rather than marketing-heavy.
- **Mobile Menu:** Collapse route links into a dropdown or menu button below md breakpoint. The create action may stay visible as an icon button or move into the menu when width is constrained.
- **Auth Variation:** Unauthenticated states may still reuse the same shell. Swap the profile entry for a sign-in button while keeping spacing and alignment stable.
- **Notification Behavior:** Authenticated states include a bell menu in the utility cluster. The bell should expose unread count, recent follow/comment/reaction/save/fork activity, and quick mark-as-read behavior without forcing a dedicated page route.

## Theme Reference

**Theme:** recipefork (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 6 `recipefork-*` classes — full Class/Intent/Apply-to table in `section-recipefork-recipe-authoring-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** detail-header
**Spatial hints:** Density bias: none. Section padding: 4rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface recipefork-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — recipefork-top-nav shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

simple-mode, chef-mode, drafts, image-upload, hydrated-editing, structured-ingredients, hierarchical-instructions, presentation, cooking-tips, mode-conversion, rich-story, autosave, cookbook-assignment

---

## Visual Direction

**Personality:** Recipefork is a neutral, production-grade recipe product that lets food photography and authoring depth carry the experience. Public browsing feels clean and modern; Chef Mode is the critical differentiator, with structured ingredients, nested instruction groups, optional plating presentation, dynamic cooking tips, explicit recipe visibility controls, draft workflows, and no-loss hydrated editing.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### recipefork-recipe-mode-switch

Two-mode authoring switch for choosing between Simple Mode and Chef Mode before starting or editing a recipe. Designed for Recipefork's dual authoring workflow.

**Visual brief:** A card-contained two-mode switch where each option behaves like a tab tile rather than a plain text tab. Simple Mode uses a gentle utility sparkle icon with copy about fast creation. Chef Mode uses a chef-hat icon plus an 'Advanced' badge and copy about measurements, hierarchy, and deep editing. Active mode feels like a selected product tile.

**Components:** Tabs, Badge, Button, icon

**Composition:**
```
RecipeModeSwitch = Container(d-card, flex-col) > [Tabs(d-control) > [SimpleModeTile + ChefModeTile] + SelectedModeContent]
```

**Layout slots:**
- `tabs`: Two-column tab list
- `simple-tile`: Simple Mode summary tile
- `chef-tile`: Chef Mode summary tile
- `content`: Selected mode content below
**Responsive:**
- **Mobile (<640px):** Tiles stack comfortably inside a two-column tab rail with enough vertical padding to keep the mode distinction obvious.
- **Tablet (640-1024px):** Equal-width mode tiles with generous description text.
- **Desktop (>1024px):** Wide card surface with supporting mode detail visible at a glance before the authoring form begins.


### recipefork-recipe-metadata-form

Shared Recipefork authoring scaffold for hero image, title, description, servings, difficulty, timing, tags, and draft-versus-publish controls across Simple Mode and Chef Mode.

**Visual brief:** A clean product authoring header built from stacked cards rather than a giant wizard. The hero image sits first, followed by clear metadata rows and compact action controls that make draft-versus-publish state obvious without overpowering the editor.

**Components:** Button, Input, Textarea, Select, Badge, Card, Label, icon

**Composition:**
```
RecipeMetadataForm = Stack(recipefork-editor-stack) > [HeroUpload + Identity + CoreMetadata + Tags + Actions]
```

**Layout slots:**
- `hero-upload`: Large image picker with current preview and replacement affordance
- `identity`: Title and description fields
- `core-metadata`: Servings, difficulty, prep time, and cook time controls
- `tags`: Tag chips and tag input row
- `actions`: Save draft, publish, and update buttons

### recipefork-cookbook-assignment

Inline cookbook assignment block for Recipefork authoring flows with cookbook loading state, multi-select assignment, and inline new-cookbook creation.

**Visual brief:** This should feel like a natural part of publishing or saving a recipe, not an afterthought modal. The loading state should be obvious, the selection affordances should be light, and the new-cookbook path should not derail the primary authoring flow.

**Components:** Card, Button, Input, Label, Badge, icon

**Composition:**
```
RecipeforkCookbookAssignment = Card(recipefork-assignment) > [LoadingState | CookbookList + NewCookbookInline + Feedback]
```

**Layout slots:**
- `loading-state`: Skeleton or spinner state while cookbooks are fetched
- `cookbook-list`: Selectable cookbook rows with visibility and recipe counts
- `new-cookbook`: Inline title input and create/cancel controls for a new cookbook
- `assignment-feedback`: Success or partial-failure messaging when the recipe save succeeds but cookbook assignment fails

### recipefork-simple-recipe-editor

Simple Mode authoring pattern for ordered ingredient and instruction lists, designed to coexist with Recipefork's Chef Mode without sacrificing the streamlined path.

**Visual brief:** Simple Mode should feel intentionally lighter than Chef Mode, but not stripped down. Ingredients and instructions are handled as clean stacked rows that stay fast to edit, reorder, and scan.

**Components:** Button, Input, Textarea, Card, Label, icon

**Composition:**
```
SimpleRecipeEditor = Stack(recipefork-editor-stack) > [IngredientList + InstructionList]
```

**Layout slots:**
- `ingredients`: Ordered ingredient rows with add/remove and drag-sort affordances
- `instructions`: Ordered instruction rows with add/remove and drag-sort affordances

### recipefork-chef-ingredients-editor

Structured ingredient editor for Recipefork recipes with quantity, unit, ingredient, preparation, autosuggest helpers, and recipe scaling behavior. This is the canonical ingredient authoring surface used by Chef Mode and the standardized simple-mode ingredient flow.

**Visual brief:** A structured ingredient editor rendered as a vertical stack of bordered rows. Each row exposes quantity, unit, ingredient name, and preparation, with autosuggest panels for unit abbreviations and kitchen prep language. Above the rows sits a scaling strip that changes displayed quantities while preserving structured ingredient identity for step linking. The same editor should feel approachable enough for simple recipes while still supporting advanced Chef Mode workflows.

**Components:** Button, Input, Card, Badge, Label, icon

**Composition:**
```
ChefIngredientsEditor = Card(recipefork-card) > [Header + ScaleControls + IngredientRow* + AddButton]
```

**Layout slots:**
- `header`: Section heading with add button
- `scale-controls`: Recipe scaling controls and servings summary
- `ingredient-row`: Quantity, unit, ingredient, preparation, remove
- `suggestions`: Autocomplete panels for units and preparation terms
- `preview`: Compact ingredient preview string

### recipefork-chef-instruction-editor

Hierarchical Chef Mode instruction editor with grouped instruction sets, stand-alone advanced steps, step images, per-step timing, and ingredient-step linkage. Stand-alone advanced steps retain the same deep controls as grouped sub-steps.

**Visual brief:** A hierarchical instruction builder where parent instruction sets expand into nested sub-step cards. Each group can carry a title, optional description, optional image, and one or more timed sub-steps. Stand-alone advanced steps are also supported when a parent grouping would be too heavy, but they should still surface image upload, prep/cook timing, and ingredient-link controls instead of collapsing into a plain textarea. Ingredient badges beneath each sub-step create explicit links between structured ingredients and step execution.

**Components:** Button, Input, Card, Badge, Label, Textarea, icon

**Composition:**
```
ChefInstructionEditor = Card(recipefork-card) > [Header + InstructionGroup* + SimpleStep*]
```

**Layout slots:**
- `header`: Section heading with add-simple and add-group actions
- `instruction-group`: Parent instruction card
- `simple-step`: Standalone advanced step row
- `group-image`: Optional parent image surface
- `step-image`: Optional sub-step image surface
- `timing`: Prep and cook minute controls
- `ingredient-links`: Selectable ingredient badges for required ingredient mapping
- `substeps`: Nested step stack with add-sub-step action

### recipefork-presentation-editor

Optional Chef Mode plating presentation editor for Recipefork with three intent states: AI-generated plating steps, manual plating steps, or no plating instructions, plus a readiness checklist that gates AI generation until the recipe has enough context to plate.

**Visual brief:** This should feel like the final polish layer of Chef Mode authoring. It is optional, but when used it should read like the finishing pass of a serious recipe workflow rather than a novelty toggle. The AI path should feel responsibly gated, not mysteriously disabled.

**Components:** Card, Button, Badge, Label, Input, icon

**Composition:**
```
RecipeforkPresentationEditor = Card(recipefork-presentation) > [ModeSwitch + AICallout? + PresentationSteps + EmptyState?]
```

**Layout slots:**
- `mode-switch`: Three-way selection for AI-generated plating guidance, manual plating guidance, or no presentation
- `ai-callout`: Context block explaining that Recipefork can generate plating instructions from the final recipe
- `readiness-checklist`: Checklist showing the minimum context needed before AI plating generation is enabled
- `presentation-steps`: Ordered plating steps with description and image upload only
- `empty-state`: Guidance when the user has not added or generated presentation steps yet

### recipefork-cooking-tips-editor

Reusable cooking tips editor for both Simple Mode and Chef Mode recipes, supporting optional bullet-style tips with ordering and removal controls.

**Visual brief:** This should feel lighter than the main recipe instructions: quick, practical, and easy to scan, like the author's final notes to another cook.

**Components:** Card, Button, Label, icon

**Composition:**
```
RecipeforkCookingTipsEditor = Card(recipefork-cooking-tips-editor) > [TipsHeader + TipsList + EmptyState?]
```

**Layout slots:**
- `tips-header`: Section title and description
- `tips-list`: List of bullet-style textarea rows
- `empty-state`: Prompt that explains there are no tips yet

### recipefork-recipe-story-editor

Expandable optional rich-text story editor for recipe narratives, family context, and cooking notes. Mirrors Recipefork's optional story flow with toolbar and sanitization-aware output expectations.

**Visual brief:** A dashed-border card with an optional badge and a collapsible header labeled as the recipe story. When expanded, it reveals a compact formatting toolbar and a narrative editing surface for recipe origin stories, memories, and serving notes.

**Components:** Button, Badge, Card, Textarea, icon

**Composition:**
```
RecipeStoryEditor = Card(recipefork-editor) > [Header(toggle) + Toolbar? + EditorArea + MetaRow]
```

**Layout slots:**
- `header`: Toggleable section header
- `toolbar`: Bold, italic, heading, list, ordered list, link actions
- `editor`: Rich text area
- `meta`: Character count and helper copy

### detail-header

Page header for detail views with title, metadata, status, and action buttons

**Components:** Avatar, Badge, Button, Breadcrumb

**Layout slots:**
- `breadcrumb`: Navigation breadcrumb trail with BreadcrumbItem links
- `title-row`: Horizontal row with title on left and action buttons on right: _flex _row _jcsb _aic
- `title`: Page heading with _heading2
- `subtitle`: Description text with _bodysm _fgmuted
- `status`: Badge showing current status (active, draft, archived)
- `actions`: Action buttons group: edit, delete, share with _flex _gap2
  **Layout guidance:**
  - shell_alignment: Treat detail-header as a section that sits inside the shell rhythm. It should not recreate shell-level page-width wrappers or duplicate breadcrumb bars already owned by the shell.
  - action_balance: Action controls should support the title rather than overpower it. Keep the title as the primary visual anchor and use compact buttons for secondary actions.
  - status_badge: Status indicators should read as supporting metadata and wrap gracefully below the title on narrow widths.

---

## Pages

### create (/recipe/new)

Layout: recipefork-recipe-mode-switch (split) → recipefork-recipe-metadata-form (authoring) → recipefork-cookbook-assignment (inline-assignment) → recipefork-simple-recipe-editor (standard) → recipefork-chef-ingredients-editor (structured) → recipefork-chef-instruction-editor (hierarchical) → recipefork-presentation-editor (ai-assisted) → recipefork-cooking-tips-editor (bullet-editor) → recipefork-recipe-story-editor (expandable)

### edit (/recipe/edit/:id)

Layout: detail-header (standard) → recipefork-recipe-metadata-form (authoring) → recipefork-cookbook-assignment (inline-assignment) → recipefork-simple-recipe-editor (standard) → recipefork-chef-ingredients-editor (structured) → recipefork-chef-instruction-editor (hierarchical) → recipefork-presentation-editor (ai-assisted) → recipefork-cooking-tips-editor (bullet-editor) → recipefork-recipe-story-editor (expandable)
