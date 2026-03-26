# Decantr

Design intelligence layer for AI-generated web applications.

v0/Bolt/Lovable race to generate code faster. Decantr generates code better.

## Packages

| Package | Description |
|---------|-------------|
| `@decantr/essence-spec` | Essence schema, validator, TypeScript types |
| `@decantr/registry` | Registry format, content resolver, wiring rules |
| `@decantr/generator-core` | Framework-agnostic IR pipeline for code generation |
| `@decantr/generator-decantr` | Decantr-native code emitter |
| `@decantr/generator-react` | React + Tailwind + shadcn/ui code emitter |
| `@decantr/cli` | CLI for project creation, generation, validation, registry |
| `@decantr/mcp-server` | MCP server for AI coding assistants |

## Quick Start

```bash
mkdir my-app && cd my-app
npx decantr init
# Pick archetype, theme, target framework
# Essence file + generated code created automatically
npm install && npm run dev
```

### `@decantr/cli`

The `npx decantr` command. Create projects, generate code, validate essence files, manage registry content.

```bash
# Create a new project interactively
npx decantr init

# Generate React + Tailwind code from an essence file
npx decantr generate --target react

# Generate Decantr-native code
npx decantr generate --target decantr

# Validate your essence file
npx decantr validate

# Search the community registry
npx decantr registry search kanban
```

### `@decantr/mcp-server`

MCP server that exposes Decantr tools to AI coding assistants (Claude Code, Cursor).

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

Available tools:
- `decantr_read_essence` — Read the current essence file
- `decantr_validate` — Validate essence against schema + guard rules
- `decantr_search_registry` — Search community content
- `decantr_resolve_pattern` — Get pattern details and presets
- `decantr_resolve_archetype` — Get archetype page structure

## Development

```bash
pnpm install
pnpm build
pnpm test
```
