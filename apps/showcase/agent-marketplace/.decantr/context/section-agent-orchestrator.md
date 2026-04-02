# Section: agent-orchestrator

**Role:** primary | **Shell:** sidebar-main | **Archetype:** agent-orchestrator
**Description:** Multi-agent management dashboard for monitoring, configuring, and orchestrating autonomous agent swarms with real-time status and marketplace discovery.
**Shell structure:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages).
**Regions:** header, nav, body

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Decorators:** `carbon-card`, `carbon-code`, `carbon-glass`, `carbon-input`, `carbon-canvas`, `carbon-divider`, `carbon-skeleton`, `carbon-bubble-ai`, `carbon-fade-slide`, `carbon-bubble-user` (see `src/styles/decorators.css`)
Usage: `className={css('_flex _col') + ' carbon-card'}` — atoms via css(), decorators as plain class strings.

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

### agent-timeline

A vertical timeline for agent observability that displays actions, decisions, tool calls, and reasoning steps as collapsible color-coded events with filtering, detail expansion, and summary statistics.

**Components:** TimelineEvent, EventDetail, ToolCallCard, ReasoningStep, FilterChip, TimelineSummary

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)

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

### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Components:** Button, icon

**Layout slots:**
- `media`: Optional image, illustration, or chart component
- `headline`: Primary heading, typically h1 with _heading1
- `cta-group`: Horizontal Button group with _flex _gap3
- `description`: Supporting paragraph with _body _muted

### generative-card-grid

A grid of cards where each card shows a procedurally generated preview of what an AI would build from a given prompt. Cards display live micro-renders, placeholder sketches, or wireframe thumbnails that materialize from skeleton states. The grid itself is generative: card sizes, positions, and visual weights adapt to content relevance and user interaction history. For AI generation galleries, prompt exploration interfaces, template browsers, and any context where users browse and compare multiple AI outputs.

**Components:** PreviewCard, GenerationBadge, PromptTag, ActionBar, SkeletonPreview, RegenerateButton

**Layout slots:**
- `content`: Story/about narrative text content

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
