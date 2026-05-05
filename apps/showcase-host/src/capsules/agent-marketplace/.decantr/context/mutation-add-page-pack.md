# Mutation Pack

**Objective:** Execute the add-page workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=agent-overview, agent-detail, agent-config, agent-marketplace, login, register, forgot-password, reset-password, verify-email, home, model-overview, inference-log, confidence-explorer | patterns=agent-swarm-canvas, agent-timeline, neural-feedback-loop, nav-header, form-sections, hero, generative-card-grid, form, features, how-it-works, pricing, testimonials, cta, stats-overview, intent-radar

## Mutation Contract
- Operation: add-page
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
- Declare the new page in the essence before generating code.
- Refresh Decantr context so section and page packs include the new route.
- Read the relevant section pack and new page pack before implementation.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- add-page
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
- New pages are declared in the essence before any code generation begins. [error]
- New routes inherit an existing shell and section contract unless the essence changes first. [error]
- Refresh compiled packs after the mutation so downstream tasks read current topology. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
