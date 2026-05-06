# Section Pack

**Objective:** Implement the recipefork-recipe-detail section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=recipe-detail | patterns=hero, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread

## Section Contract
- Section: recipefork-recipe-detail
- Role: primary
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics
- Description: Recipefork's recipe detail surface with hero imagery, summary/actions, Chef Mode ingredient and instruction displays, optional plating presentation, dynamic cooking tips, public provenance attribution, owner-only branch analytics, and comments, all under the shared Recipefork top-nav shell.

## Section Routes
- /recipe/:id -> recipefork-recipe-detail/recipe-detail @ recipefork-top-nav [hero, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-recipe-detail
- primary
- recipefork-top-nav
- recipefork
- light
- sharing
- comments
- reactions
- forking
- chef-mode
- presentation
- cooking-tips
- lineage
- branch-analytics
- hero
- detail-header
- recipefork-fork-provenance
- recipefork-chef-ingredients-display
- recipefork-chef-instructions-display
- recipefork-presentation-display
- recipefork-cooking-tips-display
- comment-thread

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
