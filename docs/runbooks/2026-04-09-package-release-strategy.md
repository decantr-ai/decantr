# Package Release Strategy

Date: 2026-04-09
Status: Historical context

This runbook captures the earlier beta-era release model.

Current policy has moved on:

- the long-lived public beta lane is being removed
- active packages now resolve into stable public, internal-only, experimental, or retired
- see [2026-04-21-package-graduation-consolidation-plan.md](../programs/2026-04-21-package-graduation-consolidation-plan.md) for the current package policy

The sections below are preserved as historical implementation context for the old release strategy.

This runbook defines how the Decantr reset branch should treat npm releases while the product moves from reset work into commercial hardening.

## Goals

- keep the public npm surface aligned with the real vNext product
- stop hardcoded publish drift across packages
- make stable-vs-beta behavior explicit
- leave room to graduate packages out of beta intentionally instead of accidentally

## Current Release Policy

The package source of truth is `config/package-surface.json`.

`docs/reference/package-support-matrix.md` is now generated from the package manifests via `node scripts/sync-package-support-matrix.mjs` and enforced by `pnpm audit:package-surface`.

That generated matrix now also acts as the fastest operator-facing graduation view:

- package release wave and publish order
- stable-candidate flag
- declared blocker count
- graduation lane:
  - `stable-now`
  - `ready-next`
  - `beta-blocked`
  - `experimental-hold`

That file currently defines:

- support status
- maturity
- release wave
- publish order within the wave
- whether a package publishes by default
- default npm dist-tag
- release-readiness state:
  - stable-candidate flag
  - docs / CI / product-integration checks
  - explicit blockers for beta packages
  - semver intent:
    - stable packages should publish non-prerelease versions
    - beta packages should keep prerelease semver until graduation

## Current Release Waves

The reset branch now treats npm releases as explicit waves instead of a flat publish list.

| Wave | Publish order | Packages | Purpose |
| --- | --- | --- | --- |
| `foundation` | `10`-`50` | `@decantr/essence-spec`, `@decantr/registry`, `@decantr/core`, `@decantr/css`, `@decantr/verifier` | schemas, contracts, compiler/runtime, and verification primitives |
| `delivery` | `10`-`20` | `@decantr/mcp-server`, `@decantr/cli` | user-facing delivery surfaces that depend on the foundation layer |
| `experimental` | `10` | `@decantr/vite-plugin` | non-default experiments that should not ride normal publish waves |

Release planning and publish tooling now respect this order automatically.

## Current Dist-Tag Strategy

Default package release policy on this branch:

- `@decantr/cli` -> `latest`
- `@decantr/css` -> `latest`
- `@decantr/essence-spec` -> `beta`
- `@decantr/registry` -> `beta`
- `@decantr/core` -> `beta`
- `@decantr/mcp-server` -> `beta`
- `@decantr/verifier` -> `beta`
- `@decantr/vite-plugin` -> excluded by default

## Why This Split Exists

`@decantr/cli` and `@decantr/css` are already the clearest user-facing surfaces and have relatively stable expectations.

The compiler, schema, registry, MCP, and verifier layers are public and important, but they are still being actively reshaped during the reset. They should remain public while publishing under `beta` until their contracts are intentionally graduated.

`@decantr/vite-plugin` remains experimental and should not ride the default publish wave.

## Workflow Contract

The npm publish workflow now uses `scripts/publish-packages.mjs`, backed by `config/package-surface.json`, instead of a hardcoded shell loop.

Release planning now also has an executable source:

- `pnpm release:plan`
- `pnpm release:graduation-plan`
- `pnpm release:commands`
- `pnpm audit:release-surface`
- `pnpm audit:npm-auth`
- `pnpm audit:npm-surface`
- `node scripts/release-plan.mjs --json`
- `node scripts/release-plan.mjs --wave=foundation`
- `node scripts/release-commands.mjs --wave=foundation`
- `node scripts/release-plan.mjs --summary-markdown=/tmp/package-release-plan.md`
- `node scripts/audit-release-surface.mjs --report-json=/tmp/package-release-audit.json --summary-markdown=/tmp/package-release-audit.md`
- manual GitHub Actions publish runs can now choose:
  - `release_wave`
  - `dist_tag`
  - `include_experimental`
  - `dry_run_only`

The workflow:

