# Task Context: Modifying Code

**Enforcement Tier: Strict**

## Primary Compiled Contract

- Start with `.decantr/context/mutation-modify-pack.md` for the strict modification workflow contract.
- Start with `decantr_get_page_context` or the matching `.decantr/context/page-*-pack.md` file for the route you are editing.
- Use `decantr_get_section_context` when you need the richer section contract behind that route.
- If a change would alter route identity, shell identity, theme identity, or pattern contract, update the essence first and then refresh the packs.

## Current Route Topology

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

### Page Packs

- 17 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

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