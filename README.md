# decantr

[![CI](https://github.com/decantr-ai/decantr/actions/workflows/ci.yml/badge.svg)](https://github.com/decantr-ai/decantr/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/decantr)](https://www.npmjs.com/package/decantr)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

AI-first web framework. Zero dependencies. Native JS/CSS/HTML. v0.9.2

Decantr is designed for LLMs to generate, read, and maintain — not for human readability. Every API is optimized for token efficiency: terse atomic CSS atoms, proxy-based tag functions, and a machine-readable registry so agents can look up props and exports without parsing source files.

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
- **Router** — Hash or History API, nested routes, guards, lazy loading
- **Form system** — Reactive forms with 10 built-in validators and field arrays
- **Build tooling** — Tree shaking, code splitting, source maps, CSS purging, incremental builds
- **Plugin system** — Build/dev/generate lifecycle hooks via `loadPlugins()` and `runHook()`
- **i18n + SSR** — Internationalization with RTL support, server-side rendering with streaming

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
decantr init [name]       # Scaffold a new project
decantr dev               # Start dev server with hot reload
decantr build             # Production build
decantr test              # Run tests
decantr test --watch      # Watch mode
decantr validate          # Validate decantr.essence.json
decantr lint              # Code quality gates
decantr a11y              # Accessibility audit
decantr doctor            # Check project health
decantr generate          # Generate code from essence
decantr migrate           # Migrate essence between versions
decantr audit             # Run ecosystem audit
decantr mcp               # Start MCP server
decantr figma-tokens      # Import Figma design tokens
decantr figma-sync        # Sync with Figma
```

## MCP Server

Decantr ships a built-in [Model Context Protocol](https://modelcontextprotocol.io) server that exposes 9 read-only tools for querying the component registry, resolving atomic CSS classes, validating project essence files, and searching across the full design system. The server runs locally via stdio — no data is collected, transmitted, or stored externally.

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
