# decantr

AI-first web framework. Zero dependencies. Native JS/CSS/HTML.

Decantr is designed for LLMs to generate, read, and maintain — not for human readability. Every project follows predictable patterns with machine-readable manifests so AI agents can understand and modify code without parsing source files.

## Quick Start

```bash
npx decantr init
npm install
npx decantr dev
```

## Features

- **Zero dependencies** — Pure JavaScript, CSS, HTML
- **Signal-based reactivity** — Fine-grained DOM updates, no virtual DOM
- **Direct DOM rendering** — `h()` creates real elements, no diffing overhead
- **Atomic CSS** — Terse, auto-generated utility classes (`p4`, `bg1`, `flex`)
- **Dual router** — Hash or History API, user chooses at init
- **Built-in test runner** — Wraps `node:test` with DOM testing helpers
- **AI manifests** — `.decantr/` directory with JSON schemas for LLM consumption
- **< 2KB gzipped** — Hello world JS runtime under 2KB gzipped

## Architecture

```
decantr/core    — h(), text(), cond(), list(), mount()
decantr/state   — createSignal, createEffect, createMemo, createStore, batch
decantr/router  — createRouter, link, navigate, useRoute
decantr/css     — css(), define()
decantr/test    — render, fire, flush + node:test re-exports
```

## CLI Commands

```bash
decantr init          # Scaffold a new project
decantr dev           # Start dev server with hot reload
decantr build         # Production build
decantr test          # Run tests
decantr test --watch  # Run tests in watch mode
```

## Component Pattern

Every component is a function that returns an HTMLElement:

```javascript
import { h, text } from 'decantr/core';
import { createSignal } from 'decantr/state';

export function Counter({ initial = 0 } = {}) {
  const [count, setCount] = createSignal(initial);
  return h('div', { class: 'flex gap2 p4' },
    h('button', { onclick: () => setCount(c => c - 1) }, '-'),
    h('span', null, text(() => String(count()))),
    h('button', { onclick: () => setCount(c => c + 1) }, '+')
  );
}
```

## Requirements

- Node.js >= 22.0.0

## License

MIT
