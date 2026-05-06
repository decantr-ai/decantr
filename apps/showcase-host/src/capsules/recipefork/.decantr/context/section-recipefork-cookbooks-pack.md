# Section Pack

**Objective:** Implement the recipefork-cookbooks section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=cookbooks, cookbook-detail | patterns=card-grid, cta-section, hero

## Section Contract
- Section: recipefork-cookbooks
- Role: auxiliary
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: collections, visibility, recipe-saving
- Description: Cookbook management and cookbook detail views for Recipefork, including creation, visibility state, owner-only editing, public cookbook viewing, and recipe collection browsing.

## Section Routes
- /cookbooks -> recipefork-cookbooks/cookbooks @ recipefork-top-nav [card-grid, cta-section]
- /cookbooks/:id -> recipefork-cookbooks/cookbook-detail @ recipefork-top-nav [hero, card-grid]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-cookbooks
- auxiliary
- recipefork-top-nav
- recipefork
- light
- collections
- visibility
- recipe-saving
- card-grid
- cta-section
- hero

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
