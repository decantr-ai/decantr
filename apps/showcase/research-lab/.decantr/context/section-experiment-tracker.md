# Section: experiment-tracker

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** experiment-tracker
**Description:** Experiment lifecycle management for a research lab. Researchers track planned, in-progress, and completed experiments with protocols and timelines.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (experiments, experiment-detail)
**Key patterns:** kanban-board [complex], data-table [moderate], detail-header [moderate], protocol-step [complex], timeline [moderate]
**CSS classes:** `.lab-grid`, `.lab-panel`, `.lab-beaker`
**Density:** comfortable
**Voice:** Scientific and methodical.

## Shell Implementation (sidebar-main)

### body

- **flex:** 1
- **note:** Sole scroll container. Page content renders directly here. No wrapper div around outlet.
- **atoms:** _flex1 _overflow[auto] _p6
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _flex _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** row

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **left_content:** Breadcrumb — omit segment when it equals page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Theme toggle (sun/moon icon) + Search/command trigger. Theme toggle toggles light/dark class on html element.

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - group_gap: 0.5rem
  - overflow_y: auto
  - item_content: icon (16px) + label text. Collapsed: icon only, text hidden.
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
  - group_header_treatment: d-label
- **atoms:** _flex _col _borderR
- **brand:**
  - align: center
  - border: bottom
  - height: 52px
  - content: Logo/brand + collapse toggle
  - display: flex
  - padding: 0 1rem
- **width:** 240px
- **border:** right
- **footer:**
  - border: top
  - content: User avatar + settings link
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
- **position:** left
- **direction:** column
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **collapse_breakpoint:** md

### main_wrapper

- **flex:** 1
- **atoms:** _flex _col _flex1 _overflow[hidden]
- **overflow:** hidden
- **direction:** column

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (sidebar-main)

- **Hotkeys:** Navigation hotkeys defined in the essence are keyboard shortcuts. Implement as useEffect keydown event listeners — do NOT render hotkey text in the sidebar UI.
- **Collapse:** Sidebar collapse toggle should be integrated into the sidebar header area (next to the brand/logo), not floating at the bottom of the sidebar.
- **Breadcrumbs:** For nested routes (e.g., /resource/:id), show a breadcrumb trail above the page heading inside the main content area.
- **Empty States:** When a section has zero data, show a centered empty state: 48px muted icon + descriptive message + optional CTA button.
- **Section Labels:** Dashboard section labels should use the d-label class. Anchor with a left accent border: border-left: 2px solid var(--d-accent); padding-left: 0.5rem.
- **Section Density:** Dashboard sections use compact spacing. Apply data-density='compact' on d-section elements for tighter vertical rhythm than marketing pages.
- **Page Transitions:** Apply the entrance-fade class (if generated) to the main content area for smooth page transitions.

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
| `--d-text` | `#18181B` | Body text, headings, primary content |
| `--d-accent` | `#06B6D4` |  |
| `--d-border` | `#E4E4E7` | Dividers, card borders, separators |
| `--d-primary` | `#06B6D4` | Brand color, key interactive, selected states |
| `--d-surface` | `#FAFAFA` | Cards, panels, containers |
| `--d-secondary` | `#0E7490` | Secondary brand color, supporting elements |
| `--d-bg` | `#FFFFFF` | Page canvas / base layer |
| `--d-text-muted` | `#71717A` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#0891B2` |  |
| `--d-primary-hover` | `#0891B2` | Hover state for primary elements |
| `--d-surface-raised` | `#F4F4F5` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#155E75` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lab-grid` | Precise 8px grid alignment with visible baseline grid on hover or debug mode. |
| `.lab-panel` | White panels with precise 1px borders and sharp corners. Clean container for data and controls. |
| `.lab-beaker` | Scientific iconography with cyan stroke weight matching 1.5px precision. |
| `.lab-hazard` | Yellow and black diagonal hazard stripes for warnings and caution zones. |
| `.lab-barcode` | Monospace barcode-style displays for sample IDs and tracking codes. |
| `.lab-reading` | Monospace IBM Plex Mono data displays with tabular-nums and precise alignment. |
| `.lab-protocol` | Numbered step markers with circle badges and precise connectors for procedural displays. |
| `.lab-cyan-accent` | Cyan status indicators and highlights for active data streams and live readings. |

