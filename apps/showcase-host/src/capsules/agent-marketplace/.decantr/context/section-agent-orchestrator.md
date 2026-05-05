# Section: agent-orchestrator

**Role:** primary | **Shell:** sidebar-main | **Archetype:** agent-orchestrator
**Description:** Multi-agent management dashboard for monitoring, configuring, and orchestrating autonomous agent swarms with real-time status and marketplace discovery.

## Quick Start

**Shell:** Responsive sidebar shell with a desktop split layout, a compact sticky header, and an overlay drawer below the md breakpoint. Used by dashboards, account workspaces, and admin operations surfaces. (nav: 240px, header: 52px)
**Pages:** 4 (agent-overview, agent-detail, agent-config, agent-marketplace)
**Key patterns:** agent-swarm-canvas [moderate], agent-timeline [moderate], neural-feedback-loop [moderate], nav-header, form-sections [complex], hero, generative-card-grid [moderate]
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

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

agents, monitoring, orchestration, real-time, websockets

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

### agent-swarm-canvas

A spatial node-graph canvas where AI agents appear as interactive nodes with real-time status, drag-to-connect edges, zoom/pan navigation, and a minimap for orchestration overview.

**Visual brief:** A dark, full-bleed spatial canvas with floating agent-node cards connected by animated bezier paths. Nodes show colored status rings (idle/running/error). Minimap in bottom-right, control bar bottom-center. Dot-grid background scales with zoom.

**Components:** AgentNode, ConnectionPath, StatusBadge, CanvasControls, Minimap, TaskTooltip

**Composition:**
```
AgentNode = Card(d-surface, data-interactive, positioned) > [Name + Avatar + StatusRing(pulse?: running) + TaskTooltip?]
ControlBar = Bar(d-control, bottom-center) > [ZoomIn + ZoomOut + FitView + ToggleMinimap + PlayPause + ResetLayout]
CanvasLayer = Canvas(zoomable, pannable) > [AgentNode[] + ConnectionPath[]]
StatusOverlay = Panel(d-annotation, backdrop-blur, top-right) > [AgentCount + RunningCount + ErrorCount + ProgressBar]
ConnectionPath = SVG(bezier, animated-dash) > Path(color: status)
AgentSwarmCanvas = Viewport(d-section, spatial, full-bleed) > [CanvasLayer + StatusOverlay + ControlBar + Minimap?]
```

**Layout slots:**
- `minimap`: A small (160×120px) overview panel anchored to the bottom-right corner. Renders a simplified, zoomed-out view of the entire node graph with colored dots for agents and thin lines for connections. Shows a draggable viewport rectangle indicating the current visible area. Semi-transparent background with subtle border.
- `agent-node`: Repeating slot — one per agent. Each node is a rounded card (80–120px wide) positioned absolutely on the canvas. Shows agent name, avatar/icon, and a colored status ring: idle (gray/neutral), running (blue/primary with pulse animation), error (red/destructive with shake), complete (green/success with checkmark). Nodes have connection ports (small circles) on left and right edges for drag-to-connect wiring. Clicking a node expands it inline to show current task description and elapsed time. Nodes support drag repositioning.
- `control-bar`: Horizontal toolbar anchored to the bottom-center of the canvas. Contains zoom-in, zoom-out, fit-to-view, and toggle-minimap icon buttons. Also includes a play/pause button for swarm execution and a reset-layout button that auto-arranges nodes using a force-directed algorithm. Buttons use icon-only rendering with tooltips on hover.
- `status-overlay`: A translucent overlay panel anchored to the top-right of the canvas viewport. Shows aggregate swarm stats: total agents, running count, error count, completed count, and overall progress as a thin horizontal bar. Collapses to a single summary badge on compact viewports. Uses backdrop-blur for depth.
- `canvas-viewport`: The main infinite-scroll canvas area. Uses CSS transform for zoom/pan. Contains all agent nodes and connection paths positioned absolutely via x/y coordinates. Must handle pointer events for drag-to-connect, pan (middle-click or space+drag), and pinch-to-zoom. Background should render a subtle dot-grid pattern that scales with zoom level.
- `connection-line`: SVG path elements drawn between agent-node connection ports. Uses bezier curves (cubic) with a slight droop. Animated dash pattern flows in the direction of data transfer. Line color reflects connection status: active (primary color, animated flow), idle (muted/dashed), error (destructive, static). Hovering a line shows a tooltip with the data payload summary being transferred.
  **Layout guidance:**
  - note: This is a full-bleed visualization. Do NOT wrap in a d-surface card. Agent nodes float freely within the canvas area.
  - metrics: Display agent metrics with LABELED text, not icon-only. Good: 'Requests: 142 | Latency: 120ms'. Bad: '⚡ 142 ⬇ 120ms'. Icons without labels are unparseable.
  - container: borderless
  - node_card: Agent node cards: min-width 200px, max-width 260px. Layout must be: Row 1: avatar (40px circle) + column(name + agent-id). Row 2: status badge (FULL WIDTH, not beside the name). Row 3+: metrics stacked vertically. The status badge must NEVER share a row with the agent name — it goes on its own row below the name/id, spanning the full card width. Use d-annotation for the badge.
  - error_escalation: Agents with error status should have a subtle red border glow on their card: box-shadow: 0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent).
  - node_card_sizing: The name text uses text-sm font-semibold with text-ellipsis overflow-hidden whitespace-nowrap. The agent-id uses text-xs text-muted. Status badge row: flex with gap-2, badge pill-shaped. Metrics: mono-data text-xs, one line per metric. Card padding: 12px. Gap between rows: 8px.
  - node_interaction: Each agent node card MUST have cursor: pointer. Use d-surface[data-interactive] for clickable nodes. Clicking navigates to agent detail.
  - status_consistency: All status badges MUST use d-annotation[data-status]. Every status includes a colored dot (8px circle) prefix for visual scanning. Consistent across all agents.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| node-hover | scale(1.05) + glow-intensity 200ms ease-out |
