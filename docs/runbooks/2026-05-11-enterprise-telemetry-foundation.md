# Enterprise Telemetry Foundation

Date: 2026-05-11

This batch hardens Decantr product telemetry without turning on the paywall. Private Registry remains Enterprise-gated and manually provisioned. Billing launch flags must stay off:

```env
REGISTRY_BILLING_ENABLED=false
NEXT_PUBLIC_REGISTRY_BILLING_ENABLED=false
```

## What Changed

- `@decantr/telemetry` now exposes a typed event catalog, accepted schema versions, signal buckets, privacy classes, and source/event validation helpers.
- Public telemetry ingest accepts the rollout-safe schema versions and rejects source/event mismatches.
- API telemetry resolves actor type plus linked user/org context from Supabase identity flags and `telemetry_identity_aliases`.
- Opted-in CLI users can review the exact CLI telemetry catalog and never-collected list with `decantr telemetry explain`.
- Opted-in CLI users can link opaque install/project ids with `decantr telemetry link --enable --org <org-slug>`.
- New events cover analyze completion, identity linking, private-registry readiness, billing intent, and hosted content validation/publish outcomes.
- PostHog dashboard, weekly snapshot, durable rollups, digest, and operating alerts include identity hygiene, billing intent, private-registry readiness, content pipeline, and customer-attributed CLI usage.

## Privacy Guardrails

Allowed telemetry is product metadata only: event name, source, actor type, opaque install/project/user/org ids, aggregate counts, success/failure, duration, plan tier, feature surface, and sanitized campaign attribution.

Never send source code, prompts, generated files, health reports, finding evidence, local file paths, repository names, emails, IP addresses, raw referrer URLs, user agents, API keys, secrets, or private package slugs.

For customer security review, ask the team to run:

```bash
decantr telemetry explain
decantr telemetry explain --json
```

The JSON explanation is intentionally shareable: it lists event names, privacy classes, aggregate field categories, controls, and existing opaque ids without including local paths or repository names.

## Rollout

1. Deploy `apps/api` first so public ingest, identity enrichment, billing blocked events, and telemetry-link endpoint are available.
2. Deploy `apps/registry` second so private-registry and billing-interest browser events use the new catalog.
3. Publish `@decantr/telemetry` and `@decantr/cli` after package-surface dry run passes.
4. Rerun `pnpm telemetry:posthog-dashboard` to update PostHog insights, cohorts, and threshold alerts.
5. Let the weekly snapshot/digest jobs run, or execute them manually with `--dry-run` first.

## Live Validation Checklist

Close the rollout by checking every lane that can regress silently:

```bash
npm whoami
node scripts/publish-packages.mjs --publish-dry-run --only=@decantr/telemetry,@decantr/cli
node scripts/publish-packages.mjs --only=@decantr/telemetry,@decantr/cli
node scripts/verify-published-packages.mjs --only=@decantr/telemetry,@decantr/cli
```

Then validate the deployed telemetry surfaces:

```bash
decantr telemetry explain --json
decantr telemetry status --json
decantr login --api-key=<customer-or-admin-key>
decantr telemetry link --enable --org <org-slug>
node scripts/create-posthog-operating-dashboard.mjs --dry-run
node scripts/posthog-weekly-telemetry-report.mjs --dry-run
node scripts/report-telemetry-digest.mjs --dry-run
```

Operator confirmation:

- PostHog shows `decantr.analyze.completed`, `telemetry.identity_linked`, billing intent, and private-registry readiness events.
- `/admin/telemetry/usage` shows the Identity Coverage panel, Product Activation counts, signal buckets, candidate aliases, and stored snapshot freshness.
- Discord health/digest payloads still render after dry-run or scheduled jobs.
- `REGISTRY_BILLING_ENABLED` and `NEXT_PUBLIC_REGISTRY_BILLING_ENABLED` remain `false`.

## Operator Checks

```bash
pnpm --filter @decantr/telemetry test
pnpm --filter @decantr/cli test
pnpm --filter './apps/api' test
pnpm --filter './apps/api' typecheck
pnpm --filter './apps/registry' lint
node scripts/create-posthog-operating-dashboard.mjs --dry-run
node scripts/posthog-weekly-telemetry-report.mjs --dry-run
node scripts/report-telemetry-digest.mjs --dry-run
```

After deployment and publishing, confirm these events appear in PostHog:

- `decantr.analyze.completed`
- `telemetry.identity_linked`
- `private_registry.gate_viewed`
- `private_registry.intent_clicked`
- `private_registry.content_listed`
- `billing.plan_clicked`
- `billing.checkout_blocked`
- `content.validation.completed`
- `content.publish.completed`

## Triage

- If customer usage looks low, open `/admin/telemetry/usage` and review candidate aliases.
- If identity coverage drops below 95%, use the `/admin/telemetry/usage` Identity Coverage panel to prioritize candidate aliases and self-linking outreach.
- If candidate aliases rise faster than customer events, classify internal/test traffic first, then ask real customer teams to run `decantr telemetry explain` and `decantr telemetry link --enable --org <org-slug>`.
- If internal traffic pollutes customer views, classify the opaque ids in `/admin/telemetry` or add temporary env allowlist entries.
- If billing or private-registry signals spike, treat them as readiness/intent until the paywall is explicitly launched.
- If digest or health Discord posts are missing, verify `TELEMETRY_DIGEST_WEBHOOK_URL` or `TELEMETRY_HEALTH_WEBHOOK_URL` and run the scripts with dry-run output.
