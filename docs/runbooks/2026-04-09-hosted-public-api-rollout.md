# Hosted Public API Rollout Runbook

Date: 2026-04-09
Status: Completed on 2026-04-09

This runbook covers the safe rollout order for the Decantr vNext hosted public API surfaces now living on the `codex/decantr-vnext-reset` and `codex/decantr-vnext-resetmai` branches.

It originally covered the public-read rollout for schema, showcase, and intelligence surfaces, and it now also tracks the hosted execution-pack compiler endpoint plus the hosted verification surfaces:

- `POST /v1/packs/compile`
- `POST /v1/packs/select`
- `POST /v1/critique/file`
- `POST /v1/audit/project`

## Why This Exists

Local code on the reset branches is ahead of the currently deployed public API.

Live audits against `https://api.decantr.ai/v1` originally showed:

- `search` and public content list endpoints were reachable
- `schema`, `showcase`, and `intelligence/summary` were still returning `401`
- `recommended=true` and `intelligence_source=*` behavior was not aligned with live intelligence metadata
- live `@official` content still included stale entries such as `workbench`

That meant rollout had to be done in the right order:

1. deploy the hosted API and registry portal changes
2. verify public-read behavior
3. sync `decantr-content`
4. re-run live audits

## Required Branches

- monorepo: `codex/decantr-vnext-reset`
- content repo: `codex/decantr-vnext-resetmai`

## Final Outcome

As of 2026-04-09, the hosted rollout completed successfully:

- Fly is serving the API from image `runtime-intelligence-fix-20260409-0916`
- `pnpm audit:public-api` passes against `https://api.decantr.ai/v1`
- hosted execution-pack compilation now responds from `POST /v1/packs/compile`
- live public API audit is fully green, including the hosted compiler endpoint
- `decantr-content` workflow run `24192386163` completed successfully and synced official content from `codex/decantr-vnext-resetmai`
- live `@official` content no longer includes stale `workbench`-era extras
- live registry drift now reports:
  - `matched: 480`
  - `missing live: 0`
  - `extra live: 0`
  - `changed: 0`
  - `failed: 0`
- live intelligence audit now reports:
  - `repo: 480`
  - `live: 480`
  - `intelligence: 480`
  - `recommended: 224`
- after the hosted compiler extension landed locally later on 2026-04-09:
  - the API was redeployed from `codex/decantr-vnext-reset` via `flyctl deploy --config apps/api/fly.toml --remote-only`
  - `pnpm audit:public-api` now reports `POST /v1/packs/compile` as `200`
  - the hosted compiler gap is closed
- after the hosted verification expansion landed later on 2026-04-09:
  - the API was redeployed again from `codex/decantr-vnext-reset` via `flyctl deploy --config apps/api/fly.toml --remote-only`
  - `pnpm audit:public-api --include-hosted-critique --include-hosted-project-audit` now reports:
    - `POST /v1/critique/file` as `200`
    - `POST /v1/audit/project` as `200`
  - the hosted verification rollout gap is closed
- after the hosted selected-pack surface landed later on 2026-04-09:
  - the API was redeployed again from `codex/decantr-vnext-reset` via `flyctl deploy --config apps/api/fly.toml --remote-only`
  - `pnpm audit:public-api --include-hosted-pack-select --include-hosted-critique --include-hosted-project-audit` now reports:
    - `POST /v1/packs/select` as `200`
    - `POST /v1/critique/file` as `200`
    - `POST /v1/audit/project` as `200`
  - the hosted selected-pack rollout gap is closed
  - the root `pnpm audit:public-api` script and scheduled audit workflow were then updated to include those hosted pack/verifier surfaces by default

Key fixes required during rollout:

- repaired the Fly deploy path around `apps/api/fly.toml` and the workspace-aware root `Dockerfile`
- replaced brittle packaged-schema JSON imports with runtime-safe schema loading in the API
- hardened `/v1/intelligence/summary` to ignore retired legacy content types still present in hosted data during sync
- fixed `decantr-content` GitHub workflows so they install dependencies before validation/sync
- tightened the drift audit so it no longer reports version-only registry bookkeeping noise when repo items do not declare a version

The remainder of this runbook is preserved as the canonical sequence that got the rollout from red to green.

## Step 1: Verify Local Branch Health

