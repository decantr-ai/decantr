# Section: content-author

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** content-author
**Description:** Author and editor dashboard for managing drafts, editing articles, and viewing published content. Functional workspace focused on writing productivity.

## Quick Start

**Shell:** Responsive sidebar shell with a desktop split layout, a compact sticky header, and an overlay drawer below the md breakpoint. Used by dashboards, account workspaces, and admin operations surfaces. (nav: 240px, header: 52px)
**Pages:** 3 (drafts, editor, published)
**Key patterns:** data-table [moderate], doc-editor
**Theme decorators:** 5 classes — see `section-content-author-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Clear, editorial, and operational.

## Shell Implementation (sidebar-main)

### root

- **display:** flex
- **direction:** row
- **height:** 100vh
- **atoms:** _flex _h[100vh] _overhidden

### sidebar

- **width:** 240px
- **collapsed_width:** 64px
- **collapse_breakpoint:** md
- **mobile_behavior:** Overlay drawer below md. Closed state occupies no layout width. Open state uses a fixed panel + scrim.
- **position:** left
- **direction:** column
- **border:** right
- **background:** var(--d-surface)
- **atoms:** _flex _col _br[1px_solid_var(--d-border)] _minh0
- **brand:**
  - height: 52px
  - display: flex
  - align: center
  - padding: 0 1rem
  - border: bottom
  - content: Logo/brand + collapse toggle. Collapsed rail: center the toggle and omit extra brand copy if it no longer fits cleanly.
- **nav:**
  - flex: 1
  - overflow_y: auto
  - padding: 0.5rem
  - group_gap: 0.5rem
  - group_header_treatment: d-label
  - item_treatment: d-interactive[ghost]
  - item_padding: 0.375rem 0.75rem
  - item_gap: 2px
  - item_content: icon (16px) + label text. Collapsed: icon only, text hidden.
  - note: This is the sidebar's only scroll region. The footer remains pinned below it.
- **footer:**
  - border: top
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
  - content: Workspace identity summary + sign-out control. The label should reuse the shared workspace identity and tier presentation rather than recomputing a separate fallback string inside the sidebar.

### main_wrapper

- **flex:** 1
- **direction:** column
- **overflow:** hidden
- **atoms:** _flex _col _flex1 _minh0 _overhidden

### header

- **height:** 52px
- **display:** flex
- **align:** center
- **justify:** space-between
- **padding:** 0 clamp(1rem, 2vw, 1.5rem)
- **border:** bottom
- **left_content:** Breadcrumb — omit segment when it equals page title
- **right_content:** Theme toggle (sun/moon icon) + Search/command trigger + mobile navigation toggle when the sidebar is in drawer mode. Theme toggle toggles light/dark class on html element.
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.

### body

- **flex:** 1
- **overflow_y:** auto
- **padding:** clamp(1rem, 2vw, 1.5rem)
- **atoms:** _flex1 _minh0 _overauto _p6
- **note:** Sole scroll container. Page content renders directly here. No wrapper div around outlet. Inner sections should inherit the shell rhythm rather than redefining page padding.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label[data-anchor]` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Left accent border anchor (data-anchor variant)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: compact (--d-density-scale: 0.65)

## Shell Notes (sidebar-main)

