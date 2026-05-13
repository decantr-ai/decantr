# Decantr With AI Coding Assistants

Decantr gives AI coding assistants a contract, scoped context, registry-backed UI knowledge, and verification commands. The assistant still writes the code; Decantr gives it better inputs and a way to check drift.

## MCP Server

Use the MCP server when your editor or agent supports MCP tools:

```bash
npx @decantr/mcp-server
```

The MCP server exposes Decantr tools for essence reads, registry search, pattern resolution, execution-pack access, critique, project audit, and Brownfield task-time context. It works with MCP-compatible assistants such as Claude Desktop, Cursor, Windsurf, VS Code agent mode, Zed, and Continue.dev.

For an existing app, ask the assistant to call `decantr_prepare_task_context` before editing a route. Provide the route and the task, for example `{ "route": "/feed", "task": "improve the recipe feed loading and card layout" }`. The tool returns the route, section, page pack excerpt, directives, patterns, shared components, visual target, theme inventory, health continuity evidence, and local screenshot references when available.

## CLI Context

Use the CLI when you want files in the project that any assistant can read:

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
# or, for an existing app
npx @decantr/cli adopt --base-url http://localhost:3000 --evidence --yes
```

The important files are:

- `DECANTR.md`: project method, guard rules, CSS approach, and workflow.
- `decantr.essence.json`: the durable product and design contract.
- `.decantr/context/scaffold.md`: app topology, route map, voice, and shared components.
- `.decantr/context/section-*.md`: focused section/page implementation contracts.
- `.decantr/local-patterns.json`: optional project-owned Brownfield UI law after `decantr codify --accept`.

## Assistant Rule Bridge

For existing rule files, preview before applying:

```bash
npx @decantr/cli init --assistant-bridge=preview
npx @decantr/cli rules preview
npx @decantr/cli rules apply
```

Brownfield init does not mutate rule files unless apply is explicit.

CLI-only assistants should use task activation before editing Brownfield routes:

```bash
npx @decantr/cli task /feed "improve the recipe feed loading and card layout"
```

That output points to `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, `.decantr/enrichment-backlog.md`, matching page/section packs, local screenshots, and accepted local patterns when present. After the assistant edits code, run:

```bash
npx @decantr/cli verify --brownfield
```

See also: [MCP package](https://www.npmjs.com/package/@decantr/mcp-server), [Workflow Model](../reference/workflow-model.md).
