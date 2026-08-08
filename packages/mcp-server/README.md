# @decantr/mcp-server

[![npm version](https://img.shields.io/npm/v/@decantr/mcp-server?style=flat-square)](https://www.npmjs.com/package/@decantr/mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/@decantr/mcp-server?style=flat-square)](https://www.npmjs.com/package/@decantr/mcp-server)
[![license](https://img.shields.io/npm/l/@decantr/mcp-server?style=flat-square)](./LICENSE)
[![MCP compatible](https://img.shields.io/badge/MCP-compatible-0096FF?style=flat-square)](https://modelcontextprotocol.io)

Support status: `core-supported`  
Release channel: `stable`

Stable Decantr 3.11.2 MCP integration for Changed-UI Assurance, local project state, authority-aware route and non-route task context, graph and evidence reads, and repair prompts.

## Release Boundary

The published npm package is 3.11.2. Its eight tool IDs, route-backed `TaskCapsuleV1` path, authority-aware target discovery, verification actions, and compatibility envelopes are stable. The existing `decantr_verify` tool adds action `changes`, which returns the same `change-assurance-report.v1` used by bare CLI verify and explicit CI v3. No ninth tool is added.

![Decantr MCP demo](https://raw.githubusercontent.com/decantr-ai/decantr/main/packages/mcp-server/assets/decantr-demo.gif)

- **Observe project state** -- inspect shared discovery metadata, the project-owned Contract, accepted local rules, typed graph, and adoption truth
- **Prepare route context** -- resolve an attached route through current graph and production-route authority into a compact source-ranked task capsule
- **Verify diffs** -- evaluate local work against available authority and return stable findings, health state, and evidence without uploading source
- **Report and repair** -- expose typed evidence, scoped repair plans, and repair prompts that any coding agent can consume

Decantr does not invoke an agent, generate the edit, replace the host project's design system, or require an account for its local workflow.

## Quick Setup

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["@decantr/mcp-server@3.11.2"]
    }
  }
}
```

Restart Claude Desktop. The Decantr tools will appear automatically.

### Cursor

Preferred setup:

```bash
npx @decantr/cli@3.11.2 connect cursor
```

From a monorepo root:

```bash
pnpm exec decantr connect cursor --project apps/web
```

The connector preserves existing MCP servers and writes the project rule that tells Cursor Agent to request route-backed Decantr task context before route edits. For manual setup, create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["-y", "@decantr/mcp-server@3.11.2"]
    }
  }
}
```

Restart Cursor. The tools are available in Agent mode. Add a project rule equivalent to `decantr connect cursor` if you configure MCP manually.

### Windsurf

Add to your Windsurf MCP config (`~/.windsurf/mcp.json`):

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["@decantr/mcp-server@3.11.2"]
    }
  }
}
```

### VS Code

Create `.vscode/mcp.json` in your workspace (or add to your user profile `mcp.json`):

```json
{
  "servers": {
    "decantr": {
      "command": "npx",
      "args": ["-y", "@decantr/mcp-server@3.11.2"]
    }
  }
}
```

MCP tools are available in VS Code Copilot Chat agent mode.

### Zed

Add to your Zed `settings.json`:

```json
{
  "context_servers": {
    "decantr": {
      "command": "npx",
      "args": ["-y", "@decantr/mcp-server@3.11.2"],
      "env": {}
    }
  }
}
```

### Continue.dev

Create `.continue/mcpServers/decantr.yaml` in your workspace:

```yaml
name: Decantr MCP Server
version: 0.0.1
schema: v1
mcpServers:
  - name: Decantr
    type: stdio
    command: npx
    args:
      - "-y"
      - "@decantr/mcp-server@3.11.2"
```

MCP tools are only available in Continue.dev agent mode.

## Key Tools

The server exposes a hard 8-tool MCP surface. Pass an `action` to select the routed behavior:

| Tool | Description | Example Input |
|------|-------------|---------------|
| `decantr_project` | Read local project state, shared discovery summary, adoption truth, and workspace health | `{ "action": "state", "project_path": "apps/web" }` |
| `decantr_contract` | Read and validate the project-owned Contract, inspect drift, create a compatibility skeleton, or read its capsule | `{ "action": "validate", "path": "./decantr.essence.json" }` |
| `decantr_context` | Read scaffold, section, page, execution-pack context, or prepare an attached route-backed task capsule | `{ "action": "task", "project_path": "apps/web", "route": "/feed", "task": "improve loading behavior" }` |
| `decantr_graph` | Read, query, and traverse local graph and source evidence for route-scoped work | `{ "action": "query", "project_path": "apps/web", "file_path": "src/app/page.tsx", "include_impact": true }` |
| `decantr_registry` | Legacy-named compatibility access to official corpus vocabulary, benchmark metadata, and execution packs | `{ "action": "resolve_pattern", "id": "data-table", "preset": "product" }` |
| `decantr_verify` | Return Changed-UI Assurance, critique, findings, health state, or v2 evidence bundles | `{ "action": "changes", "project_path": "apps/web" }` |
| `decantr_repair` | Turn typed findings into scoped repair plans, prompts, and v2 health-loop guidance | `{ "action": "health_loop", "project_path": "apps/web" }` |
| `decantr_contract_write` | Explicit workspace-contained write surface for accepting drift or updating Essence v4 | `{ "action": "update_essence", "operation": "add_feature", "payload": { "feature": "billing" } }` |

For an attached route, pass `route` or the compatible `page_id` to the `task` action. Compact mode projects the verifier-owned `TaskCapsuleV1` into the existing response fields and remains within 12,000 canonical UTF-8 bytes / 4,000 estimated tokens. Missing or stale graph evidence reports `blocked_missing_graph`; incomplete Angular production-route authority reports `DISCOVERY_NOT_PROVEN`. Neither condition selects an implementation source by guess.

Local scaffold, page, and section paths selected by `pack-manifest.json` are read or emitted as task read targets only when they resolve to real files contained under the selected project's `.decantr/context` directory. Missing, escaped, directory, and symlink-escaped references are ignored; existing `scaffold.md` and `section-<id>.md` narrative context remains the local fallback. In Greenfield `style-bridge` adoption, the accepted bridge maps onto the host project's tokens, classes, and styling runtime; it does not activate `@decantr/css`.

`decantr_project` state includes verifier-built `AdoptionTruthV1`. Official corpus actions under the compatibility-named `decantr_registry` tool use `@decantr/content` implementations; there is no ninth `decantr_content` tool.

`decantr_verify` action `changes` is zero-write and adoption-free. It resolves the current Git change, selects one changed UI app only when provable, and emits at most three consequential findings by default. Multi-app ambiguity, unavailable Git scope, and unresolved authority return `not_proven`. Primitive-reuse assurance is strongest for JSX/TSX in 3.11; template parity remains limited.

## 3.10 Authority-Aware Discovery

The `decantr_context` task input accepts `target`: a route path, exact surface ID, component name, `kind:name`, or `file:path`. It resolves every target from live verifier discovery and does not promote saved analysis, graph guesses, tests, fixtures, stories, or generated output to production-route authority. Unknown, ambiguous, inferred, unresolved, or non-taskable targets return an error with no edit read set.

Next file routes that are hidden by statically resolved middleware/proxy non-success policy are valid discovery surfaces but non-taskable MCP targets. If that policy is path-dependent and cannot be resolved, task preparation returns blocked authority instead of selecting a route by convention alone. TanStack generated metadata may corroborate an authored route's public path but is advisory evidence, never the implementation target. Astro response endpoints and TanStack/Angular layouts or fallbacks remain non-taskable. Angular task reads include statically resolved external templates, component styles, and workspace secondary-entry source. Ranked style reads retain production CSS import order, including workspace package exports. Attached route compatibility responses include the same verifier-ranked read set as CLI, exclude generated governance churn from changed-source impact, and shed compatibility-only detail before exceeding the task-capsule budget.

Authoritative non-route and unadopted targets return the separate `ui-surface-task-context.v1` discovery envelope with bounded reads and explicit limitations. A standalone component or story remains project-reference evidence rather than proof of runtime reachability. An adopted route continues to use the compatible `TaskCapsuleV1` contract.

## Product Boundary

The MCP server's core is the local Observe -> Prepare -> Verify -> Report loop. The following surfaces remain available only where compatibility requires them:

- `decantr_registry` is a stable 3.x tool ID for official content-corpus reads. It is not a public registry, marketplace, or community publishing surface.
- `@decantr/css` is an optional legacy adapter. It is not selected automatically and does not override the host project's styling authority.
- Studio is a non-core read-only consumer of Decantr evidence. It is not required to use this MCP server.
- Hosted content and intelligence metadata are optional compatibility inputs. Local project authority, local verification, and evidence reporting do not require hosted source analysis or a Decantr account.

For the broader product surface and support policy, see the root Decantr docs and package support matrix.

For Decantr 3 assistant prompt migration, see the MCP migration guide: https://decantr.ai/reference/mcp-migration.md.

## Security And Permissions

The MCP server reads Decantr files, including `.decantr/graph` typed graph artifacts, selected project files, Git metadata through local Git commands for change scope, and directly referenced workspace-package source used as component authority. Write access is limited to the explicit `decantr_contract_write` tool with `accept_drift` and `update_essence` actions. `accept_drift` may defer a finding to `.decantr/drift-log.json` when the caller explicitly requests that resolution. Paths are contained to the active workspace root.

Content-corpus and pack-resolution actions may call a configured Decantr API. Project authority, critique, audit, and verification remain local reads; source upload fallbacks are retired. The MCP server does not emit Decantr telemetry. See [security permissions](https://decantr.ai/reference/security-permissions.md).

The npm package bundles the MCP SDK modules used by its stdio transport. It does not install the SDK's unused HTTP server dependency tree. Bundled-code licenses are retained in `THIRD_PARTY_NOTICES.md`.

## Compatibility

`@decantr/mcp-server` is stable in the Decantr 3 line for the documented MCP tool surface.

- Decantr 3 keeps exactly the eight tools above; a ninth content tool or hidden alias is not compatible with this release line
- existing documented tool names and envelopes should not break without a major version
- breaking changes to established tool contracts require a major version and migration note

### Decantr 3 Tool Surface

Decantr 3.4 consolidated legacy MCP tool names into the eight action-based tools above. The 3.x line keeps that inventory, server identity, stdio transport, existing action names, and compatibility envelopes. Official corpus compatibility remains routed through `decantr_registry` rather than a ninth tool. For example, `decantr_get_project_state` becomes `decantr_project` with `{ "action": "state" }`, `decantr_get_graph_snapshot` becomes `decantr_graph` with `{ "action": "snapshot" }`, and the legacy write tools become `decantr_contract_write` with `{ "action": "accept_drift" }` or `{ "action": "update_essence" }`.

The npm tarball includes `server.json` so MCP directories can read the same stable identity and transport metadata as repository consumers.

## How It Works

Published 3.11.2 reads project-owned evidence: the Git change, application source and framework configuration, directly referenced workspace components, accepted local rules, `decantr.essence.json` when present, graph artifacts, baselines, and verification findings. In Brownfield, production source remains first authority and accepted Essence is project law beneath it. MCP clients can request Changed-UI Assurance with no adoption, request bounded task context before an edit, and inspect verification evidence after the edit. Decantr reports evidence and limitations; the coding agent remains responsible for the code change.

## Example Workflow

**Prompt:** "Improve the loading and error behavior on `/feed` without replacing the existing card component or styling system."

An MCP-capable coding agent can use the tools in this order:

1. `decantr_project` with `state` observes the selected app, available authority, graph readiness, adoption truth, and limitations.
2. `decantr_context` with `task` and `route: "/feed"` prepares compact graph-backed context before editing.
3. `decantr_graph` with `query` or `traverse` exposes the ranked local source and impact evidence needed for the change.
4. The coding agent edits the project using its normal tools; Decantr does not generate or apply the source change.
5. `decantr_verify` with `changes` verifies the current UI diff first; `audit_project`, `critique`, `evidence_bundle`, or `health_loop` remain available for deeper evidence.
6. `decantr_repair` turns any typed findings into a scoped plan or repair prompt, after which verification runs again.

`decantr_contract` remains available when the project uses an Essence contract. `decantr_registry` remains available when the task needs official corpus vocabulary or execution packs, but it is not part of the required local loop.

## License

MIT
