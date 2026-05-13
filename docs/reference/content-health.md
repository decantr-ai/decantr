# Decantr Content Health

Content Health is the local observability surface for Decantr registry content repositories. It answers: are the content files schema-valid, do blueprints and archetypes point at publishable registry items, where is generation guidance thin, and what should the content author fix first?

It is designed for repositories such as `decantr-content`, not customer applications. Customer applications should use [Project Health](project-health.md).

## Commands

```bash
decantr content check
decantr content check --ci --fail-on error
decantr content-health
decantr content-health --format text
decantr content-health --json
decantr content-health --markdown
decantr content-health --output content-health.md
decantr content-health --ci --fail-on error
decantr content-health --ci --fail-on warn
decantr content-health --prompt <finding-id>
```

`decantr content check` is the preferred workflow command. `decantr content-health` remains as the backward-compatible primitive. `--json` emits a `ContentHealthReport` matching `https://decantr.ai/schemas/content-health-report.v1.json`. `--markdown` is intended for GitHub Actions summaries and pull request artifacts. `--prompt <finding-id>` prints a scoped AI remediation prompt for one content issue.

## What It Checks

Content Health scans local registry content directories:

- `patterns/`
- `themes/`
- `blueprints/`
- `archetypes/`
- `shells/`

The report includes:

- schema validation against the public `@decantr/registry` schemas
- id and filename consistency
- duplicate ids by content type
- blueprint theme, compose, route, shell, and archetype references
- archetype shell, layout pattern, explicit pattern, dependency, and suggested theme references
- quality coverage for pattern visual guidance, interactions, theme decorators, blueprint personality, blueprint voice, and archetype page briefs
- AI-ready remediation prompts and recommended commands

Hard publish-blocking issues are errors. Softer coverage gaps, such as missing concrete pattern files for semantic archetype layout names, are warnings so official content can keep expressive layout vocabulary while still making coverage debt visible.

## CI

Recommended default gate:

```bash
decantr content check --ci --fail-on error --markdown --output content-health.md
```

Use `--fail-on error` for publish-readiness: invalid JSON, schema failures, duplicate ids, and missing hard references block. Use `--fail-on warn` when you want missing suggested themes, missing concrete pattern coverage, or quality guidance gaps to block a pull request.

Example GitHub Actions step after the CLI version containing Content Health is published:

```yaml
- name: Decantr content health
  run: npx @decantr/cli content check --ci --fail-on error --markdown --output content-health.md
```

## Relationship To Registry Drift

Content Health is local and does not call the hosted registry by default. It tells you whether the repo content is internally healthy before publication.

Live registry drift remains a separate audit lane. In `decantr-content`, keep using the registry drift workflow to compare local files with `https://api.decantr.ai/v1` and catch missing, extra, or changed hosted records.

## Relationship To Telemetry

Content Health is not Decantr product telemetry. It does not send content files, prompts, file paths, or reports to Decantr. Telemetry may record that a command completed if the current project has explicitly opted in, but the health report itself stays local unless the repository owner uploads it as a CI artifact.

## Project Health Comparison

| Surface | Repository | Primary User | Signal |
| --- | --- | --- | --- |
| Project Health | Customer app | App developer | Contract drift, route/runtime evidence, pack state, remediation |
| Content Health | Registry content repo | Decantr/content operator | Schema validity, content references, generation guidance coverage |

The two reports are intentionally separate so enterprise customers can inspect their own app health while Decantr operators can inspect the quality of the registry supply chain.
