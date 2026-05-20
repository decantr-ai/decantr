# Task Context: Scaffolding

**Enforcement Tier: Creative** — Guard rules are advisory during initial scaffolding.

## Primary Compiled Contract

- Start with `.decantr/context/scaffold-pack.md` for the compact route, shell, and theme contract.
- Use `.decantr/context/scaffold.md` only as secondary detail when the compiled pack is not enough.
- Read the route-local page packs before building each page so layout and wiring stay aligned with the compiled plan.

## Generate This Application

- Target: `nextjs` (nextjs)
- Shell: `top-nav-main`
- Theme: `luminarum` (dark, rounded)
- Routing: `pathname`
- Features: search, pagination, auth, api-keys, admin

## Route Plan

- `/` -> `registry-browser/homepage` [blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list]
- `/browse` -> `registry-browser/browse` [search-filter-bar, content-card-grid]
- `/browse/:type` -> `registry-browser/browse-type` [search-filter-bar, content-card-grid]
- `/:type/:namespace/:slug` -> `registry-browser/detail` [blueprint-launch-hero, command-rail, blueprint-anatomy, contract-explorer, json-viewer]
- `/profile/:username` -> `registry-browser/profile` [detail-header, content-card-grid, activity-feed]
- `/scan` -> `registry-browser/scan` [brownfield-scan]
- `/privacy` -> `registry-browser/privacy` [detail-header, registry-link-list]
- `/terms` -> `registry-browser/terms` [detail-header, registry-link-list]
- `/dashboard` -> `user-dashboard/overview` [kpi-grid, reputation-badge, activity-feed]
- `/dashboard/content` -> `user-dashboard/content` [content-card-grid]
- `/dashboard/content/new` -> `user-dashboard/content-new` [form, json-viewer]
- `/dashboard/api-keys` -> `user-dashboard/api-keys` [api-key-row]
- `/dashboard/settings` -> `user-dashboard/settings` [account-settings]
- `/dashboard/billing` -> `user-dashboard/billing` [tier-upgrade-card, kpi-grid]
- `/dashboard/team` -> `user-dashboard/team` [kpi-grid, team-member-row]
- `/dashboard/governance` -> `user-dashboard/governance` [kpi-grid, activity-feed, content-card-grid]
- `/dashboard/private-registry` -> `user-dashboard/private-registry` [search-filter-bar, content-card-grid]
- `/admin/moderation` -> `admin-moderation/moderation-queue` [search-filter-bar, moderation-queue-item]
- `/admin/reports` -> `admin-moderation/commercial-reports` [kpi-grid, activity-feed]
- `/admin/organizations` -> `admin-moderation/organizations` [search-filter-bar, content-card-grid, activity-feed]
- `/admin/organizations/:slug` -> `admin-moderation/organization-detail` [detail-header, kpi-grid, activity-feed, content-card-grid]
- `/admin/moderation/:id` -> `admin-moderation/moderation-detail` [content-detail-hero, json-viewer, moderation-queue-item]
- `/admin/telemetry` -> `admin-moderation/telemetry` [kpi-grid, search-filter-bar, activity-feed]
- `/admin/telemetry/usage` -> `admin-moderation/telemetry-usage` [kpi-grid, activity-feed, content-card-grid]
- `/login` -> `auth-flow/login` [auth-form]
- `/login?mode=register` -> `auth-flow/register` [auth-form]
- `/login?mode=forgot-password` -> `auth-flow/forgot-password` [auth-form]

### Section Packs

- Section `registry-browser` -> `.decantr/context/section-registry-browser-pack.md`
- Section `user-dashboard` -> `.decantr/context/section-user-dashboard-pack.md`
- Section `admin-moderation` -> `.decantr/context/section-admin-moderation-pack.md`
- Section `auth-flow` -> `.decantr/context/section-auth-flow-pack.md`

### Page Packs

- 27 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Success Checks

- [error] Routes and page IDs match the compiled topology.
- [error] The declared shell contract is preserved unless the task explicitly mutates it.
- [warn] Theme identity and mode remain consistent across scaffolded routes.

## Token Budget

- Target: 1400 tokens
- Max: 2200 tokens
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.

Post-scaffold enforcement mode: **STRICT**.

---

*Task context generated from Decantr execution packs*