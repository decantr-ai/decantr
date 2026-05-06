# Section Pack

**Objective:** Implement the recipefork-profile section using the compiled recipefork-top-nav shell contract.
**Target:** react-vite (react)
**Scope:** pages=me, my-recipes, public-profile | patterns=creator-profile, account-settings, stats-overview, card-grid, filter-bar, recipefork-activity-feed

## Section Contract
- Section: recipefork-profile
- Role: auxiliary
- Shell: recipefork-top-nav
- Theme: recipefork (light)
- Features: profile-editing, follows, collections, activity-feed, public-profiles, branch-analytics
- Description: Current-user and public profile surfaces for Recipefork with editable identity, a dedicated owner recipe workspace, public recipe/cookbook grids, follower stats, owner-only branch analytics, recent activity, and social navigation back into recipes and cookbooks.

## Section Routes
- /profile -> recipefork-profile/me @ recipefork-top-nav [creator-profile, account-settings, stats-overview, card-grid]
- /recipes -> recipefork-profile/my-recipes @ recipefork-top-nav [stats-overview, filter-bar, card-grid]
- /profile/:id -> recipefork-profile/public-profile @ recipefork-top-nav [creator-profile, stats-overview, card-grid, recipefork-activity-feed]

## Theme Decorators

Theme `recipefork` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- recipefork-profile
- auxiliary
- recipefork-top-nav
- recipefork
- light
- profile-editing
- follows
- collections
- activity-feed
- public-profiles
- branch-analytics
- creator-profile
- account-settings
- stats-overview
- card-grid
- filter-bar
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
