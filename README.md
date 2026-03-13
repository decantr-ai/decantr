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

## Requirements

- Node.js >= 22.0.0

## License

MIT
