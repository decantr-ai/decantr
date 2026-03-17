# Plugin System

Decantr's plugin system lets you extend the framework without forking. Plugins can register custom styles, patterns, and recipes, and hook into the build, dev, and generate lifecycle.

Zero third-party dependencies. The Decantr Way.

## Configuration

Declare plugins in `decantr.config.json`:

```json
{
  "plugins": [
    "@acme/decantr-plugin-auth",
    ["./plugins/custom-style.js", { "theme": "corporate" }]
  ]
}
```

Each entry is either:

- **A string** — a bare npm module specifier or a relative/absolute file path.
- **A tuple** `[specifier, options]` — the same specifier, plus an options object passed to the plugin function.

Plugins load in declaration order. Relative paths resolve from the project root (where `decantr.config.json` lives).

## Authoring a Plugin

A plugin is a module that default-exports a setup function:

```js
// plugins/corporate-style.js
export default function(api, options) {
  api.registerStyle('corporate', {
    name: 'Corporate',
    seed: {
      primary: options.primaryColor || '#003366',
      neutral: '#2c3e50',
      accent: '#e67e22',
    },
    personality: { contrast: 0.9, saturation: 0.3 },
  });

  api.onBuild((context) => {
    console.log(`Building in ${context.cwd}`);
  });
}
```

The function receives two arguments:

| Argument  | Type   | Description                                                |
|-----------|--------|------------------------------------------------------------|
| `api`     | object | Plugin API with registration methods and lifecycle hooks   |
| `options` | object | The options object from the config tuple (empty `{}` if none) |

The setup function may be async (return a Promise).

## Plugin API

### Lifecycle Hooks

Register callbacks that run before their respective CLI commands.

#### `api.onBuild(fn)`

Called before the production build starts.

```js
api.onBuild(async (context) => {
  // context.cwd — project working directory
  // context.command — "build"
});
```

#### `api.onDev(fn)`

Called before the dev server starts.

```js
api.onDev((context) => {
  console.log('Starting dev with plugins...');
});
```

#### `api.onGenerate(fn)`

Called before code generation runs.

```js
api.onGenerate((context) => {
  // Inject extra patterns before generation
});
```

### Registration Methods

#### `api.registerStyle(id, definition)`

Register a custom style (theme) that becomes available via `setStyle(id)`.

```js
api.registerStyle('brutalist', {
  name: 'Brutalist',
  seed: {
    primary: '#000000',
    neutral: '#1a1a1a',
    accent: '#ff0000',
  },
  personality: {
    contrast: 1.0,
    saturation: 0.0,
    radius: 0,
  },
  overrides: {},
});
```

The definition must include a `seed` object with color values. See `reference/style-system.md` for the full seed and personality schema.

#### `api.registerPattern(id, definition)`

Register a custom experience pattern that can be referenced in Essence blends.

```js
api.registerPattern('ticket-board', {
  name: 'Ticket Board',
  description: 'Kanban-style board with draggable columns',
  blend: {
    atoms: '_grid _gc3 _gap4',
  },
});
```

#### `api.registerRecipe(id, definition)`

Register a custom recipe (visual language overlay).

```js
api.registerRecipe('neon', {
  name: 'Neon',
  style: 'glassmorphism',
  mode: 'dark',
  description: 'Neon-lit visual language with glow effects.',
  decorators: {
    'neon-glow': 'Neon glow shadow on interactive elements.',
    'neon-border': 'Bright animated border.',
  },
  compositions: {},
});
```

## Programmatic Access

Import from `decantr/plugins`:

```js
import {
  loadPlugins,
  runHook,
  getPluginStyles,
  getPluginPatterns,
  getPluginRecipes,
  getLoadedPlugins,
  resetPlugins,
} from 'decantr/plugins';
```

| Export              | Description                                        |
|---------------------|----------------------------------------------------|
| `loadPlugins(config, opts?)` | Load plugins from `config.plugins` array  |
| `runHook(name, context?)`    | Run a hook across all loaded plugins      |
| `getPluginStyles()`          | Get all plugin-registered styles (Map)    |
| `getPluginPatterns()`        | Get all plugin-registered patterns (Map)  |
| `getPluginRecipes()`         | Get all plugin-registered recipes (Map)   |
| `getLoadedPlugins()`         | Get list of loaded plugin names           |
| `resetPlugins()`             | Clear all plugin state (for testing)      |

## Example: Full Plugin

```js
// @acme/decantr-plugin-dashboard
export default function(api, options) {
  // Register a corporate style
  api.registerStyle('corporate', {
    name: 'Corporate',
    seed: {
      primary: options.primary || '#1e40af',
      neutral: '#374151',
      accent: '#f59e0b',
    },
    personality: { contrast: 0.85, saturation: 0.4 },
  });

  // Register custom patterns
  api.registerPattern('executive-summary', {
    name: 'Executive Summary',
    description: 'C-suite overview with key metrics and trend charts',
    blend: { atoms: '_grid _gc2 _gap6' },
  });

  api.registerPattern('compliance-checklist', {
    name: 'Compliance Checklist',
    description: 'Regulatory compliance tracking with status indicators',
    blend: { atoms: '_flex _col _gap3' },
  });

  // Hook into build
  api.onBuild(async (context) => {
    console.log('[corporate] Validating brand guidelines...');
  });
}
```

Use it in `decantr.config.json`:

```json
{
  "plugins": [
    ["@acme/decantr-plugin-dashboard", { "primary": "#0f4c81" }]
  ]
}
```

Then reference the registered style and patterns in your Essence:

```json
{
  "vintage": { "style": "corporate", "mode": "light" },
  "structure": [
    {
      "id": "overview",
      "skeleton": "sidebar-main",
      "blend": ["executive-summary", "compliance-checklist"]
    }
  ]
}
```

## Hook Execution Order

1. Plugins load in the order declared in `config.plugins`.
2. Within each plugin, hooks run in the order they were registered.
3. All hooks for a given lifecycle event run before the corresponding CLI command executes.
4. Registration methods (`registerStyle`, `registerPattern`, `registerRecipe`) take effect immediately when called during plugin setup.

## Error Handling

- If a plugin module cannot be resolved or imported, a warning is printed and the remaining plugins continue loading.
- If a plugin setup function throws, the error is logged and the plugin is skipped.
- If a hook handler throws during `runHook`, the error is logged and the remaining handlers continue.
- Invalid plugin entries (wrong type, missing specifier) are warned and skipped.
