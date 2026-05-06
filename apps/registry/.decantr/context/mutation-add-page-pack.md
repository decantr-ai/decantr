# Mutation Pack

**Objective:** Execute the add-page workflow against the compiled app contract.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile, overview, content, content-new, api-keys, settings, billing, team, moderation-queue, moderation-detail, login, register, forgot-password | patterns=search-filter-bar, content-card-grid, kpi-grid, content-detail-hero, json-viewer, detail-header, activity-feed, reputation-badge, form, api-key-row, account-settings, tier-upgrade-card, team-member-row, moderation-queue-item, auth-form

## Mutation Contract
- Operation: add-page
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
- Declare the new page in the essence before generating code.
- Refresh Decantr context so section and page packs include the new route.
- Read the relevant section pack and new page pack before implementation.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- add-page
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
- New pages are declared in the essence before any code generation begins. [error]
- New routes inherit an existing shell and section contract unless the essence changes first. [error]
- Refresh compiled packs after the mutation so downstream tasks read current topology. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
