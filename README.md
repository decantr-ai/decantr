# decantr

AI-first web framework. Zero dependencies. Native JS/CSS/HTML. v0.4.0

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
decantr/state       — createSignal, createEffect, createMemo, createStore, batch, createResource, createContext, createHistory
decantr/router      — createRouter, link, navigate, useRoute, useSearchParams (hash + history modes, nested routes, guards)
decantr/form        — createForm, validators, useFormField, fieldArray
decantr/css         — css(), define(), setStyle(), setMode(), setShape(), 1000+ atomic CSS utilities
decantr/tags        — Proxy-based tag functions (div, p, span...) — ~25% fewer tokens than h()
decantr/components  — 100+ UI components (form, display, layout, overlay, feedback, chart, typography)
decantr/test        — render, fire, flush + node:test re-exports
```

## Features

- **Zero dependencies** — Pure JavaScript, CSS, HTML
- **Signal-based reactivity** — Fine-grained DOM updates, no virtual DOM
- **Direct DOM rendering** — `h()` / `tags` create real elements, no diffing
- **100+ components** — Form, display, layout, overlay, feedback, chart, typography
- **Atomic CSS engine** — 1000+ `_`-prefixed utility atoms via `css()`
- **Style + Mode system** — 5 visual styles x light/dark/auto modes, 170+ design tokens
- **Machine-readable registry** — JSON specs for components, patterns, archetypes, recipes
- **Router** — Hash or History API, nested routes, guards, lazy loading
- **Form system** — Reactive forms with 10 built-in validators and field arrays
- **Build tooling** — Tree shaking, code splitting, source maps, CSS purging, incremental builds

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

## Requirements

- Node.js >= 20.0.0

## License

MIT
