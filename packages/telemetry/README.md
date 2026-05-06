# @decantr/telemetry

Privacy-preserving telemetry contracts, clients, and analytics sinks for Decantr.

This package is the first layer of Decantr's usage intelligence system. It defines the event names and payload shapes that the CLI, API, MCP server, registry app, and content pipeline can emit without coupling those surfaces to a single analytics vendor.

## Product Stance

Decantr telemetry measures Decantr usage, not customer application data.

Allowed signals include command names, registry sources, registry content IDs, package versions, workflow modes, success/failure, duration, audit scores, and aggregate counts. Do not send prompts, source code, generated files, raw file paths, environment variables, secrets, API keys, email addresses, IP addresses, or user agents.

## MVP Events

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

Private registries do not need a separate telemetry surface yet. Use `registry.item.resolved` with `registrySource: "private"` and `visibility: "private"` when that product line lands.

## Actor Attribution

Every event can carry `context.actorType` so Decantr can distinguish founder/internal usage from real customer adoption without relying on remembered PostHog person ids.

- `anonymous`: unauthenticated registry/API browsing or resolution with only an anonymous id.
- `customer`: authenticated hosted usage, org/project usage, or opted-in CLI install/project usage.
- `internal`: Decantr team traffic identified by server-side opaque id allowlists or explicit internal CLI env.
- `official_pipeline`: Decantr-owned content validation/publish automation.
- `service`: backend service events that are not attributable to a user, org, install, project, or anonymous visitor.

If omitted, sinks call `resolveTelemetryActorType(context)`. The hosted API also normalizes public ingest events and can override known Decantr-owned IDs through `DECANTR_INTERNAL_USER_IDS`, `DECANTR_INTERNAL_ORG_IDS`, `DECANTR_INTERNAL_INSTALL_IDS`, `DECANTR_INTERNAL_PROJECT_IDS`, and `DECANTR_INTERNAL_ANONYMOUS_IDS`.

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
