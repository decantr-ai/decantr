# Section: settings-full

**Role:** auxiliary | **Shell:** sidebar-aside | **Archetype:** settings-full
**Description:** Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.

## Quick Start

**Shell:** Three-column layout with left navigation and right inspector/detail panel. Used for admin dashboards, email clients, IDE-style apps. (nav: 240px, header: 52px)
**Pages:** 4 (profile, security, preferences, danger)
**Key patterns:** account-settings [moderate], sessions
**CSS classes:** `.studio-beat`, `.studio-knob`, `.studio-rack`, `.neon-glow`
**Density:** comfortable
**Voice:** Creative and technical.

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
| `--d-text` | `#E0E7FF` | Body text, headings, primary content |
| `--d-accent` | `#D946EF` |  |
| `--d-border` | `#4338CA` | Dividers, card borders, separators |
| `--d-primary` | `#22D3EE` | Brand color, key interactive, selected states |
| `--d-surface` | `#2A2565` | Cards, panels, containers |
| `--d-secondary` | `#D946EF` | Secondary brand color, supporting elements |
| `--d-bg` | `#1E1B4B` | Page canvas / base layer |
| `--d-text-muted` | `#A5B4FC` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#E879F9` |  |
| `--d-primary-hover` | `#06B6D4` | Hover state for primary elements |
| `--d-surface-raised` | `#332E80` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#C026D3` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.studio-beat` | Beat grid lines with subdivision markers for timeline and arrangement views. |
| `.studio-knob` | Circular control knobs with cyan indicator and rotational value display. |
| `.studio-rack` | Equipment rack styling with 1U slot dividers and industrial metal aesthetic. |
| `.studio-wave` | Cyan waveform displays with glowing stroke and animated playhead. Audio visualization aesthetic. |
| `.studio-meter` | VU meter styling with gradient fill from cyan through yellow to magenta at peak. |
| `.studio-channel` | Vertical channel strips with fader, meter, and knob stack. Mixing console layout. |
| `.studio-glow-cyan` | Cyan glow effects on active elements using box-shadow and text-shadow. |
| `.studio-glow-magenta` | Magenta glow on peaks, alerts, and secondary highlights. |

**Compositions:** **daw:** Digital audio workstation with track arrangement, mixer view, and transport controls.
**mixer:** Mixing console with channel strips, busses, and master section.
**library:** Sample library browser with waveform previews and tag filtering.
**marketing:** Music production marketing with waveform visuals and electric color palette.
**Spatial hints:** Density bias: 1. Section padding: 32px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface studio-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-aside shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

---

## Visual Direction

**Personality:** Electric music production workspace with cyan waveforms pulsing across deep purple canvases. Multi-track DAW layout with stem-stack channel strips, meter bars glowing on transients, and automation lanes curving below. Split-royalty calculators with real-time percentage validation. Live session rooms with voice chat and collaborative scrubbing. Think Ableton meets Splice. Lucide icons. Electric.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

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