- **Hotkeys:** Navigation hotkeys defined in the essence are keyboard shortcuts. Implement as useEffect keydown event listeners — do NOT render hotkey text in the sidebar UI.
- **Collapse:** Sidebar collapse toggle should be integrated into the sidebar header area (next to the brand/logo), not floating at the bottom of the sidebar.
- **Collapsed Brand:** When the sidebar collapses to a rail, the header should behave like a compact rail control state, not like a cramped mini brand lockup. Prefer centering the collapse/expand control and omitting extra brand copy or stray decorative marks if they do not fit cleanly.
- **Mobile Drawer:** Below the md breakpoint, the sidebar leaves the permanent split layout and becomes an overlay drawer. Use a scrim, Escape handling, and a header toggle. The closed drawer must not consume layout width.
- **Workspace State:** Authenticated shells should derive identity, tier, entitlements, active organization, and admin capability from one shared workspace state. Do not let sidebar navigation, footer identity, billing state, and page-level access drift through separate fetches or local fallbacks.
- **Nav Visibility:** Sidebar navigation visibility should reflect actual capabilities, not generic route presence. Team, governance, private-registry, and admin groups appear only when the active workspace state says the user can reach them.
- **Shell Spacing:** Header, body, sidebar, and footer all share one inset rhythm. Use a tighter shell inset on mobile and the full comfortable inset on tablet/desktop instead of page-local padding overrides.
- **Viewport Lock:** The authenticated shell should stay locked to the viewport height. The main body region owns page scrolling, while the sidebar keeps its footer and account controls pinned within the shell instead of letting them drift to the bottom of the full document.
- **Breadcrumbs:** For nested routes (e.g., /resource/:id), show a breadcrumb trail above the page heading inside the main content area. On narrow widths, truncate gracefully rather than wrapping into a second shell row.
- **Section Labels:** Dashboard section labels use d-label[data-anchor] for accent-bordered headers with density-responsive spacing.
- **Empty States:** When a section has zero data, show a centered empty state: 48px muted icon + descriptive message + optional CTA button.
- **Page Transitions:** Apply the entrance-fade class (if generated) to the main content area for smooth page transitions.

## Theme Reference

**Theme:** editorial (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 5 `editorial-*` classes — full Class/Intent/Apply-to table in `section-content-author-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Spatial hints:** Density bias: none. Section padding: 6rem. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface editorial-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

editing, publishing, auto-save, markdown

---

## Visual Direction

**Personality:** Focused editorial workspace for writers and editors. The interface should feel quiet, efficient, and typographically disciplined. Writing and publishing tools are present, but the chrome stays secondary to the article work itself. Think editorial CMS rather than noisy analytics dashboard.

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### data-table

Sortable, filterable, paginated data table with row selection

**Components:** Table, Checkbox, Button, Input, Badge, icon

**Layout slots:**
- `toolbar`: Top row with optional search Input and action Buttons
- `table-header`: Column headers with sort controls
- `table-body`: Data rows with optional row selection Checkbox
- `pagination`: Footer with page info and prev/next Buttons
  **Layout guidance:**
  - toolbar_balance: Search, filters, and bulk actions should feel like one operational control band, not several detached widgets.
  - row_density: Keep row spacing scannable and consistent. Dense data tables should still preserve a clear visual rhythm and avoid accidental crowding.
  - mobile_fallback: The card-list fallback should keep label-value semantics clear instead of becoming a generic stack of text.

### doc-editor

Rich text block editor with real-time collaboration support. CRDT-based synchronization, floating toolbar, slash commands, and remote cursor overlay.

**Components:** Button, Avatar, icon

**Layout slots:**
- `cursors-layer`: Overlay for remote collaborator cursors
- `selections-layer`: Overlay for remote text selections
- `toolbar`: Floating formatting toolbar on selection
- `content`: Contenteditable block container
- `slash-menu`: Block type command palette
- `mention-popup`: @mention autocomplete dropdown
  **Layout guidance:**
  - editing_focus: The editor surface should feel like one primary work plane. Floating toolbars, slash menus, and collaborator overlays should support that plane without fragmenting it.
  - overlay_discipline: Selection toolbars, cursors, and slash menus should not obscure the active text block more than necessary.
  - document_measure: Keep the editable column at a comfortable reading and writing width even when the surrounding workspace is wide.

---

## Pages

### drafts (/drafts)

Layout: data-table (standard)

### editor (/drafts/:id)

Layout: doc-editor (standard)

### published (/published)

Layout: data-table (standard)
