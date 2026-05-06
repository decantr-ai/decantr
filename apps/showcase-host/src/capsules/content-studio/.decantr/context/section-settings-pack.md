# Section Pack

**Objective:** Implement the settings section using the compiled sidebar-main shell contract.
**Target:** react-vite (react)
**Scope:** pages=settings | patterns=form-sections

## Section Contract
- Section: settings
- Role: auxiliary
- Shell: sidebar-main
- Theme: editorial (light)
- Description: Application settings and preferences page

## Section Routes
- /settings -> settings/settings @ sidebar-main [form-sections]

## Theme Decorators

Theme `editorial` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- settings
- auxiliary
- sidebar-main
- editorial
- light
- form-sections

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
