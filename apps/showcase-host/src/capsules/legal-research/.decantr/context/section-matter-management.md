# Section: matter-management

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** matter-management
**Description:** Auxiliary matter management surface for tracking legal matters across lifecycle stages, inspecting matter detail with activity and billing context.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (matters, matter-detail)
**Key patterns:** data-table [moderate], kanban-board [complex], matter-card [moderate], activity-feed, timeline [moderate]
**CSS classes:** `.counsel-page`, `.counsel-seal`, `.counsel-header`, `.mono-data`
**Density:** comfortable
**Voice:** Formal and precise.

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
| `--d-text` | `#1C1917` | Body text, headings, primary content |
| `--d-accent` | `#991B1B` |  |
| `--d-border` | `#D6CFC0` | Dividers, card borders, separators |
| `--d-primary` | `#1E3A5F` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#7F1D1D` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAF7F2` | Page canvas / base layer |
| `--d-text-muted` | `#6B6054` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#7F1D1D` |  |
| `--d-primary-hover` | `#14284A` | Hover state for primary elements |
| `--d-surface-raised` | `#F4F0E8` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#991B1B` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.counsel-page` | Warm cream document page (#FAF7F2) with generous margins and serif body text. Document-inspired foundation. |
| `.counsel-seal` | Official seal with ribbon embellishment in navy and oxblood. Authority and certification mark. |
| `.counsel-header` | Georgia or Garamond serif heading with deep navy color. Formal section and page headers. |
| `.counsel-margin` | Annotation margin area with dashed divider for notes and references. Legal pad aesthetic. |
| `.counsel-divider` | Thin horizontal rule with warm border tone for clean section separation. |
| `.counsel-oxblood` | Deep oxblood red accent elements for emphasis, warnings, and critical status indicators. |
| `.counsel-citation` | Indented citation blocks with left border accent and italic serif type. Legal reference styling. |
| `.counsel-highlight` | Subtle highlight on key text using warm cream background tint. Marks important passages. |

**Compositions:** **document:** Legal document viewer with serif body, citation styling, and annotation margins.
**marketing:** Law firm marketing page with authoritative serif headlines and seal branding.
**client-portal:** Client portal with case status, document access, and secure messaging.
**case-dashboard:** Legal case dashboard with matter listings, docket calendar, and client directory.
**Spatial hints:** Density bias: none. Section padding: 72px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface counsel-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

matters, billing-tracking

---

## Visual Direction

**Personality:** Authoritative legal research workspace with warm cream backgrounds and deep navy accents. Serif body typography with monospace case citations. Citation graphs visualize case law networks showing which decisions cite which. Contract diffs reveal redlining with author attribution in margins. Matter cards track billable hours and deadlines with urgency indicators. Lucide icons. Scholarly.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

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


### matter-card

A legal matter summary card showing client, status, budget burn, key deadlines, assignees, and outstanding tasks for law firm pipeline management.

**Visual brief:** A rectangular card with matter number shown small and monospace at top-left (e.g. 'M-2026-0147') and matter title in bold sans-serif below. Client name in smaller muted text beneath title. Top-right corner holds a status badge pill with semantic colors (Active: blue, Pending: amber, Closed: gray, Billing: purple). Middle section shows a horizontal budget bar with label 'Budget' on left, spent amount and total right-aligned in monospace (e.g. '$47,320 / $80,000'). Bar fill color transitions green to amber to red as utilization crosses 70% and 90% thresholds. Below budget bar: next deadline chip with calendar icon, deadline label, and urgency color (red if <7 days, amber if <30). Bottom-right shows stacked overlapping assignee avatar circles (up to 4 visible, +N indicator if more). Bottom-left shows outstanding task count badge (e.g. '3 open tasks'). Kanban preset adds a colored left border matching status, and a small drag-handle icon at top.

**Components:** MatterTitle, ClientInfo, StatusBadge, BudgetBar, DeadlineChip, AssigneeAvatars

