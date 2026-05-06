# Page Pack

**Objective:** Implement the settings route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=settings | patterns=account-settings

## Page Contract
- Page: settings
- Path: /settings
- Shell: sidebar-main
- Section: user-dashboard (primary)
- Theme: luminarum (dark)
- Features: auth, api-keys
- Surface: _flex _col _gap_gap4 _p4 _overflow[auto] _flex1

## Page Patterns
- account-settings -> account-settings [stack | profile]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- settings
- sidebar-main
- user-dashboard
- primary
- luminarum
- dark
- auth
- api-keys
- account-settings
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
