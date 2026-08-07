# Decantr 3.10.0 Authority-Aware UI Change Control

Decantr 3.10.0 makes project authority, rather than route volume or aggregate confidence, the center of the product. The primary loop is **Observe -> Prepare -> Verify -> Report** through `scan`, `task`, `verify`, and `ci`.

This is a direct stable release. Publication is gated by deterministic tests, package audits, clean-consumer checks, documentation gates, and real-project regression replays. The separate model-lift research program remains incomplete, so this release makes no claim that Decantr materially improves frontier-model outcomes.

## Published Packages

- `@decantr/content@3.10.0`
- `@decantr/registry@3.10.0`
- `@decantr/core@3.10.0`
- `@decantr/verifier@3.10.0`
- `@decantr/mcp-server@3.10.0`
- `@decantr/cli@3.10.0`

`@decantr/essence-spec`, `@decantr/css`, and `@decantr/telemetry` remain at 3.8.1 because their public contracts did not change. `@decantr/vite-plugin` remains experimental at 0.1.1.

## What Changed

### Independent authority axes

Discovery now reports selected app, surface authority, topology completeness, taskability, component inventory, styling authority, runtime evidence, and source scope independently. A high aggregate score cannot conceal an unresolved critical axis. Primary readiness is expressed as `ready`, `limited`, `blocked`, or `unsupported`.

### Broader UI task preparation

`decantr task <target> "<intent>"` can prepare bounded, read-only context for routes, components, layouts, overlays, stories, packages, runtime states, and exact files. Unknown, ambiguous, inferred-only, and non-taskable targets fail closed with structured reasons and no edit reads. Existing attached routes retain the compatible `TaskCapsuleV1` path.

### Production-aware framework authority

- Angular discovery begins at the selected production target, follows bootstrap and router reachability through the TypeScript compiler, and excludes tests, stories, fixtures, mocks, generated output, and sibling apps from production authority.
- Next.js discovery evaluates root and `src/` middleware or proxy policy plus reachable local helpers. A source-declared route that is conditioned to return a non-success response remains visible but is not taskable.
- Next App Router HTTP handlers are excluded from UI component inventory.

### Complete styling context

Styling authority follows the ordered production import graph, including local CSS imports and workspace package CSS exports. Package presence alone does not establish authority, and Tailwind cannot displace stronger project-owned PrimeNG, Sass, builder, token, or component evidence.

### Lower-noise verification

Project Health distinguishes actionable failures from broad informational observations, accepts supported server-action and JSON-LD patterns, improves skip-link and localhost analysis, and avoids route-name authentication guesses. Brownfield and Hybrid adoption no longer modify formatter ignore files.

### Stable MCP compatibility

The MCP server remains `io.github.decantr-ai/mcp-server`, keeps stdio transport, and preserves the same eight tool IDs. Authority-aware task preparation is exposed through compatible `decantr_context` behavior; no ninth tool was added.

### Release security baseline

The bundled MCP SDK and transitive IP parsing dependency were refreshed, and the retained content API moved to patched Hono, URI parsing, and HTTP client dependency floors. Release evidence now gates the effective publish-package closure while retaining private-workspace findings as explicit diagnostics.

## Evidence And Limits

The [Culinary Platform clean-slate replay](../benchmarks/2026-08-07-culinary-platform-clean-slate-adoption.md) caught and repaired incorrect route taskability, incomplete stylesheet authority, API-handler component pollution, and unjustified confidence. It is oracle-assisted regression evidence, not a blinded control/treatment result.

The frozen 3.10 A/B harness remains available as a separate research track. Its results may support a future measured model-improvement claim, but they are not required to use or release the product and they do not change the truth of this release.

## Upgrade

```bash
npm install -D @decantr/cli@3.10.0
npm install @decantr/mcp-server@3.10.0
```

Run `decantr scan --project <app>` before mutation, inspect every authority axis and limitation, then prepare a bounded change with `decantr task <target> "<intent>"`.
