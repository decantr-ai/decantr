# Section: tenant-payments

**Role:** auxiliary | **Shell:** top-nav-main | **Archetype:** tenant-payments
**Description:** Tenant payment management including rent reminders, payment history, and autopay setup configuration.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 2 (overview, setup)
**Key patterns:** rent-reminder, tenant-payment-setup [moderate], payment-history [moderate]
**CSS classes:** `.estate-nav`, `.estate-card`, `.estate-stat`
**Density:** comfortable
**Voice:** Professional and reassuring.

## Shell Implementation (top-nav-main)

### body

- **gap:** 1rem
- **flex:** 1
- **note:** Full-width scrollable content area below the nav bar.
- **atoms:** _flex _col _gap4 _p6 _overflow[auto] _flex1
- **padding:** 1.5rem
- **direction:** column
- **overflow_y:** auto

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **nav_links:** Nav links use text-sm font-medium with no background. Hover: text color transitions to primary. Active: font-semibold or underline-offset-4.
- **background:** var(--d-bg)
- **left_content:** Brand/logo link
- **button_sizing:** Buttons and CTAs in the header must use compact sizing: py-1.5 px-4 text-sm (not the default d-interactive padding). The header is 52px — buttons should be ~32px tall, not 40px+.
- **right_content:** Theme toggle (sun/moon icon, toggles light/dark class on html element) + Search trigger + CTA button or user avatar. Theme toggle uses a simple icon button — no dropdown.
- **center_content:** Nav links — flex with gap 1.5rem

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

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

**Compositions:** **auth:** Centered auth forms with professional card styling.
**financial:** Financial dashboards and reports. Data-dense with tables, charts, and metrics.
**marketing:** Marketing pages with top nav and footer. Professional SaaS landing page styling.
**tenant-portal:** Tenant self-service portal with top navigation. Simplified interface for payments and maintenance.
**owner-dashboard:** Property owner dashboard with sidebar navigation. Portfolio metrics, property grid, financial summaries.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface estate-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — top-nav-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

payments, autopay, receipts

---

## Visual Direction

**Personality:** Professional, trust-building property management portal with a warm light theme. Clean card-based layouts for properties and units with status badges (occupied, vacant, maintenance). Financial views use conservative chart styles — bar charts for rent roll, line charts for P&L trends. Tenant directory emphasizes contact info and lease status. Maintenance board uses a kanban layout with priority coloring. The tenant portal feels welcoming and self-service. Think Buildium meets a modern banking app — serious about money, friendly about people.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### rent-reminder

Payment reminder notification with contextual styling for upcoming, due today, and overdue states. Includes one-click payment action.

**Visual brief:** Notification-style card or banner with contextual coloring based on payment state. Upcoming (blue/info tint) shows a calendar icon with 'Rent due in X days', the amount, and a 'Pay Now' button. Due today (yellow/warning tint) shows an alert icon with 'Rent due today', the amount prominently, and an urgent 'Pay Now' button. Overdue (red/destructive tint) shows a warning triangle icon with 'Rent overdue by X days', the amount with late fee breakdown, and a 'Pay Now' button. Paid (green/success tint) shows a checkmark icon with 'Rent paid' and the payment date.

**Components:** Button, icon, Badge

**Composition:**
```
PayAction = Button(d-interactive, variant: status === overdue ? destructive : primary)
RentReminder = Card(d-surface, tint: status) > [StatusIcon(color: status) + ReminderContent + PayAction]
ReminderContent = Stack(flex-col) > [Title(font-medium) + DueDate(d-annotation, mono-data) + Amount(heading3, mono-data) + Property?(text-muted)]
```

**Layout slots:**
- `icon`: Calendar icon
- `title`: Reminder headline
- `action`: Pay now button
- `amount`: Amount due
- `due-date`: Due date
**Responsive:**
- **Mobile (<640px):** Full-width banner card. Amount text large for visibility. Pay button full-width at the bottom. Details stack vertically.
- **Tablet (640-1024px):** Standard card width. All elements in a comfortable layout. Pay button inline.
- **Desktop (>1024px):** Card or inline banner. All information on one or two lines. Pay button on the right.


### tenant-payment-setup

Tenant autopay configuration with payment method management, ACH/card setup, autopay toggle, and upcoming payment preview.

**Visual brief:** Settings form for tenant autopay configuration. An autopay toggle switch at the top enables/disables automatic payments with a description of what it does. Below, a payment methods section shows saved cards/bank accounts as rows with masked account number, type icon (Visa, Mastercard, bank), and a star icon for the default method. 'Add Payment Method' button opens a card/ACH input form. An upcoming payments section shows the next payment amount, date, and property/unit in a summary card. If autopay is off, a manual 'Pay Now' button appears.

**Components:** Button, icon, Badge, Input, Select

**Composition:**
```
MethodCard = Card(d-surface, active?: selected) > [CardBrandIcon + MaskedNumber(mono-data) + Expiry(text-muted) + DefaultBadge?(d-annotation)]
AutopayToggle = Row(d-control) > [Label + Switch(d-control) + Description(text-muted)]
PaymentMethods = Section(d-surface) > [MethodCard(d-surface, selectable)[] + AddMethodButton(d-interactive)]
UpcomingPayment = Card(d-surface) > [NextDueDate(d-annotation) + Amount(heading3, mono-data) + BreakdownList > LineItem[]]
TenantPaymentSetup = Container(d-section, flex-col, gap-6) > [PaymentMethods + AutopayToggle + UpcomingPayment]
```

**Layout slots:**
- `header`: Title, autopay status indicator
- `methods`: Saved payment methods list
- `schedule`: Upcoming payments preview
- `add-method`: Add bank account or card form
- `current-method`: Current payment method summary
- `autopay-settings`: Autopay toggle, day of month
**Responsive:**
- **Mobile (<640px):** Full-width form. Payment method cards stack. Toggle switch prominent at top. Pay Now button full-width and sticky.
- **Tablet (640-1024px):** Standard form layout. Payment methods and upcoming payments visible together.
- **Desktop (>1024px):** Comfortable form width. All sections visible. Payment methods in a clean list.


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

### overview (/tenant-portal/payments)

Layout: rent-reminder → tenant-payment-setup → payment-history

### setup (/tenant-payments/setup)

Layout: tenant-payment-setup
