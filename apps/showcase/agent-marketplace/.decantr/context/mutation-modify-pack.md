# Mutation Pack

**Objective:** Execute the modify workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=agent-overview, agent-detail, agent-config, agent-marketplace, login, register, forgot-password, reset-password, verify-email, home, model-overview, inference-log, confidence-explorer | patterns=agent-swarm-canvas, agent-timeline, neural-feedback-loop, nav-header, form-sections, hero, generative-card-grid, form, features, how-it-works, pricing, testimonials, cta, stats-overview, intent-radar

## Mutation Contract
- Operation: modify
- Shell: sidebar-main
- Theme: carbon-neon (dark)
- Routing: hash
- Features: agents, monitoring, orchestration, real-time, websockets, auth, mfa, oauth, email-verification, password-reset, pricing-toggle, testimonials, feature-grid, analytics, observability, theme-toggle, command-palette

## Route Topology
- /agents -> agent-overview @ sidebar-main [agent-swarm-canvas, agent-timeline]
- /agents/:id -> agent-detail @ sidebar-main [agent-timeline, neural-feedback-loop]
- /agents/config -> agent-config @ sidebar-main [nav-header, form-sections]
- /marketplace -> agent-marketplace @ sidebar-main [hero, generative-card-grid]
- /login -> login @ centered [form]
- /register -> register @ centered [form]
- /forgot-password -> forgot-password @ centered [form]
- /reset-password -> reset-password @ centered [form]
- /verify-email -> verify-email @ centered [form]
- / -> home @ top-nav-footer [hero, features, how-it-works, pricing, testimonials, cta]
- /transparency -> model-overview @ sidebar-main [stats-overview, neural-feedback-loop]
- /transparency/inference -> inference-log @ sidebar-main [agent-timeline]
- /transparency/confidence -> confidence-explorer @ sidebar-main [intent-radar, stats-overview]

## Workflow
- Read the page pack for the route you are modifying first.
- Stop and update the essence before changing route, shell, or pattern contracts.
- Validate and check drift after code changes complete.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- modify
- sidebar-main
- carbon-neon
- dark
- agents
- monitoring
- orchestration
- real-time
- websockets
- auth
- mfa
- oauth
- email-verification
- password-reset
- pricing-toggle
- testimonials
- feature-grid
- analytics
- observability
- theme-toggle
- command-palette
- agent-swarm-canvas
- agent-timeline
- neural-feedback-loop
- nav-header
- form-sections
- hero
- generative-card-grid
- form
- features
- how-it-works
- pricing
- cta
- stats-overview
- intent-radar

## Success Checks
- Modified routes remain coherent with the compiled topology unless the essence changes first. [error]
- Theme, shell, and page identity stay aligned with the current contract during edits. [error]
- Route-local edits should start from the compiled page pack rather than improvised structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
