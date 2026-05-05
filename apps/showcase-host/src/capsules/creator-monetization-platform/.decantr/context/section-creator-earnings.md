# Section: creator-earnings

**Role:** primary | **Shell:** sidebar-main | **Archetype:** creator-earnings
**Description:** Revenue analytics and payout management for creators. Full earnings dashboard and payout configuration.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (earnings, payouts)
**Key patterns:** earnings-dashboard [moderate], payout-settings [moderate]
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

revenue-charts, tier-breakdown, payout-configuration, export-reports

---

## Visual Direction

**Personality:** Warm, creator-first monetization platform that celebrates creative work. Light theme with soft gradients and rounded cards. Creator profiles are visually rich — large cover images, prominent avatars, and tier cards with benefit previews. Earnings dashboards use approachable chart styles (rounded bars, smooth lines) in warm accent tones. The fan storefront feels like a boutique, not a marketplace. Premium tiers get subtle visual elevation. Think Patreon meets Gumroad with a Dribbble-level polish.

## Pattern Reference

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


### payout-settings

Bank/payment configuration form with payout method selection, bank details, schedule settings, and payout history.

**Visual brief:** Settings form with a payout method selector at the top (radio cards for Bank Transfer/ACH, PayPal, Stripe, with icons). Below, a details section shows the selected method's account fields (bank name, routing number, account number — masked with reveal toggle). A schedule section has radio buttons or toggles for payout frequency (weekly, bi-weekly, monthly) with a next payout date indicator. A payout history list at the bottom shows recent payouts with date, amount, status, and method. The readonly preset disables all inputs and shows data in display-only mode.

**Components:** Button, Card, Input, Select, Badge, Radio, icon

**Composition:**
```
BankForm = Section(d-surface) > [BankName(d-control) + RoutingNumber(d-control, masked) + AccountNumber(d-control, masked) + RevealToggle(d-interactive)]
MethodSelect = Row(d-control) > RadioCard(d-surface, icon, selectable)[]
PayoutHistory = Table(d-data) > PayoutRow(d-data-row)[]
PayoutSettings = Container(d-section, flex-col, gap-6) > [MethodSelect + BankForm + ScheduleSection + PayoutHistory?]
ScheduleSection = Section(d-surface) > [FrequencyRadio(d-control) > Option[] + NextPayoutDate(d-annotation) + ThresholdInput(d-control)]
```

**Layout slots:**
- `history`: Past payouts table
- `bank-form`: Bank account details form
- `threshold`: Minimum payout amount
- `method-select`: Bank, PayPal, Stripe selection
- `payout-schedule`: Weekly/monthly selection
**Responsive:**
- **Mobile (<640px):** Method cards stack vertically. Account fields are full-width. Schedule options stack. Payout history becomes a card list.
- **Tablet (640-1024px):** Method cards in a 2x2 grid. Standard form layout. History table visible.
- **Desktop (>1024px):** Method cards in a single row. Account and schedule sections side by side. Full history table.


---

## Pages

### earnings (/dashboard/earnings)

Layout: earnings-dashboard → payout-settings

### payouts (/settings/payouts)

Layout: payout-settings
