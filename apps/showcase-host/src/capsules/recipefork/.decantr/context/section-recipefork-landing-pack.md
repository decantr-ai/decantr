# Section Pack

**Objective:** Implement the recipefork-landing section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=home | patterns=hero, card-grid, testimonials, cta-section

## Section Contract
- Section: recipefork-landing
- Role: public
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: marketing, seo
- Description: Recipefork's public landing page under the shared product nav, combining hero marketing, featured recipes, community proof, and conversion calls without switching to a separate shell.

## Section Routes
- / -> recipefork-landing/home @ recipefork-top-nav [hero, card-grid, testimonials, cta-section]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-landing
- public
- recipefork-top-nav
- recipefork
- light
- marketing
- seo
- hero
- card-grid
- testimonials
- cta-section

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
