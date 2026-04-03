# Section: ai-transparency

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** ai-transparency
**Description:** AI model observability and transparency dashboard for inspecting inference logs, confidence distributions, and neural feedback cycles across deployed models.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (model-overview, inference-log, confidence-explorer)
**Key patterns:** stats-overview, neural-feedback-loop [moderate], agent-timeline [moderate], intent-radar [moderate]
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.neon-glow`, `.mono-data`
**Density:** comfortable
**Voice:** Operational and precise.

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
- **right_content:** Search/command trigger

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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

monitoring, analytics, observability

---

## Visual Direction

**Personality:** Confident cyber-minimal agent marketplace. Neon accent glows on dark void backgrounds. Monospace data typography. Agent status shown through color-coded rings and pulse animations. Think Linear meets a mission control center. Lucide icons. No decorative elements — every pixel serves the operator.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### stats-overview

Summary row of key statistics with labels, values, and optional trend indicators

**Visual brief:** Horizontal row of 3-5 stat summary items, each showing a muted small-text label above a large bold numeric value. Optional trend badges appear to the right of or below the value — green with up-arrow for positive changes, red with down-arrow for negative. In the standard preset, each stat lives in its own card surface with consistent padding (p4) and rounded corners. The compact preset renders stats inline in a single bar separated by vertical dividers, without individual card surfaces. The highlighted preset makes the first stat larger (spanning more grid space) with a sparkline visualization, while remaining stats are secondary size.

**Components:** Card, Badge, icon

**Composition:**
```
StatItem = Card(d-surface) > [Icon?(d-annotation, rounded-bg) + Label(text-muted, text-sm) + Value(heading3, mono-data) + TrendBadge?(d-annotation, variant: positive|negative)]
StatsOverview = Row(d-section, responsive: wrap) > StatItem[]
```

**Layout slots:**
- `label`: Metric label with _textsm _fgmuted
- `trend`: Badge with percentage change and directional icon
- `value`: Primary value with _heading2 _fontbold
- `stat-card`: Card containing label, value, and optional trend
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Stat values animate with counter effect (number rolls up from 0) over 800ms ease-out on viewport enter. Trend badges fade in after value completes. |
| transitions | Value text transitions smoothly on data change with 300ms ease. Trend arrow rotates on direction change. |

**Responsive:**
- **Mobile (<640px):** Two-column grid (2x2 or 2x3). Compact preset wraps to two rows. Value text reduces to heading3 scale. Trend badges stack below values instead of inline.
- **Tablet (640-1024px):** Three or four columns depending on stat count. Compact preset stays single row if 4 or fewer items. Standard padding.
- **Desktop (>1024px):** Full single-row layout with all stats visible. Four columns standard. Highlighted preset shows featured stat at 2x width. Generous gap4 spacing.

**Accessibility:**
- Role: `region`
- Keyboard: Tab navigates between stat cards; Shift+Tab navigates backwards
- Announcements: {label}: {value}, {trend_direction} {trend_percent}; Statistics updated


### neural-feedback-loop

A bio-mimetic visualization that renders AI processing state through organic pulsing, color shifts, and flow animations. Displays model confidence, token consumption rate, processing stage, or any continuous metric as a living, breathing visual element. PulseCore radiates outward with intensity mapped to metric values. FlowTrack shows directional particle flow representing throughput. IntensityRing provides a clean circular gauge. For AI transparency UIs, model monitoring dashboards, and any interface that needs to make invisible AI processes tangible and legible.

**Visual brief:** Bio-mimetic circular visualization with a central PulseCore element that expands and contracts with breathing animation, its frequency mapped to processing state (slow idle pulse, rapid active pulse). Surrounding the core, an IntensityRing provides a clean circular gauge with fill level indicating the current metric value. FlowTrack renders directional particle animations flowing along arc paths to represent throughput. A MetricDisplay overlay shows the numeric value and label. The inline-flow preset linearizes the visualization as a horizontal pulsing bar. The ambient preset uses large subtle background pulses. Static-gauge renders as a simple circular progress ring without animation.

**Components:** PulseCore, FlowTrack, MetricDisplay, IntensityRing, FeedbackTooltip

**Composition:**
```
FlowTrack = Track(d-data, particle-animation, speed: rate) > Particle[]
PulseCore = Core(d-data, radial-gradient, pulsing: frequency-mapped, color-shift: metric)
DetailTooltip = Tooltip(d-surface, on-hover) > [CurrentValue + Range + Trend + Interpretation]
IntensityRing = Ring(d-data, conic-gradient, fill: 0-100%)
MetricDisplay = Label(d-annotation, mono-data, tabular-nums) > [Value + Unit + TrendArrow?]
NeuralFeedbackLoop = Container(d-section, centered) > [PulseCore + IntensityRing + MetricDisplay + DetailTooltip?]
```

**Layout slots:**
- `values`: Value cards (icon/emoji, title, description)
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| gauge-update | value transition 500ms ease-out with number counter |
| threshold-cross | flash border-color 300ms + scale(1.02) on threshold breach |
| panel-toggle | height 0→auto + fade 300ms ease-out |
| metric-refresh | cross-fade 200ms ease-in-out |
| data-stream | translateY scroll-like 1s linear infinite on live data |
| confidence-pulse | opacity oscillate 0.7→1 3s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Use inline-flow or static-gauge preset. Radial preset requires minimum 160px container. FlowTrack particle count reduced for performance. FeedbackTooltip appears as a bottom sheet on tap rather than hover tooltip.
- **Tablet (640-1024px):** All presets available. Radial preset scales to container. Touch targets for tooltip activation are 44px minimum. Ambient preset works well as a page background on tablet.

**Accessibility:**
- Role: `status`
- Keyboard: Tab focuses the feedback element, announcing current metric value; Enter or Space opens the detail tooltip; Escape closes the detail tooltip
- Announcements: Announce significant metric changes: 'Confidence increased to 94%'; Announce state transitions: 'Processing started', 'Processing complete'; Announce threshold crossings: 'Token rate exceeded limit'; Provide metric summary on focus: '[Metric name]: [value], [trend]'


### agent-timeline

A vertical timeline for agent observability that displays actions, decisions, tool calls, and reasoning steps as collapsible color-coded events with filtering, detail expansion, and summary statistics.

**Visual brief:** Vertical timeline with a continuous 2px line on the left edge. Color-coded orbs mark each event type (action=cyan, decision=green, error=red, tool_call=purple, reasoning=amber). Cards extend right from the line with colored left-borders. Sticky summary header at top with aggregate stats. Filter chips below header.

**Components:** TimelineEvent, EventDetail, ToolCallCard, ReasoningStep, FilterChip, TimelineSummary

**Composition:**
```
EventList = Track(d-data, vertical-line) > EventNode[]
EventNode = Card(d-surface, color-left-border: event-type, collapsible) > [TypeIcon + Summary + Timestamp(mono-data) + ChevronToggle + EventDetail?]
FilterBar = Row(d-control, scrollable) > FilterChip(toggleable, color: event-type)[]
EventDetail = Panel(d-data, expandable) > [Content(variant: event-type)]
AgentTimeline = Container(d-section, flex-col, gap-4) > [TimelineSummary + FilterBar + EventList]
TimelineSummary = Card(d-surface, sticky) > [AgentName + ModelId + Status(d-annotation) + EventCounts(d-data) + ElapsedTime(mono-data) + TokenUsage]
```

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)
  **Layout guidance:**
  - orb: Each event has a 12px diameter colored circle (orb) centered ON the vertical line. The orb is vertically aligned with the FIRST line of text (the badge/timestamp row), not the center of the event block.
  - spacing: Compact event spacing: gap-3 to gap-4 between events. Dense timelines are easier to scan than spacious ones.
  - badge_size: Event type badges use d-annotation with at least 0.7rem font and enough padding to be scannable at speed.
  - event_colors: Each event TYPE must have a DISTINCT color. No two types share the same color. Suggested: action=cyan(accent), decision=green(success), error=red(error), warning=amber(warning), tool_call=purple, reasoning=amber/gold, info=blue(info).
  - vertical_line: A continuous 2px vertical line runs the FULL height of the timeline, 16px from the left edge. Color: var(--d-border). The line MUST NOT have gaps between events — it connects all events visually.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| orb-pulse | scale(1→1.2→1) 2s ease-in-out infinite on active events |
| event-hover | translateX(2px) + border-accent 150ms ease-out |
| new-event | slide-in-from-top + fade 400ms ease-out |
| event-expand | max-height 0→auto + fade 300ms ease-out |
| event-collapse | max-height auto→0 + fade 200ms ease-in |

**Responsive:**
- **Mobile (<640px):** Timeline track moves to a thin left-edge gutter (8px inset). Event cards span full width with reduced padding. Filter bar scrolls horizontally with momentum. Summary header stacks stats in a 2×2 grid. Event details render in a bottom sheet on tap rather than inline expansion to save vertical space.
- **Tablet (640-1024px):** Standard vertical layout maintained. Filter bar remains fully visible without scrolling (wraps to second row if needed). Event cards maintain comfortable padding. Summary header displays stats in a single row.

**Accessibility:**
- Role: `feed`
- Keyboard: Arrow Up/Down: navigate between timeline events; Enter: expand/collapse selected event detail; F: focus the filter bar search input; 1-6: toggle filter chips by position; Home: jump to first event; End: jump to latest event; Escape: collapse all expanded events and clear filters
- Announcements: New event: {type} — {summary}; Error occurred: {message}; Agent completed after {duration} with {event_count} events; Filter applied: showing {type} events only; Event details expanded for {summary}


### intent-radar

A radial polar interface that visualizes user intent as vectors radiating from a center point, with suggestions pulsing outward based on confidence scores — used for AI command palettes, intent disambiguation, and contextual action discovery.

**Visual brief:** Circular radial display with a glowing center point showing the current input query. Intent suggestion vectors radiate outward as labeled lines with lengths proportional to confidence scores. High-confidence suggestions appear closer to the edge with brighter colors; low-confidence ones are shorter and dimmer. SuggestionChip components sit at the end of each vector as clickable pill labels. The radar has subtle concentric circle gridlines. Compact preset renders as a smaller inline widget. The inline preset displays a horizontal confidence bar instead of the radial layout.

**Components:** RadarDisplay, IntentVector, SuggestionChip, ConfidenceIndicator, ActionButton

**Composition:**
```
ActionZone = Ring(d-interactive, outer) > SuggestionChip(d-interactive, confidence-pulse)[]
IntentRadar = Display(d-section, spatial, aspect-square) > [SuggestionRings + IntentVectors + RadarCenter + ActionZone]
RadarCenter = Core(d-interactive, glowing, pulsing: interpreting) > [QueryText | SearchIcon]
IntentVectors = Layer > IntentVector(d-data, radial, length: confidence, color: category)[]
SuggestionRings = Layer > Ring(d-annotation, dashed, opacity-low)[]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| label-reveal | fade + translateY(4px→0) 200ms ease-out on hover |
| segment-hover | opacity 0.7→1 + scale(1.02) 150ms ease-out |
| data-update | segment-size lerp 500ms ease-out |
| focus-shift | highlight-ring transition 300ms ease-out |
| pulse-ring | scale(1→1.3) + opacity(1→0) 2s ease-out infinite |
| radar-sweep | rotation 8s linear infinite on scan indicator |