| connection-pulse | opacity 0.3→1→0.3 along path 2s linear infinite |
| node-add | scale(0) to scale(1) + fade 300ms spring |
| node-remove | scale(1) to scale(0) + fade 200ms ease-in |
| layout-shift | position lerp 500ms ease-in-out |
| status-glow | border-color pulse matching status 2s ease-in-out infinite |
| connection-flow | dash-offset animate along path 3s linear infinite |

**Responsive:**
- **Mobile (<640px):** Canvas remains spatial but disables drag-to-connect (use tap-to-select then tap-target-to-connect two-step flow). Minimap hidden. Control bar simplifies to zoom + play/pause. Agent nodes render at minimum 64px width with truncated labels.
- **Tablet (640-1024px):** Full spatial canvas with minimap collapsed by default (toggle via control bar). Touch gestures: two-finger pan, pinch-to-zoom. Connection drag uses long-press to initiate.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: cycle through agent nodes in DOM order; Enter: expand selected agent node details; Space: toggle swarm play/pause; Arrow keys: pan canvas viewport; +/-: zoom in/out; 0: fit all agents in view; Delete: remove selected connection; Escape: deselect current node or cancel drag
- Announcements: Agent {name} status changed to {status}; Connection established between {source} and {target}; Swarm execution {started|paused|completed}


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
  **Layout guidance:**
  - brand_first: Brand, primary links, and actions should read in a clear priority order. Do not let decorative elements or overflow menus obscure the primary navigation rhythm.
  - mobile_collapse: On smaller screens, collapse secondary links before compromising the clarity of the brand and primary CTA.
  - header_compactness: Keep header controls compact so the nav stays elegant instead of looking like a dense toolbar.
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

**Responsive:**
- **Mobile (<640px):** Collapse all sections to a single column. Section titles stack above fields, actions become full-width when helpful, and dense structured layouts reduce to simple vertical groups.
- **Tablet (640-1024px):** Preserve the section rhythm while allowing field groups to split into two columns only when labels and controls still read clearly.
- **Desktop (>1024px):** Use the intended multi-column section layout, but keep the overall form constrained in width so long label or helper text blocks remain readable.

**Accessibility:**
- Role: `form`
- Keyboard: Tab navigates between form fields; Shift+Tab navigates backwards between fields; Enter submits when focus is on submit button; Space toggles checkboxes and switches; Arrow keys navigate within radio groups
- Announcements: Validation error: {field} — {message}; Section {name} expanded; Section {name} collapsed; Form submitted successfully
- Focus: First invalid field receives focus on failed validation. On section expand, focus moves to first field in the section. On step change in creation preset, focus moves to first field of new step.


### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Visual brief:** Full-width section dominating the viewport with a bold, large-scale headline centered or left-aligned depending on preset. Generous vertical padding (4-6rem top/bottom) creates breathing room. Subtext sits beneath the headline in muted, lighter-weight type with relaxed line-height. One or two CTA buttons are arranged horizontally with equal height — the primary filled, the secondary ghost-outlined. Optional media (illustration, screenshot, or ambient gradient) appears below or beside the content. Brand preset fills the entire viewport height with decorative floating orbs in the background. Split preset uses a two-column grid with content on one side and media on the other.

