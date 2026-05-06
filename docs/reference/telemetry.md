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

## PostHog Policy

PostHog is the fast product analytics lane. The `createPostHogTelemetrySink` adapter sends Decantr event names directly, uses opaque Decantr IDs for `distinct_id`, maps `orgId` and `projectId` to groups, and defaults `$process_person_profile` to `false`.

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

`POSTHOG_ENVIRONMENT_ID` is the numeric project id from the PostHog app URL, not the `phc_` ingestion token. The personal API key needs dashboard and insight read/write access. The script is idempotent: reruns update the existing `Decantr Operating Dashboard` and its saved insights instead of creating duplicates.

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
