# Section: maintenance-center

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** maintenance-center
**Description:** Maintenance ticket management with Kanban board view, ticket details, and ticket creation for property repairs.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (board, ticket, create)
**Key patterns:** maintenance-board [moderate], maintenance-ticket [moderate], form [complex]
**CSS classes:** `.estate-nav`, `.estate-card`, `.estate-stat`
**Density:** comfortable
**Voice:** Professional and reassuring.

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
| `--d-text` | `#1A1A1F` | Body text, headings, primary content |
| `--d-accent` | `#B8860B` |  |
| `--d-border` | `#E8E4DC` | Dividers, card borders, separators |
| `--d-primary` | `#1E3A5F` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#166534` | Secondary brand color, supporting elements |
| `--d-bg` | `#FDFBF7` | Page canvas / base layer |
| `--d-text-muted` | `#6B6860` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#9A7209` |  |
| `--d-primary-hover` | `#162D4A` | Hover state for primary elements |
| `--d-surface-raised` | `#F7F5F0` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#14532D` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.estate-nav` | Sidebar navigation with subtle surface background. Professional icon + label layout. |
| `.estate-card` | Surface background with subtle warm-tinted border, 6px radius, soft shadow on hover. Professional card styling. |
| `.estate-stat` | Large number display (heading2 size) with small label underneath. Optional trend indicator (up/down arrow with percentage). |
| `.estate-badge` | Status badge with semantic color background. Consistent status styling across patterns. |
| `.estate-input` | Clean border with warm undertone, navy focus ring. Professional form styling. |
| `.estate-table` | Striped rows with warm alternating background, sticky header, row hover highlight. Optimized for financial data. |
| `.estate-canvas` | Warm off-white background (#FDFBF7 light, #1A1A1F dark). Clean professional foundation for data-heavy interfaces. |
| `.estate-divider` | Hairline separator with warm border tone (#E8E4DC light, #3A3A42 dark). |
| `.estate-fade-up` | Entrance animation: opacity 0 to 1, translateY 8px to 0, 180ms ease-out. Professional, not playful. |
| `.estate-progress` | Progress bar with semantic fill color. Used for occupancy rates, collection rates, etc. |
| `.estate-card-metric` | Metric card with colored left border accent based on metric type. Large number, small label, optional trend indicator. |
| `.estate-status-vacant` | Red status indicator for vacant units, overdue payments, urgent tickets. |
| `.estate-status-pending` | Amber status indicator for pending payments, upcoming due dates, open tickets. |
| `.estate-status-occupied` | Green status indicator for occupied units, paid rent, resolved tickets. |

**Preferred:** maintenance-board
**Compositions:** **auth:** Centered auth forms with professional card styling.
**financial:** Financial dashboards and reports. Data-dense with tables, charts, and metrics.
**marketing:** Marketing pages with top nav and footer. Professional SaaS landing page styling.
**tenant-portal:** Tenant self-service portal with top navigation. Simplified interface for payments and maintenance.
**owner-dashboard:** Property owner dashboard with sidebar navigation. Portfolio metrics, property grid, financial summaries.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface estate-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

kanban, drag-drop, file-upload, notifications

---

## Visual Direction

**Personality:** Professional, trust-building property management portal with a warm light theme. Clean card-based layouts for properties and units with status badges (occupied, vacant, maintenance). Financial views use conservative chart styles — bar charts for rent roll, line charts for P&L trends. Tenant directory emphasizes contact info and lease status. Maintenance board uses a kanban layout with priority coloring. The tenant portal feels welcoming and self-service. Think Buildium meets a modern banking app — serious about money, friendly about people.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### maintenance-board

Kanban-style maintenance ticket board with drag-and-drop between columns: new, assigned, in-progress, pending-parts, completed, closed.

**Visual brief:** Kanban board with horizontal columns for each maintenance status: New, Assigned, In Progress, Pending Parts, Completed, Closed. Each column has a header with the status name and a ticket count badge. Ticket cards within columns show a title, priority badge (urgent/high/normal/low), property name, and assignee avatar. Cards are draggable between columns. A header bar above the board contains the title, a search input, and an 'Add Ticket' button. The list preset displays tickets as a flat filtered list. Mini preset shows a compact status summary with counts per column.

**Components:** Button, icon, Badge, Select

**Composition:**
```
Column = Panel(d-surface, flex-col) > [ColumnHeader > [StatusName + CountBadge(d-annotation)] + TicketCard(d-surface, draggable)[]]
Header = Row(d-control, space-between) > [Title + SearchInput(d-control) + AddTicketButton(d-interactive)]
TicketCard = Card(d-surface, hoverable) > [Title + PriorityBadge(d-annotation) + PropertyName(text-muted) + AssigneeAvatar?]
KanbanColumns = Row(d-data, horizontal-scroll) > Column[]
MaintenanceBoard = Container(d-section, flex-col) > [Header + FilterBar(d-control) + KanbanColumns]
```

**Layout slots:**
- `header`: Title, filters, view toggle
- `columns`: Kanban columns with ticket cards
- `filters`: Property, priority, category, date range
- `summary`: Open count, avg resolution time
**Responsive:**
- **Mobile (<640px):** Columns displayed one at a time with horizontal swipe or a dropdown status selector. Cards take full width. Drag-and-drop replaced by status-change action buttons.
- **Tablet (640-1024px):** Three visible columns with horizontal scroll for the rest. Cards at comfortable size for touch.
- **Desktop (>1024px):** All columns visible in horizontal scroll or fixed layout. Drag-and-drop fully functional. Cards show all metadata.


### maintenance-ticket

Repair request form and display. Supports create (tenant-facing), view, and edit modes with photo upload and status tracking.

**Visual brief:** Ticket detail view with a header showing ticket ID, title, status badge (color-coded), and priority badge. The details section displays property, unit, category (plumbing, electrical, etc.), reporter name, and description text. A photo section shows uploaded images in a small gallery grid. A status timeline tracks the ticket lifecycle with timestamped entries (submitted, assigned, in-progress, completed). The create preset shows a form with title, category select, priority select, description textarea, and photo upload area. Action buttons include Assign, Update Status, and Close.

**Components:** Button, icon, Badge, Input, Select, Textarea

**Composition:**
```
Header = Row(d-surface) > [TicketID(mono-data) + Title + StatusBadge(d-annotation, color-coded) + PriorityBadge(d-annotation)]
Actions = Row(d-interactive) > [AssignButton + UpdateStatusButton + CloseButton(variant: ghost)]
Details = Section(d-data) > [Category + Property + Reporter + Description]
PhotoGallery = Grid(d-data) > Thumbnail(clickable)[]
StatusTimeline = Track(d-data, vertical) > TimelineEntry(timestamped)[]
MaintenanceTicket = Container(d-section, flex-col, gap-4) > [Header + Details + PhotoGallery? + StatusTimeline + Assignment? + Actions]
```

**Layout slots:**
- `header`: Ticket ID, status badge
- `photos`: Attached images
- `actions`: Update status, assign, close
- `details`: Category, priority, description
- `timeline`: Status updates, comments
- `assignment`: Assigned vendor/staff
- `resolution`: Resolution notes, completion date
**Responsive:**
- **Mobile (<640px):** Single-column stacked layout. Photo gallery uses horizontal scroll. Timeline is vertical. Action buttons are full-width at the bottom.
- **Tablet (640-1024px):** Standard layout with comfortable spacing. Photo gallery shows 2-3 thumbnails per row.
- **Desktop (>1024px):** Full layout with details and timeline side by side. Photo gallery in a grid. All actions visible in a toolbar.


### form

Structured form with labeled field groups, validation states, and action buttons

**Visual brief:** Well-organized form with clear field grouping under section headings. Each section has a heading in heading4 weight and a muted description line, followed by form fields arranged in a one- or two-column grid. Labels sit above their respective fields (stacked, never side-by-side) in small medium-weight text. Input fields use consistent height (~40px), rounded corners (r2), and border styling that brightens on focus with a primary-color ring. Select dropdowns match input styling with a custom chevron. Textareas have a taller minimum height (6rem). Required fields show a small asterisk. Validation errors display below the field in small destructive-red text. The form is constrained to 640px max-width for readability. Action buttons (Save, Cancel) sit at the bottom right, separated by a top border or spacing from the form fields.

**Components:** Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup

**Composition:**
```
Form = Container(d-section, flex-col, gap-6, max-width) > [FormSection[] + ActionButtons]
Field = Stack(flex-col) > [Label(d-control, font-medium) + Input(d-control) + ValidationError?(d-annotation, text-destructive)]
FieldGroup = Grid > Field[]
FormSection = Card(d-surface) > [SectionTitle(heading4) + SectionDescription?(text-muted) + FieldGroup(d-control, grid: 1/2-col)]
ActionButtons = Row(d-interactive, gap-2) > [SaveButton(variant: primary) + CancelButton(variant: ghost)]
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
| error-shake | translateX(-4px, 4px, -2px, 2px, 0) 300ms ease-out on validation error |
| field-focus | border-color transition 150ms ease-out |
| button-press | scale(0.97) 100ms ease-out |
| success-submit | fade-out form + fade-in success message 300ms ease-out |
| validation-error | fade + slideDown 200ms ease-out for error message |

**Responsive:**
- **Mobile (<640px):** Single column for all field groups. Fields go full-width. Action buttons stack vertically at full width, primary on top. Section headings go full-width above fields. Padding reduces to p3.
- **Tablet (640-1024px):** Two-column field grid activates for shorter fields (name, email). Textareas span full width. Action buttons stay horizontal, right-aligned.
- **Desktop (>1024px):** Full two-column grid for field groups. Settings preset shows section label column on the left, fields on the right. Generous p4 spacing. Inline validation visible without layout shift.

**Accessibility:**
- Role: `form`
- Keyboard: Tab navigates between fields; Shift+Tab navigates backwards between fields; Enter submits when focus is on submit button; Escape cancels or closes modal forms; Arrow keys navigate within radio groups; Space toggles checkboxes and switches
- Announcements: Validation errors announced on field blur; Required field indicator announced on focus; Success confirmation announced on submit; Field group label announced on section entry
- Focus: First invalid field receives focus on failed validation. On successful submit, focus moves to success message or next logical action.


---

## Pages

### board (/maintenance)

Layout: board → maintenance-board

### ticket (/maintenance/:id)

Layout: maintenance-ticket

### create (/maintenance-center/create)

Layout: form
