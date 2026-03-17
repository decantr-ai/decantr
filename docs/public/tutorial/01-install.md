# 01 — Installation & Project Setup

Get a Decantr project running in under a minute.

## Prerequisites

- **Node.js 20+** — Decantr uses modern JavaScript features that require Node 20 or later. Check your version with `node -v`.

## Scaffold a New Project

```bash
npx decantr init my-app
cd my-app
npm install
```

This creates a minimal project with a centered welcome page. You do not get a full layout out of the box — skeletons and multi-page structures are generated later with the Decantation Process.

## Start the Dev Server

```bash
npx decantr dev
```

Open `http://localhost:3000` in your browser. The dev server supports hot reload — changes to any file are reflected instantly.

## Project Structure

```
my-app/
├── public/
│   └── index.html          # HTML shell — mounts your app to #app
├── src/
│   ├── app.js              # Entry point — creates router, mounts to DOM
│   ├── pages/              # Route page components (one file per page)
│   └── components/         # Your own reusable components
├── decantr.config.json     # Build config (dev server port, size budgets, plugins)
├── decantr.essence.json    # Project DNA — generated during the Decantation Process
├── package.json
└── AGENTS.md               # Framework translation layer for AI agents
```

### Key Files

**`public/index.html`** — The HTML shell. Contains a `<div id="app"></div>` where your application mounts. Theme CSS variables are injected here.

**`src/app.js`** — The entry point. This file creates a router, defines routes, and mounts the root component:

```js
import { mount } from 'decantr/core';
import { createRouter } from 'decantr/router';
import { setStyle, setMode } from 'decantr/css';

// Set visual style and color mode
setStyle('auradecantism');
setMode('dark');

// Define routes
const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/home.js') },
  ]
});

// Mount the app
mount(document.getElementById('app'), () => router.outlet());
```

**`decantr.config.json`** — Build and dev server configuration:

```json
{
  "build": {
    "sizeBudget": {
      "jsRaw": 102400,
      "jsBrotli": 25600,
      "cssRaw": 51200,
      "totalBrotli": 51200
    }
  }
}
```

**`decantr.essence.json`** — Your project's DNA. Created during the Decantation Process, it locks down the style, structure, and layout of every page. Do not edit it manually — let the CLI or AI generate it.

## CLI Commands

| Command | Description |
|---------|-------------|
| `npx decantr init [name]` | Scaffold a new project |
| `npx decantr dev` | Start dev server with hot reload |
| `npx decantr build` | Production build to `dist/` |
| `npx decantr test` | Run tests |
| `npx decantr test --watch` | Run tests in watch mode |
| `npx decantr validate` | Validate your `decantr.essence.json` |
| `npx decantr lint` | Check atoms, essence drift, inline styles |

## What's Next

In the next section, you will create your first page using Decantr's tag functions and atomic CSS.

---

Next: [02 — Your First Page](./02-first-page.md)
