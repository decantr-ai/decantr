# Page Pack

**Objective:** Implement the confidence-explorer route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=confidence-explorer | patterns=intent-radar, stats-overview

## Page Contract
- Page: confidence-explorer
- Path: /transparency/confidence
- Shell: sidebar-main
- Section: ai-transparency (auxiliary)
- Theme: carbon-neon (dark)
- Features: monitoring, analytics, observability
- Surface: _flex _col _gap4 _p4 _overauto _flex1

## Page Patterns
- confidence-distribution -> intent-radar [spatial | standard]
- metric-breakdown -> stats-overview [grid | standard]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- confidence-explorer
- sidebar-main
- ai-transparency
- auxiliary
- carbon-neon
- dark
- monitoring
- analytics
- observability
- intent-radar
- confidence-distribution
- spatial
- stats-overview
- metric-breakdown
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
