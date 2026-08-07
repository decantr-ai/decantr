# @decantr/telemetry

Optional telemetry contracts, privacy filters, clients, and sinks for Decantr.

Decantr 3 keeps this package for compatibility and private deployments, not as a public product foundation. The current stable package remains at 3.8.1; Decantr 3.10 did not version-bump it solely for alignment. The 3.10 UI change-control release assigns telemetry no feature investment and does not treat product analytics as qualification evidence. The active hosted product no longer includes registry portal analytics, PostHog dashboards, Supabase rollups, billing funnels, public telemetry ingest, or admin telemetry pages.

## Product Stance

Decantr telemetry measures Decantr usage, not customer application data.

Allowed signals include command names, package versions, workflow modes, success/failure, duration, Project Health status/counts, content types, aggregate counts, and optional campaign labels. Do not send prompts, source code, generated files, health reports, finding evidence, raw file paths, environment variables, secrets, API keys, email addresses, IP addresses, raw referrer URLs, click IDs, or user agents.

## Runtime Posture

- CLI telemetry is disabled by default.
- The CLI has no hosted default sink; callers must configure their own endpoint.
- MCP does not emit Decantr telemetry.
- The Fly API is content/reference only.
- Legacy event names may still contain `registry.*` for Decantr 3.x compatibility.

## Example

```ts
import { createTelemetryClient } from '@decantr/telemetry';

const telemetry = createTelemetryClient({
  context: {
    source: 'cli',
    environment: 'development',
    serviceName: 'decantr-cli',
  },
});

await telemetry.capture({
  name: 'cli.command.completed',
  properties: {
    command: 'content',
    success: true,
    durationMs: 42,
  },
});
```

Constructing a client and choosing a sink are explicit; the package does not auto-start collection or select a Decantr-hosted endpoint.

See [security permissions](https://decantr.ai/reference/security-permissions.md).
