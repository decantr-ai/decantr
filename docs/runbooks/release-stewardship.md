# Release Stewardship

Date: 2026-05-15
Status: Active

Release work in Decantr is owned by a boring, procedural Release Steward lane. Publishing is not complete when npm accepts a package. It is complete only when source, npm, git tags, and release notes all agree.

This runbook is the source of truth for Git + npm release closeout in `decantr-monorepo`, and for registry-content publish closeout in `decantr-content`.

## Core Rule

No release is done until the final closeout audit passes:

```bash
pnpm release:verify
pnpm release:closeout
```

`release:verify` checks the public npm surface. `release:closeout` checks the release wrapper around it: clean git state, local/origin tag presence, tag reachability from `origin/main`, release-note parity, and npm version/dist-tag parity for publishable packages.

`audit:package-surface` includes the installed permission-surface check. Use `pnpm audit:package-permissions` directly when a change touches package `files` allowlists, filesystem access, network access, process execution, telemetry, hosted upload, MCP write tools, or scanner/audit documentation.

GitHub Releases are optional maintainer packaging. Git tags are not optional.

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
pnpm release:preflight
pnpm release:commands
```

Publish through the wrapper command produced by `pnpm release:commands`; do not publish public Decantr packages with a bare `npm publish`.

The GitHub `Publish` workflow defaults to `publish_auth_strategy=auto`: it tries npm trusted publishing through GitHub OIDC first, then retries the current package once with `NPM_TOKEN` when that secret is available. This keeps provenance-backed publishing as the preferred path while preventing a single package with missing npm trusted-publisher configuration from stranding the whole release wave. Use `publish_auth_strategy=oidc` to require trusted publishing only, or `publish_auth_strategy=token` for an explicit token-only recovery run.

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

`npm:trust:plan` uses `npm trust github ... --dry-run` and does not mutate npm package settings. `npm:trust:configure` uses the same selected package surface without `--dry-run`; npm may require a browser-based account confirmation before it can change trusted-publisher settings. If you intentionally restrict publishing to a GitHub environment, pass the same environment to both npm and the workflow:

```bash
pnpm npm:trust:plan -- --environment npm-production
pnpm npm:trust:configure -- --environment npm-production
```

After publishing:

```bash
pnpm release:verify
git tag vX.Y.Z <release-commit>
git push origin vX.Y.Z
pnpm release:closeout --version X.Y.Z
pnpm release:announce -- --version X.Y.Z --send
```

For a targeted package release, keep the same filters across planning, publishing, verification, and closeout:

```bash
pnpm release:commands --only=@decantr/cli
node scripts/publish-packages.mjs --only=@decantr/cli
pnpm release:verify -- --only=@decantr/cli
pnpm release:closeout -- --only=@decantr/cli --version X.Y.Z
pnpm release:announce -- --only=@decantr/cli --version X.Y.Z --send
```

If the tag workflow fails with npm `E404` / "could not be found or you do not have permission" during OIDC publishing, first verify the package's npm trusted-publisher settings. If the release is time-sensitive and `NPM_TOKEN` is configured as a GitHub Actions secret, rerun the workflow with `publish_auth_strategy=token` or run the wrapper locally after npm 2FA:

```bash
node scripts/publish-packages.mjs --only=@decantr/telemetry --auth-strategy=token
pnpm release:verify -- --only=@decantr/telemetry
pnpm release:closeout -- --only=@decantr/telemetry --version X.Y.Z
```

## Prerelease Channel

Major-line previews, including Decantr 3, use npm `next` and an explicit package-surface channel. Do not repurpose the stable package lane silently.

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

`pnpm release:announce` builds a `repository_dispatch` payload for `decantr-ai/community-ops`, including the version, tag, release-note path, changelog markdown, and selected package versions. It dry-runs by default:

```bash
pnpm release:announce -- --version 3.0.0-next.0 --only=@decantr/cli,@decantr/mcp-server,@decantr/verifier --json
```

To post through the community automation, set `COMMUNITY_OPS_DISPATCH_TOKEN` to a GitHub token that can create `repository_dispatch` events on `decantr-ai/community-ops`, then send:

```bash
pnpm release:announce -- --version 3.0.0-next.0 --only=@decantr/cli,@decantr/mcp-server,@decantr/verifier --send
```

`community-ops` owns Discord and X credentials plus message formatting. Decantr only sends the release facts after closeout. A live community announcement posts to both Discord and the official Decantr X account; it should fail before posting if either required channel credential set is missing.

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
gh workflow run discord-release.yml \
  --repo decantr-ai/community-ops \
  --ref main \
  -f version=3.0.0-next.0 \
  -f tag=v3.0.0-next.0 \
  -f repo=decantr-ai/decantr \
  -f release_note_path=docs/releases/2026-05-23-decantr-3-next-foundation.md \
  -f release_url=https://github.com/decantr-ai/decantr/releases/tag/v3.0.0-next.0 \
  -f packages='@decantr/cli@3.0.0-next.0,@decantr/mcp-server@3.0.0-next.0,@decantr/verifier@3.0.0-next.0' \
  -F changelog_markdown=@docs/releases/2026-05-23-decantr-3-next-foundation.md \
  -f dry_run=false
```

