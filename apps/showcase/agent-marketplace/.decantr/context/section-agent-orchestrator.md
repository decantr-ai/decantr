# Section: agent-orchestrator

**Role:** primary | **Shell:** sidebar-main | **Archetype:** agent-orchestrator
**Description:** Multi-agent management dashboard for monitoring, configuring, and orchestrating autonomous agent swarms with real-time status and marketplace discovery.
**Shell structure:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages).
**Regions:** header, nav, body

## Shell Notes (sidebar-main)

- **Hotkeys:** Navigation hotkeys defined in the essence are keyboard shortcuts. Implement as useEffect keydown event listeners — do NOT render hotkey text in the sidebar UI.
- **Collapse:** Sidebar collapse toggle should be integrated into the sidebar header area (next to the brand/logo), not floating at the bottom of the sidebar.
- **Breadcrumbs:** For nested routes (e.g., /resource/:id), show a breadcrumb trail above the page heading inside the main content area.
- **Empty States:** When a section has zero data, show a centered empty state: 48px muted icon + descriptive message + optional CTA button.
- **Section Labels:** Dashboard section labels should use the d-label class. Anchor with a left accent border: border-left: 2px solid var(--d-accent); padding-left: 0.5rem.
- **Section Density:** Dashboard sections use compact spacing. Apply data-density='compact' on d-section elements for tighter vertical rhythm than marketing pages.
- **Page Transitions:** Apply the entrance-fade class (if generated) to the main content area for smooth page transitions.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:** carbon-card, carbon-code, carbon-glass, carbon-input, carbon-canvas, carbon-divider, carbon-skeleton, carbon-bubble-ai, carbon-fade-slide, carbon-bubble-user


Usage: `className={css('_flex _col _gap4') + ' d-surface carbon-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

agents, monitoring, orchestration, real-time, websockets

---

**Personality:** See scaffold.md for personality and visual direction.

## Pattern Reference

### agent-swarm-canvas

A spatial node-graph canvas where AI agents appear as interactive nodes with real-time status, drag-to-connect edges, zoom/pan navigation, and a minimap for orchestration overview.

**Components:** AgentNode, ConnectionPath, StatusBadge, CanvasControls, Minimap, TaskTooltip

**Layout slots:**
  **Layout guidance:**
  - note: This is a full-bleed visualization. Do NOT wrap in a d-surface card. Agent nodes float freely within the canvas area.
  - metrics: Display agent metrics with LABELED text, not icon-only. Good: 'Requests: 142 | Latency: 120ms'. Bad: '⚡ 142 ⬇ 120ms'. Icons without labels are unparseable.
  - container: borderless
  - error_escalation: Agents with error status should have a subtle red border glow on their card: box-shadow: 0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent).
  - node_interaction: Each agent node card MUST have cursor: pointer. Use d-surface[data-interactive] for clickable nodes. Clicking navigates to agent detail.
  - status_consistency: All status badges MUST use d-annotation[data-status]. Every status includes a colored dot (8px circle) prefix for visual scanning. Consistent across all agents.

### agent-timeline

A vertical timeline for agent observability that displays actions, decisions, tool calls, and reasoning steps as collapsible color-coded events with filtering, detail expansion, and summary statistics.

**Components:** TimelineEvent, EventDetail, ToolCallCard, ReasoningStep, FilterChip, TimelineSummary

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)
  **Layout guidance:**
  - orb: Each event has a 12px diameter colored circle (orb) centered ON the vertical line. The orb is vertically aligned with the FIRST line of text (the badge/timestamp row), not the center of the event block.
  - spacing: Compact event spacing: gap-3 to gap-4 between events. Dense timelines are easier to scan than spacious ones.
  - badge_size: Event type badges use d-annotation with at least 0.7rem font and enough padding to be scannable at speed.
  - event_colors: Each event TYPE must have a DISTINCT color. No two types share the same color. Suggested: action=cyan(accent), decision=green(success), error=red(error), warning=amber(warning), tool_call=purple, reasoning=amber/gold, info=blue(info).
  - vertical_line: A continuous 2px vertical line runs the FULL height of the timeline, 16px from the left edge. Color: var(--d-border). The line MUST NOT have gaps between events — it connects all events visually.

### neural-feedback-loop

A bio-mimetic visualization that renders AI processing state through organic pulsing, color shifts, and flow animations. Displays model confidence, token consumption rate, processing stage, or any continuous metric as a living, breathing visual element. PulseCore radiates outward with intensity mapped to metric values. FlowTrack shows directional particle flow representing throughput. IntensityRing provides a clean circular gauge. For AI transparency UIs, model monitoring dashboards, and any interface that needs to make invisible AI processes tangible and legible.

**Components:** PulseCore, FlowTrack, MetricDisplay, IntensityRing, FeedbackTooltip

**Layout slots:**
- `values`: Value cards (icon/emoji, title, description)

### settings-nav



**Components:** Card, Toggle, Input, Button

**Layout slots:**
- `sections`: Settings sections (label, description, input/toggle)

### form-sections

Grouped form fields organized in labeled sections with validation

**Components:** Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup

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

### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

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
  - cta_sizing: Primary and secondary CTAs should have equal padding and height. Primary is filled (d-interactive[data-variant=primary]), secondary is ghost (d-interactive[data-variant=ghost]).
  - announcement: If showing an announcement badge above the heading, use d-annotation with prominent styling — not a tiny muted pill. Accent border or accent background at 15% opacity.
  - visual_proof: The visual element below CTAs should be an ambient visualization (animated gradient, particle effect, blurred screenshot) — NOT a data widget wrapped in a card. If showing product data (agents, metrics), render as floating elements without card containment. Omit entirely if no meaningful visual is available.

### generative-card-grid

A grid of cards where each card shows a procedurally generated preview of what an AI would build from a given prompt. Cards display live micro-renders, placeholder sketches, or wireframe thumbnails that materialize from skeleton states. The grid itself is generative: card sizes, positions, and visual weights adapt to content relevance and user interaction history. For AI generation galleries, prompt exploration interfaces, template browsers, and any context where users browse and compare multiple AI outputs.

**Components:** PreviewCard, GenerationBadge, PromptTag, ActionBar, SkeletonPreview, RegenerateButton

**Layout slots:**
- `content`: Story/about narrative text content
  **Layout guidance:**
  - grid: Use CSS grid with auto-fill: grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)). Cards should be equal height within each row.
  - filtering: If filter tabs or category pills are shown, they MUST be functional. Clicking a tab/pill filters the grid. Use React state to filter. Non-functional filter UI is worse than no filters.
  - empty_state: When filters produce 0 results, show an empty state: centered icon (48px, muted) + descriptive message + 'Clear filters' action.

---

## Pages

### agent-overview (/agents)

Layout: agent-swarm-canvas as swarm-topology → agent-timeline as activity-feed

### agent-detail (/agents/:id)

Layout: agent-timeline as agent-history → neural-feedback-loop as feedback-inspector

### agent-config (/agents/config)

Layout: settings-nav → form-sections (structured) as agent-parameters

### agent-marketplace (/marketplace)

Layout: hero (standard) as marketplace-hero → generative-card-grid as agent-catalog
