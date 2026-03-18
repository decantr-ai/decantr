# decantr

[![CI](https://github.com/decantr-ai/decantr/actions/workflows/ci.yml/badge.svg)](https://github.com/decantr-ai/decantr/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/decantr)](https://www.npmjs.com/package/decantr)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

AI-first web framework. Zero dependencies. Native JS/CSS/HTML. v0.9.6

Decantr is designed for LLMs to generate, read, and maintain — not for human readability. Every API is optimized for token efficiency: terse atomic CSS atoms, proxy-based tag functions, and a machine-readable registry so agents can look up props and exports without parsing source files.

## The Decantation Process

Every Decantr app begins as a conversation. The **Decantation Process** is a structured pipeline that turns a plain-English description into a production app — one layer at a time.

```
POUR  →  SETTLE  →  CLARIFY  →  DECANT  →  SERVE  →  AGE
 you      AI         AI+you      AI         AI        ongoing
describe  decomposes crystallizes resolves   generates  guards
intent    layers     the Essence  layout     code       against drift
```

---

### Stage 1: POUR

> *You describe what you want in plain English — the AI handles the rest.*

No config files, no boilerplate, no decisions about folder structure. Just say what you need.

```
"I need a SaaS analytics dashboard with authentication,
 real-time data feeds, and a dark command-center aesthetic."
```

---

### Stage 2: SETTLE

> *Your intent is decomposed into five independent layers.*

The AI breaks your description into five orthogonal layers, each independent and composable:

```
Terroir    → saas-dashboard        (what kind of app — sets default patterns and pages)
Vintage    → command-center / dark  (how it looks — visual style, color mode, shape)
Character  → tactical, data-dense   (personality — controls spacing, density, and tone)
Structure  → overview, settings     (pages — the views your app needs)
Tannins    → auth, realtime-data    (backend systems — auth, payments, telemetry, etc.)
```

---

### Stage 3: CLARIFY

> *Every decision is captured in one file. You review it before any code is generated.*

The AI writes `decantr.essence.json` — your project's single source of truth. This file captures every decision from SETTLE in a machine-readable format.

```json
{
  "terroir": "saas-dashboard",
  "vintage": { "style": "command-center", "mode": "dark", "shape": "sharp" },
  "character": ["tactical", "data-dense"],
  "structure": [
    { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"] },
    { "id": "settings", "skeleton": "sidebar-main", "blend": ["form-sections"] }
  ],
  "tannins": ["auth", "realtime-data"]
}
```

---

### Stage 4: DECANT

> *Each page's spatial layout is resolved — where content blocks sit, how columns stack and reflow.*

Each page's **Blend** is resolved — an ordered array of rows describing the layout. Full-width patterns, side-by-side columns, weighted grids, responsive breakpoints. This is the blueprint for how content fills the page.

```json
"blend": [
  "hero",
  { "cols": ["kpi-grid", "chart"], "span": { "kpi-grid": 2 }, "at": "lg" },
  "data-table"
]
```

This reads as: a full-width hero, then a weighted two-column row (KPIs take 2/3, chart takes 1/3, stacking below `lg`), then a full-width data table.

---

### Stage 5: SERVE

> *Code is generated directly from the layout spec. No freestyling.*

Each row in the Blend maps to concrete markup: grid wrappers, pattern components, Card shells, responsive atoms.

```javascript
export function Overview() {
  return div({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1 d-page-enter') },
    Hero(),
    div({ class: css('_grid _gc3 _lg:gc3 _gap6') },
      Card(Card.Header('KPIs'), Card.Body(KpiGrid())),    // span 2
      Card(Card.Header('Activity'), Card.Body(Chart()))    // span 1
    ),
    DataTable({ columns, data })
  );
}
```

---

### Stage 6: AGE

> *Every future change reads the Essence first. The Cork prevents drift.*

The **Cork** enforces consistency — a checklist that runs before any code is written:

- **Style** — Does this match the Vintage? Don't switch styles mid-project.
- **Structure** — Does this page exist in the Essence? If new, add it first.
- **Layout** — Does this follow the page's Blend? Don't freestyle arrangement.
- **Recipe** — Does this follow the active composition? Don't freestyle decoration.
- **Clarity** — Does spacing follow the Character-derived profile? Don't default to `_gap4` everywhere.

If a change conflicts with the Essence, the process flags it and asks before proceeding.

---

### Term Reference

| Term | What It Does |
|------|-------------|
| **Terroir** | App category — sets default patterns, pages, and layout for your domain |
| **Vintage** | Visual style + color mode + shape |
| **Character** | Personality traits that control spacing density and tone |
| **Tannins** | Pluggable backend systems (auth, telemetry, payments) |
| **Blend** | Page layout spec — rows, columns, and responsive breakpoints |
| **Clarity** | Spacing profile derived from Character — how dense or airy the UI feels |
| **Cork** | Anti-drift rules — ensures every change respects the Essence |
| **Bouquet** | Final visual harmony check after all layers compose |
| **Vessel** | App shell type (SPA/MPA/SSR) and routing strategy |
| **Essence** | `decantr.essence.json` — single source of truth for all project decisions |
| **Recipe** | Visual identity layer — background effects, materials, decorations |

## Quick Start

```bash
npx decantr init my-app
cd my-app
npm install
npx decantr dev
```

## Architecture

```
decantr/core        — h(), text(), cond(), list(), mount(), onMount, onDestroy, ErrorBoundary, Portal, Suspense, Transition
decantr/state       — createSignal, createEffect, createMemo, createStore, batch, createContext, createSelector, createDeferred, createHistory, createRoot, on
decantr/data        — createQuery, createInfiniteQuery, createMutation, queryClient, createEntityStore, createURLSignal, createWebSocket, createEventSource, createPersisted, createOfflineQueue
decantr/router      — createRouter, link, navigate, useRoute, useSearchParams (hash + history modes, nested routes, guards)
decantr/form        — createForm, validators, useFormField, fieldArray
decantr/css         — css(), define(), setStyle(), setMode(), setShape(), 1000+ atomic CSS utilities
decantr/tags        — Proxy-based tag functions (div, p, span...) — ~25% fewer tokens than h()
decantr/components  — 110+ UI components (form, display, layout, overlay, feedback, chart, typography)
decantr/chart       — Chart components (bar, line, area, pie, donut, sparkline)
decantr/plugins     — loadPlugins(), runHook() — build/dev/generate lifecycle hooks
decantr/i18n        — createI18n, locale management, RTL support
decantr/ssr         — renderToString, renderToStream, hydrate
decantr/tannins     — auth, auth-enterprise (OIDC/PKCE, RBAC), telemetry (Web Vitals, error capture)
decantr/test        — render, fire, flush + node:test re-exports
```

## Features

- **Zero dependencies** — Pure JavaScript, CSS, HTML
- **Signal-based reactivity** — Fine-grained DOM updates, no virtual DOM
- **Direct DOM rendering** — `h()` / `tags` create real elements, no diffing
- **110+ components** — Form, display, layout, overlay, feedback, chart, typography
- **Atomic CSS engine** — 1000+ `_`-prefixed utility atoms via `css()`
- **Style + Mode system** — 12 visual styles (1 core + 3 add-on + 8 community) x light/dark/auto modes, 170+ design tokens
- **Machine-readable registry** — JSON specs for 110+ components, 48 patterns, 9 archetypes, recipes
- **Tannins** — Pluggable functional systems: auth (token-based), auth-enterprise (OIDC/PKCE, RBAC), telemetry (Web Vitals)
- **Router** — Hash or History API, nested routes, guards, lazy loading
- **Form system** — Reactive forms with 10 built-in validators and field arrays
- **Build tooling** — Tree shaking, code splitting, source maps, CSS purging, incremental builds
- **Plugin system** — Build/dev/generate lifecycle hooks via `loadPlugins()` and `runHook()`
- **i18n + SSR** — Internationalization with RTL support, server-side rendering with streaming
- **Compiled LLM context** — Task-specific context profiles compiled from reference docs for token-efficient AI generation
- **Community content registry** — Search, install, publish, and manage community styles, patterns, and recipes

## Component Pattern

Every component is a function that returns an HTMLElement:

```javascript
import { tags } from 'decantr/tags';
import { text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';

const { div, button, span } = tags;

export function Counter({ initial = 0 } = {}) {
  const [count, setCount] = createSignal(initial);
  return div({ class: css('_flex _gap2 _p4 _aic') },
    button({ onclick: () => setCount(c => c - 1) }, '-'),
    span(text(() => String(count()))),
    button({ onclick: () => setCount(c => c + 1) }, '+')
  );
}
```

## CLI Commands

```bash
decantr init [name]           # Scaffold a new project (--template=<name> for starters)
decantr dev                   # Start dev server with hot reload + component HMR
decantr build                 # Production build (tree shake, code split, CSS purge)
decantr test [--watch]        # Run tests
decantr validate              # Validate decantr.essence.json
decantr lint                  # Code quality gates (atoms, essence drift, inline styles)
decantr a11y                  # Accessibility audit (8 WCAG rules)
decantr doctor                # Check project health and environment
decantr generate              # Generate code from essence (--force, --dry-run, --page)
decantr migrate               # Migrate essence between versions (--dry-run, --target)
decantr age                   # Full version upgrade (essence + config + AI-guided source)
decantr audit                 # Run ecosystem audit
decantr registry              # Community content (search, add, remove, update, list, publish)
decantr cellar                # Inventory sub-projects and check health (--fix, --link, --json)
decantr compile-context       # Compile LLM task profiles (--only=<profiles>, --watch)
decantr mcp                   # Start MCP server (stdio transport)
decantr figma:tokens          # Export design tokens in W3C DTCG / Figma format
decantr figma:sync            # Push tokens to Figma file via REST API
```

## MCP Server

Decantr ships a built-in [Model Context Protocol](https://modelcontextprotocol.io) server that exposes 16 tools (15 read-only + 1 write) for querying the component registry, resolving atomic CSS, generating pattern code, managing community content, and validating project essence files. The server runs locally via stdio — no data is collected, transmitted, or stored externally.

**Tools**: `lookup_component`, `lookup_pattern`, `lookup_archetype`, `lookup_skeleton`, `lookup_tokens`, `lookup_icon`, `resolve_atoms`, `get_component_signature`, `get_pattern_code`, `get_atom_reference`, `get_recipe_decorators`, `search_registry`, `search_content_registry`, `get_content_recommendations`, `validate_essence`, `install_from_registry`

### Start the server

```bash
npx decantr mcp
```

### Integration

**Claude Code** (`~/.claude.json`):
```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["decantr", "mcp"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["decantr", "mcp"]
    }
  }
}
```

**Generic MCP client** (stdio transport):
```json
{
  "command": "npx",
  "args": ["decantr", "mcp"],
  "transport": "stdio"
}
```

### Examples

**1. Look up a component**

Prompt: *"What props does the Button component accept?"*

Tool call: `lookup_component` with `{ "name": "Button" }`

Response:
```json
{
  "found": true,
  "name": "Button",
  "props": {
    "variant": { "type": "string", "values": ["solid", "outline", "ghost", "link", "destructive"], "default": "solid" },
    "size": { "type": "string", "values": ["xs", "sm", "md", "lg"], "default": "md" },
    "disabled": { "type": "boolean", "default": false },
    "loading": { "type": "boolean", "default": false }
  }
}
```

**2. Resolve atoms**

Prompt: *"What CSS does `_flex _col _gap4 _p4` produce?"*

Tool call: `resolve_atoms` with `{ "atoms": "_flex _col _gap4 _p4" }`

Response:
```json
{
  "total": 4,
  "valid": 4,
  "invalid": 0,
  "atoms": [
    { "atom": "_flex", "css": "display:flex", "valid": true },
    { "atom": "_col", "css": "flex-direction:column", "valid": true },
    { "atom": "_gap4", "css": "gap:var(--d-space-4)", "valid": true },
    { "atom": "_p4", "css": "padding:var(--d-space-4)", "valid": true }
  ]
}
```

**3. Search the registry**

Prompt: *"Find everything related to tables"*

Tool call: `search_registry` with `{ "query": "table" }`

Response:
```json
{
  "query": "table",
  "total": 5,
  "results": [
    { "type": "component", "name": "DataTable", "score": 80 },
    { "type": "pattern", "id": "data-table", "name": "Data Table", "score": 90 },
    { "type": "pattern", "id": "pricing-table", "name": "Pricing Table", "score": 80 },
    { "type": "component", "name": "Table", "score": 80 },
    { "type": "pattern", "id": "table-of-contents", "name": "Table of Contents", "score": 80 }
  ]
}
```

### Privacy

The MCP server runs locally via stdio. It reads only local registry JSON files shipped with the package. No data is collected, transmitted, or stored externally.

## Compiled LLM Context

Decantr compiles reference docs and registry JSON into task-specific context profiles optimized for token efficiency. Read the relevant profile before generating code:

| Task | Profile |
|------|---------|
| Create new project | `llm/task-init.md` |
| Add/modify a page | `llm/task-page.md` |
| Create/modify component | `llm/task-component.md` |
| Change styles/themes | `llm/task-style.md` |
| Debug issues | `llm/task-debug.md` |
| Refactor / fix drift | `llm/task-refactor.md` |

Regenerate profiles: `npx decantr compile-context` (or `--watch` for dev mode).

## Tannins

Tannins are pluggable functional backbone systems:

```javascript
import { createAuth, requireAuth } from 'decantr/tannins/auth';
import { createEnterpriseAuth, requireRoles } from 'decantr/tannins/auth-enterprise';
import { createTelemetry } from 'decantr/tannins/telemetry';
```

- **auth** — Token-based authentication with reactive signals, cross-tab sync, auto-refresh on 401, route guards
- **auth-enterprise** — OIDC/PKCE, RBAC, JWT inspection, session management (zero third-party dependencies)
- **telemetry** — Web Vitals collection, error capture, query/navigation timing, pluggable reporters

## Documentation

### Tutorial

A step-by-step guide from zero to deployed app:

1. [Install & Setup](docs/tutorial/01-install.md) — Prerequisites, scaffolding, project structure
2. [Your First Page](docs/tutorial/02-first-page.md) — Tag functions, atomic CSS, page pattern
3. [Components](docs/tutorial/03-components.md) — Button, Card, DataTable, and 110+ built-in components
4. [Styling](docs/tutorial/04-styling.md) — Atoms, styles, modes, design tokens, responsive prefixes
5. [State](docs/tutorial/05-state.md) — Signals, effects, memos, stores, conditional and list rendering
6. [Routing](docs/tutorial/06-routing.md) — Routes, guards, nested routes, lazy loading, navigation
7. [Data Fetching](docs/tutorial/07-data.md) — Queries, mutations, caching, WebSocket, URL-driven state
8. [Build & Deploy](docs/tutorial/08-deploy.md) — Production builds, static hosting, SPA routing config

### Cookbook

Standalone recipes for common features:

- [SaaS Dashboard](docs/cookbook/dashboard.md) — Sidebar layout, KPI cards, charts, data tables, real-time updates
- [Authentication](docs/cookbook/auth.md) — Login, registration, protected routes, token management
- [Internationalization](docs/cookbook/i18n.md) — Multi-language support, locale switcher, RTL layouts
- [Data Fetching Patterns](docs/cookbook/data-fetching.md) — Caching, optimistic updates, infinite scroll, offline support
- [Forms](docs/cookbook/forms.md) — Validation, field arrays, multi-step forms, transforms

## Requirements

- Node.js >= 20.0.0

## License

MIT