**Compositions:** **protocol:** Protocol step-by-step interface with numbered procedures and safety callouts.
**marketing:** Research platform marketing with technical precision and data visualization.
**data-explorer:** Data exploration interface with precise readings, barcodes, and grid alignment.
**experiment-dashboard:** Experiment monitoring dashboard with live readings, protocol steps, and sample tracking.
**Spatial hints:** Density bias: 1. Section padding: 48px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface lab-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

experiments, protocols, tracking

---

## Visual Direction

**Personality:** Scientific research workspace with pristine white panels and technical cyan accents. Lab notebook entries with LaTeX formula blocks and image embeds. Protocol steps numbered with reagent lists, equipment chips, and safety badges. Sample trackers with barcode displays and expiry countdowns. Instrument scheduling grids show bookings across lab equipment. Dataset cards with schema trees and quality indicators. Think Benchling meets Jupyter. Lucide icons. Precise.

## Pattern Reference

### kanban-board

Drag-and-drop column board with swimlanes, card previews, and column limits for visual project workflow management.

**Visual brief:** A horizontally scrollable board surface set against a muted recessed background (subtle inset shadow conveying depth). Each column is a tall, narrow d-surface card (280px wide, full height minus padding) with a slightly rounded top edge and a thin top-border accent matching the column's status color (e.g., blue for In Progress, amber for Review, green for Done). Column headers sit at the top of each column: bold title text left-aligned, a count badge (pill-shaped, muted background) showing the number of cards, and beneath the title a thin 2px-tall progress bar representing WIP limit usage — the bar fills with accent color and turns red when the limit is exceeded. Cards within each column are compact surface tiles (full column width minus 16px padding) stacked vertically with 8px gaps. Each card has a 4px left-edge color accent strip indicating priority or status (red for urgent, amber for medium, green for low, gray for none). Card content shows a bold title (14px, single line, truncated), a muted description preview (12px, 2 lines max, text-muted), and a bottom row with assignee avatar (20px circle), due date chip, and tag pills. When dragging, the DragOverlay renders the card with a 2-degree clockwise rotation, an elevated box-shadow (0 12px 24px rgba(0,0,0,0.15)), and 85% opacity, clearly communicating the 'in flight' state. Drop targets highlight with a dashed border (2px, accent color) and a subtle pulsing background tint. Empty columns display a centered dashed-border rectangle (border-radius 8px) with muted instructional text ('Drag a card here or click + to add') and a plus icon. The AddCardButton sits at the bottom of each column as a ghost-style button with a plus icon, full column width, with a hover state that shows a subtle background fill.

**Components:** Board, Column, ColumnHeader, Card, CardPreview, DragOverlay, AddCardButton, ColumnLimit

**Composition:**
```
Card = Card(d-surface, d-interactive, draggable) > [PriorityAccent + Title + Description? + MetaRow(Avatar + DueDate? + Tags?)]
Column = Column(d-surface, flex-col, fixed-width) > [ColumnHeader + CardList(scrollable) + AddCardButton]
DragOverlay = Portal(floating) > Card(rotated, elevated, ghost)
KanbanBoard = Board(d-section, horizontal-scroll, full-height) > Column*
ColumnHeader = Header(d-annotation) > [Title + CountBadge + WIPLimitBar?]
AddCardButton = Button(d-interactive, ghost, full-width) > [PlusIcon + Label]
```

