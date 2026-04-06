# Section: scrim-scheduler

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** scrim-scheduler
**Description:** Auxiliary esports scheduling surface for managing scrim calendars and inspecting match detail with live scoreboards and timelines.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (scrims, match-detail)
**Key patterns:** scrim-calendar [moderate], data-table [moderate], detail-header [moderate], scoreboard-live [moderate], timeline [moderate]
**CSS classes:** `.gg-dark`, `.gg-hero`, `.gg-sidebar`, `.neon-glow`
**Density:** comfortable
**Voice:** Competitive and operational.

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
| `--d-text` | `#E8EDF5` | Body text, headings, primary content |
| `--d-border` | `#2A2A40` | Dividers, card borders, separators |
| `--d-primary` | `#60A5FA` | Brand color, key interactive, selected states |
| `--d-surface` | `#111118` | Cards, panels, containers |
| `--d-bg` | `#0A0A0F` | Page canvas / base layer |
| `--d-text-muted` | `#8888AA` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#93C5FD` | Hover state for primary elements |
| `--d-surface-raised` | `#1A1A25` | Elevated containers, modals, popovers |
| `--d-accent` | `#a855f7` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.gg-dark` | Near-black background (#0A0A0F) with subtle grid pattern. |
| `.gg-hero` | Hero with animated gradient background. |
| `.gg-sidebar` | Dark sidebar with accent-colored active states. |
| `.gg-slide-in` | Entrance: slide from left with slight bounce. |
| `.gg-neon-glow` | Neon glow effect behind hero elements. |
| `.gg-rank-badge` | Rank position with metallic gradient (gold/silver/bronze). |
| `.gg-stat-pulse` | Stats with subtle pulse animation. |
| `.gg-achievement-shine` | Achievement cards with shine animation on hover. |

**Spatial hints:** Density bias: -1. Section padding: 64px. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface gaming-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

scheduling, calendars

---

## Visual Direction

**Personality:** Professional esports team operations hub with vibrant neon-accented rosters and live scoreboards. Player form trackers show sparklines of K/D ratios, win rates, and self-reported mood indicators. Scrim calendars map team availability to opponent windows. VOD review interface with frame-by-frame annotations and drawing tools. Sponsor dashboards track activation metrics. Think Overwatch League backstage. Lucide icons. Competitive.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

## Pattern Reference

### scrim-calendar

A team scrimmage scheduling calendar showing opponent matchups, map plans, time slots, player availability, and confirmation status across weeks or months.

**Visual brief:** A week grid with days as columns and hourly time slots as rows. Each scrim appears as a colored block spanning its duration (e.g. 7pm-9pm slot). Block contains: opponent team logo in top-left, opponent name in bold, map chips row (e.g. 'Haven' 'Ascent' 'Pearl') with small map thumbnails, and an availability status indicator (Confirmed: green filled, Pending: amber striped, Cancelled: gray strikethrough). Time-slot backgrounds faintly shaded to show standard practice hours. Block color encodes importance: Official match red, Tournament orange, Practice scrim teal, Coaching session purple. Player availability dots appear along the left edge of each block showing which 5 players are confirmed (green), tentative (amber), or unavailable (red). 'Now' horizontal line overlays the current time. Month preset shows condensed event pills inside day cells.

**Components:** CalendarGrid, ScrimBlock, TeamLogo, MapChip, TimeSlot, AvailabilityStatus

**Composition:**
```
MapChip = Chip(d-annotation) > [MapThumbnail + MapName]
ScrimBlock = Block(positioned, importance-colored, d-interactive) > [Header + Maps + Status]
CalendarGrid = Grid(time-x-day) > [TimeColumn + DayColumn[]]
ScrimCalendar = Section(d-section) > [Toolbar(week-nav + view-switcher) + CalendarGrid > [TimeAxis > TimeSlot[] + DayColumns > ScrimBlock[](d-interactive) > [TeamLogo + OpponentName + MapChip[] + AvailabilityStatus + PlayerAvailabilityDots]] + NowLine]
AvailabilityStatus = Label(data-status) > [StatusDot + StatusText]
```

**Layout slots:**
- `members`: Team member cards (avatar, name, role)
  **Layout guidance:**
  - note: Calendar must support drag-to-reschedule. Scrim blocks clickable (d-interactive) for edit modal.
  - container: d-section
  - status_labels: Availability status uses text labels not color-only (Confirmed/Pending/Cancelled).
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| block-hover | elevation raise + border-highlight 150ms ease-out |
| drag-handle | cursor grab + block scale(1.02) on drag 120ms |
| block-move | position lerp 200ms ease-out |
| block-create | scale(0) to scale(1) + fade 300ms spring |
| status-change | block color transition 300ms ease-in-out |
| now-line | current time horizontal line subtle pulse 3s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Week view shrinks to single-day scrollable column. Month view becomes list preset automatically.
- **Tablet (640-1024px):** Week view retained with narrower day columns. Map chips collapse to count badge.

**Accessibility:**
- Role: `grid`
- Keyboard: Arrow keys: navigate grid cells; Enter: open scrim block detail; N: create new scrim on focused cell; Delete: remove scrim; [/]: previous/next week
- Announcements: Scrim against {opponent} on {date} at {time}, status {status}; Scrim moved to {newDate} {newTime}


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


### scoreboard-live

A live match scoreboard with team logos, real-time score, game timer, event ticker, momentum streak indicator, and viewer count for broadcast surfaces.

**Visual brief:** A horizontal scoreboard bar dominated by two team sections flanking a center timer block. Left section: Team A logo (48-72px, team-branded background tint), team tricode below logo (e.g. 'FNC' in bold monospace), large team score in very large monospace (72px broadcast, 36px detail, 24px compact). Center block: game timer counting down or up in prominent monospace, above/below it the map or round indicator (e.g. 'MAP 2 - ASCENT' or 'ROUND 14'). Right section: mirrors left with Team B. A streak indicator (small fire icon with count or momentum arrow) appears under whichever team has a winning streak, glowing in their team color. Below the main bar, a horizontal auto-scrolling event ticker shows recent plays with icons and text ('16:42 Aspas ACE' 'Derke 3K' 'Plant B'). Top-right corner has viewer count pill with live red dot and count in monospace (e.g. '142K viewers'). Team colors provide accent trim. Live indicator (pulsing red dot + 'LIVE' text) near viewer count.

**Components:** TeamLogo, TeamScore, GameTimer, EventTicker, StreakIndicator, ViewerCount

**Composition:**
```
TeamLogo = Image(team-branded, tricode-adjacent) > [LogoImg + TeamTricode(mono)]
GameTimer = Block(centered) > [MapLabel(small) + TimerDigits(mono-xl) + RoundLabel(small)]
TeamScore = Text(mono, size-varies-by-preset)
EventTicker = Marquee(horizontal, auto-scroll) > EventEntry[] > [Timestamp + EventIcon + EventText]
ViewerCount = Pill(d-annotation) > [LiveDot(pulsing) + LiveText + ViewerCount(mono)]
ScoreboardLive = Section(d-section) > [MainBar > [TeamSection(left) > [TeamLogo + TeamTricode + TeamScore(mono-xl) + StreakIndicator?] + CenterBlock > [MapLabel + GameTimer(mono-xl) + RoundLabel] + TeamSection(right) > [TeamScore(mono-xl) + TeamTricode + TeamLogo + StreakIndicator?]] + EventTicker(marquee) + ViewerCount(top-right, d-annotation) > [LiveDot + ViewerLabel(mono)]]
```

**Layout slots:**
- `members`: Team member cards (avatar, name, role)
  **Layout guidance:**
  - note: Timer must be prominent monospace, center-aligned. Team tricodes always visible as text, never logo-only.
  - container: d-section
  - live_indicator: Live state uses text 'LIVE' with pulsing dot, never just color. Viewer count formatted with K/M suffixes.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| score-change | scale(1.2) + color flash team-color 400ms spring |
| ticker-event-in | new event slide-in from right 300ms ease-out |
| map-change | full scoreboard fade-out and fade-in 500ms ease-in-out |
| timer-tick | monospace digit flip 100ms ease |
| streak-glow | streak indicator team-color glow pulse 2s ease-in-out infinite |
| ticker-scroll | marquee translate-x continuous 30s linear infinite |
| live-dot-pulse | red dot opacity 0.4 to 1.0 1s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Broadcast preset falls back to compact. Ticker scroll speed reduced. Tricodes stay visible; logos shrink.
- **Tablet (640-1024px):** Detail preset retained with slightly smaller scores. Ticker single-line truncation.

**Accessibility:**
- Role: `region`
- Keyboard: Tab: cycle through team sections and ticker; Enter: open team detail; T: pause ticker scroll
- Announcements: Score update: {teamA} {scoreA}, {teamB} {scoreB}; Event: {event} at {time}; Viewer count {count}


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

### scrims (/scrims)

Layout: scrim-calendar → data-table

### match-detail (/scrims/:id)

Layout: detail-header → scoreboard-live → timeline
