# @decantr/mcp-server

[![npm version](https://img.shields.io/npm/v/@decantr/mcp-server?style=flat-square)](https://www.npmjs.com/package/@decantr/mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/@decantr/mcp-server?style=flat-square)](https://www.npmjs.com/package/@decantr/mcp-server)
[![license](https://img.shields.io/npm/l/@decantr/mcp-server?style=flat-square)](./LICENSE)
[![MCP compatible](https://img.shields.io/badge/MCP-compatible-0096FF?style=flat-square)](https://modelcontextprotocol.io)

Support status: `core-supported`  
Release channel: `stable`

AI Frontend Governance for codebases touched by AI agents. Give Claude, Cursor, Windsurf, VS Code, Zed, and Continue a typed Contract, scoped Context, and repairable Evidence instead of a giant rule dump.

![Decantr MCP demo](https://raw.githubusercontent.com/decantr-ai/decantr/main/packages/mcp-server/assets/decantr-demo.gif)

- **Structured Contract context** -- gives your AI assistant patterns, layouts, component specs, typed graph context, Brownfield/Hybrid authority, local law, behavior obligations, and task-time context instead of letting it guess
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

Create `.cursor/mcp.json` in your project root:

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

Restart Cursor. The tools are available in Agent mode.

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

The server exposes Decantr vocabulary, context, benchmark, and verification tools. Highlights:

| Tool | Description | Example Input |
|------|-------------|---------------|
| `decantr_create_essence` | Generate an Essence spec skeleton from a project description | `{ "description": "SaaS dashboard with analytics and billing", "framework": "react" }` |
| `decantr_read_essence` | Read the current `decantr.essence.json` from the working directory | `{}` or `{ "path": "./custom.essence.json" }` |
| `decantr_validate` | Validate an Essence file against the schema and guard rules | `{ "path": "./decantr.essence.json" }` |
| `decantr_search_registry` | Search official/community vocabulary for patterns, archetypes, themes, and shells | `{ "query": "kanban", "type": "pattern" }` |
| `decantr_resolve_pattern` | Get full pattern details: layout spec, components, presets, code examples | `{ "id": "data-table", "preset": "product" }` |
| `decantr_resolve_archetype` | Get archetype details: default pages, layouts, features, suggested theme | `{ "id": "saas-dashboard" }` |
| `decantr_resolve_blueprint` | Get a full app composition with page structure and personality traits | `{ "id": "ecommerce" }` |
| `decantr_suggest_patterns` | Given a page description plus optional route/source excerpt, get ranked pattern suggestions | `{ "description": "recipe feed with avatars and infinite scroll", "route": "/feed" }` |
| `decantr_check_drift` | Check if generated code violates the design intent in the Essence spec | `{ "page_id": "overview", "components_used": ["Card", "LineChart"], "theme_used": "auradecantism" }` |
| `decantr_get_execution_pack` | Read compiled scaffold, section, page, review, or mutation execution packs, with hosted fallback when local context is missing | `{ "pack_type": "page", "id": "overview", "format": "json" }` |
| `decantr_get_project_state` | Read a compact typed summary of Essence, generated packs, graph artifacts, capsule source-handle bounds, source artifacts available for file impact, local snapshot history, typed diff counts, local law, behavior obligations, style bridge, stable diagnostic catalog, and recommended next tools | `{ "project_path": "apps/web" }` |
| `decantr_prepare_task_context` | Resolve compact route/task context, task-ranked typed route graph, optional graph-shaped changed-file impact, authority lane, local law, behavior obligations, style bridge mappings, and evidence before editing a Brownfield, Hybrid, or Essence route | `{ "project_path": "apps/web", "route": "/feed", "task": "improve recipe card loading" }` |
| `decantr_get_contract_capsule` | Read the cache-friendly Contract capsule generated by `decantr graph`, including bounded SourceArtifact paths that can be reused as `file_path` handles | `{ "project_path": "apps/web" }` |
| `decantr_get_graph_snapshot` | Read graph metadata with snapshot-history status and typed diff counts, a compact local history index, a route-scoped graph subgraph, node or source-file impact context, task-aware ranked context, a specific history snapshot, or a typed diff between local snapshots | `{ "project_path": "apps/web", "file_path": "src/app/page.tsx", "task": "edit source" }` |
| `decantr_query_graph` | Query current or historical graph nodes, source files, payload fields, relations, and optional node-impact context without reading the full snapshot | `{ "project_path": "apps/web", "snapshot_id": "current", "file_path": "src/app/page.tsx", "include_impact": true }` |
| `decantr_traverse_graph` | Traverse the current or historical typed graph from one or more node IDs or a source file by relation, direction, and depth | `{ "project_path": "apps/web", "snapshot_id": "current", "file_path": "src/app/page.tsx", "direction": "in", "relations": ["NODE_DERIVED_FROM_SOURCE"] }` |
| `decantr_compile_execution_packs` | Compile a hosted execution-pack bundle from a local or inline essence document | `{ "path": "./decantr.essence.json", "namespace": "@official" }` |
| `decantr_audit_project` | Run the schema-backed Decantr project audit against essence and compiled packs, with hosted fallback when local pack artifacts are missing | `{ "namespace": "@official" }` |
| `decantr_critique` | Critique a file against the compiled review contract, with hosted fallback when local review packs are missing | `{ "file_path": "./src/pages/Overview.tsx", "namespace": "@official" }` |
| `decantr_get_findings` | Return typed Project Health findings with stable codes, repair IDs, graph anchors, and optional repair prompts | `{ "project_path": "apps/web", "code": "TOKEN010" }` |
| `decantr_get_repair_plan` | Return a structured repair plan for a finding with repair ID, graph anchor, optional impact context, action payload, evidence, read targets, constraints, and rerun commands | `{ "project_path": "apps/web", "code": "TOKEN010" }` |
| `decantr_get_evidence_bundle` | Generate the local privacy-redacted Evidence Bundle for a project, including graph anchors and graph artifact provenance when `.decantr/graph` exists | `{ "project_path": "apps/web" }` |
| `decantr_workspace_health` | Discover Decantr projects and return aggregate workspace health | `{ "workspace_root": ".", "max_projects": 100 }` |
| `decantr_get_repair_prompt` | Return the scoped repair prompt for a health finding | `{ "finding_id": "assertion-contract-context-pack-manifest" }` |
| `decantr_run_health_loop` | Run health, evidence, and next repair prompt in one local agent loop | `{ "project_path": "apps/web" }` |
| `decantr_get_showcase_benchmarks` | Read the audited showcase corpus manifest, shortlist, or verification report | `{ "view": "verification" }` |

For the broader product surface and support policy, see the root Decantr docs and package support matrix.

## Security And Permissions

The MCP server reads Decantr files, including `.decantr/graph` typed graph artifacts, and selected project files from the active workspace. Write access is limited to explicit write tools such as `decantr_update_essence` and `decantr_accept_drift`, and paths are contained to the active workspace root.

Registry and pack-resolution tools may call the configured Decantr API. Source upload fallbacks for hosted critique/audit are disabled unless the tool call explicitly passes `allow_hosted_upload: true`. The MCP server does not emit Decantr telemetry. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## Compatibility

`@decantr/mcp-server` is stable in the `2.x` line for the documented MCP tool surface.

- new tools may be added in compatible releases
- existing documented tool names and envelopes should not break without a major version
- breaking changes to established tool contracts require a major version and migration note

## How It Works

An Essence spec (`decantr.essence.json`) captures your design intent -- archetype, theme, page structure, patterns, and guard rules -- in a single declarative file. The MCP server exposes this spec and the Decantr registry to your AI assistant, giving it concrete layout specs, component lists, and visual treatments instead of relying on the model's generic training data. The result is generated code that follows a coherent design system, and drift detection that catches deviations before they ship.

## Example Workflow

**Prompt:** "Build me a SaaS dashboard with user analytics, a data table of recent signups, and a settings page."

The AI assistant calls these tools behind the scenes:

1. `decantr_create_essence` -- generates a spec skeleton matched to the `saas-dashboard` archetype
2. `decantr_resolve_archetype` -- pulls default pages, layouts, and features for a SaaS dashboard
3. `decantr_suggest_patterns` -- recommends `kpi-grid`, `chart-grid`, `data-table`, and `form-sections` for the described pages
4. `decantr_resolve_pattern` -- fetches layout specs and component lists for each pattern
5. `decantr_get_execution_pack` -- loads the compiled scaffold/page/review packs as the task contract, falling back to hosted compilation when local pack artifacts are missing
6. `decantr_get_project_state` -- checks Essence, packs, graph readiness, capsule source-handle bounds, source artifacts available for file impact, local snapshot history, typed diff counts, local law, accepted behavior obligations, stable diagnostic codes, and the next useful tool calls
7. `decantr_prepare_task_context` -- resolves route-local Brownfield/Hybrid context, task-ranked typed route graph context, graph-shaped changed-file impact when changed files resolve to SourceArtifact nodes, active authority, accepted local law, accepted behavior obligations, accepted style bridge mappings, visual evidence, and theme inventory before editing an existing app
8. `decantr_get_contract_capsule` -- loads the compact Contract graph capsule, including the bounded SourceArtifact path index, when `.decantr/graph` exists
9. `decantr_get_graph_snapshot` -- reads graph metadata, snapshot-history status, optional compact history, typed diff counts, route-scoped graph nodes/edges with optional task-aware ranking, impact graph nodes/edges through `node_id` or `file_path`, specific history snapshots through `snapshot_id`, and local snapshot diffs through `compare_to`
10. `decantr_query_graph` and `decantr_traverse_graph` -- answer typed follow-up questions against current or historical snapshots, such as which pages use a route, component, token, source file, rule, or diagnostic code; `decantr_query_graph` can include an impact subgraph for matched node IDs or a `file_path` SourceArtifact so agents can inspect blast radius before changing a component, token, rule, finding, or source artifact, and `decantr_traverse_graph` can resolve `file_path` into the SourceArtifact start node for relation walks
11. `decantr_compile_execution_packs` -- compiles the hosted pack bundle when the task needs a fresh remote contract from the essence document
12. `decantr_check_drift` -- validates the generated code against the Essence spec before presenting it
13. `decantr_critique` -- critiques a specific file, falling back to the hosted verifier when the local review pack is missing
14. `decantr_audit_project` -- runs the stronger project-level audit once the implementation is in place
15. `decantr_get_findings` -- returns compact typed findings with diagnostic codes, repair IDs, and optional prompts
16. `decantr_get_repair_plan` -- returns typed repair actions, graph anchors, optional graph impact context, evidence, read targets, preserve/avoid constraints, and rerun commands
17. `decantr_get_evidence_bundle` -- returns the local evidence bundle, graph anchors, and graph artifact provenance for the AI repair loop
18. `decantr_get_repair_prompt` -- gives the assistant exact finding evidence, constraints to preserve, and commands to rerun

The AI now generates code with the right layout structure, correct components, and consistent styling, then gets a scoped evidence-backed repair loop instead of a generic guess.

## License

MIT
