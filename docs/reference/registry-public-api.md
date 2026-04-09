# Registry Public API

This reference describes the public registry and hosted compiler endpoints that power the Decantr portal, CLI, MCP lookups, and external tooling.

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

## Public Schema Discovery

```http
GET /schema/search-response.v1.json
GET /schema/registry-intelligence-summary.v1.json
```

Purpose:
- fetch the published JSON Schemas backing public Decantr contracts

Notes:
- all canonical schemas are also browsable at `https://decantr.ai/schemas/`
- schema names match the files served from that index

## Hosted Execution Pack Compile

```http
POST /packs/compile?namespace=@official
Content-Type: application/json

{
  "version": "2.0.0",
  "archetype": "dashboard",
  "theme": { "id": "clean", "mode": "light" },
  "personality": ["professional"],
  "platform": { "type": "spa", "routing": "history" },
  "structure": [{ "id": "home", "shell": "sidebar-main", "layout": ["hero"] }],
  "features": ["auth"],
  "density": { "level": "comfortable", "content_gap": "1.5rem" },
  "guard": { "mode": "guided" },
  "target": "react"
}
```

Purpose:
- compile a schema-backed execution-pack bundle from an essence document using hosted public registry content

Notes:
- request body must be a valid Decantr essence document
- `namespace` is optional and defaults to `@official`
- the API prefers the requested namespace first, then falls back to `@official` for public content resolution

Response schema:
- `execution-pack-bundle.v1.json`
- `https://decantr.ai/schemas/execution-pack-bundle.v1.json`

## Hosted Selected Execution Pack

```http
POST /packs/select?namespace=@official
Content-Type: application/json

{
  "essence": {
    "version": "2.0.0",
    "archetype": "dashboard",
    "theme": { "id": "clean", "mode": "light" },
    "personality": ["professional"],
    "platform": { "type": "spa", "routing": "history" },
    "structure": [{ "id": "home", "shell": "sidebar-main", "layout": ["hero"] }],
    "features": ["auth"],
    "density": { "level": "comfortable", "content_gap": "1.5rem" },
    "guard": { "mode": "guided" },
    "target": "react"
  },
  "pack_type": "page",
  "id": "home"
}
```

Purpose:
- compile and return one schema-backed execution pack plus the manifest metadata needed to place it in the broader bundle

Notes:
- request body must include a valid Decantr essence document on `essence`
- `pack_type` must be one of `scaffold`, `review`, `section`, `page`, or `mutation`
- `id` is required for `section`, `page`, and `mutation` selection
- `namespace` is optional and defaults to `@official`
- this is the preferred hosted surface when a client already knows which pack it needs

Response schema:
- `selected-execution-pack.v1.json`
- `https://decantr.ai/schemas/selected-execution-pack.v1.json`

## Hosted File Critique

```http
POST /critique/file?namespace=@official
Content-Type: application/json

{
  "essence": {
    "version": "2.0.0",
    "archetype": "dashboard",
    "theme": { "id": "clean", "mode": "light" },
    "personality": ["professional"],
    "platform": { "type": "spa", "routing": "history" },
    "structure": [{ "id": "home", "shell": "sidebar-main", "layout": ["hero"] }],
    "features": ["auth"],
    "density": { "level": "comfortable", "content_gap": "1.5rem" },
    "guard": { "mode": "guided" },
    "target": "react"
  },
  "filePath": "src/pages/Home.tsx",
  "code": "<button style={{ color: \"#ff00ff\" }}>Click me</button>",
  "treatmentsCss": ".brand-accent { color: var(--d-primary); }"
}
```

Purpose:
- critique inline file contents against a hosted review-pack contract compiled from the posted essence document

Notes:
- request body must include a valid Decantr essence document on `essence`
- request body must include a non-empty source string on `code`
- `filePath` is optional but recommended so findings can anchor to a meaningful path
- `treatmentsCss` is optional and lets hosted critique account for local decorator inventory
- `namespace` is optional and defaults to `@official`

Response schema:
- `file-critique-report.v1.json`
- `https://decantr.ai/schemas/file-critique-report.v1.json`

## Hosted Project Audit

```http
POST /audit/project?namespace=@official
Content-Type: application/json

{
  "essence": {
    "version": "2.0.0",
    "archetype": "dashboard",
    "theme": { "id": "clean", "mode": "light" },
    "personality": ["professional"],
    "platform": { "type": "spa", "routing": "history" },
    "structure": [{ "id": "home", "shell": "sidebar-main", "layout": ["hero"] }],
    "features": ["auth"],
    "density": { "level": "comfortable", "content_gap": "1.5rem" },
    "guard": { "mode": "guided" },
    "target": "react"
  },
  "dist": {
    "indexHtml": "<!doctype html><html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Audit</title></head><body><div id=\"root\"></div><script type=\"module\" src=\"/assets/app.js\"></script></body></html>",
    "assets": {
      "/assets/app.js": "console.log(\"/\");"
    }
  },
  "sources": {
    "files": {
      "src/pages/Home.tsx": "export function Home() { return <button style={{ color: '#ff00ff' }}>Hi</button>; }"
    }
  }
}
```

Purpose:
- run the shared Decantr project audit remotely by compiling hosted execution packs from the posted essence and optionally replaying runtime verification against posted dist and source snapshots

Notes:
- request body must include a valid Decantr essence document on `essence`
- `dist` is optional; without it the hosted audit still verifies schema, topology, and compiled-pack presence, but runtime checks stay pending
- when `dist` is included, `indexHtml` is required and `assets` should provide the JS/CSS files referenced from that root document
- `sources` is optional; when provided, `files` should contain relative source paths mapped to UTF-8 file contents so hosted audit can aggregate source-level verifier findings
- `namespace` is optional and defaults to `@official`

Response schema:
- `project-audit-report.v1.json`
- `https://decantr.ai/schemas/project-audit-report.v1.json`

## Showcase Benchmark Surfaces

```http
GET /showcase/manifest
GET /showcase/shortlist
GET /showcase/shortlist-verification
```

Purpose:
- inspect the audited showcase corpus, shortlist metadata, and schema-backed shortlist verification report

Response schemas:
- `showcase-manifest.v1.json`
- `showcase-shortlist.v1.json`
- `showcase-shortlist-report.v1.json`

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
decantr registry compile-packs decantr.essence.json --namespace @official --json
decantr registry get-pack page home --namespace @official --json
decantr registry critique-file src/pages/Home.tsx --namespace @official --json
decantr registry audit-project --namespace @official --json
```

## MCP Equivalents

- `decantr_search_registry`
- `decantr_get_registry_intelligence_summary`
- `decantr_get_showcase_benchmarks`
- `decantr_get_execution_pack`
- `decantr_compile_execution_packs`
- `decantr_critique`
- `decantr_audit_project`

## Notes

- These endpoints are read-only public surfaces.
- Optional hosted mutation/verification checks can be included in the public audit with:
  - `--include-hosted-pack-select`
  - `--include-hosted-critique`
  - `--include-hosted-project-audit`
- Intelligence metadata may lag behind repo-local changes until the hosted API and official content sync are deployed.
- During rollout, the content-repo audits are the fastest way to see repo-vs-live mismatches.
- For a lightweight hosted-surface smoke check from the monorepo, run `pnpm audit:public-api`.
