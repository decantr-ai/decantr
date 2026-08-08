# Release Stewardship

Date: 2026-08-07
Status: Active

Release work in Decantr is owned by a boring, procedural Release Steward lane. Publishing is not complete when npm accepts a package. It is complete only when source, npm, git tags, and release notes all agree.

This runbook is the source of truth for Git + npm release closeout in `decantr-monorepo`, including the `@decantr/content` package. The historical `decantr-content` repository is no longer an active release lane.

## Core Rule

No release is done until the final closeout audit passes:

```bash
pnpm release:verify
pnpm release:closeout -- --version X.Y.Z
```

`release:verify` checks the public npm surface. `release:closeout` requires an explicit version and reads the package surface, package manifests, and release note from the exact `vX.Y.Z` tag. It also checks clean git state, local/origin tag parity, tag reachability from `origin/main`, npm version/dist-tag parity, retained/public tarball integrity, available npm provenance, and required lane gates. It never substitutes the current CLI version, HEAD package manifests, or a release note prepared after the tag.

`audit:package-surface` includes the installed permission-surface check. Use `pnpm audit:package-permissions` directly when a change touches package `files` allowlists, filesystem access, network access, process execution, telemetry, hosted upload, MCP write tools, or scanner/audit documentation.

GitHub Releases are optional maintainer packaging. Git tags are not optional.

## Decantr 3.11 Stable Release Gate

Decantr 3.11 publishes directly to `latest`; do not create an RC, `next`, candidate, canary, or alternate package/tag. Its coordinated package wave is exactly:

- `@decantr/verifier`
- `@decantr/mcp-server`
- `@decantr/cli`

In addition to the standard deterministic and package gates below, run `pnpm qualification:3-11:changes`. It proves complete Git change handling, fail-closed app selection, non-production exclusions, bounded findings, CLI/explicit-CI-v3/MCP parity, and the unchanged eight-tool MCP surface over disposable repositories. It does not prove finding precision/recall, real adoption value, or model lift.

The 3.11 release is complete only after the `v3.11.3` source tag, retained canonical tarballs, npm `latest` and provenance, public-package verification, GitHub Release, release-note parity, and `release:closeout -- --version 3.11.3` all agree.

Before tagging or publishing, run the standard commands below plus:

```bash
pnpm qualification:3-11:changes
```

## Historical Decantr 3.10 Stable Release Gate

Decantr 3.10 publishes directly to `latest`; do not create an RC, `next`, candidate, canary, or alternate package/tag. Product publication is intentionally separate from the optional frontier-model lift experiment. A stable 3.10 release requires deterministic build/test coverage, active-documentation alignment, package surface and permission audits, clean-consumer content/MCP checks, tag-bound retained tarballs, npm provenance, public verification, and final closeout. It does not authorize precision, recall, adoption-proof, or measured model-improvement claims.

