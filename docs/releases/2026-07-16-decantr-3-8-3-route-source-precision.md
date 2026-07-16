# Decantr 3.8.3 Route-Source Precision

Decantr 3.8.3 is a narrow maintenance release for source-accurate TanStack task context. It corrects a defect found by the 3.8.2 post-publish Greenfield trial and does not expand the Decantr 3 product surface.

## Fix

Current TanStack Start applications commonly declare both:

- a root layout with `createRootRoute()` in `src/routes/__root.tsx`
- the `/` page with `createFileRoute('/')` in `src/routes/index.tsx`

Both are formal, high-confidence route signals, but 3.8.2 could select the root layout as the taskable `/` implementation. Decantr now prefers the literal page declaration while retaining the root declaration as layout and fallback evidence.

Because verifier discovery is the shared substrate, the correction flows consistently through scan reports, initial graph construction, CLI task context, and MCP project/task context. The first implementation read for `/` is now `src/routes/index.tsx` in the standard TanStack structure.

## Evidence

- Verifier scan coverage exercises `__root.tsx` and `index.tsx` together.
- CLI graph coverage rejects a route-implementation edge from `/` to `__root.tsx` when the literal page exists.
- Greenfield initialization coverage confirms the first task read is `src/routes/index.tsx`.
- A standalone packed verifier/CLI candidate reproduced the corrected result against a current `@tanstack/cli@0.69.6` application; Decantr left the authored route and router sources unchanged, and the host production build passed.
- The packed candidate completed the pinned 36-command external Brownfield matrix with zero unexpected failures, crashes, route misses, or commit-parity failures.
- The pinned external Brownfield corpus resolves exact reviewed commits and remains the post-publish compatibility gate.

The original public-artifact trial, timings, host checks, limitations, and defect analysis remain in [`docs/audit/2026-07-16-decantr-3-8-2-post-publish-adoption.md`](../audit/2026-07-16-decantr-3-8-2-post-publish-adoption.md).

## Package Wave

- `@decantr/verifier@3.8.3`
- `@decantr/mcp-server@3.8.3`
- `@decantr/cli@3.8.3`

`@decantr/core` remains at 3.8.2. `@decantr/content`, `@decantr/essence-spec`, `@decantr/registry`, `@decantr/css`, and `@decantr/telemetry` remain at 3.8.1. `@decantr/vite-plugin` remains experimental at 0.1.1.

## Compatibility

The MCP package identity, stdio transport, server identity, and eight tool names are unchanged. `@decantr/registry`, `decantr registry ...`, `REGISTRY_URL`, and MCP `decantr_registry` remain 3.x compatibility names. `@decantr/css` remains a legacy optional adapter and is not part of this release.

No schema, Essence, API, authentication, telemetry, or hosted infrastructure contract changes in 3.8.3.

## Upgrade

```bash
npm install -D @decantr/cli@3.8.3
npm install @decantr/mcp-server@3.8.3
```

Direct verifier consumers should upgrade to `@decantr/verifier@3.8.3`.
