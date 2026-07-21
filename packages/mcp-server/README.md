# @decantr/mcp-server

[![npm version](https://img.shields.io/npm/v/@decantr/mcp-server?style=flat-square)](https://www.npmjs.com/package/@decantr/mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/@decantr/mcp-server?style=flat-square)](https://www.npmjs.com/package/@decantr/mcp-server)
[![license](https://img.shields.io/npm/l/@decantr/mcp-server?style=flat-square)](./LICENSE)
[![MCP compatible](https://img.shields.io/badge/MCP-compatible-0096FF?style=flat-square)](https://modelcontextprotocol.io)

Support status: `core-supported`  
Release channel: `stable`

AI Frontend Governance for codebases touched by AI agents. Give Claude, Cursor, Windsurf, VS Code, Zed, and Continue a typed Contract, scoped Context, and repairable Evidence instead of a giant rule dump.

![Decantr MCP demo](https://raw.githubusercontent.com/decantr-ai/decantr/main/packages/mcp-server/assets/decantr-demo.gif)

- **Structured Contract context** -- gives your AI assistant patterns, layouts, component specs, shared Brownfield discovery metadata, typed graph context, Brownfield/Hybrid authority, local law, behavior obligations, and task-time context instead of letting it guess
- **Evidence-backed repair loops** -- gives AI agents Project Health, component reuse drift, accepted behavior-obligation drift, accepted style bridge drift, stable diagnostic codes, typed repair IDs, graph-anchored Evidence Bundles, workspace health, and scoped repair prompts without uploading source
- **Drift detection** -- catches when generated code deviates from your design intent
- **Zero config** -- run with `npx`, no API keys or accounts required

## Quick Setup

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["@decantr/mcp-server"]
    }
  }
}
```

Restart Claude Desktop. The Decantr tools will appear automatically.

### Cursor

Preferred setup:

```bash
npx @decantr/cli connect cursor
```

From a monorepo root:

```bash
pnpm exec decantr connect cursor --project apps/web
```

The connector preserves existing MCP servers and writes the project rule that tells Cursor Agent to call Decantr task context before route edits. For manual setup, create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["-y", "@decantr/mcp-server"]
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
      "args": ["@decantr/mcp-server"]
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
      "args": ["-y", "@decantr/mcp-server"]
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
      "args": ["-y", "@decantr/mcp-server"],
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
      - "@decantr/mcp-server"
```

MCP tools are only available in Continue.dev agent mode.

## Key Tools

The server exposes a hard 8-tool MCP surface. Pass an `action` to select the routed behavior:

| Tool | Description | Example Input |
|------|-------------|---------------|
| `decantr_project` | Read local project state, canonical adoption truth, shared discovery summary, and workspace health | `{ "action": "state", "project_path": "apps/web" }` |
| `decantr_contract` | Read Essence, validate, check drift, generate a skeleton, or read the Contract capsule | `{ "action": "validate", "path": "./decantr.essence.json" }` |
| `decantr_context` | Read scaffold, section, page, task, shared discovery summary, and execution-pack context | `{ "action": "task", "project_path": "apps/web", "route": "/feed", "task": "improve recipe card loading" }` |
| `decantr_graph` | Read graph snapshots, query graph nodes/edges, or traverse graph relations | `{ "action": "query", "project_path": "apps/web", "file_path": "src/app/page.tsx", "include_impact": true }` |
| `decantr_registry` | Compatibility content-corpus tool for official vocabulary, benchmarks, and execution packs | `{ "action": "resolve_pattern", "id": "data-table", "preset": "product" }` |
| `decantr_verify` | Run audit, critique, findings, v2 evidence bundles with discovery metadata, or health-loop reads | `{ "action": "evidence_bundle", "project_path": "apps/web" }` |
| `decantr_repair` | Return typed findings, repair plans, repair prompts, and v2 health-loop guidance | `{ "action": "health_loop", "project_path": "apps/web" }` |
| `decantr_contract_write` | Explicit write surface for accepting drift, deferring drift to the drift log, or mutating Essence v4 | `{ "action": "update_essence", "operation": "add_feature", "payload": { "feature": "billing" } }` |

`decantr_context` task responses default to `"detail": "compact"`. Compact mode projects the verifier-owned `TaskCapsuleV1` into the existing response fields and adds `task_capsule_version: "task-capsule.v1"`. The returned `task` is exactly the canonical capsule request: only `createTaskCapsuleV1()` may truncate it, and `task_capsule_budget`, `task_capsule_truncation`, and `task_capsule_digest` describe that exact result. The compatibility envelope may prune lower-priority duplicated context, but it never truncates `task` independently, and the complete response remains within 12,000 canonical UTF-8 bytes / 4,000 estimated tokens. Pass `"detail": "full"` only for diagnostic clients that need the complete graph and context payload. Both modes return `response_detail`. Task activation reports `blocked_missing_graph` when graph artifacts are absent or stale. Angular Brownfield task activation returns `DISCOVERY_NOT_PROVEN` when the requested route is not backed by complete, bootstrap-reachable production authority; live discovery outranks stale analysis artifacts.

Local scaffold, page, and section paths selected by `pack-manifest.json` are read or emitted as task read targets only when they resolve to real files contained under the selected project's `.decantr/context` directory. Missing, escaped, directory, and symlink-escaped references are ignored; existing `scaffold.md` and `section-<id>.md` narrative context remains the local fallback. In Greenfield `style-bridge` adoption, the accepted bridge maps onto the host project's tokens, classes, and styling runtime; it does not activate `@decantr/css`.

`decantr_project` state includes verifier-built `AdoptionTruthV1`. Official corpus actions under the compatibility-named `decantr_registry` tool use `@decantr/content` implementations; there is no ninth `decantr_content` tool.

For the broader product surface and support policy, see the root Decantr docs and package support matrix.

For Decantr 3 assistant prompt migration, see the MCP migration guide: https://decantr.ai/reference/mcp-migration.md.

## Security And Permissions

The MCP server reads Decantr files, including `.decantr/graph` typed graph artifacts, and selected project files from the active workspace. Write access is limited to the explicit `decantr_contract_write` tool with `accept_drift` and `update_essence` actions. `accept_drift` may defer a finding to `.decantr/drift-log.json` when the caller explicitly requests that resolution. Paths are contained to the active workspace root.

Content-corpus and pack-resolution tools may call the configured Decantr API. Source upload fallbacks for hosted critique/audit are retired; verification tools run local reads unless a future major version introduces a new upload contract. The MCP server does not emit Decantr telemetry. See [security permissions](https://decantr.ai/reference/security-permissions.md).

The npm package bundles the MCP SDK modules used by its stdio transport. It does not install the SDK's unused HTTP server dependency tree. Bundled-code licenses are retained in `THIRD_PARTY_NOTICES.md`.

## Compatibility

`@decantr/mcp-server` is stable in the Decantr 3 line for the documented MCP tool surface.

- Decantr 3.9 keeps exactly the eight tools above; a ninth content tool or hidden alias is not compatible with this release line
- existing documented tool names and envelopes should not break without a major version
- breaking changes to established tool contracts require a major version and migration note

### Decantr 3 Tool Surface

Decantr 3.4 consolidated legacy MCP tool names into the eight action-based tools above. Decantr 3.9 keeps that inventory, server identity, stdio transport, and existing action names; adds canonical adoption/task proof data through existing actions; and routes official corpus compatibility through `decantr_registry` rather than adding a ninth tool. For example, `decantr_get_project_state` becomes `decantr_project` with `{ "action": "state" }`, `decantr_get_graph_snapshot` becomes `decantr_graph` with `{ "action": "snapshot" }`, and the legacy write tools become `decantr_contract_write` with `{ "action": "accept_drift" }` or `{ "action": "update_essence" }`.

The npm tarball includes `server.json` so MCP directories can read the same stable identity and transport metadata as repository consumers.

## How It Works

An Essence spec (`decantr.essence.json`) captures your design intent -- archetype, theme, page structure, patterns, and guard rules -- in a single declarative file. The MCP server exposes this spec and the official Decantr content corpus to your AI assistant, giving it concrete layout specs, component lists, and visual treatments instead of relying on the model's generic training data. The result is generated code that follows a coherent contract, and drift detection that catches deviations before they ship.

## Example Workflow

**Prompt:** "Build me a SaaS dashboard with user analytics, a data table of recent signups, and a settings page."

The AI assistant calls these tools behind the scenes:

1. `decantr_contract` with `create_essence`, `validate`, or `check_drift` actions to generate and verify the contract
2. `decantr_registry` with `resolve_archetype`, `suggest_patterns`, `resolve_pattern`, or `compile_execution_packs` actions to fetch official content-corpus vocabulary and packs
3. `decantr_context` with `execution_pack` or `task` actions to load the compact task contract before editing
4. `decantr_project` with `state` to check Essence, packs, graph readiness, local law, diagnostics, and next useful action calls
5. `decantr_contract` with `capsule` and `decantr_graph` with `snapshot`, `query`, or `traverse` to read typed graph context
6. `decantr_verify` with `critique`, `audit_project`, or `evidence_bundle` to produce local v2 evidence
7. `decantr_repair` with `findings`, `repair_plan`, `repair_prompt`, or `health_loop` to enter a scoped evidence-backed repair loop

The AI now generates code with the right layout structure, correct components, and consistent styling, then gets a scoped evidence-backed repair loop instead of a generic guess.

## License

MIT
