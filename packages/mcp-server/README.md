# @decantr/mcp-server

Support status: `core-supported`  
Release channel: `beta`

Design intelligence for AI-generated UI. Make Claude, Cursor, and Windsurf generate better code.

- **Structured design context** -- gives your AI assistant patterns, layouts, and component specs instead of letting it guess
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

## Key Tools

The server exposes Decantr registry, context, benchmark, and verification tools. Highlights:

| Tool | Description | Example Input |
|------|-------------|---------------|
| `decantr_create_essence` | Generate an Essence spec skeleton from a project description | `{ "description": "SaaS dashboard with analytics and billing", "framework": "react" }` |
| `decantr_read_essence` | Read the current `decantr.essence.json` from the working directory | `{}` or `{ "path": "./custom.essence.json" }` |
| `decantr_validate` | Validate an Essence file against the schema and guard rules | `{ "path": "./decantr.essence.json" }` |
| `decantr_search_registry` | Search the community registry for patterns, archetypes, themes, and shells | `{ "query": "kanban", "type": "pattern" }` |
| `decantr_resolve_pattern` | Get full pattern details: layout spec, components, presets, code examples | `{ "id": "data-table", "preset": "product" }` |
| `decantr_resolve_archetype` | Get archetype details: default pages, layouts, features, suggested theme | `{ "id": "saas-dashboard" }` |
| `decantr_resolve_blueprint` | Get a full app composition with page structure and personality traits | `{ "id": "ecommerce" }` |
| `decantr_suggest_patterns` | Given a page description, get ranked pattern suggestions | `{ "description": "dashboard with metrics and charts" }` |
| `decantr_check_drift` | Check if generated code violates the design intent in the Essence spec | `{ "page_id": "overview", "components_used": ["Card", "LineChart"], "theme_used": "auradecantism" }` |
| `decantr_get_execution_pack` | Read compiled scaffold, section, page, review, or mutation execution packs | `{ "pack_type": "page", "id": "overview", "format": "json" }` |
| `decantr_audit_project` | Run the schema-backed Decantr project audit against essence and compiled packs | `{}` |
| `decantr_critique` | Critique a file against the compiled review contract | `{ "file_path": "./src/pages/Overview.tsx" }` |
| `decantr_get_showcase_benchmarks` | Read the audited showcase corpus manifest, shortlist, or verification report | `{ "view": "verification" }` |

For the broader product surface and support policy, see the root Decantr docs and package support matrix.

## How It Works

An Essence spec (`decantr.essence.json`) captures your design intent -- archetype, theme, page structure, patterns, and guard rules -- in a single declarative file. The MCP server exposes this spec and the Decantr registry to your AI assistant, giving it concrete layout specs, component lists, and visual treatments instead of relying on the model's generic training data. The result is generated code that follows a coherent design system, and drift detection that catches deviations before they ship.

## Example Workflow

**Prompt:** "Build me a SaaS dashboard with user analytics, a data table of recent signups, and a settings page."

The AI assistant calls these tools behind the scenes:

1. `decantr_create_essence` -- generates a spec skeleton matched to the `saas-dashboard` archetype
2. `decantr_resolve_archetype` -- pulls default pages, layouts, and features for a SaaS dashboard
3. `decantr_suggest_patterns` -- recommends `kpi-grid`, `chart-grid`, `data-table`, and `form-sections` for the described pages
4. `decantr_resolve_pattern` -- fetches layout specs and component lists for each pattern
5. `decantr_get_execution_pack` -- loads the compiled scaffold/page/review packs as the task contract
6. `decantr_check_drift` -- validates the generated code against the Essence spec before presenting it
7. `decantr_audit_project` -- runs the stronger project-level audit once the implementation is in place

The AI now generates code with the right layout structure, correct components, and consistent styling -- not a generic guess.

## License

MIT
