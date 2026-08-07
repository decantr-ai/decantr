# Project Health CI

Project Health is Decantr's CI-friendly answer to: is this app still aligned with its contract, where did it drift, what loop state is it in, and what should be fixed first?

For the default local workflow in 3.11, bare `decantr verify` runs the smaller zero-write [Changed-UI Assurance](../reference/change-assurance.md) contract. The Project Health workflows below remain the broader gate.

## Install The Gate

```bash
npx @decantr/cli ci init
```

For a monorepo:

```bash
npx @decantr/cli ci init --project apps/web
```

The generated workflow lives at the repository root, installs dependencies with the detected package manager, runs the pinned local CLI command, writes markdown and JSON reports, appends the summary to GitHub Actions, and uploads the artifacts. It defaults to `--fail-on error`, which blocks invalid or error-level findings while keeping warning-level drift visible for triage. Decantr does not generate `@latest` workflows by default; when the CLI is not pinned yet, the installer prints the package-manager command to add it first.

The generated command and report remain v2 unless `--report-version v3` is explicit. To install the Decantr 3.9 Governed Change Proof workflow:

```bash
npx @decantr/cli ci init --project apps/web --report-version v3
```

The GitHub v3 workflow checks out full history, resolves a pull-request or push comparison base, and passes it through `--since`. Package upgrades do not rewrite existing workflows or negotiate v3 automatically.

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
npx @decantr/cli ci --project apps/web --since origin/main --report-version v3 --json
npx @decantr/cli ci --workspace --since origin/main --report-version v3 --json
npx @decantr/cli verify --full --markdown --output decantr-health.md
npx @decantr/cli verify --full --json --output decantr-health.json
```

Use bare `verify` for the changed-UI human/agent loop, `verify --full` for local Project Health, and `ci` for mandatory automation. These commands respect the selected adoption lane: contract-only Brownfield apps keep existing source/style authority, Hybrid local law adds accepted project rules, and style bridges or legacy Decantr CSS are enforced only where explicitly adopted. Workspace runs isolate each attached app.

Default `ci` emits `decantr-ci-report.v2` with the same loop verdict, evidence tier, and authority resolution as local verification. It includes accepted local-rule findings, statically checkable `behavior_obligations`, and style bridge status. `--fail-on error` keeps warning-level local law visible without blocking, while `--fail-on warn` blocks on those warnings once the team has stabilized them.

Explicit CI v3 embeds that existing v2 health evidence and adds:

- `AdoptionTruthV1`: selected app, source provenance, governance coverage, adoption mutation receipts, limitations, and next action.
- `GovernanceDeltaV1`: Git comparison scope and findings partitioned as new, inherited, resolved, or unclassified using stable occurrence fingerprints.
- `change-assurance-report.v1`: the same changed files, app selection, status, and concise findings used by bare verify and MCP action `changes`.
- A fail-closed gate: incomplete change-base, graph, evidence, or compatible baseline proof yields `not_proven`, not an empty delta.
- Workspace project reports plus one deterministic aggregate gate.

CI v3 never creates or updates the baseline. In monorepos, keep `--project <app-path>` explicit unless you intentionally want a workspace aggregate with `--workspace`.

When an adopted Brownfield app has `.decantr/health-baseline.json`, project CI emits the existing v2 `baselineGate`. Findings recorded in that baseline remain visible as inherited debt, but only newly introduced health findings determine the baseline-aware health exit gate. CI v3 additionally requires a complete, compatible private baseline identity before it can prove the delta; otherwise current findings are unclassified and the governance gate is `not_proven`. Local-law and style-bridge failures remain separate.

## Repair With An AI Assistant

```bash
npx @decantr/cli health --prompt <finding-id>
npx @decantr/cli health --project apps/web --prompt <finding-id>
```

The prompt is scoped to one finding. It does not edit files by itself. In monorepos, keep the same `--project` that produced the finding so the prompt resolves against the app, not the workspace root. Give the prompt to the assistant doing the implementation, then rerun Project Health.

Behavior-obligation prompts cite the owning local pattern, the obligation id, the graph local-rule anchor when `.decantr/graph` exists, the file evidence, and the project-owned primitive Decantr expected to see. They are intentionally scoped to strong static signals such as dialog accessible names, visible destructive consequence copy, cancel affordances, submitting guards, label associations, explicit form button types, and project-owned interaction primitives.

When the report says `human_resolution_required`, run `decantr resolve --project apps/web` before asking an assistant to continue. The resolver is read-only by default and prints exact commands for repairing source, accepting observed source into the contract, codifying local law, updating the style bridge, regenerating graph/context, or deferring a finding to the drift log.

## Privacy Boundary

Project Health is local project observability. It does not upload source code, prompts, raw file paths, local route evidence, environment variables, or the report body to Decantr.

See also: [Project Health Reference](../reference/project-health.md), [Telemetry](../reference/telemetry.md).
