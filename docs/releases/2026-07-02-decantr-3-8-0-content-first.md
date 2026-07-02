# Decantr 3.8.0 Content-First Governance

Decantr 3.8.0 moves the product from a public registry/starter-kit story to a content-first AI Frontend Governance system.

The release imports the official Decantr content corpus into the monorepo as `@decantr/content`, retires the public-facing registry portal from active product delivery, keeps MCP and registry-named compatibility surfaces stable for 3.x users, and makes Decantr CSS an optional legacy adapter instead of the default adoption path.

## Highlights

- `@decantr/content` is now the official corpus package for schemas, content records, search, resolution, validation, content health, and execution-pack support.
- `apps/api` is now a Fly-hosted content/reference API backed by `@decantr/content`, not Supabase.
- The API keeps content/reference routes for health, schemas, search, content records, content intelligence, showcase metadata, and execution-pack compile/select.
- Hosted source upload, critique, scan, auth, org, billing, users, usage-metering, publish, Supabase, Stripe, and PostHog API surfaces are retired from the active product.
- `apps/registry` and the public registry portal delivery path are removed from the monorepo.
- `decantr content ...` is the preferred CLI namespace for content-corpus workflows.
- `decantr registry ...`, `@decantr/registry`, and MCP `decantr_registry` remain 3.x compatibility surfaces.
- MCP keeps the existing package identity, `io.github.decantr-ai/mcp-server` name, stdio transport, and eight-tool surface.
- `@decantr/css` remains published for compatibility but is now documented as a legacy optional adapter, not a greenfield or Brownfield default.

## Package Wave

- `@decantr/essence-spec@3.8.0`
- `@decantr/content@3.8.0`
- `@decantr/registry@3.8.0`
- `@decantr/css@3.8.0`
- `@decantr/core@3.8.0`
- `@decantr/telemetry@3.8.0`
- `@decantr/verifier@3.8.0`
- `@decantr/mcp-server@3.8.0`
- `@decantr/cli@3.8.0`

`@decantr/vite-plugin` remains experimental at `0.1.1`.

## Compatibility

No MCP identity or tool-name break is intended in 3.x. Existing MCP directory submissions and clients can continue to use `@decantr/mcp-server` and `decantr_registry`; the tool now represents compatibility access to the official content corpus rather than a hosted public registry marketplace.

Existing scripts using `decantr registry summary`, `decantr registry compile-packs`, or `decantr registry get-pack` remain compatible. New docs and examples should use `decantr content summary`, `decantr content compile-packs`, and `decantr content get-pack`.

`@decantr/registry` remains a supported secondary compatibility package. New integrations should prefer `@decantr/content`.

## Infrastructure Notes

The retained hosted service is the Fly API at `api.decantr.ai`. The public `registry.decantr.ai` portal, Vercel registry project, Supabase project/storage, Stripe products/webhooks, PostHog dashboard/project, registry IndexNow config, and registry-specific secrets should be retired after the release is verified and external links are updated.

The separate `decantr-content` repository is historical after this release. Future official content work lives in `decantr-ai/decantr/packages/content`.
