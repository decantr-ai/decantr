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

---

## Get Started

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

### Initialize a New Project

```bash
npx @decantr/cli init
```

This will:
- Walk you through selecting an archetype, theme, and configuration
- Generate `decantr.essence.json` (the design spec)
- Generate `DECANTR.md` (LLM instructions for your AI assistant)
- Create `.decantr/` directory with project state and context

---

## MCP Server Tools

The MCP server (`@decantr/mcp-server`) exposes design intelligence tools directly to AI coding assistants. These tools are called automatically by AI assistants when they need design guidance.

| Tool | Description |
|------|-------------|
| `decantr_create_essence` | Generate a valid Essence spec skeleton from a natural language project description. Matches your description to the closest archetype and blueprint to create a complete starting spec. |
| `decantr_suggest_patterns` | Given a page description (e.g., "dashboard with metrics and charts"), suggest appropriate patterns from the registry. Returns ranked pattern matches with layout specs and component lists. |
| `decantr_resolve_pattern` | Get full pattern details including layout spec, components, presets, and code examples. Use a preset parameter to get specific variants (e.g., "product", "content"). |
| `decantr_resolve_archetype` | Get archetype details including default pages, layouts, features, and suggested theme. Archetypes are app-level templates like "saas-dashboard" or "ecommerce". |
| `decantr_resolve_blueprint` | Get a blueprint (app composition) with its archetype list, suggested theme, personality traits, and full page structure. Blueprints combine multiple archetypes into complete apps. |
| `decantr_resolve_recipe` | Get recipe decoration rules including shell styles, spatial hints, visual effects, and pattern preferences. Recipes define the visual character of an app. |
| `decantr_check_drift` | Check if code changes violate the design intent captured in the Essence spec. Returns guard rule violations with severity and fix suggestions. |
| `decantr_validate` | Validate a `decantr.essence.json` file against the schema and guard rules. Returns errors and warnings. |
| `decantr_read_essence` | Read and return the current `decantr.essence.json` file from the working directory. |
| `decantr_search_registry` | Search the Decantr community content registry for patterns, archetypes, recipes, and themes. |

---

## CLI Commands

The Decantr CLI (`@decantr/cli`) provides commands for project initialization, registry queries, and validation.

### Project Commands

| Command | Description |
|---------|-------------|
| `npx @decantr/cli init` | Initialize a new Decantr project. Interactive prompts guide you through selecting an archetype, blueprint, theme, and configuration. Creates `decantr.essence.json`, `DECANTR.md`, and `.decantr/` directory. |
| `npx @decantr/cli status` | Show project status including essence validation, theme, guard mode, and sync status. |
| `npx @decantr/cli validate [path]` | Validate a `decantr.essence.json` file against the schema and guard rules. Defaults to `./decantr.essence.json`. |
| `npx @decantr/cli sync` | Sync the content registry from the API. Downloads latest patterns, archetypes, themes, and recipes to local cache. |
| `npx @decantr/cli audit` | Audit the project for issues. Checks for common problems and suggests fixes. |

### Registry Commands

| Command | Description |
|---------|-------------|
| `npx @decantr/cli search <query>` | Search the registry for patterns, archetypes, recipes, and themes. |
| `npx @decantr/cli suggest <query>` | Get pattern suggestions for a description. More targeted than search. |
| `npx @decantr/cli get <type> <id>` | Get full details for an item. Type: `pattern`, `archetype`, `recipe`, `theme`, `blueprint`. |
| `npx @decantr/cli list <type>` | List all items of a type. Type: `patterns`, `archetypes`, `recipes`, `themes`, `blueprints`. |

### Theme Commands

| Command | Description |
|---------|-------------|
| `decantr theme create <name>` | Create a new custom theme. Interactive prompts for colors, modes, and shape. |
| `decantr theme list` | List all themes including custom themes. |
| `decantr theme validate <name>` | Validate a custom theme against the schema. |
| `decantr theme delete <name>` | Delete a custom theme. |
| `decantr theme import <path>` | Import a theme from a JSON file. |

### Init Command Options

```bash
decantr init [options]

Options:
  --blueprint <id>    Use a specific blueprint
  --archetype <id>    Use a specific archetype
  --theme <id>        Use a specific theme
  --mode <mode>       Theme mode: light, dark, system
  --shape <shape>     Shape: rounded, sharp, pill
  --target <fw>       Target framework: react, vue, svelte, solid
  --guard <mode>      Guard mode: creative, guided, strict
  --density <level>   Density: compact, comfortable, spacious
  --shell <shell>     Default shell: sidebar-main, full-bleed, topbar-main
  --personality <p>   Comma-separated personality traits
  --features <f>      Comma-separated features
  --yes               Skip prompts, use defaults/flags
  --offline           Use bundled content only
  --existing          Overwrite existing essence file
  --registry <url>    Custom registry API URL
```

