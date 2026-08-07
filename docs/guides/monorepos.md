# Decantr In Monorepos

Install Decantr where dependencies are managed, then attach Decantr to the app that owns the UI contract.

For most pnpm/Turbo/Nx workspaces, that means:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr setup
pnpm exec decantr workspace list
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
```

`setup` and `workspace list` are non-mutating orientation commands. Before adoption, `setup` shows app candidates and the attach command. After adoption, it points at the day-two loop. `adopt --project apps/web --yes` writes the Brownfield contract and compact app-scoped context. Bulk content packs require explicit `--packs`. Brownfield and Hybrid adoption do not create or edit `.prettierignore`; formatter configuration remains owned by the host workspace.

Decantr 3.7 introduced the read-only discovery substrate that Decantr 3.9 now projects through `AdoptionTruthV1` for scan/setup/workspace/adopt/doctor/opt-in CI v3/MCP/Studio. When you pass `--project apps/web`, discovery walks upward to find the package manager and repository-level assistant rules, while framework, language, routes, components, and styling stay app-scoped. Formal TanStack route source outranks generated trees, nested React Router objects resolve lazy implementation files, and pathname-only fallback routes carry medium confidence. Angular app selection uses the matching workspace project root and configured build entry, not the workspace package name or a sibling/test route file; route authority is proven only through the selected bootstrap import graph. The contract records provenance and limitations for those facts instead of allowing sibling apps or root HTML to contaminate the selected app.

In a mixed Angular/React workspace, scan and attach each app independently. An Angular result must show `proven` authority and `complete` extraction before adoption. If it does not, inspect `routes.authorityFiles`, `routes.evidence`, `routes.signals`, and `routes.excludedSourceCount`; do not baseline the workspace on inferred routes. Angular `adopt` and existing-app `init` refuse unproven discovery unless `--force` is explicit, and CI v3 reports `not_proven` rather than gating on a fictional route map.

For Next.js workspace apps in 3.10, file routes and deployment reachability are separate. Root or `src/` middleware/proxy files and reachable local policy helpers can leave a page discoverable but make it non-taskable. If path-dependent 4xx policy cannot be resolved statically, route authority becomes inferred/partial and task preparation blocks. Styling authority follows production import order across workspace package exports and app-local overrides; a dependency or the first CSS file found is not enough.

## Root vs App

The repository root is for dependency installation, workspace scripts, CI workflows, and aggregate workspace health.

The app root is for `decantr.essence.json`, `DECANTR.md`, `.decantr/project.json`, generated route context, accepted local laws, browser evidence, and app-scoped health.

Keep app-scoped commands explicit from the root:

```bash
pnpm exec decantr doctor --project apps/web
pnpm exec decantr task /settings "tighten account form validation" --project apps/web
pnpm exec decantr verify --project apps/web
pnpm exec decantr ci --project apps/web
```

The same rule applies to advanced primitives. `health`, `status`, `upgrade`, `add`, `remove`, `theme`, `export`, `suggest`, `magic`, `rules`, and `telemetry` honor `--project <path>` instead of falling back to the workspace root. Task context, local-law summaries, and refresh change summaries print paths you can open from the workspace root. Absolute `--project` paths are resolved from the target app's workspace, not from whichever monorepo you happen to be standing in. If a path does not exist, Decantr fails immediately. If a path points at a component package that is not a deployable app candidate, Brownfield adoption refuses it unless you explicitly opt into that unusual package attach with `--force-package`.

`task` also requires the selected app's typed graph to be current. Its first route read target is the implementation source resolved by shared discovery, followed by ordered route authority, workspace/app styling, advisory evidence, and graph/context artifacts. Generated `.decantr` changes do not count as source impact. Regenerate with the app-scoped graph command when task reports missing or stale artifacts.

In 3.9, CLI and MCP task compatibility fields come from one `TaskCapsuleV1`. Its project identity is clone-independent, every exposed path is workspace-relative, the implementation source is the required rank-one target, and changed-file graph impact is scoped back to the selected app. The compact canonical capsule has a 12,000-byte / 4,000 deterministic-token ceiling.

Use workspace mode only when you intentionally want an aggregate view:

```bash
pnpm exec decantr workspace list
pnpm exec decantr workspace health --changed --since origin/main
pnpm exec decantr ci --workspace --changed --since origin/main
```

## CI

Use the dedicated CI command as the required automation gate:

```bash
pnpm exec decantr ci init --project apps/web
pnpm exec decantr ci --project apps/web
```

`ci init` writes a root `.github/workflows/decantr-ci.yml`, detects the package manager, installs dependencies at the workspace root, and runs the pinned local CLI command, for example `pnpm exec decantr ci --project apps/web`. It does not generate `@latest` workflows. If the root package has not pinned Decantr yet, `ci init` prints the exact command to run, such as `pnpm add -D -w @decantr/cli`.

For an adopted Brownfield app with a saved health baseline, the project CI report includes `baselineGate`. Inherited findings stay visible, but only new findings determine the project gate's exit code. Workspace aggregate gates retain their existing aggregate semantics.

That is the default v2 behavior. Governed-change CI v3 is explicit:

```bash
pnpm exec decantr ci --project apps/web --since origin/main --report-version v3 --json
pnpm exec decantr ci --workspace --since origin/main --report-version v3 --json
pnpm exec decantr ci init --project apps/web --report-version v3
```

Each v3 workspace project carries its own `AdoptionTruthV1` and `GovernanceDeltaV1`; the aggregate gate counts passing, failing, and `not_proven` projects deterministically. A missing/stale/incompatible baseline or unresolved change evidence remains non-passing unless `--fail-on none` is explicit. Existing workflows and commands remain v2 until `--report-version v3` is supplied.

If GitHub Actions is not your authoritative CI system, generate a portable snippet:

```bash
pnpm exec decantr ci init --provider generic --project apps/web
```

Paste `.decantr/ci/decantr-ci.sh` into Jenkins, Please, Buildkite, GitLab, Azure DevOps, or your internal pipeline after your normal dependency install step.

## Multiple Apps

Attach each UI app independently:

```bash
pnpm exec decantr adopt --project apps/admin --yes
pnpm exec decantr adopt --project apps/marketing --yes
pnpm exec decantr adopt --project apps/customer --yes
```

Then decide whether CI should gate individual apps or the workspace aggregate:

```bash
pnpm exec decantr ci init --project apps/admin
pnpm exec decantr ci init --workspace
```

Use app gates when teams own apps independently. Use the workspace gate when one pull request can affect many Decantr contracts and branch protection should see one aggregate result.

## Existing Or Stale Decantr Files

When you are not sure whether an app is already attached, start with `doctor`:

```bash
pnpm exec decantr doctor --project apps/web
```

`doctor` reports the essence version, workflow mode, adoption mode, adoption lane, generated context state, local pattern/rule files, design authority signals, visual evidence, CI wiring, and an ordered next-step queue. If an app has accepted local law, a style bridge, or the legacy Decantr CSS adapter active, doctor calls that Hybrid lane out explicitly so a monorepo teammate does not have to infer authority from scattered files. If an app is still on an older essence shape, run the explicit migrator:

Workspace discovery favors deployable UI apps. Server-only API packages and React component libraries under `packages/*` are not suggested as Brownfield app candidates unless they expose a frontend app config such as Next, Vite, SvelteKit, Angular, or Astro.

In contract-only Brownfield, content API packs are optional context and adoption leaves bulk hydration off by default. `doctor`, `health`, and `refresh --check` should not make pack hydration the next required step. Use `decantr adopt --packs` only when you want the full local page/review pack set. If a `pack-manifest.json` exists and references missing files, hydrate the app-scoped pack bundle from the monorepo root with the app essence path:

```bash
pnpm exec decantr content compile-packs apps/web/decantr.essence.json --write-context
```

The generated `.decantr/context` directory is written beside `apps/web/decantr.essence.json`, not at the repository root.

Project Health and CI remediation prompts use the same app-scoped posture. From the root, missing-pack fixes should mention `apps/web/decantr.essence.json`, and CI summaries should recommend `decantr ci --project apps/web --fail-on error`.

Health prompt commands are app-scoped too. If `decantr health --project apps/web` prints `decantr health --project apps/web --prompt <finding-id>`, that prompt should resolve from the same app without requiring you to `cd` into it.

```bash
cd apps/web
pnpm exec decantr migrate --to v4
```

Pre-V4 essences are migration inputs, not active contracts.

## Browser Evidence

`--base-url` is optional. It only matters when the app is running and you want local screenshot evidence:

```bash
pnpm exec decantr verify --project apps/web --base-url http://localhost:3000 --evidence
```

Screenshots stay local under `.decantr/evidence/screenshots/` and are surfaced to task context as references.

## What To Commit

Commit canonical Decantr files and accepted local law:

- `decantr.essence.json`
- `DECANTR.md`
- `.decantr/project.json`
- `.decantr/README.md`
- `.decantr/context/*`
- `.decantr/local-patterns.json` after `decantr codify --accept --confirm-reviewed`
- `.decantr/rules.json` after `decantr codify --accept --confirm-reviewed`
- `.decantr/style-bridge.json` after `decantr codify --accept --confirm-reviewed --accept-style-bridge`
- existing formatter configuration remains unchanged during Brownfield/Hybrid adoption
- root `.github/workflows/decantr-ci.yml` or your edited internal pipeline hook

Treat `.decantr/local-patterns.proposal.json`, `.decantr/rules.proposal.json`, `.decantr/style-bridge.proposal.json`, `.decantr/evidence/*`, `.decantr/ci/*`, and `.decantr/health-baseline-diff.json` as review/local/CI artifacts unless your team intentionally archives them.

See also: [Existing Apps](existing-apps.md), [Project Health CI](project-health-ci.md), [Workflow Model](../reference/workflow-model.md).
