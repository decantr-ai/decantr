# Section: creator-subscribers

**Role:** primary | **Shell:** sidebar-main | **Archetype:** creator-subscribers
**Description:** Fan and subscriber management for creators. View, filter, and engage with your audience.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (subscribers, subscriber-detail)
**Key patterns:** subscriber-list [complex], detail-header [moderate], activity-feed
**CSS classes:** `.studio-card`, `.studio-glow`, `.studio-input`
**Density:** comfortable
**Voice:** Warm, encouraging, and creator-supportive.

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
| `--d-accent` | `#14B8A6` |  |
| `--d-border` | `#E7E5E4` | Dividers, card borders, separators |
| `--d-primary` | `#F97316` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#8B5CF6` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAF9F7` | Page canvas / base layer |
| `--d-text-muted` | `#78716C` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#EA580C` | Hover state for primary elements |
| `--d-surface-raised` | `#F5F3F0` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#7C3AED` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.studio-card` | Surface background, soft shadow, 12px radius, hover lift transition. |
| `.studio-glow` | Subtle primary-tinted glow effect for call-to-action buttons. |
| `.studio-input` | Warm border with coral focus ring and gentle glow effect. Friendly input styling. |
| `.studio-canvas` | Warm background using theme background token. Friendly, inviting foundation. |
| `.studio-divider` | Warm hairline separator using border-color token. |
| `.studio-fade-up` | Entrance animation: opacity 0 to 1, translateY 16px to 0, 250ms ease-out. |
| `.studio-surface` | Soft surface elevation with 1px warm border and subtle shadow. Uses surface background. |
| `.studio-skeleton` | Loading placeholder with warm pulse animation. |
| `.studio-gate-blur` | Backdrop blur effect for content behind paywalls. |
| `.studio-badge-tier` | Tier badge with gradient backgrounds for subscription levels. |
| `.studio-card-premium` | Premium card with purple gradient border for exclusive content. |
| `.studio-avatar-creator` | Larger creator avatar with accent ring highlight. |

**Compositions:** **auth:** Centered auth forms with warm card styling.
**checkout:** Minimal checkout flow with focused content area.
**dashboard:** Creator dashboard with sidebar navigation. Analytics, content management, subscriber views.
**marketing:** Marketing pages with top nav and footer. Clean sections with warm accents.
**storefront:** Fan-facing storefront with top navigation. Creator profiles, content browsing.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: soft.


Usage: `className={css('_flex _col _gap4') + ' d-surface studio-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

subscriber-filtering, export-csv, messaging, tier-management

---

## Visual Direction

**Personality:** Warm, creator-first monetization platform that celebrates creative work. Light theme with soft gradients and rounded cards. Creator profiles are visually rich — large cover images, prominent avatars, and tier cards with benefit previews. Earnings dashboards use approachable chart styles (rounded bars, smooth lines) in warm accent tones. The fan storefront feels like a boutique, not a marketplace. Premium tiers get subtle visual elevation. Think Patreon meets Gumroad with a Dribbble-level polish.

## Pattern Reference

### subscriber-list

Fan/subscriber management table with filtering, search, sorting, and bulk actions. Export and messaging capabilities.

**Visual brief:** Data table of subscribers/fans with columns: checkbox (for bulk select), avatar, display name, email, subscription tier badge, joined date, status badge (active, cancelled, paused), and a kebab menu for actions. A header bar contains search input, tier filter dropdown, status filter, and bulk action buttons (message, export). A pagination bar at the bottom shows page controls and total count. The compact preset removes the avatar column and reduces row height.

**Components:** Button, Card, Input, Badge, Avatar, Checkbox, Select, icon

**Composition:**
```
Toolbar = Row(d-control) > [SearchInput(d-control) + TierFilter(d-control) + StatusFilter(d-control) + ExportButton(d-interactive)]
BulkActions = Bar(d-control, sticky-bottom) > [SelectedCount + MessageButton(d-interactive) + ExportButton(d-interactive)]
SubscriberRow = Row(d-data-row) > [Checkbox(d-control) + Avatar + Name(font-medium) + Email(text-muted) + TierBadge(d-annotation) + JoinDate + StatusBadge(d-annotation) + ActionsMenu(d-interactive)]
SubscriberList = Container(d-section, flex-col, gap-4) > [Toolbar + SubscriberTable + Pagination + BulkActions?]
SubscriberTable = Table(d-data) > SubscriberRow[]
```

**Layout slots:**
- `table`: Subscriber data rows
- `search`: Subscriber search input
- `filters`: Tier, date, status filters
- `pagination`: Page navigation controls
- `bulk-actions`: Mass action buttons
**Responsive:**
- **Mobile (<640px):** Table becomes a card list — each subscriber as a card with avatar, name, tier, and status. Bulk actions move to a bottom action bar. Filters collapse to a filter button.
- **Tablet (640-1024px):** Table with horizontal scroll. Search and primary filters visible. Checkboxes and bulk actions functional.
- **Desktop (>1024px):** Full table with all columns visible. Filters, search, and bulk actions in a single toolbar row.


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


---

## Pages

### subscribers (/dashboard/subscribers)

Layout: subscriber-list

### subscriber-detail (/dashboard/subscribers/:id)

Layout: detail-header → activity-feed
