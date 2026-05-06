# Decantr Telemetry Reference

Decantr telemetry is the product intelligence layer for understanding real adoption without collecting customer application data.

The current implementation starts with `@decantr/telemetry`, a shared package for typed events, privacy filtering, and vendor-neutral sinks. PostHog can be used immediately for product analytics, while a future Decantr-owned dashboard can consume the same event contract through a first-party ingestion endpoint.

## Product Positioning

Enterprise Decantr telemetry should answer:

- Who is using Decantr across anonymous installs, authenticated users, projects, and organizations?
- Which commands, workflows, registry content, audits, critiques, and packs are actually used?
- Where do users fail, slow down, or drop out?
- Which registry content correlates with better scaffold or audit outcomes?
- Which usage signals can become enterprise metering later?

Telemetry must not answer those questions by collecting prompts, source code, generated files, raw file paths, environment variables, secrets, email addresses, IP addresses, or user agents.

## Architecture

```text
CLI / API / MCP / registry web / content CI
        |
        v
@decantr/telemetry
        |
        +--> PostHog sink for product analytics
        |
        +--> Decantr fetch sink for future /v1/telemetry/events
                |
                +--> raw events, rollups, enterprise dashboards, billing meters
```

## MVP Event Contract

The first event vocabulary is intentionally small:

- `cli.command.completed`
- `registry.item.resolved`
- `registry.sync.completed`
- `execution_pack.compiled`
- `execution_pack.selected`
- `audit.completed`
- `critique.completed`
- `content.validation.completed`
- `content.publish.completed`
- `user.signup.completed`
- `org.created`
- `api_key.created`
- `registry_web.page_viewed`
- `registry_web.search_performed`
- `registry_web.content_opened`
- `registry_web.signup_clicked`
- `registry_web.api_key_page_viewed`
- `registry_web.billing_viewed`
- `registry_web.organization_viewed`
- `registry_web.identity_linked`

Private registries are accounted for through the generic registry event model rather than a separate first release surface: use `registrySource: "private"` and `visibility: "private"` when that product line is enabled.

## Metrics

These events support the first board-level and operator-level metrics:

- active developers
- active projects
- activation from init/new to successful refresh, sync, or audit
- time to first value
- registry content adoption
- version skew
- audit score distribution
- critique and audit failure modes
- content validation health
- authenticated org and API key creation
- registry-web discovery and commercial intent
- anonymous-to-authenticated identity linking

## PostHog Policy

PostHog is the fast product analytics lane. The `createPostHogTelemetrySink` adapter sends Decantr event names directly, uses opaque Decantr IDs for `distinct_id`, maps `orgId` and `projectId` to groups, writes `decantr_actor_type`, and defaults `$process_person_profile` to `false`.

The first-party Decantr dashboard should not depend on PostHog exports. It should consume the same `@decantr/telemetry` contract through a Decantr-controlled ingestion endpoint.

## PostHog Operating Dashboard

The first operator dashboard can be created or updated through:

```bash
pnpm telemetry:posthog-dashboard
```

The script reads PostHog credentials from the shell, `.env.posthog.local`, `.env.local`, or `apps/api/.env.local`:

```env
POSTHOG_HOST=https://us.posthog.com
POSTHOG_ENVIRONMENT_ID=
POSTHOG_PERSONAL_API_KEY=
```

`POSTHOG_ENVIRONMENT_ID` is the numeric project id from the PostHog app URL, not the `phc_` ingestion token. The personal API key needs dashboard and insight read/write access. To also provision cohorts and alerts, add `cohort:read`, `cohort:write`, `alert:read`, and `alert:write`. The script is idempotent: reruns update the existing `Decantr Operating Dashboard` and its saved insights instead of creating duplicates.

The dashboard automation creates saved insights for activation, core usage, customer-only usage, commercial intent, registry-web adoption, registry-web discovery, content pipeline health, hosted intelligence workload, source mix, actor-type mix, failure signals, and registry adoption mix. With the extra scopes, it also creates cohorts for activated users, commercial-intent users, and content power users, plus failure and commercial-intent threshold alerts.

## Weekly Snapshot Reporting

The weekly operator memo runs through:

```bash
pnpm telemetry:weekly-snapshot
pnpm telemetry:persist-rollups
```

The weekly snapshot command reads the same PostHog env values and requires `query:read`. The rollup persistence command posts to the Decantr API snapshot runner with `DECANTR_API_URL` and `DECANTR_TELEMETRY_SNAPSHOT_TOKEN`, writing an operator-readable markdown summary of persisted usage snapshots, attribution snapshots, event totals, and attribution row counts. In GitHub Actions, `.github/workflows/telemetry-weekly-snapshot.yml` runs every Monday and writes both summaries to the workflow step summary. Optionally set `TELEMETRY_WEEKLY_REPORT_WEBHOOK_URL` as a repository secret to post the PostHog markdown payload to a webhook.

The weekly snapshot includes total/customer event movement, source mix, actor mix, customer source mix, active customer identities, failure signals, and operating alerts. Alert thresholds can be tuned with:

```env
TELEMETRY_FAILURE_ALERT_THRESHOLD=3
TELEMETRY_FAILURE_RATE_ALERT_THRESHOLD=0.05
TELEMETRY_CUSTOMER_DROP_RATE_ALERT_THRESHOLD=0.25
```

## Admin Usage Intelligence

Registry admins can inspect live telemetry usage from:

```text
/admin/telemetry/usage
```

The page calls the protected API endpoint `GET /v1/admin/telemetry/usage`, which runs HogQL against PostHog and joins active install/project/anonymous ids with Supabase telemetry aliases. This keeps PostHog personal API credentials in the API runtime instead of the registry app.

Configure the API runtime with:

```env
POSTHOG_QUERY_HOST=https://us.posthog.com
POSTHOG_ENVIRONMENT_ID=
POSTHOG_PERSONAL_API_KEY=
```

`POSTHOG_QUERY_HOST` can be omitted when the project is in PostHog US cloud; set it explicitly for other PostHog regions or self-hosted deployments. The personal API key needs `query:read`.

The response includes total/customer/internal/failure events, source mix, actor mix, active identities, previous-period summaries, period-over-period trends, product signal buckets, operating alerts, and candidate aliases. Candidate aliases are active opaque ids that do not yet exist in `telemetry_identity_aliases`; promote Decantr-owned identities to durable aliases so customer metrics remain clean. The registry page supports one-click candidate classification as `customer`, `internal`, or `official_pipeline`; each action uses the normal audited alias upsert path.

The companion endpoint `GET /v1/admin/telemetry/attribution` groups live PostHog usage by `decantr_org_id`, `decantr_project_id`, `decantr_source`, and `decantr_actor_type`, then enriches known organization ids from Supabase. The registry usage page shows this as the org/project attribution table, and commercial reports pull the 30-day customer slice. This is the first enterprise reporting lane for answering which orgs, projects, and sources are driving real Decantr adoption without storing raw customer application data.

Signal buckets group raw telemetry events into operator-level adoption lanes:

- `activation`: signups and API key creation.
- `registry_discovery`: registry search, content opens, and hosted item resolution.
- `cli_adoption`: CLI command completion and registry sync activity.
- `hosted_intelligence`: execution-pack, critique, and audit usage.
- `content_pipeline`: content validation and publish automation.
- `commercial_intent`: billing, API key, organization, and org creation signals.

Operating alerts are computed in the API response from the same query payload. They flag missing telemetry, elevated failure rates, customer usage drops, unaliased identities, fresh activation, and rising commercial intent. They are intentionally lightweight for now so they can later feed a Decantr-owned dashboard or private-registry operator console without changing event names.

Durable Decantr-owned rollups are stored in Supabase through:

```text
POST /v1/admin/telemetry-snapshots/run
GET /v1/admin/telemetry/snapshots
GET /v1/admin/telemetry/attribution/snapshots
```

The write endpoint is service-token protected with `X-Telemetry-Snapshot-Token` and reads `DECANTR_TELEMETRY_SNAPSHOT_TOKEN`, falling back to `DECANTR_ADMIN_KEY` like other scoped admin automation. With an empty body it captures three baseline views: 7-day all actors, 30-day all actors, and 30-day customer-only. Each run now stores both the aggregate usage snapshot and the top org/project attribution rows for the same filter. The weekly telemetry workflow persists these rollups after generating the PostHog markdown report when `DECANTR_TELEMETRY_SNAPSHOT_TOKEN` or `DECANTR_ADMIN_KEY` is available as a repository secret.

The storage layer is split into `telemetry_usage_snapshots`, `telemetry_signal_bucket_snapshots`, `telemetry_operating_alert_snapshots`, and `telemetry_attribution_snapshots`. It stores aggregate event, source, actor, trend, data-quality, and org/project attribution metrics while avoiding a durable copy of raw active identity rows. PostHog remains the event explorer; Supabase becomes Decantr's business intelligence history.

The commercial reports page also pulls a 30-day customer-filtered usage readout from the live endpoint plus stored customer usage and attribution history from Supabase, so operator reports can distinguish customer adoption from internal/official Decantr activity without exporting PostHog data. The reports and telemetry usage pages surface snapshot freshness from the stored usage and attribution rows, making a missed weekly snapshot visible before stale metrics get mistaken for real adoption movement. Individual organization detail pages read the same stored attribution endpoint with an `org_id` filter, giving admins a customer-level view of attributed Decantr events, active project ids, source mix, and last-seen activity.

## API Wiring

`apps/api` emits fire-and-forget telemetry when configured with:

```env
POSTHOG_PROJECT_TOKEN=
POSTHOG_HOST=https://us.i.posthog.com
DECANTR_TELEMETRY_ENDPOINT=
DECANTR_TELEMETRY_TOKEN=
```

The hosted API currently emits:

- `registry.item.resolved` from public registry resolver calls
- `execution_pack.compiled` from `/v1/packs/compile`
- `execution_pack.selected` from `/v1/packs/select`
- `critique.completed` from `/v1/critique/file`
- `audit.completed` from `/v1/audit/project`
- `user.signup.completed` from hosted profile provisioning
- `api_key.created` from `/v1/api-keys`
- `org.created` from team checkout provisioning

