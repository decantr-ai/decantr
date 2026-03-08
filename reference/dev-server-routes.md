# Dev Server Routes

The dev server (`tools/dev-server.js`) serves the development environment with HMR and import rewriting.

## Special Routes

### `GET /__decantr_hmr`

Server-Sent Events stream for hot module reload.

- Sends `data: reload` when files change
- Client connects via `new EventSource('/__decantr_hmr')`

### `GET /__decantr/{module}/**`

Serves framework source files for browser import. Handles:

- `/__decantr/core/index.js` → `src/core/index.js`
- `/__decantr/components/index.js` → `src/components/index.js`
- `/__decantr/kit/dashboard/index.js` → `src/kit/dashboard/index.js`

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
| `from 'decantr/kit/dashboard'` | `from '/__decantr/kit/dashboard/index.js'` |
| `from 'decantr/kit/auth'` | `from '/__decantr/kit/auth/index.js'` |
| `from 'decantr/kit/content'` | `from '/__decantr/kit/content/index.js'` |

Relative imports (`./`, `../`) are passed through unchanged.

## Static File Serving

- Serves files from the project's `public/` directory
- JS files get import rewriting applied
- SPA fallback: unmatched routes serve `public/index.html`

## File Watching

- Watches `src/` and `public/` for changes
- Broadcasts `data: reload` via SSE on any file change
- Accepts optional `options.watchDirs` array for watching additional directories (used by workbench)