- builds and tests the monorepo
- runs `pnpm audit:package-surface`
- runs `pnpm audit:release-readiness`
- writes the selected release plan into the GitHub Actions step summary before publishing
- publishes only the packages marked `publish: true`
- skips experimental packages unless `include_experimental=true`
- publishes in release-wave order from `config/package-surface.json`
- supports `--wave=<wave>` for targeted publish rehearsals
- supports a manual `dist_tag` override for coordinated release waves
- supports `dry_run_only=true` in the publish workflow so a wave can be rehearsed in GitHub Actions without mutating npm
- now also supports `--publish-dry-run` for local artifact preflight:
  - uses `npm publish --dry-run` for versions that are not yet published
  - uses `npm pack --dry-run` for versions that are already on npm, so package-shape validation still works without failing on duplicate-version checks

Retired package handling now uses `config/package-retirements.json` plus:

- `pnpm package:retire:dry-run`
- `node scripts/deprecate-retired-packages.mjs`

The live npm dist-tag surface now also has an executable audit:

- `pnpm audit:npm-auth`
- `pnpm audit:npm-surface`
- `pnpm npm-surface:normalize:dry-run`
- `pnpm npm-surface:normalize`

`pnpm audit:npm-auth` is the fast operational gate for package graduation. It answers the simple question "can this environment actually talk to npm as an authenticated publisher right now?" before dist-tag repair or real publish steps start.

That audit compares `config/package-surface.json` against the real npm registry and flags:

- beta packages promoted on `latest`
- missing expected `beta` dist-tags
- unexpected stray dist-tags
- packages marked `publish: true` that are not published yet

The normalization script is intentionally dry-run first. It can safely automate:

- adding missing `beta` dist-tags when npm `latest` already points to the intended prerelease
- removing stray unexpected dist-tags

It does not automatically retag `latest`; that remains a deliberate manual release-wave decision.
The npm audit and normalization tooling now also report whether a stable fallback version actually exists when `latest` is still pointing at a beta. As of April 9, 2026, the affected beta packages do not have an older stable publish to fall back to, so the `latest` retag work is blocked on intentional stable releases rather than simple dist-tag cleanup.
When run with `--write`, it now also performs an npm auth preflight so broken credentials fail fast before any dist-tag mutation attempt starts.

As of April 9, 2026, the live npm audit also shows concrete drift that should stay visible during graduation review:

- `@decantr/cli` still has stray npm dist-tags `latestnpm` and `latest.`
- `@decantr/core`, `@decantr/essence-spec`, `@decantr/mcp-server`, and `@decantr/registry` are missing their expected `beta` dist-tags while `latest` still points at prerelease versions
- `@decantr/verifier` is not yet published on npm at all

A dedicated GitHub Actions workflow now exists for dist-tag normalization:

- `.github/workflows/npm-surface-normalize.yml`

That workflow supports:

- dry-run reporting with no npm mutation
- write mode through `NPM_TOKEN` for safe executable repairs such as:
  - adding missing `beta` tags where `latest` already points at the intended prerelease
  - removing stray unexpected dist-tags

It intentionally does not retag `latest`; that remains a deliberate stable-release decision.

## What Package Graduation Means

On this branch, package graduation means more than “publish a version.”

A package is only truly graduated when:

1. its public contract is stable enough to move from prerelease semantics to `latest`
2. its blockers in `config/package-surface.json` are cleared intentionally
3. its npm surface is healthy:
   - expected dist-tags exist
   - stray dist-tags are removed
   - `latest` is not accidentally pointing at a prerelease
   - package metadata is publish-clean:
     - `license`
     - `homepage`
     - `repository.directory`
     - `files`
     - `publishConfig.access`
     - normalized `bin` paths when applicable
4. the package can be released in the right wave without confusing the product story

The executable graduation view is now:

- `pnpm release:graduation-plan`

The plain release-wave planning view is now also npm-auth-aware:

- `pnpm release:plan`

And the operator-facing publish handoff is now explicit too:

- `pnpm release:commands --wave foundation`

That report combines:

- release-wave order
- package maturity
- stable-vs-beta intent
- current blockers
- npm drift and tag actions
- npm authentication health
- exact executable npm dist-tag repair commands when the selected wave still has live npm drift

The release planning and publish scripts now accept both `--wave foundation` and `--wave=foundation` style arguments, so the operator examples in this runbook match real shell usage.

It answers four questions directly:

