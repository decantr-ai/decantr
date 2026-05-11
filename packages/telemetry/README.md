# @decantr/telemetry

Privacy-preserving telemetry contracts, clients, and analytics sinks for Decantr.

This package is the first layer of Decantr's usage intelligence system. It defines the event names and payload shapes that the CLI, API, MCP server, registry app, and content pipeline can emit without coupling those surfaces to a single analytics vendor.

## Product Stance

Decantr telemetry measures Decantr usage, not customer application data.

Allowed signals include command names, registry sources, registry content IDs, package versions, workflow modes, success/failure, duration, audit scores, Project Health status/score/counts, aggregate counts, marketing route labels, campaign tags, and referrer domains. Do not send prompts, source code, generated files, health reports, finding evidence, raw file paths, environment variables, secrets, API keys, email addresses, IP addresses, raw referrer URLs, click IDs, or user agents.

## MVP Events

- `cli.command.completed`
- `registry.item.resolved`
- `registry.sync.completed`
- `execution_pack.compiled`
- `execution_pack.selected`
- `audit.completed`
- `critique.completed`
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

Private Registry remains manually provisioned and Enterprise-gated while the paywall is off. The telemetry surface records readiness and permitted usage only: gated views, intent clicks, and aggregate content-list counts. It does not collect private package slugs or customer source material.

`DECANTR_TELEMETRY_EVENT_CATALOG` is the canonical source/event matrix. Public ingest should call `isTelemetryEventAllowedForSource(name, source)` and accept both `DECANTR_TELEMETRY_ACCEPTED_SCHEMA_VERSIONS` during rollout, while new emitters use schema `0.3.0`.

## Actor Attribution

Every event can carry `context.actorType` so Decantr can distinguish founder/internal usage from real customer adoption without relying on remembered PostHog person ids.

- `anonymous`: unauthenticated registry/API browsing or resolution with only an anonymous id.
- `customer`: authenticated hosted usage, org/project usage, or opted-in CLI install/project usage.
- `internal`: Decantr team, QA, and synthetic traffic identified by server-side identity flags or opaque id allowlists.
- `official_pipeline`: Decantr-owned content validation/publish automation.
- `service`: backend service events that are not attributable to a user, org, install, project, or anonymous visitor.

If omitted, sinks call `resolveTelemetryActorType(context)`. The hosted API normalizes public ingest events with server-authoritative attribution from Supabase identity flags, `telemetry_identity_aliases`, and fallback overrides through `DECANTR_INTERNAL_USER_IDS`, `DECANTR_INTERNAL_ORG_IDS`, `DECANTR_INTERNAL_INSTALL_IDS`, `DECANTR_INTERNAL_PROJECT_IDS`, and `DECANTR_INTERNAL_ANONYMOUS_IDS`.

The registry admin portal exposes `/admin/telemetry` for managing `anonymous`, `install`, and `project` aliases without writing SQL. Aliases can be linked by user email/id or organization slug/id. Opted-in CLI users can review the shareable event/field explanation with `decantr telemetry explain`, then self-link opaque install/project ids with `decantr telemetry link --enable --org <slug>`, which calls the audited API alias flow and emits `telemetry.identity_linked`. Mutations clear the hosted API actor-resolution cache. `/admin/telemetry/usage` adds the protected PostHog query view for active identities, source/actor mix, paid-acquisition signals, failure signals, period-over-period trends, product signal buckets, operating alerts, stored rollup history, snapshot freshness, identity coverage, and unaliased identity candidates, with one-click candidate classification through the same audited alias flow. `/admin/reports` and individual organization admin pages read durable Supabase rollups written by the service-token protected snapshot runner, giving Decantr an owned business-intelligence history while PostHog remains the raw event explorer.

## Campaign Attribution

The marketing site and registry can attach campaign attribution fields to web events: UTM source/medium/campaign/content/term/id, first and last touch variants, landing path, referrer domain, click-id provider, and whether a supported click id was present. Raw ad click ids such as `twclid`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `ttclid`, and `li_fat_id` are not included in Decantr telemetry.

`decantr.ai` and `registry.decantr.ai` share one opaque first-party anonymous cookie when the browser allows it, so PostHog funnels can connect marketing CTAs to registry exploration and signup intent without collecting personal identifiers.

## PostHog

```ts
import { createPostHogTelemetrySink, createTelemetryClient } from '@decantr/telemetry';

const telemetry = createTelemetryClient({
  context: {
    source: 'api',
    environment: 'production',
    serviceName: 'decantr-api',
    decantrVersion: '1.7.26',
  },
  sink: createPostHogTelemetrySink({
    apiKey: process.env.POSTHOG_PROJECT_TOKEN!,
    host: process.env.POSTHOG_HOST,
  }),
});

await telemetry.capture({
  name: 'registry.item.resolved',
  context: {
    source: 'api',
    projectId: 'project_opaque_id',
    orgId: 'org_opaque_id',
    registrySource: 'official',
  },
  properties: {
    contentType: 'pattern',
    itemId: 'hero-split',
    namespace: '@official',
    success: true,
  },
});
```

The PostHog sink uses opaque Decantr IDs as `distinct_id`, maps `orgId` and `projectId` to PostHog groups, and defaults `$process_person_profile` to `false`.

## Future First-Party Dashboard

The generic fetch sink is intended for a later Decantr-owned ingestion endpoint:

```ts
import { createFetchTelemetrySink, createTelemetryClient } from '@decantr/telemetry';

const telemetry = createTelemetryClient({
  sink: createFetchTelemetrySink({
    endpoint: 'https://api.decantr.ai/v1/telemetry/events',
    headers: () => ({ Authorization: `Bearer ${process.env.DECANTR_TELEMETRY_TOKEN}` }),
  }),
});
```

That endpoint can write raw events and daily rollups into Supabase or an analytics warehouse while PostHog remains the fast product analytics layer.
