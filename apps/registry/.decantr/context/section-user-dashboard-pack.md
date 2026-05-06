# Section Pack

**Objective:** Implement the user-dashboard section using the compiled sidebar-main shell contract.
**Target:** nextjs (nextjs)
**Scope:** pages=overview, content, content-new, api-keys, settings, billing, team | patterns=kpi-grid, reputation-badge, activity-feed, content-card-grid, form, json-viewer, api-key-row, account-settings, tier-upgrade-card, team-member-row

## Section Contract
- Section: user-dashboard
- Role: primary
- Shell: sidebar-main
- Theme: luminarum (dark)
- Features: auth, api-keys
- Description: Authenticated user area with content management, API key management, account settings, and activity overview.

## Section Routes
- /overview -> overview [kpi-grid, reputation-badge, activity-feed]
- /content -> content [content-card-grid]
- /content-new -> content-new [form, json-viewer]
- /api-keys -> api-keys [api-key-row]
- /settings -> settings [account-settings]
- /billing -> billing [tier-upgrade-card, kpi-grid]
- /team -> team [kpi-grid, team-member-row]

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