1. which packages are already stable
2. which packages are ready to graduate now
3. which packages are blocked by contract churn
4. which packages are blocked by npm state even if the code is otherwise close

The generated support matrix complements that report by showing the same graduation story directly from `config/package-surface.json`, even before npm-state findings are layered in.

## Ongoing Audit Workflow

A dedicated GitHub Actions workflow now exists for package-governance reporting:

- `.github/workflows/package-release-audit.yml`

That workflow:

- installs the monorepo
- runs `pnpm audit:package-surface`
- runs `pnpm audit:release-readiness`
- runs `pnpm audit:npm-auth` in report-first mode so missing or invalid npm credentials show up as an explicit operational blocker
- runs `pnpm audit:npm-surface` in report-first mode and uploads the raw log even when live npm drift exists
- runs `pnpm npm-surface:normalize:dry-run` so the package audit artifacts include the safe executable dist-tag repair preview alongside the raw npm drift report
- generates a combined package release audit report through `pnpm audit:release-surface`
- generates a dedicated graduation report through `pnpm release:graduation-plan`
- runs real npm publish dry-run preflights for the `foundation` and `delivery` waves through `node scripts/publish-packages.mjs --publish-dry-run --wave=<wave>`
- uploads JSON and Markdown artifacts for drift/release review without requiring npm publish credentials
- uploads npm-surface, normalization-preview, and publish-preflight logs so graduation review includes actual live-registry and package-pack/publish rehearsal output, not just static metadata

It is intentionally report-first: current npm surface drift remains visible in artifacts even when it is not yet being treated as a hard scheduling failure.

## Stable Graduation Rule

A package should move from `beta` to `latest` only when all of the following are true:

1. Its README and npm metadata match the actual supported API.
2. Its schema or runtime contract is covered by CI and docs.
3. The package is actively used by one of the product nucleus surfaces.
4. The release is part of an intentional wave, not a one-off publish.

When a package graduates:

1. update `config/package-surface.json`
2. decide whether it stays in its current release wave or moves into a later stable-delivery wave
3. clear its `releaseReadiness.blockers` and mark it `stableCandidate: true`
4. run `pnpm package-surface:sync` and update this runbook if policy changed
5. update the package version if needed
6. publish with the stable dist-tag

## Remaining Cleanup After This Runbook

This runbook improves forward release discipline, and retired-package handling is now executable, but a few package-surface tasks still remain:

- fix current live npm drift observed on April 9, 2026:
  - `@decantr/essence-spec`, `@decantr/registry`, `@decantr/core`, and `@decantr/mcp-server` are still beta packages effectively riding `latest`
  - `@decantr/cli` has stray npm dist-tags (`latestnpm`, `latest.`)
  - `@decantr/verifier` is now part of the planned public surface but is not yet published
  - `@decantr/verifier` tarball and package metadata now pass `npm publish --dry-run --tag beta`; the remaining blocker is npm auth/publish execution, not package shape
- decide whether `@decantr/core` remains a public low-level package long-term or becomes a more intentionally documented integration surface
- decide whether `@decantr/vite-plugin` should graduate, stay experimental, or be archived

## Verification

Before a release wave:

```bash
pnpm build
pnpm test
pnpm lint
pnpm audit:package-surface
pnpm audit:release-readiness
pnpm audit:release-surface
pnpm audit:npm-auth
pnpm audit:npm-surface
pnpm release:plan
pnpm release:graduation-plan
```

Dry-run the publish selection locally:

```bash
node scripts/release-plan.mjs --json
node scripts/release-plan.mjs --wave=foundation
node scripts/publish-packages.mjs --dry-run
node scripts/publish-packages.mjs --dry-run --wave=foundation
node scripts/publish-packages.mjs --dry-run --include-experimental
pnpm audit:npm-auth
pnpm npm-surface:normalize:dry-run
```

Preflight the actual package artifacts without publishing:

```bash
pnpm release:preflight
node scripts/publish-packages.mjs --publish-dry-run --wave=foundation
node scripts/publish-packages.mjs --publish-dry-run --only=@decantr/verifier
```

For GitHub Actions rehearsals, trigger `.github/workflows/publish.yml` with:

- `release_wave=foundation` to publish or rehearse the dependency base first
- `release_wave=delivery` for CLI/MCP delivery surfaces after the foundation wave is green
- `dry_run_only=true` to exercise the selection logic and summary output without touching npm
