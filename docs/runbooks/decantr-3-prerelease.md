# Historical Decantr 3.0 Prerelease Runbook

Date: 2026-05-23
Status: Archived evidence for `3.0.0-next.0`; not an active release lane

This runbook records the one-time Decantr `3.0.0-next.0` hard-cut prerelease lane. Do not reuse its `next` dist-tag or prerelease commands for 3.9. The active direct-stable process is [Release Stewardship](release-stewardship.md), and the configured package surface is authoritative for any later release.

## Branch Structure

Branch structure at the time of the first prerelease:

- `main`: contains the Decantr 3 foundation prerelease implementation, release docs, public repositioning, and post-publish security hardening.
- `2.x-maintenance`: maintenance pointer for the 2.x line. Keep 2.x fixes scoped and do not backport new Decantr 3 product work.
- Historical implementation branches such as `decantr-3-typed-graph-foundation` and `decantr-3-governance-content-docs` are no longer the release authority once their work has landed on `main`.

Do not publish, tag, push release tags, deploy, live-sync registry content, or prune registry content without an explicit maintainer approval step in the current task.

## Historical Package Channel

The Decantr 3.0 preview packages used:

```text
version: 3.0.0-next.0
npm dist-tag: next
releaseChannel: prerelease
```

`3.0.0-next.0` has been published on npm `next` for the public Decantr package set:

- `@decantr/essence-spec`
- `@decantr/registry`
- `@decantr/css`
- `@decantr/core`
- `@decantr/telemetry`
- `@decantr/verifier`
- `@decantr/mcp-server`
- `@decantr/cli`

This package channel is closed. Do not infer a future prerelease policy from these historical values.

At that time, the 2.x line remained on npm `latest` while the Decantr 3 product surface was being proven.

`config/package-surface.json` now supports an explicit prerelease channel through `releaseChannel: "prerelease"`. A public stable package may publish a prerelease semver only when:

1. `releaseChannel` is `prerelease`.
2. the package version is prerelease semver, such as `3.0.0-next.0`.
3. `defaultDistTag` is `next`.
4. `releaseReadiness.blockers` remains empty for public packages.

Without that explicit channel, stable public packages must continue to use normal semver and npm `latest`.

## Historical Local Preflight

The 3.0 prerelease used this preflight. Current releases must use `docs/runbooks/release-stewardship.md` instead:

```bash
pnpm install
pnpm run build:packages
pnpm test
pnpm lint
pnpm audit:docs-marketing
pnpm audit:package-surface
pnpm audit:public-api
pnpm seo:docs-sitemap
git diff --check
```

For `@decantr/content`:

```bash
pnpm --filter @decantr/content validate
pnpm --filter @decantr/content test
pnpm audit:content-package
git diff --check
```

## Historical Prerelease Command Shape

The archived 3.0 prerelease used `next` consistently across plan, preflight, verification, and closeout:

```bash
pnpm release:plan
pnpm release:commands -- --tag next
pnpm release:preflight -- --tag next
pnpm release:verify -- --tag next
pnpm release:closeout -- --tag next --version 3.0.0-next.0
```

The `--tag next` shorthand is equivalent to `--tag-override=next`.

These commands are retained only to explain the historical release. Do not execute them for 3.9.

## Historical Publish Holds

The following operations remain hard stops until the maintainer explicitly asks for them in the current release task:

- `node scripts/publish-packages.mjs` without `--publish-dry-run`
- `npm publish`
- `npm dist-tag add`, `npm dist-tag rm`, or `npm dist-tag ls` mutations
- `git tag`, `git push origin <tag>`, or `git push`
- hosted docs deployment
- external infrastructure changes such as Fly deploys, Vercel/Supabase/Stripe/PostHog closeout, DNS changes, or MCP directory submission updates

## Release Note

The first published prerelease note is:

```text
docs/releases/2026-05-23-decantr-3-next-foundation.md
```

It is release evidence for `3.0.0-next.0`; it does not authorize another prerelease.

## Historical Latest Flip Criteria

The following criteria governed the original Decantr 3 stable promotion and are retained as history:

1. at least one realistic brownfield app can run `scan`, `graph`, `task`, and `verify` with graph-backed evidence;
2. graph snapshot, contract capsule, project health, evidence bundle, and MCP tools all carry coherent graph identity;
3. package README files and docs lead with AI Frontend Governance;
4. the registry is framed as vocabulary/reference content, not the product center;
5. `pnpm release:verify` and `pnpm release:closeout --version 3.0.0` pass after the stable publish.