**Components:** Button, icon

**Layout slots:**
- `media`: Optional image, illustration, or chart component
- `headline`: Primary heading, typically h1 with _heading1
- `cta-group`: Horizontal Button group with _flex _gap3
- `description`: Supporting paragraph with _body _muted
  **Layout guidance:**
  - note: Hero sections should NOT wrap content in d-surface cards. The hero IS the section. Use d-section for spacing.
  - subtitle: Subtitle line-height should be 1.6-1.8. Use text-muted color, smaller font than heading.
  - container: none
  - background: Hero sections should have a subtle radial or mesh gradient background using the theme palette — not a flat color. Use the primary and accent colors at very low opacity (5-10%) to create depth. Example: radial-gradient(ellipse at top center, rgba(var(--d-accent-rgb), 0.08) 0%, transparent 60%), or a soft gradient from primary to transparent. The gradient should fade to var(--d-bg) at the edges so it blends seamlessly with the page.
  - cta_sizing: Primary and secondary CTAs should have equal padding and height. Primary is filled (d-interactive[data-variant=primary]), secondary is ghost (d-interactive[data-variant=ghost]).
  - ambient_glow: For themes with neon/glow personality, add a soft ambient glow behind the hero heading or CTA area. Use a blurred pseudo-element or box-shadow with the accent color at 10-15% opacity, radius 200-400px. This creates a focal point without overwhelming the content.
  - announcement: If showing an announcement badge above the heading, use d-annotation with prominent styling — not a tiny muted pill. Accent border or accent background at 15% opacity.
  - visual_proof: The visual element below CTAs should be an ambient visualization (animated gradient, particle effect, blurred screenshot) — NOT a data widget wrapped in a card. If showing product data (agents, metrics), render as floating elements without card containment. Omit entirely if no meaningful visual is available.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | CTA buttons scale subtly on hover (scale 1.02). Badge shimmer on announcement pill. |
| transitions | Hero entrance: headline fades up from 20px below with 600ms ease-out. Subtext follows 150ms later. CTAs follow 300ms after subtext. Decorative orbs drift slowly with infinite CSS animation. Brand preset media floats with gentle vertical oscillation. |

**Responsive:**
- **Mobile (<640px):** Single column, stacked vertically. Headline drops to heading2 scale. CTAs stack full-width. Padding reduces to py8 px4. Media goes below content at full width. Min-height removed on brand/vision presets.
- **Tablet (640-1024px):** Content remains centered or stacked. Headline at heading1 scale. CTAs stay horizontal. Split preset still single-column. Padding at py12 px6.
- **Desktop (>1024px):** Full layout as designed — centered or split two-column. Headline at display scale for brand/vision. Generous py16-py24 padding. Split preset activates side-by-side grid. Decorative elements visible.

**Accessibility:**
- Role: `banner`
- Keyboard: Tab to CTA button; Enter activates CTA
- Announcements: Page title announced on load
- Focus: CTA button is the primary focus target


### generative-card-grid

A grid of cards where each card shows a procedurally generated preview of what an AI would build from a given prompt. Cards display live micro-renders, placeholder sketches, or wireframe thumbnails that materialize from skeleton states. The grid itself is generative: card sizes, positions, and visual weights adapt to content relevance and user interaction history. For AI generation galleries, prompt exploration interfaces, template browsers, and any context where users browse and compare multiple AI outputs.

**Visual brief:** Responsive auto-fill card grid (minmax 280px). Each card shows a generated preview thumbnail, a generation badge overlay (top-right), a truncated prompt label below, and a hover-reveal action bar. Cards shimmer from skeleton to final preview. Masonry or uniform sizing depending on preset.

**Components:** PreviewCard, GenerationBadge, PromptTag, ActionBar, SkeletonPreview, RegenerateButton

**Composition:**
```
ActionBar = Row(d-interactive, show-on-hover) > [RegenerateButton(labeled) + FavoriteButton + ExpandButton + CopyButton + DeleteButton]
PreviewCard = Card(d-surface, hoverable, lift-on-hover) > [SkeletonPreview | Preview + GenerationBadge(d-annotation, top-right) + PromptTag(d-data, line-clamp-2) + ActionBar]
GenerationBadge = Badge(d-annotation, semi-transparent) > [ModelName + GenerationTime + ConfidenceScore?]
SkeletonPreview = Placeholder(shimmer, animated)
GenerativeCardGrid = Grid(d-section, auto-fill, responsive) > [PreviewCard[] + EmptyState?]
```

