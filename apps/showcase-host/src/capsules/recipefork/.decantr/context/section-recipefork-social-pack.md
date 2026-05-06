# Section Pack

**Objective:** Implement the recipefork-social section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=feed | patterns=filter-bar, card-grid, recipefork-activity-feed

## Section Contract
- Section: recipefork-social
- Role: auxiliary
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: social, activity-feed, comments, reactions, follows, forking, engagement-ranking, lineage-cues
- Description: Recipefork's public discovery feed with engagement-aware recipe ranking, event filters, followed-creator cues, fork-depth/root lineage badges on cards, and a preview-card community activity rail.

## Section Routes
- /feed -> recipefork-social/feed @ recipefork-top-nav [filter-bar, card-grid, recipefork-activity-feed]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-social
- auxiliary
- recipefork-top-nav
- recipefork
- light
- social
- activity-feed
- comments
- reactions
- follows
- forking
- engagement-ranking
- lineage-cues
- filter-bar
- card-grid
- recipefork-activity-feed

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
