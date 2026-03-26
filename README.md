# Decantr

**Decantr is the design intelligence layer for AI-generated web applications. We don't care what you build with. We care what you build.**

## What is Decantr

Decantr is not a UI framework and not a code generator. It is a structured schema -- like OpenAPI, but for UI -- combined with design intelligence that AI coding assistants use to generate better, more consistent code. Your AI generates the code. Decantr provides the methodology, validated schemas, reusable design building blocks, and drift-prevention rules that make that code coherent and production-quality.

## How it Works

Decantr uses a seven-stage **Design Pipeline** to transform a natural language idea into validated, consistent UI code:

1. **Intent** -- The user expresses what they want to build.
2. **Interpret** -- The system interprets intent into structured form.
3. **Decompose** -- Intent is broken into layers: theme, structure, features.
4. **Specify** -- A machine-readable spec (`decantr.essence.json`) is written.
5. **Compose** -- Page layouts are resolved from patterns and recipes.
6. **Generate** -- The user's AI produces code from the composition. (Decantr does not generate code.)
7. **Guard** -- Every change is validated against the spec to prevent drift.

## Get Started

The primary way to use Decantr is through the MCP server, which exposes design intelligence tools directly to AI coding assistants like Claude, Cursor, and Copilot.

### Add to Claude Desktop

Add this to your `claude_desktop_config.json`:

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

### Add to Claude Code

```bash
claude mcp add decantr -- npx @decantr/mcp-server
```

## Packages

| Package | Description |
|---------|-------------|
| `@decantr/essence-spec` | Essence schema, validator, guard rules, and TypeScript types |
| `@decantr/registry` | Content resolver, wiring rules, and pattern preset resolution |
| `@decantr/core` | Design Pipeline IR engine for AI-generated UI |
| `@decantr/mcp-server` | MCP server exposing design intelligence tools to AI coding assistants |

## Content Registry

The `content/` directory contains the community registry of reusable design building blocks:

- **Patterns** -- Composable UI sections (e.g., `kpi-grid`, `data-table`, `hero`) with layout specs, components, and presets.
- **Archetypes** -- App-level templates (e.g., `saas-dashboard`, `ecommerce`) with default pages, features, and suggested themes.
- **Blueprints** -- Full app compositions combining multiple archetypes into a complete page structure.
- **Recipes** -- Visual decoration rules including shell styles, spatial hints, and effects.
- **Themes** -- Style definitions covering color, mode, and shape.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

Requires Node.js >= 20 and pnpm >= 9.

## License

MIT
