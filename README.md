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
npx @decantr/cli init --blueprint=agent-marketplace --yes
```

Decantr gives your AI a structured design contract (`decantr.essence.json`) that enforces:
- **Theme consistency** — tokens, colors, typography locked to your palette
- **Layout coherence** — shell implementation specs, patterns, topology define the structure
- **Visual personality** — "glassmorphic depth, neon accents, think Linear meets mission control"
- **Motion & interactivity** — animations, drag/drop, pan/zoom built by default
- **Voice & copy** — consistent tone, CTA verbs, error messages, loading states
- **Drift prevention** — guard rules catch violations before they ship

---

## Quick Start

### 1. Scaffold

```bash
npx @decantr/cli init --blueprint=agent-marketplace --yes
```

### 2. Paste the prompt

The CLI outputs a prompt for your AI assistant. Paste it into Claude Code, Cursor, or any AI coding tool:

```
Build this application using the Decantr design system.

Read DECANTR.md for the design spec, CSS approach, and guard rules.
Read .decantr/context/scaffold.md for the app overview, topology, routes, and voice guidance.
Read each .decantr/context/section-*.md file before building that section's pages.
Import src/styles/global.css, src/styles/tokens.css, and src/styles/treatments.css.

Start with the shell layouts, then build each section's pages.
```

### 3. Build

The AI reads three tiers of context and builds a production-quality app:

| Tier | File | What the AI Gets |
|------|------|-----------------|
| 1 | `DECANTR.md` | Design rules, guard system, CSS atoms, Layout Rules, Motion Philosophy, Interactivity Philosophy, Development Workflow |
| 2 | `scaffold.md` | App topology, route map, voice & copy, shared components, zone transitions, development mode |
| 3 | `section-*.md` | Quick Start summary, shell implementation (dimensions, regions, anti-patterns), spacing guide, decorator table, token palette, visual direction, pattern specs (composition algebra, motion, responsive, accessibility) |

### 4. Guard

```bash
npx @decantr/cli check
```

Catches design drift before it ships.

---

## Registry

Browse the community registry at [registry.decantr.ai](https://registry.decantr.ai).

| Content | Count | Highlights |
|---------|-------|-----------|
| Patterns | 116 | visual_brief, composition algebra, motion specs, responsive strategies, accessibility patterns |
| Archetypes | 60 | page_briefs, role-based topology (primary/gateway/public/auxiliary) |
| Blueprints | 19 | personality narratives (100+ chars), voice & copy blocks, routes, navigation |
| Themes | 20 | decorator_definitions (structured: intent, suggested CSS, usage, pairs_with) |
| Shells | 13 | internal_layout (semantic spatial specs: dimensions, scroll, position, anti-patterns) |

All content passes quality validation with **0 warnings**.

---

## MCP Server (15 tools)

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
| `decantr_suggest_patterns` | Suggest patterns for a page description |
| `decantr_get_section_context` | Get scoped context for a blueprint section |
| `decantr_critique` | Evaluate generated code for visual quality scoring |
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
decantr init --blueprint=agent-marketplace    # From a blueprint
decantr magic "describe your app"             # From natural language

# Build progressively
decantr add section billing-portal            # Compose new archetype
decantr add page settings/webhooks            # Add page to section
decantr add feature payments                  # Enable a feature
decantr theme switch terminal                 # Change visual direction

# Validate & sync
decantr check                                 # Guard validation
decantr refresh                               # Regenerate all context files
decantr upgrade --apply                       # Pull registry updates
decantr status                                # Project health
```

---

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `@decantr/cli` | [![npm](https://img.shields.io/npm/v/@decantr/cli)](https://www.npmjs.com/package/@decantr/cli) | CLI for init, scaffold, mutations, and validation |
| `@decantr/mcp-server` | [![npm](https://img.shields.io/npm/v/@decantr/mcp-server)](https://www.npmjs.com/package/@decantr/mcp-server) | 15 MCP tools for AI coding assistants |
| `@decantr/essence-spec` | [![npm](https://img.shields.io/npm/v/@decantr/essence-spec)](https://www.npmjs.com/package/@decantr/essence-spec) | Schema, validator, guard rules, TypeScript types |
| `@decantr/registry` | [![npm](https://img.shields.io/npm/v/@decantr/registry)](https://www.npmjs.com/package/@decantr/registry) | Content resolver and API client |
| `@decantr/core` | [![npm](https://img.shields.io/npm/v/@decantr/core)](https://www.npmjs.com/package/@decantr/core) | Design Pipeline IR engine |
| `@decantr/css` | [![npm](https://img.shields.io/npm/v/@decantr/css)](https://www.npmjs.com/package/@decantr/css) | Framework-agnostic CSS atoms runtime |
| `@decantr/ui` | [![npm](https://img.shields.io/npm/v/@decantr/ui)](https://www.npmjs.com/package/@decantr/ui) | Signal-based UI framework |
| `@decantr/ui-chart` | [![npm](https://img.shields.io/npm/v/@decantr/ui-chart)](https://www.npmjs.com/package/@decantr/ui-chart) | Chart library (SVG, Canvas, WebGPU renderers) |
| `@decantr/vite-plugin` | [![npm](https://img.shields.io/npm/v/@decantr/vite-plugin)](https://www.npmjs.com/package/@decantr/vite-plugin) | Real-time design drift detection |

---

## Guard Rules

Seven rules in two tiers prevent design drift:

**DNA guards (errors):** style, density, accessibility, theme-mode compatibility
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
