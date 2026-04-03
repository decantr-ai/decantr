# Section: pipeline-builder

**Role:** primary | **Shell:** terminal-split | **Archetype:** pipeline-builder
**Description:** Visual data pipeline builder with drag-and-drop canvas, pipeline list, and configuration for scheduling and retry policies.

## Quick Start

**Shell:** Terminal-style layout with status bar, resizable split panes, and hotkey bar. Optimized for CLI tool interfaces with monospace typography and ASCII borders.
**Pages:** 3 (pipelines, pipeline-editor, pipeline-config)
**Key patterns:** data-table [moderate], workflow-canvas [complex], form-sections [complex]
**CSS classes:** `.term-glow`, `.term-tree`, `.term-type`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and direct.

## Shell Implementation (terminal-split)

### body

- **note:** Split pane body. Supports horizontal, vertical, and quad layouts. Min pane size 100px.
- **display:** flex
- **divider:**
  - note: Drag handle between panes.
  - width: 4px
  - cursor: col-resize
  - background: var(--d-border)
- **padding:** 0.5rem
- **overflow:** hidden
- **pane_left:**
  - flex: 1
  - note: Left split pane. Resizable width via drag handle.
  - padding: 0.5rem
  - overflow_y: auto
- **pane_right:**
  - flex: 1
  - note: Right split pane. Resizable width via drag handle.
  - padding: 0.5rem
  - overflow_y: auto

### root

- **font:** monospace
- **atoms:** _grid _h[100vh] _mono _bgblack _fggreen
- **color:** var(--d-green)
- **height:** 100vh
- **display:** grid
- **background:** var(--d-black)
- **grid_template:** rows: 24px 1fr 28px

### hotkey_bar

- **gap:** 1rem
- **note:** Keyboard shortcut hints. Each item: kbd badge + label.
- **align:** center
- **atoms:** _flex _aic _gap4 _px2 _bgmuted _textsm
- **height:** 28px
- **sticky:** true
- **display:** flex
- **padding:** 0 0.5rem
- **font_size:** sm
- **background:** var(--d-surface)

### status_bar

- **align:** center
- **color:** var(--d-black)
- **height:** 24px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 0.5rem
- **font_size:** sm
- **background:** var(--d-green)
- **left_content:** App name + version
- **right_content:** Status indicator

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Spacing Guide

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Content gap | `--d-content-gap` | `1rem` | Gap between sibling elements |
| Section padding | `--d-section-py` | `5rem` | Vertical padding on d-section |
| Surface padding | `--d-surface-p` | `1.25rem` | Inner padding for d-surface |
| Interactive V | `--d-interactive-py` | `0.5rem` | Vertical padding on buttons |
| Interactive H | `--d-interactive-px` | `1rem` | Horizontal padding on buttons |
| Control | `--d-control-py` | `0.5rem` | Vertical padding on inputs |
| Data row | `--d-data-py` | `0.625rem` | Vertical padding on table rows |

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Key palette tokens:**

