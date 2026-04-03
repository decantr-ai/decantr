# Section: copilot-settings

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** copilot-settings
**Description:** Configuration interface for AI copilot preferences, model selection, permissions, and behavior tuning. Auxiliary archetype for copilot-powered applications.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 1 (copilot-config)
**Key patterns:** form-sections [complex], account-settings [moderate]
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.mono-data`
**Density:** comfortable
**Voice:** Concise and helpful.

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
| `--d-text` | `#FAFAFA` | Body text, headings, primary content |
| `--d-border` | `#3F3F46` | Dividers, card borders, separators |
| `--d-primary` | `#7C93B0` | Brand color, key interactive, selected states |
| `--d-surface` | `#1F1F23` | Cards, panels, containers |
| `--d-bg` | `#18181B` | Page canvas / base layer |
| `--d-text-muted` | `#A1A1AA` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#8CA3C0` | Hover state for primary elements |
| `--d-surface-raised` | `#27272A` | Elevated containers, modals, popovers |
| `--d-accent` | `#6B8AAE` | CTAs, links, active states, glow effects |

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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

settings, model-config, permissions

---

## Visual Direction

**Personality:** Minimal, unobtrusive AI assistant that enhances without overwhelming. The copilot panel is a sleek right-side drawer — dark carbon surface with soft shadows. Suggestions appear as ghost text or subtle card overlays near the user's focus. Main app takes center stage; AI is always available but never demands attention. Actions have clear accept/reject affordances. Context breadcrumbs show what the AI sees. Think GitHub Copilot meets Linear's command palette. Lucide icons. Geist Mono for AI outputs.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pattern Reference

### form-sections

Grouped form fields organized in labeled sections with validation

**Visual brief:** Vertical stack of grouped form fields. Each section has a heading/description on the left and form controls on the right (2-column at desktop, stacked on mobile). Labels above fields. Max-width 640px. Single card wrapping or no card. Save/cancel buttons at bottom.

**Components:** Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup

**Composition:**
```
Field = Stack(flex-col) > [Label(font-medium) + Input(d-control) + ErrorText?(d-annotation, text-destructive)]
Section = Card(d-surface) > [SectionTitle(heading4) + Description?(text-muted) + FieldGroup(d-control, grid: 1/2-col)]
FieldGroup = Grid > Field[]
FormSections = Container(d-section, flex-col, gap-6) > [Section[] + ActionButtons]
ActionButtons = Row(d-interactive) > [SaveButton(variant: primary) + CancelButton(variant: ghost)]
```

**Layout slots:**
- `actions`: Bottom-aligned save/cancel buttons
- `section`: Card with 2-column layout: labels left, fields right
- `field-group`: Grid of form fields with _grid _gc1 _lg:gc2 _gap4
- `section-title`: Section heading with _heading4 and description with _bodysm _fgmuted
  **Layout guidance:**
  - note: Labels go ABOVE their field, not side-by-side. This prevents the label-field gap problem at wide viewports.
  - textarea: Textareas should have min-height: 6rem to visually differentiate from single-line inputs.
  - max_width: Form content should be constrained to max-width: 40rem (640px). Full-width forms are hard to read.
  - icon_placement: Section header icons render INLINE with the heading text (icon left of heading, vertically centered), not floating outside the card border.
  - label_position: stacked
  - select_styling: Apply d-control to ALL form elements including <select>. Add appearance: none and a custom SVG chevron for consistent styling.
  - section_grouping: Group related fields under section headers. Use a SINGLE d-surface card for the entire form, OR no card at all. Do NOT wrap each section in its own separate card.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Collapsible sections expand/collapse with 250ms ease height transition. Validation errors shake the invalid field with a 300ms horizontal oscillation (translateX +/-4px). |
| transitions | Section content fades in on expand with 200ms ease. Step transitions in creation preset cross-fade over 250ms. |

**Accessibility:**
- Role: `form`
- Keyboard: Tab navigates between form fields; Shift+Tab navigates backwards between fields; Enter submits when focus is on submit button; Space toggles checkboxes and switches; Arrow keys navigate within radio groups
- Announcements: Validation error: {field} — {message}; Section {name} expanded; Section {name} collapsed; Form submitted successfully
- Focus: First invalid field receives focus on failed validation. On section expand, focus moves to first field in the section. On step change in creation preset, focus moves to first field of new step.


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

---

## Pages

### copilot-config (/copilot/config)

Layout: form-sections → account-settings
