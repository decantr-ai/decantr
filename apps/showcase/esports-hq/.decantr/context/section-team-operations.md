# Section: team-operations

**Role:** primary | **Shell:** sidebar-main | **Archetype:** team-operations
**Description:** Primary esports team operations surface with team overview dashboard, player roster, and individual player profiles tracking form and activity.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (overview, roster, player-detail)
**Key patterns:** kpi-grid, scoreboard-live [moderate], activity-feed, player-form-tracker [moderate], card-grid [moderate], chart-grid
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

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

team-management, rosters

---

## Visual Direction

**Personality:** Professional esports team operations hub with vibrant neon-accented rosters and live scoreboards. Player form trackers show sparklines of K/D ratios, win rates, and self-reported mood indicators. Scrim calendars map team availability to opponent windows. VOD review interface with frame-by-frame annotations and drawing tools. Sponsor dashboards track activation metrics. Think Overwatch League backstage. Lucide icons. Competitive.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

## Pattern Reference

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


### player-form-tracker

A player performance tracking surface displaying K/D, win rate, average damage, form sparkline, self-reported mental state, and win/loss streaks.

**Visual brief:** A player card with circular avatar (64px) top-left, player handle in bold sans-serif right of avatar, role badge below name (Duelist, Controller, Sentinel, Initiator, Flex). Prominent form sparkline (48px tall) arcs across the card top area showing last 10 matches performance rating with area fill shaded to trend direction (rising green, declining red). Stat rows below list: K/D ratio, Win Rate %, Avg Damage/Round, Headshot %, each as a row with label left, value right-aligned in monospace, and a small trend arrow (up/down/flat). Metric bars show percentile rank relative to pro league. Mood indicator is a three-dot semaphore (green/yellow/red) labelled 'Feeling: Strong/OK/Rough' based on self-reported check-in. Streak badge pill shows current W/L streak (e.g. 'W4' green or 'L2' red). Team preset renders 5 mini cards horizontally with only avatar, handle, form sparkline, and mood.

**Components:** PlayerCard, FormSparkline, StatRow, MoodIndicator, StreakBadge, MetricBar

**Composition:**
```
StatRow = Row > [StatLabel + StatValue(mono) + TrendArrow + MetricBar?]
StreakBadge = Pill(d-annotation, data-streak) > [StreakPrefix + StreakCount]
FormSparkline = Chart(horizontal, area-fill) > [TrendLine + AreaFill(trend-colored) + DataPoints(hover-only)]
MoodIndicator = Semaphore(3-dot) > [MoodDot + MoodLabel]
PlayerFormTracker = Surface(d-surface) > PlayerCard[](d-interactive) > [Header > [PlayerAvatar + [PlayerHandle + RoleBadge]] + FormSparkline + StatRow[] > [StatLabel + StatValue(mono) + TrendArrow + MetricBar] + Footer > [MoodIndicator + StreakBadge]]
```

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
  **Layout guidance:**
  - note: Card is clickable (d-interactive) to open full player profile. Stat values in monospace.
  - container: d-surface
  - mood_semantics: Mood is self-reported, not algorithmic. Green=Strong, Yellow=OK, Red=Rough. Never auto-derive from stats.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-hover | elevation raise + avatar scale(1.05) 150ms ease-out |
| sparkline-hover | data point dots appear 180ms ease |
| mood-update | indicator dot color crossfade + pulse 400ms ease-in-out |
| stat-update | value counter roll 500ms ease-out |
| hot-streak | streak badge subtle glow pulse when streak >= 3 wins 2s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Team grid becomes vertical list. Individual card stats stack with metric bars full-width.
- **Tablet (640-1024px):** Team grid becomes 3+2 split. Comparison preset becomes vertical stack.

**Accessibility:**
- Role: `article`
- Keyboard: Tab: focus player card; Enter: open full player profile; M: update mood check-in (when authenticated as player)
- Announcements: Player {handle}: {role}, form {trend}, {streak} streak; Mood self-reported as {mood}


### card-grid

Responsive grid of cards with preset-specific content layouts

