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
decantr resolve --project apps/web
decantr ci --project apps/web
decantr ci --workspace --changed --since origin/main
decantr ci init --project apps/web
decantr graph --project apps/web --check
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

`decantr verify` should be the default command in local agent loops. `decantr ci` is the non-mutating automation gate for CI and required validation scripts; `--json` emits a `DecantrCiReport` matching `https://decantr.ai/schemas/decantr-ci-report.v2.json`. CI reports include accepted local-rule findings from `.decantr/rules.json` with file/line evidence when Hybrid local law is active, behavior-obligation findings from `.decantr/local-patterns.json` when Project Health can verify them statically, accepted style bridge status when `.decantr/style-bridge.json` exists, and the same v2 loop verdict as local verification. `decantr doctor` explains project/workspace state, adoption mode, generated artifacts, local law, CI wiring, and the ordered next-step queue. `decantr resolve` is read-only by default and groups source-vs-contract conflicts with explicit next commands; only drift-log actions write, and contract/source/local-law changes still go through existing explicit workflows. `decantr health` defaults to a human-readable text summary. `--json` emits a `ProjectHealthReport` matching `https://decantr.ai/schemas/project-health-report.v2.json`, including first-class `graph`, `evidenceTier`, `authority`, and `loop` blocks. `--markdown` is designed for pull request or CI summaries. `--evidence` emits an `EvidenceBundle` matching `https://decantr.ai/schemas/evidence-bundle.v2.json`. `--prompt <finding-id>` prints a scoped remediation prompt for one actionable finding. Project Health findings include stable `code`, typed `repair`, agent-actionable `repairPlan`, graph anchors when available, evidence-tier metadata, authority lane, resolution actions, privacy posture, and loop verdict. See [Diagnostic Codes](diagnostic-codes.md) for the curated code and repair catalog. Use `decantr health --diagnostics --json` or `decantr health --diagnostics --markdown` when automation or agents need the catalog without running a project audit. Attached projects also receive a `GRAPH001` / `regenerate-typed-graph` warning when `.decantr/graph` artifacts are missing, stale, or cannot be derived. When `.decantr/graph/graph.snapshot.json` exists, findings include an optional `graph` anchor with the snapshot ID, source hash, node ID, node type, route when known, confidence, and anchor reason. Text/markdown output, repair prompts, Evidence Bundles, Studio, and MCP loop responses carry the same fields. `--save-baseline` writes `.decantr/health-baseline.json`; `--since-baseline` writes `.decantr/health-baseline-diff.json` and, for text output, prints the continuity summary. It does not edit files; give the printed prompt to the AI assistant or developer doing the repair.

The v2 loop state tells agents and humans what to do next:

- `needs_context`: run `decantr task` before editing.
- `ready_to_edit`: context is prepared and the maker can implement.
- `verify_required`: source changed or context is sufficient, but verification has not closed the loop.
- `repair_required`: findings need a scoped repair pass.
- `human_resolution_required`: authority conflicts require a person to choose the source of truth.
- `blocked_missing_context`: Decantr cannot prepare enough route/context evidence.
- `blocked_missing_graph`: generate or refresh `.decantr/graph` before relying on graph-backed proof.
- `verified`: the current contract/context/evidence loop is closed.

When `.decantr/evidence/latest.json` exists, `decantr graph` can ingest the saved Evidence Bundle as graph nodes: findings become `Finding` nodes, evidence strings become `Evidence` nodes, repair IDs become `Repair` nodes, and graph anchors become typed edges back to the contract node that produced the finding. Evidence and repair read targets that point at existing project files become `SourceArtifact` nodes, so findings without a prior graph anchor can still attach to the file that needs repair. When `.decantr/health-baseline-diff.json` exists, changed files, changed routes, screenshot drift, and contract drift become temporal Evidence nodes linked back to SourceArtifact, Route, or Project nodes. Each graph generation also writes a content-addressed copy under `.decantr/graph/snapshots/`, which gives proof demos and local CI a replayable contract/evidence timeline without hosted storage.

