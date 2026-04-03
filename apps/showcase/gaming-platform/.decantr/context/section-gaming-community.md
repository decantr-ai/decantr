# Section: gaming-community

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** gaming-community
**Description:** Guild hub, news feed, hall of fame, and member profiles for social gaming communities

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 4 (main, news, hall-of-fame, member-profile)
**Key patterns:** hero, kpi-grid, activity-feed, filter-bar [moderate], post-list [moderate], stats-bar, leaderboard [moderate], timeline [moderate], detail-header [moderate]
**CSS classes:** `.gg-dark`, `.gg-hero`, `.gg-sidebar`, `.neon-glow`
**Density:** comfortable
**Voice:** Energetic and direct.

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

guild-state, achievements, realtime-data

---

## Visual Direction

**Personality:** High-energy gaming hub with bold, immersive visuals. Dark backgrounds with vibrant neon accents (electric blue, hot pink, lime green). Leaderboard tables use rank-colored highlights. Profile cards show achievement badges and stat bars. Game catalog uses large cover-art cards with hover-zoom effects. Competitive elements (rankings, win rates) are front and center. The vibe is Discord meets Steam — social, loud, and unapologetically gamer.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

## Pattern Reference

### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Visual brief:** Full-width section dominating the viewport with a bold, large-scale headline centered or left-aligned depending on preset. Generous vertical padding (4-6rem top/bottom) creates breathing room. Subtext sits beneath the headline in muted, lighter-weight type with relaxed line-height. One or two CTA buttons are arranged horizontally with equal height — the primary filled, the secondary ghost-outlined. Optional media (illustration, screenshot, or ambient gradient) appears below or beside the content. Brand preset fills the entire viewport height with decorative floating orbs in the background. Split preset uses a two-column grid with content on one side and media on the other.

**Components:** Button, icon

**Layout slots:**
- `media`: Optional image, illustration, or chart component
- `headline`: Primary heading, typically h1 with _heading1
- `cta-group`: Horizontal Button group with _flex _gap3
- `description`: Supporting paragraph with _body _muted
  **Layout guidance:**
  - note: Hero sections should NOT wrap content in d-surface cards. The hero IS the section. Use d-section for spacing.
  - subtitle: Subtitle line-height should be 1.6-1.8. Use text-muted color, smaller font than heading.
  - container: none
  - background: Hero sections should have a subtle radial or mesh gradient background using the theme palette — not a flat color. Use the primary and accent colors at very low opacity (5-10%) to create depth. Example: radial-gradient(ellipse at top center, rgba(var(--d-accent-rgb), 0.08) 0%, transparent 60%), or a soft gradient from primary to transparent. The gradient should fade to var(--d-bg) at the edges so it blends seamlessly with the page.
  - cta_sizing: Primary and secondary CTAs should have equal padding and height. Primary is filled (d-interactive[data-variant=primary]), secondary is ghost (d-interactive[data-variant=ghost]).
  - ambient_glow: For themes with neon/glow personality, add a soft ambient glow behind the hero heading or CTA area. Use a blurred pseudo-element or box-shadow with the accent color at 10-15% opacity, radius 200-400px. This creates a focal point without overwhelming the content.
  - announcement: If showing an announcement badge above the heading, use d-annotation with prominent styling — not a tiny muted pill. Accent border or accent background at 15% opacity.
  - visual_proof: The visual element below CTAs should be an ambient visualization (animated gradient, particle effect, blurred screenshot) — NOT a data widget wrapped in a card. If showing product data (agents, metrics), render as floating elements without card containment. Omit entirely if no meaningful visual is available.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | CTA buttons scale subtly on hover (scale 1.02). Badge shimmer on announcement pill. |
| transitions | Hero entrance: headline fades up from 20px below with 600ms ease-out. Subtext follows 150ms later. CTAs follow 300ms after subtext. Decorative orbs drift slowly with infinite CSS animation. Brand preset media floats with gentle vertical oscillation. |

