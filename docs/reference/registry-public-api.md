# Registry Public API

This reference describes the public, read-only registry endpoints that power the Decantr portal, CLI, MCP lookups, and external tooling.

Base URL:

```text
https://api.decantr.ai/v1
```

Canonical response schemas are published at `https://decantr.ai/schemas/`.

## Shared Query Parameters

These parameters are supported wherever noted below:

- `namespace` — scope results to a namespace such as `@official`
- `sort` — `recommended`, `recent`, or `name`
- `recommended=true` — return only recommended content
- `intelligence_source` — `authored`, `benchmark`, or `hybrid`
- `limit` — page size
- `offset` — result offset for pagination

## Search

```http
GET /search?q=portfolio&type=blueprint&sort=recommended&recommended=true&intelligence_source=hybrid
```

Purpose:
- full-text search across public registry content

Response schema:
- `search-response.v1.json`
- `https://decantr.ai/schemas/search-response.v1.json`

Notable response fields:
- `total`
- `results[]`
- `results[].intelligence`

## Public Lists

```http
GET /blueprints?namespace=@official&sort=recommended&recommended=true
GET /patterns?namespace=@official&limit=50&offset=0
GET /archetypes?namespace=@official&intelligence_source=authored
```

Supported list endpoints:
- `/patterns`
- `/themes`
- `/blueprints`
- `/archetypes`
- `/shells`

Purpose:
- browse one public content type with shared ranking and intelligence filters

Response schema:
- `public-content-list.v1.json`
- `https://decantr.ai/schemas/public-content-list.v1.json`

Notable response fields:
- `total`
- `items[]`
- `items[].intelligence`

## Public Detail

```http
GET /blueprints/@official/portfolio
GET /patterns/@official/hero
```

Purpose:
- fetch a single public content record, including its typed `data` payload and any attached intelligence metadata

Response schema:
- `public-content-record.v1.json`
- `https://decantr.ai/schemas/public-content-record.v1.json`

## Registry Intelligence Summary

```http
GET /intelligence/summary?namespace=@official
```

Purpose:
- read a schema-backed aggregate rollup of public registry intelligence coverage without crawling every content item

Response schema:
- `registry-intelligence-summary.v1.json`
- `https://decantr.ai/schemas/registry-intelligence-summary.v1.json`

Summary fields:
- `totals.total_public_items`
- `totals.with_intelligence`
- `totals.recommended`
- `totals.authored`
- `totals.benchmark`
- `totals.hybrid`
- `totals.missing_source`
- `totals.smoke_green`
- `totals.build_green`
- `totals.high_confidence`
- `by_type.<type>` with the same counters for `pattern`, `theme`, `blueprint`, `archetype`, and `shell`

This endpoint is intended for:
- rollout audits
- portal summary surfaces
- CLI/MCP quick checks
- external monitoring of intelligence coverage

## CLI Equivalents

```bash
decantr search portfolio --type blueprint --sort recommended --recommended --source hybrid
decantr list blueprints --source authored
decantr registry summary --namespace @official --json
```

## MCP Equivalents

- `decantr_search_registry`
- `decantr_get_registry_intelligence_summary`
- `decantr_get_showcase_benchmarks`

## Notes

- These endpoints are read-only public surfaces.
- Intelligence metadata may lag behind repo-local changes until the hosted API and official content sync are deployed.
- During rollout, the content-repo audits are the fastest way to see repo-vs-live mismatches.
- For a lightweight hosted-surface smoke check from the monorepo, run `pnpm audit:public-api`.