**Layout slots:**
- `action-bar`: ActionBar with card-level actions: RegenerateButton (re-run this prompt), favorite/bookmark, expand to full view, copy output, delete, and share. Appears on card hover or focus. In list preset, always visible. Actions are icon-only with tooltips, except RegenerateButton which has a label.
- `preview-card`: Individual PreviewCard containing a generated preview. Card lifecycle: SkeletonPreview (loading) → generation animation (materializing) → final preview (interactive). Preview area shows a miniature render of the AI output: could be a wireframe, screenshot thumbnail, or abstract representation. Card has a subtle border, rounded corners, and lift shadow on hover.
- `prompt-label`: PromptTag showing the input prompt or description that produced this generation. Truncated to 2 lines with full text in a tooltip. Displayed below the preview area. Supports click-to-copy for prompt reuse. If the card represents a variation, shows the delta from the original prompt.
- `grid-container`: The grid parent that holds all preview cards. Supports auto-fill columns with responsive minmax sizing. In masonry preset, uses CSS columns or masonry grid alignment. Container handles empty state (no generations yet) with a centered prompt-to-start message. Supports infinite scroll or paginated loading.
- `skeleton-state`: SkeletonPreview rendered while the generation is in progress. Shows animated placeholder shapes that hint at the expected output structure: header bars, content blocks, image placeholders. Skeleton uses shimmer animation (background gradient translateX). Transitions to the real preview with a reveal animation (clip-path or opacity).
- `generation-overlay`: GenerationBadge overlay on each card showing generation metadata: model used, generation time, confidence score, or iteration number. Positioned as a small pill in the card's top-right corner. Semi-transparent background to not obscure the preview. Shows 'Generating...' with a spinner animation during active generation.
  **Layout guidance:**
  - grid: Use CSS grid with auto-fill: grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)). Cards should be equal height within each row.
  - filtering: If filter tabs or category pills are shown, they MUST be functional. Clicking a tab/pill filters the grid. Use React state to filter. Non-functional filter UI is worse than no filters.
  - empty_state: When filters produce 0 results, show an empty state: centered icon (48px, muted) + descriptive message + 'Clear filters' action.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-hover | translateY(-4px) + shadow-lg 200ms ease-out |
| card-press | scale(0.98) 100ms ease-out |
| card-enter | fade-up + scale(0.95→1) 300ms ease-out, stagger 50ms per card |
| card-remove | scale(1→0.9) + fade-out 200ms ease-in |
| grid-reflow | position + size lerp 400ms ease-in-out |
| shimmer-loading | gradient-sweep left-to-right 1.5s ease-in-out infinite on skeleton |

**Responsive:**
- **Mobile (<640px):** Single column layout regardless of preset. Cards full-width. Preview area maintains 16:9 aspect ratio. ActionBar always visible (no hover state on touch). Skeleton state simplified to a single pulsing block. Maximum 10 cards before 'Load more' button.
- **Tablet (640-1024px):** Two-column grid for uniform and masonry presets. Featured preset uses 2-column with featured card spanning full width at top. List preset unchanged. Touch targets for ActionBar buttons are 44px minimum.

**Accessibility:**
- Role: `feed`
- Keyboard: Tab navigates between cards in grid order; Arrow keys navigate between cards in 2D grid (Left/Right within row, Up/Down between rows); Enter expands the focused card to full view; R key triggers regeneration for the focused card; F key toggles the focused card as featured; V key cycles between grid presets (masonry, uniform, featured, list); Escape closes expanded view and returns focus to the card
- Announcements: Announce new generation completion: 'Generation complete: [prompt summary]'; Announce when entering skeleton/loading state: 'Generating preview for: [prompt]'; Announce grid layout changes: 'Switched to [preset] view'; Announce featured card change: '[prompt] featured'


---

## Pages

### agent-overview (/agents)

Layout: agent-swarm-canvas as swarm-topology → agent-timeline as activity-feed

### agent-detail (/agents/:id)

Layout: agent-timeline as agent-history → neural-feedback-loop as feedback-inspector

### agent-config (/agents/config)

Layout: nav-header → form-sections (structured) as agent-parameters

### agent-marketplace (/marketplace)

Layout: hero (standard) as marketplace-hero → generative-card-grid as agent-catalog
