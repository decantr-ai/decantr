# Page Pack

**Objective:** Implement the profile route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=profile | patterns=detail-header, content-card-grid, activity-feed

## Page Contract
- Page: profile
- Path: /profile
- Shell: top-nav-main
- Section: registry-browser (primary)
- Theme: luminarum (dark)
- Features: search, pagination
- Surface: _flex _col _gap_gap4 _p4 _overflow[auto] _flex1

## Page Patterns
- detail-header -> detail-header [row | standard]
- content-card-grid -> content-card-grid [grid | standard]
- activity-feed -> activity-feed [column | standard]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- profile
- top-nav-main
- registry-browser
- primary
- luminarum
- dark
- search
- pagination
- detail-header
- row
- content-card-grid
- grid
- activity-feed
- column

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
