# Task Context: Adding Pages

**Enforcement Tier: Guided**

## Primary Compiled Contract

- Start with `.decantr/context/mutation-add-page-pack.md` for the add-page workflow contract.
- Use `.decantr/context/scaffold-pack.md` for the current route, shell, and theme contract.
- Use `.decantr/context/pack-manifest.json` to choose the target section before you add a route.
- After updating the essence, run `npx @decantr/cli refresh` so the new section/page packs exist before code generation.

## Current Scaffold Contract

- Target: `nextjs` (nextjs)
- Shell: `top-nav-main`
- Theme: `luminarum` (dark)
- Existing routes: 19

## Existing Routes

- `/` -> `registry-browser/homepage` [blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list]
- `/browse` -> `registry-browser/browse` [search-filter-bar, content-card-grid]
- `/browse/:type` -> `registry-browser/browse-type` [search-filter-bar, content-card-grid]
- `/:type/:namespace/:slug` -> `registry-browser/detail` [blueprint-launch-hero, command-rail, blueprint-anatomy, contract-explorer, json-viewer]
- `/profile/:username` -> `registry-browser/profile` [detail-header, content-card-grid, activity-feed]
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
- `/login` -> `auth-flow/login` [auth-form]

### Section Packs

- Section `registry-browser` -> `.decantr/context/section-registry-browser-pack.md`
- Section `user-dashboard` -> `.decantr/context/section-user-dashboard-pack.md`
- Section `admin-moderation` -> `.decantr/context/section-admin-moderation-pack.md`
- Section `auth-flow` -> `.decantr/context/section-auth-flow-pack.md`

### Page Packs

- 19 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Required Workflow

1. Add the new page to the essence before generating any code.
2. Keep the new page inside a declared section and shell contract.
3. Refresh derived files so Decantr recompiles the section and page packs.
4. Read the relevant section pack and the new page pack before implementation.

## Guided Checks

- [error] Theme identity remains `luminarum` until the essence changes.
- [error] The new page exists in the essence before code generation begins.
- [error] New layouts only use registry-backed patterns.
- [warn] New routes should fit the current shell and section topology instead of creating off-contract filler pages.

---

*Task context generated from Decantr execution packs*