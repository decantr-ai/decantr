# Mutation Pack

**Objective:** Execute the modify workflow against the compiled app contract.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile, overview, content, content-new, api-keys, settings, billing, team, governance, private-registry, moderation-queue, commercial-reports, organizations, organization-detail, moderation-detail, login, register, forgot-password | patterns=blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list, content-card-grid, command-rail, blueprint-anatomy, contract-explorer, json-viewer, detail-header, activity-feed, kpi-grid, reputation-badge, form, api-key-row, account-settings, tier-upgrade-card, team-member-row, moderation-queue-item, content-detail-hero, auth-form

## Mutation Contract
- Operation: modify
- Shell: top-nav-main
- Theme: luminarum (dark)
- Routing: hash → HashRouter from react-router-dom; URLs prefixed with /# (e.g. /#/login). Only for static-only hosts without SPA fallback.
- Features: search, pagination, auth, api-keys, admin

## Route Topology
- / -> registry-browser/homepage @ top-nav-main [blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list]
- /browse -> registry-browser/browse @ top-nav-main [search-filter-bar, content-card-grid]
- /browse/:type -> registry-browser/browse-type @ top-nav-main [search-filter-bar, content-card-grid]
- /:type/:namespace/:slug -> registry-browser/detail @ top-nav-main [blueprint-launch-hero, command-rail, blueprint-anatomy, contract-explorer, json-viewer]
- /profile/:username -> registry-browser/profile @ top-nav-main [detail-header, content-card-grid, activity-feed]
- /dashboard -> user-dashboard/overview @ sidebar-main [kpi-grid, reputation-badge, activity-feed]
- /dashboard/content -> user-dashboard/content @ sidebar-main [content-card-grid]
- /dashboard/content/new -> user-dashboard/content-new @ sidebar-main [form, json-viewer]
- /dashboard/api-keys -> user-dashboard/api-keys @ sidebar-main [api-key-row]
- /dashboard/settings -> user-dashboard/settings @ sidebar-main [account-settings]
- /dashboard/billing -> user-dashboard/billing @ sidebar-main [tier-upgrade-card, kpi-grid]
- /dashboard/team -> user-dashboard/team @ sidebar-main [kpi-grid, team-member-row]
- /dashboard/governance -> user-dashboard/governance @ sidebar-main [kpi-grid, activity-feed, content-card-grid]
- /dashboard/private-registry -> user-dashboard/private-registry @ sidebar-main [search-filter-bar, content-card-grid]
- /admin/moderation -> admin-moderation/moderation-queue @ sidebar-main [search-filter-bar, moderation-queue-item]
- /admin/reports -> admin-moderation/commercial-reports @ sidebar-main [kpi-grid, activity-feed]
- /admin/organizations -> admin-moderation/organizations @ sidebar-main [search-filter-bar, content-card-grid, activity-feed]
- /admin/organizations/:slug -> admin-moderation/organization-detail @ sidebar-main [detail-header, kpi-grid, activity-feed, content-card-grid]
- /admin/moderation/:id -> admin-moderation/moderation-detail @ sidebar-main [content-detail-hero, json-viewer, moderation-queue-item]
- /login -> auth-flow/login @ centered [auth-form]
- /login?mode=register -> auth-flow/register @ centered [auth-form]
- /login?mode=forgot-password -> auth-flow/forgot-password @ centered [auth-form]

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
- blueprint-launch-hero
- search-filter-bar
- featured-launchpad-list
- launchpad-flow
- registry-link-list
- content-card-grid
- command-rail
- blueprint-anatomy
- contract-explorer
- json-viewer
- detail-header
- activity-feed
- kpi-grid
- reputation-badge
- form
- api-key-row
- account-settings
- tier-upgrade-card
- team-member-row
- moderation-queue-item
- content-detail-hero
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
