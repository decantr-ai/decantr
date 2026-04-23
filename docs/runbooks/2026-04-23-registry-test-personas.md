# Registry Test Personas

This runbook defines the hosted registry test-account matrix for authenticated product validation.

The seed path is intentionally service-role based and dry-run by default. It lets us validate Free, Pro, Team, Enterprise, and Admin dashboard behavior without relying on live Stripe checkout during product smoke tests.

## Seed Command

Dry run from the monorepo root:

```bash
pnpm seed:registry-test-users
```

Apply to a Supabase project:

```bash
REGISTRY_TEST_ENV_FILE=apps/api/.env.local \
REGISTRY_TEST_USER_PASSWORD='replace-with-a-strong-test-password' \
pnpm seed:registry-test-users -- --apply
```

After applying, verify the personas against Supabase Auth and the hosted API. This checks identity, billing, API-key listing, owned/private content listing, org member/usage/policy/content/audit routes, approval gates, and the admin-key boundary:

```bash
REGISTRY_TEST_ENV_FILE=apps/api/.env.local \
REGISTRY_TEST_USER_PASSWORD='same-strong-test-password' \
pnpm smoke:registry-test-users
```

Required values for `--apply`:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REGISTRY_TEST_USER_PASSWORD`

Optional values:

- `REGISTRY_TEST_ENV_FILE`
- `REGISTRY_TEST_EMAIL_DOMAIN`, default `example.com`
- `REGISTRY_TEST_PREFIX`, default `decantr-test`
- `REGISTRY_TEST_API_URL`, default `https://api.decantr.ai/v1`
- `REGISTRY_TEST_ADMIN_KEY` or `DECANTR_ADMIN_KEY`, optional and only needed for positive admin endpoint checks

## Persona Matrix

| Persona | Default email | Tier | Purpose |
| --- | --- | --- | --- |
| Free | `decantr-test+free@example.com` | `free` | Baseline dashboard, no private package publishing, no organization access. |
| Pro | `decantr-test+pro@example.com` | `pro` | Personal private packages without team governance. |
| Team owner | `decantr-test+team-owner@example.com` | `team` | Team plan owner, organization publishing, team management. |
| Team admin | `decantr-test+team-admin@example.com` | `team` | Team admin role behavior. |
| Team member | `decantr-test+team-member@example.com` | `team` | Member role gating and restricted controls. |
| Enterprise owner | `decantr-test+enterprise-owner@example.com` | `enterprise` | Enterprise owner, private-registry portal, governance controls. |
| Enterprise admin | `decantr-test+enterprise-admin@example.com` | `enterprise` | Enterprise admin role behavior. |
| Admin | `decantr-test+admin@example.com` | `enterprise` | Registry admin routes when also listed in `DECANTR_ADMIN_EMAILS`. |

## Organization Matrix

| Organization | Slug | Tier | Members |
| --- | --- | --- | --- |
| Decantr Test Team | `decantr-test-team` | `team` | owner, admin, member |
| Decantr Test Enterprise | `decantr-test-enterprise` | `enterprise` | owner, admin, registry admin |

The team organization requires public content approval and allows shared private packages. The enterprise organization additionally enables member submissions and private-content approval checks.

## Admin Access

Admin access is not stored on the `users` table. The registry app reads `DECANTR_ADMIN_EMAILS`.

For local or preview admin smoke tests, include the seeded admin persona:

```bash
DECANTR_ADMIN_EMAILS=davidaimi@gmail.com,decantr-test+admin@example.com
```

## Stripe Bypass

These personas bypass Stripe by writing the durable commercial state directly:

- `users.tier`
- `organizations.tier`
- `organizations.seat_limit`
- `org_members.role`
- `organization_policies`

That is appropriate for dashboard, entitlement, governance, private-package, and admin smoke tests. Stripe checkout, portal, and webhook behavior should still be validated separately with Stripe test mode.
