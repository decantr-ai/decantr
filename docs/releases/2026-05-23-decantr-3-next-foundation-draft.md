# Decantr 3 Next Foundation

Date: 2026-05-23
Status: Published prerelease
Version: `3.0.0-next.0`
Channel: npm `next`

Decantr `3.0.0-next.0` is the first published Decantr 3 foundation prerelease. It ships the typed graph substrate and governance-first product framing while keeping the 2.x line on npm `latest`.

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
- Decantr 3 preview packages are published under npm `next`.
- Live registry sync remains separate from npm package publishing and still requires explicit maintainer approval.

## Published Packages

- `@decantr/essence-spec@3.0.0-next.0`
- `@decantr/registry@3.0.0-next.0`
- `@decantr/css@3.0.0-next.0`
- `@decantr/core@3.0.0-next.0`
- `@decantr/telemetry@3.0.0-next.0`
- `@decantr/verifier@3.0.0-next.0`
- `@decantr/mcp-server@3.0.0-next.0`
- `@decantr/cli@3.0.0-next.0`

## Verification

```bash
pnpm run build:packages
pnpm test
pnpm lint
pnpm audit:docs-marketing
pnpm audit:package-surface
pnpm audit:public-api
pnpm seo:docs-sitemap
pnpm release:preflight -- --tag next
pnpm release:verify -- --tag next
pnpm release:closeout -- --tag next --version 3.0.0-next.0
```

For `decantr-content`:

```bash
npm run validate
npm run registry:v2-certify
npm run content:health:json
npm run content:health:suppressions
npm run registry:audit -- --report-json=./registry-drift-report.json --summary-markdown=./registry-drift-summary.md
npm run release:closeout
```
