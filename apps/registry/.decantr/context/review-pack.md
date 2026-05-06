# Review Pack

**Objective:** Review generated output against the compiled Decantr contract.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile, overview, content, content-new, api-keys, settings, billing, team, moderation-queue, moderation-detail, login, register, forgot-password | patterns=search-filter-bar, content-card-grid, kpi-grid, content-detail-hero, json-viewer, detail-header, activity-feed, reputation-badge, form, api-key-row, account-settings, tier-upgrade-card, team-member-row, moderation-queue-item, auth-form

## Review Contract
- Review Type: app
- Shell: top-nav-main
- Theme: luminarum (dark)
- Routing: hash
- Features: search, pagination, auth, api-keys, admin

## Review Topology
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
