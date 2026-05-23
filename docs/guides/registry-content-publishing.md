# Registry And Content Publishing

The Decantr registry is the public catalog of certified vocabulary: starter kits, archetypes, patterns, themes, and shells that can feed project-owned Contracts. It is supporting infrastructure, not the product center.

## Public Surfaces

- Registry portal: `https://registry.decantr.ai`
- Registry sitemap: `https://registry.decantr.ai/sitemap.xml`
- Registry API: `https://api.decantr.ai/v1`
- Official content source: `https://github.com/decantr-ai/decantr-content`

## Official Content

The `decantr-content` repository is the source of truth for the `@official` namespace. It contains patterns, themes, starter-kit blueprints, archetypes, and shells. Changes are validated in CI and published by maintainers after they land on `main`.

Blueprints also carry `blueprint_portfolio` metadata. This lets maintainers keep the public registry simple while preserving compatibility:

- **Featured** and **Certified** are the strongest default picks for new users.
- **All** contains supported public blueprint contracts.
- **Labs** is opt-in for promising directions that need sharper proof.
- Folded legacy or overlap slugs remain directly addressable by slug, but are not shown in public browsing.

Local checks:

```bash
npm run validate
npm run registry:v2-certify
npm run content:health
npm run registry:audit
```

## Community Publishing

The hosted registry can accept community content under non-official namespaces. Use the portal to publish your own registry items, and inspect public records through the registry UI or API before using them in a project.

## Content Health

Use Content Health for vocabulary repositories:

```bash
npx @decantr/cli content check
npx @decantr/cli content check --json
npx @decantr/cli content check --prompt <finding-id>
```

Content Health checks schema validity, references, content quality coverage, and generated guidance quality. Project Health is different: it checks an application against its accepted Decantr contract.

See also: [Registry Public API](../reference/registry-public-api.md), [Content Health](../reference/content-health.md).
