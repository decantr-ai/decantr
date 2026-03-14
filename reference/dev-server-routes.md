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
| `from '@decantr/decantr/core'` | `from '/__decantr/core/index.js'` |
| `from '@decantr/decantr/state'` | `from '/__decantr/state/index.js'` |
| `from '@decantr/decantr/css'` | `from '/__decantr/css/index.js'` |
| `from '@decantr/decantr/components'` | `from '/__decantr/components/index.js'` |
| `from '@decantr/decantr/tags'` | `from '/__decantr/tags/index.js'` |
| `from '@decantr/decantr/router'` | `from '/__decantr/router/index.js'` |

Relative imports (`./`, `../`) are passed through unchanged.

## Static File Serving

- Serves files from the project's `public/` directory
- JS files get import rewriting applied
- SPA fallback: unmatched routes serve `public/index.html`

## File Watching

- Watches `src/` and `public/` for changes
- Broadcasts `data: reload` via SSE on any file change
- Accepts optional `options.watchDirs` array for watching additional directories (used by workbench)

---

**See also:** `reference/build-tooling.md`, `reference/registry-consumption.md`
