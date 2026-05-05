# Page Pack

**Objective:** Implement the agent-marketplace route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=agent-marketplace | patterns=hero, generative-card-grid

## Page Contract
- Page: agent-marketplace
- Path: /marketplace
- Shell: sidebar-main
- Section: agent-orchestrator (primary)
- Theme: carbon-neon (dark)
- Features: agents, monitoring, orchestration, real-time, websockets
- Surface: _flex _col _gap4 _p4 _overauto _flex1

## Page Patterns
- marketplace-hero -> hero [stack | landing]
- agent-catalog -> generative-card-grid [grid | masonry]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- agent-marketplace
- sidebar-main
- agent-orchestrator
- primary
- carbon-neon
- dark
- agents
- monitoring
- orchestration
- real-time
- websockets
- hero
- marketplace-hero
- stack
- generative-card-grid
- agent-catalog
- grid

## Success Checks
- The page keeps the compiled route, shell, and section contract intact. [error]
- The page preserves its primary compiled patterns instead of drifting into unrelated layouts. [error]
- Any declared wiring signals remain coherent with the rendered page structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
