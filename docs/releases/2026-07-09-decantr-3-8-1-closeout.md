# Decantr 3.8.1 Content-First Closeout

Decantr 3.8.1 closes the remaining gaps in the 3.8 content-first transition. It does not change the Essence V4 contract or the consolidated eight-tool MCP surface.

## Highlights

- CLI telemetry no longer defaults to retired Decantr API routes. Opt-in is a local preference; event delivery, guard metrics, and private identity linking each require an explicit caller-controlled endpoint.
- The docs site no longer posts first-party analytics or persists attribution cookies, local-storage records, or anonymous identifiers. Deployments may still configure specific X conversion events.
- Greenfield and missing-metadata scaffold paths now fall back to `contract-only`, never `decantr-css`.
- Contract-only and style-bridge section context omits raw shell atom hints and translates semantic layout intent into the consuming project's styling authority.
- Official corpus atom metadata now uses canonical compact forms. The all-blueprint contract audit reports zero errors and only the seven intentional demo-auth quality warnings.
- SwipeCircle explicitly removes unused `auth-full` pages from its composition, eliminating false route completeness warnings.
- The legacy `registry-platform` blueprint remains direct-slug compatible but is hidden, marked `legacy-hidden`, and removed from golden showcase recommendations.
- Active READMEs, guides, schemas, generated project guidance, MCP metadata, package permissions, `CLAUDE.md`, and the Decantr engineering skill now describe the same content-first product boundary.
- Docs audits now reject retired registry portal copy, hosted telemetry defaults, first-party docs ingest, Decantr CSS fallback adoption, and promotion of `registry-platform` as a current flagship.

## Package Wave

- `@decantr/essence-spec@3.8.1`
- `@decantr/content@3.8.1`
- `@decantr/registry@3.8.1`
- `@decantr/css@3.8.1`
- `@decantr/core@3.8.1`
- `@decantr/telemetry@3.8.1`
- `@decantr/verifier@3.8.1`
- `@decantr/mcp-server@3.8.1`
- `@decantr/cli@3.8.1`

`@decantr/vite-plugin` remains experimental at `0.1.1`.

## Compatibility

`@decantr/registry`, `decantr registry ...`, `REGISTRY_URL`, and MCP `decantr_registry` remain 3.x compatibility names. New integrations should prefer `@decantr/content`, `decantr content ...`, and `DECANTR_API_URL`.

The MCP package identity remains `@decantr/mcp-server`, its directory identity remains `io.github.decantr-ai/mcp-server`, transport remains stdio, and the tool count remains eight.

## Infrastructure Boundary

Fly remains the hosted content/reference API at `api.decantr.ai`. The API does not provide auth, billing, publishing, source upload, critique, scan, usage metering, or telemetry ingest routes.

The Vercel registry project and `registry.decantr.ai` DNS are external retirement items, not runtime dependencies of this release. They should be closed only after redirect/410 and DNS ownership decisions are explicitly approved and verified.

## Upgrade

```bash
npm install -D @decantr/cli@3.8.1
npm install @decantr/mcp-server@3.8.1
```

Projects using the official corpus directly can install `@decantr/content@3.8.1`. Existing 3.x registry-named commands and MCP integrations remain compatible.