| Token | Value | Role |
|-------|-------|------|
| `--d-text` | `#00FF00` | Body text, headings, primary content |
| `--d-accent` | `#00FFFF` |  |
| `--d-border` | `#333333` | Dividers, card borders, separators |
| `--d-primary` | `#00FF00` | Brand color, key interactive, selected states |
| `--d-surface` | `#0A0A0A` | Cards, panels, containers |
| `--d-secondary` | `#FFB000` | Secondary brand color, supporting elements |
| `--d-bg` | `#000000` | Page canvas / base layer |
| `--d-text-muted` | `#00AA00` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#00CCCC` |  |
| `--d-primary-hover` | `#00CC00` | Hover state for primary elements |
| `--d-surface-raised` | `#111111` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#CC8C00` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.term-glow` | Subtle phosphor bloom effect using text-shadow with current color. 5px and 10px spread. |
| `.term-tree` | Tree view using ASCII connectors. Uses ├── └── │ for hierarchy visualization. |
| `.term-type` | Typewriter entrance animation. Characters appear one by one, 20ms per character. |
| `.term-blink` | Blinking cursor animation at 1s interval. Steps timing for authentic terminal feel. |
| `.term-input` | Terminal prompt style with '> ' prefix and blinking cursor. Monospace input. |
| `.term-panel` | ASCII box-drawing border using Unicode characters. Background surface color, 1px solid border. |
| `.term-table` | Full ASCII table borders with box-drawing characters for headers, cells, and junctions. |
| `.term-canvas` | Pure black background (#000000) for CRT authenticity. No gradients, no textures. |
| `.term-hotkey` | Function key button style '[F1]'. Border, padding, monospace. Inverse on active. |
| `.term-status` | Inverse color status bar. Background uses text color, text uses background color. |
| `.term-diff-add` | Addition highlighting. Green background with darker green text for added lines. |
| `.term-diff-del` | Deletion highlighting. Red background with darker red text for removed lines. |
| `.term-progress` | ASCII progress bar using block characters. [||||....] style with percentage. |
| `.term-scanlines` | Optional CRT scanline overlay using repeating-linear-gradient. Semi-transparent black lines. |
| `.term-sparkline` | Inline ASCII sparkline using braille characters for high-resolution mini charts. |

**Compositions:** **auth:** Terminal-styled authentication forms with ASCII borders.
**logs:** Log viewer with real-time streaming and filtering.
**dashboard:** Terminal dashboard with split panes, status bar, and hotkey bar.
**marketing:** Dev tool marketing page with terminal aesthetic hero.
**Spatial hints:** Density bias: 2. Section padding: 16px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface terminal-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — terminal-split shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

pipelines, visual-builder, scheduling

---

## Visual Direction

**Personality:** Technical data engineering workspace with terminal-inspired aesthetics. Phosphor green/amber on black for pipeline canvas and log viewers. ASCII box borders on panels. Monospace everywhere. Visual pipeline builder uses nodes and edges with animated data flow particles. Source connectors show recognizable database/API icons. Transformation nodes show SQL/code previews. Think dbt Cloud meets Prefect meets a retro terminal. Lucide icons mixed with data-type icons.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### data-table

Sortable, filterable, paginated data table with row selection

**Visual brief:** Full-width data table with a sticky header row. Header cells use uppercase, small, muted text with sort-direction arrows on sortable columns. Data rows have consistent vertical padding (py3) for scan-ability, with subtle zebra-stripe background on hover. Row-selection checkboxes align in the first column. Active selections highlight the row with a faint primary-color tint. A toolbar above the table holds a search input on the left and action buttons (export, delete) on the right. Pagination controls at the bottom show current range, total count, and prev/next buttons with disabled states at boundaries.

**Components:** Table, Checkbox, Button, Input, Badge, icon

**Composition:**
```
Table = Table(d-data) > [TableHeader > HeaderCell(sortable?, sort-indicator?)[] + TableBody > DataRow(d-data-row, hoverable, striped?)[]]
DataRow = Row > [Checkbox?(d-control) + DataCell(d-data-cell)[]]
Toolbar = Row(d-control) > [SearchInput(d-control) + ActionButtons(d-interactive)]
DataTable = Container(d-data, full-width) > [Toolbar + Table + Pagination]
Pagination = Row(d-control) > [PageInfo(text-muted) + PageButtons(d-interactive, variant: ghost)[]]
```

**Layout slots:**
- `toolbar`: Top row with optional search Input and action Buttons
- `pagination`: Footer with page info and prev/next Buttons
- `table-body`: Data rows with optional row selection Checkbox
- `table-header`: Column headers with sort controls
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Row hover highlights with 150ms background-color transition. Sort arrow rotates 180deg on direction change with 200ms ease. Checkbox scales briefly on check (scale 1.1 for 100ms). |
| transitions | Rows entering from filter/search fade in with 200ms opacity transition. Bulk-selected rows highlight with a slide-in left-border accent over 150ms. |

**Responsive:**
- **Mobile (<640px):** Table transforms into a stacked card list. Each row becomes a vertical card with label-value pairs. Toolbar search goes full-width. Pagination simplifies to prev/next only. Horizontal scroll is avoided entirely.
- **Tablet (640-1024px):** Table displays with horizontal scroll if columns exceed viewport. Sticky first column for row identifiers. Toolbar remains single row.
- **Desktop (>1024px):** Full table layout with all columns visible. Sticky header on scroll. Toolbar with search, filters, and bulk action buttons. Full pagination with page numbers.

**Accessibility:**
- Role: `Table uses semantic <table>, <thead>, <tbody>, <th>, <td> elements. Sort buttons are <button> inside <th> with aria-sort attribute.`


### workflow-canvas

Visual node-graph editor for business logic, ETL pipelines, or automation flows. Provides an infinite pannable canvas with draggable nodes, bezier-curve edges, a minimap, toolbar, node palette sidebar, and property panel for configuring selected elements.

**Visual brief:** Full-viewport canvas area with a subtle dot-grid background (dots are 1px circles at 20px intervals, color muted at 15% opacity). The canvas supports infinite pan (click-drag on background) and zoom (scroll wheel, range 25%-400%). Nodes are rounded-rectangle cards (min 160px wide, 80px tall) with a 4px colored top stripe indicating node type: blue for triggers, green for actions, yellow for conditions, gray for transforms. Each node has a white/surface background, 8px border-radius, and subtle shadow (0 2px 8px rgba(0,0,0,0.1)). Node interior shows an icon and type label in the colored header area, and a body area with the node's configured name or a brief description. Input ports sit on the left edge and output ports on the right edge of each node — they are 10px diameter circles with a 2px border in the node's type color, filled white by default. On hover, ports glow with the type color and scale to 12px. Dragging from a port draws a temporary bezier curve following the cursor. Edges are smooth cubic bezier curves connecting output ports to input ports. Edge stroke is 2px in muted gray, with animated dashes (4px dash, 4px gap) flowing in the data direction at a steady speed. Selected edges turn accent color. Selected nodes gain a 2px accent border glow and slight elevation increase. Multi-select by shift-click or rubber-band drag. The Toolbar sits at the top of the canvas as a horizontal bar with icon buttons: zoom in, zoom out, fit-to-view, undo, redo, delete selected, and a toggle for snap-to-grid. The NodePalette is a 240px wide left sidebar listing available node types grouped by category (Triggers, Actions, Conditions, Transforms), each showing icon + label. Nodes are added by dragging from the palette onto the canvas. The PropertyPanel is a 280px right sidebar that appears when a node is selected, showing editable fields for the node's configuration (name, parameters, description). The Minimap sits in the bottom-right corner as a 160x100px translucent panel showing a zoomed-out view of the entire graph with a viewport indicator rectangle. Clicking the minimap pans the canvas to that location.

**Components:** Canvas, Node, NodePort, Edge, Minimap, Toolbar, PropertyPanel, NodePalette

**Composition:**
```
Edge = BezierPath(svg, stroke: 2px, dash-animated, direction: source→target)
Node = Card(d-interactive, draggable, rounded-lg, shadow, border-top: type-color) > [Header(icon + label) + Body?(name + description) + InputPorts(left-edge) + OutputPorts(right-edge)]
Canvas = Section(d-section, infinite-pan, dot-grid-bg) > [Toolbar(d-surface, sticky-top) + NodePalette?(d-surface, left-sidebar)] + Node*(d-interactive) > [NodeHeader(color-stripe: type) + NodeBody? + NodePort*(left|right)] + Edge*(svg-bezier, animated-dash) + Minimap(d-surface, bottom-right)
Minimap = Panel(d-surface, fixed-bottom-right, 160x100, semi-transparent) > [ScaledGraph + ViewportRect]
Toolbar = Row(d-surface, sticky, gap-2) > IconButton(ghost, 32px)[]
NodePort = Circle(d-interactive, 10px, border: type-color, glow-on-hover, connectable)
NodePalette = Sidebar(d-surface, w-240, collapsible) > [SearchInput + CategoryGroup* > DraggableNodeType*]
PropertyPanel = Sidebar(d-surface, w-280, slide-in-right) > [NodeTypeHeader + ConfigFields + PortConfig]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| node-hover | shadow elevation increase 150ms ease-out |
| port-hover | scale(1→1.2) + glow(type-color) 150ms ease-out on port hover |
| toolbar-button-press | scale(0.92) 80ms ease-in |
| edge-draw | bezier path animates in real-time following cursor during connection drag |
| node-drop | scale(0.8→1) + opacity 0→1 250ms cubic-bezier(0.34, 1.56, 0.64, 1) when dropped from palette |
| fit-to-view | viewport transform (translate + scale) 500ms ease-in-out |
| node-delete | scale(1→0.8) + opacity 1→0 200ms ease-in |
| palette-toggle | width 240px↔0 + opacity 300ms ease-in-out |
| property-panel-exit | translateX(0)→translateX(280px) 200ms ease-in |
| property-panel-enter | translateX(280px)→translateX(0) 250ms ease-out |
| edge-flow | stroke-dashoffset animation creating flowing dashes in data direction, 1s linear infinite per edge |
| dot-grid-breathe | subtle opacity oscillation 0.1→0.15 on dot grid, 4s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Canvas is touch-pannable with two-finger scroll and pinch-to-zoom. Node palette hidden behind a floating '+' button that opens a bottom sheet. Toolbar collapses to a floating action menu. Property panel opens as a bottom sheet. Minimap hidden. Nodes use minimum 44px touch targets for ports.
- **Tablet (640-1024px):** Canvas supports touch pan and pinch zoom. Node palette as a collapsible left drawer (swipe from left edge). Toolbar remains at top. Property panel as a right drawer. Minimap visible in bottom-right. Port touch targets 36px minimum.
- **Desktop (>1024px):** Full layout with persistent palette sidebar (collapsible), toolbar, minimap, and property panel. Mouse drag to pan, scroll to zoom. Hover states on ports and edges. Keyboard shortcuts fully active. Rubber-band multi-select with click-drag on empty canvas.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: cycle focus between toolbar, palette, canvas nodes, and property panel; Arrow keys: move selected node by grid increment (or pan canvas if no selection); Delete/Backspace: remove selected nodes or edges; Ctrl+Z / Cmd+Z: undo last action; Ctrl+Shift+Z / Cmd+Shift+Z: redo; Ctrl+A / Cmd+A: select all nodes; Escape: deselect all and close property panel; Space+drag: pan canvas regardless of pointer location; +/-: zoom in/out; Ctrl+0: fit to view
- Announcements: Node {name} added at position {x}, {y}; Node {name} selected — {input_count} inputs, {output_count} outputs; Edge connected: {source_node} to {target_node}; Edge removed between {source_node} and {target_node}; Canvas zoomed to {zoom_percent}%; Undo: {action_description}; Redo: {action_description}; {count} nodes selected


### form-sections

Grouped form fields organized in labeled sections with validation

**Visual brief:** Vertical stack of grouped form fields. Each section has a heading/description on the left and form controls on the right (2-column at desktop, stacked on mobile). Labels above fields. Max-width 640px. Single card wrapping or no card. Save/cancel buttons at bottom.

**Components:** Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup

**Composition:**
```
Field = Stack(flex-col) > [Label(font-medium) + Input(d-control) + ErrorText?(d-annotation, text-destructive)]
Section = Card(d-surface) > [SectionTitle(heading4) + Description?(text-muted) + FieldGroup(d-control, grid: 1/2-col)]
FieldGroup = Grid > Field[]
FormSections = Container(d-section, flex-col, gap-6) > [Section[] + ActionButtons]
ActionButtons = Row(d-interactive) > [SaveButton(variant: primary) + CancelButton(variant: ghost)]
```

**Layout slots:**
- `actions`: Bottom-aligned save/cancel buttons
- `section`: Card with 2-column layout: labels left, fields right
- `field-group`: Grid of form fields with _grid _gc1 _lg:gc2 _gap4
- `section-title`: Section heading with _heading4 and description with _bodysm _fgmuted
  **Layout guidance:**
  - note: Labels go ABOVE their field, not side-by-side. This prevents the label-field gap problem at wide viewports.
  - textarea: Textareas should have min-height: 6rem to visually differentiate from single-line inputs.
  - max_width: Form content should be constrained to max-width: 40rem (640px). Full-width forms are hard to read.
  - icon_placement: Section header icons render INLINE with the heading text (icon left of heading, vertically centered), not floating outside the card border.
  - label_position: stacked
  - select_styling: Apply d-control to ALL form elements including <select>. Add appearance: none and a custom SVG chevron for consistent styling.
  - section_grouping: Group related fields under section headers. Use a SINGLE d-surface card for the entire form, OR no card at all. Do NOT wrap each section in its own separate card.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Collapsible sections expand/collapse with 250ms ease height transition. Validation errors shake the invalid field with a 300ms horizontal oscillation (translateX +/-4px). |
| transitions | Section content fades in on expand with 200ms ease. Step transitions in creation preset cross-fade over 250ms. |

**Accessibility:**
- Role: `form`
- Keyboard: Tab navigates between form fields; Shift+Tab navigates backwards between fields; Enter submits when focus is on submit button; Space toggles checkboxes and switches; Arrow keys navigate within radio groups
- Announcements: Validation error: {field} — {message}; Section {name} expanded; Section {name} collapsed; Form submitted successfully
- Focus: First invalid field receives focus on failed validation. On section expand, focus moves to first field in the section. On step change in creation preset, focus moves to first field of new step.


---

## Pages

### pipelines (/pipelines)

Layout: data-table

### pipeline-editor (/pipelines/:id)

Layout: workflow-canvas

### pipeline-config (/pipelines/:id/config)

Layout: form-sections
