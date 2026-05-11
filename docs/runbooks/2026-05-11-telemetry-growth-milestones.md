# Telemetry Growth Milestones Runbook

This runbook covers the next telemetry layer after Project Health and durable rollups: linking opted-in CLI identities, monitoring npm download interest, and posting daily threshold alerts to Discord.

## CLI Identity Linking

End users opt in locally first:

```bash
decantr init --telemetry
decantr telemetry status
```

After authenticating with a Decantr API key, they can link their opaque install/project ids:

```bash
decantr login --api-key=<key>
decantr telemetry link --org <org-slug> --label "CI runner"
```

The CLI sends only `install_id`, `project_id`, optional `org_slug`, and optional `label` to `POST /v1/me/telemetry-link`. The hosted API verifies the user/org membership, upserts `telemetry_identity_aliases` as `customer`, records an audit event, clears the actor cache, and emits `registry_web.identity_linked`.

## npm Download Interest

Run the standalone report:

```bash
pnpm telemetry:npm-downloads
pnpm telemetry:npm-downloads -- --dry-run
pnpm telemetry:npm-downloads -- --only=@decantr/cli --period=last-week --json
```

To post to Discord:

```bash
NPM_DOWNLOAD_WEBHOOK_URL=<discord-webhook> pnpm telemetry:npm-downloads -- --send-webhook
```

This is an install-interest signal, not customer product usage. Use it beside PostHog and durable rollups to catch demand movement before users authenticate or opt in.

## Daily Threshold Alerts

GitHub Actions runs `.github/workflows/telemetry-threshold-alerts.yml` daily and on manual dispatch. Local dry run:

```bash
pnpm telemetry:threshold-alerts -- --dry-run
```

Production env:

```env
DECANTR_API_URL=https://api.decantr.ai/v1
DECANTR_TELEMETRY_SNAPSHOT_TOKEN=
TELEMETRY_THRESHOLD_WEBHOOK_URL=
TELEMETRY_FAILURE_RATE_ALERT_THRESHOLD=0.05
TELEMETRY_CANDIDATE_ALIAS_ALERT_THRESHOLD=0
TELEMETRY_COMMERCIAL_INTENT_ALERT_THRESHOLD=5
```

The alert runner reads service-token protected durable rollups. It posts Discord embeds for warning/info/critical events, writes the GitHub step summary, and exits non-zero only for critical alerts such as missing snapshots or no telemetry in the latest 7-day rollup.

## PostHog Dashboard

Refresh the operating dashboard after deployment:

```bash
pnpm telemetry:posthog-dashboard
```

The dashboard includes install-interest-to-healthy-project movement, private-registry readiness signals, linked CLI identity cohorts, Project Health adoption, customer usage, actor mix, failure signals, and commercial intent.

## Private Registry Status

Private Registry is modeled as an Enterprise entitlement through `private_registry_portal`. It is not a live self-serve paywall unless billing launch flags are enabled:

```env
REGISTRY_BILLING_ENABLED=true
NEXT_PUBLIC_REGISTRY_BILLING_ENABLED=true
```

Until those are enabled, treat Private Registry as enterprise-gated and sales/admin-provisioned. Telemetry should still record readiness through organization, billing, API-key, identity-link, and private registry source/visibility dimensions.