**Responsive:**
- **Mobile (<640px):** Switches to compact semi-circular mode automatically. Suggestion chips render as a vertically scrollable list below the half-radar rather than on the arc. Touch-friendly chip sizes (min 44px tap target). Confidence arcs simplified to solid fills.
- **Tablet (640-1024px):** Full radial radar with slightly reduced radius. Suggestion chips remain on the outer ring but increase tap target size. Two-column chip overflow if more than 6 suggestions.

**Accessibility:**
- Role: `search`
- Keyboard: Type: refine intent — vectors update in real time; Arrow Up/Down: cycle through ranked suggestions by confidence; Enter: execute the currently highlighted suggestion; Tab: move focus between action-zone chips; Escape: clear input and reset radar to idle state; 1-9: quick-select suggestion by rank number
- Announcements: Top suggestion: {action} with {confidence}% confidence; {count} possible intents detected; Action {name} selected, press Enter to execute; Intent narrowed to {category}


---

## Pages

### model-overview (/transparency)

Layout: stats-overview as model-kpis → neural-feedback-loop as feedback-summary

### inference-log (/transparency/inference)

Layout: agent-timeline as inference-trace

### confidence-explorer (/transparency/confidence)

Layout: intent-radar as confidence-distribution → stats-overview as metric-breakdown
