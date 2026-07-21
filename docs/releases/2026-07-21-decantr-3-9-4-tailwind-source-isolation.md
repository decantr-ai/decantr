# Decantr 3.9.4 Tailwind Source Isolation

Decantr 3.9.4 fixes a Greenfield adoption side effect discovered by the public-artifact replay after 3.9.3. It preserves the Decantr 3.9 Governed Change Proof contract, default v2 reports, explicit CI v3 behavior, stdio MCP identity, and existing eight-tool inventory.

The published `v3.9.3` release remains immutable. Its Greenfield replay proved that Decantr left the original application source bytes unchanged, but a deeper build comparison found that Tailwind v4 scanned generated Decantr Markdown and JSON as plain text. That scan emitted unused utility selectors and changed the host CSS asset from 5.04 kB to 6.63 kB even though the application implementation had not changed.

## Fixes

- Detect Tailwind v4 from project package metadata and a CSS `@import "tailwindcss"` entry.
- Add a deterministic marked `@source not` block for dedicated Decantr governance paths, using paths relative to each detected CSS entry.
- Keep the mutation idempotent and leave Tailwind v3 and non-Tailwind projects untouched.
- Record every approved stylesheet path and exact before/after hash in the adoption receipt.
- Report source integrity as `verified-bounded` only when every authored-source change matches an exact approval; unclassified changes and later hash mismatches fail closed.
- Teach verifier-owned `AdoptionTruthV1` and the 3.9 machine qualification harness to validate the bounded mutation instead of treating it as a generic source edit.

## Build Evidence

A fresh `@tanstack/cli@0.69.6` application emits the same client and server asset hashes before and after Decantr adoption with the isolation block applied. The client stylesheet returns to the pristine `styles-CmCcBo5l.css` asset at 5.04 kB, and `decantr refresh --check` passes immediately after initialization.

The post-publish adoption runbook now requires pristine and adopted asset-hash comparison. An allowed Tailwind mutation must contain only the marked source-exclusion block, match the receipt's exact hashes, and preserve the pristine emitted assets.

## Package Wave

- `@decantr/content@3.9.4`
- `@decantr/registry@3.9.4`
- `@decantr/core@3.9.4`
- `@decantr/verifier@3.9.4`
- `@decantr/mcp-server@3.9.4`
- `@decantr/cli@3.9.4`

`@decantr/essence-spec`, `@decantr/css`, and `@decantr/telemetry` remain at 3.8.1. `@decantr/vite-plugin` remains experimental at 0.1.1.

## Compatibility

There are no new commands, MCP tools, network endpoints, or adoption defaults. MCP remains stdio-only with `mcpName: io.github.decantr-ai/mcp-server`, and `decantr_registry` remains the compatibility content-corpus tool.

The local write contract has one explicit narrow addition: detected Tailwind v4 CSS entry files may receive Decantr's marked source-exclusion block. The receipt shape is additive, and older receipts remain readable. The active 3.9 machine and route evidence is rebound to the exact 3.9.4 package tarballs.

Human finding qualification remains incomplete under the sole-maintainer waiver, so this patch does not claim human precision, recall, release qualification, or adoption proof.

## Upgrade

```bash
npm install -D @decantr/cli@3.9.4
npm install @decantr/mcp-server@3.9.4
```
