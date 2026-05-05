# Section: creator-dashboard

**Role:** primary | **Shell:** sidebar-main | **Archetype:** creator-dashboard
**Description:** Creator admin dashboard home with earnings summary, recent activity, and quick actions.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 1 (home)
**Key patterns:** stats-overview, earnings-dashboard [moderate], content-calendar, activity-feed
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

**Preferred:** earnings-dashboard
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

earnings-kpis, activity-feed, quick-actions

---

## Visual Direction

**Personality:** Warm, creator-first monetization platform that celebrates creative work. Light theme with soft gradients and rounded cards. Creator profiles are visually rich — large cover images, prominent avatars, and tier cards with benefit previews. Earnings dashboards use approachable chart styles (rounded bars, smooth lines) in warm accent tones. The fan storefront feels like a boutique, not a marketplace. Premium tiers get subtle visual elevation. Think Patreon meets Gumroad with a Dribbble-level polish.

## Pattern Reference

### stats-overview

Summary row of key statistics with labels, values, and optional trend indicators

**Visual brief:** Horizontal row of 3-5 stat summary items, each showing a muted small-text label above a large bold numeric value. Optional trend badges appear to the right of or below the value — green with up-arrow for positive changes, red with down-arrow for negative. In the standard preset, each stat lives in its own card surface with consistent padding (p4) and rounded corners. The compact preset renders stats inline in a single bar separated by vertical dividers, without individual card surfaces. The highlighted preset makes the first stat larger (spanning more grid space) with a sparkline visualization, while remaining stats are secondary size.

**Components:** Card, Badge, icon

**Composition:**
```
StatItem = Card(d-surface) > [Icon?(d-annotation, rounded-bg) + Label(text-muted, text-sm) + Value(heading3, mono-data) + TrendBadge?(d-annotation, variant: positive|negative)]
StatsOverview = Row(d-section, responsive: wrap) > StatItem[]
```

**Layout slots:**
- `label`: Metric label with _textsm _fgmuted
- `trend`: Badge with percentage change and directional icon
- `value`: Primary value with _heading2 _fontbold
- `stat-card`: Card containing label, value, and optional trend
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Stat values animate with counter effect (number rolls up from 0) over 800ms ease-out on viewport enter. Trend badges fade in after value completes. |
| transitions | Value text transitions smoothly on data change with 300ms ease. Trend arrow rotates on direction change. |

**Responsive:**
- **Mobile (<640px):** Two-column grid (2x2 or 2x3). Compact preset wraps to two rows. Value text reduces to heading3 scale. Trend badges stack below values instead of inline.
- **Tablet (640-1024px):** Three or four columns depending on stat count. Compact preset stays single row if 4 or fewer items. Standard padding.
- **Desktop (>1024px):** Full single-row layout with all stats visible. Four columns standard. Highlighted preset shows featured stat at 2x width. Generous gap4 spacing.

**Accessibility:**
- Role: `region`
- Keyboard: Tab navigates between stat cards; Shift+Tab navigates backwards
- Announcements: {label}: {value}, {trend_direction} {trend_percent}; Statistics updated


### earnings-dashboard

Revenue analytics dashboard with KPIs, charts, tier breakdown, and recent transactions. Date range filtering and export capabilities.

**Visual brief:** Dashboard layout with a row of KPI metric cards at the top (total revenue, subscribers, MRR, churn rate), each showing the value, trend arrow (up/down with green/red color), and percentage change. Below the KPIs, a large revenue line chart with date range selector (7d, 30d, 90d, 1y) and an overlaid area fill. A tier breakdown section shows revenue per subscription tier as a horizontal stacked bar or donut chart. A recent transactions table at the bottom lists individual payments with date, subscriber, amount, and status. Export button in the header.

**Components:** Button, Card, Badge, Select, icon

**Composition:**
```
KPIRow = Grid(d-data, 4-col) > KPICard(d-surface)[]
KPICard = Card > [Value(heading2, mono-data) + TrendArrow(color: positive|negative) + Label(text-muted)]
RevenueChart = Card(d-surface) > [DateRangeSelector(d-control) + Chart(d-data, area-fill)]
EarningsDashboard = Container(d-section, flex-col, gap-6) > [KPIRow + RevenueChart + TierBreakdown + TransactionsTable + PayoutStatus?]
TransactionsTable = Card(d-surface) > [Table(d-data) > TransactionRow[]]
```

**Layout slots:**
- `kpis`: Revenue, MRR, subscribers, churn metrics
- `payout-status`: Next payout info card
- `revenue-chart`: Line/bar chart of revenue over time
- `tier-breakdown`: Revenue by tier pie chart
- `recent-transactions`: Latest payments table
**Responsive:**
- **Mobile (<640px):** KPI cards scroll horizontally or stack in a 2x2 grid. Charts take full width with simplified labels. Transactions table becomes a card list. Export button moves to a menu.
- **Tablet (640-1024px):** KPIs in a single row. Charts render at full container width. Transactions table with horizontal scroll if needed.
- **Desktop (>1024px):** Full dashboard grid. KPIs span the top. Charts and tier breakdown side by side. Transactions table with all columns visible.


### content-calendar



**Components:** Heading, Text, List

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)

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

### home (/dashboard)

Layout: notifications → stats-overview → earnings-dashboard → content-calendar → activity-feed
