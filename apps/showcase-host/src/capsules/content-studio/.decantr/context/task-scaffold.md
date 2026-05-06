# Task Context: Scaffolding

**Enforcement Tier: Creative** — Guard rules are advisory during initial scaffolding.

## Primary Compiled Contract

- Start with `.decantr/context/scaffold-pack.md` for the compact route, shell, and theme contract.
- Use `.decantr/context/scaffold.md` only as secondary detail when the compiled pack is not enough.
- Read the route-local page packs before building each page so layout and wiring stay aligned with the compiled plan.

## Generate This Application

- Target: `react-vite` (react)
- Shell: `sidebar-main`
- Theme: `editorial` (light, sharp)
- Routing: `history`
- Features: editing, publishing, auto-save, markdown, auth, theme-toggle

## Route Plan

- `/drafts` -> `content-author/drafts` [data-table]
- `/drafts/:id` -> `content-author/editor` [doc-editor]
- `/published` -> `content-author/published` [data-table]
- `/login` -> `auth-flow/login` [auth-form]
- `/register` -> `auth-flow/register` [auth-form]
- `/forgot-password` -> `auth-flow/forgot-password` [auth-form]
- `/settings` -> `settings/settings` [form-sections]

### Section Packs

- Section `content-author` -> `.decantr/context/section-content-author-pack.md`
- Section `auth-flow` -> `.decantr/context/section-auth-flow-pack.md`
- Section `settings` -> `.decantr/context/section-settings-pack.md`

### Page Packs

- 7 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

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