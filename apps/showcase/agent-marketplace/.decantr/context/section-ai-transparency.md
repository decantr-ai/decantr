# Section: ai-transparency

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** ai-transparency
**Description:** AI model observability and transparency dashboard for inspecting inference logs, confidence distributions, and neural feedback cycles across deployed models.
**Shell structure:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages).
**Regions:** header, nav, body

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:** carbon-card, carbon-code, carbon-glass, carbon-input, carbon-canvas, carbon-divider, carbon-skeleton, carbon-bubble-ai, carbon-fade-slide, carbon-bubble-user

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