**Responsive:**
- **Mobile (<640px):** Single column, stacked vertically. Headline drops to heading2 scale. CTAs stack full-width. Padding reduces to py8 px4. Media goes below content at full width. Min-height removed on brand/vision presets.
- **Tablet (640-1024px):** Content remains centered or stacked. Headline at heading1 scale. CTAs stay horizontal. Split preset still single-column. Padding at py12 px6.
- **Desktop (>1024px):** Full layout as designed — centered or split two-column. Headline at display scale for brand/vision. Generous py16-py24 padding. Split preset activates side-by-side grid. Decorative elements visible.

**Accessibility:**
- Role: `banner`
- Keyboard: Tab to CTA button; Enter activates CTA
- Announcements: Page title announced on load
- Focus: CTA button is the primary focus target


### kpi-grid

A grid of key performance indicator cards showing metrics with labels, values, and trend indicators

**Visual brief:** Row of four KPI cards in a responsive grid. Each card is a compact surface with an icon in a rounded muted-background circle at top-left, a small muted label below describing the metric, the primary value in large heading2-scale bold text, and a trend badge showing percentage change — green with an up-arrow for positive, red with a down-arrow for negative. Cards have equal height and consistent internal padding (p4). The compact preset removes icons and replaces the trend badge with an inline sparkline chart placeholder. Cards use subtle border or shadow to delineate from the background.

**Components:** Card, icon, Badge

**Composition:**
```
KPICard = Card(d-surface, padding) > [Icon(d-annotation, rounded-bg) + Label(text-muted, text-sm) + Value(heading2, mono-data) + TrendBadge(d-annotation, variant: positive|negative)]
KPIGrid = Grid(d-section, responsive: 2/4-col) > KPICard[]
```

**Layout slots:**
- `icon`: Abstract icon placeholder for each KPI category
- `trend`: Change percentage Badge with positive/negative variant
- `value`: Primary metric value with _heading2 styling
- `kpi-card`: Repeated Card with icon, label, value, and trend Badge
  **Layout guidance:**
  - grid: 4 columns desktop, 2 tablet, 1 mobile. Cards should breathe — generous padding.
  - animation: Counter animation on mount — numbers count from 0 to value over 500ms.
  - stat_treatment: Each KPI uses lum-stat-glow: filled circle in accent/primary color with number inside (dark text). Label below in text-muted. Sparkline trend to the right.
**Responsive:**
- **Mobile (<640px):** Two columns (2x2 grid). Card padding reduces to p3. Value text drops to heading3 scale. Icons shrink to 20px. Sparklines in compact preset maintain aspect ratio.
- **Tablet (640-1024px):** Two columns at default, four columns if space allows. Standard padding. Full heading2 values.
- **Desktop (>1024px):** Four-column single row. Full layout with icons, values, and trend badges. Comfortable gap4 spacing between cards.


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


### filter-bar

Search input and filter controls for filtering page content. Sits above data-consuming patterns like data-table, card-grid, and activity-feed.

**Visual brief:** Horizontal bar containing a search input with magnifying glass icon on the left, one or more dropdown Select filters in the middle (category, status, date range), and action buttons on the right (Clear All, Apply). Active filters may display as small removable badge chips below the bar. The compact preset places the search input and filters in a single tight row. The advanced preset adds an expandable panel with additional filter fields (date pickers, range sliders, checkboxes).

**Components:** Input, Select, Button, Badge, icon

**Composition:**
```
FilterBar = Row(d-control, full-width) > [SearchInput(d-control, icon: search) + FilterSelects > Select(d-control)[] + ActionButtons(d-interactive)]
ActiveFilters = Row(gap-2) > FilterChip(d-annotation, removable)[]
AdvancedFilters = Panel(d-surface, expandable) > [FilterRow > Select[] + SavedFilters > Button(variant: outline)[]]
```

**Layout slots:**
- `search`: Search Input with placeholder text
- `actions`: Action Buttons (clear, apply, etc.)
- `filters`: One or more Select dropdowns for category/status filtering
**Responsive:**
- **Mobile (<640px):** Search input takes full width on its own row. Filter selects stack below or collapse into a 'Filters' button that opens a bottom sheet. Active filter chips wrap to multiple lines.
- **Tablet (640-1024px):** Search and primary filters fit in one row. Less common filters in a collapsible section.
- **Desktop (>1024px):** All elements in a single horizontal row. Advanced filters expand inline below the bar.


