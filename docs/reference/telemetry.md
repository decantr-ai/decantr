# Telemetry

Decantr 3.8.x keeps `@decantr/telemetry` as an optional contract and sink package, but hosted product analytics are no longer part of the active registry/API product surface.

The current product direction is content-first governance:

- CLI telemetry stays opt-in and has no default delivery endpoint.
- MCP does not emit telemetry.
- The Fly API serves content/reference routes only.
- Docs may load an X conversion pixel only when its deployment config supplies a pixel and event id; there is no first-party docs ingest, attribution cookie, or local-storage identifier.
- Registry portal analytics, admin telemetry pages, PostHog dashboards, Supabase rollups, billing funnels, and public ingest routes are retired.

## Package Role

`@decantr/telemetry` defines typed event vocabulary, redaction helpers, privacy filters, and optional sinks. It should be treated as a library for future or private deployments, not as proof that Decantr runs a hosted analytics dashboard today.

Allowed signals are product-level aggregates such as command names, package versions, workflow modes, duration, success/failure, Project Health status/counts, content types, and optional campaign labels.

Never send prompts, source code, generated files, health reports, finding evidence, raw file paths, environment variables, secrets, API keys, email addresses, IP addresses, raw referrer URLs, click IDs, or user agents.

## Current Runtime Boundaries

| Surface | Current telemetry posture |
| --- | --- |
| CLI | Disabled by default. Opt-in records a local preference; events are delivered only to an explicit `DECANTR_TELEMETRY_ENDPOINT`, and identifiers are not created without it. |
| MCP server | No Decantr telemetry emission. |
| Content API | No hosted telemetry, usage-metering, billing, org, user, or admin analytics routes. |
| Docs/homepage | No first-party ingest or persisted attribution. A deployment may explicitly configure X conversion events. |
| Registry portal | Retired. |

## Legacy Event Names

Some package event names still contain `registry.*` or `content.publish.*` for Decantr 3.x compatibility. New code should prefer content-corpus language and should not reintroduce hosted registry publishing or analytics dependencies without an explicit product decision.

## Private Deployment Configuration

- `DECANTR_TELEMETRY_ENDPOINT` enables aggregate CLI event delivery to a caller-controlled sink.
- `DECANTR_TELEMETRY_GUARD_ENDPOINT` separately enables legacy guard-metric delivery.
- `DECANTR_TELEMETRY_IDENTITY_API_URL` or `decantr telemetry link --api-url ...` enables private identity linking.
- `DECANTR_API_URL` remains the content API setting and is never treated as a telemetry identity endpoint.

PostHog projects/dashboards, Supabase telemetry tables or snapshot jobs, registry portal analytics secrets, and webhooks that only supported the retired hosted product are not part of the 3.8.1 operating surface.
