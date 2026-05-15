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
pnpm release:preflight
pnpm release:commands
```

Publish through the wrapper command produced by `pnpm release:commands`; do not publish public Decantr packages with a bare `npm publish`.

After publishing:

```bash
pnpm release:verify
git tag vX.Y.Z <release-commit>
git push origin vX.Y.Z
pnpm release:closeout --version X.Y.Z
```

For a targeted package release, keep the same filters across planning, publishing, verification, and closeout:

```bash
pnpm release:commands --only=@decantr/cli
node scripts/publish-packages.mjs --only=@decantr/cli
pnpm release:verify -- --only=@decantr/cli
pnpm release:closeout -- --only=@decantr/cli --version X.Y.Z
```

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