**Composition:**
```
BudgetBar = Bar(horizontal, threshold-colored) > [Label + Fill + SpentLabel(mono) + TotalLabel(mono)]
MatterCard = Card(d-surface, data-interactive) > [Header > [MatterTitle > [MatterNumber(mono) + MatterTitle] + StatusBadge] + ClientInfo + BudgetBar + DeadlineChip + Footer > [TaskCount + AssigneeAvatars]]
MatterTitle = Stack > [MatterNumber(mono-xs) + TitleText(bold)]
StatusBadge = Pill(d-annotation, data-status) > [StatusDot + StatusText]
DeadlineChip = Chip(d-annotation, urgency-colored) > [CalendarIcon + DeadlineLabel + DaysRemaining]
AssigneeAvatars = Stack(overlapping) > Avatar[] + OverflowCounter?
```

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)
  **Layout guidance:**
  - note: Card is clickable (d-interactive). Budget numbers in monospace. Status badge always includes status word text, never color-only.
  - container: d-surface
  - deadline_urgency: Deadline chip color escalates automatically: red <7 days, amber <30 days, neutral otherwise.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-hover | elevation raise + border-highlight 150ms ease-out |
| avatar-hover | avatar un-stack + name tooltip 200ms ease |
| budget-update | bar fill width interpolate 600ms ease-out |
| status-change | badge color crossfade 300ms ease-in-out |
| overdue-pulse | deadline chip background pulse when overdue 2s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Card stacks vertically with assignees moving below task count. Compact preset auto-selected.
- **Tablet (640-1024px):** Standard preset retained. Assignee stack limited to 3 visible.

**Accessibility:**
- Role: `article`
- Keyboard: Tab: focus card; Enter: open matter detail; Space: toggle matter selection (in list views)
- Announcements: Matter {number}: {title} for {client}, status {status}; Budget {spent} of {total}, {percent} utilized; Next deadline {date}, {days} days remaining


### activity-feed

Chronological list of activity events with avatars, timestamps, and action descriptions

**Visual brief:** Vertical timeline of activity events grouped by date. Each date group starts with a muted, small-text date header. Individual feed items are horizontal rows: a circular avatar (with fallback initials) on the left, then a content block with the user name in medium-weight text followed by the action description in normal weight, and a relative timestamp (e.g. '2h ago') in small muted text right-aligned or below. Items are separated by subtle dividers or spacing. The compact preset drops avatars and uses small type-indicator icons instead. The detailed preset wraps each item in a bordered card with attachment previews and action buttons (reply, like).

**Components:** Avatar, Badge, Button

**Composition:**
```
FeedItem = Row(d-data-row, hoverable) > [Avatar(fallback-initials) + Content(flex-col) > [UserName(font-medium) + ActionText] + Timestamp(mono-data, text-xs, text-muted)]
DateGroup = Section > [DateHeader(d-annotation, text-muted) + FeedItem[]]
ActivityFeed = Container(d-data, flex-col, full-width) > [DateGroup[] + LoadMore?(d-interactive)]
```

**Layout slots:**
- `avatar`: User Avatar with fallback initials
- `content`: Action text with user name (_fontmedium) and description
- `feed-item`: Single activity row: _flex _row _gap3 _items[start]
- `load-more`: Button at bottom to load older activities
- `timestamp`: Relative time label with _textsm _fgmuted
- `date-header`: Date group separator with _textsm _fgmuted _fontmedium
  **Layout guidance:**
  - grouping: Group events by date. Date header: d-label with accent left-border. Today/Yesterday labels, then ISO dates.
  - empty_state: Encouraging: 'No activity yet. Publish your first item to see it here.'
  - event_treatment: Each event row: small colored dot (8px, color by event type) + timestamp (mono-data, text-xs) + description. Hover: subtle bg highlight.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Feed item rows highlight on hover with subtle background transition over 150ms. Action buttons in detailed preset scale on hover. |
| transitions | New activity items slide in from the top with 300ms ease-out translateY(-10px) to translateY(0) plus opacity 0 to 1. Staggered by 80ms per item when multiple arrive. Load-more items fade in from below. |

**Responsive:**
- **Mobile (<640px):** Full-width feed. Avatar size reduces to 32px. Timestamp moves below the content text instead of right-aligned. Detailed preset card actions stack vertically. Load-more button goes full-width.
- **Tablet (640-1024px):** Standard layout with avatars at 36px. Timestamp stays inline right-aligned. Comfortable spacing with gap3.
- **Desktop (>1024px):** Full layout with 40px avatars. Generous spacing. Detailed preset shows attachment previews inline. Actions row is fully horizontal.


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

### matters (/matters)

Layout: data-table → kanban-board

### matter-detail (/matters/:id)

Layout: matter-card → activity-feed → timeline
