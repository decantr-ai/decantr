# Decantr 2.9.3 Brownfield Command Consistency

Decantr 2.9.3 is a Brownfield hardening patch for monorepo and contract-only adoption.

## What Changed

- App-scoped primitives now honor `--project <path>` consistently, including `health`, `status`, `upgrade`, `add`, `remove`, `theme`, `export`, `suggest`, `magic`, `rules`, and `telemetry`.
- `decantr add page <section>/<page>` writes a route mapping, either from `--route` or a derived route, so new pages are immediately usable by `decantr task <route>`.
- Project Health prompt commands preserve monorepo scope: `decantr health --project apps/web --prompt <finding-id>` resolves against the same app that produced the finding.
- Legacy `decantr health init-ci` now routes to `decantr ci init`, so generated CI uses the pinned local CLI command instead of the old `@latest` workflow.
- Brownfield adoption rejects nonexistent project paths and obvious component-package targets unless the user explicitly forces a package attach.
- Unsupported flags on local-law/content-author flows fail before writing proposals or artifacts.
- Browser evidence writes a clearer message when Playwright is missing, while still writing static evidence.
- `decantr suggest --project <path>` surfaces accepted project-owned local patterns before registry suggestions.
- `decantr suggest --from-code` can derive a query from `--route` or `--file`, and monorepo-root file paths under the selected project are normalized to app-local paths.
- `decantr setup` now switches to a post-adoption dashboard when a monorepo already has attached projects, recommending `doctor`, `task`, `verify`, and `ci init` instead of re-adoption.
- `decantr magic --project <path>` now steers already attached apps into task-time context instead of telling users to remove `decantr.essence.json`.
- `decantr task --project <path>` and `decantr refresh --project <path> --list-changes` print paths that are directly usable from the monorepo root.
- Contract-only/offline Brownfield flows treat missing hosted packs as optional context. Health reports deferred packs as info, Doctor does not make hydration the next required step, and `refresh --check` does not fail solely because packs were intentionally deferred.
- Doctor now surfaces an unpinned root `@decantr/cli` dependency as an info finding with the exact package-manager install command before users rely on CI.
- Project Health flags route-less contract pages and page-pack count drift after page add/remove flows.
- The verifier now tolerates partial review-pack artifacts and treats Next.js static/document output as framework-rendered HTML instead of requiring a Vite-style `id="root"` mount point.

## Packages

- `@decantr/cli`: `2.9.3`
- `@decantr/verifier`: `2.3.3`

No Essence or public schema changes are required. Existing 2.9.x Brownfield projects can upgrade in place. Re-run `decantr doctor --project <app>` and `decantr verify --project <app>` after upgrading to confirm local state.
