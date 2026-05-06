# Section Pack

**Objective:** Implement the recipefork-auth section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=login | patterns=auth-form

## Section Contract
- Section: recipefork-auth
- Role: gateway
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: auth, oauth
- Description: Recipefork's shared-shell authentication entry surface. The auth card lives inside the product navbar shell rather than switching to a detached centered-only auth layout.

## Section Routes
- /auth -> recipefork-auth/login @ recipefork-top-nav [auth-form]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-auth
- gateway
- recipefork-top-nav
- recipefork
- light
- auth
- oauth
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
