# Section: billing

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** billing
**Description:** Billing, payment, and subscription management

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 1 (billing)
**Key patterns:** kpi-grid, pricing [moderate], payment-history [moderate]
**CSS classes:** `.lp-nav`, `.lp-header`, `.lp-fade-in`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and trustworthy.

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
| `--d-text` | `#F0EEF8` | Body text, headings, primary content |
| `--d-border` | `#2E2848` | Dividers, card borders, separators |
| `--d-primary` | `#9F6EFF` | Brand color, key interactive, selected states |
| `--d-surface` | `#141020` | Cards, panels, containers |
| `--d-bg` | `#0C0A14` | Page canvas / base layer |
| `--d-text-muted` | `#9890B0` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#B08AFF` | Hover state for primary elements |
| `--d-surface-raised` | `#1C1830` | Elevated containers, modals, popovers |
| `--d-accent` | `#06B6D4` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lp-nav` | Sticky navigation with blur backdrop. Minimal branding. |
| `.lp-header` | Large hero with gradient mesh background. |
| `.lp-fade-in` | Simple fade-in on scroll, 0.4s duration. |
| `.lp-surface` | Base surface with subtle texture. Light mode: #FAFAFA, Dark mode: #111111. |
| `.lp-card-elevated` | Card with elevation shadow, hover lift effect. |
| `.lp-gradient-mesh` | Subtle gradient mesh in primary/accent colors at 5% opacity. |
| `.lp-button-primary` | Solid primary color button with hover scale. |

**Spatial hints:** Density bias: none. Section padding: 96px. Card wrapping: standard.


Usage: `className={css('_flex _col _gap4') + ' d-surface launchpad-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

billing

---

## Visual Direction

**Personality:** Enterprise-grade cloud console built for reliability and scale. Clean, systematic layout with a left sidebar for service navigation. Status indicators use semantic colors — green healthy, amber degraded, red incident. Deploy logs stream in monospace with ANSI color support. Usage charts are functional, not decorative. Dense data tables with sort, filter, and bulk actions. Think AWS Console meets Vercel — powerful but approachable. Every view should feel like a control plane.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

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


### pricing

Pricing tier cards with plan comparison, billing toggle, and CTA buttons

**Visual brief:** Three pricing tier cards in a responsive row, centered on the page. The recommended tier (typically the middle card) is visually elevated with a highlighted border in primary color, slightly larger scale (scale 1.02), and a 'Popular' or 'Recommended' badge at the top corner. Each card shows: the plan name as a heading4, the price in large monospace text (heading1 scale) with the billing period in small muted text below, a feature checklist with green checkmark icons for included features and muted X icons for excluded ones, and a full-width CTA button at the card bottom. The recommended tier uses the primary filled button variant; other tiers use ghost. A monthly/annual billing toggle is centered above the cards with a pill-style active state and the annual option showing a small 'Save 20%' badge. The section has generous vertical padding and a centered heading above everything.

**Components:** Card, Button, Badge, Switch, icon

**Composition:**
```
PricingTier = Card(d-surface, elevated?: tier.recommended) > [PlanName(heading4) + Badge?(d-annotation, show: tier.recommended) + Price(mono-data, heading1) + Period(text-muted) + FeatureList > CheckItem(icon: check)[] + CTAButton(d-interactive, variant: tier.recommended ? primary : ghost, full-width)]
BillingToggle = Toggle(d-control) > [MonthlyLabel + Switch + AnnualLabel + SaveBadge?(d-annotation)]
PricingSection = Container(d-section, centered) > [Heading(heading2) + BillingToggle(d-control, pill) + TierGrid > PricingTier[]]
```

**Layout slots:**
- `cta`: Full-width Button per tier — primary variant for recommended, ghost for others
- `tiers`: Horizontal row of tier Cards: _grid _gc1 _md:gc3 _gap4 _aic
- `toggle`: Monthly/Annual billing toggle with pill-style active indicator
- `heading`: Section title with _heading2 _textCenter and optional subtext
- `tier-card`: Individual Card: plan name (_heading4), price (_heading1 _fontmono), billing period, feature checklist, CTA Button
- `feature-list`: Checklist of features with checkmark icons and _textsm
  **Layout guidance:**
  - card_glow: For neon/glow themes, the recommended tier gets a subtle box-shadow glow: 0 0 30px rgba(var(--d-primary-rgb), 0.15). This draws the eye without being garish.
  - toggle_treatment: The annual/monthly toggle should be a pill-style toggle with the active option using var(--d-primary) background. Show the savings percentage ("Save 20%") as a small accent-colored badge next to the annual option.
  - recommended_treatment: The recommended/popular tier card should be visually elevated: scale(1.02) or extra top padding, a primary-colored top border (3px solid var(--d-primary)), and the Popular badge using d-annotation[data-status=info]. The other tier cards should be subtly muted in comparison.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Tier cards lift on hover with translateY(-4px) and increased shadow over 200ms. CTA buttons brighten on hover. Toggle pill slides between states with 250ms ease. |
| transitions | Cards fade in and slide up with staggered delay (100ms per card) on section enter. Price value animates (counter-style) when toggling between monthly and annual. Badge pulses once on toggle change. |

**Responsive:**
- **Mobile (<640px):** Tier cards stack vertically in a single column. Recommended tier stays visually elevated but at full width. Toggle stays centered. Alternatively, tiers display as a horizontal carousel with snap-scrolling and dot indicators below. CTA buttons go full-width.
- **Tablet (640-1024px):** Three columns at reduced gap. Cards may be slightly narrower. Toggle and heading stay centered. Feature lists may truncate to top 5 items with 'See all features' link.
- **Desktop (>1024px):** Full three-column row with comfortable gap6 spacing. Recommended tier elevated. All features visible. Toggle and heading centered above. Section padding at py16.

**Accessibility:**
- Role: `region`
- Keyboard: Tab navigates between tier cards and their CTA buttons; Shift+Tab navigates backwards; Enter or Space activates billing toggle or CTA button; Arrow Left/Right navigates between tiers
- Announcements: {plan_name} plan: {price} per {period}; Billing changed to {period}, price updated to {price}; Recommended plan: {plan_name}
- Focus: On billing toggle change, price values are announced via aria-live polite region. Focus remains on the toggle after change.


### payment-history

Payment records table with date range filtering, export, and receipt generation. Supports tenant, property, and portfolio views.

**Visual brief:** Data table of payment records with columns: date, description, property/unit, payer, amount (green for received, red for refunded), and status badge (completed, pending, failed). A header row contains the title, date range filter (date pickers or preset buttons like 30d/90d/1y), and an export button. A summary row at the top or bottom shows total received, total outstanding, and period comparison. The portfolio preset adds a property column. The tenant preset filters to a single tenant. The property preset filters to a single property.

**Components:** Button, icon, Badge, Input, Select

**Composition:**
```
Header = Row(d-control, space-between) > [Title + DateRangePicker(d-control) + ExportButton(d-interactive)]
PaymentRow = Row(d-data-row) > [Date + Description + Property? + Payer + Amount(mono-data, color: status) + StatusBadge(d-annotation)]
SummaryRow = Row(d-data) > [TotalReceived(mono-data, color: success) + TotalOutstanding(mono-data, color: warning)]
PaymentTable = Table(d-data) > PaymentRow[]
PaymentHistory = Container(d-section, flex-col, gap-4) > [Header + Filters? + SummaryRow? + PaymentTable]
```

**Layout slots:**
- `table`: Payment records
- `header`: Title, date range picker, export
- `filters`: Payment type, status, property filters
- `summary`: Total for period
**Responsive:**
- **Mobile (<640px):** Table becomes a card list — each payment as a stacked card showing date, description, amount, and status. Filters collapse to a filter button. Export moves to a menu.
- **Tablet (640-1024px):** Table with horizontal scroll for extra columns. Date range filter visible in the header.
- **Desktop (>1024px):** Full table with all columns visible. Summary row and filters always visible.


---

## Pages

### billing (/billing)

Layout: kpi-grid → pricing → payment-history