---

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `@decantr/essence-spec` | [![npm](https://img.shields.io/npm/v/@decantr/essence-spec)](https://www.npmjs.com/package/@decantr/essence-spec) | Essence schema, validator, guard rules, and TypeScript types |
| `@decantr/registry` | [![npm](https://img.shields.io/npm/v/@decantr/registry)](https://www.npmjs.com/package/@decantr/registry) | Content resolver, wiring rules, and pattern preset resolution |
| `@decantr/core` | [![npm](https://img.shields.io/npm/v/@decantr/core)](https://www.npmjs.com/package/@decantr/core) | Design Pipeline IR engine for AI-generated UI |
| `@decantr/mcp-server` | [![npm](https://img.shields.io/npm/v/@decantr/mcp-server)](https://www.npmjs.com/package/@decantr/mcp-server) | MCP server exposing design intelligence tools to AI coding assistants |
| `@decantr/css` | [![npm](https://img.shields.io/npm/v/@decantr/css)](https://www.npmjs.com/package/@decantr/css) | Framework-agnostic CSS atoms runtime for layout utilities |
| `@decantr/cli` | [![npm](https://img.shields.io/npm/v/@decantr/cli)](https://www.npmjs.com/package/@decantr/cli) | CLI for project initialization, registry queries, and validation |
| `@decantr/ui` | [![npm](https://img.shields.io/npm/v/@decantr/ui)](https://www.npmjs.com/package/@decantr/ui) | Signal-based UI framework with 100+ components |
| `@decantr/ui-chart` | [![npm](https://img.shields.io/npm/v/@decantr/ui-chart)](https://www.npmjs.com/package/@decantr/ui-chart) | Chart library with SVG, Canvas, WebGPU renderers |

### Package Scripts

Each package supports the following scripts:

```bash
pnpm build        # Build the package
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
```

---

## Content Registry

The `content/` directory contains the community registry of reusable design building blocks.

### Patterns (87)

Composable UI sections with layout specs, components, and presets.

| Category | Examples |
|----------|----------|
| **Dashboard** | `kpi-grid`, `chart-grid`, `data-table`, `stats-bar`, `metric-gauge` |
| **Navigation** | `filter-bar`, `page-tree`, `tree-view`, `command-palette` |
| **Content** | `hero`, `hero-split`, `cta-section`, `cta-banner`, `content-feed`, `post-list` |
| **Forms** | `form-sections`, `auth-form`, `checkout-flow`, `account-settings` |
| **Communication** | `chat-thread`, `chat-message`, `chat-input`, `comment-thread`, `activity-feed` |
| **E-commerce** | `product-card`, `product-grid`, `pricing-usage`, `tier-card`, `tier-builder` |
| **Real Estate** | `property-card`, `property-grid`, `property-detail`, `tenant-card`, `rent-roll` |
| **Developer** | `terminal-emulator`, `log-stream`, `diff-view`, `doc-editor`, `split-pane` |
| **Collaboration** | `presence-avatars`, `remote-cursor`, `share-modal`, `version-history` |

### Archetypes (53)

App-level templates defining pages, features, and suggested themes.

| Category | Examples |
|----------|----------|
| **SaaS** | `saas-dashboard`, `dashboard-core`, `settings`, `settings-full`, `billing`, `notifications` |
| **E-commerce** | `ecommerce`, `ecommerce-admin`, `fan-storefront`, `fan-checkout`, `fan-library` |
| **Content** | `content-site`, `portfolio`, `recipe-community`, `legal` |
| **Finance** | `financial-dashboard`, `pnl-dashboard`, `metrics-monitor` |
| **Creator** | `creator-dashboard`, `creator-content`, `creator-earnings`, `creator-subscribers`, `creator-tiers` |
| **Cloud** | `cloud-platform`, `cloud-infrastructure`, `cloud-marketing` |
| **Gaming** | `gaming-platform`, `gaming-community`, `game-catalog` |
| **Real Estate** | `property-manager`, `owner-dashboard`, `tenant-manager`, `tenant-portal`, `tenant-payments` |
| **Developer** | `workbench`, `terminal-home`, `config-editor`, `log-viewer` |
| **Collaboration** | `workspace-home`, `workspace-settings`, `document-editor` |
| **Marketing** | `marketing-landing`, `marketing-saas`, `marketing-creator`, `marketing-devtool`, `marketing-productivity` |
| **Auth** | `auth-flow`, `auth-full` |

### Blueprints (16)

Complete app compositions combining multiple archetypes.

- `saas-dashboard` -- Full SaaS application with dashboard, settings, and billing
- `ecommerce` -- Complete e-commerce storefront with checkout
- `ecommerce-admin` -- E-commerce admin panel with inventory and orders
- `financial-dashboard` -- Financial analytics with charts and reporting
- `cloud-platform` -- Cloud platform with infrastructure management
- `gaming-platform` -- Gaming platform with community features
- `portfolio` -- Personal portfolio site
- `content-site` -- Content-focused website
- `workbench` -- Developer workspace application
- `terminal-dashboard` -- Terminal-style dashboard
- `creator-monetization-platform` -- Creator platform with subscriptions and payments
- `property-management-portal` -- Real estate management system
- `realtime-collaboration-workspace` -- Collaborative workspace with presence
- `recipe-community` -- Recipe sharing community
- `product-landing` -- Product landing page
- `carbon-ai-portal` -- AI-powered portal

### Recipes (11)

Visual decoration rules defining shell styles, spatial hints, and effects.

| Recipe | Description |
|--------|-------------|
| `auradecantism` | Signature Decantr style with glowing accents and depth |
| `luminarum` | Light, ethereal design with soft shadows |
| `glassmorphism` | Frosted glass effects with transparency |
| `carbon` | Dark, minimal design with carbon textures |
| `clean` | Minimal, whitespace-focused design |
| `paper` | Paper-like textures with subtle shadows |
| `estate` | Professional real estate aesthetic |
| `gaming-guild` | Gaming-inspired with bold colors |
| `launchpad` | Startup/launch page aesthetic |
| `studio` | Creative studio design language |
| `terminal` | Terminal/CLI inspired dark theme |

### Themes (17)

Style definitions for color, mode, and shape.

| Theme | Description |
|-------|-------------|
| `auradecantism` | Default Decantr theme with purple/blue gradients |
| `luminarum` | Bright, luminous color palette |
| `glassmorphism` | Glass-effect optimized colors |
| `carbon` | Dark carbon-inspired palette |
| `clean` | Neutral, professional colors |
| `paper` | Warm paper-like tones |
| `estate` | Professional real estate palette |
| `gaming-guild` | Bold gaming colors |
| `launchpad` | Energetic startup palette |
| `studio` | Creative studio colors |
| `terminal` | Terminal green on black |
| `bioluminescent` | Glowing organic colors |
| `dopamine` | High-energy vibrant palette |
| `editorial` | Publishing-inspired typography focus |
| `liquid-glass` | Fluid glass effects |
| `prismatic` | Rainbow spectrum effects |
| `retro` | Retro computing aesthetic |

---

## Guard Rules

The guard system enforces design consistency by validating code against the Essence spec.

| Rule | Mode | Severity | Description |
|------|------|----------|-------------|
| **Style Guard** | guided, strict | error | Code must use the theme specified in the Essence |
| **Structure Guard** | guided, strict | error | Pages in code must exist in the Essence structure |
| **Layout Guard** | strict | error | Pattern order must match the Essence layout spec |
| **Recipe Guard** | guided, strict | error | Visual recipe must match the Essence recipe |
| **Density Guard** | strict | warning | Content gaps must match the Essence density setting |
| **Accessibility Guard** | guided, strict | error | Code must meet the WCAG level in the Essence |

### Guard Modes

- **creative** -- No enforcement. Full freedom for experimentation.
- **guided** -- Core rules enforced (style, structure, recipe, accessibility).
- **strict** -- All rules enforced including layout and density.

---

## Development

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Commands

```bash
pnpm install        # Install all dependencies
pnpm build          # Build all packages (dependency-aware order)
pnpm test           # Run all tests via vitest
pnpm lint           # Type-check with tsc --noEmit
pnpm clean          # Remove all dist/ directories
pnpm mcp            # Run the MCP server locally
```

### Package Build Order

Packages are built in dependency order:

1. `@decantr/essence-spec` and `@decantr/registry` (no internal dependencies)
2. `@decantr/core`, `@decantr/mcp-server`, and `@decantr/cli` (depend on above)

---

## Project Files

When you run `decantr init`, these files are created:

| File | Purpose |
|------|---------|
| `decantr.essence.json` | The machine-readable design spec. Your AI reads this to understand what to build. |
| `DECANTR.md` | LLM instructions. Share this with your AI assistant for context. |
| `src/styles/tokens.css` | Theme tokens (CSS variables for colors, spacing, radii). |
| `src/styles/decorators.css` | Recipe decorator classes generated from the selected recipe. |
| `.decantr/project.json` | Project state including sync timestamps and registry source. |
| `.decantr/context/` | Task-specific guides for different workflows. |
| `.decantr/cache/` | Local cache of registry content (gitignored). |

---

## Documentation

| File | Purpose |
|------|---------|
| `docs/css-scaffolding-guide.md` | Full CSS implementation spec (@layer structure, theme scoping, variable naming) |
| `docs/plans/` | Implementation plans for major features |
| `docs/specs/` | Technical specifications |

---

## License

MIT
