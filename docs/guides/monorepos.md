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

`setup` and `workspace list` are non-mutating orientation commands. Before adoption, `setup` shows app candidates and the one attach command. After at least one app is attached, `setup` becomes a workspace dashboard that points at `doctor`, `task`, `verify`, and `ci init` for the attached app instead of telling you to adopt again. `adopt --project apps/web --yes` writes the Brownfield contract, hydrates hosted packs when online, and keeps `.decantr/*` context inside the app, while `.github/workflows/*` and workspace package-manager commands remain rooted at the repository root. Use `--no-packs` or offline mode when pack hydration should be deferred.

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

`doctor` reports the essence version, workflow mode, adoption mode, adoption lane, generated context state, local pattern/rule files, design authority signals, visual evidence, CI wiring, and an ordered next-step queue. If an app has accepted local law, a style bridge, or Decantr CSS active, doctor calls that Hybrid lane out explicitly so a monorepo teammate does not have to infer authority from scattered files. If an app is still on an older essence shape, run the explicit migrator:

Workspace discovery favors deployable UI apps. Server-only API packages and React component libraries under `packages/*` are not suggested as Brownfield app candidates unless they expose a frontend app config such as Next, Vite, SvelteKit, Angular, or Astro.

In contract-only Brownfield, hosted packs are optional context. If you attach with `--no-packs` or offline mode, `doctor`, `health`, and `refresh --check` should not make pack hydration the next required step. If a `pack-manifest.json` exists and references missing files, hydrate the app-scoped pack bundle from the monorepo root with the app essence path:

```bash
pnpm exec decantr registry compile-packs apps/web/decantr.essence.json --write-context
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
- `.decantr/local-patterns.json` after `decantr codify --accept`
- `.decantr/rules.json` after `decantr codify --accept`
- `.decantr/style-bridge.json` after accepting a reviewed style bridge
- root `.github/workflows/decantr-ci.yml` or your edited internal pipeline hook

Treat `.decantr/local-patterns.proposal.json`, `.decantr/rules.proposal.json`, `.decantr/style-bridge.proposal.json`, `.decantr/evidence/*`, `.decantr/ci/*`, and `.decantr/health-baseline-diff.json` as review/local/CI artifacts unless your team intentionally archives them.

See also: [Existing Apps](existing-apps.md), [Project Health CI](project-health-ci.md), [Workflow Model](../reference/workflow-model.md).