**Layout slots:**
  **Layout guidance:**
  - note: The board scrolls horizontally. Each column is a fixed-width vertical container. Cards within columns scroll vertically when they overflow the column height.
  - container: full-bleed-scroll
  - column_width: Columns should be 280px wide in standard preset, 220px in compact. Use flex-shrink-0 to prevent columns from collapsing.
  - drag_overlay: During drag, the original card position shows a placeholder (dashed border, same dimensions, muted background). The floating drag overlay follows the cursor with transform: rotate(2deg) and elevated shadow.
  - swimlane_rows: In grouped preset, swimlane rows are separated by a 1px hairline divider with a row header on the left showing the group label (assignee name, priority level, etc.).
  - wip_limit_bar: The thin progress bar beneath column headers uses a 2px height. Fill color matches column accent when under limit, switches to var(--d-error) when at or over limit. Include a title attribute showing 'N / M' count.
  - card_interaction: Cards MUST have cursor: grab (cursor: grabbing when dragging). Each card uses d-surface with data-interactive for hover elevation change.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-grab | scale(1.02) + cursor change, 100ms ease-out |
| card-hover | translateY(-1px) + box-shadow elevation increase, 150ms ease-out |
| badge-update | count badge scales 1.0→1.2→1.0, 200ms ease-out on count change |
| card-add | New card scales from 0.95 to 1.0 + fade in, 200ms ease-out |
| card-move | Card animates from source position to target position, 250ms spring(1, 80, 10) |
| card-remove | Card scales to 0.95 + fade out, 150ms ease-in, then gap closes with 200ms ease-out |
| column-reorder | Columns slide to new positions with 300ms ease-in-out |
| drop-zone-pulse | Active drop target background pulses between transparent and accent-tinted, 1s ease-in-out infinite |
| wip-limit-pulse | When column is at WIP limit, the progress bar pulses opacity 0.7→1.0→0.7, 2s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Board collapses to a single-column stack view. Each column becomes a collapsible accordion section with the column header as the trigger. Cards render full-width. Drag-and-drop is replaced with a 'Move to...' action menu accessible via long-press or card overflow menu. AddCardButton becomes a floating action button (FAB) anchored to bottom-right.
- **Tablet (640-1024px):** Board scrolls horizontally with columns at 260px width. Touch drag-and-drop enabled with a long-press (300ms) to initiate. Two columns visible at a time with smooth horizontal scroll snap. Column headers become sticky at the top during vertical card scroll.
- **Desktop (>1024px):** Full horizontal board with 280px columns. Mouse drag-and-drop with immediate grab. 3-5 columns visible depending on viewport width. Keyboard shortcuts fully enabled. Hover states on all interactive elements. Optional column collapse/expand via double-click on header.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: cycle through columns and cards in reading order; Arrow Left/Right: move focus between columns; Arrow Up/Down: move focus between cards within a column; Space: pick up focused card for keyboard drag; Arrow keys (while dragging): move card between columns or positions; Enter: drop card at current position / open card detail; Escape: cancel drag operation; N: create new card in focused column; Delete: archive focused card (with confirmation)
- Announcements: Card {title} moved from {source column} to {target column}; Card {title} created in {column}; Column {name} has reached its work-in-progress limit


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


### detail-header

Page header for detail views with title, metadata, status, and action buttons

**Visual brief:** Page header area with a breadcrumb navigation trail at the top, followed by a title row containing a large heading on the left and action buttons on the right. Below the title, a subtitle or description paragraph in muted text. An optional status badge appears inline next to the title. The profile preset adds an avatar to the left of the title. All elements are separated by consistent vertical spacing with a subtle bottom border below the entire header block.

**Components:** Avatar, Badge, Button, Breadcrumb

