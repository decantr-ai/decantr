# Decantr 3 Prerelease Runbook

Date: 2026-05-23
Status: Local release structure ready; publish blocked on maintainer approval

This runbook defines the Decantr 3 hard-cut prerelease lane. It is intentionally separate from the 2.x maintenance line so the AI Frontend Governance reset can move quickly without pretending to be backwards-compatible with the old blueprint-first product.

## Branch Structure

Current local branch structure:

- `2.x-maintenance`: local maintenance pointer created from `origin/main` before the Decantr 3 reset work was moved onto a feature branch.
- `decantr-3-typed-graph-foundation`: monorepo implementation branch for typed graph, graph-aware evidence, MCP graph tools, release docs, and public repositioning.
- `decantr-3-governance-content-docs`: content-repo branch for governance-aligned content repository docs.

Do not publish, tag, push, or deploy from these branches without an explicit maintainer approval step.

## Package Channel

Decantr 3 preview packages should use:

```text
version: 3.0.0-next.0
npm dist-tag: next
releaseChannel: prerelease
```

The 2.x line remains on npm `latest` until the proof engine, docs, package READMEs, MCP copy, and registry language agree with the Decantr 3 product surface.

`config/package-surface.json` now supports an explicit prerelease channel through `releaseChannel: "prerelease"`. A public stable package may publish a prerelease semver only when:

1. `releaseChannel` is `prerelease`.
2. the package version is prerelease semver, such as `3.0.0-next.0`.
3. `defaultDistTag` is `next`.
4. `releaseReadiness.blockers` remains empty for public packages.

Without that explicit channel, stable public packages must continue to use normal semver and npm `latest`.

## Local Preflight

Run the full local preflight before any publish decision:

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

For `decantr-content`:

```bash
npm install
npm run validate
git diff --check
```

## Prerelease Command Shape

Use `next` consistently across plan, preflight, publish, verification, and closeout:

```bash
pnpm release:plan
pnpm release:commands -- --tag next
pnpm release:preflight -- --tag next
pnpm release:verify -- --tag next
pnpm release:closeout -- --tag next --version 3.0.0-next.0
```

The `--tag next` shorthand is equivalent to `--tag-override=next`.

The generated publish command is still the source of truth. Do not hand-publish package directories with bare `npm publish`.

## Publish Hold

The following operations are hard stops until the maintainer explicitly asks for them:

- `node scripts/publish-packages.mjs` without `--publish-dry-run`
- `npm publish`
- `npm dist-tag add`, `npm dist-tag rm`, or `npm dist-tag ls` mutations
- `git tag`, `git push origin <tag>`, or `git push`
- hosted docs deployment
- live registry sync or prune from `decantr-content`

## Release Note

The current draft note is:

```text
docs/releases/2026-05-23-decantr-3-next-foundation-draft.md
```

It is intentionally marked as a draft and is not release evidence until the package versions, npm dist-tags, git tag, and closeout audit are complete.

## Latest Flip Criteria

Do not move npm `latest` to Decantr 3 until:

1. at least one realistic brownfield app can run `scan`, `graph`, `task`, and `verify` with graph-backed evidence;
2. graph snapshot, contract capsule, project health, evidence bundle, and MCP tools all carry coherent graph identity;
3. package README files and docs lead with AI Frontend Governance;
4. the registry is framed as vocabulary/reference content, not the product center;
5. `pnpm release:verify` and `pnpm release:closeout --version 3.0.0` pass after the stable publish.

