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
- Existing routes: 17

## Existing Routes

- `/` -> `homepage` [search-filter-bar, content-card-grid, kpi-grid]
- `/browse` -> `browse` [search-filter-bar, content-card-grid]
- `/browse-type` -> `browse-type` [search-filter-bar, content-card-grid]
- `/detail` -> `detail` [content-detail-hero, json-viewer]
- `/profile` -> `profile` [detail-header, content-card-grid, activity-feed]
- `/overview` -> `overview` [kpi-grid, reputation-badge, activity-feed]
- `/content` -> `content` [content-card-grid]
- `/content-new` -> `content-new` [form, json-viewer]
- `/api-keys` -> `api-keys` [api-key-row]
- `/settings` -> `settings` [account-settings]
- `/billing` -> `billing` [tier-upgrade-card, kpi-grid]
- `/team` -> `team` [kpi-grid, team-member-row]
- `/moderation-queue` -> `moderation-queue` [search-filter-bar, moderation-queue-item]
- `/moderation-detail/:id` -> `moderation-detail` [content-detail-hero, json-viewer, moderation-queue-item]
- `/login` -> `login` [auth-form]
- `/register` -> `register` [auth-form]
- `/forgot-password` -> `forgot-password` [auth-form]

### Section Packs

- Section `registry-browser` -> `.decantr/context/section-registry-browser-pack.md`
- Section `user-dashboard` -> `.decantr/context/section-user-dashboard-pack.md`
- Section `admin-moderation` -> `.decantr/context/section-admin-moderation-pack.md`
- Section `auth-flow` -> `.decantr/context/section-auth-flow-pack.md`

### Page Packs

- 17 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

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