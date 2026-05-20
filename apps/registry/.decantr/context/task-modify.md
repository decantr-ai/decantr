# Task Context: Modifying Code

**Enforcement Tier: Strict**

## Primary Compiled Contract

- Start with `.decantr/context/mutation-modify-pack.md` for the strict modification workflow contract.
- Start with `decantr_get_page_context` or the matching `.decantr/context/page-*-pack.md` file for the route you are editing.
- Use `decantr_get_section_context` when you need the richer section contract behind that route.
- If a change would alter route identity, shell identity, theme identity, or pattern contract, update the essence first and then refresh the packs.

## Current Route Topology

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

### Page Packs

- 27 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Strict Workflow

1. Identify the target page and read its compiled page pack first.
2. Compare the planned edit against the compiled route, shell, and pattern contract.
3. If the edit changes that contract, stop and update the essence before writing code.
4. Run `npx @decantr/cli validate` and `npx @decantr/cli check` after the modification.

## Strict Checks

- [error] Routes and page IDs match the compiled topology.
- [error] The declared shell contract is preserved unless the task explicitly mutates it.
- [warn] Theme identity and mode remain consistent across scaffolded routes.
- [error] The page you modify must already exist in the compiled topology.
- [error] Pattern order and shell usage should stay aligned with the page pack unless the essence changes first.
- [warn] Use section context only as supporting detail; the page pack is the primary contract for route-local work.

---

*Task context generated from Decantr execution packs*