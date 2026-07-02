# Content API

This reference keeps the historical filename for link compatibility. The current Decantr API is a Fly-hosted content/reference helper backed by `@decantr/content`, not a public registry portal, account system, upload service, or billing surface.

Base URL:

```text
https://api.decantr.ai/v1
```

Prefer `DECANTR_API_URL` for custom deployments. `REGISTRY_URL` remains a legacy environment alias in Decantr 3.x clients.

Canonical response schemas are published at `https://decantr.ai/schemas/`.

## Retained Routes

- `GET /health`
- `GET /v1/search`
- `GET /v1/{patterns|themes|blueprints|archetypes|shells}`
- `GET /v1/{patterns|themes|blueprints|archetypes|shells}/@official/:slug`
- `GET /v1/schema/:name`
- `GET /v1/intelligence/summary`
- `GET /v1/showcase/manifest`
- `GET /v1/showcase/shortlist`
- `GET /v1/showcase/shortlist-verification`
- `POST /v1/packs/compile`
- `POST /v1/packs/select`

The API no longer serves hosted auth, publish, source upload, scan, critique, billing, organization, user, usage-metering, Supabase, Stripe, or PostHog routes.

## Shared Query Parameters

- `namespace` — defaults to `@official`; non-official namespaces are compatibility inputs, not public marketplace namespaces.
- `source` — retained for schema/client compatibility; active official corpus results use `official`.
- `sort` — `recommended`, `recent`, or `name`.
- `recommended=true` — return only recommended content.
- `intelligence_source` — `authored`, `benchmark`, or `hybrid`.
- `blueprint_set` — for blueprint list/search results: `all`, `featured`, `certified`, or `labs`.
- `limit` — page size.
- `offset` — result offset for pagination.

## Search

```http
GET /search?q=portfolio&type=blueprint&source=official&sort=recommended
GET /search?q=studio&type=blueprint&blueprint_set=certified
```

Purpose:
- full-text search across official Decantr content-corpus records.

Response schema:
- `search-response.v1.json`

## Content Lists

```http
GET /blueprints?source=official&sort=recommended
GET /blueprints?blueprint_set=featured
GET /patterns?limit=50&offset=0
GET /archetypes?namespace=@official&intelligence_source=authored
```

Supported list endpoints:
- `/patterns`
- `/themes`
- `/blueprints`
- `/archetypes`
- `/shells`

Response schema:
- `public-content-list.v1.json`

## Content Detail

```http
GET /blueprints/@official/portfolio
GET /patterns/@official/hero
```

Purpose:
- fetch a single official content record, including its typed `data` payload and intelligence metadata.

Response schema:
- `public-content-record.v1.json`

Thumbnail storage from the retired registry portal is not served by the content API.

## Schema Discovery

```http
GET /schema/search-response.v1.json
GET /schema/registry-intelligence-summary.v1.json
GET /schema/content-health-report.v1.json
```

Purpose:
- fetch published JSON Schemas backing Decantr contracts and content API responses.

All canonical schemas are also browsable at `https://decantr.ai/schemas/`.

## Execution Pack Compile

```http
POST /packs/compile?namespace=@official
Content-Type: application/json

{ "... valid Decantr Essence v4 document ...": true }
```

Purpose:
- compile a schema-backed execution-pack bundle from an Essence document using official content-corpus records.

Response schema:
- `execution-pack-bundle.v1.json`

## Selected Execution Pack

```http
POST /packs/select?namespace=@official
Content-Type: application/json

{
  "essence": { "... valid Decantr Essence v4 document ...": true },
  "pack_type": "page",
  "id": "home"
}
```

Purpose:
- return one schema-backed execution pack plus manifest metadata.

Response schema:
- `selected-execution-pack.v1.json`

## Showcase Benchmark Surfaces

```http
GET /showcase/manifest
GET /showcase/shortlist
GET /showcase/shortlist-verification
```

Purpose:
- inspect audited showcase corpus, shortlist metadata, and schema-backed verification reports.

Response schemas:
- `showcase-manifest.v1.json`
- `showcase-shortlist.v1.json`
- `showcase-shortlist-report.v1.json`

## Content Intelligence Summary

```http
GET /intelligence/summary?namespace=@official
```

Purpose:
- read a schema-backed aggregate rollup of official content intelligence coverage.

Response schema:
- `registry-intelligence-summary.v1.json`

The schema name retains `registry` for Decantr 3.x compatibility.

## CLI Equivalents

```bash
decantr search portfolio --type blueprint --sort recommended --recommended
decantr list blueprints --blueprint-set featured
decantr content summary --namespace @official --json
decantr content compile-packs decantr.essence.json --namespace @official --json
decantr content get-pack manifest --namespace @official --json
decantr content get-pack page home --namespace @official --json
```

Legacy `decantr registry ...` aliases remain callable for scripts.

## MCP Equivalents

- `decantr_registry` with search, content resolution, benchmark, intelligence summary, and execution-pack actions.
- `decantr_context` with `execution_pack` actions for compiled pack context.
- `decantr_verify` and `decantr_repair` for local verification evidence and repair loops.

`decantr_registry` is a compatibility tool name; Decantr 3.x does not add a ninth MCP content tool.

## Notes

- These endpoints are public read/compile surfaces.
- No endpoint accepts source uploads in the retained API.
- `pnpm audit:public-api` smokes the retained hosted surface.
- Content changes land through `packages/content` and package/API deployment, not a public registry publishing workflow.
