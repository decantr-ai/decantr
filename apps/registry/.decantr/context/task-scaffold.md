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
- Routing: `hash`
- Features: search, pagination, auth, api-keys, admin

## Route Plan

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
