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

Telemetry must not answer those questions by collecting prompts, source code, generated files, raw file paths, environment variables, secrets, email addresses, IP addresses, raw referrer URLs, raw ad click IDs, or user agents.

## Project Health Is Local Observability

Project Health is separate from Decantr product telemetry. `decantr health` and `decantr studio` help an end user understand their own repository's contract health, route drift, pack state, runtime evidence, and remediation plan. They are local-only by default and do not send health reports, source code, prompts, raw paths, or project data to Decantr.

If a project explicitly opts into CLI telemetry, Decantr may record privacy-filtered Project Health usage metadata: report status, score, aggregate finding counts, CI mode/fail-on settings, Studio start/refresh counts, and whether a remediation prompt was requested. It does not send finding messages, evidence, report JSON, prompts, file paths, route names, source snapshots, or environment values.

Telemetry is for Decantr operators to understand privacy-filtered product adoption. Project Health is for customer and developer workflows. A future private registry or enterprise dashboard may accept a customer-controlled `ProjectHealthReport`, but the local health command does not require telemetry opt-in.

`decantr content-health` follows the same privacy stance for registry content repositories. It emits a local `ContentHealthReport` for schema, reference, and quality coverage checks; it does not upload content files or health reports to Decantr. If a repository has opted into CLI telemetry, only the command-completed event is eligible for telemetry, not the report payload.

## Architecture

