# Registry Portal

Next.js portal for `registry.decantr.ai`.

This app is the public browse and detail surface for Decantr registry content, plus the authenticated dashboard/admin flows that sit on top of the hosted API and Supabase auth.

## Local Development

From the monorepo root:

```bash
pnpm --filter ./apps/registry dev
```

Or inside this app:

```bash
pnpm dev
```

## Required Environment

Copy `.env.example` to `.env.local` and fill in real values for local development.

Primary variables:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional/admin variables:

- `DECANTR_ADMIN_EMAILS`
- `DECANTR_ADMIN_KEY`

## Verification

Local portal verification:

```bash
pnpm --filter ./apps/registry build
```

Hosted portal verification:

```bash
pnpm audit:registry-portal
```

Authenticated persona seeding for local or preview smoke tests:

```bash
pnpm seed:registry-test-users
```

The full test-persona runbook lives in `docs/runbooks/2026-04-23-registry-test-personas.md`.

## Deployment

The portal is expected to deploy through Vercel, with the Vercel project root directory set to `apps/registry`.

The in-repo deployment and audit contract now lives in:

- `.github/workflows/deploy-registry-vercel.yml`
- `.github/workflows/registry-portal-audit.yml`
- `docs/runbooks/2026-04-09-registry-portal-deploy.md`
