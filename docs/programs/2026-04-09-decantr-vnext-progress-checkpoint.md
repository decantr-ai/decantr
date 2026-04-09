# Decantr vNext Progress Checkpoint

Date: 2026-04-09

This checkpoint records what is already implemented on the `codex/decantr-vnext-reset`
branch so the reset program can continue from a known-good state instead of relying on
commit archaeology.

## Branch State

- `decantr-monorepo`: `codex/decantr-vnext-reset`
- `decantr-content`: `codex/decantr-vnext-resetmai`

## Completed Streams

### Product boundary reset

- Removed legacy UI-runtime surfaces from the active monorepo product boundary:
  - `apps/ui-site`
  - `apps/workbench`
  - `packages/ui`
  - `packages/ui-chart`
  - `packages/ui-catalog`
- Reframed `apps/showcase/*` as a benchmark corpus instead of a product app line.
- Archived stale planning/docs that kept the old product story alive.

### Registry/content/API normalization

- Normalized live registry taxonomy around:
  - `pattern`
  - `theme`
  - `blueprint`
  - `archetype`
  - `shell`
- Removed lingering `recipe` and `theme.style` drift from active product flows.
- Tightened shared registry typing to match the real corpus.
- Hardened `decantr-content` validation around live schema contracts.

### Schema ownership

- Canonical registry schemas live in package surfaces under `packages/registry/schema`.
- API schema serving reads from package exports instead of private copies.
- Public schema copies in `docs/schemas` are synced from package sources.
- `decantr-content` has a schema sync path back to the monorepo package source.

### Execution packs

- Added schema-backed execution pack contracts:
  - scaffold
  - section
  - page
  - mutation
  - review
  - pack manifest
- CLI now emits pack artifacts into scaffolded projects.
- MCP can read scaffold, section, page, mutation, and review pack context.
- Generated project guidance now points operators to packs first.

### Verification foundation

- Added shared verifier package: `@decantr/verifier`
- Added schema-backed verifier report contracts.
- CLI and MCP now share the verifier engine.
- Review packs now inform critique behavior.

### Showcase / golden corpus

- Added showcase manifest validation and repeatable shortlist verification.
- Added shortlist verification reports and schema contracts.
- Registry homepage and blueprint detail surfaces expose showcase benchmark metadata.
- API, CLI, and MCP all expose showcase benchmark surfaces.
- Registry app now dogfoods public showcase metadata from the hosted API path.

### Registry intelligence

- Added authored intelligence scoring on top of benchmark-backed blueprint intelligence.
- Added public ranking for recommended content.
- Added shared sort handling across API, registry, CLI, and MCP.
- Added recommended filtering across public registry surfaces.
- Added explicit intelligence provenance:
  - `authored`
  - `benchmark`
  - `hybrid`
- Added a hosted schema-backed registry intelligence rollup endpoint:
  - `/v1/intelligence/summary`
- Added intelligence-source filtering across:
  - public API routes
  - registry portal browse surfaces
  - CLI search/list
  - MCP registry search
- Registry cards now label intelligence provenance directly.

### Content repo operational audits

- Added live registry drift audit in `decantr-content`.
- Added content-intelligence audit in `decantr-content`.
- Added provenance/source-filter audit coverage so live API rollout gaps are measurable.
- Added a hosted intelligence summary surface so rollout state can be checked without crawling the entire public corpus.
- Added dry-run reporting for official-content sync/prune behavior.

## Verification Baseline

The reset branch has repeatedly been verified with:

- `pnpm test`
- `pnpm build`
- `pnpm lint`
- `pnpm showcase:validate`
- `pnpm showcase:verify:shortlist`
- `node validate.js` in `decantr-content`
- `node scripts/audit-content-intelligence.js` in `decantr-content`
- `node scripts/audit-registry-drift.js` in `decantr-content`

## Known Live Rollout Gaps

The repo-side architecture is ahead of the currently deployed public API.

Observed from live audits against `https://api.decantr.ai/v1`:

- hosted `recommended=true` behavior still does not match metadata counts
- hosted `intelligence_source=authored|benchmark|hybrid` currently behaves like an unfiltered response
- live `@official` registry content is still missing the new intelligence metadata on deployed surfaces
- stale `workbench`-era content still appears in live registry results

These are rollout/deployment issues, not local branch correctness issues.

## Highest-Value Next Streams

1. Deploy or stage the hosted API/registry changes so live audits start converging.
2. Add a lightweight public API/reference doc for registry browse/search filters.
3. Keep expanding golden verification beyond build/smoke into richer route/runtime checks.
4. Move execution packs deeper into hosted/API workflows instead of local scaffold-only artifacts.
5. Continue narrowing legacy `any`/implicit contracts in older CLI and MCP paths.
