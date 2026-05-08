# Telemetry Weekly Digest Runbook

Date: 2026-05-08
Status: Active

This runbook covers the executive telemetry digest for durable Decantr telemetry rollups.

## What Runs

`.github/workflows/telemetry-weekly-digest.yml` runs every Monday after the weekly snapshot workflow. It calls service-token protected read-only endpoints:

```text
GET /v1/admin/telemetry-snapshots/usage
GET /v1/admin/telemetry-snapshots/attribution
GET /v1/admin/telemetry-snapshots/health
```

The digest reads stored Supabase rollups rather than live PostHog data. PostHog remains the raw event explorer; Supabase is the durable business-intelligence history.

## Report Contents

- last-7-day tracked events and movement versus the previous period
- last-7-day customer-attributed events and movement versus the previous period
- last-30-day customer activity
- active customer org/project/install counts
- commercial-intent and adoption bucket movement
- top customer org/project attribution rows
- stored operating alerts and snapshot health

## Webhook Delivery

Set `TELEMETRY_DIGEST_WEBHOOK_URL` as a GitHub Actions secret to send the digest to a dedicated channel. If it is absent, the workflow falls back to `TELEMETRY_HEALTH_WEBHOOK_URL`.

Discord webhook URLs are detected automatically and receive a rich embed. Generic webhook URLs receive the markdown report in a `text` payload.

## Manual Check

For a local dry run:

```bash
node scripts/report-telemetry-digest.mjs --dry-run
```

To run against production:

```bash
DECANTR_API_URL=https://api.decantr.ai/v1 \
DECANTR_TELEMETRY_SNAPSHOT_TOKEN=<snapshot-token> \
node scripts/report-telemetry-digest.mjs
```

## Triage

1. If the workflow fails with `Unauthorized`, check `DECANTR_TELEMETRY_SNAPSHOT_TOKEN`.
2. If the digest says `attention`, open the snapshot health check workflow and inspect stale or missing rollups.
3. If customer activity is unexpectedly zero, confirm telemetry aliasing for customer org/project/install ids.
4. If attribution rows are missing but usage exists, inspect the weekly persistence step and `telemetry_attribution_snapshots`.
5. If Discord delivery fails, verify the webhook secret and confirm the endpoint accepts Discord-compatible embed payloads.
