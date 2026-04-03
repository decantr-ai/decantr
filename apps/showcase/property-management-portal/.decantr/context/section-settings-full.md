# Section: settings-full

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** settings-full
**Description:** Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 4 (profile, security, preferences, danger)
**Key patterns:** account-settings [moderate], sessions
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

profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

---

## Visual Direction

**Personality:** Professional, trust-building property management portal with a warm light theme. Clean card-based layouts for properties and units with status badges (occupied, vacant, maintenance). Financial views use conservative chart styles — bar charts for rent roll, line charts for P&L trends. Tenant directory emphasizes contact info and lease status. Maintenance board uses a kanban layout with priority coloring. The tenant portal feels welcoming and self-service. Think Buildium meets a modern banking app — serious about money, friendly about people.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### account-settings

Account management forms with presets for profile, security, preferences, and danger zone (account deletion).

**Visual brief:** Settings page with vertical navigation tabs on the left (Profile, Security, Notifications, Danger Zone) and form content on the right. Active tab highlighted with primary left-border. Each settings section is a d-surface card with grouped form fields, section heading, and Save button at bottom-right.

**Components:** Button, Avatar, Badge, icon

**Composition:**
```
SettingsNav = TabList(d-control) > Tab(active?: accent-border)[]
AccountSettings = Container(d-section, flex-col) > [SettingsNav(vertical-tabs, d-interactive) + SettingsContent]
SettingsContent = Panel(d-surface, flex-col, gap-8) > [AvatarUpload? + FormFields + SaveButton(d-interactive, variant: primary)]
```

**Layout slots:**
- `form`: Name, email, bio inputs with inline edit
- `save`: Save changes button
- `avatar`: Avatar with upload/change button
  **Layout guidance:**
  - spacing: Nav items have consistent padding. Active item stands out but doesn't shift layout.
  - active_state: Active nav/tab item should have a visible indicator: accent-colored left border (for vertical nav) or bottom border (for horizontal tabs), plus accent text color.
  - nav_position: For settings pages, vertical tab nav on the left. Content area scrolls independently.

### sessions



**Components:** 

**Layout slots:**
- `list`: Active sessions list (device, location, last active, revoke button)

---

## Pages

### profile (/settings/profile)

Layout: account-settings

### security (/settings/security)

Layout: account-settings → sessions

### preferences (/settings/preferences)

Layout: account-settings

### danger (/settings/account)

Layout: account-settings
