# Section: settings-full

**Role:** auxiliary | **Shell:** sidebar-aside | **Archetype:** settings-full
**Description:** Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.

## Quick Start

**Shell:** Three-column layout with left navigation and right inspector/detail panel. Used for admin dashboards, email clients, IDE-style apps. (nav: 240px, header: 52px)
**Pages:** 4 (profile, security, preferences, danger)
**Key patterns:** account-settings [moderate], sessions
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.neon-glow`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and precise.

## Shell Implementation (sidebar-aside)

### body

- **flex:** 1
- **note:** Main scroll container for primary content.
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: sidebar 1fr aside; rows: 52px 1fr

### aside

- **note:** Right inspector/detail panel. Toggleable. Shows contextual details, properties, or preview.
- **atoms:** _flex _col _borderL
- **width:** 280px
- **border:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-bg)
- **collapsible:** true

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **left_content:** Breadcrumb / page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Actions / search

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - overflow_y: auto
  - item_content: icon + label text
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
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
  - content: User avatar + settings
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
- **position:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **collapse_breakpoint:** md

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
| `--d-text` | `#FAFAFA` | Body text, headings, primary content |
| `--d-border` | `#3F3F46` | Dividers, card borders, separators |
| `--d-primary` | `#6366F1` | Brand color, key interactive, selected states |
| `--d-surface` | `#1F1F23` | Cards, panels, containers |
| `--d-secondary` | `#A78BFA` | Secondary brand color, supporting elements |
| `--d-bg` | `#18181B` | Page canvas / base layer |
| `--d-text-muted` | `#A1A1AA` | Secondary text, placeholders, labels |
| `--d-accent-glow` | `rgba(0, 212, 255, 0.3)` | Ambient glow effect for accent-colored elements |
| `--d-primary-hover` | `#818CF8` | Hover state for primary elements |
| `--d-surface-raised` | `#27272A` | Elevated containers, modals, popovers |
| `--d-accent` | `#00D4FF` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.carbon-card` | Surface background, subtle border, 8px radius, hover shadow transition. |
| `.carbon-code` | Monospace font, surface-raised background, subtle 3px left border accent in primary color. |
| `.carbon-glass` | Glassmorphic panel with backdrop-filter blur(12px), semi-transparent surface background, 1px border. Use for nav bars, sidebars, floating panels. |
| `.carbon-input` | Soft border with gentle focus ring using primary blue. Border transitions on focus. |
| `.carbon-canvas` | Background color using theme background token. Clean, minimal foundation. |
| `.carbon-divider` | Hairline separator using border-color token. |
| `.carbon-skeleton` | Loading placeholder with subtle pulse animation for skeleton states. |
| `.carbon-bubble-ai` | Left-aligned message bubble with surface background for AI responses. |
| `.carbon-fade-slide` | Entrance animation: opacity 0 to 1, translateY 12px to 0, 200ms ease-out. |
| `.carbon-bubble-user` | Right-aligned message bubble with primary-tinted background for user messages. |

**Compositions:** **auth:** Centered auth forms with clean card styling.
**chat:** Chat interface with conversation list sidebar and message thread. Anchored input at bottom.
**marketing:** Marketing pages with top nav and footer. Clean sections with subtle separators.
**Spatial hints:** Density bias: none. Section padding: 80px. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface carbon-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-aside shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

---

## Visual Direction

**Personality:** Precision engineering studio for AI agents. Carbon-dark surfaces with neon cyan highlights on active elements. Monospace typography for all prompts, traces, and model outputs. Split-pane interfaces reminiscent of an IDE — left tree, center editor, right preview. Think VS Code meets Langsmith. Interactions are immediate and keyboard-first. Every surface exists to reduce iteration cycles. Lucide icons. No decoration — every pixel serves the builder.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
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
