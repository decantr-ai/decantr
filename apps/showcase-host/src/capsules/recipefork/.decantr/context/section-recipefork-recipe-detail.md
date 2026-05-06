# Section: recipefork-recipe-detail

**Role:** primary | **Shell:** recipefork-top-nav | **Archetype:** recipefork-recipe-detail
**Description:** Recipefork's recipe detail surface with hero imagery, summary/actions, Chef Mode ingredient and instruction displays, optional plating presentation, dynamic cooking tips, public provenance attribution, owner-only branch analytics, and comments, all under the shared Recipefork top-nav shell.

## Quick Start

**Shell:** Shared Recipefork application shell with sticky top nav, compact utility actions, and a wide scrollable content region below. Mirrors the current app's persistent nav model across public and authenticated product routes. (header: 64px)
**Pages:** 1 (recipe-detail)
**Key patterns:** hero, detail-header [moderate], recipefork-fork-provenance [moderate], recipefork-chef-ingredients-display [moderate], recipefork-chef-instructions-display [moderate], recipefork-presentation-display [moderate], recipefork-cooking-tips-display, comment-thread [moderate]
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

**Theme decorators:** 6 `recipefork-*` classes — full Class/Intent/Apply-to table in `section-recipefork-recipe-detail-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** detail-header
**Spatial hints:** Density bias: none. Section padding: 4rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface recipefork-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — recipefork-top-nav shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics

---

## Visual Direction

**Personality:** Recipefork is a neutral, production-grade recipe product that lets food photography and authoring depth carry the experience. Public browsing feels clean and modern; Chef Mode is the critical differentiator, with structured ingredients, nested instruction groups, optional plating presentation, dynamic cooking tips, explicit recipe visibility controls, draft workflows, and no-loss hydrated editing.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Components:** Button, icon

**Layout slots:**
- `headline`: Primary heading, typically h1 with _heading1
- `description`: Supporting paragraph with _body _muted
- `cta-group`: Horizontal Button group with _flex _gap3
- `media`: Optional image, illustration, or chart component
  **Layout guidance:**
  - container: none
  - note: Hero sections should NOT wrap content in d-surface cards. The hero IS the section. Use d-section for spacing.
  - visual_proof: The visual element below CTAs should be an ambient visualization (animated gradient, particle effect, blurred screenshot) — NOT a data widget wrapped in a card. If showing product data (agents, metrics), render as floating elements without card containment. Omit entirely if no meaningful visual is available.
  - subtitle: Subtitle line-height should be 1.6-1.8. Use text-muted color, smaller font than heading.
  - cta_sizing: Primary and secondary CTAs should have equal padding and height. Primary is filled (d-interactive[data-variant=primary]), secondary is ghost (d-interactive[data-variant=ghost]).
  - announcement: If showing an announcement badge above the heading, use d-annotation with prominent styling — not a tiny muted pill. Accent border or accent background at 15% opacity.
  - background: Hero sections should have a subtle radial or mesh gradient background using the theme palette — not a flat color. Use the primary and accent colors at very low opacity (5-10%) to create depth. Example: radial-gradient(ellipse at top center, rgba(var(--d-accent-rgb), 0.08) 0%, transparent 60%), or a soft gradient from primary to transparent. The gradient should fade to var(--d-bg) at the edges so it blends seamlessly with the page.
  - ambient_glow: For themes with neon/glow personality, add a soft ambient glow behind the hero heading or CTA area. Use a blurred pseudo-element or box-shadow with the accent color at 10-15% opacity, radius 200-400px. This creates a focal point without overwhelming the content.

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

### recipefork-fork-provenance

Lineage-aware provenance block for Recipefork recipes showing the immediate parent and root original publicly, while reserving branch stats, history, and descendant activity for owner-facing contexts.

**Visual brief:** A provenance surface that feels native to Recipefork rather than bolted on. Public viewers should get clear creator credit, while owners can expand into richer branch analytics and network history without exposing internal branch management data to everyone.

**Components:** Card, Avatar, Button, Badge, icon

**Composition:**
```
RecipeforkForkProvenance = Card(recipefork-provenance) > [ImmediateParent + RootOriginal? + BranchStats + ForkHistoryAccordion? + BranchTimeline?]
```

**Layout slots:**
- `immediate-parent`: Primary attribution row for the recipe version directly forked
- `root-original`: Secondary attribution row for the original source recipe when it differs from the parent
- `branch-stats`: Owner-facing metrics for direct forks, branch variations, and contributors
- `fork-history`: Owner-facing accordion list of ancestor recipes in order with links and timestamps
- `branch-timeline`: Owner-facing descendant activity list of published branch variations with depth, author, and creation time

### recipefork-chef-ingredients-display

Chef Mode ingredient presentation surface with scale controls and measurement-system-aware rendering.

**Visual brief:** A clean ingredient list optimized for Chef Mode recipe detail pages. Scaling controls sit above the ingredient list, and each ingredient row foregrounds quantity and unit before the ingredient name and preparation note.

**Components:** Badge, Button, Card, Label, icon

**Composition:**
```
ChefIngredientsDisplay = Card(recipefork-card) > [Header + ScaleControls + IngredientList]
```

**Layout slots:**
- `header`: Section label and Chef Mode badge
- `scale-controls`: Multiplier buttons plus servings summary
- `ingredient-item`: Quantity, unit, ingredient, preparation

### recipefork-chef-instructions-display

Chef Mode instruction presentation surface with collapsible parent groups, sub-step badges, optional imagery, timing metadata, and required ingredient chips.

**Visual brief:** A layered instruction display that preserves the hierarchy of Chef Mode recipes. Parent instruction groups act like collapsible teaching sections, with nested numbered sub-steps, optional hero imagery, timing chips, and ingredient references inline beneath the relevant sub-step.

**Components:** Badge, Button, Card, Label, icon

**Composition:**
```
ChefInstructionsDisplay = Card(recipefork-card) > [Header + InstructionGroupDisplay* + SimpleStepDisplay*]
```

**Layout slots:**
- `header`: Section label and Chef Mode badge
- `group`: Collapsible instruction group
- `group-image`: Parent image surface
- `substep`: Nested numbered sub-step row
- `timing`: Prep/cook detail row
- `ingredient-chips`: Required ingredient chips
- `simple-step`: Standalone advanced step layout

### recipefork-presentation-display

Recipe detail presentation block for Recipefork showing numbered plating steps, optional step imagery, and whether the plating guide was AI-generated or author-guided.

**Visual brief:** This should feel like a refined serving guide rather than another cooking block. It belongs after the cooking instructions and before the story, acting as the bridge between technique and presentation.

**Components:** Card, Badge, Label, icon

**Composition:**
```
RecipeforkPresentationDisplay = Card(recipefork-presentation-display) > [PresentationHeader + PresentationStep*]
```

**Layout slots:**
- `presentation-header`: Section title and AI/manual badge
- `presentation-step`: Single plating step row with numbered marker and optional image

### recipefork-cooking-tips-display

Display card for recipe-specific cooking tips on Recipefork detail pages, replacing generic static tips with author-provided notes.

**Visual brief:** This should feel practical and low-friction. It replaces generic filler with real creator knowledge, so it should read like trusted notes rather than a decorative sidebar.

**Components:** Card, Label, icon

**Composition:**
```
RecipeforkCookingTipsDisplay = Card(recipefork-cooking-tips-display) > [TipsHeader + TipItems]
```

**Layout slots:**
- `tips-header`: Cooking tips section title
- `tip-items`: Bullet list of concise author-provided tips

### comment-thread

Inline or sidebar comment discussions with reply threading, @mentions, reactions, and resolve functionality.

**Components:** Avatar, Button, Textarea, icon

**Layout slots:**
- `comments`: List of comment messages
- `reply-input`: New reply composer
- `actions`: Thread-level actions (resolve, delete)
  **Layout guidance:**
  - thread_role: The thread should feel attached to the referenced content first and like a discussion surface second. Anchor cues, indentation, and resolve state should preserve that relationship.
  - reply_hierarchy: Primary comment, replies, and thread actions should read in a clear top-to-bottom progression. Resolve controls should be easy to find without visually dominating the discussion.
  - inline_vs_sidebar: Inline threads should stay compact and context-tethered, while sidebar threads may breathe more and show a fuller reply composer.

---

## Pages

### recipe-detail (/recipe/:id)

Layout: hero (image-overlay) → detail-header (standard) → recipefork-fork-provenance (lineage-card) → recipefork-chef-ingredients-display (scaled) → recipefork-chef-instructions-display (hierarchical) → recipefork-presentation-display (numbered-steps) → recipefork-cooking-tips-display (bullet-list) → comment-thread (sidebar)
