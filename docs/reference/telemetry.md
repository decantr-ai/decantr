# Telemetry

Decantr 3.8 keeps `@decantr/telemetry` as an optional contract and sink package, but hosted product analytics are no longer part of the active registry/API product surface.

The current product direction is content-first governance:

- CLI telemetry stays opt-in.
- MCP does not emit telemetry.
- The Fly API serves content/reference routes only.
- Registry portal analytics, admin telemetry pages, PostHog dashboards, Supabase rollups, billing funnels, and public ingest routes are retired.

## Package Role

`@decantr/telemetry` defines typed event vocabulary, redaction helpers, privacy filters, and optional sinks. It should be treated as a library for future or private deployments, not as proof that Decantr runs a hosted analytics dashboard today.

Allowed signals are product-level aggregates such as command names, package versions, workflow modes, duration, success/failure, Project Health status/counts, content types, and optional campaign labels.

Never send prompts, source code, generated files, health reports, finding evidence, raw file paths, environment variables, secrets, API keys, email addresses, IP addresses, raw referrer URLs, click IDs, or user agents.

## Current Runtime Boundaries

| Surface | Current telemetry posture |
| --- | --- |
| CLI | Disabled by default; only explicit telemetry commands may enable local opt-in behavior. |
| MCP server | No Decantr telemetry emission. |
| Content API | No hosted telemetry, usage-metering, billing, org, user, or admin analytics routes. |
| Docs/homepage | No registry handoff funnel. |
| Registry portal | Retired. |

## Legacy Event Names

Some package event names still contain `registry.*` or `content.publish.*` for Decantr 3.x compatibility. New code should prefer content-corpus language and should not reintroduce hosted registry publishing or analytics dependencies without an explicit product decision.

## External Closeout

After the 3.8 migration is verified, remove any unused PostHog projects/dashboards, Supabase telemetry tables or snapshot jobs, registry portal analytics secrets, and webhook secrets that only supported the retired hosted registry product.
