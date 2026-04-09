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
- `essence.v3.json` now matches the actual sectioned v3.1 contract already used by the compiler and guard stack:
  - sectioned blueprints
  - route maps
  - route-bearing blueprint pages
  - `meta.seo`
  - `meta.navigation`
- `migrateV30ToV31()` now emits a schema-valid section description instead of producing an invalid v3.1 artifact.

### Execution packs

- Added schema-backed execution pack contracts:
  - scaffold
  - section
  - page
  - mutation
  - review
  - pack manifest
- Added a hosted execution-pack bundle contract:
  - `execution-pack-bundle.v1.json`
- CLI now emits pack artifacts into scaffolded projects.
- Shared core now compiles execution-pack bundles from essence as a reusable runtime primitive instead of only inside CLI scaffold glue.
- MCP can read scaffold, section, page, mutation, and review pack context.
- MCP context readers now fall back to hosted pack compilation when local `.decantr/context` artifacts are missing or incomplete.
- Generated project guidance now points operators to packs first.
- Hosted API now compiles execution packs from essence documents through:
  - `POST /v1/packs/compile`
- Public registry client and CLI now expose that hosted compiler surface:
  - `RegistryAPIClient.compileExecutionPacks()`
  - `decantr registry compile-packs`
- `decantr registry compile-packs --write-context` can now materialize the hosted pack bundle into local `.decantr/context` artifacts without waiting for a full refresh cycle.

### Verification foundation

- Added shared verifier package: `@decantr/verifier`
- Added schema-backed verifier report contracts.
- CLI and MCP now share the verifier engine.
- Review packs now inform critique behavior.
- Project audit now aggregates source-tree findings from `src/`, `app/`, `pages/`, and `components/` when they are present, including inline styles, risky HTML patterns, placeholder routes, auth storage writes, accessibility issues, and unsafe form/auth input behavior.
- Project audit now includes shared runtime evidence when `dist/` exists:
  - root document validation
  - document title validation
  - document `lang` and `viewport` metadata checks
  - built asset fetch checks
  - route-document coverage checks
- Project audit now adds document-hardening and runtime-security heuristics:
  - charset declaration presence
  - inline script detection
  - external script integrity checks
  - CSP signal detection
  - built-JS dynamic code execution markers
  - built-JS HTML injection markers
- Project audit now also records built asset byte totals and warns on oversized JS/CSS/total bundle budgets.
- Project audit now warns when an auth-declared essence lacks a clear gateway section or anonymous entry route.
- File critique now flags higher-risk code patterns including:
  - `dangerouslySetInnerHTML`
  - raw DOM HTML injection
  - `eval` / `new Function`
- File critique now includes a first AST-backed static pass for supported TS/JSX input so inline-style and high-risk HTML/code-execution findings do not rely only on regex matching.

### Showcase / golden corpus

- Added showcase manifest validation and repeatable shortlist verification.
- Added shortlist verification reports and schema contracts.
- Moved shortlist verification onto the shared `@decantr/verifier` built-dist runtime audit path instead of keeping a showcase-only smoke helper.
- Deepened shortlist verification beyond root/asset smoke with:
  - HTML title checks
  - HTML `lang` and viewport checks
  - charset checks
  - inline script counts
  - external script integrity checks
  - CSP signal checks
  - route-document coverage checks
  - total / JS / CSS asset payload reporting
  - richer shortlist summary/report fields surfaced through shared contracts
- Registry homepage and blueprint detail surfaces expose showcase benchmark metadata.
- API, CLI, and MCP all expose showcase benchmark surfaces.
- Registry app now dogfoods public showcase metadata from the hosted API path.
- Current tracked shortlist baseline on 2026-04-09:
  - 8/8 builds passing
  - 8/8 smoke checks passing
  - 8/8 title / `lang` / viewport / charset checks passing
  - 8/8 with no inline script tags
  - 8/8 with no external scripts missing integrity
  - 0/8 with CSP signals present
  - average build duration `1604ms`
  - average smoke duration `9ms`
  - average assets `335362 B total`, `325759 B JS`, `9602 B CSS`

### Registry intelligence

