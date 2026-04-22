# Page Pack

**Objective:** Implement the reset-password route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=reset-password | patterns=form

## Page Contract
- Page: reset-password
- Path: /reset-password
- Shell: centered
- Section: auth-full (gateway)
- Theme: carbon-neon (dark)
- Features: auth, mfa, oauth, email-verification, password-reset
- Surface: _flex _col _gap4 _p4 _overauto _flex1

## Page Patterns
- form -> form [stack | settings]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- reset-password
- centered
- auth-full
- gateway
- carbon-neon
- dark
- auth
- mfa
- oauth
- email-verification
- password-reset
- form
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
