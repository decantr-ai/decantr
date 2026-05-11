# Decantr With AI Coding Assistants

Decantr gives AI coding assistants a contract, scoped context, registry-backed UI knowledge, and verification commands. The assistant still writes the code; Decantr gives it better inputs and a way to check drift.

## MCP Server

Use the MCP server when your editor or agent supports MCP tools:

```bash
npx @decantr/mcp-server
```

The MCP server exposes Decantr tools for essence reads, registry search, pattern resolution, execution-pack access, critique, and project audit. It works with MCP-compatible assistants such as Claude Desktop, Cursor, Windsurf, VS Code agent mode, Zed, and Continue.dev.

## CLI Context

Use the CLI when you want files in the project that any assistant can read:

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
# or, for an existing app
npx @decantr/cli analyze
npx @decantr/cli init --existing --accept-proposal
```

The important files are:

- `DECANTR.md`: project method, guard rules, CSS approach, and workflow.
- `decantr.essence.json`: the durable product and design contract.
- `.decantr/context/scaffold.md`: app topology, route map, voice, and shared components.
- `.decantr/context/section-*.md`: focused section/page implementation contracts.

## Assistant Rule Bridge

For existing rule files, preview before applying:

```bash
npx @decantr/cli init --assistant-bridge=preview
npx @decantr/cli rules preview
npx @decantr/cli rules apply
```

Brownfield init does not mutate rule files unless apply is explicit.

See also: [MCP package](https://www.npmjs.com/package/@decantr/mcp-server), [Workflow Model](../reference/workflow-model.md).
