# Decantr 3.6.1 Static Runtime Proof

Decantr 3.6.1 is a scoped proof-quality patch based on the expanded 3.6.0 real-world corpus audit. It keeps Essence V4, report schemas, MCP tools, telemetry, hosted upload behavior, and write surfaces unchanged.

Package wave:

- `@decantr/verifier@3.6.1`
- `@decantr/mcp-server@3.6.1`
- `@decantr/cli@3.6.1`

## What Changed

- Runtime proof now accepts semantic static app roots for generic static apps, including `main`, `role="main"`, `section.todoapp`, and `#todoapp`.
- Framework targets remain stricter: React/Vue/Svelte/Angular/Solid/Next-style apps still need framework mount or framework document evidence.
- `scan` now reports SvelteKit routes from `+page` files instead of treating components and implementation modules as taskable routes.
- `scan` now reads Angular route arrays, so first-mile Brownfield output sees routes such as `/login` before adoption.
- The real-world corpus harness now runs all configured candidates by default, preflights missing `projectPath` values as a single `missing_project_scope` failure, and falls back from an invalid configured route to a concrete detected route.
- The expanded 3.6.0 corpus audit is preserved under `docs/audit/`.
- A stale pre-3 Essence V4 schema description was corrected in the public docs mirror and source schema. The schema shape and Essence version are unchanged.

## Why

The 2026-06-30 expanded corpus showed strong 3.6.0 results across modern Brownfield apps and large monorepos, but both TodoMVC static targets failed `ci --json` because runtime proof expected a framework-style root mount. Static and jQuery-era apps can have valid production UI roots without `id="root"`, so Decantr should treat semantic static roots as runtime evidence instead of forcing framework assumptions onto generic web projects.

## Verification

Completed before publish prep:

```bash
pnpm --filter @decantr/verifier test -- verifier-project-runtime scan
pnpm --filter @decantr/cli test -- realworld-corpus-harness
pnpm --filter @decantr/verifier --filter @decantr/mcp-server --filter @decantr/cli run build
pnpm build:packages
pnpm test
pnpm biome:check
pnpm audit:public-api
pnpm audit:package-surface
pnpm audit:package-permissions
pnpm audit:docs-drift
pnpm audit:docs-marketing
pnpm audit:public-links
pnpm seo:docs-sitemap
pnpm release:commands -- --only=@decantr/verifier,@decantr/mcp-server,@decantr/cli
pnpm release:preflight -- --only=@decantr/verifier,@decantr/mcp-server,@decantr/cli
```

Focused corpus proof:

- Out dir: `/tmp/decantr-3.6.1-focused-corpus`
- Projects: 3
- Commands: 54
- Unexpected failures: 0
- Route misses: 0
- Runtime proof gaps: 0
- Targets: TodoMVC vanilla ES6, TodoMVC jQuery, shadcn/ui v4 route-fallback case

After explicit publish authorization:

```bash
node scripts/publish-packages.mjs --only=@decantr/verifier,@decantr/mcp-server,@decantr/cli
pnpm release:verify -- --only=@decantr/verifier,@decantr/mcp-server,@decantr/cli
pnpm release:closeout -- --only=@decantr/verifier,@decantr/mcp-server,@decantr/cli --version 3.6.1
```
