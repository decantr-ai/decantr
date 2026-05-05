# Review Pack

**Objective:** Review generated output against the compiled Decantr contract.
**Target:** react-vite (react)
**Scope:** pages=agent-overview, agent-detail, agent-config, agent-marketplace, login, register, forgot-password, reset-password, verify-email, home, model-overview, inference-log, confidence-explorer | patterns=agent-swarm-canvas, agent-timeline, neural-feedback-loop, nav-header, form-sections, hero, generative-card-grid, form, features, how-it-works, pricing, testimonials, cta, stats-overview, intent-radar

## Review Contract
- Review Type: app
- Shell: sidebar-main
- Theme: carbon-neon (dark)
- Routing: hash
- Features: agents, monitoring, orchestration, real-time, websockets, auth, mfa, oauth, email-verification, password-reset, pricing-toggle, testimonials, feature-grid, analytics, observability, theme-toggle, command-palette

## Review Topology
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

## Focus Areas
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Review Workflow
- Read the scaffold pack and page packs before evaluating generated code.
- Compare findings against the compiled route, shell, and theme contract first.
- Escalate contract drift into essence updates when the requested output intentionally changes topology or theme identity.

## Required Setup
- Read the compiled scaffold and route packs before reviewing code.
- Use concrete evidence from the workspace instead of purely stylistic intuition.

## Allowed Vocabulary
- app
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
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Success Checks
- Review findings should use the compiled route, shell, and theme contract as the baseline. [error]
- Each critique finding should cite concrete evidence from the generated workspace. [error]
- Suggested fixes should point back to code changes or essence updates when contract drift exists. [warn]

## Anti-Patterns
- Avoid inline style literals as the primary styling path.: Move visual styling into tokens.css and treatments.css instead of component-local style objects.
- Avoid hardcoded color literals.: Use CSS variables and theme decorators instead of hex, rgb, or hsl values.
- Avoid utility-framework leakage as the primary design language.: Prefer compiled Decantr treatments and contract vocabulary over ad hoc utility class stacks.

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
