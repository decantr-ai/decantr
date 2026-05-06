# Mutation Pack

**Objective:** Execute the modify workflow against the compiled app contract.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile, overview, content, content-new, api-keys, settings, billing, team, moderation-queue, moderation-detail, login, register, forgot-password | patterns=search-filter-bar, content-card-grid, kpi-grid, content-detail-hero, json-viewer, detail-header, activity-feed, reputation-badge, form, api-key-row, account-settings, tier-upgrade-card, team-member-row, moderation-queue-item, auth-form

## Mutation Contract
- Operation: modify
- Shell: top-nav-main
- Theme: luminarum (dark)
- Routing: hash
- Features: search, pagination, auth, api-keys, admin

## Route Topology
- / -> homepage [search-filter-bar, content-card-grid, kpi-grid]
- /browse -> browse [search-filter-bar, content-card-grid]
- /browse-type -> browse-type [search-filter-bar, content-card-grid]
- /detail -> detail [content-detail-hero, json-viewer]
- /profile -> profile [detail-header, content-card-grid, activity-feed]
- /overview -> overview [kpi-grid, reputation-badge, activity-feed]
- /content -> content [content-card-grid]
- /content-new -> content-new [form, json-viewer]
- /api-keys -> api-keys [api-key-row]
- /settings -> settings [account-settings]
- /billing -> billing [tier-upgrade-card, kpi-grid]
- /team -> team [kpi-grid, team-member-row]
- /moderation-queue -> moderation-queue [search-filter-bar, moderation-queue-item]
- /moderation-detail/:id -> moderation-detail [content-detail-hero, json-viewer, moderation-queue-item]
- /login -> login [auth-form]
- /register -> register [auth-form]
- /forgot-password -> forgot-password [auth-form]

## Workflow
- Read the page pack for the route you are modifying first.
- Stop and update the essence before changing route, shell, or pattern contracts.
- Validate and check drift after code changes complete.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- modify
- top-nav-main
- luminarum
- dark
- search
- pagination
- auth
- api-keys
- admin
- search-filter-bar
- content-card-grid
- kpi-grid
- content-detail-hero
- json-viewer
- detail-header
- activity-feed
- reputation-badge
- form
- api-key-row
- account-settings
- tier-upgrade-card
- team-member-row
- moderation-queue-item
- auth-form

## Success Checks
- Modified routes remain coherent with the compiled topology unless the essence changes first. [error]
- Theme, shell, and page identity stay aligned with the current contract during edits. [error]
- Route-local edits should start from the compiled page pack rather than improvised structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
