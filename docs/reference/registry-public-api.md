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
- `source` — scope results to `official`, `community`, or `organization`
- `sort` — `recommended`, `recent`, or `name`
- `recommended=true` — return only recommended content
- `intelligence_source` — `authored`, `benchmark`, or `hybrid`
- `blueprint_set` — for blueprint list/search results: `all`, `featured`, `certified`, or `labs`
- `limit` — page size
- `offset` — result offset for pagination

## Search

```http
GET /search?q=portfolio&type=blueprint&source=official&sort=recommended
GET /search?q=studio&type=blueprint&blueprint_set=certified
```

Purpose:
- full-text search across public registry content

Response schema:
- `search-response.v1.json`
- `https://decantr.ai/schemas/search-response.v1.json`

Notable response fields:
- `total`
- `results[]`
- `results[].thumbnail_url`
- `results[].blueprint_portfolio` for blueprint summaries
- `results[].intelligence`

## Public Lists

```http
GET /blueprints?source=official&sort=recommended
GET /blueprints?blueprint_set=featured
GET /blueprints?blueprint_set=labs
GET /patterns?source=community&limit=50&offset=0
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
- `items[].thumbnail_url`
- `items[].blueprint_portfolio` for blueprint summaries
- `items[].intelligence`

Blueprint lists/searches exclude Labs and folded slugs by default. `blueprint_set=labs` shows Labs only, `blueprint_set=featured` shows curated default picks, and `blueprint_set=certified` shows blueprints with certified artifact metadata. Direct detail routes remain slug-based for published records.

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

Additional media route:

```http
GET /blueprints/@official/portfolio/thumbnail
```

Purpose:
- fetch the public thumbnail asset for a published registry item when one has been uploaded

## Public Schema Discovery

```http
GET /schema/search-response.v1.json
GET /schema/registry-intelligence-summary.v1.json
GET /schema/content-health-report.v1.json
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
  "version": "4.0.0",
  "dna": {
    "theme": { "id": "clean", "mode": "light", "shape": "rounded" },
    "spacing": { "base_unit": 4, "scale": "linear", "density": "comfortable", "content_gap": "_gap4" },
    "typography": { "scale": "modular", "heading_weight": 600, "body_weight": 400 },
    "color": { "palette": "semantic", "accent_count": 1, "cvd_preference": "auto" },
    "radius": { "philosophy": "rounded", "base": 8 },
    "elevation": { "system": "layered", "max_levels": 3 },
    "motion": { "preference": "subtle", "duration_scale": 1, "reduce_motion": true },
    "accessibility": { "wcag_level": "AA", "focus_visible": true, "skip_nav": true },
    "personality": ["professional"]
  },
  "blueprint": {
    "shell": "sidebar-main",
    "sections": [
      {
        "id": "dashboard",
        "role": "primary",
        "shell": "sidebar-main",
        "description": "Primary dashboard section",
        "features": ["auth"],
        "pages": [{ "id": "home", "route": "/", "layout": ["hero"] }]
      }
    ],
    "features": ["auth"],
    "routes": { "/": { "section": "dashboard", "page": "home" } }
  },
  "meta": {
    "archetype": "saas-dashboard",
    "target": "react",
    "platform": { "type": "spa", "routing": "history" },
    "guard": { "mode": "guided", "dna_enforcement": "warn", "blueprint_enforcement": "warn" }
  }
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
    "version": "4.0.0",
    "dna": {
      "theme": { "id": "clean", "mode": "light", "shape": "rounded" },
      "spacing": { "base_unit": 4, "scale": "linear", "density": "comfortable", "content_gap": "_gap4" },
      "typography": { "scale": "modular", "heading_weight": 600, "body_weight": 400 },
      "color": { "palette": "semantic", "accent_count": 1, "cvd_preference": "auto" },
      "radius": { "philosophy": "rounded", "base": 8 },
      "elevation": { "system": "layered", "max_levels": 3 },
      "motion": { "preference": "subtle", "duration_scale": 1, "reduce_motion": true },
      "accessibility": { "wcag_level": "AA", "focus_visible": true, "skip_nav": true },
      "personality": ["professional"]
    },
    "blueprint": {
      "shell": "sidebar-main",
      "sections": [
        {
          "id": "dashboard",
          "role": "primary",
          "shell": "sidebar-main",
          "description": "Primary dashboard section",
          "features": ["auth"],
          "pages": [{ "id": "home", "route": "/", "layout": ["hero"] }]
        }
      ],
      "features": ["auth"],
      "routes": { "/": { "section": "dashboard", "page": "home" } }
    },
    "meta": {
      "archetype": "saas-dashboard",
      "target": "react",
      "platform": { "type": "spa", "routing": "history" },
      "guard": { "mode": "guided", "dna_enforcement": "warn", "blueprint_enforcement": "warn" }
    }
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
    "version": "4.0.0",
    "dna": {
      "theme": { "id": "clean", "mode": "light", "shape": "rounded" },
      "spacing": { "base_unit": 4, "scale": "linear", "density": "comfortable", "content_gap": "_gap4" },
      "typography": { "scale": "modular", "heading_weight": 600, "body_weight": 400 },
      "color": { "palette": "semantic", "accent_count": 1, "cvd_preference": "auto" },
      "radius": { "philosophy": "rounded", "base": 8 },
      "elevation": { "system": "layered", "max_levels": 3 },
      "motion": { "preference": "subtle", "duration_scale": 1, "reduce_motion": true },
      "accessibility": { "wcag_level": "AA", "focus_visible": true, "skip_nav": true },
      "personality": ["professional"]
    },
    "blueprint": {
      "shell": "sidebar-main",
      "sections": [
        {
          "id": "dashboard",
          "role": "primary",
          "shell": "sidebar-main",
          "description": "Primary dashboard section",
          "features": ["auth"],
          "pages": [{ "id": "home", "route": "/", "layout": ["hero"] }]
        }
      ],
      "features": ["auth"],
      "routes": { "/": { "section": "dashboard", "page": "home" } }
    },
    "meta": {
      "archetype": "saas-dashboard",
      "target": "react",
      "platform": { "type": "spa", "routing": "history" },
      "guard": { "mode": "guided", "dna_enforcement": "warn", "blueprint_enforcement": "warn" }
    }
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
- shared definitions: `verification-report.common.v1.json`
- `https://decantr.ai/schemas/verification-report.common.v1.json`

