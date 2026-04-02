# Section: ai-transparency

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** ai-transparency
**Description:** AI model observability and transparency dashboard for inspecting inference logs, confidence distributions, and neural feedback cycles across deployed models.
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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

monitoring, analytics, observability

---

**Personality:** See scaffold.md for personality and visual direction.

## Pattern Reference

### neural-feedback-loop

A bio-mimetic visualization that renders AI processing state through organic pulsing, color shifts, and flow animations. Displays model confidence, token consumption rate, processing stage, or any continuous metric as a living, breathing visual element. PulseCore radiates outward with intensity mapped to metric values. FlowTrack shows directional particle flow representing throughput. IntensityRing provides a clean circular gauge. For AI transparency UIs, model monitoring dashboards, and any interface that needs to make invisible AI processes tangible and legible.

**Components:** PulseCore, FlowTrack, MetricDisplay, IntensityRing, FeedbackTooltip

**Layout slots:**
- `values`: Value cards (icon/emoji, title, description)

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

### intent-radar

A radial polar interface that visualizes user intent as vectors radiating from a center point, with suggestions pulsing outward based on confidence scores — used for AI command palettes, intent disambiguation, and contextual action discovery.

**Components:** RadarDisplay, IntentVector, SuggestionChip, ConfidenceIndicator, ActionButton

**Layout slots:**

---

## Pages

### model-overview (/transparency)

Layout: stats-overview as model-kpis → neural-feedback-loop as feedback-summary

### inference-log (/transparency/inference)

Layout: agent-timeline as inference-trace

### confidence-explorer (/transparency/confidence)

Layout: intent-radar as confidence-distribution → stats-detail as metric-breakdown