Before tagging or publishing, run:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm biome:check
pnpm audit:docs-marketing
pnpm audit:docs-drift
pnpm audit:public-links
pnpm audit:package-surface
pnpm audit:package-permissions
pnpm audit:packed-content-facade
pnpm audit:packed-mcp-server
pnpm audit:release-readiness
pnpm audit:content-package
pnpm audit:public-api -- --core-only --fail-on-error
pnpm release:preflight
pnpm release:commands
```

The coordinated 3.10.0 package wave is:

- `@decantr/content`
- `@decantr/registry`
- `@decantr/core`
- `@decantr/verifier`
- `@decantr/mcp-server`
- `@decantr/cli`

`@decantr/essence-spec`, `@decantr/css`, `@decantr/telemetry`, and `@decantr/vite-plugin` are not version-bumped solely for alignment. The separate frozen A/B harness may support a future bounded model-lift claim; its incomplete state does not block an honestly described product release.

`pnpm release:evidence` gates known vulnerabilities against the selected package importers and their installed dependency paths. Its JSON report also preserves full-workspace findings as diagnostics, but private apps and unrelated development surfaces do not redefine the npm publication closure. Missing findings, missing paths, unknown importer formats, malformed audit output, and audit transport failures remain fail-closed.

## Historical Decantr 3.9 Stable Release Gate

Decantr 3.9.0 publishes straight to the stable channel. Do not create an RC, `next`, `candidate`, canary, or alternate 3.9.0 package/tag. Implementation completeness is not release qualification. Decantr currently has one human maintainer, so stable 3.9.0 publication may use the version-bound sole-maintainer waiver without representing an agent, alias, or duplicate identity as an independent reviewer.

Before tagging or publishing, run:

```bash
pnpm audit:3-9-qualification:lint
pnpm qualification:3-9:route
pnpm qualification:3-9:machine
pnpm qualification:3-9:human:lint
pnpm audit:packed-content-facade
pnpm audit:packed-mcp-server
pnpm audit:3-9-release-gate
```

`audit:3-9-qualification:lint` validates packet structure only. The default `audit:3-9-qualification` command remains the fail-closed quantitative claim gate: it exits zero only when two actual human reviewers, the adjudicated 200-judgment finding corpus, both finding replays, and all machine evidence are complete. It must continue to report `INCOMPLETE` for the sole-maintainer release and is never publication authorization by itself.

`audit:3-9-release-gate` is the publication gate. It accepts either a fully human-qualified packet or `fixtures/qualification/3.9/release-waiver.json` with exactly the four frozen human finding requirements still marked missing. The waiver must match the stable 3.9.x release target, name the sole maintainer, retain complete route, machine, adoption/Studio, package, provenance, and tarball evidence, and set `qualificationClaim: false`. It cannot waive a machine failure or authorize finding precision, finding recall, release-qualification, or adoption-proven claims. Never convert a missing gate into a passing claim by weakening either audit or relabeling generated assertions as human evidence.

Use `node scripts/prepare-3-9-human-review.mjs --help` if Decantr later obtains two independent human reviewers and wants to make quantitative qualification claims. Its blank workbooks remain non-evidence; `qualification:3-9:human:lint` checks their structure, while `qualification:3-9:human` fails until both signed human reviews, all 200 adjudications, and both finding replays are complete and hash-bound.

For a 3.9 tag, `pnpm audit:release-readiness` detects public packages on that line and runs the historical release-evidence gate. Readiness fails unless either full qualification or the exact version-bound sole-maintainer waiver is valid.

The intended 3.9.0 package wave is:

- `@decantr/content`
- `@decantr/registry`
- `@decantr/core`
- `@decantr/verifier`
- `@decantr/mcp-server`
- `@decantr/cli`

Release tooling remains authoritative for the final dependency closure. `@decantr/essence-spec`, `@decantr/css`, `@decantr/telemetry`, and `@decantr/vite-plugin` are not version-bumped solely for alignment.

## Monorepo Release Flow

Use project scripts rather than direct package commands:

```bash
git status --short --branch
git fetch --tags origin main
pnpm install
pnpm build
pnpm test
pnpm audit:package-surface
pnpm audit:package-permissions
pnpm audit:packed-content-facade
pnpm audit:packed-mcp-server
pnpm release:preflight
pnpm release:commands
```

Publish through the wrapper command produced by `pnpm release:commands`; do not publish public Decantr packages with a bare `npm publish`. Direct `pnpm publish` remains compatible with historical unprotected patch manifests, but every configured protected release lane requires the wrapper sentinel. The wrapper is the normal stable publish entry point and reruns every lane-specific gate for real and publish-dry-run attempts. It creates one canonical publish tarball from each pnpm package snapshot using the same shared deterministic archive helper as enterprise evidence: sorted paths and manifest keys, fixed timestamps, portable ownership/modes, and deterministic gzip. It audits the manifest, records applicable historical qualification policy, moves the `.tgz` into a content-addressed retained set outside the worktree, rechecks SHA-256/SHA-512 immediately before each attempt, and gives that exact tarball path to `pnpm publish`. OIDC failure and token fallback reuse the same bytes. Selection-only `--dry-run` remains available for planning and does not imply release readiness.

The default retained root is the platform temporary directory under `decantr-release-staging`. Use `--staging-dir=/absolute/path` or `DECANTR_RELEASE_STAGING_DIR` to choose another location outside the repository. Preflight and real publish commands emitted together by `release:commands` share that location. Never delete the selected manifest/tarballs until closeout evidence has been retained.

When `--only` is present, the wrapper expands it through transitive internal `dependencies`, `peerDependencies`, and `optionalDependencies`. It fails on unknown, non-publishable, excluded experimental, or wave-conflicting roots. `release:commands` uses that same selection and emits a verification command containing the effective closure; closeout and announcements independently recompute the closure from the tagged manifests.

The GitHub `Publish` workflow defaults to `publish_auth_strategy=auto`: it tries npm trusted publishing through GitHub OIDC first, then retries the current package once with `NPM_TOKEN` when that secret is available. Manual dispatch must run the workflow definition from `refs/heads/main` and provide an existing `release_tag`. The job checks out that tag, requires the checked-out commit and local/remote tag to match, verifies fetched `origin/main` against the live remote main ref, rejects tags not reachable from `origin/main`, uploads the retained qualified tarball set, and runs under the `npm-production` GitHub environment. Configure required reviewers and deployment-branch protection on that environment; repository secrets alone do not provide an approval boundary. Use `publish_auth_strategy=oidc` to require trusted publishing only, or `publish_auth_strategy=token` for an explicit token-only recovery run.

The workflow resolves its package selection once and replays the same filter through release planning, evidence, publishing, public verification, and closeout. A wave-only request remains `--wave=<wave>`; its package names are summary data and must not be reinterpreted as `--only`, because that would expand internal dependency closure and retain unrelated package tarballs. An explicit `--only` request is expanded once and downstream stages receive that effective closure. The retained staging manifest must therefore match the selected wave or explicit closure exactly.

For npm trusted publishing, every published package must have a matching trusted publisher in npm package settings:

- Publisher: GitHub Actions
- Organization/repository: `decantr-ai/decantr`
- Workflow filename: `publish.yml`
- Allowed action: `npm publish`

Use the repo helper to configure or audit the intended npm trusted-publishing relationship across the publishable Decantr package set:

```bash
pnpm npm:trust:plan
pnpm npm:trust:configure
```

`npm:trust:plan` uses `npm trust github ... --dry-run` and does not mutate npm package settings. `npm:trust:configure` uses the same selected package surface without `--dry-run`; npm may require a browser-based account confirmation before it can change trusted-publisher settings. Granular access tokens with bypass 2FA are not enough for `npm trust`; use an interactive account session when npm requests browser confirmation:

```bash
pnpm npm:trust:configure -- --interactive
```

The workflow uses the `npm-production` GitHub environment. Configure the same environment claim in npm trusted publishing:

```bash
pnpm npm:trust:plan -- --environment npm-production
pnpm npm:trust:configure -- --environment npm-production --interactive
```

Create and push the release tag before publication, then dispatch the workflow from `main` against that tag:

```bash
git tag vX.Y.Z <release-commit>
git push origin vX.Y.Z
gh workflow run publish.yml \
  --repo decantr-ai/decantr \
  --ref main \
  -f release_tag=vX.Y.Z