Telemetry failures are logged at debug level and must not block request handling.

### Actor Attribution

All telemetry should classify the actor behind the event through `context.actorType` or allow the API/sink to infer it:

- `anonymous`: unauthenticated registry/API traffic.
- `customer`: authenticated hosted usage, org/project usage, or opted-in external CLI usage.
- `internal`: Decantr team traffic.
- `official_pipeline`: Decantr-owned content CI validation/publish automation.
- `service`: unattributed backend service work.

The hosted API normalizes public telemetry ingest before forwarding to PostHog. Actor attribution is server-authoritative: public clients may send a hint, but production classification is resolved from the hosted source, Supabase identity flags, opaque identity aliases, and finally env allowlists.

The durable source of truth lives in Supabase:

- `users.is_internal` / `organizations.is_internal` mark Decantr-owned accounts.
- `users.is_test` / `organizations.is_test` mark QA or synthetic accounts; these are reported as `internal` so customer dashboards stay clean.
- `telemetry_identity_aliases` maps opaque `anonymous`, `install`, and `project` ids to an actor type for CLI/project attribution without storing customer code, prompts, paths, or emails.

Env allowlists remain as operational overrides and bootstrapping fallback. Configure them with comma-separated opaque ids:

```env
DECANTR_INTERNAL_USER_IDS=
DECANTR_INTERNAL_ORG_IDS=
DECANTR_INTERNAL_INSTALL_IDS=
DECANTR_INTERNAL_PROJECT_IDS=
DECANTR_INTERNAL_ANONYMOUS_IDS=
```

External opted-in CLI usage defaults to `customer`. Decantr-owned local CLI runs should be marked by adding their opaque install/project id to `telemetry_identity_aliases` or the env allowlists above.

### Identity Control Plane

Admins can manage durable identity overrides from the registry portal:

```text
/admin/telemetry
```

The page supports the first operational loop for attribution hygiene:

- review active 30-day candidate aliases pulled from live PostHog usage
- one-click classify candidates as `customer`, `internal`, or `official_pipeline`
- open a prefilled alias editor when the identity needs a user, org, or custom label
- add or update an `anonymous`, `install`, or `project` alias
- classify it as `customer`, `internal`, `official_pipeline`, `anonymous`, or `service`
- optionally attach the alias to a Supabase user by email or id, and an organization by slug or id
- keep a human label for support/debugging context
- audit every create, update, and delete operation

Alias changes clear the API actor-resolution cache immediately, so subsequent telemetry uses the new classification without waiting for the normal cache TTL. The commercial reports page also shows alias counts by actor and identity type.

To show PostHog event-explorer links in the admin page, expose the numeric project id to the registry server environment:

```env
POSTHOG_HOST=https://us.posthog.com
POSTHOG_ENVIRONMENT_ID=
```

## Registry Web Wiring

`apps/registry` emits public registry-web telemetry to the hosted first-party ingest endpoint. It uses a browser-local opaque anonymous id, upgrades context with authenticated user and organization ids when available, and emits:

- `registry_web.page_viewed` from route changes
- `registry_web.search_performed` from public registry search submissions
- `registry_web.content_opened` from content detail views
- `registry_web.signup_clicked` from signup CTAs and register submissions
- `registry_web.api_key_page_viewed` from the API key dashboard
- `registry_web.billing_viewed` from billing and plan review
- `registry_web.organization_viewed` from team/private-registry organization surfaces
- `registry_web.identity_linked` when an anonymous registry session becomes authenticated

The registry app can override the default endpoint with `NEXT_PUBLIC_DECANTR_TELEMETRY_ENDPOINT` and can disable client telemetry with `NEXT_PUBLIC_DECANTR_TELEMETRY_DISABLED=true`.

## First-Party Ingest

The hosted API accepts public product telemetry at:

```text
POST /v1/telemetry/events
```

The endpoint accepts the schema-versioned `@decantr/telemetry` fetch-sink payload:

```json
{
  "schemaVersion": "0.1.0",
  "event": {
    "name": "cli.command.completed",
    "context": {
      "source": "cli",
      "environment": "production",
      "installId": "install_opaque",
      "projectId": "project_opaque"
    },
    "properties": {
      "command": "refresh",
      "success": true,
      "durationMs": 42,
      "registrySource": "official"
    }
  }
}
```

Public ingest intentionally only allows `cli`, `content-ci`, `mcp`, and `registry-web` sources. Internal `api` events are captured directly by the API process.

## CLI Wiring

`@decantr/cli` emits `cli.command.completed` only after the project has opted into telemetry through `.decantr/project.json`:

```json
{
  "telemetry": true
}
```

The CLI stores opaque IDs only:

- install ID in the Decantr config directory (`DECANTR_CONFIG_DIR` or the default user config directory)
- project ID in `.decantr/project.json`

CLI events include command name, success/failure, duration, workflow mode, adoption mode, registry source, project scope, target framework, and offline usage. They do not include raw prompts, source code, generated files, raw paths, env vars, secrets, emails, IP addresses, or user agents.
