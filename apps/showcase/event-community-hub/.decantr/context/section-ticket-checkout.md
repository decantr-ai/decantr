# Section: ticket-checkout

**Role:** auxiliary | **Shell:** minimal-header | **Archetype:** ticket-checkout
**Description:** Ticket selection and checkout flow for events. Guides users through tier selection, attendee info, and payment in a focused, distraction-free interface.

## Quick Start

**Shell:** Slim header with centered content below. Used for checkout flows, focused task pages. (header: 44px)
**Pages:** 1 (tickets)
**Key patterns:** stepper [moderate]
**CSS classes:** `.dopamine-card`, `.dopamine-glow`, `.dopamine-badge`
**Density:** comfortable
**Voice:** Enthusiastic and inclusive.

## Shell Implementation (minimal-header)

### body

- **flex:** 1
- **align:** center
- **atoms:** _flex _col _aic _overflow[auto] _flex1 _py8
- **padding:** 2rem 0
- **direction:** column
- **overflow_y:** auto
- **content_wrapper:**
  - gap: 1.5rem
  - note: Centered column for focused content. Checkout forms, task pages.
  - atoms: _w[720px] _mw[100%] _px4 _flex _col _gap6
  - width: 720px
  - padding: 0 1rem
  - direction: column
  - max_width: 100%

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **note:** Slim header with centered brand. Minimal — no nav links.
- **align:** center
- **border:** bottom
- **height:** 44px
- **sticky:** true
- **content:** Back arrow icon + brand link, centered
- **display:** flex
- **justify:** center
- **padding:** 0.75rem 0
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.

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
| `--d-text` | `#FFF0FA` | Body text, headings, primary content |
| `--d-border` | `#6B2068` | Dividers, card borders, separators |
| `--d-primary` | `#FF40ED` | Brand color, key interactive, selected states |
| `--d-surface` | `#2A0028` | Cards, panels, containers |
| `--d-bg` | `#1A0018` | Page canvas / base layer |
| `--d-text-muted` | `#C890B8` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#FF70F2` | Hover state for primary elements |
| `--d-surface-raised` | `#3A0038` | Elevated containers, modals, popovers |
| `--d-accent` | `#ffea00` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.dopamine-card` | Pill-rounded card with vivid gradient border, raised shadow in magenta-tinted color, and white surface. |
| `.dopamine-glow` | Background glow effect using radial gradient of primary and accent colors at 20% opacity behind elements. |
| `.dopamine-badge` | Neon-bright pill badge with gradient fill from primary to secondary, bold white text overlay. |
| `.dopamine-input` | Rounded input with gradient focus ring cycling primary to accent, generous padding and bouncy scale on focus. |
| `.dopamine-shimmer` | Animated shimmer gradient sweeping left to right across element surface for loading or emphasis. |

**Spatial hints:** Density bias: comfortable. Section padding: generous. Card wrapping: standard.


Usage: `className={css('_flex _col _gap4') + ' d-surface dopamine-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — minimal-header shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

tickets, checkout, payment

---

## Visual Direction

**Personality:** High-energy community hub with bold, vibrant visuals. Y2K-inspired maximalism with saturated event imagery. Event cards are punchy — bold titles, gradient accents, clear date badges. Community feed is social and lively with reactions and comments. Ticket selection is fun, not transactional. Live streams feel immersive with floating chat. Organizer dashboard balances energy with clarity. Lucide icons. Every interaction feels like joining a party.

## Pattern Reference

### stepper

A step indicator for multi-step workflows showing numbered circles connected by lines, with distinct visual states for completed, active, and upcoming steps.

**Visual brief:** A sequence of numbered circles connected by lines representing workflow progress. In the horizontal preset: circles are 36px diameter, arranged in a horizontal row with equal spacing, centered within the container. Each circle is connected to the next by a horizontal line (2px height) that runs from the right edge of one circle to the left edge of the next. Completed steps render as filled accent-colored circles (background: accent) with a white checkmark SVG icon (2px stroke, 16px size) replacing the number. The connector line following a completed step is solid accent color. The active step renders as a filled accent circle with the step number in white (text-sm, font-bold), plus a pulsing ring animation — a 44px ring in accent color at 20% opacity that scales from 1.0 to 1.3 and fades out over 2s, repeating infinitely. The connector line before the active step is solid accent; after it is dashed in border-muted color. Upcoming steps render as circles with a 2px border in border-muted color (no fill, transparent background) with the step number in text-muted color. Connectors between upcoming steps are 2px dashed lines in border-muted. Labels appear centered below each circle in horizontal mode: step name in text-sm (completed and active: text-default font-medium, upcoming: text-muted). In the vertical preset: circles are 32px diameter, arranged in a vertical column. Connectors are vertical lines (2px wide, 32px tall) running from the bottom of one circle to the top of the next, centered horizontally with the circles. Labels appear to the right of each circle (12px left margin): step name (text-sm, font-medium) on the first line, optional step description (text-xs, text-muted, max-width: 200px) on the second line. The vertical preset works well as a left sidebar with step descriptions providing additional context. In the minimal preset: circles are reduced to 10px diameter dots with no numbers or labels. Completed dots are filled accent. Active dot is filled accent with a subtle scale(1.2) and glow. Upcoming dots are 2px outlined in border-muted. No connector lines — just 8px gaps between dots. The entire stepper is centered.

**Components:** StepList, StepItem, StepConnector, StepLabel, StepIcon

**Composition:**
```
StepIcon = Circle(36px|32px|10px, state-driven-colors) > [Checkmark(completed) | Number(active|upcoming) | Dot(minimal)]
StepItem = Item(d-interactive?, flex-col|flex-row) > [StepIcon + StepLabel]
StepList = Container(role=list, flex) > [StepItem + StepConnector]* + StepItem(last)
StepLabel = Text(text-sm, below|beside circle) > [Name + Description?(vertical only)]
StepConnector = Line(2px, solid|dashed, accent|muted, flex-1|fixed-height)
```

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)
  **Layout guidance:**
  - note: The horizontal stepper is typically placed at the top of a multi-step form, spanning the full content width. The vertical stepper is placed in a left sidebar (200–280px wide). The minimal stepper is centered below or above the step content. Do not wrap in a card unless the stepper is part of a larger card component.
  - container: header, sidebar, or inline
  - step_states: Three states: completed (accent fill, white check), active (accent fill, white number, pulse ring), upcoming (muted border, muted number). The active step should always be visually prominent.
  - click_behavior: Completed steps MAY be clickable to allow navigating back. Active step is not clickable. Upcoming steps are not clickable unless the workflow allows skipping.
  - connector_alignment: Horizontal connectors MUST align vertically centered with the step circles. The connector starts at the right edge of circle N and ends at the left edge of circle N+1. Use flex layout with the connector as a flex-1 element between step items.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| dot-hover | scale 1→1.2, 150ms ease (minimal preset) |
