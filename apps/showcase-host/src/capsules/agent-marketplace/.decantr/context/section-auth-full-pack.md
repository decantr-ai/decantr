# Section Pack

**Objective:** Implement the auth-full section using the compiled centered shell contract.
**Target:** react-vite (react)
**Scope:** pages=login, register, forgot-password, reset-password, verify-email | patterns=form

## Section Contract
- Section: auth-full
- Role: gateway
- Shell: centered
- Theme: carbon-neon (dark)
- Features: auth, mfa, oauth, email-verification, password-reset
- Description: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.

## Section Routes
- /login -> login @ centered [form]
- /register -> register @ centered [form]
- /forgot-password -> forgot-password @ centered [form]
- /reset-password -> reset-password @ centered [form]
- /verify-email -> verify-email @ centered [form]

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- auth-full
- gateway
- centered
- carbon-neon
- dark
- auth
- mfa
- oauth
- email-verification
- password-reset
- form

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
