# Registry Consumption Guide

How consumer code (workbench, docs, CLI) should consume registry data at runtime.

## Dev Server Route

All registry JSON is served at `/__decantr/registry/**` by the dev server. This route serves files from `src/registry/` without import rewriting.

```
/__decantr/registry/components.json
/__decantr/registry/tokens.json
/__decantr/registry/atoms.json
/__decantr/registry/foundations.json
/__decantr/registry/patterns/index.json
/__decantr/registry/patterns/hero.json
/__decantr/registry/archetypes/index.json
/__decantr/registry/archetypes/ecommerce.json
```

## Rules

1. **Always fetch from `/__decantr/registry/`** in dev mode. Never `import` registry JSON directly — the dev server handles serving and the build pipeline handles bundling.

2. **Use async loaders with signal-based state.** Each explorer module exports a `loadXxxItems()` async function. The app shell calls all loaders at startup and populates a signal:

```javascript
const [sidebarData, setSidebarData] = createSignal({});

async function loadAllItems() {
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([k, fn]) => [k, await fn()])
  );
  setSidebarData(Object.fromEntries(entries));
}
```

3. **Never hardcode lists that duplicate registry data.** Component groups, token lists, atom categories, pattern lists, archetype lists — all come from registry JSON. Render functions (code that builds DOM from data) stay in JS; data comes from registry.

4. **Fallback gracefully.** If a registry fetch fails, return an empty array. The UI shows nothing rather than stale data:

```javascript
export async function loadPatternItems() {
  try {
    const resp = await fetch('/__decantr/registry/patterns/index.json');
    const data = await resp.json();
    return Object.entries(data.patterns || {}).map(([id, meta]) => ({
      id, label: meta.name || id
    }));
  } catch { return []; }
}
```

## Registry Files

| File | Description | Consumer |
|------|-------------|----------|
| `components.json` | Component specs + `groups` for sidebar | components.js |
| `tokens.json` | Token groups with roles/suffixes/levels | tokens.js |
| `atoms.json` | Atom categories with prefix lists | atoms.js |
| `foundations.json` | Foundation subsections (core, state, router, forms) | foundations.js |
| `patterns/index.json` | Pattern manifest with file refs | patterns.js |
| `archetypes/index.json` | Archetype manifest with file refs | archetypes.js |
| `index.json` | Top-level manifest (modules, recipes section) | recipes.js |

## Generator Safety

`tools/registry.js` auto-generates component data from JSDoc annotations. It MUST preserve hand-authored keys:

- **`components.json`**: Preserves `groups`, per-component `showcase` keys
- **`index.json`**: Preserves `archetypes`, `patterns`, `recipes`, `atoms`, `tokens`, `foundations` sections

See the "Registry generator clobbering" anti-pattern in CLAUDE.md.

---

**See also:** `reference/decantation-process.md`, `reference/dev-server-routes.md`
