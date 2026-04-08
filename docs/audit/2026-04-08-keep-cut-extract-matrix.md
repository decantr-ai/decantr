# Keep / Cut / Extract Matrix

Date: 2026-04-08
Status: Draft decision matrix for Decantr vNext

## 1. Decision Rules

Use the following rules when classifying any surface:

- Keep if it directly serves the vNext product nucleus.
- Keep but reframe if it is useful, but currently positioned or organized incorrectly.
- Extract / archive if it is real work with value, but not part of the near-term Decantr product.
- Delete if it creates more confusion than leverage and has no meaningful reuse value.

Because this is a greenfield reset, the bias should be toward clarity, not preservation.

## 2. Product Nucleus: Keep

| Surface | Decision | Why |
|---|---|---|
| `decantr-content` | Keep | Official curated registry content source of truth |
| `apps/api` | Keep | Hosted API, sync, moderation, auth, and platform foundation |
| `apps/registry` | Keep | Public registry product surface |
| `docs/` public site | Keep | Must explain and sell the actual product |
| `packages/essence-spec` | Keep | Core contract and validation layer |
| `packages/registry` | Keep | Content access and resolution layer |
| `packages/mcp-server` | Keep | Primary AI delivery surface |
| `packages/cli` | Keep | Useful local bootstrap and maintenance surface |
| `packages/css` | Keep | Framework-agnostic utility aligned with UI control-plane vision |
| `packages/core` | Keep | Potential compiler / IR foundation, pending scope cleanup |

## 3. Keep, But Reframe

| Surface | Decision | Why | Required reframe |
|---|---|---|---|
| `apps/showcase/*` | Keep, but reframe | Valuable evidence corpus of blueprint scaffold attempts | Reclassify as benchmark / golden-app pipeline |
| `packages/vite-plugin` | Keep, but reframe | Potential future verification adapter | Position as later-phase verification integration, not primary product |
| `docs/audit/decantr-meta-alignment.md` | Keep, but reframe | Useful strategic context | Treat as future-compatibility note, not active delivery scope |

## 4. Extract or Archive Candidates

| Surface | Decision | Why | Likely destination |
|---|---|---|---|
| `packages/ui` | Removed on reset branch | Standalone framework direction is off the critical product path | Historical main branch / future archive repo if ever needed |
| `packages/ui-chart` | Removed on reset branch | Depends on `@decantr/ui` line, not core Decantr mission | Historical main branch / future archive repo if ever needed |
| `packages/ui-catalog` | Removed on reset branch | Supports framework ecosystem rather than core control-plane product | Historical main branch / future archive repo if ever needed |
| `apps/ui-site` | Removed on reset branch | Showcase site for `@decantr/ui`, not Decantr vNext product | Historical main branch / future archive repo if ever needed |
| `apps/workbench` | Removed on reset branch | Framework workbench, not core product surface | Historical main branch / future archive repo if ever needed |
| `decantr_component_api` MCP surface | Removed from default product | Only strategically relevant if the UI framework stays in-scope | Removed from `@decantr/mcp-server` on the reset branch |

## 5. Delete or Replace Candidates

| Surface | Decision | Why | Replacement |
|---|---|---|---|
| Stale README framing around framework ecosystem | Replace | Public story is diluted | Rewrite around design intelligence / registry / verification |
| Stale package docs for off-strategy packages | Replace or archive | Public npm surface should not make dead bets look current | Archive or mark unsupported |
| Legacy plans centered on UI framework expansion | Archive | They create planning confusion | Preserve under `docs/archive/` if needed |
| Duplicate or obsolete experimental docs | Delete when superseded | Planning noise slows execution | Supersede with vNext program docs |

## 6. Immediate Classification Actions

### 6.1 Phase 0 actions

- stop treating `@decantr/ui` ecosystem work as a dependency for Decantr product planning
- treat showcase apps as audit input, not roadmap proof
- update docs so the product nucleus is obvious

### 6.2 Phase 1 actions

- remove UI-framework-first messaging from public surfaces
- remove or gate MCP and docs surfaces that only exist for the UI framework

### 6.3 Phase 2 actions

- remove npm/package references that no longer belong in the vNext story

## 7. Guiding Principle

The reset should prefer a smaller, sharper Decantr over a broader but fuzzier one.

If a surface does not clearly strengthen Decantr as the control plane for AI-generated UI, it should not remain in the center of the repo.
