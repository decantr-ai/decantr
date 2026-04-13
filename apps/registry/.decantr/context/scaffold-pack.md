# Scaffold Pack

**Objective:** Scaffold the luminarum app shell and declared routes.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile, overview, content, content-new, api-keys, settings, billing, team, moderation-queue, moderation-detail, login, register, forgot-password | patterns=search-filter-bar, content-card-grid, kpi-grid, content-detail-hero, json-viewer, detail-header, activity-feed, reputation-badge, form, api-key-row, account-settings, tier-upgrade-card, team-member-row, moderation-queue-item, auth-form

## Scaffold Contract
- Shell: top-nav-main
- Theme: luminarum (dark)
- Routing: hash
- Features: search, pagination, auth, api-keys, admin

## Route Plan
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

## Required Setup
- Treat the declared routes as the topology source of truth.
- Preserve the resolved theme and shell contract unless the task explicitly mutates them.

## Allowed Vocabulary
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
- Routes and page IDs match the compiled topology. [error]
- The declared shell contract is preserved unless the task explicitly mutates it. [error]
- Theme identity and mode remain consistent across scaffolded routes. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