Project Health treats `pack-manifest.json` as a manifest, not proof by itself. If the manifest references a missing section/page/review/scaffold/mutation markdown or JSON file, health and doctor report the generated context as incomplete. In contract-only Brownfield, missing hosted packs are optional context: health reports them as info, doctor does not make hydration the next required step, and `refresh --check` does not fail solely because packs were intentionally deferred. In monorepos, hydrate missing or intentionally deferred hosted packs with `decantr registry compile-packs apps/web/decantr.essence.json --write-context` so the bundle lands beside the selected app essence. Project Health remediation prompts and CI recommendations also stay project-scoped, so root runs point at `--project apps/web`, runtime prompts use root-safe app build commands such as `pnpm --dir apps/web build`, and prompt read targets point at `apps/web/DECANTR.md`, `apps/web/decantr.essence.json`, and app-local context files instead of asking users to read root files that do not own the app contract.

Source audit ignores test, spec, story, fixture, and mock files for production drift warnings such as localhost endpoints or unsafe rendering patterns. Interaction guard evidence also ignores tests, stories, fixtures, mocks, API route handlers, and server-only `route.ts` files, so UI behavior is proven by production UI source rather than incidental strings in tests or handlers. Those files can still exist in the project, but first-adoption health should focus users on production source paths.

## What The Report Contains

The report composes existing Decantr evidence instead of inventing a parallel checker:

- verifier audit evidence from `auditProject()`
- contract assertions compiled from Essence/context
- guard and interaction findings from `decantr check`
- brownfield route drift when `.decantr/project.json` declares `brownfield-attach`
- accepted local law from `.decantr/local-patterns.json` and `.decantr/rules.json` when `decantr verify --local-patterns` is used
- accepted style bridge mappings from `.decantr/style-bridge.json` when Hybrid style bridge is active
- built runtime evidence when a `dist/` output exists
- optional local browser verification when Playwright is installed and `--browser --base-url <url>` is provided
- optional Figma/Tokens Studio token comparison through `--design-tokens <path>`
- execution-pack and review-pack health from `.decantr/context`
- typed Contract graph freshness for attached projects with stable `GRAPH001` / `regenerate-typed-graph` findings
- AST-derived component reuse drift, including primitive reimplementation findings such as `COMP001` / `import-existing-component` and raw-control findings such as `COMP010` / `replace-raw-control-with-local-component`
- accepted behavior-obligation drift from `.decantr/local-patterns.json`, including dialog accessible-name findings such as `A11Y010` / `restore-dialog-accessible-name`, form label findings such as `A11Y011` / `restore-label-association`, form button findings such as `INT013` / `set-explicit-button-type`, and project primitive findings such as `COMP020` / `use-project-owned-interaction-primitive`
- accepted style bridge drift, including arbitrary Tailwind value, hardcoded inline color, and stylesheet color findings such as `TOKEN010` / `replace-arbitrary-style-with-bridge-token`
- stable diagnostic codes and typed repair IDs for findings
- optional graph anchors from `.decantr/graph/graph.snapshot.json`
- remediation prompts and recommended commands for actionable findings

## Evidence Bundle

The Evidence Bundle is the durable AI-repair artifact:

```bash
decantr health --evidence --output .decantr/evidence/latest.json
```

It includes health summary, provenance hashes, contract assertions, findings, stable diagnostic codes, typed repair IDs, typed repair plans, recommended rerun commands, optional graph anchors, optional browser evidence, and optional design-token comparison. Behavior-obligation findings carry the accepted local pattern id, obligation id, source evidence, and repair payload so an agent can repair the specific dialog or form rule without parsing prose. It does not include raw source, prompts, secrets, environment values, raw absolute paths, repository names, or uploaded screenshots by default. Browser screenshots, when produced, stay as local file paths under `.decantr/evidence/screenshots/`.

