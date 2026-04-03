# Section: spatial-workspace

**Role:** primary | **Shell:** canvas-overlay | **Archetype:** spatial-workspace
**Description:** Immersive spatial workspace with depth-layered canvases, holographic controls, and real-time presence indicators for collaborative creative work.

## Quick Start

**Shell:** canvas-overlay shell
**Pages:** 2 (workspace, workspace-settings)
**Key patterns:** depth-layered-canvas [moderate], holographic-control-bar [moderate], spatial-presence-ring [moderate], nav-header, form-sections [complex]
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`
**Density:** comfortable
**Voice:** Minimal and spatial-aware.

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

**Zone:** App (primary) — canvas-overlay shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

spatial, collaboration, drag-drop, real-time, presence

---

## Visual Direction

**Personality:** Immersive spatial workspace with depth and presence. Glassmorphic floating panels over depth-layered backgrounds. Smooth spring animations for all transitions. Presence indicators use warm accent colors. Think Figma meets a sci-fi command bridge. System sans-serif typography. Minimal chrome, maximum canvas.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### depth-layered-canvas

A true z-axis spatial layout with foreground, midground, and background layers using CSS perspective and transform-style: preserve-3d. Layers stack along the depth axis with parallax scrolling and focal-plane blur effects. For immersive dashboards, data landscapes, and spatial storytelling where information lives at different visual depths.

**Visual brief:** Three-plane spatial layout using CSS perspective and preserve-3d transforms. Background layer sits deepest with ambient gradients or data visualizations, rendered with blur and slow parallax. Midground layer holds the primary content cards and panels at normal focus. Foreground layer contains interactive controls, tooltips, and floating action elements at the closest depth. A depth slider control on the edge lets users adjust focal plane. Layers shift on scroll with different parallax rates. The flat-fallback preset collapses all layers to a standard stacked layout for reduced-motion preference.

**Components:** SpatialLayer, FocalPoint, DepthSlider, ParallaxContainer, BlurMask

**Composition:**
```
DepthControls = Panel(d-control, floating) > [DepthSlider(d-control) + FlatToggle(d-interactive)]
MidgroundLayer = SpatialLayer(d-surface, z-mid, parallax: 0.7x) > Content[]
BackgroundLayer = SpatialLayer(d-surface, z-back, blur, parallax: 0.3x)
ForegroundLayer = SpatialLayer(d-interactive, z-front, parallax: 1x) > Controls[]
DepthLayeredCanvas = Container(d-section, perspective, preserve-3d, full) > [BackgroundLayer + MidgroundLayer + ForegroundLayer + DepthControls?]
```

**Layout slots:**
- `content`: Story/about narrative text content
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
**Responsive:**
- **Mobile (<640px):** Collapse to flat-fallback preset. Stack layers vertically. DepthSlider hidden. Focal-point renders inline without blur effect.
- **Tablet (640-1024px):** Reduce parallax intensity to 50%. Two visible planes (midground + foreground). Background becomes a static backdrop. DepthSlider available but simplified.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves focus between interactive elements across all layers, foreground-first; Arrow Up/Down adjusts depth slider when focused; Escape collapses to flat fallback view; F key toggles focal-point spotlight mode
- Announcements: Announce active focal layer when depth changes; Announce when transitioning between flat and spatial view


### holographic-control-bar

A floating, detachable toolbar that follows user focus with glassmorphic depth treatment. Can dock to any viewport edge or float freely via drag-to-reposition. Semi-transparent with backdrop blur and subtle border luminance. For spatial UIs, immersive workspaces, creative tools, and any interface where persistent controls must not occlude content.

**Visual brief:** Floating glassmorphic toolbar with backdrop blur, semi-transparent background, and subtle luminant border. Contains grouped action buttons with icon-only or icon+label styles. A drag handle on one end allows repositioning anywhere in the viewport. Docks to viewport edges with a snap animation when dragged near them. Docked-bottom preset fixes the bar along the bottom edge. Docked-side preset fixes along a vertical edge. Minimal preset reduces to a small floating pill with only essential actions. A subtle glow or shimmer effect reinforces the glassmorphic treatment.

**Components:** FloatingBar, ActionGroup, DragHandle, DockTarget, PositionIndicator

**Composition:**
```
DragHandle = Handle(d-interactive, min-44px, cursor: grab)
ActionGroup = Group(d-interactive, gap-2, divider) > IconButton[]
DockIndicator = Indicator(d-annotation, glow: near-dock)
HolographicControlBar = Bar(d-control, glassmorphic, backdrop-blur, floating) > [DragHandle(grip-pattern) + ActionGroup[] + DockIndicator?]
```

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Default to docked-bottom preset. Drag-to-float disabled (too imprecise on touch). Swipe down to dismiss, swipe up to restore. Action groups scroll horizontally if overflow.
- **Tablet (640-1024px):** All presets available. Drag handle enlarged for touch (56x56px). Dock snap threshold increased to 60px. Floating position persisted across sessions.

**Accessibility:**
- Role: `toolbar`
- Keyboard: Tab navigates between action groups, then between actions within each group; Arrow Left/Right moves between actions within a group; G key grabs the bar for keyboard repositioning, Arrow keys move, Enter drops; D key cycles between dock positions (float, bottom, left, right); Escape releases grab or collapses to minimal preset
- Announcements: Announce dock state changes: 'Control bar docked to bottom', 'Control bar floating'; Announce when bar is dragged to a new position; Announce expand/collapse in minimal preset


### spatial-presence-ring

A circular or arc display showing nearby agents and users with live status indicators. Ring segments represent participants, expanding on hover or focus to reveal details. Segments are distributed evenly around the ring with smooth reflow when participants join or leave. For collaborative workspaces, multiplayer agent UIs, and real-time presence-aware interfaces.

**Visual brief:** Circular ring display where each participant occupies an arc segment proportional to their activity level. Segments distribute evenly around the ring with subtle dividers. Each segment shows a small avatar and a status dot (green/yellow/red). Expanding a segment on hover reveals a detail popover with name, role, and activity details. The ring track itself is rendered as a conic gradient or SVG circle. The half-arc preset shows only the top semicircle. The linear-fallback preset arranges participants in a horizontal row for simpler layouts. Smooth reflow animation when participants join or leave.

**Components:** PresenceRing, PresenceSegment, StatusDot, DetailPopover, UserAvatar

**Composition:**
```
RingTrack = Ring(d-data, circular) > PresenceSegment[]
CenterContent = Panel(d-surface, inner) > [ParticipantCount + SharedContext?]
DetailPopover = Popover(d-surface, radial-position) > [FullName + RoleLabel(d-annotation) + Activity(text-muted) + ActionButtons(d-interactive)]
PresenceSegment = Segment(d-interactive, expandable) > [UserAvatar(small) + StatusDot(d-annotation, color: state, pulse?: active)]
SpatialPresenceRing = Container(d-section, centered) > [RingTrack + CenterContent]
```

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Switch to linear-fallback preset. Horizontal scrollable avatar row with status dots. Tap to expand detail popover as a bottom sheet. Maximum 8 visible before overflow count badge.
- **Tablet (640-1024px):** Half-arc preset by default to save vertical space. Segments are touch-sized (48px minimum). Detail popover appears as a card overlay rather than radial popup.

**Accessibility:**
- Role: `group`
- Keyboard: Tab enters the ring, then Arrow Left/Right cycles between segments; Enter or Space expands the focused segment's detail popover; Escape closes the detail popover and returns focus to the segment; Home/End jumps to first/last segment in ring order
- Announcements: Announce when a participant joins: '[Name] joined, [N] participants active'; Announce when a participant leaves: '[Name] left'; Announce status changes: '[Name] is now [status]'; Announce segment expansion: 'Viewing details for [Name], [role]'


### nav-header

Top navigation bar with logo, links, and actions.

**Visual brief:** Horizontal navigation bar pinned to the top of the viewport. The bar spans full width with a subtle bottom border separating it from page content. Logo or wordmark sits on the far left with comfortable left padding. Navigation links are arranged horizontally in the center (or left-of-center) with even spacing and medium-weight text that highlights on hover with an underline or color shift. Action buttons (login, sign up) cluster on the far right — the primary action uses a filled button, secondary uses ghost. The bar has a fixed height (~60px) with vertically centered content. On scroll, the header may gain a subtle backdrop blur and elevated shadow.

**Components:** Button, Link, icon

**Composition:**
```
NavLinks = Row(d-interactive, gap-4) > Link(hover: underline)[]
NavHeader = Bar(d-section, row, space-between, border-bottom, full-width) > [Logo + NavLinks + ActionButtons]
ActionButtons = Row(d-interactive, gap-2) > [LoginButton(variant: ghost) + SignUpButton(variant: primary)]
```

**Layout slots:**
- `logo`: Brand logo or wordmark, left-aligned
- `links`: Horizontal navigation links with _flex _gap4
- `actions`: Action buttons (login, signup) right-aligned with _flex _gap2
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Link hover underline slides in from left with 200ms ease. Dropdown chevron rotates 180deg on open. Active link indicator transitions position with 250ms ease. |
| transitions | Mobile menu slides in from right with 300ms ease-out transform. Backdrop fades in over 200ms. Dropdown menus fade in and translate down 4px over 200ms. Sticky header shadow transitions in over 150ms on scroll. |

**Responsive:**
- **Mobile (<640px):** Navigation links collapse into a hamburger menu icon (three horizontal lines) on the right. Tapping the hamburger opens a full-height slide-in panel from the right or a dropdown overlay with vertically stacked links and action buttons. Logo remains visible. Close button (X icon) in the panel header.
- **Tablet (640-1024px):** Navigation links may remain visible if few (3-4 items), otherwise collapse to hamburger. Action buttons stay visible next to hamburger. Padding reduces to px4.
- **Desktop (>1024px):** Full horizontal layout with all links visible. Logo left, links center, actions right. Hover states on links. Dropdown menus open on hover or click for nested navigation.

**Accessibility:**
- Role: `navigation`
- Keyboard: Tab navigates between navigation links and action buttons; Enter activates the focused link or button; Escape closes the mobile menu or open dropdown; Arrow Left/Right navigates between top-level links; Arrow Down opens a dropdown menu on focused link
- Announcements: Navigation menu expanded; Navigation menu collapsed; Submenu {name} opened
- Focus: Mobile menu button uses aria-expanded to reflect open/closed state. On menu open, focus moves to first link. On Escape, focus returns to the hamburger button.


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


---

## Pages

### workspace (/)

Layout: depth-layered-canvas as main-canvas → holographic-control-bar as tool-bar → spatial-presence-ring as collaborators

### workspace-settings (/settings)

Layout: nav-header → form-sections (structured) as workspace-preferences
