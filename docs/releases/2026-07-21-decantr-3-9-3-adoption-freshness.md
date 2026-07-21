# Decantr 3.9.3 Adoption Freshness

Decantr 3.9.3 fixes a generated-context freshness regression discovered by the public-artifact adoption replay after 3.9.2. It preserves the Decantr 3.9 Governed Change Proof contract, default v2 reports, explicit CI v3 behavior, stdio MCP identity, and the existing eight-tool inventory.

The published `v3.9.2` release remains immutable. Its npm and tag-bound closeout succeeded, but a fresh Brownfield replay showed that `refresh --check` failed immediately after both `decantr init` and `decantr adopt`. The receipt write updated `.decantr/project.json` after derived context had been generated, so the mtime freshness check reported otherwise-current files as stale.

## Fixes

- Regenerate derived context after initialization or adoption persists its source-integrity receipt.
- Add Greenfield and monorepo Brownfield end-to-end coverage for an immediately fresh `decantr refresh --check` result.
- Make MCP directory publication retries treat the registry's exact duplicate-version response as an already-published state and continue to public listing verification.
- Correct the bundled MCP notice to identify the patched `fast-uri` 3.1.3 dependency.

## Replay Evidence

The corrected candidate passes the pinned post-publish Brownfield harness across the TanStack Start dashboard and scoped Bulletproof React app: 36 commands, zero unexpected failures, zero route misses, zero crash signatures, and zero performance-budget failures. Route tasks read the production route implementation first in both targets.

A fresh `@tanstack/cli@0.69.6` Greenfield replay also initializes successfully, reports generated context as fresh, selects `src/routes/index.tsx` first for `/`, builds before and after adoption, and leaves authored `src/` bytes unchanged. The generated host's Biome check fails identically before and after Decantr because the generator emits a Biome 2.2.4 schema while installing Biome 2.4.5; that inherited host defect is not attributed to Decantr.

These replays are regression evidence, not a human qualification or adoption-proof claim. The runbook still requires 30 independently initialized samples per target before percentile claims.

## Package Wave

- `@decantr/content@3.9.3`
- `@decantr/registry@3.9.3`
- `@decantr/core@3.9.3`
- `@decantr/verifier@3.9.3`
- `@decantr/mcp-server@3.9.3`
- `@decantr/cli@3.9.3`

`@decantr/essence-spec`, `@decantr/css`, and `@decantr/telemetry` remain at 3.8.1. `@decantr/vite-plugin` remains experimental at 0.1.1.

## Compatibility

There are no new commands, MCP tools, schemas, report versions, write surfaces, network endpoints, or adoption defaults. MCP remains stdio-only with `mcpName: io.github.decantr-ai/mcp-server`, and `decantr_registry` remains the compatibility content-corpus tool.

The active 3.9 machine and route evidence is rebound to the exact 3.9.3 package tarballs. Human finding qualification remains incomplete under the sole-maintainer waiver, so this patch does not claim human precision, recall, release qualification, or adoption proof.

## Upgrade

```bash
npm install -D @decantr/cli@3.9.3
npm install @decantr/mcp-server@3.9.3
```