| step-hover | scale 1→1.05 on circle, 150ms ease (completed steps only) |
| step-activate | circle background color muted→accent 300ms ease + pulse ring begins |
| step-complete | circle background color muted→accent 300ms ease + number fades out and checkmark fades in 200ms + connector color muted→accent 300ms ease |
| step-deactivate | pulse ring fades out 200ms |
| active-pulse | ring scale 1→1.3 + opacity 0.2→0, 2s ease-out infinite on the active step |

**Responsive:**
- **Mobile (<640px):** Horizontal preset collapses to show only the active step circle with label, plus small dots for other steps (like minimal preset) if more than 4 steps. Vertical preset remains full but with reduced label max-width (140px). Minimal preset stays the same. Step circles reduce to 32px horizontal. Connector lines shorten.
- **Tablet (640-1024px):** Horizontal preset shows all steps with labels truncated to 80px max-width. Vertical preset renders fully with descriptions. Circle size remains standard. Touch targets for clickable completed steps are 44px minimum.
- **Desktop (>1024px):** Full stepper with all labels visible. Horizontal labels can expand to 120px. Vertical descriptions show up to 2 lines. Hover effects on clickable completed steps (scale 1.05 on the circle, underline on label). Pulse animation on active step is smooth at 60fps.

**Accessibility:**
- Role: `list`
- Keyboard: Tab: move focus between clickable completed steps; Enter: navigate to a completed step (if back-navigation enabled); Arrow Left/Up: focus previous step (if navigable); Arrow Right/Down: focus next step (if navigable)
- Announcements: Step {number} of {total}: {name} — {completed|active|upcoming}; Step {name} completed; Now on step {number}: {name}; Navigated back to step {number}: {name}


---

## Pages

### tickets (/tickets)

Layout: stepper → checkout
