# Page Pack

**Objective:** Implement the forgot-password route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=forgot-password | patterns=auth-form

## Page Contract
- Page: forgot-password
- Path: /forgot-password
- Shell: centered
- Section: auth-flow (gateway)
- Theme: luminarum (dark)
- Features: auth
- Surface: _flex _col _gap_gap4 _p4 _overflow[auto] _flex1

## Page Patterns
- auth-form -> auth-form [stack | login]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- forgot-password
- centered
- auth-flow
- gateway
- luminarum
- dark
- auth
- auth-form
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
