# Decantr

**Decantr is the design intelligence layer for AI-generated web applications. We don't care what you build with. We care what you build.**

Every AI code generator is racing to output faster. None of them are thinking about what happens after they generate. Decantr is the design intelligence layer that sits between generation and production — transforming raw AI output into applications that actually look, feel, and perform like they were built by a senior team. We don't care what you build with. We care what you build.

---

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `cli` | `@decantr/cli` | CLI for the Decantr design intelligence framework |
| `essence-spec` | `@decantr/essence-spec` | Essence schema, validator, and TypeScript types for Decantr |
| `generator-core` | `@decantr/generator-core` | Framework-agnostic IR pipeline for Decantr code generation |
| `generator-decantr` | `@decantr/generator-decantr` | Decantr-native code emitter — IR to Decantr components, atoms, signals |
| `generator-react` | `@decantr/generator-react` | React + Tailwind + shadcn/ui code emitter — IR to React components |
| `mcp-server` | `@decantr/mcp-server` | MCP server for Decantr — exposes design intelligence tools to AI coding assistants |
| `registry` | `@decantr/registry` | Registry format, content resolver, and wiring rules for Decantr |

## Apps

| App | Description |
|-----|-------------|
| `apps/registry-server` | Hono + SQLite registry API server deployed on Fly.io |

## Content

The `content/` directory contains framework-agnostic design intelligence content (JSON files) — the registry's source of truth.

| Directory | Description |
|-----------|-------------|
| `content/patterns/` | Community UI component templates with layout, props, and wiring metadata |
| `content/archetypes/` | Reusable UI blocks (e.g., `dashboard-core`, `auth-flow`, `ecommerce`) |
| `content/recipes/` | Decoration rules — background effects, nav styles, spatial hints |
| `content/vignettes/` | Archetype compositions that define complete app types |
| `content/styles/` | Style metadata — seed colors, modes, shapes (runtime code lives in decantr-framework) |
| `content/core/` | Core content that ships with the framework (carafes, default patterns, default recipe) |

## Quick Start

```bash
npx decantr init
# Pick archetype, theme, target framework
# Essence file + generated code created automatically
```

## CLI Commands

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
npx decantr registry search <query>

# Install community content
npx decantr registry add <type>/<name>

# List installed registry content
npx decantr registry list
```

## MCP Server

MCP server that exposes Decantr design intelligence tools to AI coding assistants (Claude Desktop, Claude Code, Cursor).

Add to your Claude Desktop configuration:

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

Prerequisites: Node >= 20, pnpm >= 9.

```bash
pnpm install && pnpm build && pnpm test
```

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests (Vitest) |
| `pnpm test:watch` | Watch mode |
| `pnpm lint` | Type-check (`tsc --noEmit`) |
| `pnpm clean` | Remove all `dist/` directories |
| `pnpm cli` | Run CLI (after build) |
| `pnpm mcp` | Run MCP server (after build) |
| `pnpm registry:dev` | Start registry server in dev mode |
| `pnpm registry:test` | Run registry server tests |

## Vision

See [VISION.md](./VISION.md) for the full project vision, positioning, architecture, and guiding principles.