The v2 schema is the active 3.5 Evidence Bundle contract. It adds evidence-tier coverage, runtime probe embedding, artifact inventory, graph-anchor coverage, repair-plan coverage, and dashboard upload posture while keeping the same local-first privacy boundary.

Freshness hashes are emitted for `decantr.essence.json`, `.decantr/context/pack-manifest.json`, `.decantr/context/review-pack.json`, `.decantr/graph/graph.snapshot.json`, `.decantr/graph/graph.manifest.json`, `.decantr/graph/graph.diff.json`, `.decantr/graph/contract-capsule.json`, optional workspace config, and optional design-token source. Missing graph artifacts are represented as provenance entries with `present: false`, so an agent or CI dashboard can distinguish "no graph generated yet" from "finding lacks a graph anchor." This gives AI agents a cheap way to detect stale repair context.

## Browser And UX Evidence

Browser verification is opt-in:

```bash
decantr health --browser --base-url http://localhost:3000 --evidence
```

Decantr loads Playwright from the project if `playwright` or `@playwright/test` is installed. It visits declared routes, captures screenshots locally, and runs runtime probes for route-rendered state, nonblank DOM content, console/page errors, and computed animation/transition styles on known Decantr interaction classes such as `d-pulse`, `d-lift-hover`, and `d-scale-hover`. If project-local `axe-core` is installed, Decantr also runs an accessibility probe; if it is missing, the axe lane is recorded as skipped instead of becoming a health finding. Route render failures, runtime probe failures, and axe violations become `browser` health findings. If Playwright is not installed, health emits a setup finding instead of crashing and still writes static evidence when requested. Omit browser/base-url evidence when screenshots are not needed. This keeps the default install light while creating a clear adapter boundary for richer UX checks.

When browser evidence is enabled, Decantr also writes `.decantr/evidence/visual-manifest.json`. The manifest maps each checked route to its local screenshot path, screenshot hash, and per-route runtime probe results. Screenshots stay under `.decantr/evidence/screenshots/`; the Evidence Bundle references paths only. `decantr graph` ingests the visual manifest as local Evidence nodes linked to Route/Page graph nodes, so task context can see screenshot evidence without uploading image files.

## Baselines And Continuity

Use health baselines when an AI assistant or team will touch the same Brownfield app across multiple sessions:

```bash
decantr health --save-baseline
decantr health --since-baseline
```

The baseline stores status, score, finding IDs, declared routes, pack summary, and local screenshot hashes. The comparison reports added/resolved findings, changed files from unstaged and staged Git diffs, route impact when `.decantr/analysis.json` can map a changed file to a route, screenshot hash drift, and contract drift such as route-set or pack-generation changes. Screenshot hash drift also becomes a `VISUAL010` / `review-visual-baseline-drift` Project Health finding so agents can treat visual continuity as repairable evidence.

## Design Tokens

Figma and UX-system integration starts with token/policy comparison, not frame sync:

```bash
decantr export --to figma-tokens
decantr health --design-tokens .decantr/design/figma-tokens.json
```

`export --to figma-tokens` writes a Tokens Studio-compatible JSON file from generated Decantr CSS tokens. In contract-only Brownfield projects, Decantr CSS tokens may intentionally not exist; use the app's own token export or adopt a style bridge before treating `export --to figma-tokens` as the canonical path. `health --design-tokens` compares that token source against local `--d-*` CSS tokens so teams can catch design-system drift without introducing Figma OAuth, file sync, or screenshot comparison in this phase.

## Workspace Health

Large monorepos can contain many Decantr projects. The `workspace` namespace keeps that surface explicit:

```bash
decantr workspace list
decantr workspace health
decantr workspace health --json --output .decantr/workspace-health.json
decantr workspace health --changed --since origin/main
```