```

The non-dry-run workflow publishes, verifies npm, reruns tag-bound closeout, and uploads both package evidence and the closeout JSON. Before announcing locally, the same closeout must pass:

```bash
pnpm release:verify
pnpm release:closeout -- --version X.Y.Z
pnpm release:announce -- --version X.Y.Z --send
```

For a targeted package release, keep the same filters across planning, publishing, verification, and closeout:

```bash
pnpm release:commands --only=@decantr/cli
pnpm release:closeout -- --only=@decantr/cli --version X.Y.Z
pnpm release:announce -- --only=@decantr/cli --version X.Y.Z --send
```

Use the preflight, publish, and verify commands emitted by `release:commands`; its verify command contains the expanded closure. Passing the root-only filter directly to `release:verify` does not perform dependency expansion.

If the tag workflow fails with npm `E404` / "could not be found or you do not have permission" during OIDC publishing, first verify the package's npm trusted-publisher settings. If the release is time-sensitive and `NPM_TOKEN` is configured as a GitHub Actions secret, rerun the workflow with `publish_auth_strategy=token` or run the wrapper locally after npm 2FA:

```bash
node scripts/publish-packages.mjs --only=@decantr/telemetry --auth-strategy=token
pnpm release:verify -- --only=@decantr/telemetry
pnpm release:closeout -- --only=@decantr/telemetry --version X.Y.Z
```

A real local protected-lane publish is allowed only from a clean checkout whose `HEAD` is the version-derived stable tag. The local tag and remote tag must resolve to `HEAD`; the tag must be reachable from `origin/main`; fetched `origin/main` must equal the live remote main ref. The wrapper refreshes and verifies those refs before the release gates, after the gates, and after tarball staging. `--publish-dry-run` remains nonpublishing and selection-only `--dry-run` remains available for planning, but neither is authorization to bypass the real-publish source check.

## Prerelease Channel

Historical or future preview lines outside the protected stable lanes use npm `next` and an explicit package-surface channel. Decantr 3.9, 3.10, and 3.11 are explicitly excluded: they have no RC, candidate, or `next` lane. Do not repurpose the stable package lane silently.

For a prerelease package line:

1. package versions use prerelease semver, such as `3.0.0-next.0`
2. `config/package-surface.json` sets `releaseChannel: "prerelease"` for the affected publishable packages
3. those package-surface entries set `defaultDistTag: "next"`
4. `pnpm audit:package-surface` passes before any publish dry-run
5. `latest` remains on the previous stable line until the flip criteria are met

Use a single tag override consistently when previewing or verifying a prerelease:

```bash
pnpm release:commands -- --tag next
pnpm release:preflight -- --tag next
pnpm release:verify -- --tag next
pnpm release:closeout -- --tag next --version 3.0.0-next.0
```

`--tag next` is shorthand for `--tag-override=next` in the release scripts. The package-surface `defaultDistTag` should still be updated to `next` before a real prerelease so closeout evidence describes the intended channel without relying on memory.

See [Decantr 3 Prerelease Runbook](decantr-3-prerelease.md) for the hard-cut release structure.

## Community Announcement

Community release announcements are a distribution step, not release truth. Run them only after `release:verify` and `release:closeout` pass.

`pnpm release:announce` builds a `repository_dispatch` payload for `decantr-ai/community-ops`, including the version, tag commit, tagged release-note blob and markdown, and tagged package versions. It requires an explicit version and a matching local tag; there is no HEAD fallback. It dry-runs by default:

```bash
pnpm release:announce -- --version 3.0.0-next.0 --only=@decantr/cli,@decantr/mcp-server,@decantr/verifier --json
```

To post through the community automation, set `COMMUNITY_OPS_DISPATCH_TOKEN` to a GitHub token that can create `repository_dispatch` events on `decantr-ai/community-ops`, then send:

```bash
pnpm release:announce -- --version 3.0.0-next.0 --only=@decantr/cli,@decantr/mcp-server,@decantr/verifier --send
```

`community-ops` owns Discord and X credentials plus message formatting. The dispatcher makes the payload tag-bound, but operators must still retain the successful closeout report before a live send; announcement delivery is not a substitute for closeout. A live community announcement posts to both Discord and the official Decantr X account; it should fail before posting if either required channel credential set is missing.

The same dispatch is also available from the `Community Release Announcement` GitHub workflow. Prefer this workflow when the dispatch token lives in GitHub Actions secrets instead of the local shell:

```bash
gh workflow run community-release-announcement.yml \
  --repo decantr-ai/decantr \
  --ref main \
  -f version=3.0.0-next.0 \
  -f only_packages=@decantr/cli,@decantr/mcp-server,@decantr/verifier \
  -f release_note=docs/releases/2026-05-23-decantr-3-next-foundation.md \
  -f target_repo=decantr-ai/community-ops \
  -f event_type=decantr_release_published \
  -f send=false
