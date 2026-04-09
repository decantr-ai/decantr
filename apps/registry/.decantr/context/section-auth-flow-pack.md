# Section Pack

**Objective:** Implement the auth-flow section using the compiled centered shell contract.
**Target:** nextjs (nextjs)
**Scope:** pages=login, register, forgot-password | patterns=auth-form

## Section Contract
- Section: auth-flow
- Role: gateway
- Shell: centered
- Theme: luminarum (dark)
- Features: auth
- Description: Login, registration, and password recovery with OAuth support

## Section Routes
- /login -> login [auth-form]
- /register -> register [auth-form]
- /forgot-password -> forgot-password [auth-form]

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- auth-flow
- gateway
- centered
- luminarum
- dark
- auth
- auth-form

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
