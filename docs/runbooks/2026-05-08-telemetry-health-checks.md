# Telemetry Health Checks Runbook

Date: 2026-05-08
Status: Active

This runbook covers the durable telemetry health loop for Decantr's PostHog to Supabase rollups.

## What Runs

`.github/workflows/telemetry-health-check.yml` runs daily and can also be triggered manually. It calls:

```text
GET /v1/admin/telemetry-snapshots/health
```

The workflow checks three baseline views:

- all actors, 7 days
- all actors, 30 days
- customer actors, 30 days

The workflow fails when any check is not `success`. It writes a markdown summary to the GitHub Actions step summary and posts an alert payload to `TELEMETRY_HEALTH_WEBHOOK_URL` when that secret is configured and a check is unhealthy. Generic webhooks receive the markdown in a `text` field; Discord webhooks receive a rich embed.

Manual workflow runs include a `send_webhook_test` input. Enable it to post the current health summary even when the system is healthy, which is the safest way to validate a new Slack or Discord webhook secret.

## Status Meanings

| Status | Meaning | First response |
| --- | --- | --- |
| `success` | The latest stored rollup is fresh. | No action needed. |
| `warning` | The latest stored rollup is stale. | Confirm the weekly snapshot workflow is still running. |
| `error` | The latest stored rollup is old enough to count as missed. | Investigate the weekly snapshot job and API logs. |
| `info` | No stored rollups exist for that filter. | Confirm the Supabase migrations and first snapshot run completed. |

## Triage Order

1. Open the `Telemetry Weekly Snapshot` workflow and confirm the latest run completed after the latest expected weekly rollup window.
2. If the weekly workflow failed before persistence, check `POSTHOG_HOST`, `POSTHOG_ENVIRONMENT_ID`, and `POSTHOG_PERSONAL_API_KEY`.
3. If the weekly workflow failed during persistence, check `DECANTR_API_URL` and `DECANTR_TELEMETRY_SNAPSHOT_TOKEN`.
4. If the API returned an error, inspect the `decantr-registry` Fly logs for `/v1/admin/telemetry-snapshots/run` or `/v1/admin/telemetry-snapshots/health`.
5. If the API succeeds but health is stale, verify Supabase has recent rows in `telemetry_usage_snapshots` and `telemetry_attribution_snapshots`.
6. If only customer health is stale, confirm the `customer` actor-classification aliases and org/project ids are still being attached to emitted events.

## Manual Check

Use this when validating a token, debugging the workflow, or testing a webhook:

```bash
DECANTR_API_URL=https://api.decantr.ai/v1 \
DECANTR_TELEMETRY_SNAPSHOT_TOKEN=<snapshot-token> \
node scripts/check-telemetry-health.mjs
```

For a non-network local sanity check:

```bash
node scripts/check-telemetry-health.mjs --dry-run
```

To post all health summaries to the webhook, even when healthy:

```bash
TELEMETRY_HEALTH_WEBHOOK_ALWAYS=true node scripts/check-telemetry-health.mjs
```

Discord webhook URLs are detected automatically and receive a rich embed with a status color, generated timestamp, and one compact field per health check. If a private relay fronts Discord, set `TELEMETRY_HEALTH_WEBHOOK_FORMAT=discord` so the script uses the Discord-compatible payload shape.
