# Decantr Security And Permissions

Generated from `config/package-permissions.json`.
Do not edit manually. Run `node scripts/sync-security-permissions.mjs` after permission-surface changes.

This page describes the installed npm package surface, not every internal script, showcase app, fixture, or release helper in the monorepo. Static scanners that inspect the full repository can therefore report scary findings that do not ship in the packages users install.

## Quick Answers

- Decantr does not collect telemetry by default. CLI telemetry requires explicit opt-in through `--telemetry`, `decantr telemetry link --enable`, or `.decantr/project.json` with `telemetry: true`.
- Decantr browser evidence and screenshots are local artifacts under `.decantr/evidence/*`; the active Decantr 3.9 API does not accept source or screenshot uploads.
- MCP write tools are explicitly annotated and are contained to the active workspace root.
- Hosted critique/audit source upload fallbacks are retired in the active API. Compatibility flags such as `allow_hosted_upload` do not activate removed routes.
- Published packages use package `files` allowlists and the release audit runs `npm pack --dry-run --json` to prove what ships.

## Package Permission Matrix

| Package | Runtime | Filesystem | Network | Process | Telemetry | Hosted Upload | Local Artifacts | Ships |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@decantr/essence-spec` | library | read: Explicit essence/schema paths passed to validation helpers<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, schema, README.md, package.json |
| `@decantr/content` | content-corpus | read: Package-local official content JSON and schema files for local search, resolution, and validation helpers; Explicit local content JSON paths passed to filesystem resolver helpers<br>write: none<br>delete: none | outbound: Configured Decantr API base URL for content search, resolution, and execution-pack helpers<br>inbound: no | none | none | caller-controlled legacy client methods are retained for compatibility, but retired upload routes are not served by the active API | none | dist, schemas, patterns, themes, blueprints, archetypes, shells, README.md, package.json |
| `@decantr/registry` | library | read: Delegated @decantr/content reads for explicit local resolver paths and shipped corpus/schema access<br>write: none<br>delete: none | outbound: Delegated @decantr/content API client requests for 3.x compatibility content search, resolution, and pack helpers<br>inbound: no | none | none | caller-controlled | none | dist, schema, README.md, package.json |
| `@decantr/css` | css-runtime | read: none<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, README.md, package.json |
| `@decantr/core` | library | read: none<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, schema, README.md, package.json |
| `@decantr/telemetry` | library | read: none<br>write: none<br>delete: none | outbound: Caller-configured telemetry sink endpoint<br>inbound: no | none | library-only; events are emitted only when a caller creates a client and captures an event | not-supported | none | dist, README.md, package.json |
| `@decantr/verifier` | library | read: Selected project source and stylesheet files; Decantr context files; accepted .decantr/style-bridge.json when auditProject checks style bridge drift; read-only scan files for framework, route, styling, static-host, assistant-rule, source inventory, and Decantr presence signals; Angular workspace/build metadata and production TypeScript import graphs for read-only route-authority resolution; built dist/.next output when auditBuiltDist or auditProject needs runtime evidence<br>write: none<br>delete: none | outbound: Loopback fetches to the verifier-owned temporary static server during built-output runtime audit; Caller-provided published-site HTTP(S) URL when probePublishedSite is explicitly invoked<br>inbound: yes | none | none | not-supported | Evidence Bundle objects returned to callers; file writes are owned by the CLI/MCP caller | dist, schema, README.md, package.json |
| `@decantr/mcp-server` | mcp-server | read: Active workspace Decantr files, including .decantr/graph typed graph artifacts; selected project files for critique/audit/evidence tools; git changed-file state for task context<br>write: decantr.essence.json through explicit write tools; .decantr/drift-log.json through explicit drift deferral<br>delete: none | outbound: Content API reads; content API pack compilation<br>inbound: no | git diff with fixed argv and shell disabled for changed-file/task impact discovery | none | not-supported in Decantr 3.9; allow_hosted_upload is retained only as a compatibility option and does not activate retired API routes | Read/write tools are contained to the active workspace root | dist, server.json, THIRD_PARTY_NOTICES.md, README.md, package.json |
| `@decantr/cli` | cli | read: Selected project/workspace files, including project-local Playwright and axe-core packages when browser evidence is explicitly requested; bounded workspace file snapshots during explicit decantr init or decantr adopt for authored-source integrity receipts; package manifests; routing/style/config files; .decantr artifacts including .decantr/graph typed graph artifacts; Decantr cache/config files<br>write: decantr.essence.json; DECANTR.md; .decantr artifacts including the adoption receipt stored in .decantr/project.json; .decantr/drift-log.json through explicit resolve drift-log actions; generated context packs; .decantr/graph typed graph artifacts including local snapshot history; optional CI workflows/snippets; optional Cursor MCP/rule files through decantr connect cursor; .prettierignore entries for generated Decantr governance artifacts when a compatible formatter is detected; a deterministic marked `@source not` block in detected Tailwind v4 CSS entry files, with exact path and before/after hashes recorded in the adoption receipt; optional style/export files; Decantr config for auth/telemetry when explicitly enabled<br>delete: Generated Decantr artifacts or explicit command targets such as removed generated context/theme outputs | outbound: Content API reads; content API pack hydration; caller-configured private telemetry endpoints only; user-provided browser/base-url checks<br>inbound: yes | git diff with fixed argv; package manager/bootstrap commands with argv arrays; local Studio/browser/dev-server helper flows | disabled by default; opt-in records a local preference, and delivery occurs only when the caller explicitly configures a private endpoint | not-supported in Decantr 3.9; local verify/audit/scan do not upload source | .decantr/analysis.json; .decantr/context/*; .decantr/graph/*; .decantr/evidence/*; .decantr/drift-log.json; .decantr/local-patterns*.json; .decantr/rules*.json; .decantr/style-bridge*.json; .prettierignore; detected Tailwind v4 CSS entry files; .cursor/mcp.json; .cursor/rules/decantr.mdc | dist, src/templates, src/bundled, README.md, package.json |
| `@decantr/vite-plugin` | experimental-dev-plugin | read: Vite project files during opt-in local development<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, README.md, package.json |

## Scanner Notes

### `@decantr/essence-spec`

- Filesystem reads are explicit helper behavior for local validation, not background scanning.

### `@decantr/content`

- Local corpus search and validation read only shipped content unless a caller explicitly configures a filesystem resolver.
- The content API client performs network requests only when a caller invokes it; DECANTR_API_URL is preferred and REGISTRY_URL remains a compatibility fallback.
- Validation helpers run locally and do not call the hosted API or upload project source.

### `@decantr/registry`

- The package contains no independent resolver, ranking, wiring, or API implementation; it re-exports allowlisted @decantr/content compatibility symbols.
- Network access is delegated to the content API client; callers choose the base URL and operation. Retired critique/audit/publish methods remain legacy paths but are no longer served by the active API.
- New integrations should use @decantr/content directly.

### `@decantr/css`

- The CSS package is a legacy optional atom runtime and does not inspect projects.
- It is no longer the default Decantr greenfield adoption path.

### `@decantr/core`

- Schema URLs in emitted packs are identifiers, not network calls by themselves.

### `@decantr/telemetry`

- The package defines telemetry contracts and clients; it does not auto-start collection.

### `@decantr/verifier`

- scanProject is read-only and returns relative evidence; it does not write artifacts, install dependencies, build projects, execute scripts, or open pull requests.
- Angular route discovery excludes test, fixture, mock, E2E, and generated source before resolving bootstrap-reachable router authority.
- probePublishedSite fetches HTML metadata and asset hints over HTTP(S) only; it does not execute JavaScript or capture browser screenshots.
- Runtime audit starts a local loopback server for already-built assets; it does not contact external hosts.

### `@decantr/mcp-server`

- MCP write tools are annotated as write tools and use workspace-root path containment.
- Hosted source upload fallbacks are retired in the active API.
- The npm package bundles the MCP SDK modules used by stdio and does not install the SDK's unused HTTP dependency tree.

### `@decantr/cli`

- The CLI is intentionally a local project inspector and artifact writer.
- Explicit initialization and Brownfield adoption take bounded before/after hashes without following symlinks so the stored receipt can distinguish Decantr-managed writes from authored source changes. Tailwind v4 source-scan isolation is an explicit narrow exception: only a marked `@source not` block in a detected CSS entry is approved, and its path plus exact before/after hashes are stored; any unclassified mutation or hash mismatch is incomplete adoption truth.
- decantr scan is local read-only reconnaissance; it writes no .decantr directory or report files and does not upload source.
- Process execution is limited to fixed command/argv paths; shell execution is avoided in shipped workflow code.
- Visual evidence screenshots remain local in Decantr 3.9.
- Optional axe accessibility evidence loads only a project/workspace-local axe-core package and records local probe summaries.
- The CLI has no Decantr-hosted telemetry default; event and identity delivery require separate explicit caller-controlled endpoints.

### `@decantr/vite-plugin`

- Experimental sidecar; not part of the default reliability layer or publish wave.

## Release Checks

The normal package-surface audit now verifies both the support matrix and the permission surface:

```bash
pnpm audit:package-surface
```

For permission-only work, run:

```bash
pnpm audit:package-permissions
```

The audit checks every public package in `config/package-surface.json`, validates that the permissions manifest covers it, runs `npm pack --dry-run --json`, rejects install-time lifecycle scripts, and compares this generated document against the checked-in copy.