Monorepo:

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm test
pnpm build
pnpm lint
pnpm audit:public-api
```

Content repo:

```bash
cd /Users/davidaimi/projects/decantr-content
node validate.js
node scripts/audit-registry-drift.js --summary-markdown=/tmp/registry-drift-summary.md
node scripts/audit-content-intelligence.js --summary-markdown=/tmp/content-intelligence-summary.md
```

Expected before deployment:

- local tests/build/lint are green
- public API audit may still show live `401` failures on production
- content audit may still report live rollout mismatches

## Step 2: Deploy Monorepo Hosted Surfaces First

Deploy the monorepo branch to the hosted API and registry stack before touching official content sync.

### API deploy path

The reset branch now includes a manual GitHub Actions workflow for the hosted API:

- workflow: `.github/workflows/deploy-api-fly.yml`
- trigger: `workflow_dispatch`
- secret required: `FLY_API_TOKEN`
- post-deploy audit: optional but enabled by default

Recommended trigger path:

1. open the `Deploy API to Fly` workflow in GitHub Actions
2. run it against `codex/decantr-vnext-reset`
3. leave `run_public_audit=true`

Expected result:

- Fly deploy completes using `apps/api/fly.toml`
- the workflow runs the hosted public API audit immediately after deployment
- the workflow uploads `public-api-report.json` and `public-api-summary.md`

Canonical deploy contract:

- `apps/api/fly.toml` is the only Fly config that should exist for the hosted API
- the old root-level `fly.toml` has been retired to avoid split deploy behavior
- the workspace-aware root `Dockerfile` is the canonical build path used by Fly

### Current portal deploy status

The API deploy path is explicit in-repo.

The registry portal deploy path is also now explicit in-repo through:

- `.github/workflows/deploy-registry-vercel.yml`
- `.github/workflows/registry-portal-audit.yml`
- `docs/runbooks/2026-04-09-registry-portal-deploy.md`

Do not assume the portal is updated just because the API deploy completes, but the operational contract is no longer implicit.

Surfaces included in this rollout:

- `apps/api`
- `apps/registry`
- package-backed public schemas
- hosted public routes:
  - `/v1/schema/*`
  - `/v1/showcase/*`
  - `/v1/intelligence/summary`
  - `/v1/packs/compile`
  - `/v1/packs/select`
  - `/v1/critique/file`
  - `/v1/audit/project`

Why first:

- `decantr-content` audit and sync behavior now assumes these hosted routes exist and are publicly readable
- content intelligence metadata should not be judged against an older API contract

## Step 3: Re-Audit the Hosted Public API

After the monorepo deployment finishes:

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm audit:public-api
```

Expected result:

- `schema-search-response` returns `200`
- `execution-pack-compile` returns `200`
- `showcase-shortlist-verification` returns `200`
- `registry-intelligence-summary` returns `200`
- `public-search` and `public-blueprint-list` remain `200`

If any of those still fail, stop here and fix hosted routing/auth before syncing content.

## Step 4: Audit Official Content Against the New API

Once the hosted API is serving the new public surfaces correctly:

```bash
cd /Users/davidaimi/projects/decantr-content
node scripts/audit-registry-drift.js --report-json=/tmp/registry-drift-report.json --summary-markdown=/tmp/registry-drift-summary.md
node scripts/audit-content-intelligence.js --report-json=/tmp/content-intelligence-report.json --summary-markdown=/tmp/content-intelligence-summary.md
```

Focus on:

- stale live `@official` entries
- changed live content
- recommended/source filter mismatches
- hosted summary mismatches

## Step 5: Dry-Run Official Content Sync

Before mutating production content:

```bash
cd /Users/davidaimi/projects/decantr-content
DECANTR_ADMIN_KEY=... node scripts/sync-to-registry.js --dry-run --report-json=/tmp/sync-report.json
```

Review:

- upserts
- deletes
- especially any stale `workbench`-era items that will be pruned

## Step 6: Perform Official Content Sync

If the dry-run looks correct:

```bash
cd /Users/davidaimi/projects/decantr-content
DECANTR_ADMIN_KEY=... node scripts/sync-to-registry.js
```

## Step 7: Re-Run Live Audits

After content sync:

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm audit:public-api

cd /Users/davidaimi/projects/decantr-content
node scripts/audit-registry-drift.js --fail-on-drift
node scripts/audit-content-intelligence.js --fail-on-filter-mismatch --fail-on-source-filter-mismatch --fail-on-summary-mismatch
```

Expected convergence:

- hosted public API surfaces all return `200`
- hosted execution-pack compilation returns a schema-backed bundle
- hosted file critique returns a schema-backed report when `pnpm audit:public-api --include-hosted-critique` is enabled
- hosted project audit returns a schema-backed report when `pnpm audit:public-api --include-hosted-project-audit` is enabled
- drift audit no longer reports stale `@official` extras
- intelligence audit no longer reports filter-summary mismatches caused by outdated deployment state

## Rollback Rule

If hosted public API routes are failing after the monorepo deploy:

- do not sync content
- rollback or hotfix the monorepo deployment first

If content sync introduces unexpected drift:

- re-run the dry-run against the current repo state
- inspect the registry drift report before attempting another sync

## Success Criteria

Rollout is complete only when all of the following are true:

- `pnpm audit:public-api` passes with no failed checks
- the `Deploy API to Fly` workflow succeeds with its post-deploy audit enabled
- `audit-registry-drift.js` reports no unexpected live extras or changed official entries
- `audit-content-intelligence.js` no longer reports filter/summary mismatches caused by rollout state
- stale `workbench`-era official content is gone from the live registry