### post-list

Chronological list of posts, articles, or news items with author, date, and preview.

**Visual brief:** Vertical list of post items in chronological order. Each post row shows a title link in medium-weight text, an author name, publish date in muted text, and a two-line preview excerpt. Posts are separated by subtle dividers or spacing. The compact preset reduces to title and date only, one line per item. The cards preset wraps each post in a bordered card with optional thumbnail image on the left, title, excerpt, author avatar, and date. Featured posts may have a 'Featured' badge.

**Components:** Card, Badge, Avatar, Text, icon

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Full-width post items. Cards preset uses vertical card layout with image on top. Excerpts limited to one line.
- **Tablet (640-1024px):** Standard list or card layout with comfortable spacing.
- **Desktop (>1024px):** Posts in a centered content column. Cards preset shows image on the left with text on the right.


### stats-bar

Horizontal bar of key statistics or metrics. Compact summary row.

**Visual brief:** Compact horizontal row of key statistics separated by subtle vertical dividers. Each stat shows a label in muted uppercase small text above a large bold value. The compact preset reduces vertical padding and font sizes. The highlighted preset adds a colored accent underline or background to the most important metric. Stats are evenly distributed across the bar width. Optional trend arrows (up/down) appear beside values with green/red coloring.

**Components:** Text, icon, Container

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Stats wrap to a 2x2 grid or become horizontally scrollable. Values remain large. Labels may abbreviate.
- **Tablet (640-1024px):** Single horizontal row with all stats visible. Comfortable spacing.
- **Desktop (>1024px):** Full horizontal bar with generous spacing between stats. All labels fully spelled out.


### leaderboard

Ranked list of items with position, avatar, name, and score. Supports spotlight, ranked, and grid presets.

**Visual brief:** Ranked vertical list where each row shows a position number (with gold/silver/bronze styling for top 3), a user avatar, display name, and a numeric score on the right. Top-three items in the spotlight preset are enlarged with medal icons and a subtle glow or card treatment. The ranked preset is a dense list with alternating row shading. Grid preset arranges entries as cards in a responsive grid with position badge, avatar, name, and score. Position changes show up/down arrows with green/red coloring.

**Components:** Card, Badge, Avatar, Text, icon

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Single-column list. Spotlight cards stack vertically. Avatars reduce to 32px. Score values right-aligned.
- **Tablet (640-1024px):** Spotlight top-3 in a horizontal row, remaining entries in a list below. Grid preset uses 2 columns.
- **Desktop (>1024px):** Spotlight top-3 prominently displayed. Full list with generous spacing. Grid preset uses 3-4 columns.


### timeline

Chronological sequence of events with dates, descriptions, and optional media.

**Visual brief:** Vertical sequence of timeline entries connected by a thin vertical line. Each entry has a small circle dot on the line, a date or timestamp label, an event title in medium weight, and a description paragraph. Optional media (images, icons) can appear beside entries. The compact preset reduces spacing and hides descriptions, showing only date and title. The horizontal preset arranges entries left-to-right along a horizontal line with dates below and content above. Milestone entries may have a larger dot or distinct icon.

**Components:** Card, Badge, icon, Text

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Vertical timeline only. Line on the left edge with content to the right. Dates above entries. Compact spacing.
- **Tablet (640-1024px):** Standard vertical timeline with comfortable spacing. Content beside the timeline dots.
- **Desktop (>1024px):** Full vertical or horizontal timeline. Entries alternate left and right of the center line (vertical) or spread evenly (horizontal).


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


---

## Pages

### main (/community)

Layout: hero (landing) as guild-hero → kpi-grid → [activity-feed | top-players] @lg

### news (/community/news)

Layout: notifications → filter-bar → post-list → reactions

### hall-of-fame (/community/hall-of-fame)

Layout: stats-bar → leaderboard (ranked) as guild-leaderboard → timeline

### member-profile (/community/members/:id)

Layout: detail-header (profile) as player-header → kpi-grid → [achievements | activity-feed] @lg → timeline