- Added authored intelligence scoring on top of benchmark-backed blueprint intelligence.
- Added public ranking for recommended content.
- Added shared sort handling across API, registry, CLI, and MCP.
- Added recommended filtering across public registry surfaces.
- Added explicit intelligence provenance:
  - `authored`
  - `benchmark`
  - `hybrid`
- Added explicit intelligence confidence tiers so recommendation quality is visible and rankable:
  - `low`
  - `medium`
  - `high`
  - `verified`
- Intelligence scoring now rewards shortlist runtime hardening evidence:
  - document `lang` / viewport metadata
  - charset presence
  - script hygiene without inline scripts or missing integrity
  - optional CSP signal presence
  - healthy built asset budgets
  - not just build/smoke pass state
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

### Hosted rollout visibility

- Added a lightweight public API smoke audit script: `pnpm audit:public-api`
- Added a GitHub Actions workflow for scheduled/manual public API audit reporting.
- Added a human-readable public API reference page under `docs/reference/`.
- Added a manual Fly deploy workflow for the hosted API:
  - `.github/workflows/deploy-api-fly.yml`
- Added an explicit Vercel deploy workflow for the registry portal:
  - `.github/workflows/deploy-registry-vercel.yml`
- Added a hosted registry portal audit surface:
  - `pnpm audit:registry-portal`
  - `.github/workflows/registry-portal-audit.yml`
- Standardized the hosted API deploy contract around:
  - `apps/api/fly.toml`
  - the workspace-aware root `Dockerfile`
- Standardized the registry portal deploy contract around:
  - `apps/registry`
  - `apps/registry/.env.example`
  - `docs/runbooks/2026-04-09-registry-portal-deploy.md`
- Removed stale deploy-path drift:
  - retired the old root `fly.toml`
  - removed the obsolete `apps/api/Dockerfile`
  - removed the stray `apps/api/package-lock.json`
- Completed the hosted API rollout on 2026-04-09:
  - Fly now serves the reset-branch API successfully
  - `/v1/schema/*`, `/v1/showcase/*`, and `/v1/intelligence/summary` are publicly reachable
  - `pnpm audit:public-api` now passes against `https://api.decantr.ai/v1`
- Extended the hosted public API contract again after rollout with:
  - `POST /v1/packs/compile`
  - audit coverage for hosted execution-pack compilation
  - public docs/reference coverage for the hosted compiler surface
  - direct Fly redeploy from `codex/decantr-vnext-reset` completed successfully
  - `POST /v1/packs/compile` now returns `200` in live public audits
- Added a hosted file-critique surface on the reset branch:
  - `POST /v1/critique/file`
  - shared verifier-backed critique for inline source plus posted essence
  - CLI entrypoint via `decantr registry critique-file`
  - MCP hosted fallback when local review packs are missing
  - public API audit coverage is opt-in until rollout via `--include-hosted-critique`
- Added a hosted project-audit surface on the reset branch:
  - `POST /v1/audit/project`
  - remote project audit from posted essence plus optional dist and source snapshots
  - CLI entrypoint via `decantr registry audit-project`
  - MCP hosted fallback when local pack artifacts are missing, with optional `sources_path` support for richer hosted source verification
  - public API audit coverage is opt-in until rollout via `--include-hosted-project-audit`
- Completed the hosted verification rollout on 2026-04-09:
  - Fly redeploy from `codex/decantr-vnext-reset` completed successfully after syncing the workspace lockfile
  - `pnpm audit:public-api --include-hosted-critique --include-hosted-project-audit` now reports both hosted verification endpoints as `200`
  - live hosted verification now covers:
    - `POST /v1/critique/file`
    - `POST /v1/audit/project`
- Completed the official content rollout on 2026-04-09:
  - content workflow run `24192386163` synced `codex/decantr-vnext-resetmai` into the live registry
  - live `@official` content count is now `480`
  - stale live extras were pruned
  - live registry drift now reports zero missing, extra, or changed items

### Registry portal dogfooding

- The registry portal now validates as a schema-correct Decantr v3.1 project instead of carrying a stale essence shape.
- `apps/registry` now has compiled pack artifacts checked into `.decantr/context`, including:
  - scaffold pack
  - section packs
  - page packs
  - mutation packs
  - review pack
  - pack manifest
