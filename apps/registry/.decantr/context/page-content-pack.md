# Page Pack

**Objective:** Implement the content route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=content | patterns=content-card-grid

## Page Contract
- Page: content
- Path: /content
- Shell: sidebar-main
- Section: user-dashboard (primary)
- Theme: luminarum (dark)
- Features: auth, api-keys
- Surface: _flex _col _gap_gap4 _p4 _overflow[auto] _flex1

## Page Patterns
- content-card-grid -> content-card-grid [grid | standard]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- content
- sidebar-main
- user-dashboard
- primary
- luminarum
- dark
- auth
- api-keys
- content-card-grid
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
