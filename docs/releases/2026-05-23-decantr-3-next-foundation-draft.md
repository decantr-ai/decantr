# Decantr 3 Next Foundation Draft

Date: 2026-05-23
Status: Draft only; not published
Intended channel: `3.0.0-next.0` on npm `next`

This is the draft release note for the Decantr 3 typed graph foundation. It records the local release structure and expected package channel, but it is not evidence of a completed release.

## Positioning

Decantr 3 is the AI Frontend Governance line for existing applications. It centers the product on Contract, Context, and Evidence instead of registry marketplace, UI framework, or blueprint-first scaffolding.

## Foundation Work

- Added the typed graph foundation for project contracts, route context, graph snapshots, graph manifests, graph diffs, and contract capsules.
- Added graph-aware Project Health, Evidence Bundle, verification report, and MCP surfaces.
- Added graph-anchored diagnostics, stable finding codes, and typed repair identifiers.
- Added first-pass component reuse drift and style bridge drift detection.
- Reframed public docs, package README files, and registry-facing copy around governance.
- Added release-channel structure for a hard Decantr 3 prerelease without moving 2.x off npm `latest`.

## Release Guardrails

- 2.x remains the live `latest` line until explicit flip criteria are met.
- Decantr 3 preview packages should publish under npm `next`.
- Publishing, tags, pushes, hosted deployment, and live registry sync remain blocked until maintainer approval.

## Validation Required Before Publish

```bash
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
npm run validate
git diff --check
```