- Added a CI-visible dogfood audit command:
  - `pnpm audit:registry-dogfood`
- Wired that audit into the main CI workflow.
- Reduced verifier findings on the public homepage and detail page by:
  - removing inline style literals
  - removing hardcoded color literals
  - adding real landmark ARIA metadata
  - adding explicit focus-visible signals
  - adding responsive CSS-module breakpoints

### Package surface governance

- Added `config/package-surface.json` as the package support and dist-tag source of truth.
- Added `config/package-retirements.json` plus a retirement/deprecation script for removed npm lines such as `@decantr/ui`.
- Added `pnpm audit:package-surface` and wired it into CI.
- Added executable release-readiness metadata and `pnpm audit:release-readiness` so beta-to-stable graduation stops living only in docs.
- Added `pnpm release:plan` plus `scripts/release-plan.mjs` so package publish intent, beta blockers, and retired replacements can be generated as Markdown or JSON from the manifest source of truth.
- Replaced the hardcoded publish loop with a manifest-backed publish script.
- Added package-level README coverage for all active public packages.
- Added a package support matrix and release-strategy runbook for the npm surface.

## Verification Baseline

The reset branch has repeatedly been verified with:

- `pnpm test`
- `pnpm build`
- `pnpm lint`
- `pnpm audit:registry-dogfood`
- `pnpm showcase:validate`
- `pnpm showcase:verify:shortlist`
- `node validate.js` in `decantr-content`
- `node scripts/audit-content-intelligence.js` in `decantr-content`
- `node scripts/audit-registry-drift.js` in `decantr-content`

## Current Live State

Observed from live audits against `https://api.decantr.ai/v1` on 2026-04-09:

- hosted public API smoke audit is green
- hosted intelligence summary is green
- live `@official` content count matches repo count
- live registry drift is clean after the official-content sync
- showcase shortlist verification is publicly reachable
- hosted execution-pack compilation is publicly reachable
- `POST /v1/packs/compile` returns `200`
- `POST /v1/critique/file` returns `200`
- `POST /v1/audit/project` returns `200`

The hosted API path is explicit and exercised in production. The registry portal deploy path is
now explicit in-repo as well through the Vercel workflow, portal audit, and runbook surfaces.

The verifier layer has also moved beyond heuristic-only critique in this branch:

- AST-backed security checks now detect `dangerouslySetInnerHTML`, raw DOM HTML injection, and dynamic eval patterns.
- AST-backed accessibility checks now detect unlabeled icon-only buttons, clickable non-semantic controls, images without `alt`, and unlabeled form controls.
- AST-backed route/security checks now catch external `_blank` links missing `rel="noopener noreferrer"`, placeholder navigation targets such as `href="#"` or `javascript:void(0)`, and auth-related inputs missing explicit `autocomplete` hints.
- Project audit now also flags suspicious auth topology, including gateway sections that expose protected-looking routes, gateway sections that are not auth-like, primary sections that only expose auth-like destinations, and primary sections that do not include a clear post-auth application route.
- Project audit now also warns when gateway and primary sections overlap on the same route, making the anonymous-to-authenticated boundary ambiguous.
- Runtime verification now reports partial route drift when only some compiled route hints or route documents survive the built output, instead of only surfacing catastrophic misses.
- Critique now also flags buttons inside forms that omit `type`, helping catch accidental-submit behavior before generated UI reaches review.
- Critique now flags auth-like writes into `localStorage` and `sessionStorage`, helping catch insecure client-side token/session persistence earlier in review.
- Registry app lint now rebuilds `@decantr/registry` before typechecking so clean-checkout verification does not depend on stale generated package artifacts.

## Highest-Value Next Streams

1. Add richer golden verification beyond build/smoke into route/runtime behavior.
2. Move execution packs deeper into hosted/API workflows instead of local scaffold-only artifacts.
3. Deepen verifier coverage further into auth, navigation, performance, and security checks beyond the current AST/runtime baseline.
4. Continue narrowing legacy `any`/implicit contracts in older CLI and MCP paths.
5. Keep improving content intelligence quality and confidence scoring on top of the now-live hosted summary contract.
