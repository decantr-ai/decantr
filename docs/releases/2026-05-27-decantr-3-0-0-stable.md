# Decantr 3 Stable

Date: 2026-05-27
Status: Published stable
Version: `3.0.0`
Channel: npm `latest`

Decantr `3.0.0` promotes the Decantr 3 governance line from prerelease to the default npm install path. The release makes Contract, Context, and Evidence the public product surface for production frontend codebases edited by AI agents.

## What Changed Since The Prerelease

- Promoted the eight supported public packages from npm `next` to npm `latest`.
- Kept the typed Contract graph, route-scoped task context, Project Health, Evidence Bundles, MCP context, local law, style bridges, and structured repair prompts as the stable v3 foundation.
- Included Behavior Obligations as a v3-compatible local-law enhancement for dialogs, forms, destructive actions, and other high-risk interactive surfaces.
- Kept registry/content as certified vocabulary and examples, not the center of the product.
- Kept `@decantr/vite-plugin` outside the stable publish surface.

## Published Packages

- `@decantr/essence-spec@3.0.0`
- `@decantr/registry@3.0.0`
- `@decantr/css@3.0.0`
- `@decantr/core@3.0.0`
- `@decantr/telemetry@3.0.0`
- `@decantr/verifier@3.0.0`
- `@decantr/mcp-server@3.0.0`
- `@decantr/cli@3.0.0`

## Release Guardrails

- Publish through the Decantr release wrapper, not bare `npm publish`.
- Verify npm dist-tags after publish: every published package must resolve npm `latest` to `3.0.0`.
- Keep `decantr-content` pinned to the stable v3 package line after npm verification.
- Live registry sync remains separate from npm package publishing and still requires explicit maintainer intent for each sync or prune.

## Verification

```bash
pnpm install
pnpm build:packages
pnpm test
pnpm biome:check
pnpm audit:public-api
pnpm audit:package-surface
pnpm audit:package-permissions
pnpm audit:docs-marketing
pnpm audit:public-links
pnpm release:preflight
pnpm release:verify -- --version 3.0.0
pnpm release:closeout -- --version 3.0.0
```

For `decantr-content` after npm verification:

```bash
npm install
npm run validate
npm run content:health
npm run registry:audit
npm run release:closeout
```