## Hosted Project Audit

```http
POST /audit/project?namespace=@official
Content-Type: application/json

{
  "essence": {
    "version": "4.0.0",
    "dna": {
      "theme": { "id": "clean", "mode": "light", "shape": "rounded" },
      "spacing": { "base_unit": 4, "scale": "linear", "density": "comfortable", "content_gap": "_gap4" },
      "typography": { "scale": "modular", "heading_weight": 600, "body_weight": 400 },
      "color": { "palette": "semantic", "accent_count": 1, "cvd_preference": "auto" },
      "radius": { "philosophy": "rounded", "base": 8 },
      "elevation": { "system": "layered", "max_levels": 3 },
      "motion": { "preference": "subtle", "duration_scale": 1, "reduce_motion": true },
      "accessibility": { "wcag_level": "AA", "focus_visible": true, "skip_nav": true },
      "personality": ["professional"]
    },
    "blueprint": {
      "shell": "sidebar-main",
      "sections": [
        {
          "id": "dashboard",
          "role": "primary",
          "shell": "sidebar-main",
          "description": "Primary dashboard section",
          "features": ["auth"],
          "pages": [{ "id": "home", "route": "/", "layout": ["hero"] }]
        }
      ],
      "features": ["auth"],
      "routes": { "/": { "section": "dashboard", "page": "home" } }
    },
    "meta": {
      "archetype": "saas-dashboard",
      "target": "react",
      "platform": { "type": "spa", "routing": "history" },
      "guard": { "mode": "guided", "dna_enforcement": "warn", "blueprint_enforcement": "warn" }
    }
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
- shared definitions: `verification-report.common.v1.json`
- `https://decantr.ai/schemas/verification-report.common.v1.json`

## Hosted Brownfield Scan

```http
POST /scan
Content-Type: application/json

{
  "url": "https://github.com/owner/repo"
}
```

Accepted input:
- public GitHub repository URLs, such as `https://github.com/owner/repo`
- GitHub Pages URLs, such as `https://owner.github.io/repo/`

Purpose:
- power the public `/scan` page with a look-don't-touch Brownfield report
- resolve the repository and likely GitHub Pages counterpart when possible
- clone public GitHub source into a temporary checkout, run the shared read-only scanner, probe the published Pages site with HTTP-only HTML metadata checks, and return an ephemeral `ScanReportV1`

Trust posture:
- no dependency install, project build, script execution, browser screenshot, report persistence, or pull request/issue creation
- source and report data are discarded after the request completes
- non-web repositories return `not_applicable` messaging rather than failing the request

Response schema:
- `scan-report.v1.json`
- `https://decantr.ai/schemas/scan-report.v1.json`
- shared definitions: `verification-report.common.v1.json`

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
- shared report definitions: `verification-report.common.v1.json`

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
decantr registry get-pack manifest --namespace @official --json
decantr registry get-pack page home --namespace @official --json
decantr registry critique-file src/pages/Home.tsx --namespace @official --json
decantr registry audit-project --namespace @official --json
decantr scan --json
```

## MCP Equivalents

- `decantr_registry` with `search`, `summary`, `benchmarks`, and registry resolution actions.
- `decantr_context` with `execution_pack` actions for compiled pack context.
- `decantr_verify` with `critique`, `audit_project`, and `evidence_bundle` actions.
- `decantr_repair` with `findings`, `repair_plan`, and `health_loop` actions.

## Notes

- These endpoints are read-only public surfaces.
- `POST /v1/scan` is read-only from Decantr's perspective but performs a temporary public GitHub clone for the submitted repository URL.
- `pnpm audit:public-api` now audits the full hosted surface by default, including:
  - `POST /v1/packs/select`
  - `POST /v1/critique/file`
  - `POST /v1/audit/project`
- The individual `--include-hosted-*` flags still exist for direct script use when needed.
- Intelligence metadata may lag behind repo-local changes until the hosted API and official content sync are deployed.
- During rollout, the content-repo audits are the fastest way to see repo-vs-live mismatches.
- For a lightweight hosted-surface smoke check from the monorepo, run `pnpm audit:public-api`.
