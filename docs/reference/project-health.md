# Decantr Project Health

Project Health is the end-user observability surface for a Decantr project. It answers: is this application still aligned with its Decantr contract, where has it drifted, what should be fixed first, and what prompt or command should the developer run next?

It is local-only by default. `decantr health` reads the current project, composes a structured report, and prints it locally. `decantr studio` serves the same report from localhost for visual triage. Neither command uploads source code, prompts, raw file paths, environment variables, or customer project data.

Projects that explicitly opt into Decantr CLI telemetry, including through `decantr new --telemetry`, `decantr init --telemetry`, or `decantr check --telemetry`, may emit aggregate Project Health usage signals such as report status, score, finding counts, CI failure outcome, Studio start/refresh activity, and remediation prompt requests. The report body, finding evidence, raw routes, local paths, source files, and prompts stay local.

For registry content repositories such as `decantr-content`, use [Content Health](content-health.md) instead. Content Health checks content schemas, references, and generation guidance coverage; Project Health checks an application against its Decantr contract.

## Commands

```bash
decantr health
decantr health --format text
decantr health --json
decantr health --markdown
decantr health --output health.md
decantr health --ci --fail-on error
decantr health --ci --fail-on warn
decantr health --prompt <finding-id>
decantr health --json --output decantr-health.json
decantr studio --port 4319 --host 127.0.0.1
decantr studio --report decantr-health.json
```

`decantr health` defaults to a human-readable text summary. `--json` emits a `ProjectHealthReport` matching `https://decantr.ai/schemas/project-health-report.v1.json`. `--markdown` is designed for pull request or CI summaries. `--prompt <finding-id>` prints a scoped remediation prompt for one actionable finding. It does not edit files; give the printed prompt to the AI assistant or developer doing the repair.

## What The Report Contains

The report composes existing Decantr evidence instead of inventing a parallel checker:

- verifier audit evidence from `auditProject()`
- guard and interaction findings from `decantr check`
- brownfield route drift when `.decantr/project.json` declares `brownfield-attach`
- built runtime evidence when a `dist/` output exists
- execution-pack and review-pack health from `.decantr/context`
- remediation prompts and recommended commands for actionable findings

Status is intentionally simple:

- `error`: any error/blocking finding or invalid audit evidence exists.
- `warning`: warnings exist and no errors exist.
- `healthy`: no errors or warnings exist.

Score uses `100 - errors*15 - warnings*5 - info*1`, clamped from `0` to `100`. The score is a triage aid; CI should use status and severity thresholds.

## Studio

`decantr studio` starts a small localhost dashboard powered by the same report. It uses Node built-ins only and exposes:

- `GET /` for the dashboard
- `GET /api/health` for the current report
- `POST /api/refresh` to recompute the report

The Overview is the triage surface: it summarizes status in plain language, lets the user pick the finding to fix first, previews the full AI repair prompt before copying, and offers tabs for manual guidance or verification commands. Route, runtime, pack, workflow, and source-count evidence live under expandable project details so the first screen stays focused.

Studio tabs:

- Overview
- Routes
- Drift
- Findings
- Remediation
- CI
- Packs

Use Studio while attaching Decantr to an existing project, before asking an AI assistant to remediate drift, or before opening a pull request.

Report mode serves a customer-controlled JSON artifact instead of scanning the local source tree:

```bash
decantr health --json --output decantr-health.json
decantr studio --report decantr-health.json
```

In report mode, `GET /api/health` reads the JSON artifact and `POST /api/refresh` re-reads it. This is the lightweight path for permanent internal reporting today: CI writes `decantr-health.json`, an internal host serves Studio against that artifact, and the report stays under the customer's control. This is distinct from Decantr telemetry and does not create hosted ingestion, auth, retention, or cross-project history.

## Greenfield

For a new Decantr scaffold:

```bash
decantr new my-app --blueprint=agent-marketplace
cd my-app
decantr refresh
decantr health
decantr studio
```

Healthy greenfield projects should have generated context packs, route coverage, and no blocking DNA drift. If a finding appears, run:

```bash
decantr health --prompt <finding-id>
```

That command prints a focused prompt; it does not apply the fix. Give the prompt to the assistant that is implementing the app, or copy the full prompt directly from Studio.

## Brownfield

For an existing app:

```bash
decantr analyze
decantr init --existing --accept-proposal
decantr health
```

When the project workflow is `brownfield-attach`, health automatically includes route coverage and drift checks from the observed app inventory. This helps separate "the existing app has not been mapped into the contract yet" from "the implementation drifted away from an accepted Decantr contract."

Brownfield health respects existing-app authority. It reports evidence and remediation, but it does not replace the app's router, style system, docs, rules, or source files.

## Hybrid Composition

For attached projects that add sections, pages, features, or themes over time:

```bash
decantr add section settings-full
decantr refresh
decantr health --markdown --output .decantr/health.md
```

Project Health is useful immediately after a composition change because it checks whether generated packs, route contracts, and guard expectations still agree.

## CI

Install the default GitHub Actions gate:

```bash
decantr health init-ci
```

This writes `.github/workflows/decantr-health.yml`. The workflow installs project dependencies, generates `decantr-health.json`, gates with markdown output, appends the report to the GitHub step summary, and uploads both report files as artifacts.

Use these options to tune the generated workflow:

```bash
decantr health init-ci --force
decantr health init-ci --fail-on warn
decantr health init-ci --cli-version 2.0.0
decantr health init-ci --workflow-path .github/workflows/project-health.yml
decantr health init-ci --project apps/registry
```

For monorepos, run `init-ci` from the repository root and pass the app contract path with `--project <path>`. The generated workflow installs dependencies at the root, runs both health commands with `working-directory: <path>`, appends the project-local markdown report to the GitHub step summary, and uploads artifacts using root-relative paths such as `apps/registry/decantr-health.json`.

The generated pull request gate runs:

```bash
decantr health --ci --fail-on error --markdown --output decantr-health.md
```

Use `--fail-on error` for the default enterprise-friendly gate: block only invalid audits and blocking findings. Use `--fail-on warn` for stricter repositories that want any warning to fail CI.

Minimal GitHub Actions step:

```yaml
- name: Decantr health
  run: npx --yes @decantr/cli@latest health --ci --fail-on error --markdown --output decantr-health.md
```

The JSON form can be validated against the published schema and consumed by future DevOps dashboards:

```bash
decantr health --json --output decantr-health.json
```

## Relationship To Telemetry

Project Health is local project observability. It is for the customer or developer who owns the repository.

Decantr telemetry is product intelligence for Decantr operators. It tracks adoption signals such as command usage and registry activity through privacy-filtered events. Project Health does not require telemetry opt-in and does not send its report to Decantr.

Future private registry or enterprise offerings can consume `ProjectHealthReport` as an optional customer-controlled artifact, but the local command remains the baseline contract.
