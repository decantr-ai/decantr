# Decantr Project Health

Project Health is the end-user reliability surface for a Decantr project. It answers: is this application still aligned with its Decantr contract, where has it drifted, what should be fixed first, and what prompt or command should the developer run next?

It is local-only by default. `decantr verify` is the user-facing reliability command; it delegates to Project Health and adds workflow conveniences such as Brownfield guard checks, evidence output defaults, workspace mode, local-pattern requirements, and accepted local-rule scans. `decantr health` remains the advanced primitive that reads the current project, composes a structured report, and prints it locally. `decantr studio` serves the same report from localhost for visual triage. None of these commands uploads source code, prompts, raw file paths, environment variables, or customer project data.

Projects that explicitly opt into Decantr CLI telemetry, including through `decantr new --telemetry`, `decantr init --telemetry`, or `decantr check --telemetry`, may emit aggregate Project Health usage signals such as report status, score, finding counts, CI failure outcome, Studio start/refresh activity, and remediation prompt requests. The report body, finding evidence, raw routes, local paths, source files, and prompts stay local.

For registry content repositories such as `decantr-content`, use [Content Health](content-health.md) instead. Content Health checks content schemas, references, and generation guidance coverage; Project Health checks an application against its Decantr contract.

## Commands

```bash
decantr verify
decantr verify --brownfield
decantr verify --local-patterns
decantr verify --brownfield --local-patterns --fail-on warn
decantr verify --base-url http://localhost:3000 --evidence
decantr verify --since-baseline
decantr verify --workspace --changed --since origin/main
decantr doctor --project apps/web
decantr ci --project apps/web
decantr ci --workspace --changed --since origin/main
decantr ci init --project apps/web
decantr health
decantr health --format text
decantr health --json
decantr health --markdown
decantr health --output health.md
decantr health --prompt <finding-id>
decantr health --evidence --output .decantr/evidence/latest.json
decantr health --browser --base-url http://localhost:3000 --evidence
decantr health --save-baseline
decantr health --since-baseline
decantr health --design-tokens .decantr/design/figma-tokens.json
decantr health --json --output decantr-health.json
decantr workspace list
decantr workspace health --changed --since origin/main
decantr studio --port 4319 --host 127.0.0.1
decantr studio --workspace
decantr studio --report decantr-health.json
```

`decantr verify` should be the default command in local agent loops. `decantr ci` is the non-mutating automation gate for CI and required validation scripts; `--json` emits a `DecantrCiReport` matching `https://decantr.ai/schemas/decantr-ci-report.v1.json`. `decantr doctor` explains project/workspace state, adoption mode, generated artifacts, local law, CI wiring, and the next command to run. `decantr health` defaults to a human-readable text summary. `--json` emits a `ProjectHealthReport` matching `https://decantr.ai/schemas/project-health-report.v1.json`. `--markdown` is designed for pull request or CI summaries. `--evidence` emits an `EvidenceBundle` matching `https://decantr.ai/schemas/evidence-bundle.v1.json`. `--prompt <finding-id>` prints a scoped remediation prompt for one actionable finding. `--save-baseline` writes `.decantr/health-baseline.json`; `--since-baseline` writes `.decantr/health-baseline-diff.json` and, for text output, prints the continuity summary. It does not edit files; give the printed prompt to the AI assistant or developer doing the repair.

Project Health treats `pack-manifest.json` as a manifest, not proof by itself. If the manifest references a missing section/page/review/scaffold/mutation markdown or JSON file, health and doctor report the generated context as incomplete. In contract-only Brownfield, missing hosted packs are optional context: health reports them as info, doctor does not make hydration the next required step, and `refresh --check` does not fail solely because packs were intentionally deferred. In monorepos, hydrate missing or intentionally deferred hosted packs with `decantr registry compile-packs apps/web/decantr.essence.json --write-context` so the bundle lands beside the selected app essence. Project Health remediation prompts and CI recommendations also stay project-scoped, so root runs point at `--project apps/web` instead of asking users to run app-local commands from the wrong folder.

Source audit ignores test, spec, story, fixture, and mock files for production drift warnings such as localhost endpoints or unsafe rendering patterns. Those files can still exist in the project, but first-adoption health should focus users on production source paths.

## What The Report Contains

The report composes existing Decantr evidence instead of inventing a parallel checker:

- verifier audit evidence from `auditProject()`
- contract assertions compiled from Essence/context
- guard and interaction findings from `decantr check`
- brownfield route drift when `.decantr/project.json` declares `brownfield-attach`
- accepted local law from `.decantr/local-patterns.json` and `.decantr/rules.json` when `decantr verify --local-patterns` is used
- built runtime evidence when a `dist/` output exists
- optional local browser verification when Playwright is installed and `--browser --base-url <url>` is provided
- optional Figma/Tokens Studio token comparison through `--design-tokens <path>`
- execution-pack and review-pack health from `.decantr/context`
- remediation prompts and recommended commands for actionable findings

## Evidence Bundle

The Evidence Bundle is the durable AI-repair artifact:

```bash
decantr health --evidence --output .decantr/evidence/latest.json
```

It includes health summary, provenance hashes, contract assertions, findings, recommended rerun commands, optional browser evidence, and optional design-token comparison. It does not include raw source, prompts, secrets, environment values, raw absolute paths, repository names, or uploaded screenshots by default. Browser screenshots, when produced, stay as local file paths under `.decantr/evidence/screenshots/`.

Freshness hashes are emitted for `decantr.essence.json`, `.decantr/context/pack-manifest.json`, `.decantr/context/review-pack.json`, optional workspace config, and optional design-token source. This gives AI agents a cheap way to detect stale repair context.

## Browser And UX Evidence

Browser verification is opt-in:

```bash
decantr health --browser --base-url http://localhost:3000 --evidence
```

Decantr loads Playwright from the project if `playwright` or `@playwright/test` is installed. It visits declared routes, captures screenshots locally, and turns route render failures into `browser` health findings. If Playwright is not installed, health emits a setup finding instead of crashing. This keeps the default install light while creating a clear adapter boundary for richer UX checks.

When browser evidence is enabled, Decantr also writes `.decantr/evidence/visual-manifest.json`. The manifest maps each checked route to its local screenshot path and screenshot hash. Screenshots stay under `.decantr/evidence/screenshots/`; the Evidence Bundle references paths only.

## Baselines And Continuity

Use health baselines when an AI assistant or team will touch the same Brownfield app across multiple sessions:

```bash
decantr health --save-baseline
decantr health --since-baseline
```

The baseline stores status, score, finding IDs, declared routes, pack summary, and local screenshot hashes. The comparison reports added/resolved findings, changed files from unstaged and staged Git diffs, route impact when `.decantr/analysis.json` can map a changed file to a route, screenshot hash drift, and contract drift such as route-set or pack-generation changes.

## Design Tokens

Figma and UX-system integration starts with token/policy comparison, not frame sync:

```bash
decantr export --to figma-tokens
decantr health --design-tokens .decantr/design/figma-tokens.json
```

`export --to figma-tokens` writes a Tokens Studio-compatible JSON file from generated Decantr CSS tokens. `health --design-tokens` compares that token source against local `--d-*` CSS tokens so teams can catch design-system drift without introducing Figma OAuth, file sync, or screenshot comparison in this phase.

## Workspace Health

Large monorepos can contain many Decantr projects. The `workspace` namespace keeps that surface explicit:

```bash
decantr workspace list
decantr workspace health
decantr workspace health --json --output .decantr/workspace-health.json
decantr workspace health --changed --since origin/main
```