**Composition:**
```
TitleRow = Row(space-between) > [Title(heading2) + StatusBadge?(d-annotation) + ActionButtons(d-interactive)]
DetailHeader = Section(d-section, flex-col, gap-4, border-bottom) > [Breadcrumb + TitleRow + Subtitle?(text-muted)]
ActionButtons = Row(gap-2) > Button(variant: ghost)[]
ProfileHeader = Row(d-section, gap-6) > [Avatar(large, 96px) + InfoColumn > [Name(heading2) + Title(text-muted) + Bio + StatsRow + ActionButtons]]
```

**Layout slots:**
- `title`: Page heading with _heading2
- `status`: Badge showing current status (active, draft, archived)
- `actions`: Action buttons group: edit, delete, share with _flex _gap2
- `subtitle`: Description text with _bodysm _fgmuted
- `title-row`: Horizontal row with title on left and action buttons on right: _flex _row _jcsb _aic
- `breadcrumb`: Navigation breadcrumb trail with BreadcrumbItem links
**Responsive:**
- **Mobile (<640px):** Breadcrumb collapses to back arrow with parent name. Action buttons move below the title and stack full-width. Status badge wraps below the title on its own line.
- **Tablet (640-1024px):** Standard layout. Actions remain inline right of title. Breadcrumb shows full path.
- **Desktop (>1024px):** Full header with all elements comfortably positioned. Generous whitespace above and below.


### protocol-step

A lab-protocol step card rendering a numbered procedural step with action description, reagent list with volumes and concentrations, required equipment chips, timing controls, safety indicators, and completion confirmation checkbox.

**Visual brief:** A lab-notebook-inspired step card rendered as a d-surface with a thin left border in primary accent color. At the top-left corner, a StepNumber renders as a 40px circular badge with the number in bold text ('3') against a filled primary-color background. To its right, the StepAction contains the procedural instruction in text-base semibold followed by an optional description in body-muted text (e.g., 'Add lysis buffer and vortex for 30 seconds'). Below the header, the ReagentList renders as a bordered sub-panel with a d-annotation caption 'Reagents'. Each ReagentRow contains: reagent name (semibold), volume (mono-data, e.g., '50 µL'), concentration (mono-data muted, e.g., '10 mM'), and a small source-chip indicating which stock or lot (e.g., 'Lot #A2394'). Adjacent to ReagentList, EquipmentChips render as pill-shaped tags with tiny iconography (vortex mixer, centrifuge, pipette, heat block, incubator) showing the instruments required. SafetyBadges render as a horizontal row of color-coded pills with warning icons: amber for PPE requirements (gloves, eye protection), red for hazardous materials (flammable, corrosive, toxic), blue for specialized handling (fume hood, biosafety cabinet). For timed steps, the TimerDisplay sits prominently as a large digital-style countdown card (text-3xl mono-data) with start/pause/reset icon buttons. The timer background shifts from neutral to amber when <30s remain and pulses when time expires. A NotesBox sits below as a small textarea for scientist observations. At the bottom-right, the CompletionCheck is a large 24px checkbox labeled 'Mark complete' that, when checked, locks the card in a completed state (subtle green tint, strikethrough action text) and records a timestamp chip showing who completed it and when. Completed cards show a thin success-colored left border replacing the primary border.

**Components:** StepNumber, StepAction, ReagentList, ReagentRow, EquipmentChip, TimerDisplay, SafetyBadge, CompletionCheck, NotesBox

**Composition:**
```
ReagentRow = Row(d-row, data-reagent) > [ReagentName + VolumeCell + ConcentrationCell + LotChip]
StepHeader = Row(d-row) > [StepNumber + StepAction]
StepNumber = Badge(d-annotation, circular, data-step) > [NumberOrCheck]
ReagentList = Panel(d-annotation, bordered) > [ListCaption + ReagentRow[]]
SafetyBadge = Badge(d-annotation, data-safety-level) > [WarningIcon + HazardLabel]
ProtocolStep = Surface(d-surface, border-left-accent) > [StepHeader + ReagentList + EquipmentChip[] + SafetyBadge[] + TimerDisplay? + NotesBox? + CompletionCheck]
TimerDisplay = Card(d-surface, data-timer-state) > [DigitReadout + StartButton + PauseButton + ResetButton]
EquipmentChip = Chip(d-annotation, data-equipment) > [EquipmentIcon + EquipmentLabel]
CompletionCheck = Control(d-control, data-completion) > [Checkbox + CompletionLabel + TimestampChip?]
```

