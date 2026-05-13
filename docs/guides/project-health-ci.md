# Project Health CI

Project Health is Decantr's CI-friendly answer to: is this app still aligned with its contract, where did it drift, and what should be fixed first?

## Install The Gate

```bash
npx @decantr/cli verify init-ci
```

For a monorepo:

```bash
npx @decantr/cli verify init-ci --project apps/web
```

The generated workflow runs the Project Health gate, writes markdown and JSON reports, appends the summary to GitHub Actions, and uploads the artifacts. It defaults to `--fail-on error`, which blocks invalid or error-level findings while keeping warning-level drift visible for triage.

## Run Locally

```bash
npx @decantr/cli verify
npx @decantr/cli verify --ci --fail-on error
npx @decantr/cli verify --markdown --output decantr-health.md
npx @decantr/cli verify --json --output decantr-health.json
```

## Repair With An AI Assistant

```bash
npx @decantr/cli health --prompt <finding-id>
```

The prompt is scoped to one finding. It does not edit files by itself. Give the prompt to the assistant doing the implementation, then rerun Project Health.

## Privacy Boundary

Project Health is local project observability. It does not upload source code, prompts, raw file paths, local route evidence, environment variables, or the report body to Decantr.

See also: [Project Health Reference](../reference/project-health.md), [Telemetry](../reference/telemetry.md).