Before attach, `workspace list` shows app candidates discovered from common monorepo layouts so users know which `--project` path to pass. After attach, projects can be listed in `.decantr/workspace.json`; otherwise Decantr discovers `decantr.essence.json` files while ignoring dependency/build folders. If one app is attached and another candidate remains, the command says to attach another app rather than implying the workspace is empty. Workspace health runs attached projects in deterministic order with concurrency, per-project timeout, failure isolation, and aggregate JSON matching `https://decantr.ai/schemas/workspace-health-report.v2.json`, including a workspace-level loop summary and each project's loop state.

Status is intentionally simple:

- `error`: any error/blocking finding or invalid audit evidence exists.
- `warning`: warnings exist and no errors exist.
- `healthy`: no errors or warnings exist.

Score uses `100 - errors*15 - warnings*5 - info*1`, clamped from `0` to `100`. The score is a triage aid; CI should use status and severity thresholds.

## Studio

`decantr studio` starts a small localhost Control Room powered by the same v2 report. It uses Node built-ins only and exposes:

- `GET /` for the dashboard
- `GET /api/health` for the current report
- `GET /api/control-room` for loop state, next action, blocking findings, authority, and evidence tier
- `GET /api/resolve` for read-only authority resolution
- `GET /api/evidence` for graph-anchored evidence and runtime probes
- `GET /api/graph-impact` for route/file/finding blast-radius summaries
- `GET /api/task-preview` for route task instructions and verify commands
- `GET /api/proof` for local proof/benchmark report summaries when present
- `POST /api/refresh` to recompute the report

The Control Room is the triage surface: it summarizes loop state, next action, authority lane, blocking findings, evidence tier, graph impact, and copyable commands. Route, runtime, pack, workflow, and source-count evidence live under focused panels so the first screen stays about the next decision.

Studio views:

- Control Room
- Routes
- Graph Impact
- Authority Resolver
- Evidence
- Repairs
- CI/Benchmarks

Use Studio while attaching Decantr to an existing project, before asking an AI assistant to remediate drift, or before opening a pull request.

Report mode serves a customer-controlled JSON artifact instead of scanning the local source tree:

```bash
decantr health --json --output decantr-health.json
decantr studio --report decantr-health.json
decantr studio --workspace
```

In report mode, `GET /api/health` reads a v2 JSON artifact and `POST /api/refresh` re-reads it. This is the lightweight path for permanent internal reporting today: CI writes `decantr-health.json`, an internal host serves Studio against that artifact, and the report stays under the customer's control. This is distinct from Decantr telemetry and does not create hosted ingestion, auth, retention, or cross-project history.

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
decantr codify --from-audit --style-bridge
decantr codify --map-pattern hero
decantr codify --accept
decantr verify --brownfield --local-patterns
```

The accepted `.decantr/local-patterns.json` is local context and governance. `codify --from-audit` proposals include source snippets, confidence tiers, and likely variants for component families. `codify --map-pattern <slug>` can add a hosted/bundled registry pattern as advisory local law without changing source; it should be filled with project-owned component paths, token/class recipes, variants, and exceptions before acceptance. The accepted `.decantr/rules.json` adds narrow local scans for obvious drift. Deeper deterministic failures such as framework-specific wrapper-only rules should still be enforced through the project rule stack.

## Hybrid Operating Layer

For attached projects that add local law, style bridges, Decantr CSS, sections, pages, features, or themes over time:

```bash
decantr doctor --project apps/web
decantr task /settings "standardize account form buttons" --project apps/web
decantr add section settings-full
decantr refresh
decantr verify --markdown --output .decantr/health.md
```

Project Health is useful immediately after a Hybrid change because it checks whether generated packs, route contracts, accepted local rules, and guard expectations still agree. `doctor` reports the adoption lane, and `task` tells the assistant which authority is active for the route before it edits: existing app, accepted local law, advisory style bridge, Decantr CSS, hosted packs as guidance, or Greenfield context. `verify` and `ci` distinguish accepted local rules, which Decantr can scan, from style-bridge mappings and hosted-pattern mappings, which remain advisory until paired with project-owned rules or the project's lint/test/visual stack.

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
