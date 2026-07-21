# Decantr 3.9.2 Security And Packaging

Decantr 3.9.2 is a narrow security patch for content provenance validation and the installed MCP dependency surface. It preserves the Decantr 3.9 Governed Change Proof contract, default v2 reports, explicit CI v3 behavior, stdio MCP identity, and the existing eight-tool inventory.

The `v3.9.1` tag was an unpublished release attempt. Its protected publish workflow stopped before npm publication when the final dependency security update changed the bundled MCP bytes after qualification evidence had been generated. The tag was not rewritten; 3.9.2 carries regenerated evidence bound to the patched package bytes.

## Fixes

- Replaced the content-version backtracking regular expression with a length-bounded semantic-version parser.
- Updated the public content-ref and corpus-manifest schemas with a bounded, non-ambiguous semantic-version pattern.
- Added adversarial regression coverage for the input shape identified by CodeQL.
- Updated the Fly content API to `@hono/node-server@2.0.11` and forced the patched version throughout the repository install graph.
- Updated `fast-uri` to 3.1.3 to resolve host-confusion risk in the AJV dependency graph.
- Bundled the MCP SDK modules used by Decantr's stdio transport instead of installing the SDK's unused HTTP dependency tree.
- Added bundled-code license notices and package-surface assertions for the MCP distribution.
- Added a release-blocking packed MCP audit that rejects SDK/Hono runtime leakage, initializes the stdio server, lists all eight tools, and exercises local project-state discovery from a clean install.

## Package Wave

- `@decantr/content@3.9.2`
- `@decantr/registry@3.9.2`
- `@decantr/core@3.9.2`
- `@decantr/verifier@3.9.2`
- `@decantr/mcp-server@3.9.2`
- `@decantr/cli@3.9.2`

`@decantr/essence-spec`, `@decantr/css`, and `@decantr/telemetry` remain at 3.8.1. `@decantr/vite-plugin` remains experimental at 0.1.1.

## Compatibility

There are no new commands, MCP tools, schemas, report versions, write surfaces, network endpoints, or adoption defaults. MCP remains stdio-only with `mcpName: io.github.decantr-ai/mcp-server`, and `decantr_registry` remains the compatibility content-corpus tool.

The active 3.9 machine and route evidence is rebound to the exact 3.9.2 package tarballs. Human finding qualification remains incomplete under the sole-maintainer waiver, so this patch does not claim human precision, recall, release qualification, or adoption proof.

## Upgrade

```bash
npm install -D @decantr/cli@3.9.2
npm install @decantr/mcp-server@3.9.2
```
