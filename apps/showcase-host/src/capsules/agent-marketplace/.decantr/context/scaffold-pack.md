# Scaffold Pack

**Objective:** Scaffold the carbon-neon app shell and declared routes.
**Target:** react-vite (react)
**Scope:** pages=agent-overview, agent-detail, agent-config, agent-marketplace, login, register, forgot-password, reset-password, verify-email, home, model-overview, inference-log, confidence-explorer | patterns=agent-swarm-canvas, agent-timeline, neural-feedback-loop, nav-header, form-sections, hero, generative-card-grid, form, features, how-it-works, pricing, testimonials, cta, stats-overview, intent-radar

## Scaffold Contract
- Shell: sidebar-main
- Shells: sidebar-main (primary), centered, top-nav-footer
- Theme: carbon-neon (dark)
- Routing: hash
- Features: agents, monitoring, orchestration, real-time, websockets, auth, mfa, oauth, email-verification, password-reset, pricing-toggle, testimonials, feature-grid, analytics, observability, theme-toggle, command-palette
- Navigation:
  - command palette required
  - g a: Go to Agents — /agents
  - g m: Go to Marketplace — /marketplace
  - g t: Go to Transparency — /transparency

## Route Plan
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

## Required Setup
- Treat the declared routes as the topology source of truth.
- Preserve the resolved theme and shell contract unless the task explicitly mutates them.

## Allowed Vocabulary
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
- Routes and page IDs match the compiled topology. [error]
- The declared shell contract is preserved unless the task explicitly mutates it. [error]
- Theme identity and mode remain consistent across scaffolded routes. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