```text
CLI / API / MCP / marketing web / registry web / content CI
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

## Event Contract

The event vocabulary is typed in `@decantr/telemetry` and guarded by `DECANTR_TELEMETRY_EVENT_CATALOG`. Public ingest accepts the previous and current schema versions during rollout, but new emitters use schema `0.3.0`. Each catalog entry declares allowed sources, a signal bucket, privacy class, public-ingest eligibility, and privacy notes. The API rejects forged source/event pairs before forwarding to PostHog.

All telemetry clients pass through the shared redaction layer before a sink sees the event. Sensitive keys such as prompts, source code, file paths, repository names, raw route names, package slugs, emails, tokens, cookies, URLs, user agents, and authorization fields are redacted even if a future caller accidentally includes them.

- `cli.command.completed`
- `registry.item.resolved`
- `registry.sync.completed`
- `execution_pack.compiled`
- `execution_pack.selected`
- `decantr.analyze.completed`
- `decantr.init.completed`
- `decantr.new.completed`
- `decantr.refresh.completed`
- `decantr.check.completed`
- `decantr.health.healthy`
- `health.report.generated`
- `health.finding.prompt_requested`
- `health.ci.failed`
- `studio.started`
- `studio.health_refreshed`
- `audit.completed`
- `critique.completed`
- `content.validation.completed`
- `content.publish.completed`
- `user.signup.completed`
- `org.created`
- `api_key.created`
- `billing.plan_clicked`
- `billing.checkout_blocked`
- `private_registry.gate_viewed`
- `private_registry.intent_clicked`
- `private_registry.content_listed`
- `marketing_web.page_viewed`
- `marketing_web.cta_clicked`
- `marketing_web.outbound_clicked`
- `marketing_web.command_clicked`
- `registry_web.page_viewed`
- `registry_web.search_performed`
- `registry_web.content_opened`
- `registry_web.signup_clicked`
- `registry_web.api_key_page_viewed`
- `registry_web.billing_viewed`
- `registry_web.organization_viewed`
- `registry_web.identity_linked`
- `telemetry.identity_linked`

Private Registry remains Enterprise-gated/manual-provisioned while billing launch flags are off. Telemetry only records readiness and permitted usage: gate views, intent clicks, and aggregate content-list counts. It does not collect private package slugs, source files, prompts, emails, raw paths, or package contents.

### Source Matrix

- `cli`: opted-in local CLI product events, including lifecycle commands, Project Health/Studio usage, registry sync, and `decantr.analyze.completed`.
- `api`: hosted API product events, identity-link audit telemetry, execution packs, hosted audit/critique, content publish, billing checkout blocking, signup, API key, and org creation.
- `registry-web`: registry portal discovery, billing interest, private-registry readiness, and identity-linking browser events.
- `marketing-web`: public marketing page, CTA, outbound, and command-click events with sanitized campaign attribution.
- `content-ci`: official content validation/publish automation.
- `mcp`: registry resolution from MCP/agent surfaces.

## Metrics

These events support the first board-level and operator-level metrics:

- active developers
- active projects
- activation from init/new to successful refresh, sync, or audit
- time to first value
- registry content adoption
- version skew
- audit score distribution
- Project Health adoption, healthy-project rate, CI failures, and remediation prompt usage
- Studio usage for local drift triage
- critique and audit failure modes
- content validation health
- authenticated org and API key creation
- paid acquisition and public marketing CTA movement
- registry-web discovery and commercial intent
- anonymous-to-authenticated identity linking
- identity hygiene and customer-attributed CLI usage
- private-registry readiness and billing intent while the paywall remains off

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

The dashboard automation creates saved insights for activation, paid acquisition, project entrypoints, project activation, Project Health outcomes, core usage, customer-only usage, commercial intent, registry-web adoption, private-registry readiness, identity hygiene, marketing acquisition by campaign, registry-web discovery, content pipeline health, hosted intelligence workload, source mix, actor-type mix, failure signals, and registry adoption mix. With the extra scopes, it also creates cohorts for activated users, commercial-intent users, and content power users, plus failure, commercial-intent, identity-hygiene, and private-registry readiness threshold alerts.

## Weekly Snapshot Reporting

The weekly operator memo runs through:

```bash
pnpm telemetry:weekly-snapshot
pnpm telemetry:persist-rollups
```

The weekly snapshot command reads the same PostHog env values and requires `query:read`. The rollup persistence command posts to the Decantr API snapshot runner with `DECANTR_API_URL` and `DECANTR_TELEMETRY_SNAPSHOT_TOKEN`, writing an operator-readable markdown summary of persisted usage snapshots, attribution snapshots, event totals, and attribution row counts. In GitHub Actions, `.github/workflows/telemetry-weekly-snapshot.yml` runs every Monday and writes both summaries to the workflow step summary. Optionally set `TELEMETRY_WEEKLY_REPORT_WEBHOOK_URL` as a repository secret to post the PostHog markdown payload to a webhook.

The weekly snapshot includes total/customer event movement, paid-acquisition movement, marketing attribution health, Product Activation, billing intent, private-registry readiness, identity hygiene, top campaigns, top landing paths, source mix, actor mix, customer source mix, active customer identities, failure signals, and operating alerts. Alert thresholds can be tuned with:

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

The response includes total/customer/internal/failure events, source mix, actor mix, active identities, previous-period summaries, period-over-period trends, product signal buckets, operating alerts, and candidate aliases. Candidate aliases are active opaque ids that do not yet exist in `telemetry_identity_aliases`; promote Decantr-owned identities to durable aliases so customer metrics remain clean. The registry page supports one-click candidate classification as `customer`, `internal`, or `official_pipeline`; each action uses the normal audited alias upsert path. Customer teams can also self-link opted-in CLI installs/projects after login:

```bash
decantr telemetry status
decantr telemetry explain
decantr telemetry link --enable --org <org-slug>
```

The explain command prints the CLI event catalog subset, aggregate field categories, current opaque ids if they already exist, and the never-collected list. The link command sends only opaque install/project ids and optional org slug/label. It never sends local file paths, repository names, prompts, source, or package slugs.

The usage response also includes lightweight Product Activation and marketing attribution summaries. Product Activation tracks opted-in greenfield `new`, attach/init, refresh/check lifecycle events, Project Health report volume, healthy-project milestones, CI failure events, Studio usage, and remediation prompt requests. Marketing attribution tracks campaign coverage, landing-path coverage, registry follow-through, top UTM campaigns, and top landing paths. Campaign naming and launch-link hygiene live in [Decantr UTM Taxonomy](./telemetry-utm-taxonomy.md).

The companion endpoint `GET /v1/admin/telemetry/attribution` groups live PostHog usage by `decantr_org_id`, `decantr_project_id`, `decantr_source`, and `decantr_actor_type`, then enriches known organization ids from Supabase. The registry usage page shows this as the org/project attribution table, and commercial reports pull the 30-day customer slice. This is the first enterprise reporting lane for answering which orgs, projects, and sources are driving real Decantr adoption without storing raw customer application data.

Signal buckets group raw telemetry events into operator-level adoption lanes:

- `activation`: marketing CTA clicks, signups, and API key creation.
- `paid_acquisition`: marketing page views, CTA clicks, outbound clicks, and command clicks.
- `registry_discovery`: registry search, content opens, and hosted item resolution.
- `cli_adoption`: CLI command completion, analyze lifecycle, other lifecycle milestones, and registry sync activity.
- `product_activation`: Decantr analyze/new/init/refresh/check milestones, Project Health report generation, healthy project milestones, and Studio starts.
- `project_health`: Project Health reports, healthy milestones, remediation prompts, CI failures, and Studio usage.
- `hosted_intelligence`: execution-pack, critique, and audit usage.
- `content_pipeline`: content validation and publish automation.
- `identity_hygiene`: registry-web and API identity linking events.
- `billing_intent`: plan clicks, checkout-blocked events, and billing page views.
- `private_registry_readiness`: private-registry gate views, intent clicks, and permitted listing events.
- `commercial_intent`: marketing CTA, billing, private-registry intent, API key, organization, and org creation signals.

Operating alerts are computed in the API response from the same query payload. They flag missing telemetry, elevated failure rates, customer usage drops, unaliased identities, fresh activation, identity links, rising billing/commercial intent, and private-registry readiness. They are intentionally lightweight for now so they can later feed a Decantr-owned dashboard or private-registry operator console without changing event names.

Durable Decantr-owned rollups are stored in Supabase through:

```text
POST /v1/admin/telemetry-snapshots/run
GET /v1/admin/telemetry-snapshots/health
GET /v1/admin/telemetry/snapshots/health
GET /v1/admin/telemetry/snapshots
GET /v1/admin/telemetry/attribution/snapshots
```

The write endpoint is service-token protected with `X-Telemetry-Snapshot-Token` and reads `DECANTR_TELEMETRY_SNAPSHOT_TOKEN`, falling back to `DECANTR_ADMIN_KEY` like other scoped admin automation. With an empty body it captures three baseline views: 7-day all actors, 30-day all actors, and 30-day customer-only. Each run now stores both the aggregate usage snapshot and the top org/project attribution rows for the same filter. The weekly telemetry workflow persists these rollups after generating the PostHog markdown report when `DECANTR_TELEMETRY_SNAPSHOT_TOKEN` or `DECANTR_ADMIN_KEY` is available as a repository secret.

The storage layer is split into `telemetry_usage_snapshots`, `telemetry_signal_bucket_snapshots`, `telemetry_operating_alert_snapshots`, and `telemetry_attribution_snapshots`. It stores aggregate event, source, actor, trend, data-quality, and org/project attribution metrics while avoiding a durable copy of raw active identity rows. PostHog remains the event explorer; Supabase becomes Decantr's business intelligence history.

`GET /v1/admin/telemetry-snapshots/health` returns a service-token protected, machine-readable freshness summary for the stored rollups. `GET /v1/admin/telemetry/snapshots/health` exposes the same payload to authenticated admins. The response includes `success`, `warning`, `error`, or `info` status, the latest captured timestamp, usage and attribution row counts, and total events for the latest matching snapshot. This is the API-level health signal for future alerting, external ops dashboards, or a private-registry operator console.

`.github/workflows/telemetry-health-check.yml` runs that health signal daily through `node scripts/check-telemetry-health.mjs`, checking all-actor 7-day, all-actor 30-day, and customer 30-day rollups. It fails on any non-fresh status, writes a GitHub Actions summary, and can post unhealthy summaries to `TELEMETRY_HEALTH_WEBHOOK_URL`. Manual workflow runs can enable `send_webhook_test` to post the current summary even when healthy. Discord webhook URLs are detected automatically and receive a compact rich embed with status color and per-rollup fields; custom Discord-compatible relays can force that payload shape with `TELEMETRY_HEALTH_WEBHOOK_FORMAT=discord`. The operational triage path lives in `docs/runbooks/2026-05-08-telemetry-health-checks.md`.

`.github/workflows/telemetry-weekly-digest.yml` runs the executive digest through `node scripts/report-telemetry-digest.mjs` every Monday after the weekly snapshot workflow. It reads the service-token protected durable snapshot endpoints, writes a GitHub Actions summary, and posts a Discord-friendly rich embed to `TELEMETRY_DIGEST_WEBHOOK_URL`, falling back to `TELEMETRY_HEALTH_WEBHOOK_URL` when a dedicated digest secret is not configured. The digest includes last-7-day usage movement, customer-attributed activity, active customer org/project/install counts, Project Health adoption, commercial-intent and adoption bucket movement, top customer attribution rows, stored operating alerts, and snapshot health. The operational triage path lives in `docs/runbooks/2026-05-08-telemetry-weekly-digest.md`.

Post-publish package verification can use the same Discord style without mixing release state into product telemetry. `node scripts/verify-published-packages.mjs --send-webhook` posts a release-confidence embed through `RELEASE_VERIFICATION_WEBHOOK_URL`, falling back to `TELEMETRY_HEALTH_WEBHOOK_URL` when a dedicated release webhook is not configured. This verifies public npm dist-tags, published manifests, and CLI smoke behavior; it does not emit analytics events.

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
- `telemetry.identity_linked` from opted-in CLI identity self-linking
- `content.validation.completed` and `content.publish.completed` from hosted content publish flows
- `billing.checkout_blocked` from billing checkout requests while the launch flag is off

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

`apps/registry` emits public registry-web telemetry to the hosted first-party ingest endpoint. It uses an opaque first-party anonymous id, shared with `decantr.ai` when the browser accepts the `.decantr.ai` cookie, upgrades context with authenticated user and organization ids when available, and emits:

- `registry_web.page_viewed` from route changes
- `registry_web.search_performed` from public registry search submissions
- `registry_web.content_opened` from content detail views
- `registry_web.signup_clicked` from signup CTAs and register submissions
- `registry_web.api_key_page_viewed` from the API key dashboard
- `registry_web.billing_viewed` from billing and plan review
- `registry_web.organization_viewed` from team/private-registry organization surfaces
- `registry_web.identity_linked` when an anonymous registry session becomes authenticated
- `billing.plan_clicked` when a user clicks a paid-plan intent CTA
- `billing.checkout_blocked` when checkout is unavailable because billing launch remains off
- `private_registry.gate_viewed` when a user sees the Enterprise private-registry gate
- `private_registry.intent_clicked` when a gated user opens billing, team, or private-registry intent CTAs
- `private_registry.content_listed` when an authorized Enterprise workspace lists private-registry content counts

Registry web events are enriched with the same campaign attribution fields as the marketing site when a user arrives with UTM parameters, supported ad click ids, or an external referrer. Both surfaces also infer a sanitized discovery channel, source category, landing-page kind, and landing intent so PostHog can separate organic search, AI referrals, developer/package referrals, social/community traffic, direct visits, and campaign traffic without storing raw referrer URLs or search queries. The registry app can override the default endpoint with `NEXT_PUBLIC_DECANTR_TELEMETRY_ENDPOINT` and can disable client telemetry with `NEXT_PUBLIC_DECANTR_TELEMETRY_DISABLED=true`.

Do not enable `REGISTRY_BILLING_ENABLED` or `NEXT_PUBLIC_REGISTRY_BILLING_ENABLED` for this telemetry batch. Billing and private-registry events are readiness and intent signals only until self-serve checkout is intentionally launched.

Optional X Pixel support is configured with public build-time environment variables:

```env
NEXT_PUBLIC_X_PIXEL_ID=
NEXT_PUBLIC_X_EVENT_PAGE_VIEWED_ID=
NEXT_PUBLIC_X_EVENT_SIGNUP_CLICKED_ID=
NEXT_PUBLIC_X_EVENT_CONTENT_OPENED_ID=
NEXT_PUBLIC_X_EVENT_SEARCH_PERFORMED_ID=
NEXT_PUBLIC_X_EVENT_API_KEY_PAGE_VIEWED_ID=
NEXT_PUBLIC_X_EVENT_BILLING_VIEWED_ID=
```

If `NEXT_PUBLIC_X_PIXEL_ID` is unset, no X script is loaded.

## Marketing Web Wiring

`docs/index.html` is the static `decantr.ai` marketing surface. It loads `analytics-config.js` followed by `analytics.js`, then emits marketing-web telemetry through the hosted first-party ingest endpoint using the shared opaque first-party anonymous id on Decantr deploy hosts.

The marketing script emits:

- `marketing_web.page_viewed` from the homepage load
- `marketing_web.cta_clicked` from primary CTAs, path tiles, and registry handoff links
- `marketing_web.outbound_clicked` from non-registry external links such as GitHub and npm
- `marketing_web.command_clicked` from visible install and CLI command snippets

Marketing attribution is deliberately narrow: UTM fields, landing path, first/last landing path, first/last UTM values, referrer domain, click-id provider, whether a supported click id was present, inferred channel/source category, landing-page kind, and landing intent. It does not send the raw click id, raw referrer URL, user agent, email, IP address, prompts, source code, file paths, or search query text. Links from `decantr.ai` to `registry.decantr.ai` are decorated with current campaign parameters so registry page views and the X Pixel can keep attribution through the subdomain handoff.

The GitHub Pages workflow writes `docs/analytics-config.js` from public repository variables before upload. The Vercel static build writes the same config into `public/analytics-config.js` from build environment variables:

```env
DECANTR_ANALYTICS_DISABLED=false
DECANTR_TELEMETRY_ENDPOINT=https://api.decantr.ai/v1/telemetry/events
X_PIXEL_ID=
X_EVENT_MARKETING_PAGE_VIEWED_ID=
X_EVENT_MARKETING_CTA_CLICKED_ID=
X_EVENT_MARKETING_OUTBOUND_CLICKED_ID=
X_EVENT_MARKETING_COMMAND_CLICKED_ID=
```

If `X_PIXEL_ID` is unset, no X script is loaded. The X event ids are optional per-event conversion tags from X Events Manager.

Launch QA can be run with:

```bash
pnpm telemetry:marketing-qa
pnpm telemetry:marketing-qa -- --send-smoke
```

The default command checks the live marketing page, analytics config, analytics runtime, privacy guard, and registry surface. The smoke variant posts a test `marketing_web.page_viewed` event to first-party ingest and expects `202`.

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

Public ingest intentionally only allows `cli`, `content-ci`, `marketing-web`, `mcp`, and `registry-web` sources. Internal `api` events are captured directly by the API process.

## CLI Wiring

`@decantr/cli` emits `cli.command.completed` only after the project has opted into telemetry through `.decantr/project.json`:

```json
{
  "telemetry": true
}
```

For a first-run opt-in, pass `--telemetry` during setup:

```bash
decantr new my-app --blueprint=agent-marketplace --telemetry
decantr init --existing --accept-proposal --telemetry
decantr check --telemetry
```

For security review before opt-in, use:

```bash
decantr telemetry explain
decantr telemetry explain --json
```

The CLI stores opaque IDs only:

- install ID in the Decantr config directory (`DECANTR_CONFIG_DIR` or the default user config directory)
- project ID in `.decantr/project.json`

CLI events include command name, success/failure, duration, workflow mode, adoption mode, registry source, project scope, target framework, and offline usage. They do not include raw prompts, source code, generated files, raw paths, env vars, secrets, emails, IP addresses, or user agents.

`decantr telemetry explain --json` is safe to attach to customer security reviews: it lists event names, privacy classes, aggregate field categories, and controls without including local file paths or repository names.
