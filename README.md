# Decantr

**OpenAPI for AI-generated UI.** The design intelligence layer that makes every AI coding assistant produce consistent, production-quality interfaces.

> AI generates code. Decantr ensures it's coherent, consistent, and visually stunning.

## The Problem

Every AI coding tool (Cursor, v0, Claude, Copilot) generates UI that:
- Looks different every time you ask
- Drifts from your design system after 3 prompts
- Requires manual cleanup to look production-ready
- Has no memory of your design decisions

## The Fix

```bash
npx decantr magic "AI agent marketplace — dark cyber-minimal, confident personality"
```

Decantr gives your AI a structured design contract (`essence.json`) that enforces:
- **Theme consistency** — tokens, colors, typography locked to your palette
- **Layout coherence** — patterns, shells, and topology define the structure
- **Visual personality** — "glassmorphic depth, Lucide icons, think Claude meets Linear"
- **Drift prevention** — guard rules catch violations before they ship

---

## Quick Start (2 minutes)

### 1. Scaffold

```bash
npx decantr init --blueprint=carbon-ai-portal
```

### 2. Read the contract

Your AI reads `DECANTR.md` + `.decantr/context/scaffold.md` — that's the design system.

### 3. Build

Ask your AI to build pages. Decantr's context ensures every page matches.

### 4. Guard

```bash
npx decantr check
```

Catches design drift before it ships.

---

## How It Works

Decantr is a 7-stage design pipeline:

| Stage | What happens |
|-------|-------------|
| **Intent** | You describe what you want |
| **Interpret** | CLI parses into structured form |
| **Decompose** | Splits into theme + structure + features |
| **Specify** | Writes `decantr.essence.json` |
| **Compose** | Resolves patterns, shells, topology |
| **Generate** | Your AI builds code from the spec |
| **Guard** | Validates every change against the spec |

The AI reads a **three-tier context model**:

1. `DECANTR.md` — methodology primer (~170 lines, constant)
2. `decantr.essence.json` — source of truth (theme, routes, features)
3. `.decantr/context/section-*.md` — per-section specs with patterns and layouts

---

## Registry

| Content | Count | Examples |
|---------|-------|---------|
| Patterns | 97+ | hero, chat-thread, agent-swarm-canvas, pricing-tiers |
| Archetypes | 52+ | ai-chatbot, saas-dashboard, agent-orchestrator |
| Blueprints | 17+ | carbon-ai-portal, terminal-dashboard, agent-marketplace |
| Themes | 17 | carbon, neon-dark, aurora, glassmorphism |
| Recipes | 11 | glassmorphism, carbon, terminal, clean |
| Shells | 13 | chat-portal, top-nav-footer, centered |

---

## MCP Server (14 tools)

Add to **Claude Desktop** (`claude_desktop_config.json`):

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

Add to **Claude Code**:

```bash
claude mcp add decantr -- npx @decantr/mcp-server
```

| Tool | Purpose |
|------|---------|
| `decantr_create_essence` | Generate spec from natural language description |
| `decantr_resolve_blueprint` | Get full blueprint with topology and routes |
| `decantr_resolve_pattern` | Get pattern layout spec, components, presets |
| `decantr_resolve_archetype` | Get archetype pages, features, suggested theme |
| `decantr_resolve_recipe` | Get recipe decorators, spatial hints, effects |
| `decantr_suggest_patterns` | Suggest patterns for a page description |
| `decantr_get_section_context` | Get scoped context for a blueprint section |
| `decantr_check_drift` | Check code against the design spec |
| `decantr_accept_drift` | Resolve drift by accepting, scoping, or deferring |
| `decantr_update_essence` | Apply structured mutations to DNA or blueprint |
| `decantr_validate` | Validate essence against schema + guard rules |
| `decantr_read_essence` | Read the current essence file |
| `decantr_search_registry` | Search the content registry |
| `decantr_component_api` | Query @decantr/ui component API |

---

## CLI

```bash
# Scaffold
decantr init --blueprint=carbon-ai-portal    # From a blueprint
decantr magic "describe your app"            # From natural language

# Build progressively
decantr add section billing-portal           # Compose new archetype
decantr add page settings/webhooks           # Add page to section
decantr add feature payments                 # Enable a feature
decantr theme switch terminal                # Change visual direction

# Validate & sync
decantr check                                # Guard validation
decantr refresh                              # Regenerate all context files
decantr upgrade --apply                      # Pull registry updates
decantr analyze                              # Brownfield: scan existing project
```

---

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `@decantr/cli` | [![npm](https://img.shields.io/npm/v/@decantr/cli)](https://www.npmjs.com/package/@decantr/cli) | CLI for init, scaffold, mutations, and validation |
| `@decantr/mcp-server` | [![npm](https://img.shields.io/npm/v/@decantr/mcp-server)](https://www.npmjs.com/package/@decantr/mcp-server) | 14 MCP tools for AI coding assistants |
| `@decantr/essence-spec` | [![npm](https://img.shields.io/npm/v/@decantr/essence-spec)](https://www.npmjs.com/package/@decantr/essence-spec) | Schema, validator, guard rules, TypeScript types |
| `@decantr/registry` | [![npm](https://img.shields.io/npm/v/@decantr/registry)](https://www.npmjs.com/package/@decantr/registry) | Content resolver and pattern preset resolution |
| `@decantr/core` | [![npm](https://img.shields.io/npm/v/@decantr/core)](https://www.npmjs.com/package/@decantr/core) | Design Pipeline IR engine |
| `@decantr/css` | [![npm](https://img.shields.io/npm/v/@decantr/css)](https://www.npmjs.com/package/@decantr/css) | Framework-agnostic CSS atoms runtime |
| `@decantr/ui` | [![npm](https://img.shields.io/npm/v/@decantr/ui)](https://www.npmjs.com/package/@decantr/ui) | Signal-based UI framework with 100+ components |
| `@decantr/ui-chart` | [![npm](https://img.shields.io/npm/v/@decantr/ui-chart)](https://www.npmjs.com/package/@decantr/ui-chart) | Chart library (SVG, Canvas, WebGPU renderers) |
| `@decantr/vite-plugin` | [![npm](https://img.shields.io/npm/v/@decantr/vite-plugin)](https://www.npmjs.com/package/@decantr/vite-plugin) | Real-time design drift detection |

---

## Guard Rules

Eight rules in two tiers prevent design drift:

**DNA guards (errors):** style, recipe, density, accessibility, theme-mode compatibility
**Blueprint guards (warnings):** structure, layout, pattern existence

Three modes: **creative** (off) → **guided** (core rules) → **strict** (all rules)

---

## Development

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run all tests
pnpm lint       # Type-check
```

Requires Node.js >= 20 and pnpm >= 9.

---

## Contributing

Contributions welcome. See [docs/](docs/) for architecture, specs, and plans.

## License

MIT
