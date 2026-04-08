# Decantr

**Design intelligence and governance for AI-generated UI.**

Decantr helps AI coding assistants produce coherent, production-grade interfaces by giving them a structured design contract, scoped execution context, registry-backed UI knowledge, and drift checks.

> AI generates code. Decantr keeps the output aligned.

## What Decantr Is

Decantr is the control plane between:

- your app intent
- curated design intelligence
- AI coding assistants
- verification and drift prevention

It is built around a few core ideas:

- `decantr.essence.json` captures durable design intent
- registry content provides reusable shells, blueprints, archetypes, patterns, and themes
- the CLI and MCP server expose that intelligence to humans and agents
- validation and critique help catch drift before it ships

## What Decantr Is Not

Decantr is not:

- a code generator
- a frontend framework
- a React competitor
- a component library first product

## Quick Start

```bash
npx @decantr/cli init --blueprint=agent-marketplace --yes
```

Typical workflow:

1. Scaffold a project from a blueprint or natural-language prompt.
2. Let your AI assistant read the generated Decantr context files.
3. Build with guardrails instead of improvising every design decision.
4. Run `decantr check` to catch drift.

## Core Surfaces

### CLI

```bash
decantr init --blueprint=agent-marketplace
decantr magic "describe your app"
decantr check
decantr refresh
decantr status
```

### MCP Server

Add to Claude Code:

```bash
claude mcp add decantr -- npx @decantr/mcp-server
```

The MCP server exposes Decantr’s design intelligence directly to AI tools, including:

- essence read and validation
- registry search and content resolution
- scoped context generation
- drift and critique tools

### Registry

Browse the registry at [registry.decantr.ai](https://registry.decantr.ai).

The official curated content source lives in `decantr-content` and syncs to the hosted registry API. The registry currently centers on:

- patterns
- themes
- blueprints
- archetypes
- shells

Canonical content schemas are published at `https://decantr.ai/schemas/`.

## Packages

### Core packages

| Package | Description |
|---|---|
| `@decantr/cli` | Local scaffold, validation, and maintenance workflows |
| `@decantr/mcp-server` | MCP surface for AI coding assistants |
| `@decantr/essence-spec` | Schema, validation, and core Decantr types |
| `@decantr/registry` | Registry model, resolution, and content access |
| `@decantr/core` | Internal pipeline and compiler-adjacent foundation |
| `@decantr/css` | Framework-agnostic CSS atom runtime |

### Secondary surfaces

| Package | Current status |
|---|---|
| `@decantr/vite-plugin` | Verification-adjacent and still evolving |

## Repo Layout

| Path | Role |
|---|---|
| `apps/api` | Hosted API and registry backend |
| `apps/registry` | Registry portal |
| `docs/` | Public docs and product documentation |
| `apps/showcase/*` | Benchmark and evidence corpus of generated blueprint scaffolds |
| `packages/*` | Core packages and supporting runtime surfaces |

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

Requires:

- Node.js >= 20
- pnpm >= 9

## Status

The repo is currently being refocused around the Decantr vNext product boundary:

- control plane for AI-generated UI
- registry and content intelligence
- MCP and CLI delivery
- verification and drift prevention

## Contributing

Contributions are welcome. See [docs/](docs/) for the current audits, specs, and program documents.

## License

MIT