```

Run it in dry-run mode first, then rerun with `send=true` after closeout has passed. If that workflow fails with `403 Resource not accessible by personal access token`, the `COMMUNITY_OPS_DISPATCH_TOKEN` secret exists but does not have cross-repo `repository_dispatch` access to `decantr-ai/community-ops`.

To test the token without posting a community announcement, dispatch a probe event type that `community-ops` does not listen to:

```bash
gh workflow run community-release-announcement.yml \
  --repo decantr-ai/decantr \
  --ref main \
  -f version=3.0.2 \
  -f release_note=docs/releases/2026-05-28-decantr-3-0-2-homepage-release-hardening.md \
  -f event_type=decantr_release_access_probe \
  -f send=true
```

When cross-repo dispatch is blocked, trigger the receiver workflow directly from `community-ops`. The workflow file is still `discord-release.yml` for compatibility, but the live workflow posts both Discord and X:

```bash
git show v3.0.0-next.0:docs/releases/2026-05-23-decantr-3-next-foundation.md > /tmp/decantr-v3.0.0-next.0-release-note.md
gh workflow run discord-release.yml \
  --repo decantr-ai/community-ops \
  --ref main \
  -f version=3.0.0-next.0 \
  -f tag=v3.0.0-next.0 \
  -f repo=decantr-ai/decantr \
  -f release_note_path=docs/releases/2026-05-23-decantr-3-next-foundation.md \
  -f release_url=https://github.com/decantr-ai/decantr/releases/tag/v3.0.0-next.0 \
  -f packages='@decantr/cli@3.0.0-next.0,@decantr/mcp-server@3.0.0-next.0,@decantr/verifier@3.0.0-next.0' \
  -F changelog_markdown=@/tmp/decantr-v3.0.0-next.0-release-note.md \
  -f dry_run=false
```

Always pass `changelog_markdown` on the receiver fallback, but materialize it from the release tag rather than the working tree:

```bash
git show vX.Y.Z:docs/releases/YYYY-MM-DD-release-X-Y-Z.md > /tmp/decantr-vX.Y.Z-release-note.md
```

Use that temporary file with `-F changelog_markdown=@/tmp/decantr-vX.Y.Z-release-note.md`. A note that is absent from the release tag is not announcement evidence.

That direct receiver path uses `community-ops` repository secrets, including `DISCORD_RELEASE_WEBHOOK_URL`, `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, and `X_ACCESS_TOKEN_SECRET`, and does not require the source repo dispatch token.