Before attach, `workspace list` shows app candidates discovered from common monorepo layouts so users know which `--project` path to pass. After attach, projects can be listed in `.decantr/workspace.json`; otherwise Decantr discovers `decantr.essence.json` files while ignoring dependency/build folders. Workspace health runs attached projects in deterministic order with concurrency, per-project timeout, failure isolation, and aggregate JSON matching `https://decantr.ai/schemas/workspace-health-report.v1.json`.

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
decantr studio --workspace
```

In report mode, `GET /api/health` reads the JSON artifact and `POST /api/refresh` re-reads it. This is the lightweight path for permanent internal reporting today: CI writes `decantr-health.json`, an internal host serves Studio against that artifact, and the report stays under the customer's control. This is distinct from Decantr telemetry and does not create hosted ingestion, auth, retention, or cross-project history.

Workspace mode serves `GET /api/workspace` and `POST /api/workspace/refresh` from `decantr workspace health`. It is meant for local triage of repos with many Decantr projects, not hosted ingestion.

## Greenfield

For a new Decantr scaffold:

```bash
decantr new my-app --blueprint=agent-marketplace
cd my-app
decantr refresh
decantr verify
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
decantr adopt --yes
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
```

In a monorepo, keep the app path explicit:

```bash
decantr adopt --project apps/web --yes
decantr task /feed "add saved recipe actions" --project apps/web
decantr verify --brownfield --local-patterns --project apps/web
```

When the project workflow is `brownfield-attach`, health automatically includes route coverage and drift checks from the observed app inventory. This helps separate "the existing app has not been mapped into the contract yet" from "the implementation drifted away from an accepted Decantr contract."

Brownfield health respects existing-app authority. It reports evidence and remediation, but it does not replace the app's router, style system, docs, rules, or source files.

`decantr analyze` writes `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md` alongside the original analysis/proposal/report files. Theme inventory observes light, dark, and variant theme selectors without changing Essence V4. Those artifacts are local context for agents and reviewers, not source takeover.

`decantr codify --from-audit` adds a project-owned local law layer for things the official registry cannot infer from a contract-only app:

```bash
decantr codify --from-audit
decantr codify --accept
decantr verify --brownfield --local-patterns
```

The accepted `.decantr/local-patterns.json` is local context and governance. The accepted `.decantr/rules.json` adds narrow local scans for obvious drift. Deeper deterministic failures such as framework-specific wrapper-only rules should still be enforced through the project rule stack.

## Hybrid Composition

For attached projects that add sections, pages, features, or themes over time:

```bash
decantr add section settings-full
decantr refresh
decantr verify --markdown --output .decantr/health.md
```

Project Health is useful immediately after a composition change because it checks whether generated packs, route contracts, and guard expectations still agree.

## CI

Use `decantr ci` as the blessed automation command. It is adoption-mode aware, non-mutating, and isolates app-scoped checks in monorepos:

```bash
decantr ci --project apps/web
decantr ci --workspace
decantr ci --workspace --changed --since origin/main
```

Install the default GitHub Actions gate from the repository root:

```bash
decantr ci init --project apps/web
decantr ci init --workspace
```

This writes root `.github/workflows/decantr-ci.yml`. The workflow installs dependencies with the detected package manager and runs the pinned local CLI, for example `pnpm exec decantr ci --project apps/web`. It does not generate workflows that depend on `@latest` unless a team chooses to write that by hand. When Decantr is not pinned yet, the installer prints the exact package-manager command to add it before relying on CI.

Use these options to tune CI integration:

```bash
decantr ci init --force
decantr ci init --fail-on warn
decantr ci init --project apps/registry
decantr ci init --workspace
decantr ci init --provider generic --project apps/registry
```

For monorepos, install `@decantr/cli` at the workspace root and pass the app contract path with `--project <path>`. The generated workflow keeps dependency installation root-scoped while Decantr evaluates only the selected app contract. For Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deploy tools, use `--provider generic` and paste the generated shell snippet into the authoritative pipeline.

Project Health repair prompts preserve that same app scope. A finding printed from `decantr health --project apps/web` uses `decantr health --project apps/web --prompt <finding-id>`, and the prompt lookup runs against the selected app rather than the workspace root. Pack findings should reference the app essence path, for example `apps/web/decantr.essence.json`.

Contract/page topology findings include route-addressability checks. If a page exists in Essence without a page route or `blueprint.routes` entry, Project Health flags it because `decantr task <route>` cannot prepare reliable LLM context for an unreachable contract page. Page pack counts are also compared against contract page counts so stale generated context is visible after page add/remove flows.

For workspace-wide gates, use `--workspace`. The generated workflow runs `decantr ci --workspace`, appends the markdown summary to the GitHub step summary, and uploads `.decantr/ci/workspace.json` plus `.decantr/ci/workspace.md`.

The generated pull request gate runs a command shaped like:

```bash
pnpm exec decantr ci --project apps/web --fail-on error --json --output .decantr/ci/apps-web.json --markdown-output .decantr/ci/apps-web.md
```

Use `--fail-on error` for the default enterprise-friendly gate: block only invalid audits and blocking findings. Use `--fail-on warn` for stricter repositories that want any warning to fail CI.

Minimal custom CI step:

```bash
pnpm exec decantr ci --project apps/web
```

The JSON form can be validated against the published CI schema and consumed by internal dashboards:

```bash
decantr ci --project apps/web --json --output .decantr/ci/apps-web.json
```

## Relationship To Telemetry

Project Health is local project observability. It is for the customer or developer who owns the repository.

Decantr telemetry is product intelligence for Decantr operators. It tracks adoption signals such as command usage and registry activity through privacy-filtered events. Project Health does not require telemetry opt-in and does not send its report to Decantr.

Future private registry or enterprise offerings can consume `ProjectHealthReport` as an optional customer-controlled artifact, but the local command remains the baseline contract.
