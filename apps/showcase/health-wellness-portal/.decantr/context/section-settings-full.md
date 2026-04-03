# Section: settings-full

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** settings-full
**Description:** Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 4 (profile, security, preferences, danger)
**Key patterns:** account-settings [moderate], sessions
**CSS classes:** `.health-nav`, `.health-card`, `.health-alert`
**Density:** comfortable
**Voice:** Caring, clear, and professional.

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
| `--d-text` | `#0F172A` | Body text, headings, primary content |
| `--d-accent` | `#7C3AED` |  |
| `--d-border` | `#E2E8F0` | Dividers, card borders, separators |
| `--d-primary` | `#0284C7` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#0D9488` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAFAF8` | Page canvas / base layer |
| `--d-text-muted` | `#64748B` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#6D28D9` |  |
| `--d-primary-hover` | `#0369A1` | Hover state for primary elements |
| `--d-surface-raised` | `#F5F7FA` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#0F766E` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.health-nav` | Clean spacious navigation with generous spacing. Clear active states and focus indicators. |
| `.health-card` | White card with subtle shadow and large 12px radius. Clean, spacious padding for medical content readability. |
| `.health-alert` | Left-border severity stripe (4px) with tinted background. Color indicates severity: info, warning, critical. |
| `.health-badge` | Rounded pill badge with tinted semantic background. Always includes text label for accessibility. |
| `.health-input` | Large input with generous 14px padding. Clear focus ring for accessibility. Designed for clinical data entry. |
| `.health-metric` | Large prominent number with color-coded status dot indicator. Used for vitals, lab results, and patient stats. |
| `.health-status` | Color-coded status with always-visible text label. Never relies on color alone per WCAG guidelines. |
| `.health-surface` | Warm white background with minimal 1px border. Creates gentle separation without harsh contrast. |

**Compositions:** **auth:** Centered authentication forms with clean card styling. HIPAA-compliant login with MFA support.
**clinical:** Clinical data entry and review. Dense but readable layouts with large inputs and clear labels.
**dashboard:** Patient dashboard with sidebar navigation. Vitals overview, appointments, medication schedule, and health metrics.
**marketing:** Healthcare marketing pages with trust signals. Professional hero sections and feature grids.
**patient-portal:** Patient-facing portal with top navigation. Simplified interface for appointments, records, and messaging.
**Spatial hints:** Density bias: -1. Section padding: 48px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface healthcare-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

---

## Visual Direction

**Personality:** Calming, trust-building health portal with emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Vitals use color-coded status indicators always supplemented with text labels. Appointment booking is straightforward. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence. Lucide icons. WCAG AAA compliance throughout.

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

### danger (/settings/danger)

Layout: account-settings
