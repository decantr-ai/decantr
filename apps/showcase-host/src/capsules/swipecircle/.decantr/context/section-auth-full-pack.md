# Section Pack

**Objective:** Implement the auth-full section using the compiled centered shell contract.
**Target:** react-vite (react)
**Scope:** pages=login | patterns=auth-form

## Section Contract
- Section: auth-full
- Role: gateway
- Shell: centered
- Theme: swipecircle (light)
- Features: auth, mfa, oauth, email-verification, password-reset
- Description: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.

## Section Routes
- /login -> auth-full/login @ centered [auth-form]

## Section Directives

Execution-level rules every page in this section must obey. Follow exactly — these live in the pack contract, not narrative prose.

- Use `d-shell[data-layout="centered"]` + `d-shell-centered-card` for all auth pages — NOT a hand-rolled centering wrapper.
- Auth bypass for dev: `localStorage.decantr_authenticated = 'true'` gates protected routes. The login/register pages accept ANY credentials (no real backend) and set the flag before redirecting to the blueprint's authenticated entry route.
- OAuth provider buttons MUST use real icons from lucide-react (Github, Chrome, Mail) — no inline SVGs or emoji stand-ins.
- MFA code inputs render as a single `d-control` with `inputMode="numeric"` and `autoComplete="one-time-code"` + `maxLength=6`, not 6 separate digit boxes.
- Error + success states use `d-annotation[data-status="error|success"]` above the form, never inline red/green text.
- Route guards compose with route elements, not shell outlets — wrap protected route components in a `<RequireAuth>` HOC/wrapper that checks the auth flag before rendering. Do NOT render the entire shell unconditionally and gate inside its outlet — that produces a reauth flash. Redirect happens before any protected page mounts.
- MFA setup pages render the QR code via `d-qr-placeholder` (CSS-only). MFA verify pages use the single-control `d-control` numeric input. Phone-verify pages use a separate `d-control[type="tel"]` with country-code prefix in a `d-step-chip` to its left. These three pages share an archetype but have distinct rendering — never collapse them into one component.

## Theme Decorators

Theme `swipecircle` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- auth-full
- gateway
- centered
- swipecircle
- light
- auth
- mfa
- oauth
- email-verification
- password-reset
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