## Closeout Audit

`pnpm release:closeout` runs `scripts/audit-release-closeout.mjs`.

It verifies:

- an explicit target release version; there is no package-manifest or HEAD fallback
- clean worktree unless `--allow-dirty` is explicit
- local tag `vX.Y.Z`
- pushed origin tag `vX.Y.Z`
- local and origin tags resolve to the same commit
- tag commit is reachable from `origin/main`
- the exact tag contains a release note for the target version
- the package surface and selected package versions come from the exact tag
- `--only` expands to the tag's transitive internal dependency closure
- each selected publishable package version exists on npm
- each selected package default dist-tag points at the tagged manifest version
- for 3.9, the retained staging manifest is bound to the release tag, commit, package closure, tagged release-evidence mode, waiver path when applicable, and packet tarball hashes
- every retained tarball still matches its staged SHA-256, SHA-512, and SHA-1 identity
- the public npm tarball bytes match the retained SHA-256 and npm `dist.integrity` / `dist.shasum`
- OIDC-published packages expose an npm SLSA v1 subject whose SHA-512 and Decantr publish-workflow source resolve to the release commit; token fallback remains valid and is reported without inventing provenance
- npm's native `npm audit signatures` check cryptographically verifies registry signatures and available provenance for an exact install of the selected public package versions
- required 3.9 packed-facade and release-evidence gates pass from a clean checkout whose HEAD is the release-tag commit

The audit does not scan unrelated release notes on current HEAD. A prepared, unreleased 3.9 note therefore cannot make an earlier 3.8 closeout demand a nonexistent 3.9 tag.

Useful variants:

```bash
pnpm release:closeout -- --version 2.9.6
pnpm release:closeout -- --only=@decantr/cli --version 2.9.6
pnpm release:closeout:json -- --version 2.9.6
node scripts/audit-release-closeout.mjs --skip-npm --version 2.9.6
node scripts/audit-release-closeout.mjs --version 3.9.0 --staging-manifest=/absolute/path/to/manifest.json
```

Use `--skip-npm` only when auditing tag/docs parity before publishing. Never use it as final release evidence. For 3.9, `--allow-dirty` cannot substitute for the clean tag checkout required to execute closeout gates.

## Release Notes And Tags

When adding a versioned release note under `docs/releases/`, prefer a filename that includes the version:

```text
docs/releases/YYYY-MM-DD-short-title-2-9-6.md
```

Closeout searches only the requested release tag for the requested version. If a release note is intentionally not a package release, avoid a version suffix in the filename so operators do not mistake it for package-release evidence.

## Dangerous Operations

The Release Steward must ask for explicit user approval before:

- publishing to npm
- changing npm dist-tags
- creating, deleting, or moving git tags
- force-pushing
- deploying or closing external production infrastructure such as Fly, Vercel, Supabase, Stripe, PostHog, DNS, or MCP directory submissions

If approval was already explicit in the user request, proceed through the scripted path and still run closeout.

## Content Package Flow

Official content lives in `packages/content` as the public `@decantr/content` package. Its closeout is about package readiness, content health, content provenance, CLI/API alignment, and the packed compatibility facade:

```bash
pnpm install
pnpm --filter @decantr/content validate
pnpm --filter @decantr/content content:health:json
pnpm --filter @decantr/content content:health:suppressions
pnpm --filter @decantr/content content:intelligence
pnpm audit:content-package
pnpm audit:packed-content-facade
```

Hosted registry sync and pruning workflows are retired. `@decantr/registry` delegates to content-owned implementations and preserves Decantr 3.x imports, schemas, client names, and `REGISTRY_URL`; it is not an independent content release lane. Content changes ship through monorepo release, npm package publication, and Fly content API deployment.

The archived `decantr-content` repository should point contributors to `decantr-ai/decantr/packages/content`.

## Agent Contract

Any AI assistant working on Decantr release tasks must use the Release Steward lane:

1. identify the repo (`decantr-monorepo`; the historical `decantr-content` repo is archived after 3.8 release)
2. use scripts as the source of truth
3. keep filters consistent across publish and verify commands
4. update release notes and docs in the same branch
5. for 3.9, distinguish the fail-closed quantitative qualification claim from the sole-maintainer publication gate
6. run closeout before saying the release is done
7. report any skipped check as a real residual risk
