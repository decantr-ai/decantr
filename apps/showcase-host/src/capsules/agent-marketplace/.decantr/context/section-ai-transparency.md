# Section: ai-transparency

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** ai-transparency
**Description:** AI model observability and transparency dashboard for inspecting inference logs, confidence distributions, and neural feedback cycles across deployed models.

## Quick Start

**Shell:** Responsive sidebar shell with a desktop split layout, a compact sticky header, and an overlay drawer below the md breakpoint. Used by dashboards, account workspaces, and admin operations surfaces. (nav: 240px, header: 52px)
**Pages:** 3 (model-overview, inference-log, confidence-explorer)
**Key patterns:** stats-overview, neural-feedback-loop [moderate], agent-timeline [moderate], intent-radar [moderate]
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.neon-glow`, `.mono-data`
**Density:** comfortable
**Voice:** Operational and precise.

## Shell Implementation (sidebar-main)

### body

- **flex:** 1
- **note:** Sole scroll container. Page content renders directly here. No wrapper div around outlet. Inner sections should inherit the shell rhythm rather than redefining page padding.
- **atoms:** _flex1 _overflow[auto] _p6
- **padding:** clamp(1rem, 2vw, 1.5rem)
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
- **padding:** 0 clamp(1rem, 2vw, 1.5rem)
- **left_content:** Breadcrumb — omit segment when it equals page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Theme toggle (sun/moon icon) + Search/command trigger + mobile navigation toggle when the sidebar is in drawer mode. Theme toggle toggles light/dark class on html element.

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
- **mobile_behavior:** Overlay drawer below md. Closed state occupies no layout width. Open state uses a fixed panel + scrim.
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

## Section Label Treatment

Apply `d-label[data-anchor]` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Left accent border anchor (data-anchor variant)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: compact (--d-density-scale: 0.65)

## Shell Notes (sidebar-main)

- **Hotkeys:** Navigation hotkeys defined in the essence are keyboard shortcuts. Implement as useEffect keydown event listeners — do NOT render hotkey text in the sidebar UI.
- **Collapse:** Sidebar collapse toggle should be integrated into the sidebar header area (next to the brand/logo), not floating at the bottom of the sidebar.
- **Breadcrumbs:** For nested routes (e.g., /resource/:id), show a breadcrumb trail above the page heading inside the main content area. On narrow widths, truncate gracefully rather than wrapping into a second shell row.
- **Empty States:** When a section has zero data, show a centered empty state: 48px muted icon + descriptive message + optional CTA button.
- **Mobile Drawer:** Below the md breakpoint, the sidebar leaves the permanent split layout and becomes an overlay drawer. Use a scrim, Escape handling, and a header toggle. The closed drawer must not consume layout width.
- **Shell Spacing:** Header, body, sidebar, and footer all share one inset rhythm. Use a tighter shell inset on mobile and the full comfortable inset on tablet/desktop instead of page-local padding overrides.
- **Section Labels:** Dashboard section labels use d-label[data-anchor] for accent-bordered headers with density-responsive spacing.
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
| Label gap | `--d-label-mb` | `0.75rem` | Gap below d-label section headers |
| Label indent | `--d-label-px` | `0.75rem` | Anchor indent for d-label[data-anchor] |
| Section gap | `--d-section-gap` | `1.5rem` | Gap between adjacent d-sections |
| Annotation gap | `--d-annotation-mt` | `0.5rem` | Top margin on d-annotation |

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

| Class | Intent | Key CSS | Pairs with |
|-------|--------|---------|------------|
| `.carbon-card` | Use for content containers. Hover state gains a subtle neon cyan shadow accent for the data-intensive, mission-control feel. |  | carbon-canvas,carbon-divider |
| `.carbon-code` | Use for code blocks and terminal output. The left border accent uses the neon cyan for a more vivid developer-tool feel. |  | carbon-card,carbon-canvas |
| `.carbon-glass` | Use for navigation and floating panels. In carbon-neon, these surfaces receive subtle neon accent highlights on interactive states. |  | carbon-canvas,carbon-card |
| `.carbon-input` | Use for form inputs. On focus, the neon cyan accent creates a vivid glow ring that differentiates this from base carbon. |  | carbon-card,carbon-canvas |
| `.carbon-canvas` | Use as the root page background. Identical to carbon but serves as the dark canvas for neon accent pops. |  | carbon-glass,carbon-divider |
| `.carbon-divider` | Use to separate content sections cleanly. The neon accent appears on interactive elements, not dividers. |  | carbon-card,carbon-canvas |
| `.carbon-skeleton` | Use while agent data or dashboard metrics load. The pulse indicates active data fetching without visual noise. |  | carbon-card,carbon-canvas |
| `.carbon-bubble-ai` | Use for AI/agent responses in chat interfaces. Neutral surface lets the content and any inline neon status indicators stand out. |  | carbon-bubble-user,carbon-canvas |
| `.carbon-fade-slide` | Use as the entrance animation for dashboard panels and data cards appearing on load. |  | carbon-card,carbon-glass |
| `.carbon-bubble-user` | Use for user messages in agent chat interfaces. The tint is subtler, letting neon accents on status elements take visual priority. |  | carbon-bubble-ai,carbon-canvas |

**Decorator usage guide:**
- `.carbon-card`: Agent status cards, Data panels, Dashboard widgets, Metric containers
- `.carbon-code`: Code blocks, Terminal output, API responses, Agent logs
- `.carbon-glass`: Navigation bars, Sidebar panels, Floating panels, Sticky headers
- `.carbon-input`: Text inputs, Search fields, Text areas, Select dropdowns
- `.carbon-canvas`: Page root containers, App shell backgrounds
- `.carbon-divider`: Section dividers, List separators, Content breaks
- `.carbon-skeleton`: Loading skeletons, Metric placeholders, Agent status placeholders
- `.carbon-bubble-ai`: Agent responses, System messages, Streaming output
- `.carbon-fade-slide`: Page entrance animations, Dashboard widget reveals, Card stagger animations
- `.carbon-bubble-user`: User chat messages, Command inputs

**Compositions:** **auth:** Centered auth forms with clean card styling.
**chat:** Chat interface with conversation list sidebar and message thread. Anchored input at bottom.
**marketing:** Marketing pages with top nav and footer. Clean sections with subtle separators.
**Spatial hints:** Density bias: none. Section padding: 5rem. Card wrapping: minimal.


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

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

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
  **Layout guidance:**
  - card_balance: Each stat card should keep label, value, and trend tightly grouped so the row scans left-to-right without extra decorative chrome. Trend indicators should support the value, not become a second headline.
  - grid_ownership: The pattern owns the internal stat grid only. Parent workspace or section patterns should provide the intro copy, surrounding card frame, and larger vertical rhythm.
  - highlighted_variant: When using the highlighted preset, the featured stat may grow in prominence, but secondary stats should remain aligned as one coherent summary system rather than turning into unrelated cards.
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
- `flow-track`: A directional flow visualization showing throughput or progress. Renders animated particles (small circles or dots) moving along a track path. Particle speed represents processing rate. Particle count represents queue depth or load. Track can be linear (inline-flow preset) or circular (following IntensityRing). Uses CSS animation with translateX/rotate transforms.
- `pulse-core`: The central animated element. Renders as a radial gradient that expands and contracts with CSS animation. Pulse frequency: idle (2s cycle), processing (0.8s cycle), high-load (0.4s cycle). Pulse amplitude maps to metric intensity. Uses @keyframes with custom cubic-bezier(0.4, 0, 0.2, 1) for organic feel. Core color is the base metric color.
- `metric-label`: MetricDisplay showing the current numeric value, unit, and descriptive label. Examples: '94% confidence', '1.2k tok/s', 'Stage 3/7'. Typography should use tabular-nums for stable width during value changes. Color matches the current intensity color. Supports trend arrow (up/down/stable) suffix.
- `detail-tooltip`: FeedbackTooltip providing expanded context on hover or focus. Shows: current value, min/max range, trend over last N seconds, and a plain-language interpretation (e.g., 'Model is highly confident', 'Processing is slower than usual'). Tooltip positioned above the core element. Includes a small sparkline if trend data is available.
- `intensity-ring`: IntensityRing renders a circular or arc gauge showing metric fill from 0% to 100%. Implemented with CSS conic-gradient: from transparent to the intensity color, with a smooth gradient edge. Ring thickness and diameter are configurable. The unfilled portion uses a muted background track color. Optional tick marks at 25% intervals.
  **Layout guidance:**
  - containment: This pattern should read as one feedback instrument, not a general dashboard section. Parent layouts own outer spacing; the pattern owns the core/ring/track stack and any tooltip anchoring immediately around it.
  - ambient_usage: Ambient preset is a surface treatment, not a layout wrapper. If used behind other content, keep foreground cards and labels on a separate readable layer so the feedback motion never becomes the structural container.
  - signal_priority: PulseCore establishes live state first, IntensityRing carries the stable metric read, and MetricDisplay confirms the exact value. FlowTrack should support the interpretation rather than competing with the primary metric.
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
- `event-node`: Repeating slot — one per agent action. Each event is a card positioned to the right of the timeline-track, connected by a small horizontal line from the track to the card. The card has a colored left-border indicating event type: tool-call (blue/info), reasoning (purple/accent), output (green/success), error (red/destructive), decision (amber/warning). Each card shows: (1) a type icon matching the color, (2) a one-line summary (e.g., 'Called search_web with query "decantr patterns"'), (3) a relative timestamp ('2.3s ago' or '+1.2s'), and (4) a chevron toggle to expand/collapse the detail section. Cards are collapsed by default. Error events auto-expand and have a stronger visual treatment (background tint, bold border). Events animate in with a subtle slide-up + fade when appended in live mode.
- `filter-bar`: A horizontal scrollable row of FilterChip components for narrowing visible events. Default chips: 'All', 'Tool Calls', 'Reasoning', 'Outputs', 'Errors', 'Decisions'. Chips are toggleable (multiple can be active simultaneously). Active chips use a filled style with the corresponding event-type color; inactive chips use an outline style. Also includes a text search input at the right edge for filtering events by content. Filter state persists across live updates. Chip counts show how many events match each filter (e.g., 'Tool Calls (12)').
- `event-detail`: The expandable content area within each event-node. Content varies by event type: For tool-call events — shows the tool name, input parameters as a formatted JSON/key-value block, output/result as a collapsible code block, duration in milliseconds, and token cost. For reasoning events — shows the full reasoning text formatted as markdown with a 'thinking' visual treatment (slightly italic, indented, with a brain icon). For output events — shows the generated text or data, formatted with markdown rendering. For error events — shows the error message, stack trace in a scrollable code block, and a 'retry' button if the error is retryable. For decision events — shows the decision description, alternatives considered as a list, and the selected option highlighted.
- `summary-header`: A sticky header card at the top of the timeline showing aggregate stats for the current agent session. Displays: total events count, breakdown by type (tool calls, reasoning steps, outputs, errors) as small labeled counts with color-coded dots, total elapsed time, and token usage (input/output tokens). Also shows the agent's name, model identifier, and current status (running/complete/error). In the 'live' preset, the elapsed time and event count update in real time. A small sparkline chart shows event frequency over time (events per second) to visualize bursts of activity.
- `timeline-track`: The vertical spine of the timeline. Renders as a thin continuous line (2px) running vertically down the left side of the event list (24px from the left edge). The line color uses a muted neutral tone with segments that colorize to match adjacent event nodes. Between events, the line can show elapsed time labels if the gap exceeds a configurable threshold (default 5s). At the bottom of a completed timeline, the track terminates with a small square end-cap. During live streaming, the bottom is an animated pulsing dot.
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
- `action-zone`: The interactive outer ring of the radar. When an intent vector's confidence exceeds the action threshold (configurable, default 0.75), a SuggestionChip materializes at the vector's endpoint on the outer ring. Each chip shows the suggested action label, a keyboard shortcut hint, and a small confidence percentage. Chips are clickable/tappable to execute the action. Multiple high-confidence suggestions can coexist on the ring. Chips pulse gently to draw attention, with the highest-confidence chip pulsing most prominently. Pressing Enter executes the top-confidence chip.
- `radar-center`: The focal point of the radial display. Renders as a glowing circle (40–56px diameter) at the exact center of the radar. Shows the current input query text or a microphone/search icon when idle. Pulses gently with a ring animation when the system is interpreting intent. Color shifts from neutral (idle) to primary (active) to accent (confident match found). Acts as the origin point from which all intent vectors radiate.
- `intent-vector`: Repeating slot — one per detected intent category. Each vector is a line segment radiating from radar-center outward at an angle determined by the intent's semantic category (e.g., 'create' at 0°, 'search' at 90°, 'navigate' at 180°, 'configure' at 270°). Length corresponds to confidence score (0–1 maps to 0%–100% of radar radius). Line thickness also scales with confidence (1px at low, 3px at high). The vector terminates in a small labeled dot showing the intent category name. Vectors animate smoothly when confidence values update — growing, shrinking, or rotating as the user types. Color is category-coded using theme accent palette.
- `confidence-arc`: A filled arc segment drawn along the suggestion rings corresponding to each intent vector's angular spread. Width of the arc represents ambiguity — a narrow arc means precise intent, a wide arc means the system is uncertain between adjacent categories. Fill uses a gradient from the vector's color at center to transparent at edges. Arcs animate smoothly as confidence refines. Multiple overlapping arcs create visual 'heat zones' showing where intent energy clusters.
- `suggestion-ring`: Concentric rings at 33%, 66%, and 100% of the radar radius. These are subtle dashed circles that provide visual scale for confidence levels. When a suggestion reaches a ring threshold, the ring segment nearest to that vector briefly brightens. The outermost ring represents the action zone — suggestions that reach it are high-confidence and ready to execute. Rings use very low opacity (0.1–0.15) to avoid visual clutter.
  **Layout guidance:**
  - compact_fallback: When the pattern collapses to compact or inline modes, preserve the same semantic order: current query or intent core first, ranked suggestions second, execution affordances last. Do not let chip rows drift away from their associated confidence signal.
  - container_rhythm: Treat the radar as a single focal visualization region. Parent layouts own section spacing; this pattern owns only its square or semi-circular visualization frame and the immediate chip/action zone around it.
  - radial_hierarchy: Keep radar-center visually dominant, suggestion rings secondary, and action-zone chips tertiary until confidence rises. The outer action ring should feel like the execution boundary, not a second unrelated toolbar.
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
