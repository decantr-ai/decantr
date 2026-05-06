# Section Pack

**Objective:** Implement the user-dashboard section using the compiled sidebar-main shell contract.
**Target:** nextjs (nextjs)
**Scope:** pages=overview, content, content-new, api-keys, settings, billing, team, governance, private-registry | patterns=kpi-grid, reputation-badge, activity-feed, content-card-grid, form, json-viewer, api-key-row, account-settings, tier-upgrade-card, team-member-row, search-filter-bar

## Section Contract
- Section: user-dashboard
- Role: primary
- Shell: sidebar-main
- Theme: luminarum (dark)
- Features: auth, api-keys
- Description: Authenticated user area with content management, API key management, account settings, and activity overview.

## Section Routes
- /dashboard -> user-dashboard/overview @ sidebar-main [kpi-grid, reputation-badge, activity-feed]
- /dashboard/content -> user-dashboard/content @ sidebar-main [content-card-grid]
- /dashboard/content/new -> user-dashboard/content-new @ sidebar-main [form, json-viewer]
- /dashboard/api-keys -> user-dashboard/api-keys @ sidebar-main [api-key-row]
- /dashboard/settings -> user-dashboard/settings @ sidebar-main [account-settings]
- /dashboard/billing -> user-dashboard/billing @ sidebar-main [tier-upgrade-card, kpi-grid]
- /dashboard/team -> user-dashboard/team @ sidebar-main [kpi-grid, team-member-row]
- /dashboard/governance -> user-dashboard/governance @ sidebar-main [kpi-grid, activity-feed, content-card-grid]
- /dashboard/private-registry -> user-dashboard/private-registry @ sidebar-main [search-filter-bar, content-card-grid]

## Theme Decorators

Theme `luminarum` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- user-dashboard
- primary
- sidebar-main
- luminarum
- dark
- auth
- api-keys
- kpi-grid
- reputation-badge
- activity-feed
- content-card-grid
- form
- json-viewer
- api-key-row
- account-settings
- tier-upgrade-card
- team-member-row
- search-filter-bar

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
