# Section Pack

**Objective:** Implement the onboarding-wizard section using the compiled centered shell contract.
**Target:** react-vite (react)
**Scope:** pages=account-step, profile-step, interests-step | patterns=onboarding-wizard, auth-form, cta-section, content-uploader, form, chip-multiselect

## Section Contract
- Section: onboarding-wizard
- Role: gateway
- Shell: centered
- Theme: swipecircle (light)
- Features: auth, photo-upload, step-validation, form-validation, interests-picker
- Description: Gateway archetype for multi-step new-user onboarding flows. Three-step wizard pattern: account creation, profile completion (with photo upload), and interests selection. Each step occupies its own route on the centered shell with a stepper progress indicator at the top. Designed for consumer apps where post-auth profile completion is required before entering the primary app surface.

## Section Routes
- /signup -> onboarding-wizard/account-step @ centered [onboarding-wizard, auth-form, cta-section]
- /onboarding/profile -> onboarding-wizard/profile-step @ centered [onboarding-wizard, content-uploader, form, cta-section]
- /onboarding/interests -> onboarding-wizard/interests-step @ centered [onboarding-wizard, chip-multiselect, cta-section]

## Section Directives

Execution-level rules every page in this section must obey. Follow exactly — these live in the pack contract, not narrative prose.

- All three steps use the swipecircle theme — warm peach backgrounds, coral primaries, pill CTAs
- Stepper component is consistent across all 3 pages — only the dot states change
- After step 3 success, route to /discover (the primary app surface)
- If user reloads mid-flow, persist progress in localStorage so they don't lose state
- Each step's primary CTA is disabled until validation passes — no ghost-clicking through invalid steps

## Theme Decorators

Theme `swipecircle` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- onboarding-wizard
- gateway
- centered
- swipecircle
- light
- auth
- photo-upload
- step-validation
- form-validation
- interests-picker
- auth-form
- cta-section
- content-uploader
- form
- chip-multiselect

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
