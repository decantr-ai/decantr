# Registry Portal Deploy Runbook

Date: 2026-04-09
Status: Active

This runbook makes the `registry.decantr.ai` deploy path explicit in the same way the Fly-backed API path was made explicit for `api.decantr.ai`.

## Why This Exists

Before this runbook, the registry portal deploy path was real but under-documented:

- the live site was clearly on Vercel
- the monorepo had no in-repo portal deploy workflow
- there was no public portal audit equivalent to `pnpm audit:public-api`
- local environment and deployment expectations for `apps/registry` were not codified

That made the portal a real product surface with an implicit operational story.

## Deploy Contract

The registry portal is expected to deploy from `apps/registry` through Vercel.

Canonical in-repo surfaces:

- app: `apps/registry`
- app env example: `apps/registry/.env.example`
- local build check: `pnpm --filter './apps/registry' build`
- hosted audit: `pnpm audit:registry-portal`
- audit workflow: `.github/workflows/registry-portal-audit.yml`
- deploy workflow: `.github/workflows/deploy-registry-vercel.yml`

## Required Vercel Secrets

GitHub Actions secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Required Portal Environment

Vercel project environment variables should include:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If admin/moderation flows are expected in production, also provide:

- `DECANTR_ADMIN_EMAILS`
- `DECANTR_ADMIN_KEY`

## Vercel Project Setting

The Vercel project root directory should be `apps/registry`.

That setting is part of the deployment contract. If it drifts, the app may still appear to deploy while using the wrong workspace context.

## Deploy Sequence

### 1. Verify locally

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm --filter './apps/registry' build
pnpm audit:registry-portal
```

### 2. Run the deploy workflow

Use the GitHub Actions workflow:

- `.github/workflows/deploy-registry-vercel.yml`

Inputs:

- `run_portal_audit=true` is recommended

### 3. Verify hosted behavior

After deploy:

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm audit:registry-portal
```

## Audit Expectations

The hosted portal audit currently verifies:

- `/` returns `200` and includes the Decantr registry title
- `/registry` still redirects to `/`
- `/blueprints/@official/ai-copilot-shell` returns `200`
- `/browse?type=blueprints&namespace=%40official` returns `200`
- `/login` returns `200`

## Success Criteria

Portal rollout is healthy when:

- local `apps/registry` build is green
- the Vercel deploy workflow succeeds
- `pnpm audit:registry-portal` passes with no failed checks
- the live site still serves the expected public routes and redirects
