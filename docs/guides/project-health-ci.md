# Project Health CI

Project Health is Decantr's CI-friendly answer to: is this app still aligned with its contract, where did it drift, and what should be fixed first?

## Install The Gate

```bash
npx @decantr/cli ci init
```

For a monorepo:

```bash
npx @decantr/cli ci init --project apps/web
```

The generated workflow lives at the repository root, installs dependencies with the detected package manager, runs the pinned local CLI command, writes markdown and JSON reports, appends the summary to GitHub Actions, and uploads the artifacts. It defaults to `--fail-on error`, which blocks invalid or error-level findings while keeping warning-level drift visible for triage. Decantr does not generate `@latest` workflows by default; when the CLI is not pinned yet, the installer prints the package-manager command to add it first.

Older `decantr health init-ci` and `decantr verify init-ci` invocations are compatibility aliases for `decantr ci init`. New docs and scripts should use `ci init` directly.

For Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deployment tools, generate a portable snippet instead:

```bash
npx @decantr/cli ci init --provider generic --project apps/web
```

## Run Locally

```bash
npx @decantr/cli verify
npx @decantr/cli ci --fail-on error
npx @decantr/cli ci --project apps/web
npx @decantr/cli ci --workspace --changed --since origin/main
npx @decantr/cli verify --markdown --output decantr-health.md
npx @decantr/cli verify --json --output decantr-health.json
```

Use `verify` for the local human/agent loop and `ci` for mandatory automation. Both commands respect the selected adoption lane: contract-only Brownfield apps keep existing source/style authority, Hybrid local law adds accepted project rules, style bridges and Decantr CSS are only enforced where explicitly adopted, and workspace runs isolate each attached app. `ci` includes accepted local-rule findings in text, markdown, and JSON reports; `--fail-on error` keeps warning-level local law visible without blocking, while `--fail-on warn` blocks on those warnings once your team has stabilized them. In monorepos, keep `--project <app-path>` explicit unless you intentionally want a workspace aggregate with `--workspace`.

## Repair With An AI Assistant

```bash
npx @decantr/cli health --prompt <finding-id>
npx @decantr/cli health --project apps/web --prompt <finding-id>
```

The prompt is scoped to one finding. It does not edit files by itself. In monorepos, keep the same `--project` that produced the finding so the prompt resolves against the app, not the workspace root. Give the prompt to the assistant doing the implementation, then rerun Project Health.

## Privacy Boundary

Project Health is local project observability. It does not upload source code, prompts, raw file paths, local route evidence, environment variables, or the report body to Decantr.

See also: [Project Health Reference](../reference/project-health.md), [Telemetry](../reference/telemetry.md).