**Visual brief:** Responsive grid of uniformly-sized cards with consistent gap spacing. Each card is a contained surface with subtle border or shadow, rounded corners (r3), and internal padding. Product preset: top image with fixed aspect ratio, title below in medium-weight text, price in bold heading style, star-rating row with filled/empty star icons, and a full-width add-to-cart button in the card footer. Content preset: thumbnail image, colored category badge, article title, two-line excerpt in muted small text, and an author row with avatar, name, and date. Cards maintain equal height within each row via grid stretch.

**Components:** Card, CardHeader, CardBody, CardFooter, Image, Button, Badge

**Composition:**
```
CardGrid = Grid(d-section, responsive: 1/2/3/4-col) > ProductCard[]
ContentCard = Card(d-surface) > [Thumbnail + CategoryBadge(d-annotation) + Title(heading4) + Excerpt(text-muted) + MetaRow > [AuthorAvatar + AuthorName + Date]]
ProductCard = Card(d-surface, hoverable, lift-on-hover) > [Image(aspect-ratio) + Title(font-medium) + Price(heading4) + RatingRow > [StarIcon[] + CountBadge(d-annotation)] + CTAButton(d-interactive, full-width)]
```

**Layout slots:**
- `card-image`: Product image with aspect-ratio container
- `card-price`: Price with _heading4 styling
- `card-title`: Product name with _textsm _fontmedium
- `card-action`: Add-to-cart Button in CardFooter
- `card-rating`: Star rating row with icon stars and count Badge
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Cards lift on hover with translateY(-2px) and increased shadow over 200ms ease. Image within card scales to 1.03 on hover with overflow hidden. Badge pulses subtly on new items. |
| transitions | Cards entering viewport fade up from 15px below with staggered 100ms delay per card, 300ms duration. Load-more appends new cards with the same stagger animation. |

**Responsive:**
- **Mobile (<640px):** Single column (1 card per row). Cards go full-width with larger touch targets. Image aspect ratio maintained. Gap reduces to gap3.
- **Tablet (640-1024px):** Two columns for most presets. Collection preset stays at 2 columns. Gap at gap4. Cards maintain equal height per row.
- **Desktop (>1024px):** Three to four columns depending on preset. Product goes up to 4 columns at xl breakpoint. Content stays at 3. Icon preset reaches 4 columns. Full gap4-gap6 spacing.


### chart-grid

Grid of chart cards for dashboard data visualization

**Visual brief:** Grid of chart cards for dashboard analytics. Each card is a contained surface (d-surface) with a compact header showing the chart title in small medium-weight text and an optional time-range selector. The chart area occupies the card body with a minimum height of 200px and renders line charts, bar charts, area charts, or pie charts via data-chart-type attributes. A simple horizontal legend sits below the chart area with colored dots and labels. The mixed preset features one large chart spanning two columns in the first row, with two smaller charts below. Cards have consistent rounded corners and border styling.

**Components:** Card, CardHeader, CardBody

**Composition:**
```
Legend = Row(gap-2) > LegendItem(dot + label)[]
ChartCard = Card(d-surface) > [CardHeader > Title(font-medium) + ChartArea(d-data, min-height) + Legend(d-annotation)]
ChartGrid = Grid(d-section, responsive: 1/2-col) > ChartCard[]
```

**Layout slots:**
- `legend`: Simple legend row below chart area
- `chart-area`: Placeholder div with min-height and data-chart-type attribute
- `chart-card`: Repeated Card wrapping a chart placeholder area
- `chart-title`: Chart title in CardHeader with _textsm _fontmedium
**Responsive:**
- **Mobile (<640px):** Single column — all charts stack vertically at full width. Chart minimum height reduces to 160px. Legend wraps to multiple lines if needed. Wide preset becomes vertical stack instead of horizontal scroll.
- **Tablet (640-1024px):** Two-column grid activates. Mixed preset large chart still spans full width, smaller charts go side by side below. Chart height at 200px.
- **Desktop (>1024px):** Full two-column grid. Mixed preset spans correctly. Wide preset shows horizontal scrollable row. Charts at full minimum height with comfortable legend spacing.


---

## Pages

### overview (/team)

Layout: kpi-grid → scoreboard-live → activity-feed

### roster (/team/roster)

Layout: player-form-tracker → card-grid

### player-detail (/team/players/:id)

Layout: player-form-tracker → chart-grid → activity-feed
