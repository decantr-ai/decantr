# Dev Server Routes

The dev server (`tools/dev-server.js`) serves the development environment with HMR and import rewriting.

## Special Routes

### `GET /__decantr_hmr`

Server-Sent Events stream for hot module reload.

- Sends `data: reload` when files change
- Client connects via `new EventSource('/__decantr_hmr')`

### `GET /__decantr/essence`

Serves the project's `decantr.essence.json` file from the project root. Returns the project's Decantation Process essence as JSON data.

- No import rewriting applied
- Triggers HMR reload when the essence file changes on disk

### `GET /__decantr/registry/**`

Serves registry JSON files from `src/registry/` without import rewriting. These are data files consumed by the workbench and other tools at runtime.

- `/__decantr/registry/components.json` → `src/registry/components.json`
- `/__decantr/registry/patterns/index.json` → `src/registry/patterns/index.json`
- `/__decantr/registry/archetypes/ecommerce.json` → `src/registry/archetypes/ecommerce.json`
- `/__decantr/registry/atoms.json` → `src/registry/atoms.json`
- `/__decantr/registry/tokens.json` → `src/registry/tokens.json`

No import rewriting is applied — files are served as-is with `application/json` MIME type.

### `GET /__decantr/{module}/**`

Serves framework source files for browser import. Handles:

- `/__decantr/core/index.js` → `src/core/index.js`
- `/__decantr/components/index.js` → `src/components/index.js`

All JS files served through this route get import rewriting applied.

## Import Rewriting

The server rewrites bare module specifiers in JS files to browser-compatible paths:

| Source Import | Rewritten To |
|--------------|-------------|
| `from 'decantr/core'` | `from '/__decantr/core/index.js'` |
| `from 'decantr/state'` | `from '/__decantr/state/index.js'` |
| `from 'decantr/css'` | `from '/__decantr/css/index.js'` |
| `from 'decantr/components'` | `from '/__decantr/components/index.js'` |
| `from 'decantr/tags'` | `from '/__decantr/tags/index.js'` |
| `from 'decantr/router'` | `from '/__decantr/router/index.js'` |

Relative imports (`./`, `../`) are passed through unchanged.

## Static File Serving

- Serves files from the project's `public/` directory
- JS files get import rewriting applied
- SPA fallback: unmatched routes serve `public/index.html`

## File Watching

- Watches `src/` and `public/` for changes
- Accepts optional `options.watchDirs` array for watching additional directories (used by workbench)

### Component-Level HMR

The file watcher classifies each change to decide between a component-level HMR update and a full page reload:

| File Path Pattern | Message Type | Behavior |
|---|---|---|
| `src/pages/*.js` | `hmr` | Re-imports and remounts the page component |
| `src/components/*.js` | `hmr` | Re-imports and remounts the component |
| `src/state/`, `src/css/`, `src/router/`, `src/app.js` | `reload` | Full page reload (infrastructure change) |
| `decantr.essence.json` | `reload` | Full page reload (project DNA change) |
| All other `src/` files | `reload` | Full page reload (safe default) |

**How it works:**

1. The SSE endpoint sends `{ "type": "hmr", "module": "/src/pages/home.js" }` for component files.
2. The HMR client script (injected into `index.html`) intercepts the message and re-imports the module with a cache-busting `?t=` query parameter.
3. `window.__d_hmr_remount(modulePath, newModule)` (registered by `src/core/index.js` in dev mode) unmounts and remounts the component.
4. If no remount hook is available, the client falls back to a full page reload.

**State preservation:** Module-level signals (defined in `src/state/` files) are not re-executed during HMR because only the changed component module is re-imported. Component-local signals are re-created, which is the expected behavior.

**Registration:** Pages and components can register their mount root via `globalThis.__d_hmr_register(modulePath, rootElement)` to enable targeted remounting. Without registration, HMR falls back to remounting the `#app` root.

---

**See also:** `reference/build-tooling.md`, `reference/registry-consumption.md`
