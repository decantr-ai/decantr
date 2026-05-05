# Section: crm-meetings

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** crm-meetings
**Description:** Meeting management interface with calendar views, AI-generated recaps, transcription, and automatic action item extraction linked to CRM contacts and deals.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (meetings, meeting-detail)
**Key patterns:** calendar-view [complex], detail-header [moderate], timeline [moderate]
**CSS classes:** `.glass-card`, `.glass-panel`, `.glass-header`
**Density:** comfortable
**Voice:** Confident and helpful.

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
| `--d-accent` | `#4ade80` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.glass-card` | Individual glass card element. |
| `.glass-panel` | Frosted panel with blur(20px), 5% white background, subtle border. |
| `.glass-header` | Glass hero section with layered blur panels. |
| `.glass-fade-up` | Entrance animation: fade + translateY(20px) over 0.5s. |
| `.glass-overlay` | Modal overlay with heavy blur. |
| `.glass-backdrop` | Dark gradient background with subtle noise texture. |

**Spatial hints:** Density bias: none. Section padding: 80px. Card wrapping: glass.


Usage: `className={css('_flex _col _gap4') + ' d-surface glassmorphism-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

meetings, ai-recap, transcription, action-items

---

## Visual Direction

**Personality:** Intelligent CRM with AI enrichment at every touch. Frosted glass panels on cool-toned dark backgrounds. Contact cards show AI-gathered insights alongside manual data. Pipeline board is the center of gravity — wide, draggable, value-weighted. Email composer has AI ghost text suggestions. Meeting recaps auto-populate with action items. Relationship graph makes hidden connections visible. Smooth transitions. Lucide icons. This CRM feels alive.

## Pattern Reference

### calendar-view

Multi-mode calendar with day, week, and month views, event creation via click-and-drag, and drag-to-reschedule functionality.

**Visual brief:** A clean, structured calendar interface built on hairline borders (1px, var(--d-border-subtle)) forming a precise grid. The NavigationBar spans the full width at the top: a left-aligned row with back/forward chevron buttons, a bold month+year title (e.g., 'April 2026' in text-lg font-semibold), and a 'Today' pill button that jumps to the current date. Right-aligned is the ViewSwitcher — a segmented control with four options (Month, Week, Day, Agenda) rendered as connected pill buttons with the active one filled with accent color and white text. Below the nav bar in month view, a day-of-week header row shows abbreviated day names (Mon, Tue, ...) in text-xs uppercase tracking-wide text-muted. The month grid itself has 5-6 rows of 7 cells each. Each DayCell has the date number in the top-left corner (text-sm), with today's date rendered inside a filled accent-color circle (24px diameter) with white text, creating a distinctive marker. Days outside the current month show muted text at 40% opacity. Events within each cell are rendered as small rounded pill chips (border-radius: 4px, height 20px) with a category-specific left color stripe (4px wide): blue for meetings, green for personal, purple for external, amber for deadlines. Event chip text is truncated with ellipsis at the cell boundary. When more than 3 events exist in a day, a '+N more' text link in text-xs text-muted appears below the visible chips, clickable to expand. In week view, time columns show alternating subtle background stripes (transparent and var(--d-bg-muted) at 30% opacity) for each hour block, with 15-minute subdivisions marked by dotted hairlines. Events are absolutely positioned rectangles spanning their time range, with rounded corners (6px), category-colored left border (3px), white/surface background, and a subtle left-edge shadow. Overlapping events are laid out side-by-side at reduced width. The current time is indicated by a horizontal red line (2px) with a small red circle (8px) on the left edge, extending across all columns. Click-and-drag event creation renders a translucent preview chip (40% opacity, accent-colored) that snaps to 15-minute increments. The EventPopover appears on click as a 320px-wide floating card with event title, time range, location, description, attendee avatars, and edit/delete actions. The optional MiniCalendar is a small (200px wide) month grid in the sidebar showing dots beneath days that have events.

**Components:** CalendarGrid, DayCell, WeekColumn, TimeSlot, EventChip, EventPopover, ViewSwitcher, NavigationBar, MiniCalendar

**Composition:**
```
DayCell = Cell(d-surface, clickable) > [DateNumber(today?: accent-circle) + EventChip*(max-3) + OverflowLink?]
WeekView = Grid(d-surface, 8-col) > [TimeGutter + WeekColumn* > TimeSlot* > EventChip*]
EventChip = Chip(d-interactive, draggable, category-colored) > [ColorStrip + Title + Time?]
MonthGrid = Grid(d-surface, 7-col) > [DayHeaderRow + DayCell*]
CalendarView = Container(d-section, flex-col, full-height) > [NavigationBar + ViewContent]
EventPopover = Popover(d-surface, floating, anchored) > [Title + CategoryDot + DateTime + Location? + Description? + Attendees? + Actions]
ViewSwitcher = SegmentedControl(d-interactive) > Segment[](Month|Week|Day|Agenda)
NavigationBar = Bar(d-surface, flex-row, sticky-top) > [PrevButton + PeriodLabel + TodayButton + NextButton + ViewSwitcher]
```

**Layout slots:**
  **Layout guidance:**
  - note: Month view uses CSS Grid with 7 columns. Week view uses 8 columns (1 for time labels + 7 for days). Day cells in month view should have min-height of 100px to accommodate event chips.
  - container: bordered-grid
  - time_grid: In week/day views, the time gutter on the left shows hour labels (text-xs, text-muted) aligned to the top of each hour row. The grid lines are hairline (1px solid var(--d-border-subtle)). Alternate hour blocks use a barely-visible background tint for scanability.
  - event_chips: Event chips use a compact pill style. Height 20px in month view, dynamic height in week/day view based on duration. Category colors are communicated via a left border strip, NOT full background fill — the chip background stays var(--d-bg-surface) or very light tint of the category color.
  - today_marker: Today's date number MUST be rendered inside a filled circle. Use a 24px width/height circle with background var(--d-accent), color white, border-radius 50%, display flex align-items-center justify-center. This is the most recognizable calendar convention — do not omit it.
  - current_time_line: A 2px-tall horizontal line in var(--d-error) red spanning the full width of the time grid, positioned at the exact current time. A small 8px filled circle sits at the left edge. This line updates its position every minute.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| chip-hover | translateY(-1px) + subtle shadow elevation, 100ms ease-out |
| today-pulse | Today's accent circle has a single subtle scale pulse (1.0→1.05→1.0) on initial render, 400ms ease-out |
| view-switch | Active segment background slides to new position, 200ms ease-out |
| view-change | Cross-fade between views with 250ms ease-in-out, content scales from 0.98 to 1.0 |
| event-create | New event chip scales from 0.9 to 1.0 + fade in, 200ms ease-out |
| popover-open | Popover scales from 0.95 to 1.0 + fade from 0 to 1, 200ms ease-out with origin at anchor point |
| month-navigate | Grid slides left/right (depending on direction) with 300ms ease-out, new month content fades in |
| drag-preview | Translucent event preview chip during drag creation pulses opacity 0.3→0.5→0.3, 1.5s ease-in-out infinite |
| current-time-line | The red current-time indicator line smoothly translates its Y position every minute (transition: top 60s linear) |

**Responsive:**
- **Mobile (<640px):** Defaults to agenda view (list). Month view simplifies to a scrollable list of weeks with horizontal swipe between weeks. Week view shows 3 days at a time with horizontal scroll. Event chips show only the color dot and truncated title. EventPopover becomes a bottom sheet. Drag-to-create is replaced with a tap-to-create flow. MiniCalendar is hidden. Navigation bar stacks: period label on top, view switcher below as icon-only tabs.
- **Tablet (640-1024px):** Month view shows full grid with event chips. Week view shows all 7 days with horizontal scroll if needed. Touch drag for event creation and rescheduling with haptic feedback. EventPopover is a centered modal on smaller tablets, anchored popover on larger ones. MiniCalendar available in a collapsible sidebar.
- **Desktop (>1024px):** Full month grid with generous cell heights (120px+). Week view shows all 7 day columns with scrollable time grid. Click-and-drag event creation. Hover previews on event chips showing time and first line of description. Keyboard shortcuts fully enabled. MiniCalendar in persistent sidebar when space allows. EventPopover anchored to click position.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: move focus between navigation, view switcher, and calendar grid; Arrow keys: navigate between days in month view, time slots in week/day view; Enter: open event detail popover or create event on empty day; Escape: close popover or cancel event creation; T: jump to today; M/W/D/A: switch to month/week/day/agenda view; Page Up/Down: navigate to previous/next month or week; Space: select/deselect date for multi-date operations
- Announcements: View changed to {month|week|day|agenda}; Navigated to {month year}; Event {title} on {date} at {time}; Event {title} moved to {new date/time}; New event created on {date}


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

### meetings (/meetings)

Layout: calendar-view

### meeting-detail (/meetings/:id)

Layout: detail-header → timeline
