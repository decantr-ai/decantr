# Page Pack

**Objective:** Implement the agent-config route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=agent-config | patterns=nav-header, form-sections

## Page Contract
- Page: agent-config
- Path: /agents/config
- Shell: sidebar-main
- Section: agent-orchestrator (primary)
- Theme: carbon-neon (dark)
- Features: agents, monitoring, orchestration, real-time, websockets
- Surface: _flex _col _gap4 _p4 _overauto _flex1

## Page Patterns
- nav-header -> nav-header [row | standard]
- agent-parameters -> form-sections [stack | structured]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- agent-config
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
- nav-header
- row
- form-sections
- agent-parameters
- stack

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
