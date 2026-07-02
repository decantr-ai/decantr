# Official Content Corpus Contributions

Decantr 3.8 uses an official content corpus, not a public registry marketplace. The active source of truth is `packages/content` in the Decantr monorepo and the preferred package surface is `@decantr/content`.

This guide keeps its historical filename for inbound links. Hosted community publishing, registry portal submissions, and live sync-to-registry workflows are retired.

## Active Surfaces

- Content package: `@decantr/content`
- Content source: `packages/content`
- Content API: `https://api.decantr.ai/v1`
- CLI workflow: `decantr content ...`
- MCP compatibility tool: `decantr_registry`

## Official Content

`packages/content` contains patterns, themes, blueprints, archetypes, shells, schemas, validation helpers, search helpers, and resolver helpers. Changes land through normal monorepo pull requests and package/API deployment.

Blueprints may still carry portfolio metadata such as Featured, Certified, All, and Labs. That metadata is for official curation and recommendation quality. It does not imply a public marketplace or community publishing system.

Local checks:

```bash
pnpm --filter @decantr/content validate
pnpm --filter @decantr/content content:health
pnpm --filter @decantr/content content:intelligence
pnpm audit:content-package
```

## Community Content

Community publishing to a hosted registry is no longer an active Decantr product surface. Teams that need project-specific vocabulary should codify it as local law in the consuming application:

```bash
decantr codify --from-audit --project apps/web
decantr codify --style-bridge --project apps/web
decantr codify --accept --project apps/web
```

Official reusable content belongs in `packages/content`. Private or customer-specific governance belongs in the customer repository.

## Content Health

Use Content Health for the official corpus:

```bash
decantr content check
decantr content check --json
decantr content check --prompt <finding-id>
```

Content Health checks schema validity, references, coverage, and generated guidance quality. Project Health is different: it checks an application against its accepted Decantr contract.

See also: [Content API](../reference/registry-public-api.md), [Content Health](../reference/content-health.md).
