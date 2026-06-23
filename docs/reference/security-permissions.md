# Decantr Security And Permissions

Generated from `config/package-permissions.json`.
Do not edit manually. Run `node scripts/sync-security-permissions.mjs` after permission-surface changes.

This page describes the installed npm package surface, not every internal script, showcase app, fixture, or release helper in the monorepo. Static scanners that inspect the full repository can therefore report scary findings that do not ship in the packages users install.

## Quick Answers

- Decantr does not collect telemetry by default. CLI telemetry requires explicit opt-in through `--telemetry`, `decantr telemetry link --enable`, or `.decantr/project.json` with `telemetry: true`.
- Decantr browser evidence and screenshots are local artifacts under `.decantr/evidence/*` unless a user explicitly invokes a hosted workflow.
- MCP write tools are explicitly annotated and are contained to the active workspace root.
- Hosted critique/audit source upload fallbacks are opt-in and require `allow_hosted_upload: true` on the MCP surface or an explicit hosted CLI command.
- Published packages use package `files` allowlists and the release audit runs `npm pack --dry-run --json` to prove what ships.

## Package Permission Matrix

| Package | Runtime | Filesystem | Network | Process | Telemetry | Hosted Upload | Local Artifacts | Ships |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@decantr/essence-spec` | library | read: Explicit essence/schema paths passed to validation helpers<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, schema, README.md, package.json |
| `@decantr/registry` | library | read: Explicit local registry JSON paths passed to resolver helpers<br>write: none<br>delete: none | outbound: Configured Decantr registry/API base URL for search, resolve, hosted packs, critique, and audit helpers<br>inbound: no | none | none | caller-controlled | none | dist, schema, README.md, package.json |
| `@decantr/css` | css-runtime | read: none<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, README.md, package.json |
| `@decantr/core` | library | read: none<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, schema, README.md, package.json |
| `@decantr/telemetry` | library | read: none<br>write: none<br>delete: none | outbound: Caller-configured telemetry sink endpoint<br>inbound: no | none | library-only; events are emitted only when a caller creates a client and captures an event | not-supported | none | dist, README.md, package.json |
| `@decantr/verifier` | library | read: Selected project source and stylesheet files; Decantr context files; accepted .decantr/style-bridge.json when auditProject checks style bridge drift; read-only scan files for framework, route, styling, static-host, assistant-rule, source inventory, and Decantr presence signals; built dist/.next output when auditBuiltDist or auditProject needs runtime evidence<br>write: none<br>delete: none | outbound: Loopback fetches to the verifier-owned temporary static server during built-output runtime audit; Caller-provided published-site HTTP(S) URL when probePublishedSite is explicitly invoked<br>inbound: yes | none | none | not-supported | Evidence Bundle objects returned to callers; file writes are owned by the CLI/MCP caller | dist, schema, README.md, package.json |
| `@decantr/mcp-server` | mcp-server | read: Active workspace Decantr files, including .decantr/graph typed graph artifacts; selected project files for critique/audit/evidence tools; git changed-file state for task context<br>write: decantr.essence.json through explicit write tools; .decantr/drift-log.json through explicit drift deferral<br>delete: none | outbound: Registry/API reads; hosted pack compilation; hosted critique/audit only when allow_hosted_upload is true<br>inbound: no | git diff with fixed argv and shell disabled for changed-file/task impact discovery | none | opt-in via allow_hosted_upload=true for critique/audit source upload fallbacks | Read/write tools are contained to the active workspace root | dist, README.md, package.json |
| `@decantr/cli` | cli | read: Selected project/workspace files, including project-local Playwright and axe-core packages when browser evidence is explicitly requested; package manifests; routing/style/config files; .decantr artifacts including .decantr/graph typed graph artifacts; Decantr cache/config files<br>write: decantr.essence.json; DECANTR.md; .decantr artifacts; .decantr/drift-log.json through explicit resolve drift-log actions; generated context packs; .decantr/graph typed graph artifacts including local snapshot history; optional CI workflows/snippets; optional style/export files; Decantr config for auth/telemetry when explicitly enabled<br>delete: Generated Decantr artifacts or explicit command targets such as removed generated context/theme outputs | outbound: Hosted registry/API reads; hosted pack hydration; hosted critique/audit commands; opt-in telemetry endpoints; user-provided browser/base-url checks<br>inbound: yes | git diff with fixed argv; package manager/bootstrap commands with argv arrays; local Studio/browser/dev-server helper flows | disabled by default; enabled only by --telemetry, decantr telemetry link --enable, or project.json telemetry=true | explicit command behavior; source upload is limited to hosted critique/audit flows and never required for local verify | .decantr/analysis.json; .decantr/context/*; .decantr/graph/*; .decantr/evidence/*; .decantr/drift-log.json; .decantr/local-patterns*.json; .decantr/rules*.json; .decantr/style-bridge*.json | dist, src/templates, src/bundled, README.md, package.json |
| `@decantr/vite-plugin` | experimental-dev-plugin | read: Vite project files during opt-in local development<br>write: none<br>delete: none | outbound: none<br>inbound: no | none | none | not-supported | none | dist, README.md, package.json |

## Scanner Notes

### `@decantr/essence-spec`

- Filesystem reads are explicit helper behavior for local validation, not background scanning.

### `@decantr/registry`

- Network access is the package's API client surface; callers choose the base URL and operation.

### `@decantr/css`

- The CSS package is a framework-agnostic atom runtime and does not inspect projects.

### `@decantr/core`

- Schema URLs in emitted packs are identifiers, not network calls by themselves.

### `@decantr/telemetry`

- The package defines telemetry contracts and clients; it does not auto-start collection.

### `@decantr/verifier`

- scanProject is read-only and returns relative evidence; it does not write artifacts, install dependencies, build projects, execute scripts, or open pull requests.
- probePublishedSite fetches HTML metadata and asset hints over HTTP(S) only; it does not execute JavaScript or capture browser screenshots.
- Runtime audit starts a local loopback server for already-built assets; it does not contact external hosts.

### `@decantr/mcp-server`

- MCP write tools are annotated as write tools and use workspace-root path containment.
- Hosted source upload fallbacks are disabled unless allow_hosted_upload is explicitly true.

### `@decantr/cli`

- The CLI is intentionally a local project inspector and artifact writer.
- decantr scan is local read-only reconnaissance; it writes no .decantr directory or report files and does not upload source.
- Process execution is limited to fixed command/argv paths; shell execution is avoided in shipped workflow code.
- Visual evidence screenshots remain local unless the user invokes a hosted workflow.
- Optional axe accessibility evidence loads only a project/workspace-local axe-core package and records local probe summaries.

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