Always pass `changelog_markdown` on the receiver fallback. Prerelease tags can point at the package release commit while release notes continue to evolve on `main`; passing the markdown directly keeps `community-ops` from fetching a release note from a tag that may not contain it.

That direct receiver path uses `community-ops` repository secrets, including `DISCORD_RELEASE_WEBHOOK_URL`, `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, and `X_ACCESS_TOKEN_SECRET`, and does not require the source repo dispatch token.

## Closeout Audit

`pnpm release:closeout` runs `scripts/audit-release-closeout.mjs`.

It verifies:

- the target release version, defaulting to `packages/cli/package.json`
- clean worktree unless `--allow-dirty` is explicit
- local tag `vX.Y.Z`
- pushed origin tag `vX.Y.Z`
- tag commit is reachable from `origin/main`
- `docs/releases/*` contains a note for the target version
- every version-like release note filename, such as `2-9-6`, has a matching tag
- each selected publishable package version exists on npm
- each selected package default dist-tag points at the local manifest version

Useful variants:

```bash
pnpm release:closeout -- --version 2.9.6
pnpm release:closeout -- --only=@decantr/cli --version 2.9.6
pnpm release:closeout:json -- --version 2.9.6
node scripts/audit-release-closeout.mjs --skip-npm --version 2.9.6
```

Use `--skip-npm` only when auditing tag/docs parity before publishing. Never use it as final release evidence.

## Release Notes And Tags

When adding a versioned release note under `docs/releases/`, prefer a filename that includes the version:

```text
docs/releases/YYYY-MM-DD-short-title-2-9-6.md
```

The closeout audit treats `2-9` as `v2.9.0` and `2-9-6` as `v2.9.6`. If a release note is intentionally not a package release, avoid a version suffix in the filename.

## Dangerous Operations

The Release Steward must ask for explicit user approval before:

- publishing to npm
- changing npm dist-tags
- creating, deleting, or moving git tags
- force-pushing
- running a non-dry-run registry sync in `decantr-content`
- pruning live registry content

If approval was already explicit in the user request, proceed through the scripted path and still run closeout.

## decantr-content Flow

`decantr-content` is not an npm-published package. It is the source of truth for official registry content, so its release closeout is about registry readiness and CLI alignment:

```bash
npm install
npm run validate
npm run registry:v2-certify
npm run content:health:json
npm run content:health:suppressions
npm run registry:audit -- --report-json=./registry-drift-report.json --summary-markdown=./registry-drift-summary.md
npm run release:closeout
```

Before live registry publish, run the `Publish to Registry` workflow in dry-run mode and review `sync-report.json`. A live sync requires explicit maintainer confirmation; pruning requires a separate explicit confirmation after a dry-run report.

The content repo should keep its pinned `@decantr/cli` version aligned with the monorepo release line so Content Health and registry certification exercise the current public contract.

## Agent Contract

Any AI assistant working on Decantr release tasks must use the Release Steward lane:

1. identify the repo (`decantr-monorepo` or `decantr-content`)
2. use scripts as the source of truth
3. keep filters consistent across publish and verify commands
4. update release notes and docs in the same branch
5. run closeout before saying the release is done
6. report any skipped check as a real residual risk
