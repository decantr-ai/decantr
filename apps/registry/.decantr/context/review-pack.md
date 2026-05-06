# Review Pack

**Objective:** Review generated output against the compiled Decantr contract.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile, overview, content, content-new, api-keys, settings, billing, team, governance, private-registry, moderation-queue, commercial-reports, organizations, organization-detail, login | patterns=blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list, content-card-grid, command-rail, blueprint-anatomy, contract-explorer, json-viewer, detail-header, activity-feed, kpi-grid, reputation-badge, form, api-key-row, account-settings, tier-upgrade-card, team-member-row, moderation-queue-item, auth-form

## Review Contract
- Review Type: app
- Shell: top-nav-main
- Theme: luminarum (dark)
- Routing: hash
- Features: search, pagination, auth, api-keys, admin

## Review Topology
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
- /login -> auth-flow/login @ centered [auth-form]

## Focus Areas
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Review Workflow
- Read the scaffold pack and page packs before evaluating generated code.
- Compare findings against the compiled route, shell, and theme contract first.
- Escalate contract drift into essence updates when the requested output intentionally changes topology or theme identity.

## Required Setup
- Read the compiled scaffold and route packs before reviewing code.
- Use concrete evidence from the workspace instead of purely stylistic intuition.

## Allowed Vocabulary
- app
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
- auth-form
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Success Checks
- Review findings should use the compiled route, shell, and theme contract as the baseline. [error]
- Each critique finding should cite concrete evidence from the generated workspace. [error]
- Suggested fixes should point back to code changes or essence updates when contract drift exists. [warn]

## Anti-Patterns
- Avoid inline style literals as the primary styling path.: Move visual styling into tokens.css and treatments.css instead of component-local style objects.
- Avoid hardcoded color literals.: Use CSS variables and theme decorators instead of hex, rgb, or hsl values.
- Avoid utility-framework leakage as the primary design language.: Prefer compiled Decantr treatments and contract vocabulary over ad hoc utility class stacks.

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
