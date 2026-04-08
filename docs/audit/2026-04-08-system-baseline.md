# Decantr System Baseline

Date: 2026-04-08
Branch snapshot: `codex/decantr-vnext-reset` tracking `origin/main`
Scope: `decantr-monorepo` plus the connected `decantr-content` repo

## 1. Executive Summary

Decantr already has the beginnings of a legitimate product system, but it is carrying multiple competing identities at once:

- design intelligence platform for AI-generated UI
- hosted registry and content network
- MCP / CLI tooling for agents
- standalone UI framework experiment
- showcase corpus of generated and hand-patched apps

The core commercial path is present, but the repo and docs still mix that path with adjacent experiments. The reset should focus on the product nucleus and archive the rest.

## 2. Repos and Runtime Surfaces

### 2.1 `decantr-content`

Current role:
- official curated content source of truth
- validates JSON and syncs to the live registry on push to `main`

Observed facts:
- GitHub workflow validates content, then runs `scripts/sync-to-registry.js`
- sync target defaults to `https://api.decantr.ai/v1`
- sync uses `DECANTR_ADMIN_KEY`

### 2.2 `decantr-monorepo/apps/api`

Current role:
- hosted API / registry backend / MCP-adjacent service
- official sync endpoint
- community publish and moderation flows
- Supabase-backed content and auth foundation

Observed facts:
- supports admin sync for official content
- supports authenticated user publishing and moderation queue flow
- includes Stripe, Supabase, Fly deployment assumptions

### 2.3 `decantr-monorepo/apps/registry`

Current role:
- Next.js registry portal for `registry.decantr.ai`

Observed facts:
- independent product surface
- depends on Supabase and hosted API model

### 2.4 `decantr-monorepo/docs/`

Current role:
- current public docs / site content deployed via GitHub Pages

Observed facts:
- public-facing product explanation currently competes with older framework and ecosystem threads

### 2.5 `decantr-monorepo/apps/showcase/*`

Current role:
- 39 attempted full blueprint scaffolds
- mixed provenance: generated, patched, and partially hand-rolled

Observed facts:
- this is a strong benchmark and regression corpus candidate
- it should not be treated as equal to the core product surfaces

## 3. Package Inventory

### 3.1 Publishable packages

| Path | Package | Version | Baseline view |
|---|---|---:|---|
| `packages/cli` | `@decantr/cli` | `1.7.5` | Keep, but narrow and realign |
| `packages/core` | `@decantr/core` | `1.0.0-beta.9` | Keep, scope needs clarification |
| `packages/css` | `@decantr/css` | `1.0.2` | Keep as core utility |
| `packages/essence-spec` | `@decantr/essence-spec` | `1.0.0-beta.11` | Keep as core |
| `packages/mcp-server` | `@decantr/mcp-server` | `1.0.0-beta.12` | Keep as core |
| `packages/registry` | `@decantr/registry` | `1.0.0-beta.12` | Keep as core |
| `packages/ui` | `@decantr/ui` | `0.1.0` | Extract / archive candidate |
| `packages/ui-catalog` | `@decantr/ui-catalog` | `0.1.0` | Extract / archive candidate |
| `packages/ui-chart` | `@decantr/ui-chart` | `0.1.0` | Extract / archive candidate |
| `packages/vite-plugin` | `@decantr/vite-plugin` | `0.1.0` | Re-evaluate after core reset |

### 3.2 Private apps

| Path | Package | Version | Baseline view |
|---|---|---:|---|
| `apps/api` | `decantr-api` | `2.0.0` | Keep |
| `apps/registry` | `registry` | `0.1.0` | Keep |
| `apps/ui-site` | `@decantr/ui-site` | `0.1.0` | Extract / archive candidate |
| `apps/workbench` | `@decantr/workbench` | `0.1.0` | Extract / archive candidate |

## 4. Root Workspace and Build Reality

Observed facts from the root workspace:

- workspace includes `packages/*`, `apps/*`, and `apps/showcase/*`
- root build script prioritizes `@decantr/essence-spec`, `@decantr/registry`, `@decantr/css`, `@decantr/core`, `@decantr/mcp-server`, `@decantr/cli`, and `@decantr/vite-plugin`
- the standalone UI framework packages are not part of the primary root build path

Implication:
- the repo already behaves as if some surfaces are secondary, even if the docs still market them as first-class

## 5. Content Inventory Snapshot

Source: `decantr-content`

| Type | Count |
|---|---:|
| Patterns | 196 |
| Themes | 31 |
| Blueprints | 39 |
| Archetypes | 204 |
| Shells | 15 |

Notes:
- `decantr-content` README still references `recipes/`, but the current top-level content directories being actively counted are patterns, themes, blueprints, archetypes, and shells
- the content corpus is already large enough that quality, scoring, and contract clarity matter more than raw volume growth

## 6. Deployment and Workflow Baseline

### 6.1 Official content publishing

- `decantr-content` validates on push to `main`
- after validation, it syncs official content to the hosted registry API

### 6.2 Docs site

- the monorepo includes a GitHub Pages workflow for the docs surface

### 6.3 Hosted API

- `apps/api` is built around Fly + Supabase assumptions and includes admin, moderation, and billing-related env surface area

### 6.4 Registry portal

- `apps/registry` is a standalone Next.js surface with Supabase dependencies

## 7. Known Mismatches and Risks

### 7.1 Content taxonomy drift

There is already a contract mismatch around `recipe`:

- `decantr-content` README still documents `recipes/`
- `apps/api` runtime `ContentType` excludes `recipe`
- the content table migration still allows `recipe`

This is a high-priority cleanup item because it affects source-of-truth clarity.

### 7.2 Product identity drift

The public story still mixes:

- design intelligence platform
- standalone UI framework
- workbench / component catalog ecosystem

This muddies the commercial message.

### 7.3 Showcase corpus is unclassified

The showcase apps are valuable, but they currently mix successful scaffolds, patched scaffolds, and likely obsolete outputs without provenance labels.

### 7.4 Publishable package sprawl

Several public npm packages represent experimental or off-strategy surfaces. Even if backward compatibility is not required, they still create public confusion until they are archived or clarified.

### 7.5 Legacy planning noise

The repo contains multiple plans from multiple strategic directions. Without a reset program, implementation work will keep inheriting conflicting assumptions.

## 8. Baseline Conclusions

The system already has enough real structure to justify a focused product reset instead of another exploratory round.

The vNext program should:

1. keep the product nucleus
2. classify or archive the framework experiment
3. turn showcase sprawl into benchmark intelligence
4. unify the content and API contract
5. rebuild public positioning around the actual product