**Layout slots:**
  **Layout guidance:**
  - note: Protocol steps are safety-critical scientific procedures. Every reagent MUST show volume AND concentration. Every hazard MUST have a visible SafetyBadge. Completion MUST be timestamped.
  - container: d-surface card with colored left border
  - step_number: StepNumber uses d-annotation[data-step-number] as a 40px filled circle with bold number. Completed steps show checkmark instead of number. Primary color filled.
  - timer_states: TimerDisplay transitions through states: idle (neutral), running (primary), warning (<30s amber), expired (red pulse). Always shows mm:ss format with tabular-nums.
  - safety_badges: SafetyBadge colors MUST map consistently: amber=PPE, red=hazard, blue=specialized-handling. Each badge includes icon+label, never icon-only (unparseable without label).
  - reagent_format: ReagentRow uses mono-data tabular-nums for all volumes and concentrations. Format: 'Reagent Name | 50 µL | 10 mM | Lot #A2394'. Never abbreviate units.
  - completion_lock: CompletionCheck is single-direction (checking locks the step). Undoing completion requires supervisor password to maintain protocol integrity and audit trail.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| chip-hover | scale 1.03 + shadow 120ms ease-out |
| timer-tick | digit flip 80ms ease-in-out per second |
| check-toggle | checkbox fill + checkmark-draw 200ms ease-out |
| notes-expand | height auto + fade 200ms ease-out |
| timer-warning | background color pulse to amber 400ms ease-in-out when <30s |
| completion-lock | card background tint to success + border color shift 300ms ease-out |
| timer-pulse | expired timer border red-glow 800ms ease-in-out infinite |
| running-shimmer | timer digits subtle brightness pulse 2s ease-in-out infinite while running |

**Responsive:**
- **Mobile (<640px):** Step card expands to full-width. ReagentList collapses into expandable accordion. EquipmentChips wrap to multiple lines. TimerDisplay grows to hero size for visibility at the bench where scientists may be gloved and distant.
- **Tablet (640-1024px):** Full standard layout. ReagentList and EquipmentChips display side-by-side in two columns if space permits.

**Accessibility:**
- Role: `region`
- Keyboard: Space: toggle timer start/pause; R: reset timer; C: mark step complete; N: focus notes box; Tab: cycle through reagents and equipment chips
- Announcements: Step {number}: {action}; Required safety: {badges}; Timer {started|paused|completed} at {time}; Step {number} marked complete by {user}


### timeline

Chronological sequence of events with dates, descriptions, and optional media.

**Visual brief:** Vertical sequence of timeline entries connected by a thin vertical line. Each entry has a small circle dot on the line, a date or timestamp label, an event title in medium weight, and a description paragraph. Optional media (images, icons) can appear beside entries. The compact preset reduces spacing and hides descriptions, showing only date and title. The horizontal preset arranges entries left-to-right along a horizontal line with dates below and content above. Milestone entries may have a larger dot or distinct icon.

**Components:** Card, Badge, icon, Text

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Vertical timeline only. Line on the left edge with content to the right. Dates above entries. Compact spacing.
- **Tablet (640-1024px):** Standard vertical timeline with comfortable spacing. Content beside the timeline dots.
- **Desktop (>1024px):** Full vertical or horizontal timeline. Entries alternate left and right of the center line (vertical) or spread evenly (horizontal).


---

## Pages

### experiments (/experiments)

Layout: kanban-board → data-table

### experiment-detail (/experiments/:id)

Layout: detail-header → protocol-step → timeline
