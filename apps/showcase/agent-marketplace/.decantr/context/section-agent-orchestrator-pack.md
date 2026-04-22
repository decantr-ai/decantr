# Section Pack

**Objective:** Implement the agent-orchestrator section using the compiled sidebar-main shell contract.
**Target:** react-vite (react)
**Scope:** pages=agent-overview, agent-detail, agent-config, agent-marketplace | patterns=agent-swarm-canvas, agent-timeline, neural-feedback-loop, nav-header, form-sections, hero, generative-card-grid

## Section Contract
- Section: agent-orchestrator
- Role: primary
- Shell: sidebar-main
- Theme: carbon-neon (dark)
- Features: agents, monitoring, orchestration, real-time, websockets
- Description: Multi-agent management dashboard for monitoring, configuring, and orchestrating autonomous agent swarms with real-time status and marketplace discovery.

## Section Routes
- /agents -> agent-overview @ sidebar-main [agent-swarm-canvas, agent-timeline]
- /agents/:id -> agent-detail @ sidebar-main [agent-timeline, neural-feedback-loop]
- /agents/config -> agent-config @ sidebar-main [nav-header, form-sections]
- /marketplace -> agent-marketplace @ sidebar-main [hero, generative-card-grid]

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- agent-orchestrator
- primary
- sidebar-main
- carbon-neon
- dark
- agents
- monitoring
- orchestration
- real-time
- websockets
- agent-swarm-canvas
- agent-timeline
- neural-feedback-loop
- nav-header
- form-sections
- hero
- generative-card-grid

## Success Checks
- Section pages and routes remain coherent with the compiled topology. [error]
- The section shell contract stays consistent across its routes. [error]
- Primary section patterns are represented without adding off-contract filler sections. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
